def test_non_admin_cannot_access_admin_endpoints(client, token_finance):
    headers = {"Authorization": f"Bearer {token_finance}"}
    response = client.get("/admin/stats", headers=headers)
    assert response.status_code == 403

    response = client.get("/admin/audit", headers=headers)
    assert response.status_code == 403

def test_admin_can_access_stats_and_audit(client, token_admin):
    headers = {"Authorization": f"Bearer {token_admin}"}
    stats_res = client.get("/admin/stats", headers=headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_users"] >= 5
    assert stats["total_documents"] >= 6

    audit_res = client.get("/admin/audit", headers=headers)
    assert audit_res.status_code == 200
    assert isinstance(audit_res.json(), list)

def test_conflict_scenario(client, token_marketing):
    headers = {"Authorization": f"Bearer {token_marketing}"}
    response = client.post(
        "/research/query",
        json={"question": "What is the conflict regarding enterprise market share?"},
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "CONFLICT"
    assert "conflict" in data["answer"].lower()
    assert len(data["citations"]) >= 2
