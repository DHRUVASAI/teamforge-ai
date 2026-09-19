from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .core.database import engine, Base
# Import all models to ensure metadata registration
from .models import (
    user_team, project, recommendation, task, risk, tool, mentor, delivery, playbook
)
from .routers import (
    mock_llm,
    auth_team, project as project_router, sdlc, architecture, task as task_router,
    tool as tool_router, risk as risk_router, mentor as mentor_router, delivery as delivery_router,
    ps_analyzer as ps_analyzer_router, friendly as friendly_router, playbook as playbook_router
)

# Initialize database schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="TeamForge AI - Autonomous Engineering Copilot for Hackathons & Software Teams. Provides deterministic multi-tier decision engines, Multi-PS ranking, Sponsor condition enforcement, Teammate connection hubs, and Plain-English ELI5 tool guides."
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all service routers under /api/v1
API_PREFIX = settings.API_V1_STR

app.include_router(auth_team.router, prefix=API_PREFIX)
app.include_router(project_router.router, prefix=API_PREFIX)
app.include_router(sdlc.router, prefix=API_PREFIX)
app.include_router(architecture.router, prefix=API_PREFIX)
app.include_router(task_router.router, prefix=API_PREFIX)
app.include_router(tool_router.router, prefix=API_PREFIX)
app.include_router(risk_router.router, prefix=API_PREFIX)
app.include_router(mentor_router.router, prefix=API_PREFIX)
app.include_router(delivery_router.router, prefix=API_PREFIX)
app.include_router(ps_analyzer_router.router, prefix=API_PREFIX)
app.include_router(friendly_router.router, prefix=API_PREFIX)
app.include_router(playbook_router.router, prefix=API_PREFIX)
app.include_router(mock_llm.router, prefix='/v1')

@app.get("/", tags=["Root"])
def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": "1.0.0",
        "docs": "/docs",
        "openapi": "/openapi.json",
        "status": "online"
    }

@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy", "database": "connected"}
