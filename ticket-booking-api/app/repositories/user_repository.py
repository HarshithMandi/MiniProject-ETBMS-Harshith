from datetime import datetime, timezone
import re
from typing import Any

from app.core.database import get_database
from app.utils.helpers import object_id


class UserRepository:
    def __init__(self) -> None:
        self.collection = get_database()["users"]

    def create_user(self, email: str, password: str, role: str) -> dict[str, Any]:
        normalized_email = email.strip().lower()
        user = {
            "email": normalized_email,
            "password": password,
            "role": role,
            "created_at": datetime.now(timezone.utc),
        }
        inserted = self.collection.insert_one(user)
        return self.collection.find_one({"_id": inserted.inserted_id})

    def get_by_email(self, email: str) -> dict[str, Any] | None:
        normalized_email = email.strip().lower()
        # Case-insensitive exact match for legacy data that may have mixed-case emails.
        return self.collection.find_one({"email": {"$regex": f"^{re.escape(normalized_email)}$", "$options": "i"}})

    def update_password_hash(self, user_id: Any, password_hash: str) -> int:
        result = self.collection.update_one({"_id": user_id}, {"$set": {"password": password_hash}})
        return result.modified_count

    def get_by_id(self, user_id: str) -> dict[str, Any] | None:
        return self.collection.find_one({"_id": object_id(user_id)})

    def list_users(self) -> list[dict[str, Any]]:
        return list(self.collection.find().sort("created_at", -1))

    def delete_user(self, user_id: str) -> int:
        result = self.collection.delete_one({"_id": object_id(user_id)})
        return result.deleted_count
