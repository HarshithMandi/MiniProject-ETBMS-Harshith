from fastapi import APIRouter, Depends, Response, status

from app.controllers import event_controller
from app.core.dependencies import get_current_user, require_roles
from app.schemas.event_schema import EventCreateRequest, EventUpdateRequest

router = APIRouter(prefix="/events", tags=["Events"])


@router.get("")
def list_events() -> list[dict]:
    return event_controller.list_events()


@router.post("")
def create_event(payload: EventCreateRequest, current_user: dict = Depends(require_roles("organizer"))) -> dict:
    return event_controller.create_event(payload=payload, organizer_id=current_user["_id"])


@router.put("/{event_id}")
def update_event(
    event_id: str,
    payload: EventUpdateRequest,
    current_user: dict = Depends(require_roles("organizer")),
) -> dict:
    return event_controller.update_event(event_id=event_id, payload=payload, organizer_id=current_user["_id"])


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event_id: str, current_user: dict = Depends(require_roles("organizer"))) -> Response:
    event_controller.delete_event(event_id=event_id, organizer_id=current_user["_id"])
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{event_id}/seats")
def list_seats(event_id: str, _: dict = Depends(get_current_user)) -> list[dict]:
    from app.controllers import seat_controller

    return seat_controller.list_event_seats(event_id)
