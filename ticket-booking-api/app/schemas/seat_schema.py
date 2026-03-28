from pydantic import BaseModel


class SeatResponse(BaseModel):
    id: str
    event_id: str
    seat_number: str
    status: str


class SeatLockRequest(BaseModel):
    event_id: str
    seat_numbers: list[str]


class SeatReleaseRequest(BaseModel):
    event_id: str
    seat_numbers: list[str]
