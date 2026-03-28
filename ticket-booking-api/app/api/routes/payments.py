from fastapi import APIRouter, Depends

from app.controllers import payment_controller
from app.core.dependencies import require_roles
from app.schemas.payment_schema import PaymentCreateRequest

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post("")
def process_payment(payload: PaymentCreateRequest, current_user: dict = Depends(require_roles("customer"))) -> dict:
    return payment_controller.process_payment(payload=payload, user_id=current_user["_id"])


@router.get("/{payment_id}")
def get_payment(payment_id: str, _: dict = Depends(require_roles("customer", "admin"))) -> dict:
    return payment_controller.get_payment(payment_id)
