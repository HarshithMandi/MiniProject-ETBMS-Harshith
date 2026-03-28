from fastapi import APIRouter, Depends

from app.controllers import seat_controller
from app.core.dependencies import require_roles
from app.schemas.seat_schema import SeatLockRequest, SeatReleaseRequest

router = APIRouter(prefix="/seats", tags=["Seats"])


@router.post("/lock")
def lock_seats(payload: SeatLockRequest, current_user: dict = Depends(require_roles("customer"))) -> dict:
    seat_controller.lock_seats(payload=payload, user_id=current_user["_id"])
    return {"message": "Seats locked successfully"}


@router.post("/release")
def release_seats(payload: SeatReleaseRequest, current_user: dict = Depends(require_roles("customer"))) -> dict:
    seat_controller.release_seats(payload=payload, user_id=current_user["_id"])
    return {"message": "Seats released successfully"}
