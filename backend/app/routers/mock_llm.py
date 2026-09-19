from fastapi import APIRouter
from pydantic import BaseModel
import json
import re

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatCompletionRequest(BaseModel):
    model: str
    messages: list[ChatMessage]
    response_format: dict | None = None

@router.post("/chat/completions")
def mock_chat_completions(req: ChatCompletionRequest):
    content = ""
    user_prompt = req.messages[1].content
    
    # Simple regex to detect time budget
    time_budget_val = 24
    time_budget_unit = "hours"
    time_match = re.search(r'Time Budget:\s*(\d+)\s*(hours|days|weeks|months)', user_prompt, re.IGNORECASE)
    if time_match:
        time_budget_val = int(time_match.group(1))
        time_budget_unit = time_match.group(2).lower()
        
    is_speedrun = (time_budget_unit == "hours" and time_budget_val <= 48)
    is_enterprise = (time_budget_unit in ["weeks", "months"])
            
    # Extract project context to make it dynamic
    project_context = "our platform"
    context_match = re.search(r'Problem Statement:\s*(.*?)\n', user_prompt, re.IGNORECASE)
    if context_match:
        project_context = context_match.group(1).strip()
    
    idea_match = re.search(r'Idea:\s*(.*?)\n', user_prompt, re.IGNORECASE)
    if idea_match:
        idea_text = idea_match.group(1).strip()
        if len(idea_text) > 5 and idea_text not in project_context:
            project_context += " - " + idea_text

    if len(project_context) < 5 or project_context == "our platform":
        project_context = "the application we are building"
        
    team_context = "our engineering squad"
    constraint_match = re.search(r'Constraints:\s*\[(.*?)\]', user_prompt, re.IGNORECASE)
    if constraint_match:
        constraints = constraint_match.group(1)
        team_match = re.search(r'Team:\s*([^"]+)', constraints, re.IGNORECASE)
        if team_match:
            team_context = team_match.group(1).strip()
            
    if "Evaluate tools for the capability" in user_prompt:
        if "Frontend" in user_prompt:
            if is_speedrun:
                content = { "capability": "Frontend UI", "options_matrix": [], "winning_tool": "Bolt.new / Lovable.dev", "winning_category": "Mainstream Default", "rationale": f"You only have a few hours. Do not write components manually." }
            else:
                content = { "capability": "Frontend UI", "options_matrix": [], "winning_tool": "Next.js + Shadcn UI", "winning_category": "Mainstream Default", "rationale": f"You have enough time. Build a high-quality UI foundation." }
        elif "Backend" in user_prompt:
            if is_speedrun:
                content = { "capability": "Backend API", "options_matrix": [], "winning_tool": "Supabase", "winning_category": "Cloud-Native", "rationale": "Do not write a custom backend for a speedrun. Use Supabase." }
            else:
                content = { "capability": "Backend API", "options_matrix": [], "winning_tool": "FastAPI + PostgreSQL", "winning_category": "Mainstream Default", "rationale": f"With ample time, build a robust custom backend." }
        else:
            content = { "capability": "Data Pipeline", "options_matrix": [], "winning_tool": "Python + Pandas / Celery", "winning_category": "Mainstream Default", "rationale": f"You need a dedicated background worker." }
    else:
        # Playbook generation
        if is_speedrun:
            content = {
                "stages": [
                    {
                        "name": "Phase 1: Generate & Download",
                        "description": "Generate the entire UI prototype in the browser and download the codebase.",
                        "steps": [
                            { "instruction": "Go to Bolt.new or Lovable.dev and paste this prompt.", "ai_prompt": f"Build the UI for: {project_context}. Make it modern.", "context_files": [] },
                            { "instruction": "Test the generated app in the browser. Click 'Download ZIP', extract it, and open in Cursor IDE.", "ai_prompt": None, "context_files": [] }
                        ]
                    },
                    {
                        "name": "Phase 2: Database Swap",
                        "description": "Replace the mock data with a live Supabase backend.",
                        "steps": [
                            { "instruction": "Go to Supabase.com, create a project, and create your tables.", "ai_prompt": f"Write the Supabase SQL schema for: {project_context}.", "context_files": [] },
                            { "instruction": "Open the codebase in Cursor IDE and wire up the live data.", "ai_prompt": "Replace all mock logic so it fetches from Supabase.", "context_files": [] }
                        ]
                    }
                ]
            }
        elif is_enterprise:
            content = {
                "stages": [
                    {
                        "name": "Phase 1: Deep Requirements & System Architecture (Weeks 1-2)",
                        "description": f"Since you have {time_budget_val} {time_budget_unit}, spend time on rigorous architecture for the team ({team_context}).",
                        "steps": [
                            { "instruction": "Lead Architect: Draft the comprehensive RFC.", "ai_prompt": f"Generate a detailed technical RFC for: {project_context}. Include data models, system boundaries, and security considerations.", "context_files": [] },
                            { "instruction": "Data Engineering: Design the foundational database schema.", "ai_prompt": f"Design a highly normalized PostgreSQL schema for {project_context}. Include index recommendations and partition strategies for scale.", "context_files": [] },
                            { "instruction": "DevOps: Setup CI/CD pipelines.", "ai_prompt": f"Write GitHub Actions workflows for a Next.js and FastAPI monorepo with automated testing.", "context_files": [] }
                        ]
                    },
                    {
                        "name": "Phase 2: Core Infrastructure & API Layer (Weeks 3-5)",
                        "description": "Build the backend foundation.",
                        "steps": [
                            { "instruction": "Backend Squad: Initialize the FastAPI monolith and configure Alembic.", "ai_prompt": f"Write the Alembic env.py and FastAPI boilerplate for {project_context}.", "context_files": [] },
                            { "instruction": "Backend Squad: Build the primary authentication and user management.", "ai_prompt": f"Write JWT-based Auth endpoints in FastAPI with role-based access control.", "context_files": [] },
                            { "instruction": "Data Squad: Construct the data ingestion pipelines.", "ai_prompt": f"Write highly robust Celery workers to handle data ingestion for {project_context}. Include error retry logic.", "context_files": [] }
                        ]
                    },
                    {
                        "name": "Phase 3: Frontend Development (Weeks 6-8)",
                        "description": "Construct the user interface.",
                        "steps": [
                            { "instruction": "Frontend Squad: Initialize Next.js with comprehensive atomic design system.", "ai_prompt": f"Generate a detailed shadcn-ui theme and layout structure for a premium SaaS.", "context_files": [] },
                            { "instruction": "Frontend Squad: Build the primary dashboards.", "ai_prompt": f"Write the React Server Components to fetch and display data for: {project_context}.", "context_files": [] }
                        ]
                    },
                    {
                        "name": "Phase 4: QA, Load Testing, and Launch (Weeks 9+)",
                        "description": "Final polish before enterprise release.",
                        "steps": [
                            { "instruction": "QA Squad: Write end-to-end Playwright tests.", "ai_prompt": f"Write e2e Playwright tests covering the main user flows of {project_context}.", "context_files": [] },
                            { "instruction": "DevOps: Execute k6 load tests against the API.", "ai_prompt": f"Write a k6 load test script targeting the core API endpoints.", "context_files": [] }
                        ]
                    }
                ]
            }
        else:
            content = {
                "stages": [
                    {
                        "name": "Phase 1: API Contracts (Day 1)",
                        "description": f"Team setup: {team_context}",
                        "steps": [
                            { "instruction": "Agree on the data shape so teams can work in parallel.", "ai_prompt": f"Generate strict JSON API schemas for {project_context}.", "context_files": [] }
                        ]
                    },
                    {
                        "name": "Phase 2: Parallel Execution (Days 2 to 4)",
                        "description": "Divide & Conquer.",
                        "steps": [
                            { "instruction": "Backend: Set up FastAPI and Postgres.", "ai_prompt": f"Write SQLAlchemy models for: {project_context}.", "context_files": [] },
                            { "instruction": "Data: Setup ingestion.", "ai_prompt": f"Write a Python Celery script to fetch data for: {project_context}.", "context_files": [] },
                            { "instruction": "Frontend: Initialize Next.js.", "ai_prompt": f"Generate a dashboard for: {project_context}.", "context_files": [] }
                        ]
                    },
                    {
                        "name": "Phase 3: Integration & Ship",
                        "description": "Merge tracks and deploy.",
                        "steps": [
                            { "instruction": "Frontend team, point API calls to the live FastAPI endpoints. Deploy to Vercel.", "ai_prompt": None, "context_files": [] }
                        ]
                    }
                ]
            }
    
    return {
        "id": "chatcmpl-mock",
        "object": "chat.completion",
        "created": 1677652288,
        "model": req.model,
        "choices": [{
            "index": 0,
            "message": {
                "role": "assistant",
                "content": json.dumps(content)
            },
            "finish_reason": "stop"
        }],
        "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
    }
