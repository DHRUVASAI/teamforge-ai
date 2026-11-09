"""
One-shot SQLite migration: add ai_accelerators_json + bespoke_rationale
to architecture_recommendations table (idempotent).
"""
import sqlite3, os, sys

DB_PATH = os.path.join(os.path.dirname(__file__), "teamforge.db")
if not os.path.exists(DB_PATH):
    print(f"DB not found at {DB_PATH} — skipping migration (tests use in-memory DB).")
    sys.exit(0)

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

# Fetch existing columns
cur.execute("PRAGMA table_info(architecture_recommendations)")
existing = {row[1] for row in cur.fetchall()}

if "ai_accelerators_json" not in existing:
    cur.execute("ALTER TABLE architecture_recommendations ADD COLUMN ai_accelerators_json TEXT DEFAULT '[]'")
    print("Added column: ai_accelerators_json")

if "bespoke_rationale" not in existing:
    cur.execute("ALTER TABLE architecture_recommendations ADD COLUMN bespoke_rationale TEXT DEFAULT NULL")
    print("Added column: bespoke_rationale")

conn.commit()
conn.close()
print("Migration complete.")
