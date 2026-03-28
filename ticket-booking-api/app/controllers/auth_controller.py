from app.schemas.auth_schema import LoginRequest, RegisterRequest
from app.services.auth_service import AuthService

service = AuthService()


def register(payload: RegisterRequest) -> dict:
    return service.register(email=payload.email, password=payload.password, role=payload.role)


def login(payload: LoginRequest) -> dict:
    return service.login(email=payload.email, password=payload.password)
