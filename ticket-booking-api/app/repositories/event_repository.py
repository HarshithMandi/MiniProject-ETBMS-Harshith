from typing import Any

from app.core.database import get_database
from app.utils.helpers import object_id


class EventRepository:
    def __init__(self) -> None:
        self.collection = get_database()["events"]

    def create_event(self, payload: dict[str, Any]) -> dict[str, Any] | None:
        inserted = self.collection.insert_one(payload)
        return self.collection.find_one({"_id": inserted.inserted_id})

    def update_event(self, event_id: str, payload: dict[str, Any]) -> dict[str, Any] | None:
        self.collection.update_one({"_id": object_id(event_id)}, {"$set": payload})
        return self.get_by_id(event_id)

    def delete_event(self, event_id: str) -> int:
        result = self.collection.delete_one({"_id": object_id(event_id)})
        return result.deleted_count

    def get_by_id(self, event_id: str) -> dict[str, Any] | None:
        return self.collection.find_one({"_id": object_id(event_id)})

    def list_events(self) -> list[dict[str, Any]]:
        return list(self.collection.find().sort("date", 1))
