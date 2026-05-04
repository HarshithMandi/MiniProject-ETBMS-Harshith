from fastapi import APIRouter, Depends

from app.controllers import admin_controller
from app.core.dependencies import require_roles

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/reports")
def reports(_: dict = Depends(require_roles("admin"))) -> list[dict]:
    return admin_controller.get_reports()


@router.get("/users")
def users(_: dict = Depends(require_roles("admin"))) -> list[dict]:
    return admin_controller.list_users()


@router.delete("/users/{user_id}")
def delete_user(user_id: str, _: dict = Depends(require_roles("admin"))) -> dict:
    from app.controllers import user_controller

    user_controller.delete_user(user_id)
    return {"message": "User deleted"}
