def test_register_and_login(client):
    # Test Register
    reg_resp = client.post("/api/v1/auth/register", json={
        "name": "Sarah Connor",
        "email": "sarah@example.com",
        "password": "securepassword123"
    })
    assert reg_resp.status_code == 201
    reg_data = reg_resp.json()
    assert "token" in reg_data
    assert reg_data["name"] == "Sarah Connor"
    assert reg_data["email"] == "sarah@example.com"
    token = reg_data["token"]

    # Test Login
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "sarah@example.com",
        "password": "securepassword123"
    })
    assert login_resp.status_code == 200
    assert "token" in login_resp.json()

def test_team_creation_and_member_subscriptions(client):
    # Register Sarah (Leader)
    lead_resp = client.post("/api/v1/auth/register", json={
        "name": "Sarah Connor",
        "email": "sarah@example.com",
        "password": "securepassword123"
    })
    token = lead_resp.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Register Alex (AI Dev)
    alex_resp = client.post("/api/v1/auth/register", json={
        "name": "Alex Rivera",
        "email": "alex@example.com",
        "password": "securepassword123"
    })
    alex_user_id = alex_resp.json()["user_id"]

    # Create Team
    team_resp = client.post("/api/v1/teams", json={"name": "Alpha Architects"}, headers=headers)
    assert team_resp.status_code == 201
    team_data = team_resp.json()
    team_id = team_data["team_id"]
    assert team_data["name"] == "Alpha Architects"
    assert len(team_data["members"]) == 1 # Creator auto-added as leader

    # Add Alex with skills and tool subscriptions
    add_member_resp = client.post(f"/api/v1/teams/{team_id}/members", json={
        "user_id": alex_user_id,
        "role": "ai_assisted",
        "skills": [
            {"name": "Python / FastAPI", "level": "Advanced"},
            {"name": "LLM Integration", "level": "Advanced"}
        ],
        "subscriptions": [
            {"tool_name": "Cursor Pro", "tier": "Pro", "credits": "Unlimited"},
            {"tool_name": "Claude Pro", "tier": "Pro", "credits": "$50 Credits"}
        ]
    }, headers=headers)
    assert add_member_resp.status_code == 201
    member_data = add_member_resp.json()
    assert member_data["role"] == "ai_assisted"
    assert len(member_data["skills"]) == 2
    assert len(member_data["subscriptions"]) == 2
    assert member_data["subscriptions"][0]["tool_name"] == "Cursor Pro"

    # Get Team details
    get_team_resp = client.get(f"/api/v1/teams/{team_id}", headers=headers)
    assert get_team_resp.status_code == 200
    assert len(get_team_resp.json()["members"]) == 2
