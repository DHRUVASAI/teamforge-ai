import sys
import logging
import time
logging.basicConfig(level=logging.INFO)
import os
sys.path.append(os.getcwd())
from backend.app.core.database import SessionLocal
from backend.app.services.playbook_engine import generate_playbook

db = SessionLocal()
start = time.time()
generate_playbook(db, "8aed4748-84b7-4afe-b91a-2f50336893a5")
print("Time taken:", time.time() - start)
