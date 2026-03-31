from __future__ import annotations

from app.core.security import hash_password
from app.repositories.user_repository import UserRepository
from app.utils.validators import validate_role


def ensure_demo_users() -> None:
    """Create demo users if they don't already exist.

    Guard this behind a config flag in app startup.
    """

    repo = UserRepository()
    demo_users = [
        {"email": "user@email.com", "password": "password", "role": "customer"},
        {"email": "organizer@email.com", "password": "password", "role": "organizer"},
        {"email": "admin@email.com", "password": "password", "role": "admin"},
    ]

    for item in demo_users:
        email = item["email"].strip().lower()
        role = validate_role(item["role"])
        if repo.get_by_email(email):
            continue
        repo.create_user(email=email, password=hash_password(item["password"]), role=role)
