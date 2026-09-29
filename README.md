# TeamForge AI 🚀

An AI-powered engineering mentor and execution pipeline that acts as your tech lead, architect, and DevOps engineer. Drop your idea, and TeamForge will analyze feasibility, architect the system, select the optimal stack, and generate a step-by-step interactive build playbook.

## 📂 Repository Structure

- `frontend/` - Next.js (React) web application (Dashboard & Mission Control)
- `backend/` - FastAPI backend powering the 7-Layer AI Architecture
- `docs/` - Architecture diagrams, SDLC documents, and agent instructions
- `scripts/` - Testing, deployment, and demo scripts
- `cricket-resolver/` - Experimental resolving tools

## ⚡ Tech Stack

**Frontend:**
- Next.js (App Router)
- React
- Tailwind CSS
- Pure inline-styled retro arcade UI

**Backend:**
- FastAPI (Python)
- SQLite (local storage)
- Multi-LLM AI Pipeline (Groq, NVIDIA Nemotron, Gemini)

## 🛠️ Quick Start

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env # Add your Groq/Gemini/NVIDIA keys
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend will run at `http://localhost:3000` and communicate with the backend at `http://localhost:8000/api/v1`.

## 🛡️ Architecture & Agents

TeamForge dynamically routes tasks to specialized models:
- **NVIDIA Nemotron:** System design, architectural trade-offs, and complex reasoning.
- **Groq (Llama 3):** Blazing fast generation for playbooks, SDLC execution, and risk catalogs.
- **Gemini (Flash):** Massive context window evaluation and requirements parsing.

Check out the `docs/` folder for detailed AI pipeline workflows and system design diagrams.
