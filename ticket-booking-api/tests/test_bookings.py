from fastapi.testclient import TestClient


def test_booking_crud_like_flow(client: TestClient, make_event, make_user):
    created = make_event(total_seats=4, ticket_price=120.0)
    event_id = created["event"]["_id"]
    customer = make_user(email="bookcust@test.com", role="customer")

    create = client.post(
        "/api/v1/bookings",
        json={"event_id": event_id, "seat_numbers": ["A1", "A2"]},
        headers=customer["headers"],
    )
    assert create.status_code == 200
    booking = create.json()
    booking_id = booking.get("_id")
    assert booking_id
    assert booking["status"] == "pending"
    assert booking["total_price"] == 240.0

    mine = client.get("/api/v1/bookings/my", headers=customer["headers"])
    assert mine.status_code == 200
    assert any(b.get("_id") == booking_id for b in mine.json())

    fetched = client.get(f"/api/v1/bookings/{booking_id}", headers=customer["headers"])
    assert fetched.status_code == 200
    assert fetched.json()["_id"] == booking_id
    assert fetched.json().get("event") is not None

    confirm = client.put(f"/api/v1/bookings/{booking_id}/confirm", headers=customer["headers"])
    assert confirm.status_code == 200
    assert confirm.json()["status"] == "confirmed"

    cancel = client.delete(f"/api/v1/bookings/{booking_id}", headers=customer["headers"])
    assert cancel.status_code == 204

    after_cancel = client.get(f"/api/v1/bookings/{booking_id}", headers=customer["headers"])
    assert after_cancel.status_code == 200
    assert after_cancel.json()["status"] == "cancelled"


def test_booking_cannot_be_accessed_by_other_user(client: TestClient, make_event, make_user):
    created = make_event(total_seats=2)
    event_id = created["event"]["_id"]
    customer1 = make_user(email="c1@test.com", role="customer")
    customer2 = make_user(email="c2@test.com", role="customer")

    create = client.post(
        "/api/v1/bookings",
        json={"event_id": event_id, "seat_numbers": ["A1"]},
        headers=customer1["headers"],
    )
    booking_id = create.json()["_id"]

    other_get = client.get(f"/api/v1/bookings/{booking_id}", headers=customer2["headers"])
    assert other_get.status_code == 403
