from app.schemas.event_schema import EventCreateRequest, EventUpdateRequest
from app.services.event_service import EventService

service = EventService()


def list_events() -> list[dict]:
    return service.list_events()


def create_event(payload: EventCreateRequest, organizer_id: str) -> dict:
    return service.create_event(organizer_id=organizer_id, payload=payload.model_dump())


def update_event(event_id: str, payload: EventUpdateRequest, organizer_id: str) -> dict:
    return service.update_event(event_id=event_id, organizer_id=organizer_id, payload=payload.model_dump(exclude_none=True))


def delete_event(event_id: str, organizer_id: str) -> None:
    service.delete_event(event_id=event_id, organizer_id=organizer_id)
