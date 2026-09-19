def test_sdlc_and_architecture_decision_engines(client):
    # Setup Auth & Project
    reg_resp = client.post("/api/v1/auth/register", json={
        "name": "Sarah Connor",
        "email": "sarah@example.com",
        "password": "securepassword123"
    })
    token = reg_resp.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    team_resp = client.post("/api/v1/teams", json={"name": "Pioneers"}, headers=headers)
    team_id = team_resp.json()["team_id"]

    proj_resp = client.post("/api/v1/projects", json={
        "team_id": team_id,
        "name": "Rapid Delivery App",
        "problem_statement": "Fast 48-hour sprint requires instant modular architecture.",
        "idea": "An automated testing copilot for web applications.",
        "time_budget": {"value": 48, "unit": "hours"},
        "deliverable_type": "prototype",
        "constraints": ["PostgreSQL"]
    }, headers=headers)
    project_id = proj_resp.json()["project_id"]

    # 1. Test SDLC Decision Engine
    sdlc_resp = client.post(f"/api/v1/projects/{project_id}/sdlc/recommend", headers=headers)
    assert sdlc_resp.status_code == 200
    sdlc_data = sdlc_resp.json()
    assert "Iterative" in sdlc_data["recommended_model"] or "Prototyping" in sdlc_data["recommended_model"]
    assert len(sdlc_data["rejected_alternatives"]) >= 1
    # Verify rejected alternative contains reason
    assert any("reason_rejected" in alt for alt in sdlc_data["rejected_alternatives"])
    assert len(sdlc_data["reasoning"]) > 20

    # 2. Test Architecture Decision Engine
    arch_resp = client.post(f"/api/v1/projects/{project_id}/architecture/recommend", headers=headers)
    assert arch_resp.status_code == 200
    arch_data = arch_resp.json()
    assert arch_data["tier"] == "Modular Monolith"
    assert len(arch_data["components"]) >= 5
    assert len(arch_data["rejected_alternatives"]) >= 1
    assert arch_data["status"] == "recommended"

    # Verify component data ownership
    comp0 = arch_data["components"][0]
    assert "data_ownership" in comp0
    assert "storage" in comp0["data_ownership"]
    assert "schema_tables" in comp0["data_ownership"]

    # 3. Test Data Architecture before accept (should fail with 409)
    data_arch_fail = client.post(f"/api/v1/projects/{project_id}/data-architecture/recommend", headers=headers)
    assert data_arch_fail.status_code == 409

    # 4. Test Architecture Accept Flow
    rec_id = arch_data["recommendation_id"]
    accept_resp = client.post(f"/api/v1/projects/{project_id}/architecture/accept", json={
        "recommendation_id": rec_id
    }, headers=headers)
    assert accept_resp.status_code == 200
    assert accept_resp.json()["status"] == "accepted"

    # 5. Test Data Architecture after accept (should succeed)
    data_arch_resp = client.post(f"/api/v1/projects/{project_id}/data-architecture/recommend", headers=headers)
    assert data_arch_resp.status_code == 200
    assert "ownership_map" in data_arch_resp.json()
    assert len(data_arch_resp.json()["storage_choices"]) >= 1

    # 6. Test Architecture Manual Override (FR-019)
    override_resp = client.post(f"/api/v1/projects/{project_id}/architecture/override", json={
        "tier": "Custom Multi-Tier",
        "components": [
            {
                "id": "comp-custom-api",
                "name": "Custom API Gateway",
                "responsibility": "Unified routing and token validation",
                "data_ownership": {"storage": "PostgreSQL", "schema_tables": ["auth"]}
            },
            {
                "id": "comp-custom-engine",
                "name": "Custom Processing Worker",
                "responsibility": "Background worker queue",
                "data_ownership": {"storage": "PostgreSQL", "schema_tables": ["jobs"]}
            }
        ]
    }, headers=headers)
    assert override_resp.status_code == 200
    override_data = override_resp.json()
    assert override_data["tier"] == "Custom Multi-Tier"
    assert override_data["status"] == "accepted"
    assert len(override_data["components"]) == 2
