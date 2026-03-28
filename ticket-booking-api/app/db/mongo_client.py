from pymongo import MongoClient

from app.core.config import get_settings


def get_mongo_client() -> MongoClient:
    settings = get_settings()
    return MongoClient(settings.mongodb_uri)
