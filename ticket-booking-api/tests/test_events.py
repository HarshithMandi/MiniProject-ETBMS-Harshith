from fastapi.testclient import TestClient


def test_create_and_get_event_roundtrip(client: TestClient, make_event):
    created = make_event(total_seats=5, ticket_price=100.0)
    event = created["event"]
    event_id = event.get("_id")
    assert event_id

    fetched = client.get(f"/api/v1/events/{event_id}")
    assert fetched.status_code == 200
    assert fetched.json()["_id"] == event_id


def test_create_event_requires_organizer_role(client: TestClient, make_user):
    customer = make_user(email="customer2@test.com", role="customer")
    payload = {
        "title": "Nope",
        "venue": "VV",
        "date": "2030-01-01T00:00:00Z",
        "total_seats": 2,
        "ticket_price": 50,
        "description": "x",
    }
    r = client.post("/api/v1/events", json=payload, headers=customer["headers"])
    assert r.status_code == 403


def test_list_events_includes_created_event(client: TestClient, make_event):
    created = make_event(title="Listed")
    created_id = created["event"]["_id"]
    r = client.get("/api/v1/events")
    assert r.status_code == 200
    ids = [e.get("_id") for e in r.json()]
    assert created_id in ids


def test_update_and_delete_event_authorization(client: TestClient, make_event, make_user):
    created = make_event(organizer_email="org1@test.com")
    event_id = created["event"]["_id"]
    org1 = created["organizer"]

    org2 = make_user(email="org2@test.com", role="organizer")
    update = client.put(f"/api/v1/events/{event_id}", json={"title": "Hacked"}, headers=org2["headers"])
    assert update.status_code == 403

    ok_update = client.put(f"/api/v1/events/{event_id}", json={"title": "Updated"}, headers=org1["headers"])
    assert ok_update.status_code == 200
    assert ok_update.json()["title"] == "Updated"

    delete = client.delete(f"/api/v1/events/{event_id}", headers=org1["headers"])
    assert delete.status_code == 204

    missing = client.get(f"/api/v1/events/{event_id}")
    assert missing.status_code == 404


def test_event_seats_listing_requires_auth(client: TestClient, make_event):
    created = make_event(total_seats=3)
    event_id = created["event"]["_id"]
    r = client.get(f"/api/v1/events/{event_id}/seats")
    assert r.status_code == 401
