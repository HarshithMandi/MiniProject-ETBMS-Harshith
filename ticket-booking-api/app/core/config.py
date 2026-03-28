from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Event Ticket Booking API"
    api_v1_prefix: str = "/api/v1"
    debug: bool = False

    mongodb_uri: str = "mongodb://mongo:27017"
    mongodb_db: str = "ticket_booking"

    redis_host: str = "redis"
    redis_port: int = 6379
    redis_db: int = 0
    seat_lock_ttl_seconds: int = 300

    jwt_secret_key: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    cors_origins: List[str] = Field(default_factory=lambda: ["http://localhost:3000", "http://localhost:5173"])

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
