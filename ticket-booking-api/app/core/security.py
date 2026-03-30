from datetime import datetime, timedelta, timezone
from typing import Any
import hashlib

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _prehash_password(password: str) -> str:
    digest = hashlib.sha256(password.encode("utf-8")).hexdigest()
    return digest


def hash_password(password: str) -> str:
    return pwd_context.hash(_prehash_password(password))


def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Current scheme: bcrypt(sha256(password))
    try:
        if pwd_context.verify(_prehash_password(plain_password), hashed_password):
            return True
    except Exception:
        pass

    # Legacy scheme (older accounts): bcrypt(password)
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False


def is_legacy_password_hash(plain_password: str, hashed_password: str) -> bool:
    """Returns True if the stored hash matches the legacy scheme.

    Legacy scheme was: bcrypt(password)
    Current scheme is: bcrypt(sha256(password))
    """

    try:
        legacy_ok = pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False

    if not legacy_ok:
        return False

    try:
        current_ok = pwd_context.verify(_prehash_password(plain_password), hashed_password)
    except Exception:
        current_ok = False

    return not current_ok


def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    settings = get_settings()
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.access_token_expire_minutes)

    expire = datetime.now(timezone.utc) + expires_delta
    payload: dict[str, Any] = {"sub": subject, "exp": expire}

    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict[str, Any]:
    settings = get_settings()
    try:
        return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    except JWTError as exc:
        raise ValueError("Invalid authentication token") from exc
