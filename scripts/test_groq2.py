import sys
import os
sys.path.append(os.getcwd())
from backend.app.core.database import SessionLocal
from backend.app.services.playbook_engine import generate_playbook
db = SessionLocal()
pb = generate_playbook(db, "8aed4748-84b7-4afe-b91a-2f50336893a5")
print(pb.stages[0].name)
print(pb.stages[0].description)
