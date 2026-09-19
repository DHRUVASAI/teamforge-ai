from app.core.security import create_access_token
import requests
token = create_access_token({"sub": "21537b0f-4a28-4761-ad49-4db9b4e696a4"})
print(requests.get("http://localhost:8000/api/v1/auth/team", headers={"Authorization": f"Bearer {token}"}).status_code)
