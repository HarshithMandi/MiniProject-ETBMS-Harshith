from datetime import datetime, timezone
from typing import Any

from app.core.database import get_database
from app.utils.helpers import object_id


class BookingRepository:
    def __init__(self) -> None:
        self.collection = get_database()["bookings"]

    def create_booking(
        self,
        user_id: str,
        event_id: str,
        seat_numbers: list[str],
        status: str,
        total_price: float,
    ) -> dict[str, Any] | None:
        payload = {
            "user_id": object_id(user_id),
            "event_id": object_id(event_id),
            "seat_numbers": seat_numbers,
            "total_price": float(total_price),
            "status": status,
            "created_at": datetime.now(timezone.utc),
        }
        inserted = self.collection.insert_one(payload)
        return self.collection.find_one({"_id": inserted.inserted_id})

    def update_total_price(self, booking_id: str, total_price: float) -> dict[str, Any] | None:
        self.collection.update_one(
            {"_id": object_id(booking_id)},
            {"$set": {"total_price": float(total_price)}},
        )
        return self.get_by_id(booking_id)

    def get_by_id(self, booking_id: str) -> dict[str, Any] | None:
        return self.collection.find_one({"_id": object_id(booking_id)})

    def update_status(self, booking_id: str, status: str) -> dict[str, Any] | None:
        self.collection.update_one({"_id": object_id(booking_id)}, {"$set": {"status": status}})
        return self.get_by_id(booking_id)

    def delete_booking(self, booking_id: str) -> int:
        result = self.collection.delete_one({"_id": object_id(booking_id)})
        return result.deleted_count

    def list_by_user(self, user_id: str) -> list[dict[str, Any]]:
        return list(self.collection.find({"user_id": object_id(user_id)}).sort("created_at", -1))
