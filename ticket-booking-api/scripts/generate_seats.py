from pymongo import MongoClient

MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "ticket_booking"


def generate_for_event(event_id, total_seats):
    seats = [
        {"event_id": event_id, "seat_number": f"A{i}", "status": "available"}
        for i in range(1, total_seats + 1)
    ]
    return seats


def main() -> None:
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]

    events = list(db.events.find())
    for event in events:
        existing = db.seats.count_documents({"event_id": event["_id"]})
        if existing:
            continue
        seats = generate_for_event(event["_id"], event["total_seats"])
        db.seats.insert_many(seats)

    print("Generated seats for all events")


if __name__ == "__main__":
    main()
