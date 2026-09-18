def test_unauthenticated_request_rejected(client):
    response = client.post("/research/query", json={"question": "What is our Q4 forecast?"})
    assert response.status_code == 403 or response.status_code == 401

def test_login_success(client):
    response = client.post("/auth/login", json={"username": "U102", "password": "password123"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["employee_id"] == "U102"
    assert data["user"]["department"] == "Finance"
    assert data["user"]["role"] == "Finance"

def test_login_invalid_password(client):
    response = client.post("/auth/login", json={"username": "U102", "password": "wrongpassword"})
    assert response.status_code == 401

def test_identity_tampering_ignored(client, token_marketing):
    # Attacker tries to inject role="Executive" and clearance="Restricted" in the payload
    headers = {"Authorization": f"Bearer {token_marketing}"}
    payload = {
        "question": "What is our Q4 revenue forecast?",
        "role": "Executive",
        "clearance": "Restricted",
        "employee_id": "U401"
    }
    response = client.post("/research/query", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    # Backend derives identity strictly from JWT; Marketing user must still be denied DOC-201!
    assert data["status"] == "NO_AUTHORIZED_EVIDENCE"
    assert "145" not in data["answer"]
