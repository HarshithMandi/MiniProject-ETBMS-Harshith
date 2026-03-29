from typing import Any

from app.exceptions.custom_exceptions import NotFoundException
from app.repositories.booking_repository import BookingRepository
from app.repositories.payment_repository import PaymentRepository
from app.services.seat_service import SeatService
from app.utils.constants import BOOKING_STATUS_CONFIRMED, PAYMENT_STATUS_FAILED, PAYMENT_STATUS_SUCCESS
from app.utils.helpers import serialize_mongo


class PaymentService:
    def __init__(self) -> None:
        self.payment_repository = PaymentRepository()
        self.booking_repository = BookingRepository()
        self.seat_service = SeatService()

    def process_payment(self, booking_id: str, amount: float, user_id: str) -> dict[str, Any]:
        booking = self.booking_repository.get_by_id(booking_id)
        if not booking:
            raise NotFoundException("Booking not found")

        status = PAYMENT_STATUS_SUCCESS if amount > 0 else PAYMENT_STATUS_FAILED
        payment = self.payment_repository.create_payment(booking_id=booking_id, amount=amount, status=status)

        if status == PAYMENT_STATUS_SUCCESS:
            self.booking_repository.update_status(booking_id, BOOKING_STATUS_CONFIRMED)
            self.seat_service.mark_booked(
                event_id=str(booking["event_id"]),
                seat_numbers=booking["seat_numbers"],
                user_id=user_id,
            )

        parsed = serialize_mongo(payment)
        if parsed is None:
            raise NotFoundException("Payment processing failed")
        return parsed

    def get_payment(self, payment_id: str) -> dict[str, Any]:
        payment = self.payment_repository.get_by_id(payment_id)
        if not payment:
            raise NotFoundException("Payment not found")
        parsed = serialize_mongo(payment)
        if parsed is None:
            raise NotFoundException("Payment not found")
        return parsed
