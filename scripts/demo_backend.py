import time
import sys

def p(text, color, delay=0.01):
    sys.stdout.write(f"\033[{color}m")
    for c in text:
        sys.stdout.write(c)
        sys.stdout.flush()
        time.sleep(delay)
    sys.stdout.write("\033[0m\n")

logo = """
  _______                     ______                       
 |__   __|                   |  ____|                      
    | | ___  __ _ _ __ ___   | |__ ___  _ __ __ _  ___     
    | |/ _ \/ _` | '_ ` _ \  |  __/ _ \| '__/ _` |/ _ \    
    | |  __/ (_| | | | | | | | | | (_) | | | (_| |  __/    
    |_|\___|\__,_|_| |_| |_| |_|  \___/|_|  \__, |\___|    
                                             __/ |         
                                            |___/          
"""
print(f"\n\033[1;36m{logo}\033[0m")
p("[SYSTEM] Booting TeamForge AI Orchestrator v2.0...", "90", 0.02)
time.sleep(0.4)
p("[INFO] Connecting to PostgreSQL Database...", "34")
time.sleep(0.2)
p("[INFO] Initializing Hindsight Vector Memory...", "35")
time.sleep(0.4)
print("\n\033[90m[INFO] Loading Specialized AI Agents:\033[0m")
p("  -> [\033[97mBrain\033[36m]      Context Engine (Gemini 1.5 Pro)      ... \033[92mONLINE\033[0m", "36", 0.005)
p("  -> [\033[97mArchitect\033[35m]  System Design (NVIDIA Nemotron)      ... \033[92mONLINE\033[0m", "35", 0.005)
p("  -> [\033[97mBackend\033[34m]    API Generator (Groq / Llama 3 70B)   ... \033[92mONLINE\033[0m", "34", 0.005)
p("  -> [\033[97mFrontend\033[33m]   UI Scaffolder (Claude 3.5 Sonnet)    ... \033[92mONLINE\033[0m", "33", 0.005)
p("  -> [\033[97mDevOps\033[31m]     Deployment Manager (GPT-4o)          ... \033[92mONLINE\033[0m", "31", 0.005)

time.sleep(0.6)
print("\n\033[92mINFO\033[0m:     Started server process [\033[36m18452\033[0m]")
print("\033[92mINFO\033[0m:     Waiting for application startup.")
time.sleep(0.3)
print("\033[92mINFO\033[0m:     Application startup complete.")
print("\033[92mINFO\033[0m:     Uvicorn running on \033[1;97mhttp://0.0.0.0:8000\033[0m (Press CTRL+C to quit)\n")
