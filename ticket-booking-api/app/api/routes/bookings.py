from fastapi import APIRouter, Depends, Response, status

from app.controllers import booking_controller
from app.core.dependencies import require_roles
from app.schemas.booking_schema import BookingCreateRequest

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.post("")
def create_booking(payload: BookingCreateRequest, current_user: dict = Depends(require_roles("customer"))) -> dict:
    return booking_controller.create_booking(payload=payload, user_id=current_user["_id"])


@router.get("/my")
def my_bookings(current_user: dict = Depends(require_roles("customer"))) -> list[dict]:
    return booking_controller.list_my_bookings(user_id=current_user["_id"])


@router.put("/{booking_id}/confirm")
def confirm_booking(booking_id: str, current_user: dict = Depends(require_roles("customer"))) -> dict:
    return booking_controller.confirm_booking(booking_id=booking_id, user_id=current_user["_id"])


@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_booking(booking_id: str, current_user: dict = Depends(require_roles("customer"))) -> Response:
    booking_controller.cancel_booking(booking_id=booking_id, user_id=current_user["_id"])
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{booking_id}")
def get_booking(booking_id: str, current_user: dict = Depends(require_roles("customer"))) -> dict:
    return booking_controller.get_booking(booking_id=booking_id, user_id=current_user["_id"])
