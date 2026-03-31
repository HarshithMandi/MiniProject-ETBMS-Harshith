from typing import Any

from bson import ObjectId

from app.exceptions.custom_exceptions import ForbiddenException, NotFoundException
from app.repositories.event_repository import EventRepository
from app.repositories.seat_repository import SeatRepository
from app.utils.constants import SEAT_STATUS_AVAILABLE
from app.utils.helpers import serialize_mongo


class EventService:
    def __init__(self) -> None:
        self.event_repository = EventRepository()
        self.seat_repository = SeatRepository()

    def list_events(self) -> list[dict[str, Any]]:
        events: list[dict[str, Any]] = []
        for event in self.event_repository.list_events():
            parsed = serialize_mongo(event)
            if parsed is not None:
                events.append(parsed)
        return events

    def get_event(self, event_id: str) -> dict[str, Any]:
        event = self.event_repository.get_by_id(event_id)
        if not event:
            raise NotFoundException("Event not found")
        parsed = serialize_mongo(event)
        if parsed is None:
            raise NotFoundException("Event not found")
        return parsed

    def create_event(self, organizer_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        event_payload = {
            **payload,
            "organizer_id": ObjectId(organizer_id),
        }
        event = self.event_repository.create_event(event_payload)
        if event is None:
            raise NotFoundException("Event creation failed")

        total_seats = int(payload["total_seats"])
        seats = [
            {
                "event_id": event["_id"],
                "seat_number": f"A{i}",
                "status": SEAT_STATUS_AVAILABLE,
            }
            for i in range(1, total_seats + 1)
        ]
        self.seat_repository.create_many(seats)
        parsed = serialize_mongo(event)
        if parsed is None:
            raise NotFoundException("Event creation failed")
        return parsed

    def update_event(self, event_id: str, organizer_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        event = self.event_repository.get_by_id(event_id)
        if not event:
            raise NotFoundException("Event not found")
        if str(event["organizer_id"]) != organizer_id:
            raise ForbiddenException("Only the event organizer can update this event")

        updated = self.event_repository.update_event(event_id, payload)
        parsed = serialize_mongo(updated)
        if parsed is None:
            raise NotFoundException("Event not found")
        return parsed

    def delete_event(self, event_id: str, organizer_id: str) -> None:
        event = self.event_repository.get_by_id(event_id)
        if not event:
            raise NotFoundException("Event not found")
        if str(event["organizer_id"]) != organizer_id:
            raise ForbiddenException("Only the event organizer can delete this event")

        deleted = self.event_repository.delete_event(event_id)
        if not deleted:
            raise NotFoundException("Event not found")
