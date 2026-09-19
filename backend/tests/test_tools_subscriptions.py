def test_tool_catalog_and_subscription_priority(client):
    # Setup Auth, Team, & Member with Active Subscription
    reg_resp = client.post("/api/v1/auth/register", json={
        "name": "Sarah Connor",
        "email": "sarah@example.com",
        "password": "securepassword123"
    })
    token = reg_resp.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    alex_resp = client.post("/api/v1/auth/register", json={
        "name": "Alex Rivera",
        "email": "alex@example.com",
        "password": "securepassword123"
    })
    alex_id = alex_resp.json()["user_id"]

    team_resp = client.post("/api/v1/teams", json={"name": "Tool Innovators"}, headers=headers)
    team_id = team_resp.json()["team_id"]

    client.post(f"/api/v1/teams/{team_id}/members", json={
        "user_id": alex_id,
        "role": "ai_assisted",
        "skills": [{"name": "Python", "level": "Advanced"}],
        "subscriptions": [
            {"tool_name": "Cursor Pro", "tier": "Pro", "credits": "Unlimited"}
        ]
    }, headers=headers)

    # 1. Test Tool Catalog Listing
    cat_resp = client.get("/api/v1/tool-catalog")
    assert cat_resp.status_code == 200
    catalog = cat_resp.json()
    assert len(catalog) >= 5
    cat_names = [c["tool_name"] for c in catalog]
    assert any("FastAPI" in name for name in cat_names)
    assert any("PostgreSQL" in name for name in cat_names)

    # 2. Setup Project & Decompose Tasks
    proj_resp = client.post("/api/v1/projects", json={
        "team_id": team_id,
        "name": "Tool Test Project",
        "problem_statement": "Need tool recommendations for tasks.",
        "idea": "Tool test idea.",
        "time_budget": {"value": 48, "unit": "hours"}
    }, headers=headers)
    project_id = proj_resp.json()["project_id"]

    arch_resp = client.post(f"/api/v1/projects/{project_id}/architecture/recommend", headers=headers)
    client.post(f"/api/v1/projects/{project_id}/architecture/accept", json={
        "recommendation_id": arch_resp.json()["recommendation_id"]
    }, headers=headers)

    decomp_resp = client.post(f"/api/v1/projects/{project_id}/tasks/decompose", headers=headers)
    tasks = decomp_resp.json()["tasks"]
    assert len(tasks) > 0

    # 3. Recommend Tools for a Task
    task_id = tasks[0]["id"]
    tool_rec_resp = client.post(f"/api/v1/tasks/{task_id}/tools/recommend", headers=headers)
    assert tool_rec_resp.status_code == 200
    tool_rec_data = tool_rec_resp.json()

    assert "recommended_tools" in tool_rec_data
    assert "rejected_tools" in tool_rec_data
    assert len(tool_rec_data["recommended_tools"]) >= 1
    # Verify rejected tools contain reasons
    if tool_rec_data["rejected_tools"]:
        assert "reason_rejected" in tool_rec_data["rejected_tools"][0]
