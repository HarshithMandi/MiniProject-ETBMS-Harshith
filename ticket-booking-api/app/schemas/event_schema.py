from datetime import datetime

from pydantic import BaseModel, Field


class EventCreateRequest(BaseModel):
    title: str = Field(min_length=2)
    venue: str = Field(min_length=2)
    date: datetime
    total_seats: int = Field(gt=0)
    ticket_price: float = Field(default=500, gt=0)
    description: str | None = None


class EventUpdateRequest(BaseModel):
    title: str | None = None
    venue: str | None = None
    date: datetime | None = None
    total_seats: int | None = Field(default=None, gt=0)
    ticket_price: float | None = Field(default=None, gt=0)
    description: str | None = None


class EventResponse(BaseModel):
    id: str
    title: str
    venue: str
    date: str
    organizer_id: str
    total_seats: int
    ticket_price: float
    description: str | None = None
