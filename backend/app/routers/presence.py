import logging

from fastapi import APIRouter

from ..models.schemas import PresenceHeartbeatRequest, PresenceLiveResponse
from ..presence import get_counts, record_heartbeat

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/presence", tags=["presence"])


@router.post("/heartbeat", response_model=PresenceLiveResponse)
async def heartbeat(request: PresenceHeartbeatRequest):
    """Record a visitor heartbeat and return the live visitor numbers."""
    counts = await record_heartbeat(request.visitor_id, request.is_new_visit)
    return PresenceLiveResponse(
        active_visitors=counts.active_visitors,
        total_visitors=counts.total_visitors,
        unique_visitors=counts.unique_visitors,
    )


@router.get("/live", response_model=PresenceLiveResponse)
async def live():
    """Return the live visitor numbers without recording anything."""
    counts = await get_counts()
    return PresenceLiveResponse(
        active_visitors=counts.active_visitors,
        total_visitors=counts.total_visitors,
        unique_visitors=counts.unique_visitors,
    )
