from fastapi import APIRouter, Depends

from app.controllers import auth_controller
from app.core.dependencies import get_current_user
from app.schemas.auth_schema import LoginRequest, RegisterRequest

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register")
def register(payload: RegisterRequest) -> dict:
    return auth_controller.register(payload)


@router.post("/login")
def login(payload: LoginRequest) -> dict:
    return auth_controller.login(payload)


@router.get("/me")
def me(current_user: dict = Depends(get_current_user)) -> dict:
    return {
        "id": current_user["_id"],
        "email": current_user["email"],
        "role": current_user["role"],
        "created_at": current_user["created_at"],
    }
