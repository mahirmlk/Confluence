import pytest
from app.cache import make_cache_key, get_cached_grid, set_cached_grid, close_redis, get_redis


async def _redis_available():
    try:
        r = await get_redis()
        await r.ping()
        return True
    except Exception:
        return False


@pytest.mark.asyncio
@pytest.mark.skipif(True, reason="Requires Redis running — enable when Redis is available")
async def test_cache_roundtrip():
    import numpy as np
    if not await _redis_available():
        pytest.skip("Redis not available")
    grid = np.array([[0.1, 0.2], [0.3, 0.4]])
    key = make_cache_key("test-algo", {"C": 1.0}, "blobs", 2)
    await set_cached_grid(key, grid)
    result = await get_cached_grid(key)
    assert result is not None
    np.testing.assert_array_almost_equal(result, grid)
    await close_redis()


@pytest.mark.asyncio
async def test_cache_miss():
    result = await get_cached_grid("nonexistent-key-12345")
    assert result is None
    await close_redis()


def test_make_cache_key_deterministic():
    key1 = make_cache_key("logistic-regression", {"C": 1.0}, "blobs", 100)
    key2 = make_cache_key("logistic-regression", {"C": 1.0}, "blobs", 100)
    assert key1 == key2
    assert key1.startswith("grid:")
