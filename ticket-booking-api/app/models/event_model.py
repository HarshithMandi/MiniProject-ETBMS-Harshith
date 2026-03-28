from typing import TypedDict


class EventModel(TypedDict):
    title: str
    venue: str
    date: str
    organizer_id: str
    total_seats: int
