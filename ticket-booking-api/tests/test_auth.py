from fastapi.testclient import TestClient


def test_health_endpoint(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_me_requires_auth(client: TestClient):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_register_login_me_roundtrip(client: TestClient):
    email = "customer@test.com"
    password = "password123"

    r = client.post("/api/v1/auth/register", json={"email": email, "password": password, "role": "customer"})
    assert r.status_code == 200
    token = r.json()["access_token"]

    me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["email"] == email
    assert me.json()["role"] == "customer"

    login = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert login.status_code == 200
    assert "access_token" in login.json()


def test_register_invalid_role_returns_400(client: TestClient):
    r = client.post(
        "/api/v1/auth/register",
        json={"email": "badrole@test.com", "password": "password123", "role": "nope"},
    )
    assert r.status_code == 400


def test_login_invalid_password_returns_401(client: TestClient):
    client.post("/api/v1/auth/register", json={"email": "u@test.com", "password": "password123", "role": "customer"})
    r = client.post("/api/v1/auth/login", json={"email": "u@test.com", "password": "wrong"})
    assert r.status_code == 401


def test_token_form_endpoint(client: TestClient):
    email = "form@test.com"
    password = "password123"
    client.post("/api/v1/auth/register", json={"email": email, "password": password, "role": "customer"})

    r = client.post(
        "/api/v1/auth/token",
        data={"username": email, "password": password},
        headers={"content-type": "application/x-www-form-urlencoded"},
    )
    assert r.status_code == 200
    assert "access_token" in r.json()
