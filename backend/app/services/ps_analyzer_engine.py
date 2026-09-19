from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from ..models.user_team import Team, TeamMember
from ..schemas.ps_analyzer import (
    CandidatePSInput, PSEvaluateRequest, PSEvaluateResponse, PSEvaluationItem, PSScores
)

def evaluate_multiple_problem_statements(db: Session, req: PSEvaluateRequest) -> PSEvaluateResponse:
    team = db.query(Team).filter(Team.id == req.team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "TEAM_NOT_FOUND", "message": "Team does not exist"}}
        )
        
    members = db.query(TeamMember).filter(TeamMember.team_id == req.team_id).all()
    team_size = max(1, len(members))
    total_capacity_hours = team_size * req.time_budget_hours
    
    # Collect all team skills & active subscriptions with member names
    all_skills = []
    all_subscriptions = []
    member_summaries = []
    for m in members:
        m_name = m.user.name if m.user else "Teammate"
        m_skills = [s.name for s in m.skills]
        m_subs = [s.tool_name for s in m.subscriptions]
        all_skills.extend([s.lower() for s in m_skills])
        all_subscriptions.extend([s.lower() for s in m_subs])
        member_summaries.append(f"{m_name} ({', '.join(m_skills + m_subs)})")
            
    evaluated_items = []
    
    for candidate in req.candidate_problem_statements:
        text = f"{candidate.title} {candidate.problem_statement} {candidate.proposed_idea}".lower()
        
        # -------------------------------------------------------------
        # 1. Skill Fit Score & Explanation
        # -------------------------------------------------------------
        skill_matches = 0
        matched_stack = []
        if any(w in text for w in ["ui", "frontend", "screen", "design", "booking", "dashboard"]):
            if any("react" in s or "figma" in s or "ui" in s or "tailwind" in s for s in all_skills + all_subscriptions):
                skill_matches += 3
                matched_stack.append("Frontend UI / Figma")
        if any(w in text for w in ["api", "backend", "database", "sql", "booking", "auth"]):
            if any("python" in s or "fastapi" in s or "sql" in s or "node" in s for s in all_skills):
                skill_matches += 3
                matched_stack.append("Backend APIs / SQL")
        if any(w in text for w in ["ai", "agent", "llm", "mentor", "qr", "copilot"]):
            if any("cursor" in sub or "claude" in sub or "copilot" in sub or "ai" in s for sub in all_subscriptions for s in all_skills):
                skill_matches += 3
                matched_stack.append("AI / Cursor Pro")
                
        skill_score = min(10.0, max(5.0, float(skill_matches + 4)))
        
        if skill_score >= 8.5:
            skill_fit_exp = f"High team synergy: Directly matches {len(matched_stack)} core team capabilities ({', '.join(matched_stack)}) and active tool subscriptions."
        elif skill_score >= 7.0:
            skill_fit_exp = f"Moderate fit: Matches {', '.join(matched_stack) if matched_stack else 'basic web stack'}, with light learning curve on custom modules."
        else:
            skill_fit_exp = "Low fit: Requires specialized skills (e.g. low-level systems, custom cryptography) not present on the current team."

        # -------------------------------------------------------------
        # 2. Time Feasibility Score & Explanation
        # -------------------------------------------------------------
        is_overly_complex = any(w in text for w in ["custom blockchain", "zero-knowledge", "train custom llm", "hardware iot", "ar/vr headset", "microkernel"])
        is_moderate_scope = any(w in text for w in ["booking", "marketplace", "copilot", "qr code", "analytics", "dashboard", "triage"])
        
        if is_overly_complex:
            time_score = 3.5
            time_feasibility_exp = f"Unrealistic for {req.time_budget_hours}h: Building custom low-level/decentralized engines will consume >80% of sprint capacity with high risk of unfinished UI."
            drawbacks = [
                "Unrealistic scope for the available time budget",
                "High risk of failing live demo due to unfinished low-level dependencies",
                "Steep learning curve with low initial visual progress"
            ]
        elif is_moderate_scope:
            time_score = 9.2
            time_feasibility_exp = f"Optimal scope: Estimated workload (~45-50h) uses ~25% of total team capacity ({total_capacity_hours} person-hours across {team_size} devs), leaving ample time for UI polish and testing."
            drawbacks = ["Requires strict time-boxing on advanced edge-case handling"]
        else:
            time_score = 7.5
            time_feasibility_exp = f"Feasible with disciplined time-boxing: Can deliver an MVP within {req.time_budget_hours}h by mocking secondary integrations."
            drawbacks = ["Potential ambiguity in core user workflows"]

        # -------------------------------------------------------------
        # 3. Demo Impact Score & Explanation
        # -------------------------------------------------------------
        if any(w in text for w in ["qr", "live", "real-time", "interactive", "agent", "visual", "booking"]):
            demo_score = 9.5
            demo_impact_exp = "Outstanding live demo: Tangible end-to-end user journey (e.g. browsing, instant booking, live smartphone QR ticket scan) captivates judges in 90 seconds."
        else:
            demo_score = 6.8
            demo_impact_exp = "Average visual appeal: Standard CRUD interface with low immediate wow-factor during a rapid 3-minute pitch."

        # -------------------------------------------------------------
        # 4. Sponsor Fit Score & Explanation
        # -------------------------------------------------------------
        if candidate.target_sponsor_track:
            sponsor_score = 9.2
            sponsor_fit_exp = f"Direct match for '{candidate.target_sponsor_track}' sponsor bounty tracks."
        elif any(w in text for w in ["stripe", "vercel", "aws", "gemini", "twilio"]):
            sponsor_score = 9.0
            sponsor_fit_exp = "Naturally integrates major hackathon sponsor APIs (Stripe Payments, Vercel Edge, Twilio Alerts)."
        else:
            sponsor_score = 7.0
            sponsor_fit_exp = "General track fit without targeting specific sponsor prize bounties."

        # Weighted Overall Calculation
        overall = round((skill_score * 0.30) + (time_score * 0.35) + (demo_score * 0.25) + (sponsor_score * 0.10), 1)
        calc_formula = f"({skill_score} × 30% Skill) + ({time_score} × 35% Time) + ({demo_score} × 25% Demo) + ({sponsor_score} × 10% Sponsor) = {overall}/10"

        scores = PSScores(
            skill_fit_score=skill_score,
            skill_fit_explanation=skill_fit_exp,
            time_feasibility_score=time_score,
            time_feasibility_explanation=time_feasibility_exp,
            demo_impact_score=demo_score,
            demo_impact_explanation=demo_impact_exp,
            sponsor_fit_score=sponsor_score,
            sponsor_fit_explanation=sponsor_fit_exp,
            overall_score=overall,
            overall_score_calculation=calc_formula
        )

        why_pick = (
            f"Strongest overall fit ({overall}/10). Leverages team skills ({', '.join(matched_stack) if matched_stack else 'core stack'}), "
            f"comfortably fits into {req.time_budget_hours}h with zero low-level blockers, and delivers a memorable interactive live pitch."
        )

        evaluated_items.append({
            "id": candidate.id,
            "title": candidate.title,
            "scores": scores,
            "overall": overall,
            "why_pick": why_pick,
            "drawbacks": drawbacks
        })

    # Rank descending by overall score
    evaluated_items.sort(key=lambda x: x["overall"], reverse=True)

    ranked_out: List[PSEvaluationItem] = []
    for rank, item in enumerate(evaluated_items, start=1):
        if rank == 1:
            verdict = "WINNER"
            status_val = "top_pick"
        elif item["overall"] >= 6.5:
            verdict = "VIABLE_ALTERNATIVE"
            status_val = "alternative"
        else:
            verdict = "REJECTED"
            status_val = "not_recommended"

        ranked_out.append(PSEvaluationItem(
            id=item["id"],
            title=item["title"],
            rank=rank,
            verdict=verdict,
            scores=item["scores"],
            selection_status=status_val,
            why_pick_reason=item["why_pick"],
            risks_and_drawbacks=item["drawbacks"]
        ))

    top_pick = ranked_out[0]
    summary = (
        f"Selected '{top_pick.title}' as the #1 Top Recommended Problem Statement (Score: {top_pick.scores.overall_score}/10). "
        f"Formula: {top_pick.scores.overall_score_calculation}. "
        f"It maximizes your team's active subscriptions ({', '.join(set(all_subscriptions)) if all_subscriptions else 'free tier tools'}), "
        f"fits cleanly into your {req.time_budget_hours}h sprint, and guarantees an interactive live demo for judges."
    )

    return PSEvaluateResponse(
        team_id=req.team_id,
        time_budget_hours=req.time_budget_hours,
        top_recommended_ps=top_pick,
        ranked_evaluations=ranked_out,
        summary_recommendation=summary
    )
