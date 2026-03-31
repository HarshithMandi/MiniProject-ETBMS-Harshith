from typing import Any

from app.exceptions.custom_exceptions import ForbiddenException, NotFoundException
from app.repositories.booking_repository import BookingRepository
from app.repositories.event_repository import EventRepository
from app.utils.constants import BOOKING_STATUS_CANCELLED, BOOKING_STATUS_CONFIRMED, BOOKING_STATUS_PENDING
from app.utils.helpers import serialize_mongo


class BookingService:
    def __init__(self) -> None:
        self.repository = BookingRepository()
        self.event_repository = EventRepository()

    def _get_ticket_price(self, event_id: str) -> float:
        event = self.event_repository.get_by_id(event_id)
        if not event:
            return 500.0
        raw = event.get("ticket_price", 500)
        try:
            price = float(raw)
        except (TypeError, ValueError):
            price = 500.0
        return price if price > 0 else 500.0

    def _ensure_total_price(self, booking: dict[str, Any]) -> None:
        if booking.get("total_price") is not None:
            return

        try:
            ticket_price = self._get_ticket_price(str(booking["event_id"]))
            seat_count = len(booking.get("seat_numbers") or [])
            total_price = float(ticket_price) * float(seat_count)
        except Exception:
            total_price = 0.0

        booking_id = str(booking.get("_id"))
        if booking_id:
            self.repository.update_total_price(booking_id, total_price)
        booking["total_price"] = total_price

    def _attach_event(self, booking: dict[str, Any]) -> None:
        try:
            event_id = str(booking.get("event_id"))
            if not event_id:
                return
            event = self.event_repository.get_by_id(event_id)
            booking["event"] = serialize_mongo(event) if event else None
        except Exception:
            booking["event"] = None

    def create_booking(self, user_id: str, event_id: str, seat_numbers: list[str]) -> dict[str, Any]:
        ticket_price = self._get_ticket_price(event_id)
        total_price = float(ticket_price) * float(len(seat_numbers))
        booking = self.repository.create_booking(
            user_id=user_id,
            event_id=event_id,
            seat_numbers=seat_numbers,
            status=BOOKING_STATUS_PENDING,
            total_price=total_price,
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

        self._ensure_total_price(booking)
        self._attach_event(booking)
        parsed = serialize_mongo(booking)
        if parsed is None:
            raise NotFoundException("Booking not found")
        return parsed

    def list_my_bookings(self, user_id: str) -> list[dict[str, Any]]:
        bookings: list[dict[str, Any]] = []
        for booking in self.repository.list_by_user(user_id):
            self._ensure_total_price(booking)
            self._attach_event(booking)
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
        if updated is not None:
            self._ensure_total_price(updated)
            self._attach_event(updated)
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
