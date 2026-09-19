def test_task_decomposition_bottlenecks_and_assignments(client):
    # Setup Auth, Team, & Project
    reg_resp = client.post("/api/v1/auth/register", json={
        "name": "Sarah Connor",
        "email": "sarah@example.com",
        "password": "securepassword123"
    })
    token = reg_resp.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    team_resp = client.post("/api/v1/teams", json={"name": "Task Force"}, headers=headers)
    team_id = team_resp.json()["team_id"]

    proj_resp = client.post("/api/v1/projects", json={
        "team_id": team_id,
        "name": "Task Engine Project",
        "problem_statement": "Need structured tasks and bottleneck flags.",
        "idea": "Task engine implementation.",
        "time_budget": {"value": 48, "unit": "hours"},
        "deliverable_type": "prototype"
    }, headers=headers)
    project_id = proj_resp.json()["project_id"]

    # 1. Attempt task decomposition before accepting architecture (must fail 409)
    fail_decomp = client.post(f"/api/v1/projects/{project_id}/tasks/decompose", headers=headers)
    assert fail_decomp.status_code == 409

    # 2. Recommend and Accept Architecture
    arch_resp = client.post(f"/api/v1/projects/{project_id}/architecture/recommend", headers=headers)
    rec_id = arch_resp.json()["recommendation_id"]
    client.post(f"/api/v1/projects/{project_id}/architecture/accept", json={
        "recommendation_id": rec_id
    }, headers=headers)

    # 3. Decompose Tasks
    decomp_resp = client.post(f"/api/v1/projects/{project_id}/tasks/decompose", headers=headers)
    assert decomp_resp.status_code == 200
    decomp_data = decomp_resp.json()
    tasks = decomp_data["tasks"]
    bottlenecks = decomp_data["bottlenecks"]

    assert len(tasks) >= 5
    # Verify task attributes
    task0 = tasks[0]
    assert "id" in task0
    assert "component_name" in task0
    assert "estimated_hours" in task0
    assert "depends_on" in task0

    # Verify Bottlenecks identified
    assert len(bottlenecks) >= 1
    assert bottlenecks[0]["blocked_tasks_count"] >= 2
    assert "suggestion" in bottlenecks[0]

    # 4. Test Task Status Update
    task_id = task0["id"]
    patch_resp = client.patch(f"/api/v1/tasks/{task_id}", json={"status": "in_progress"}, headers=headers)
    assert patch_resp.status_code == 200
    assert patch_resp.json()["status"] == "in_progress"

    # 5. Test Generate Assignments
    assign_resp = client.post(f"/api/v1/projects/{project_id}/assignments/generate", headers=headers)
    assert assign_resp.status_code == 200
    assign_data = assign_resp.json()
    assert assign_data["total_assigned"] == len(tasks)
    assert len(assign_data["assignments"]) > 0
    assert "reasoning" in assign_data["assignments"][0]
