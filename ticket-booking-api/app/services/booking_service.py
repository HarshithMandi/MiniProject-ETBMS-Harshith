from typing import Any

from app.exceptions.custom_exceptions import ForbiddenException, NotFoundException
from app.repositories.booking_repository import BookingRepository
from app.utils.constants import BOOKING_STATUS_CANCELLED, BOOKING_STATUS_CONFIRMED, BOOKING_STATUS_PENDING
from app.utils.helpers import serialize_mongo


class BookingService:
    def __init__(self) -> None:
        self.repository = BookingRepository()

    def create_booking(self, user_id: str, event_id: str, seat_numbers: list[str]) -> dict[str, Any]:
        booking = self.repository.create_booking(
            user_id=user_id,
            event_id=event_id,
            seat_numbers=seat_numbers,
            status=BOOKING_STATUS_PENDING,
        )
        parsed = serialize_mongo(booking)
        if parsed is None:
            raise NotFoundException("Booking creation failed")
        return parsed

    def get_booking(self, booking_id: str, user_id: str) -> dict[str, Any]:
        booking = self.repository.get_by_id(booking_id)
        if not booking:
            raise NotFoundException("Booking not found")
        if str(booking["user_id"]) != user_id:
            raise ForbiddenException("Cannot access this booking")
        parsed = serialize_mongo(booking)
        if parsed is None:
            raise NotFoundException("Booking not found")
        return parsed

    def list_my_bookings(self, user_id: str) -> list[dict[str, Any]]:
        bookings: list[dict[str, Any]] = []
        for booking in self.repository.list_by_user(user_id):
            parsed = serialize_mongo(booking)
            if parsed is not None:
                bookings.append(parsed)
        return bookings

    def confirm_booking(self, booking_id: str, user_id: str) -> dict[str, Any]:
        booking = self.repository.get_by_id(booking_id)
        if not booking:
            raise NotFoundException("Booking not found")
        if str(booking["user_id"]) != user_id:
            raise ForbiddenException("Cannot confirm this booking")

        updated = self.repository.update_status(booking_id, BOOKING_STATUS_CONFIRMED)
        parsed = serialize_mongo(updated)
        if parsed is None:
            raise NotFoundException("Booking not found")
        return parsed

    def cancel_booking(self, booking_id: str, user_id: str) -> None:
        booking = self.repository.get_by_id(booking_id)
        if not booking:
            raise NotFoundException("Booking not found")
        if str(booking["user_id"]) != user_id:
            raise ForbiddenException("Cannot cancel this booking")

        self.repository.update_status(booking_id, BOOKING_STATUS_CANCELLED)
