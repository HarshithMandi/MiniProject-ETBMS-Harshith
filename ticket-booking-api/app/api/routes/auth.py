from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm

from app.controllers import auth_controller
from app.core.dependencies import get_current_user
from app.schemas.auth_schema import LoginRequest, RegisterRequest

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register")
def register(payload: RegisterRequest) -> dict:
    return auth_controller.register(payload)


@router.post("/login")
async def login(request: Request) -> dict:
    content_type = request.headers.get("content-type", "")
    if "application/x-www-form-urlencoded" in content_type:
        form = await request.form()
        email = form.get("username") or form.get("email")
        password = form.get("password")
        if not email or not password:
            raise HTTPException(status_code=422, detail="Missing username/email or password")
        return auth_controller.login_with_password(email=email, password=password)

    payload = LoginRequest.model_validate(await request.json())
    return auth_controller.login(payload)


@router.post("/token")
def token(form_data: OAuth2PasswordRequestForm = Depends()) -> dict:
    return auth_controller.login_with_password(email=form_data.username, password=form_data.password)


@router.get("/me")
def me(current_user: dict = Depends(get_current_user)) -> dict:
    return {
        "id": current_user["_id"],
        "email": current_user["email"],
        "role": current_user["role"],
        "created_at": current_user["created_at"],
    }
