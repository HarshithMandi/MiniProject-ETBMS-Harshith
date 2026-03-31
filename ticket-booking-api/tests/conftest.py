import sys
from pathlib import Path
from typing import Any, Callable
import importlib

import pytest
from fastapi.testclient import TestClient


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


@pytest.fixture(autouse=True)
def _reset_rate_limiter() -> None:
    """Avoid cross-test flakiness from the in-memory rate limiter."""

    from app.middleware import rate_limiter

    rate_limiter._requests.clear()


@pytest.fixture()
def client(monkeypatch: pytest.MonkeyPatch) -> TestClient:
    """FastAPI client using an in-memory MongoDB (mongomock).

    This makes tests self-contained: no local Mongo/Redis required.
    """

    import mongomock

    from app.core import database as db

    mongo_client = mongomock.MongoClient()

    def _connect_to_mongo() -> None:
        db._client = mongo_client

    def _close_mongo_connection() -> None:
        db._client = None

    # Patch the database module (used by repositories).
    monkeypatch.setattr(db, "connect_to_mongo", _connect_to_mongo)
    monkeypatch.setattr(db, "close_mongo_connection", _close_mongo_connection)
    db._client = mongo_client

    # Import app after patching so lifespan uses the patched connect/close.
    import app.main as app_main

    monkeypatch.setattr(app_main, "connect_to_mongo", _connect_to_mongo)
    monkeypatch.setattr(app_main, "close_mongo_connection", _close_mongo_connection)

    # Important: controllers keep service singletons which keep repository singletons.
    # Those repositories cache Mongo collections at init time, so we must recreate
    # them per test to bind to the current in-memory Mongo client.
    from app.controllers import auth_controller, booking_controller, event_controller, payment_controller, seat_controller

    importlib.reload(auth_controller)
    importlib.reload(event_controller)
    importlib.reload(seat_controller)
    importlib.reload(booking_controller)
    importlib.reload(payment_controller)

    # Ensure Redis is never used.
    seat_controller.service.redis = None
    payment_controller.service.seat_service.redis = None

    with TestClient(app_main.app) as test_client:
        yield test_client

    # Clean up between tests.
    mongo_client.drop_database("ticket_booking")
    db._client = None


@pytest.fixture()
def make_user(client: TestClient) -> Callable[..., dict[str, Any]]:
    """Factory fixture to register a user and return {email, password, headers, user}."""

    def _make_user(
        *,
        email: str,
        role: str = "customer",
        password: str = "password123",
    ) -> dict[str, Any]:
        r = client.post(
            "/api/v1/auth/register",
            json={"email": email, "password": password, "role": role},
        )
        if r.status_code == 409:
            r = client.post("/api/v1/auth/login", json={"email": email, "password": password})

        assert r.status_code == 200, r.text
        payload = r.json()
        token = payload["access_token"]
        return {
            "email": email,
            "password": password,
            "headers": {"Authorization": f"Bearer {token}"},
            "user": payload.get("user"),
        }

    return _make_user


@pytest.fixture()
def make_event(client: TestClient, make_user: Callable[..., dict[str, Any]]) -> Callable[..., dict[str, Any]]:
    """Factory fixture to create an event as an organizer."""

    def _make_event(
        *,
        organizer_email: str = "organizer@test.com",
        total_seats: int = 5,
        ticket_price: float = 100.0,
        title: str = "Test Event",
    ) -> dict[str, Any]:
        organizer = make_user(email=organizer_email, role="organizer")
        payload = {
            "title": title,
            "venue": "Test Venue",
            "date": "2030-01-01T00:00:00Z",
            "total_seats": total_seats,
            "ticket_price": ticket_price,
            "description": "Test",
        }
        r = client.post("/api/v1/events", json=payload, headers=organizer["headers"])
        assert r.status_code == 200, r.text
        return {"organizer": organizer, "event": r.json()}

    return _make_event
