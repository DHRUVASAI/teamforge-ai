def test_multi_ps_evaluation_and_ranking(client):
    # Register & create team
    reg_resp = client.post("/api/v1/auth/register", json={
        "name": "Sarah Connor",
        "email": "sarah_ps@example.com",
        "password": "password123"
    })
    token = reg_resp.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    team_resp = client.post("/api/v1/teams", json={"name": "PS Test Team"}, headers=headers)
    team_id = team_resp.json()["team_id"]

    # Evaluate 3 candidate Problem Statements
    eval_resp = client.post("/api/v1/evaluate-problem-statements", json={
        "team_id": team_id,
        "time_budget_hours": 48,
        "candidate_problem_statements": [
            {
                "id": "ps-1",
                "title": "Decentralized Custom Zero-Knowledge Ledger",
                "problem_statement": "Medical records require custom ZK cryptography and distributed consensus.",
                "proposed_idea": "Build custom blockchain and microkernel from scratch.",
                "target_sponsor_track": "Web3"
            },
            {
                "id": "ps-2",
                "title": "Campus & Tech Event Booking Platform",
                "problem_statement": "Event organizers struggle with ticket overselling and slow check-ins.",
                "proposed_idea": "FastAPI + React event booking platform with real-time seat locks and QR ticket passes.",
                "target_sponsor_track": "Stripe & Vercel"
            },
            {
                "id": "ps-3",
                "title": "Simple Markdown Note Taker",
                "problem_statement": "Users need basic text notes.",
                "proposed_idea": "Basic text note app in browser localStorage."
            }
        ]
    }, headers=headers)
    assert eval_resp.status_code == 200
    eval_data = eval_resp.json()
    
    # Verify Winner is Event Booking (PS-2)
    top_ps = eval_data["top_recommended_ps"]
    assert top_ps["id"] == "ps-2"
    assert top_ps["verdict"] == "WINNER"
    assert "scores" in top_ps
    scores = top_ps["scores"]
    assert scores["skill_fit_score"] > 0
    assert len(scores["skill_fit_explanation"]) > 0
    assert scores["time_feasibility_score"] > 0
    assert len(scores["time_feasibility_explanation"]) > 0
    assert scores["demo_impact_score"] > 0
    assert len(scores["demo_impact_explanation"]) > 0
    assert scores["sponsor_fit_score"] > 0
    assert len(scores["sponsor_fit_explanation"]) > 0
    assert scores["overall_score"] > 0
    assert "30% Skill" in scores["overall_score_calculation"]
    assert "35% Time" in scores["overall_score_calculation"]
    assert "25% Demo" in scores["overall_score_calculation"]
    assert "10% Sponsor" in scores["overall_score_calculation"]
    
    # Verify Overly Complex PS-1 was rejected with honest reason
    ps1_eval = next(item for item in eval_data["ranked_evaluations"] if item["id"] == "ps-1")
    assert ps1_eval["verdict"] == "REJECTED"
    assert len(ps1_eval["risks_and_drawbacks"]) > 0
    assert ps1_eval["scores"]["time_feasibility_score"] < 5.0


def test_team_join_by_code_and_team_hub(client):
    # Lead creates team
    lead_resp = client.post("/api/v1/auth/register", json={
        "name": "Maya Patel",
        "email": "maya_hub@example.com",
        "password": "password123"
    })
    token = lead_resp.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    team_resp = client.post("/api/v1/teams", json={"name": "Hub Innovators"}, headers=headers)
    team_code = team_resp.json()["team_code"]
    team_id = team_resp.json()["team_id"]
    assert team_code.startswith("TEAM-")

    # Second user registers and joins via team_code
    dev_resp = client.post("/api/v1/auth/register", json={
        "name": "Liam Vance",
        "email": "liam_hub@example.com",
        "password": "password123"
    })
    liam_token = dev_resp.json()["token"]
    liam_headers = {"Authorization": f"Bearer {liam_token}"}

    join_resp = client.post("/api/v1/teams/join", json={
        "team_code": team_code,
        "role": "developer",
        "skills": [{"name": "React", "level": "Advanced"}],
        "subscriptions": [{"tool_name": "Figma Pro", "tier": "Pro"}]
    }, headers=liam_headers)
    assert join_resp.status_code == 200
    assert join_resp.json()["role"] == "developer"

    # Create Project and check Team Hub
    proj_resp = client.post("/api/v1/projects", json={
        "team_id": team_id,
        "name": "Hub Test Project",
        "problem_statement": "Testing team hub status.",
        "idea": "Team hub idea.",
        "time_budget": {"value": 48, "unit": "hours"}
    }, headers=headers)
    proj_id = proj_resp.json()["project_id"]

    hub_resp = client.get(f"/api/v1/projects/{proj_id}/team-hub", headers=headers)
    assert hub_resp.status_code == 200
    hub_data = hub_resp.json()
    assert hub_data["total_members"] == 2
    assert len(hub_data["members_status"]) == 2

def test_friendly_transformation_layer_and_eli5_guides(client):
    # Setup team with Lead & Frontend dev
    lead_resp = client.post("/api/v1/auth/register", json={
        "name": "Maya Lead",
        "email": "maya_friendly@example.com",
        "password": "password123"
    })
    headers = {"Authorization": f"Bearer {lead_resp.json()['token']}"}
    
    team_resp = client.post("/api/v1/teams", json={"name": "Friendly Squad"}, headers=headers)
    team_id = team_resp.json()["team_id"]

    proj_resp = client.post("/api/v1/projects", json={
        "team_id": team_id,
        "name": "Campus Event App",
        "problem_statement": "Event booking platform with seat reservation.",
        "idea": "Full event ticketing app with QR code passes.",
        "time_budget": {"value": 6, "unit": "days"},
        "mandatory_platforms": ["Stripe", "Vercel"]
    }, headers=headers)
    proj_id = proj_resp.json()["project_id"]

    # Accept architecture & decompose
    arch_resp = client.post(f"/api/v1/projects/{proj_id}/architecture/recommend", headers=headers)
    client.post(f"/api/v1/projects/{proj_id}/architecture/accept", json={
        "recommendation_id": arch_resp.json()["recommendation_id"]
    }, headers=headers)
    client.post(f"/api/v1/projects/{proj_id}/tasks/decompose", headers=headers)

    # Get Friendly Game Plan
    friendly_resp = client.get(f"/api/v1/projects/{proj_id}/friendly-plan", headers=headers)
    assert friendly_resp.status_code == 200
    friendly_data = friendly_resp.json()
    
    assert "team_cards" in friendly_data
    assert len(friendly_data["team_cards"]) >= 1
    card0 = friendly_data["team_cards"][0]
    assert "friendly_role_title" in card0
    assert "primary_tool_guide" in card0
    assert len(card0["primary_tool_guide"]["step_by_step_instructions"]) >= 3
    assert len(friendly_data["daily_roadmap"]) == 3
    assert len(friendly_data["hackathon_winning_tips"]) >= 1

def test_omniscient_ai_engineer_queries(client):
    lead_resp = client.post("/api/v1/auth/register", json={
        "name": "Sarah Lead",
        "email": "sarah_omniscient@example.com",
        "password": "password123"
    })
    headers = {"Authorization": f"Bearer {lead_resp.json()['token']}"}
    
    team_resp = client.post("/api/v1/teams", json={"name": "AI Brain Team"}, headers=headers)
    team_id = team_resp.json()["team_id"]

    proj_resp = client.post("/api/v1/projects", json={
        "team_id": team_id,
        "name": "Event Ticketing Engine",
        "problem_statement": "Preventing ticket overselling with QR codes.",
        "idea": "Full event copilot.",
        "time_budget": {"value": 48, "unit": "hours"}
    }, headers=headers)
    proj_id = proj_resp.json()["project_id"]

    # 1. Ask cross-teammate connection question (verifies project ID and live URL grounding)
    q_connect = client.post(f"/api/v1/projects/{proj_id}/mentor/ask", json={
        "question": "How do I connect my React frontend button to the backend API?"
    }, headers=headers)
    assert q_connect.status_code == 200
    connect_data = q_connect.json()
    assert f"/api/v1/projects/{proj_id}/tasks" in connect_data["answer"]
    assert "09_API_CONTRACTS.md#L18" in connect_data["sources"]

    # 2. Ask database double-booking concurrency question (verifies schema grounding)
    q_lock = client.post(f"/api/v1/projects/{proj_id}/mentor/ask", json={
        "question": "How do we prevent double-booking seats when two users click at once?"
    }, headers=headers)
    assert q_lock.status_code == 200
    lock_data = q_lock.json()
    assert "with_for_update" in lock_data["answer"]
    assert "06_DATA_ARCHITECTURE.md#L4" in lock_data["sources"]

    # 3. Ask QR ticket generation question (verifies real project ID in URL)
    q_qr = client.post(f"/api/v1/projects/{proj_id}/mentor/ask", json={
        "question": "How do we generate QR code ticket passes for event attendees?"
    }, headers=headers)
    assert q_qr.status_code == 200
    qr_data = q_qr.json()
    assert proj_id in qr_data["answer"]
    assert "qrcode" in qr_data["answer"]

    # 4. Ask Who is doing what / tasks allocation
    q_who = client.post(f"/api/v1/projects/{proj_id}/mentor/ask", json={
        "question": "Who is working on what task right now?"
    }, headers=headers)
    assert q_who.status_code == 200
    who_data = q_who.json()
    assert "Sarah Lead" in who_data["answer"]

