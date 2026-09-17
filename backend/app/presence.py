"""Live visitor presence tracking.

Two real metrics, derived only from client heartbeats. No personal data is
stored — only an opaque, client-generated visitor id:

- active visitors: distinct ids seen within ACTIVE_WINDOW_SECONDS.
- total visitors: cumulative page visits. The frontend marks the first
  heartbeat of each page load as a new visit, so every visit adds exactly
  one — repeat heartbeats from the same page never inflate it.
- unique visitors: cumulative distinct ids ever seen.

Storage strategy:
- Redis when reachable, so the numbers stay correct across multiple
  uvicorn workers (production runs --workers 4) and survive restarts.
- Transparent in-memory fallback (per-process, resets on restart) when
  Redis is down, so a cache outage degrades the numbers instead of
  breaking the endpoint.

A visitor counts as active while its last heartbeat is within
ACTIVE_WINDOW_SECONDS. The frontend heartbeats well inside that window,
so a closed tab ages out on its own — no explicit disconnect needed.
"""

import logging
import threading
import time
from dataclasses import dataclass

logger = logging.getLogger(__name__)

ACTIVE_WINDOW_SECONDS = 90
REDIS_ACTIVE_KEY = "presence:active-visitors"
REDIS_TOTAL_KEY = "presence:total-visits"
REDIS_UNIQUE_KEY = "presence:unique-visitors"

_memory_seen: dict[str, float] = {}
_memory_total = 0
_memory_unique: set[str] = set()
_memory_lock = threading.Lock()


@dataclass
class PresenceCounts:
    active_visitors: int
    total_visitors: int
    unique_visitors: int


async def _redis_heartbeat(visitor_id: str, is_new_visit: bool, now: float) -> PresenceCounts | None:
    """Record via Redis. Returns None when Redis is unreachable."""
    try:
        from .cache import get_redis

        r = await get_redis()
        await r.zadd(REDIS_ACTIVE_KEY, {visitor_id: now})
        await r.zremrangebyscore(REDIS_ACTIVE_KEY, 0, now - ACTIVE_WINDOW_SECONDS)
        if is_new_visit:
            await r.incr(REDIS_TOTAL_KEY)
            await r.sadd(REDIS_UNIQUE_KEY, visitor_id)
        active = await r.zcard(REDIS_ACTIVE_KEY)
        total = await r.get(REDIS_TOTAL_KEY)
        unique = await r.scard(REDIS_UNIQUE_KEY)
        await r.expire(REDIS_ACTIVE_KEY, ACTIVE_WINDOW_SECONDS * 2)
        return PresenceCounts(
            active_visitors=int(active),
            total_visitors=int(total or 0),
            unique_visitors=int(unique),
        )
    except Exception as e:
        logger.warning("Presence Redis unavailable, using memory fallback: %s", e)
        return None


async def _redis_counts(now: float) -> PresenceCounts | None:
    """Read current numbers via Redis without recording. None if unreachable."""
    try:
        from .cache import get_redis

        r = await get_redis()
        await r.zremrangebyscore(REDIS_ACTIVE_KEY, 0, now - ACTIVE_WINDOW_SECONDS)
        active = await r.zcard(REDIS_ACTIVE_KEY)
        total = await r.get(REDIS_TOTAL_KEY)
        unique = await r.scard(REDIS_UNIQUE_KEY)
        return PresenceCounts(
            active_visitors=int(active),
            total_visitors=int(total or 0),
            unique_visitors=int(unique),
        )
    except Exception as e:
        logger.warning("Presence Redis unavailable, using memory fallback: %s", e)
        return None


def _memory_heartbeat(visitor_id: str, is_new_visit: bool, now: float) -> PresenceCounts:
    """Record in this process only. Always available."""
    global _memory_total
    with _memory_lock:
        _memory_seen[visitor_id] = now
        if is_new_visit:
            _memory_total += 1
            _memory_unique.add(visitor_id)
        cutoff = now - ACTIVE_WINDOW_SECONDS
        for key in [k for k, seen in _memory_seen.items() if seen <= cutoff]:
            del _memory_seen[key]
        return PresenceCounts(
            active_visitors=len(_memory_seen),
            total_visitors=_memory_total,
            unique_visitors=len(_memory_unique),
        )


def _memory_counts(now: float) -> PresenceCounts:
    """Read current numbers in this process only."""
    with _memory_lock:
        cutoff = now - ACTIVE_WINDOW_SECONDS
        for key in [k for k, seen in _memory_seen.items() if seen <= cutoff]:
            del _memory_seen[key]
        return PresenceCounts(
            active_visitors=len(_memory_seen),
            total_visitors=_memory_total,
            unique_visitors=len(_memory_unique),
        )


async def record_heartbeat(visitor_id: str, is_new_visit: bool = False) -> PresenceCounts:
    """Record a visitor heartbeat. Returns the current counts."""
    now = time.time()
    counts = await _redis_heartbeat(visitor_id, is_new_visit, now)
    if counts is not None:
        return counts
    return _memory_heartbeat(visitor_id, is_new_visit, now)


async def get_counts() -> PresenceCounts:
    """Return the current counts without recording anything."""
    now = time.time()
    counts = await _redis_counts(now)
    if counts is not None:
        return counts
    return _memory_counts(now)


# Backwards-compatible helpers returning just the active count.
async def get_active_count() -> int:
    return (await get_counts()).active_visitors
