from app.core.security import create_access_token, hash_password, verify_password
from app.exceptions.custom_exceptions import ConflictException, UnauthorizedException
from app.repositories.user_repository import UserRepository
from app.utils.helpers import serialize_mongo
from app.utils.validators import validate_role


class AuthService:
    def __init__(self) -> None:
        self.user_repository = UserRepository()

    def register(self, email: str, password: str, role: str) -> dict:
        if self.user_repository.get_by_email(email):
            raise ConflictException("Email already registered")

        validated_role = validate_role(role)
        user = self.user_repository.create_user(
            email=email,
            password=hash_password(password),
            role=validated_role,
        )
        return serialize_mongo(user)

    def login(self, email: str, password: str) -> dict:
        user = self.user_repository.get_by_email(email)
        if not user or not verify_password(password, user["password"]):
            raise UnauthorizedException("Invalid email or password")

        token = create_access_token(subject=user["email"])
        return {"access_token": token, "token_type": "bearer"}
