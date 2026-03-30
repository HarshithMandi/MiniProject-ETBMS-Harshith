from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import get_settings
from app.core.database import close_mongo_connection, connect_to_mongo
from app.exceptions.exception_handlers import register_exception_handlers
from app.middleware.logging_middleware import logging_middleware
from app.middleware.rate_limiter import rate_limiter
from app.utils.seed_demo_users import ensure_demo_users

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    connect_to_mongo()
    if settings.seed_demo_users:
        ensure_demo_users()
    yield
    close_mongo_connection()


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.middleware("http")(rate_limiter)
app.middleware("http")(logging_middleware)

register_exception_handlers(app)
app.include_router(api_router, prefix=settings.api_v1_prefix)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
