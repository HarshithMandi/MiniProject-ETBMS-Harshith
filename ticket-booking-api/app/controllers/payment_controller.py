from app.schemas.payment_schema import PaymentCreateRequest
from app.services.payment_service import PaymentService

service = PaymentService()


def process_payment(payload: PaymentCreateRequest, user_id: str) -> dict:
    return service.process_payment(booking_id=payload.booking_id, amount=payload.amount, user_id=user_id)


def get_payment(payment_id: str) -> dict:
    return service.get_payment(payment_id=payment_id)
