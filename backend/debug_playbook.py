import sys
from app.core.database import SessionLocal
from app.services.playbook_engine import generate_playbook

db = SessionLocal()
try:
    generate_playbook(db, "f7a89fc1-73d4-46b4-b5fd-ac749c57e7d7")
    print("DONE")
finally:
    db.close()
