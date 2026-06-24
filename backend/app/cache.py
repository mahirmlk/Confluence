import asyncio
import hashlib
import json
import logging
import os
from typing import Optional

import numpy as np
import redis.asyncio as redis

logger = logging.getLogger(__name__)

_redis: Optional[redis.Redis] = None
_lock = asyncio.Lock()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")


async def get_redis() -> redis.Redis:
    global _redis
    if _redis is None:
        async with _lock:
            if _redis is None:
                _redis = redis.from_url(REDIS_URL, decode_responses=True, max_connections=20)
    return _redis


async def close_redis():
    global _redis
    if _redis is not None:
        await _redis.aclose()
        _redis = None


def make_cache_key(algorithm: str, params: dict, dataset: str, resolution: int) -> str:
    payload = json.dumps({
        "algorithm": algorithm,
        "params": sorted(params.items()),
        "dataset": dataset,
        "resolution": resolution,
    }, sort_keys=True)
    return f"grid:{hashlib.sha256(payload.encode()).hexdigest()[:16]}"


async def get_cached_grid(key: str) -> Optional[np.ndarray]:
    try:
        r = await get_redis()
        data = await r.get(key)
        if data is not None:
            return np.array(json.loads(data))
        return None
    except redis.RedisError as e:
        logger.warning("Redis read failed for key %s: %s", key, e)
        return None


async def set_cached_grid(key: str, grid: np.ndarray, ttl: int = 3600) -> None:
    try:
        r = await get_redis()
        await r.set(key, json.dumps(grid.tolist()), ex=ttl)
    except redis.RedisError as e:
        logger.warning("Redis write failed for key %s: %s", key, e)



