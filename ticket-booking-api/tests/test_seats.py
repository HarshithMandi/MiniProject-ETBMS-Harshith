from fastapi.testclient import TestClient


def test_list_lock_release_seats_flow(client: TestClient, make_event, make_user):
    created = make_event(total_seats=3)
    event_id = created["event"]["_id"]
    customer = make_user(email="seatcust@test.com", role="customer")

    # Initial seat list
    seats = client.get(f"/api/v1/events/{event_id}/seats", headers=customer["headers"])
    assert seats.status_code == 200
    assert len(seats.json()) == 3
    assert {s["seat_number"] for s in seats.json()} == {"A1", "A2", "A3"}

    lock = client.post(
        "/api/v1/seats/lock",
        json={"event_id": event_id, "seat_numbers": ["A1", "A2"]},
        headers=customer["headers"],
    )
    assert lock.status_code == 200

    seats_after_lock = client.get(f"/api/v1/events/{event_id}/seats", headers=customer["headers"])
    assert seats_after_lock.status_code == 200
    status_by_number = {s["seat_number"]: s["status"] for s in seats_after_lock.json()}
    assert status_by_number["A1"] == "locked"
    assert status_by_number["A2"] == "locked"

    # Locking again should conflict
    lock_again = client.post(
        "/api/v1/seats/lock",
        json={"event_id": event_id, "seat_numbers": ["A1"]},
        headers=customer["headers"],
    )
    assert lock_again.status_code == 409

    release = client.post(
        "/api/v1/seats/release",
        json={"event_id": event_id, "seat_numbers": ["A1", "A2"]},
        headers=customer["headers"],
    )
    assert release.status_code == 200

    seats_after_release = client.get(f"/api/v1/events/{event_id}/seats", headers=customer["headers"])
    status_by_number = {s["seat_number"]: s["status"] for s in seats_after_release.json()}
    assert status_by_number["A1"] == "available"
    assert status_by_number["A2"] == "available"
