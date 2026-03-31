from typing import Literal, TypedDict


class BookingModel(TypedDict):
    user_id: str
    event_id: str
    seat_numbers: list[str]
    total_price: float
    status: Literal["pending", "confirmed", "cancelled"]
    created_at: str
