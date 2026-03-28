from datetime import datetime

from pydantic import BaseModel, Field


class EventCreateRequest(BaseModel):
    title: str = Field(min_length=2)
    venue: str = Field(min_length=2)
    date: datetime
    total_seats: int = Field(gt=0)


class EventUpdateRequest(BaseModel):
    title: str | None = None
    venue: str | None = None
    date: datetime | None = None
    total_seats: int | None = Field(default=None, gt=0)


class EventResponse(BaseModel):
    id: str
    title: str
    venue: str
    date: str
    organizer_id: str
    total_seats: int
