from typing import Literal, TypedDict


class SeatModel(TypedDict):
    event_id: str
    seat_number: str
    status: Literal["available", "locked", "booked"]
