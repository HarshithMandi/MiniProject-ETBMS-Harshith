from app.services.user_service import UserService

service = UserService()


def list_users() -> list[dict]:
    return service.list_users()


def delete_user(user_id: str) -> None:
    service.delete_user(user_id)
