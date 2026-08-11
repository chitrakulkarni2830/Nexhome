import pytest

@pytest.fixture
def auth_token(client):
    client.post(
        "/api/auth/register",
        json={"name": "Test User", "email": "test@example.com", "password": "password123"}
    )
    response = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "password123"}
    )
    return response.json()["access_token"]

def test_create_device(client, auth_token):
    response = client.post(
        "/api/devices/",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={"name": "Living Room Light", "type": "light"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Living Room Light"
    assert data["type"] == "light"
    assert data["is_on"] is False

def test_get_devices(client, auth_token):
    client.post(
        "/api/devices/",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={"name": "Living Room Light", "type": "light"}
    )
    
    response = client.get(
        "/api/devices/",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Living Room Light"

def test_update_device(client, auth_token):
    create_res = client.post(
        "/api/devices/",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={"name": "Living Room Light", "type": "light"}
    )
    device_id = create_res.json()["id"]
    
    update_res = client.patch(
        f"/api/devices/{device_id}",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={"is_on": True, "state_value": "100%"}
    )
    assert update_res.status_code == 200
    data = update_res.json()
    assert data["is_on"] is True
    assert data["state_value"] == "100%"
