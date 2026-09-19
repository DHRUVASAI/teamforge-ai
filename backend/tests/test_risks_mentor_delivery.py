def test_risks_mentor_and_delivery_artifacts(client):
    # Setup Auth, Team, & Project
    reg_resp = client.post("/api/v1/auth/register", json={
        "name": "Sarah Connor",
        "email": "sarah@example.com",
        "password": "securepassword123"
    })
    token = reg_resp.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    team_resp = client.post("/api/v1/teams", json={"name": "EndToEnd Team"}, headers=headers)
    team_id = team_resp.json()["team_id"]

    proj_resp = client.post("/api/v1/projects", json={
        "team_id": team_id,
        "name": "Full Lifecycle Project",
        "problem_statement": "Complete software engineering lifecycle automation.",
        "idea": "Full lifecycle copilot.",
        "time_budget": {"value": 48, "unit": "hours"}
    }, headers=headers)
    project_id = proj_resp.json()["project_id"]

    # 1. Test Risk Evaluation & Status Patch
    risks_resp = client.post(f"/api/v1/projects/{project_id}/risks/evaluate", headers=headers)
    assert risks_resp.status_code == 200
    risks = risks_resp.json()
    assert len(risks) >= 3
    risk0 = risks[0]
    assert "score" in risk0
    assert "mitigation" in risk0
    assert "severity" in risk0

    # Patch Risk
    risk_id = risk0["id"]
    patch_risk = client.patch(f"/api/v1/projects/{project_id}/risks/{risk_id}", json={
        "status": "Mitigated",
        "mitigation": "Automated deterministic validation rule enforced."
    }, headers=headers)
    assert patch_risk.status_code == 200
    assert patch_risk.json()["status"] == "Mitigated"

    # 2. Test Mentor Free-form Ask
    mentor_resp = client.post(f"/api/v1/projects/{project_id}/mentor/ask", json={
        "question": "Why did you choose a Modular Monolith architecture instead of Microservices?"
    }, headers=headers)
    assert mentor_resp.status_code == 200
    mentor_data = mentor_resp.json()
    assert "Monolith" in mentor_data["answer"] or "architecture" in mentor_data["answer"].lower()
    assert len(mentor_data["sources"]) > 0

    # 3. Test SDLC Recommendation & "Why?" Explainability Query Resolver
    sdlc_resp = client.post(f"/api/v1/projects/{project_id}/sdlc/recommend", headers=headers)
    sdlc_id = sdlc_resp.json()["recommendation_id"]

    why_resp = client.get(f"/api/v1/recommendations/{sdlc_id}/why", headers=headers)
    assert why_resp.status_code == 200
    why_data = why_resp.json()
    assert why_data["recommendation_type"] == "SDLC"
    assert len(why_data["inputs_used"]) > 0
    assert len(why_data["rejected_alternatives"]) > 0

    # 4. Test Proactive Guidance
    guidance_resp = client.get(f"/api/v1/projects/{project_id}/mentor/guidance", headers=headers)
    assert guidance_resp.status_code == 200
    assert len(guidance_resp.json()["flags"]) > 0

    # 5. Accept Architecture and Decompose Tasks
    arch_resp = client.post(f"/api/v1/projects/{project_id}/architecture/recommend", headers=headers)
    client.post(f"/api/v1/projects/{project_id}/architecture/accept", json={
        "recommendation_id": arch_resp.json()["recommendation_id"]
    }, headers=headers)
    client.post(f"/api/v1/projects/{project_id}/tasks/decompose", headers=headers)

    # 6. Test GitHub Task Sync Simulation
    gh_link_resp = client.post(f"/api/v1/projects/{project_id}/github/link", json={
        "repo_url": "https://github.com/teamforge-demo/full-lifecycle-project"
    }, headers=headers)
    assert gh_link_resp.status_code == 200
    assert gh_link_resp.json()["status"] == "connected"

    sync_resp = client.post(f"/api/v1/projects/{project_id}/github/sync-tasks", headers=headers)
    assert sync_resp.status_code == 200
    sync_data = sync_resp.json()
    assert len(sync_data["synced_issues"]) >= 5
    assert "issues/1" in sync_data["synced_issues"][0]["issue_url"]

    # 7. Test Architecture README & Pitch Deck Generation
    readme_resp = client.post(f"/api/v1/projects/{project_id}/artifacts/readme", headers=headers)
    assert readme_resp.status_code == 200
    readme_data = readme_resp.json()
    assert "Architecture" in readme_data["title"]
    assert "# Full Lifecycle Project" in readme_data["content"]

    pitch_resp = client.post(f"/api/v1/projects/{project_id}/artifacts/pitch", headers=headers)
    assert pitch_resp.status_code == 200
    pitch_data = pitch_resp.json()
    assert "Pitch Deck" in pitch_data["title"]
    assert "Slide 1" in pitch_data["content"]
