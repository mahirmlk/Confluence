"""Per-user rate limiter using Redis sliding window."""
import hashlib
import logging
import os
import time
from typing import Optional
from fastapi import Request, HTTPException

logger = logging.getLogger(__name__)

# In-memory fallback if Redis is unavailable
_memory_store: dict[str, list[float]] = {}

# Config
LLM_RATE_LIMIT = int(os.getenv("RATE_LIMIT_LLM_PER_MINUTE", "20"))
LLM_RATE_WINDOW = 60  # seconds


def _get_user_id(request: Request) -> str:
    """Generate a stable user identifier from IP + User-Agent."""
    ip = request.client.host if request.client else "unknown"
    ua = request.headers.get("user-agent", "")[:100]
    raw = f"{ip}:{ua}"
    return hashlib.sha256(raw.encode()).hexdigest()[:16]


async def check_rate_limit(request: Request, limit: int = LLM_RATE_LIMIT, window: int = LLM_RATE_WINDOW) -> dict:
    """Check and enforce per-user rate limit using Redis sliding window.

    Returns dict with rate limit info for response headers.
    Raises HTTPException 429 if limit exceeded.
    """
    user_id = _get_user_id(request)
    now = time.time()
    cutoff = now - window
    key = f"ratelimit:llm:{user_id}"

    try:
        from ..cache import get_redis
        r = await get_redis()

        # Sliding window: remove old entries, count current, add new
        pipe = r.pipeline()
        pipe.zremrangebyscore(key, 0, cutoff)
        pipe.zcard(key)
        pipe.zadd(key, {str(now): now})
        pipe.expire(key, window)
        results = await pipe.execute()

        current_count = results[1]
        remaining = max(0, limit - current_count)

        if current_count >= limit:
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. {limit} requests per {window}s. Try again later.",
            )

        return {
            "X-RateLimit-Limit": str(limit),
            "X-RateLimit-Remaining": str(remaining),
            "X-RateLimit-Reset": str(int(now + window)),
            "user_id": user_id,
        }

    except HTTPException:
        raise
    except Exception as e:
        # Fallback to in-memory if Redis is down
        logger.warning("Redis rate limit failed, using in-memory: %s", e)
        return _check_memory_rate_limit(user_id, limit, window)


def _check_memory_rate_limit(user_id: str, limit: int, window: int) -> dict:
    """In-memory fallback rate limiter."""
    now = time.time()
    cutoff = now - window

    if user_id not in _memory_store:
        _memory_store[user_id] = []

    # Clean old entries
    _memory_store[user_id] = [t for t in _memory_store[user_id] if t > cutoff]

    current_count = len(_memory_store[user_id])
    remaining = max(0, limit - current_count)

    if current_count >= limit:
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. {limit} requests per {window}s. Try again later.",
        )

    _memory_store[user_id].append(now)
    return {
        "X-RateLimit-Limit": str(limit),
        "X-RateLimit-Remaining": str(remaining),
        "X-RateLimit-Reset": str(int(now + window)),
        "user_id": user_id,
    }
