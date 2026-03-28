from datetime import datetime, timezone
from typing import Any

from app.core.database import get_database
from app.utils.helpers import object_id


class PaymentRepository:
    def __init__(self) -> None:
        self.collection = get_database()["payments"]

    def create_payment(self, booking_id: str, amount: float, status: str) -> dict[str, Any]:
        payload = {
            "booking_id": object_id(booking_id),
            "amount": amount,
            "status": status,
            "payment_time": datetime.now(timezone.utc),
        }
        inserted = self.collection.insert_one(payload)
        return self.collection.find_one({"_id": inserted.inserted_id})

    def get_by_id(self, payment_id: str) -> dict[str, Any] | None:
        return self.collection.find_one({"_id": object_id(payment_id)})

    def list_all(self) -> list[dict[str, Any]]:
        return list(self.collection.find().sort("payment_time", -1))
