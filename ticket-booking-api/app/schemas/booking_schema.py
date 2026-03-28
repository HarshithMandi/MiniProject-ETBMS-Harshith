from pydantic import BaseModel, Field


class BookingCreateRequest(BaseModel):
    event_id: str
    seat_numbers: list[str] = Field(min_length=1)


class BookingResponse(BaseModel):
    id: str
    user_id: str
    event_id: str
    seat_numbers: list[str]
    status: str
    created_at: str


class BookingStatusResponse(BaseModel):
    id: str
    status: str
