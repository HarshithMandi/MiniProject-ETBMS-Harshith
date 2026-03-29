from typing import Any

from app.exceptions.custom_exceptions import NotFoundException
from app.repositories.user_repository import UserRepository
from app.utils.helpers import serialize_mongo


class UserService:
    def __init__(self) -> None:
        self.repository = UserRepository()

    def list_users(self) -> list[dict[str, Any]]:
        users: list[dict[str, Any]] = []
        for user in self.repository.list_users():
            parsed = serialize_mongo(user)
            if parsed is not None:
                users.append(parsed)
        return users

    def delete_user(self, user_id: str) -> None:
        deleted = self.repository.delete_user(user_id)
        if not deleted:
            raise NotFoundException("User not found")
