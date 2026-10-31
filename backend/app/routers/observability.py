from fastapi import APIRouter
from typing import Dict, Any
from ..core.llm_client import get_telemetry_stats

router = APIRouter(prefix="/observability", tags=["Observability & Reliability"])

@router.get("/health", response_model=Dict[str, Any])
def get_observability_health():
    """
    Returns live LLM provider telemetry, success rates, latency, and recent traces.
    """
    stats = get_telemetry_stats()
    status_verdict = "HEALTHY" if stats["success_rate"] >= 80.0 else ("DEGRADED" if stats["success_rate"] >= 50.0 else "UNHEALTHY")
    return {
        "status": status_verdict,
        "metrics": stats
    }

@router.get("/traces")
def get_recent_traces():
    """
    Returns recent LLM execution traces for debugging.
    """
    return get_telemetry_stats()["recent_traces"]
