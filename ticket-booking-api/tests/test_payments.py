from fastapi.testclient import TestClient


def test_payment_process_confirms_booking_and_books_seats(client: TestClient, make_event, make_user):
    created = make_event(total_seats=2, ticket_price=75.0)
    event_id = created["event"]["_id"]
    customer = make_user(email="paycust@test.com", role="customer")

    # Lock seats first (required for payment -> booking seats)
    lock = client.post(
        "/api/v1/seats/lock",
        json={"event_id": event_id, "seat_numbers": ["A1", "A2"]},
        headers=customer["headers"],
    )
    assert lock.status_code == 200

    booking = client.post(
        "/api/v1/bookings",
        json={"event_id": event_id, "seat_numbers": ["A1", "A2"]},
        headers=customer["headers"],
    ).json()
    booking_id = booking["_id"]

    pay = client.post(
        "/api/v1/payments",
        json={"booking_id": booking_id, "amount": 150.0},
        headers=customer["headers"],
    )
    assert pay.status_code == 200
    payment = pay.json()
    assert payment["status"] == "success"
    payment_id = payment["_id"]

    got = client.get(f"/api/v1/payments/{payment_id}", headers=customer["headers"])
    assert got.status_code == 200
    assert got.json()["_id"] == payment_id

    booking_after = client.get(f"/api/v1/bookings/{booking_id}", headers=customer["headers"])
    assert booking_after.status_code == 200
    assert booking_after.json()["status"] == "confirmed"

    seats_after = client.get(f"/api/v1/events/{event_id}/seats", headers=customer["headers"])
    status_by_number = {s["seat_number"]: s["status"] for s in seats_after.json()}
    assert status_by_number["A1"] == "booked"
    assert status_by_number["A2"] == "booked"


def test_payment_amount_validation(client: TestClient, make_user):
    customer = make_user(email="payval@test.com", role="customer")
    r = client.post(
        "/api/v1/payments",
        json={"booking_id": "507f1f77bcf86cd799439011", "amount": 0},
        headers=customer["headers"],
    )
    assert r.status_code == 422


def test_payment_nonexistent_booking_returns_404(client: TestClient, make_user):
    customer = make_user(email="paymissing@test.com", role="customer")
    r = client.post(
        "/api/v1/payments",
        json={"booking_id": "507f1f77bcf86cd799439011", "amount": 10.0},
        headers=customer["headers"],
    )
    assert r.status_code == 404
