from typing import Any

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer

from app.core.database import get_database
from app.core.security import decode_access_token
from app.exceptions.custom_exceptions import ForbiddenException, UnauthorizedException
from app.utils.helpers import object_id, serialize_mongo

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")


def get_current_user(token: str = Depends(oauth2_scheme)) -> dict[str, Any]:
    try:
        payload = decode_access_token(token)
    except ValueError as exc:
        raise UnauthorizedException(str(exc)) from exc
    email = payload.get("sub")
    if not email:
        raise UnauthorizedException("Invalid token payload")

    user = get_database()["users"].find_one({"email": email})
    if not user:
        raise UnauthorizedException("User does not exist")
    user.pop("password", None)
    return serialize_mongo(user)


def require_roles(*roles: str):
    def role_checker(current_user: dict[str, Any] = Depends(get_current_user)) -> dict[str, Any]:
        if current_user["role"] not in roles:
            raise ForbiddenException("You do not have permission for this action")
        return current_user

    return role_checker


def current_user_object_id(current_user: dict[str, Any]) -> Any:
    return object_id(current_user["_id"])
