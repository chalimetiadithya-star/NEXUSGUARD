def test_scenario_a_authorized_finance_user(client, token_finance):
    """
    Scenario A: Finance user U102 asks about Q4 revenue forecast.
    Expected: Authorized to DOC-101, receives 120 crore, cited to DOC-101, status SUCCESS.
    """
    headers = {"Authorization": f"Bearer {token_finance}"}
    response = client.post(
        "/research/query",
        json={"question": "What is the current Q4 revenue forecast?"},
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert "120 crore" in data["answer"] or "120" in data["answer"]
    cited_ids = [c["document_id"] for c in data["citations"]]
    assert "DOC-101" in cited_ids

def test_scenario_b_relevant_but_unauthorized_marketing(client, token_marketing, token_admin):
    """
    Scenario B: Marketing user U205 asks about Q4 revenue forecast.
    Expected:
      - Retriever finds candidates (including DOC-201)
      - Authorization DENIES access to DOC-201 and DOC-101
      - Content of DOC-201 (145 crore) NEVER reaches the LLM or user response
      - Safe NO_AUTHORIZED_EVIDENCE returned
      - Security Inspector trace proves DOC-201 was candidate, blocked by PolicyEngine, and omitted from LLM evidence!
    """
    headers = {"Authorization": f"Bearer {token_marketing}"}
    response = client.post(
        "/research/query",
        json={"question": "What is the Q4 revenue forecast?"},
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "NO_AUTHORIZED_EVIDENCE"
    assert "145" not in data["answer"]
    assert "DOC-201" not in data["answer"]
    assert len(data["citations"]) == 0

    # Verify audit trace via Admin Inspector
    req_id = data["request_id"]
    admin_headers = {"Authorization": f"Bearer {token_admin}"}
    trace_res = client.get(f"/admin/requests/{req_id}/trace", headers=admin_headers)
    assert trace_res.status_code == 200
    trace = trace_res.json()

    # Assert DOC-201 was evaluated as candidate
    assert "DOC-201" in trace["candidate_ids"]
    # Assert DOC-201 was blocked by PolicyEngine
    doc_201_decision = next((d for d in trace["authorization_decisions"] if d["document_id"] == "DOC-201"), None)
    assert doc_201_decision is not None
    assert doc_201_decision["allowed"] is False
    # CRITICAL INVARIANT: DOC-201 NEVER entered LLM evidence!
    assert "DOC-201" not in trace["llm_evidence_ids"]
    assert len(trace["llm_evidence_ids"]) == 0

def test_scenario_c_version_resolution_finance(client, token_version_finance):
    """
    Scenario C: Finance user U301 asks for latest Q4 forecast.
    Expected:
      - Both DOC-301 (v1.0, 110 crore) and DOC-302 (v2.0, 125 crore) are authorized
      - VersionResolver resolves lineage Q4_FORECAST and chooses latest DOC-302 (v2.0)
      - Returns 125 crore with citation to DOC-302
    """
    headers = {"Authorization": f"Bearer {token_version_finance}"}
    response = client.post(
        "/research/query",
        json={"question": "What is the latest Q4 forecast?"},
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert "125 crore" in data["answer"] or "125" in data["answer"]
    cited_ids = [c["document_id"] for c in data["citations"]]
    assert "DOC-302" in cited_ids
    # DOC-301 is superseded, so should not be in the primary citations
    assert "DOC-301" not in cited_ids

def test_executive_authorized_for_restricted(client, token_executive):
    """
    Executive user U401 is authorized to view Restricted executive documents.
    """
    headers = {"Authorization": f"Bearer {token_executive}"}
    response = client.post(
        "/research/query",
        json={"question": "What is the Q4 revenue forecast?"},
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert "145 crore" in data["answer"] or "145" in data["answer"]
    cited_ids = [c["document_id"] for c in data["citations"]]
    assert "DOC-201" in cited_ids
