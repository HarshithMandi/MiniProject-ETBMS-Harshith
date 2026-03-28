from datetime import datetime
from typing import Any

from bson import ObjectId


def object_id(value: str) -> ObjectId:
    if not ObjectId.is_valid(value):
        raise ValueError("Invalid ObjectId format")
    return ObjectId(value)


def serialize_mongo(document: dict[str, Any] | None) -> dict[str, Any] | None:
    if document is None:
        return None

    parsed: dict[str, Any] = {}
    for key, value in document.items():
        if isinstance(value, ObjectId):
            parsed[key] = str(value)
        elif isinstance(value, datetime):
            parsed[key] = value.isoformat()
        elif isinstance(value, list):
            parsed[key] = [str(item) if isinstance(item, ObjectId) else item for item in value]
        else:
            parsed[key] = value
    return parsed
