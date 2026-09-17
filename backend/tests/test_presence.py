import time
import uuid

import pytest

from app import presence


@pytest.fixture(autouse=True)
def _clear_memory_store():
    with presence._memory_lock:
        presence._memory_seen.clear()
        presence._memory_unique.clear()
        presence._memory_total = 0
    yield
    with presence._memory_lock:
        presence._memory_seen.clear()
        presence._memory_unique.clear()
        presence._memory_total = 0


def _new_id() -> str:
    return uuid.uuid4().hex


def test_heartbeat_counts_new_visitor(client):
    before = client.get("/api/presence/live").json()["active_visitors"]
    response = client.post(
        "/api/presence/heartbeat",
        json={"visitor_id": _new_id(), "path": "/"},
    )
    assert response.status_code == 200
    assert response.json()["active_visitors"] == before + 1


def test_repeat_heartbeat_does_not_double_count(client):
    visitor_id = _new_id()
    first = client.post(
        "/api/presence/heartbeat", json={"visitor_id": visitor_id}
    ).json()["active_visitors"]
    second = client.post(
        "/api/presence/heartbeat", json={"visitor_id": visitor_id}
    ).json()["active_visitors"]
    assert second == first


def test_live_returns_count_shape(client):
    response = client.get("/api/presence/live")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data["active_visitors"], int)
    assert data["active_visitors"] >= 0


@pytest.mark.parametrize(
    "visitor_id", ["short", "has space!", "semi;colon", "", "x" * 129]
)
def test_heartbeat_rejects_invalid_visitor_id(client, visitor_id):
    response = client.post(
        "/api/presence/heartbeat", json={"visitor_id": visitor_id}
    )
    assert response.status_code == 422


def test_memory_store_prunes_stale_entries():
    now = time.time()
    with presence._memory_lock:
        presence._memory_seen["stale-visitor"] = (
            now - presence.ACTIVE_WINDOW_SECONDS - 10
        )
        presence._memory_seen["fresh-visitor"] = now
    assert presence._memory_counts(now).active_visitors == 1
    with presence._memory_lock:
        assert "stale-visitor" not in presence._memory_seen
        assert "fresh-visitor" in presence._memory_seen


def test_new_visit_increments_total(client):
    before = client.get("/api/presence/live").json()["total_visitors"]
    response = client.post(
        "/api/presence/heartbeat",
        json={"visitor_id": _new_id(), "is_new_visit": True},
    )
    assert response.status_code == 200
    assert response.json()["total_visitors"] == before + 1


def test_repeat_heartbeat_does_not_inflate_total(client):
    visitor_id = _new_id()
    first = client.post(
        "/api/presence/heartbeat",
        json={"visitor_id": visitor_id, "is_new_visit": True},
    ).json()["total_visitors"]
    second = client.post(
        "/api/presence/heartbeat",
        json={"visitor_id": visitor_id, "is_new_visit": False},
    ).json()["total_visitors"]
    assert second == first


def test_memory_totals_count_visits_and_uniques():
    now = time.time()
    counts = presence._memory_heartbeat("visitor-a", True, now)
    assert counts.total_visitors == 1
    assert counts.unique_visitors == 1
    counts = presence._memory_heartbeat("visitor-a", False, now)
    assert counts.total_visitors == 1
    assert counts.unique_visitors == 1
    counts = presence._memory_heartbeat("visitor-b", True, now)
    assert counts.total_visitors == 2
    assert counts.unique_visitors == 2


def test_live_response_shape(client):
    data = client.get("/api/presence/live").json()
    assert isinstance(data["active_visitors"], int)
    assert isinstance(data["total_visitors"], int)
    assert isinstance(data["unique_visitors"], int)
