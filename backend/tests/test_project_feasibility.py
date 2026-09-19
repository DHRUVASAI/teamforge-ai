def test_project_crud_and_feasibility_analysis(client):
    # Register & Auth
    reg_resp = client.post("/api/v1/auth/register", json={
        "name": "Sarah Connor",
        "email": "sarah@example.com",
        "password": "securepassword123"
    })
    token = reg_resp.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create Team
    team_resp = client.post("/api/v1/teams", json={"name": "Dev Squad"}, headers=headers)
    team_id = team_resp.json()["team_id"]

    # Create Project
    proj_resp = client.post("/api/v1/projects", json={
        "team_id": team_id,
        "name": "TeamForge Prototype",
        "problem_statement": "Engineering teams waste critical hackathon sprint time debating architectures without automated feasibility analysis.",
        "idea": "An autonomous engineering orchestration engine that analyzes requirements and suggests optimal SDLC, modular monolith architecture, and task DAGs.",
        "time_budget": {"value": 48, "unit": "hours"},
        "deliverable_type": "prototype",
        "constraints": ["PostgreSQL", "FastAPI"]
    }, headers=headers)
    assert proj_resp.status_code == 201
    proj_data = proj_resp.json()
    project_id = proj_data["project_id"]
    assert proj_data["name"] == "TeamForge Prototype"
    assert proj_data["status"] == "draft"

    # Analyze Project Feasibility
    analysis_resp = client.post(f"/api/v1/projects/{project_id}/analyze", headers=headers)
    assert analysis_resp.status_code == 200
    analysis_data = analysis_resp.json()

    # Verify Capabilities Extracted
    assert len(analysis_data["capabilities"]) >= 5
    cap_names = [c["name"] for c in analysis_data["capabilities"]]
    assert any("SDLC & Architecture" in name for name in cap_names)

    # Verify Feasibility Evaluation
    feasibility = analysis_data["feasibility"]
    assert feasibility["verdict"] in ["feasible", "feasible_with_adjustments", "scope_exceeded"]
    assert feasibility["score"] > 0
    assert feasibility["available_team_capacity_hours"] > 0
    assert len(feasibility["reasoning"]) > 10

    # Verify Project status updated
    get_proj_resp = client.get(f"/api/v1/projects/{project_id}", headers=headers)
    assert get_proj_resp.status_code == 200
    assert get_proj_resp.json()["status"] == "analyzed"
