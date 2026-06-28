import time
from fastapi import APIRouter
from ..models.schemas import HealthResponse

router = APIRouter()
_start_time = time.time()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="ok",
        version="0.1.0",
        uptime=round(time.time() - _start_time, 1),
    )
