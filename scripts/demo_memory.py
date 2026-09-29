import time
import sys

def print_color(text, color_code):
    print(f"\033[{color_code}m{text}\033[0m")

print("\n")
print_color("============================================================", "90")
print_color("  TEAMFORGE NEURAL LINK <=> HINDSIGHT MEMORY CORE  ", "1;36")
print_color("============================================================", "90")
time.sleep(0.5)

print_color("[INFO] Initializing Project Brain...", "90")
time.sleep(0.3)
print_color("[HINDSIGHT] Connecting to vector cluster (id: prj-99a3b)... OK", "35")
time.sleep(0.5)

print("\n")
print_color("[TEAMFORGE_BRAIN] Executing Retain Call (Storing context)...", "36")
time.sleep(0.3)
print_color(">>> hindsight.retain(", "33")
print_color('...     session_id="prj-99a3b",', "33")
print_color('...     fact="Team prefers a Modular Monolith architecture to avoid DevOps overhead.",', "33")
print_color('...     context="Architecture Planning"', "33")
print_color("... )", "33")
time.sleep(0.8)
print_color("[HINDSIGHT] [+] Fact stored successfully (embedding_id: 8x2f...91a).", "92")

time.sleep(0.5)
print("\n")
print_color("[TEAMFORGE_BRAIN] Executing Recall Call (Context retrieval)...", "36")
time.sleep(0.3)
print_color(">>> hindsight.recall(", "33")
print_color('...     session_id="prj-99a3b",', "33")
print_color('...     query="What architecture did we agree on?",', "33")
print_color('...     top_k=1', "33")
print_color("... )", "33")
time.sleep(0.8)
print_color("[HINDSIGHT] [>] Memory retrieved (confidence: 0.98):", "92")
print_color('           -> "Team prefers a Modular Monolith architecture to avoid DevOps overhead."', "97")

time.sleep(0.5)
print("\n")
print_color("============================================================", "90")
print_color("[SYSTEM] Pipeline execution continuing with loaded context...", "90")
print("\n")
