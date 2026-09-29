import time
import sys

def out(prefix, p_color, text, t_color="97", delay=0.015):
    sys.stdout.write(f"\033[{p_color}m{prefix}\033[0m \033[{t_color}m")
    for c in text:
        sys.stdout.write(c)
        sys.stdout.flush()
        time.sleep(delay)
    sys.stdout.write("\033[0m\n")

print("\n")
out("[ORCHESTRATOR]", "1;44", "New Project Pipeline Triggered: 'Event Booking Platform'")
time.sleep(0.4)
out("[BRAIN_AGENT] ", "1;36", "Analyzing raw user requirements... extracted 4 key constraints.")
out("[BRAIN_AGENT] ", "1;36", "Delegating Stage 2 to Architect Agent.")
time.sleep(0.6)
out("[ARCHITECT]   ", "1;35", "Designing Schema (PostgreSQL) + Tech Stack (Next.js/FastAPI)...")
time.sleep(0.8)
out("[ARCHITECT]   ", "1;35", "Output: Users, Events, Bookings, Payments tables mapped.")
time.sleep(0.2)
out("[HINDSIGHT]   ", "1;34", "Persisting architectural decisions to vector memory... \033[92mDONE\033[0m")
time.sleep(0.8)
out("[BACKEND]     ", "1;32", "Recalling schema from Hindsight Core...")
out("[BACKEND]     ", "1;32", "Generating REST API routes and Pydantic models...")
time.sleep(1.2)
out("[FRONTEND]    ", "1;33", "Awaiting API contract...")
time.sleep(0.4)
out("[BACKEND]     ", "1;32", "API Contract generated -> \033[4m/api/v1/openapi.json\033[0m")
out("[FRONTEND]    ", "1;33", "Consuming OpenAPI spec. Scaffolding React components...")
time.sleep(1.5)
out("[ORCHESTRATOR]", "1;44", "Phase 1-4 Complete. Pipeline advancing to TESTING.", "92")
print("\n")
