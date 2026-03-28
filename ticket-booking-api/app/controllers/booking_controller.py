from app.schemas.booking_schema import BookingCreateRequest
from app.services.booking_service import BookingService

service = BookingService()


def create_booking(payload: BookingCreateRequest, user_id: str) -> dict:
    return service.create_booking(user_id=user_id, event_id=payload.event_id, seat_numbers=payload.seat_numbers)


def get_booking(booking_id: str, user_id: str) -> dict:
    return service.get_booking(booking_id=booking_id, user_id=user_id)


def list_my_bookings(user_id: str) -> list[dict]:
    return service.list_my_bookings(user_id=user_id)


def confirm_booking(booking_id: str, user_id: str) -> dict:
    return service.confirm_booking(booking_id=booking_id, user_id=user_id)


def cancel_booking(booking_id: str, user_id: str) -> None:
    service.cancel_booking(booking_id=booking_id, user_id=user_id)
