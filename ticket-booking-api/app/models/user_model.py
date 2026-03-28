from typing import Literal, TypedDict


class UserModel(TypedDict):
    email: str
    password: str
    role: Literal["customer", "organizer", "admin"]
    created_at: str
