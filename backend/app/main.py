import logging
import os
import time
from collections import defaultdict
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .routers import health, classification, regression, clustering, dim_reduction, streaming, datasets, explain, training
from .cache import close_redis
from .datasets.loaders import register_all_datasets

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger(__name__)

ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000"
    ).split(",")
    if origin.strip()
]
if "*" in ALLOWED_ORIGINS:
    logger.warning("CORS_ORIGINS contains '*' — this is insecure with allow_credentials=True. Falling back to localhost only.")
    ALLOWED_ORIGINS = ["http://localhost:3000"]
logger.info("Allowed CORS origins: %s", ALLOWED_ORIGINS)


# --- Rate Limiting (fixed-window, per-IP) ---
_rate_limit_store: dict[str, list[float]] = defaultdict(list)
_RATE_LIMIT_MAX = 60  # requests per window
_RATE_LIMIT_WINDOW = 60  # seconds

def _check_rate_limit(ip: str) -> bool:
    now = time.time()
    cutoff = now - _RATE_LIMIT_WINDOW
    _rate_limit_store[ip] = [t for t in _rate_limit_store[ip] if t > cutoff]
    if len(_rate_limit_store[ip]) >= _RATE_LIMIT_MAX:
        return False
    _rate_limit_store[ip].append(now)
    return True


@asynccontextmanager
async def lifespan(app: FastAPI):
    register_all_datasets()
    logger.info("Registered %d datasets", len(__import__('app.datasets.registry', fromlist=['DatasetRegistry']).DatasetRegistry.names()))
    yield
    await close_redis()


app = FastAPI(
    title="Confluence",
    version="0.1.0",
    description="Interactive ML visualization platform with real scikit-learn computation",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    if request.url.path.startswith("/ws/"):
        return await call_next(request)
    ip = request.client.host if request.client else "unknown"
    if not _check_rate_limit(ip):
        return JSONResponse(status_code=429, content={"error": "Rate limit exceeded. Try again later.", "code": "RATE_LIMITED"})
    response = await call_next(request)
    return response


@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = time.time() - start
    logger.info("%s %s %s %.3fs", request.method, request.url.path, response.status_code, duration)
    return response


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    logger.warning("Validation error: %s", exc)
    return JSONResponse(status_code=422, content={"error": str(exc), "code": "VALIDATION_ERROR"})


@app.exception_handler(KeyError)
async def key_error_handler(request: Request, exc: KeyError):
    logger.warning("Missing key: %s", exc)
    return JSONResponse(status_code=422, content={"error": f"Missing required field: {exc}", "code": "MISSING_FIELD"})


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"error": "Internal server error", "code": "INTERNAL_ERROR"})


app.include_router(health.router)
app.include_router(classification.router)
app.include_router(regression.router)
app.include_router(clustering.router)
app.include_router(dim_reduction.router)
app.include_router(streaming.router)
app.include_router(datasets.router)
app.include_router(explain.router)
app.include_router(training.router)


@app.get("/")
async def root():
    return {"message": "Confluence API", "docs": "/docs"}
