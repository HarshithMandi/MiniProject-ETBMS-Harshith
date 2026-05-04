from typing import Any

try:
    from redis import Redis
    from redis.exceptions import RedisError
except ImportError:  # pragma: no cover
    Redis = None  # type: ignore[assignment]
    RedisError = Exception  # type: ignore[misc,assignment]

from app.core.config import get_settings
from app.exceptions.custom_exceptions import ConflictException, NotFoundException
from app.repositories.seat_repository import SeatRepository
from app.utils.constants import SEAT_STATUS_AVAILABLE, SEAT_STATUS_BOOKED, SEAT_STATUS_LOCKED
from app.utils.helpers import serialize_mongo


class SeatService:
    def __init__(self) -> None:
        settings = get_settings()
        self.redis = None
        if settings.redis_enabled and Redis is not None:
            self.redis = Redis(
                host=settings.redis_host,
                port=settings.redis_port,
                db=settings.redis_db,
                decode_responses=True,
                socket_connect_timeout=1,
                socket_timeout=1,
            )
        self.lock_ttl = settings.seat_lock_ttl_seconds
        self.repository = SeatRepository()

    def _lock_key(self, event_id: str, seat_number: str) -> str:
        return f"seat_lock:{event_id}:{seat_number}"

    def _try_acquire_locks(self, event_id: str, seat_numbers: list[str], user_id: str) -> bool:
        if self.redis is None:
            return True
        keys = [self._lock_key(event_id, seat_number) for seat_number in seat_numbers]
        if not keys:
            return True

        # Atomic all-or-nothing lock acquisition to avoid partial locks when one seat
        # in the batch is already locked.
        script = """
        for i = 1, #KEYS do
            if redis.call('exists', KEYS[i]) == 1 then
                return 0
            end
        end
        for i = 1, #KEYS do
            redis.call('set', KEYS[i], ARGV[1], 'EX', ARGV[2], 'NX')
        end
        return 1
        """
        result = self.redis.eval(script, len(keys), *keys, user_id, int(self.lock_ttl))
        return bool(result)

    def _reconcile_stale_db_locks(self, event_id: str, seat_numbers: list[str], seats: list[dict[str, Any]]) -> None:
        """If Redis TTL expired but DB still shows LOCKED, revert DB to AVAILABLE.

        This prevents seats from being stuck in LOCKED state forever.
        """

        if self.redis is None:
            return

        locked = [seat for seat in seats if seat.get("status") == SEAT_STATUS_LOCKED]
        if not locked:
            return

        key_by_seat: dict[str, str] = {seat["seat_number"]: self._lock_key(event_id, seat["seat_number"]) for seat in locked}
        try:
            owners = self.redis.mget(list(key_by_seat.values()))
        except RedisError:
            return

        stale_numbers: list[str] = []
        for (seat_number, _), owner in zip(key_by_seat.items(), owners):
            if owner is None:
                stale_numbers.append(seat_number)

        if stale_numbers:
            self.repository.update_status(event_id, stale_numbers, SEAT_STATUS_AVAILABLE)
            for seat in seats:
                if seat.get("seat_number") in stale_numbers:
                    seat["status"] = SEAT_STATUS_AVAILABLE

    def _ensure_seats_can_lock(self, event_id: str, seat_numbers: list[str]) -> list[dict[str, Any]]:
        seats = self.repository.list_by_event_and_numbers(event_id, seat_numbers)
        if len(seats) != len(seat_numbers):
            raise NotFoundException("Some seats do not exist")

        # If Redis is enabled, reconcile DB status for locks that have expired in Redis.
        self._reconcile_stale_db_locks(event_id, seat_numbers, seats)

        for seat in seats:
            if seat["status"] == SEAT_STATUS_BOOKED:
                raise ConflictException(f"Seat {seat['seat_number']} is already booked")
            if seat["status"] == SEAT_STATUS_LOCKED:
                raise ConflictException(f"Seat {seat['seat_number']} is already locked")

        return seats

    def _ensure_seats_can_book(self, event_id: str, seat_numbers: list[str]) -> list[dict[str, Any]]:
        seats = self.repository.list_by_event_and_numbers(event_id, seat_numbers)
        if len(seats) != len(seat_numbers):
            raise NotFoundException("Some seats do not exist")

        for seat in seats:
            if seat["status"] == SEAT_STATUS_BOOKED:
                raise ConflictException(f"Seat {seat['seat_number']} is already booked")
            if seat["status"] != SEAT_STATUS_LOCKED:
                raise ConflictException(f"Seat {seat['seat_number']} is not locked")

        return seats

    def list_event_seats(self, event_id: str) -> list[dict[str, Any]]:
        # List from DB for fast sorting, but reconcile stale locks when Redis TTL expires.
        seats: list[dict[str, Any]] = []

        raw_seats = self.repository.list_by_event(event_id)
        if self.redis is not None:
            self._reconcile_stale_db_locks(event_id, [], raw_seats)

        for seat in raw_seats:
            parsed = serialize_mongo(seat)
            if parsed is not None:
                seats.append(parsed)
        return seats

    def lock_seats(self, event_id: str, seat_numbers: list[str], user_id: str) -> None:
        self._ensure_seats_can_lock(event_id, seat_numbers)

        if self.redis is None:
            self.repository.update_status(event_id, seat_numbers, SEAT_STATUS_LOCKED)
            return

        try:
            if not self._try_acquire_locks(event_id, seat_numbers, user_id):
                raise ConflictException("One or more seats are already locked")
            self.repository.update_status(event_id, seat_numbers, SEAT_STATUS_LOCKED)
        except RedisError:
            # Redis unavailable: fall back to DB-only locking for local/dev environments.
            self.repository.update_status(event_id, seat_numbers, SEAT_STATUS_LOCKED)

    def release_seats(self, event_id: str, seat_numbers: list[str], user_id: str) -> None:
        if self.redis is not None:
            try:
                keys = [self._lock_key(event_id, seat_number) for seat_number in seat_numbers]
                owners = self.redis.mget(keys)

                for seat_number, owner in zip(seat_numbers, owners):
                    if owner is None:
                        continue
                    if owner != user_id:
                        raise ConflictException(f"Seat {seat_number} is not locked by this user")

                for key, owner in zip(keys, owners):
                    if owner == user_id:
                        self.redis.delete(key)
            except RedisError:
                pass

        self.repository.update_status(event_id, seat_numbers, SEAT_STATUS_AVAILABLE)

    def mark_booked(self, event_id: str, seat_numbers: list[str], user_id: str) -> None:
        # Without Redis, we can't validate lock ownership; we still enforce that seats
        # are in LOCKED state to prevent booking an AVAILABLE/BOOKED seat.
        self._ensure_seats_can_book(event_id, seat_numbers)

        if self.redis is not None:
            try:
                keys = [self._lock_key(event_id, seat_number) for seat_number in seat_numbers]
                owners = self.redis.mget(keys)

                # If any lock expired in Redis, revert DB and fail fast.
                expired_numbers = [seat_number for seat_number, owner in zip(seat_numbers, owners) if owner is None]
                if expired_numbers:
                    self.repository.update_status(event_id, expired_numbers, SEAT_STATUS_AVAILABLE)
                    raise ConflictException(f"Seat {expired_numbers[0]} lock expired")

                for seat_number, owner in zip(seat_numbers, owners):
                    if owner != user_id:
                        raise ConflictException(f"Seat {seat_number} is not locked by this user")
            except RedisError:
                # Redis unavailable: skip ownership check.
                pass

        self.repository.update_status(event_id, seat_numbers, SEAT_STATUS_BOOKED)

        if self.redis is not None:
            try:
                for seat_number in seat_numbers:
                    key = self._lock_key(event_id, seat_number)
                    self.redis.delete(key)
            except RedisError:
                pass
