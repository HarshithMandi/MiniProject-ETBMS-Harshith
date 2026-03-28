from typing import Any

from app.core.database import get_database
from app.utils.helpers import object_id


class SeatRepository:
    def __init__(self) -> None:
        self.collection = get_database()["seats"]

    def create_many(self, seats: list[dict[str, Any]]) -> None:
        if seats:
            self.collection.insert_many(seats)

    def list_by_event(self, event_id: str) -> list[dict[str, Any]]:
        return list(self.collection.find({"event_id": object_id(event_id)}).sort("seat_number", 1))

    def list_by_event_and_numbers(self, event_id: str, seat_numbers: list[str]) -> list[dict[str, Any]]:
        return list(
            self.collection.find({
                "event_id": object_id(event_id),
                "seat_number": {"$in": seat_numbers},
            })
        )

    def update_status(self, event_id: str, seat_numbers: list[str], status: str) -> int:
        result = self.collection.update_many(
            {"event_id": object_id(event_id), "seat_number": {"$in": seat_numbers}},
            {"$set": {"status": status}},
        )
        return result.modified_count
