from datetime import datetime, timedelta

from pymongo import MongoClient

MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "ticket_booking"


def main() -> None:
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]

    events = [
        {
            "title": "Music Concert",
            "venue": "Chennai Arena",
            "date": datetime.utcnow() + timedelta(days=7),
            "organizer_id": None,
            "total_seats": 100,
        },
        {
            "title": "Tech Meetup",
            "venue": "Bangalore Hall",
            "date": datetime.utcnow() + timedelta(days=14),
            "organizer_id": None,
            "total_seats": 80,
        },
    ]

    db.events.insert_many(events)
    print("Seeded events")


if __name__ == "__main__":
    main()
