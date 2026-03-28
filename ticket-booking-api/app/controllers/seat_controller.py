from app.schemas.seat_schema import SeatLockRequest, SeatReleaseRequest
from app.services.seat_service import SeatService

service = SeatService()


def list_event_seats(event_id: str) -> list[dict]:
    return service.list_event_seats(event_id)


def lock_seats(payload: SeatLockRequest, user_id: str) -> None:
    service.lock_seats(event_id=payload.event_id, seat_numbers=payload.seat_numbers, user_id=user_id)


def release_seats(payload: SeatReleaseRequest, user_id: str) -> None:
    service.release_seats(event_id=payload.event_id, seat_numbers=payload.seat_numbers, user_id=user_id)
