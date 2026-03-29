from typing import Any

from redis import Redis

from app.core.config import get_settings
from app.exceptions.custom_exceptions import ConflictException, NotFoundException
from app.repositories.seat_repository import SeatRepository
from app.utils.constants import SEAT_STATUS_AVAILABLE, SEAT_STATUS_BOOKED, SEAT_STATUS_LOCKED
from app.utils.helpers import serialize_mongo


class SeatService:
    def __init__(self) -> None:
        settings = get_settings()
        self.redis = Redis(host=settings.redis_host, port=settings.redis_port, db=settings.redis_db, decode_responses=True)
        self.lock_ttl = settings.seat_lock_ttl_seconds
        self.repository = SeatRepository()

    def list_event_seats(self, event_id: str) -> list[dict[str, Any]]:
        seats: list[dict[str, Any]] = []
        for seat in self.repository.list_by_event(event_id):
            parsed = serialize_mongo(seat)
            if parsed is not None:
                seats.append(parsed)
        return seats

    def lock_seats(self, event_id: str, seat_numbers: list[str], user_id: str) -> None:
        seats = self.repository.list_by_event_and_numbers(event_id, seat_numbers)
        if len(seats) != len(seat_numbers):
            raise NotFoundException("Some seats do not exist")

        for seat in seats:
            if seat["status"] == SEAT_STATUS_BOOKED:
                raise ConflictException(f"Seat {seat['seat_number']} is already booked")

        for seat_number in seat_numbers:
            key = f"seat_lock:{event_id}:{seat_number}"
            if not self.redis.set(key, user_id, ex=self.lock_ttl, nx=True):
                raise ConflictException(f"Seat {seat_number} is already locked")

        self.repository.update_status(event_id, seat_numbers, SEAT_STATUS_LOCKED)

    def release_seats(self, event_id: str, seat_numbers: list[str], user_id: str) -> None:
        for seat_number in seat_numbers:
            key = f"seat_lock:{event_id}:{seat_number}"
            owner = self.redis.get(key)
            if owner == user_id:
                self.redis.delete(key)

        self.repository.update_status(event_id, seat_numbers, SEAT_STATUS_AVAILABLE)

    def mark_booked(self, event_id: str, seat_numbers: list[str], user_id: str) -> None:
        for seat_number in seat_numbers:
            key = f"seat_lock:{event_id}:{seat_number}"
            owner = self.redis.get(key)
            if owner != user_id:
                raise ConflictException(f"Seat {seat_number} is not locked by this user")

        self.repository.update_status(event_id, seat_numbers, SEAT_STATUS_BOOKED)

        for seat_number in seat_numbers:
            key = f"seat_lock:{event_id}:{seat_number}"
            self.redis.delete(key)
