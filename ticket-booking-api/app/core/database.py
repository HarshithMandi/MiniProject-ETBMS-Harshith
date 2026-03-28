from pymongo import MongoClient
from pymongo.database import Database

from app.core.config import get_settings

_client: MongoClient | None = None


def connect_to_mongo() -> None:
    global _client
    if _client is None:
        settings = get_settings()
        _client = MongoClient(settings.mongodb_uri)


def close_mongo_connection() -> None:
    global _client
    if _client is not None:
        _client.close()
        _client = None


def get_database() -> Database:
    if _client is None:
        connect_to_mongo()
    settings = get_settings()
    return _client[settings.mongodb_db]
