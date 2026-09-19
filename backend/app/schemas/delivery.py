from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class GitHubLinkRequest(BaseModel):
    repo_url: Optional[str] = None

class SyncedIssueItem(BaseModel):
    task_id: str
    issue_number: int
    title: str
    issue_url: str

class GitHubSyncResponse(BaseModel):
    project_id: str
    repo_url: str
    synced_issues: List[SyncedIssueItem]

class ArtifactGenerateResponse(BaseModel):
    artifact_id: str
    project_id: str
    artifact_type: str
    title: str
    content: str
    created_at: datetime
