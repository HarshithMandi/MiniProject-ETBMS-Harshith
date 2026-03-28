from fastapi import APIRouter, Depends, Response, status

from app.controllers import user_controller
from app.core.dependencies import require_roles

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("")
def list_users(_: dict = Depends(require_roles("admin"))) -> list[dict]:
    return user_controller.list_users()


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: str, _: dict = Depends(require_roles("admin"))) -> Response:
    user_controller.delete_user(user_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
