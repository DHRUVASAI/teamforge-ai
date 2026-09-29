"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getProject, generatePlaybook, analyzeProject, updateProject } from "@/lib/api";
import { getAuth } from "@/lib/auth";
import SquadSnake from "@/components/SquadSnake";

interface Project {
  project_id?: string;
  id?: string;
  name: string;
  problem_statement: string;
  idea: string;
  time_budget?: { value: number; unit: string };
  time_budget_value?: number;
  time_budget_unit?: string;
  constraints?: string[];
}

type StageStatus = "LOCKED" | "QUEUED" | "RUNNING" | "DONE";

interface PipelineStage {
  id: string;
  label: string;
  icon: string;
  agent: string;
  agentIcon: string;
  agentColor: string;
  bg: string;
  desc: string;
  status: StageStatus;
  tasks: string[];
}

// ─── Smart pipeline generator ─────────────────────────────────────
// Reads the project's problem_statement + idea and generates unique stages
function generatePipeline(project: { name: string; problem_statement: string; idea: string }): PipelineStage[] {
  const text = `${project.name} ${project.problem_statement} ${project.idea}`.toLowerCase();

  const has = (...words: string[]) => words.some(w => text.includes(w));

  // Detect project type
  const isML     = has("ml", "machine learning", "model", "predict", "ai", "neural", "nlp", "classify", "detection", "recommend");
  const isData   = has("data", "analytics", "analysis", "dashboard", "visualization", "chart", "report", "insight", "historical", "cricket");
  const isMobile = has("mobile", "app", "ios", "android", "react native", "flutter");
  const hasAuth  = has("auth", "login", "user", "register", "account", "jwt", "oauth", "role");
  const hasDB    = has("database", "db", "sql", "store", "storage", "record", "history", "track");
  const hasAPI   = has("api", "endpoint", "rest", "backend", "server", "fastapi", "express", "django");
  const hasPayment = has("payment", "pay", "subscription", "billing", "stripe", "checkout", "price");
  const hasRealtime = has("realtime", "real-time", "live", "socket", "websocket", "stream", "notification", "chat");
  const hasScraping = has("scrape", "crawl", "fetch", "collect", "aggregate", "ingest", "feed");

  const stages: PipelineStage[] = [];

  // Stage 1: Always Requirements
  stages.push({
    id: "requirements", label: "REQUIREMENTS", icon: "📋",
    agent: "TeamForge Brain", agentIcon: "🧠", agentColor: "#0066CC",
    bg: "white", status: "DONE",
    desc: `Analyze the "${project.name}" project scope, extract team constraints and map the engineering plan.`,
    tasks: ["Parse problem statement", "Extract required capabilities", "Define team constraints", "Map project scope"],
  });

  // Stage 2: Data / ML — or Architecture
  if (isML) {
    stages.push({
      id: "data-pipeline", label: "DATA PIPELINE", icon: "🔁",
      agent: "ML Agent", agentIcon: "🤖", agentColor: "#7c3aed",
      bg: "white", status: "QUEUED",
      desc: "Design data ingestion, preprocessing and training pipeline for the ML model.",
      tasks: ["Set up data sources", "Build preprocessing steps", "Define feature engineering", "Plan model training loop"],
    });
  } else if (isData || hasScraping) {
    stages.push({
      id: "data-ingestion", label: "DATA INGESTION", icon: "📥",
      agent: "Backend Agent", agentIcon: "🔧", agentColor: "#0891b2",
      bg: "white", status: "QUEUED",
      desc: "Build data collection, aggregation and normalization layer for all data sources.",
      tasks: ["Identify data sources", "Build scraper / API connectors", "Normalize raw data", "Schedule refresh jobs"],
    });
  } else {
    stages.push({
      id: "architecture", label: "ARCHITECTURE", icon: "🏗️",
      agent: "Architect Agent", agentIcon: "⚙️", agentColor: "#CC0066",
      bg: "white", status: "QUEUED",
      desc: "Design system architecture and select the optimal tech stack.",
      tasks: ["Monolith vs microservices", "Select frontend framework", "Select backend + database", "Define API contract"],
    });
  }

  // Stage 3: Database (if needed)
  if (hasDB || hasAuth || isData) {
    stages.push({
      id: "database", label: "DATABASE", icon: "🗄️",
      agent: "Backend Agent", agentIcon: "🔧", agentColor: "#00EE55",
      bg: "white", status: "LOCKED",
      desc: "Design schema, relationships and indexes tailored to this project's data model.",
      tasks: ["Design entity relationships", "Define table schemas", "Set up indexes", "Write seed / migration scripts"],
    });
  }

  // Stage 4: Auth (if needed)
  if (hasAuth) {
    stages.push({
      id: "auth", label: "AUTH SYSTEM", icon: "🔐",
      agent: "Security Agent", agentIcon: "🛡️", agentColor: "#FF0044",
      bg: "white", status: "LOCKED",
      desc: "Implement user authentication, authorization and role-based access control.",
      tasks: ["JWT / OAuth setup", "Role-based access", "Session management", "Password hashing & security"],
    });
  }

  // Stage 5: Backend API
  if (hasAPI || (!isMobile && !isML)) {
    stages.push({
      id: "backend", label: "BACKEND API", icon: "⚡",
      agent: "Backend Agent", agentIcon: "🔧", agentColor: "#00EE55",
      bg: "white", status: "LOCKED",
      desc: "Generate REST API endpoints, business logic and data models.",
      tasks: ["Scaffold API routes", "Write service layer", "Input validation", "API documentation"],
    });
  }

  // Stage 5b: ML Model (if ML project)
  if (isML) {
    stages.push({
      id: "model", label: "MODEL BUILD", icon: "🧪",
      agent: "ML Agent", agentIcon: "🤖", agentColor: "#7c3aed",
      bg: "white", status: "LOCKED",
      desc: "Train, evaluate and serialize the machine learning model.",
      tasks: ["Train baseline model", "Hyperparameter tuning", "Evaluate metrics", "Export model artifact"],
    });
  }

  // Stage 5c: Analytics / Viz (if data project)
  if (isData) {
    stages.push({
      id: "analytics", label: "ANALYTICS", icon: "📊",
      agent: "Frontend Agent", agentIcon: "🖥️", agentColor: "#FFCC00",
      bg: "white", status: "LOCKED",
      desc: "Build analytics engine, compute aggregated metrics and visualization-ready data.",
      tasks: ["Define KPIs and metrics", "Build aggregation queries", "Cache computed results", "Expose analytics API"],
    });
  }

  // Stage 5d: Payments
  if (hasPayment) {
    stages.push({
      id: "payments", label: "PAYMENTS", icon: "💳",
      agent: "Backend Agent", agentIcon: "🔧", agentColor: "#FF0044",
      bg: "white", status: "LOCKED",
      desc: "Integrate payment gateway, handle webhooks and manage subscriptions.",
      tasks: ["Stripe / Razorpay integration", "Webhook handling", "Subscription logic", "Refund & receipt flows"],
    });
  }

  // Stage 5e: Realtime
  if (hasRealtime) {
    stages.push({
      id: "realtime", label: "REALTIME", icon: "📡",
      agent: "Backend Agent", agentIcon: "🔧", agentColor: "#00FFFF",
      bg: "white", status: "LOCKED",
      desc: "Set up WebSocket / SSE channels for real-time event broadcasting.",
      tasks: ["WebSocket server setup", "Event broadcasting", "Connection management", "Fallback polling strategy"],
    });
  }

  // Stage 6: Frontend
  stages.push({
    id: "frontend", label: isMobile ? "MOBILE APP" : "FRONTEND UI", icon: isMobile ? "📱" : "🎨",
    agent: "Frontend Agent", agentIcon: "🖥️", agentColor: "#FFCC00",
    bg: "white", status: "LOCKED",
    desc: isMobile
      ? "Build cross-platform mobile app with React Native / Flutter."
      : "Build responsive UI, pages, routing and connect to the backend API.",
    tasks: isMobile
      ? ["Scaffold app structure", "Build screens & navigation", "Integrate API calls", "Handle offline mode"]
      : ["Scaffold pages & routing", "Build UI components", "Connect to API", "Mobile responsiveness"],
  });

  // Stage 7: Testing
  stages.push({
    id: "testing", label: "TESTING", icon: "🧪",
    agent: "Testing Agent", agentIcon: "✅", agentColor: "#00FFFF",
    bg: "white", status: "LOCKED",
    desc: "Write unit, integration and E2E tests covering critical flows.",
    tasks: ["Unit tests for services", "Integration test suite", "E2E test scenarios", "Define coverage targets"],
  });

  // Stage 8: Deployment
  stages.push({
    id: "deployment", label: "DEPLOYMENT", icon: "🚀",
    agent: "DevOps Agent", agentIcon: "☁️", agentColor: "#FF0044",
    bg: "white", status: "LOCKED",
    desc: "Configure CI/CD pipeline, hosting, environment variables and monitoring.",
    tasks: ["Configure CI/CD", "Set up hosting", "Environment variables", "Monitoring & alerts"],
  });

  return stages;
}
// ──────────────────────────────────────────────────────────────────

const INITIAL_PIPELINE: PipelineStage[] = [
  {
    id: "requirements", label: "REQUIREMENTS", icon: "📋",
    agent: "TeamForge Brain", agentIcon: "🧠", agentColor: "#0066CC", bg: "white",
    desc: "Extract capabilities, constraints and team context from your problem statement.",
    status: "DONE",
    tasks: ["Parse problem statement", "Extract required capabilities", "Evaluate team skills", "Set time budget constraints"],
  },
  {
    id: "architecture", label: "ARCHITECTURE", icon: "🏗️",
    agent: "Architect Agent", agentIcon: "⚙️", agentColor: "#CC0066", bg: "white",
    desc: "Design system architecture and select the optimal tech stack for your team and timeline.",
    status: "QUEUED",
    tasks: ["Choose monolith vs microservices", "Select frontend framework", "Select backend + database", "Define API contract"],
  },
  {
    id: "database", label: "DATABASE", icon: "🗄️",
    agent: "Backend Agent", agentIcon: "🔧", agentColor: "#00EE55", bg: "white",
    desc: "Design schema, relationships, indexes, seed data and migration strategy.",
    status: "LOCKED",
    tasks: ["Design entity relationships", "Define table schemas", "Set up indexes", "Write seed data"],
  },
  {
    id: "backend", label: "BACKEND API", icon: "⚡",
    agent: "Backend Agent", agentIcon: "🔧", agentColor: "#00EE55", bg: "white",
    desc: "Generate REST API endpoints, business logic, authentication and data models.",
    status: "LOCKED",
    tasks: ["Scaffold API routes", "Implement auth & JWT", "Write service layer", "API documentation"],
  },
  {
    id: "frontend", label: "FRONTEND UI", icon: "🎨",
    agent: "Frontend Agent", agentIcon: "🖥️", agentColor: "#FFCC00", bg: "white",
    desc: "Build responsive UI components, pages, routing and connect to the backend API.",
    status: "LOCKED",
    tasks: ["Scaffold pages & routing", "Build UI components", "Connect to API", "Mobile responsiveness"],
  },
  {
    id: "testing", label: "TESTING", icon: "🧪",
    agent: "Testing Agent", agentIcon: "✅", agentColor: "#00FFFF", bg: "white",
    desc: "Unit tests, integration tests, E2E test plan and target coverage requirements.",
    status: "LOCKED",
    tasks: ["Write unit tests", "Integration test suite", "E2E test scenarios", "Define coverage targets"],
  },
  {
    id: "deployment", label: "DEPLOYMENT", icon: "🚀",
    agent: "DevOps Agent", agentIcon: "☁️", agentColor: "#FF0044", bg: "white",
    desc: "CI/CD pipeline, infrastructure configuration and production environment setup.",
    status: "LOCKED",
    tasks: ["Configure CI/CD", "Set up hosting", "Environment variables", "Monitoring & alerts"],
  },
];

const BRAIN_LOG = [
  { time: "NOW", msg: "Project requirements extracted and stored." },
  { time: "–", msg: "Feasibility engine armed. Awaiting scan." },
  { time: "–", msg: "Team context initialized." },
  { time: "–", msg: "Pipeline ready to execute." },
];

export default function MissionDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [loadMode, setLoadMode] = useState<"choice" | "terminal" | "game" | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [pipeline, setPipeline] = useState<PipelineStage[]>(INITIAL_PIPELINE);
  const [selectedStage, setSelectedStage] = useState<string>("requirements");
  const [brainLog, setBrainLog] = useState(BRAIN_LOG);
  const pipelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const auth = getAuth();
    if (!auth) { router.push("/login"); return; }
    if (!id) return;
    getProject(id)
      .then(res => {
        setProject(res.data);
        setPipeline(generatePipeline(res.data)); // generate unique pipeline for THIS project
        setEditForm({
          name: res.data.name,
          time_budget_value: res.data.time_budget?.value || res.data.time_budget_value || 10,
          time_budget_unit: res.data.time_budget?.unit || res.data.time_budget_unit || "days",
          constraints: res.data.constraints?.[0]?.replace("Team: ", "") || "1 Frontend, 1 Backend",
        });
      })
      .catch(() => setError("Could not load mission."))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleUpdate = async () => {
    try {
      const res = await updateProject(id, {
        name: editForm.name,
        time_budget: { value: editForm.time_budget_value, unit: editForm.time_budget_unit },
        constraints: [`Team: ${editForm.constraints}`],
      });
      setProject(res.data);
      setEditing(false);
    } catch {
      alert("Failed to update mission parameters.");
    }
  };

  const handleGeneratePlaybook = async () => {
    setGenerating(true);
    setLoadMode("choice");
    setError("");
    
    // Animate stages one by one dynamically based on the current pipeline
    const stageIds = pipeline.map(s => s.id);
    for (let i = 0; i < stageIds.length; i++) {
      if (stageIds[i] === "requirements") continue; // Already done

      setPipeline(p => p.map(s =>
        s.id === stageIds[i] ? { ...s, status: "RUNNING" } : s
      ));
      setSelectedStage(stageIds[i]);
      
      const currentAgent = pipeline.find(s => s.id === stageIds[i])?.agent || "AI Agent";
      setBrainLog(prev => [{ time: "NOW", msg: `Dispatching ${currentAgent}...` }, ...prev.slice(0, 5)]);
      
      await new Promise(r => setTimeout(r, 600));
    }
    
    try {
      await generatePlaybook(id);
      setPipeline(p => p.map(s => ({ ...s, status: "DONE" })));
      setBrainLog(prev => [{ time: "NOW", msg: "✅ Pipeline complete. Playbook ready!" }, ...prev.slice(0, 5)]);
      router.push(`/dashboard/${id}/playbook`);
    } catch {
      setError("Could not generate playbook. AI may be warming up.");
      setGenerating(false);
      setLoadMode(null);
      // Revert to generated initial state, not the hardcoded one
      setPipeline(project ? generatePipeline(project as any) : INITIAL_PIPELINE);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError("");
    setBrainLog(prev => [{ time: "NOW", msg: "Running feasibility scan..." }, ...prev.slice(0, 5)]);
    try {
      const res = await analyzeProject(id);
      setAnalysis(res.data);
      setBrainLog(prev => [{ time: "NOW", msg: `Score: ${res.data?.feasibility?.score}/10 — ${res.data?.feasibility?.verdict}` }, ...prev.slice(0, 5)]);
    } catch {
      setError("Analysis failed. Try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return <div style={{ padding: 48, fontFamily: "JetBrains Mono", color: "#0066CC" }}>⏳ Loading mission...</div>;

  const timeVal = project?.time_budget?.value || project?.time_budget_value;
  const timeUnit = project?.time_budget?.unit || project?.time_budget_unit;
  const selected = pipeline.find(s => s.id === selectedStage)!;

  const statusColor: Record<StageStatus, string> = {
    LOCKED: "#9ca3af", QUEUED: "#d97706", RUNNING: "#0066CC", DONE: "#16a34a",
  };
  const statusBg: Record<StageStatus, string> = {
    LOCKED: "#f3f4f6", QUEUED: "#fef3c7", RUNNING: "#dbeafe", DONE: "#dcfce7",
  };
  const statusLabel: Record<StageStatus, string> = {
    LOCKED: "🔒 LOCKED", QUEUED: "⏳ QUEUED", RUNNING: "⚡ RUNNING", DONE: "✅ DONE",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF9F6" }}>
      {/* Nav */}
      <nav style={{ borderBottom: "3px solid #0066CC", display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", padding: "16px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link href="/" style={{ textDecoration: "none" }}><span style={{ fontFamily: "Press Start 2P", fontSize: "14px", color: "#0066CC" }}>TeamForge</span></Link>
          <span style={{ fontFamily: "JetBrains Mono", fontSize: "11px", color: "#CC0066", fontWeight: "bold" }}>[ MISSION BRIEFING ]</span>
        </div>
        <Link href="/dashboard" style={{ fontFamily: "JetBrains Mono", fontSize: "13px", color: "#0066CC", fontWeight: "bold", textDecoration: "none" }}>&lt; All Missions</Link>
      </nav>

      <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "48px 48px" }}>
        {project && (
          <>
            {/* Header row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "48px", flexWrap: "wrap", gap: "24px" }}>
              <div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: "11px", color: "#CC0066", marginBottom: "6px", letterSpacing: "3px" }}>[ MISSION ACTIVE ]</div>
                <h1 style={{ fontFamily: "Press Start 2P", fontSize: "18px", color: "#001133", lineHeight: 1.5, marginBottom: "8px" }}>{project.name}</h1>
                {timeVal && (
                  <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: "12px", color: "#0066CC", background: "#dbeafe", padding: "4px 10px", border: "1px solid #0066CC" }}>⏱ {timeVal} {timeUnit?.toUpperCase()}</span>
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: "12px", color: "#7c3aed", background: "#ede9fe", padding: "4px 10px", border: "1px solid #7c3aed" }}>👥 {project.constraints?.[0]?.replace("Team: ", "") || "Not set"}</span>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button onClick={() => setEditing(!editing)} className="arcade-btn-secondary" style={{ padding: "8px 16px", fontSize: "10px" }}>
                  {editing ? "[ CANCEL ]" : "[ EDIT ]"}
                </button>
                {!generating ? (
                  <button onClick={handleGeneratePlaybook} className="arcade-btn-primary" style={{ fontSize: "10px", padding: "10px 20px" }}>
                    ▶ RUN PIPELINE
                  </button>
                ) : (
                  <Link href={`/dashboard/${id}/playbook`} className="arcade-btn-secondary" style={{ textDecoration: "none", display: "inline-block", fontSize: "10px", padding: "10px 20px" }}>→ VIEW PLAYBOOK</Link>
                )}
              </div>
            </div>

            {/* Edit form */}
            {editing && (
              <div className="arcade-card" style={{ padding: "20px", marginBottom: "24px", background: "#fff9c4", border: "3px solid #eab308" }}>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <input type="number" className="arcade-input" value={editForm.time_budget_value} onChange={e => setEditForm({ ...editForm, time_budget_value: Number(e.target.value) })} style={{ width: "90px" }} />
                  <select className="arcade-input" value={editForm.time_budget_unit} onChange={e => setEditForm({ ...editForm, time_budget_unit: e.target.value })}>
                    <option value="hours">HOURS</option><option value="days">DAYS</option><option value="weeks">WEEKS</option>
                  </select>
                  <input className="arcade-input" placeholder="Team composition" value={editForm.constraints} onChange={e => setEditForm({ ...editForm, constraints: e.target.value })} style={{ flex: 1 }} />
                  <button onClick={handleUpdate} className="arcade-btn-primary" style={{ background: "#eab308", borderColor: "#ca8a04", boxShadow: "4px 4px 0 #a16207" }}>[ SAVE ]</button>
                </div>
              </div>
            )}

            {/* Problem / Idea */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "32px", rowGap: "32px", marginBottom: "48px" }}>
              <div className="arcade-card" style={{ padding: "32px" }}>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: "10px", color: "#0066CC", marginBottom: "12px", letterSpacing: "2px" }}>THE PROBLEM</div>
                <p style={{ fontFamily: "JetBrains Mono", fontSize: "14px", color: "#1A1A1A", lineHeight: "1.8" }}>{project.problem_statement}</p>
              </div>
              <div className="arcade-card" style={{ padding: "32px" }}>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: "10px", color: "#0066CC", marginBottom: "12px", letterSpacing: "2px" }}>YOUR IDEA</div>
                <p style={{ fontFamily: "JetBrains Mono", fontSize: "14px", color: "#1A1A1A", lineHeight: "1.8" }}>{project.idea}</p>
              </div>
            </div>

            {/* ══════════════════════════════════ PIPELINE ══════════════════════════════════ */}
            <div className="arcade-card" style={{ marginBottom: "48px", background: "#001133", padding: "32px", border: "4px solid #0066CC", boxShadow: "8px 8px 0 #CC0066" }}>
              {/* Section header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: "11px", color: "#CC0066", letterSpacing: "3px", marginBottom: "8px" }}>[ ENGINEERING EXECUTION PIPELINE ]</div>
                  <div style={{ fontFamily: "Press Start 2P", fontSize: "14px", color: "white" }}>BUILD WORKFLOW</div>
                </div>
                {generating && (
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: "12px", color: "#00EE55", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="blink">⚡</span> AGENTS EXECUTING...
                  </div>
                )}
              </div>

              {/* Horizontal pipeline nodes — with retro scroll controls */}
              <div style={{ position: "relative" }}>
                {/* Left scroll arrow */}
                <button
                  onClick={() => pipelineRef.current?.scrollBy({ left: -200, behavior: "smooth" })}
                  style={{
                    position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", zIndex: 10,
                    background: "#001133", border: "2px solid #0066CC", color: "#0066CC",
                    fontFamily: "JetBrains Mono", fontSize: "18px", fontWeight: "bold",
                    width: "36px", height: "36px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "3px 3px 0 #CC0066",
                  }}
                >◀</button>

                <div ref={pipelineRef} className="no-scrollbar" style={{ overflowX: "auto", paddingBottom: "8px", paddingLeft: "44px", paddingRight: "44px" }}>
                <div style={{ display: "flex", alignItems: "center", minWidth: "max-content", gap: "0", padding: "8px 0" }}>
                  {pipeline.map((stage, idx) => {
                    const isSelected = selectedStage === stage.id;
                    const isDone = stage.status === "DONE";
                    const isRunning = stage.status === "RUNNING";
                    const isLocked = stage.status === "LOCKED";
                    return (
                      <div key={stage.id} style={{ display: "flex", alignItems: "center" }}>
                        {/* Stage node */}
                        <button
                          onClick={() => setSelectedStage(stage.id)}
                          style={{
                            display: "flex", flexDirection: "column", alignItems: "center",
                            justifyContent: "space-between",
                            width: "140px", minHeight: "130px", padding: "16px 10px",
                            background: isSelected ? "#0A0A0A" : isLocked ? "#1A1A1A" : "#001133",
                            border: `3px solid ${isSelected ? stage.agentColor : isLocked ? "#333" : stage.agentColor + "66"}`,
                            boxShadow: isSelected ? `0 0 0 3px ${stage.agentColor}44, 4px 4px 0 ${stage.agentColor}` : "4px 4px 0 #000",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            position: "relative",
                          }}
                        >
                          {/* Running pulse ring */}
                          {isRunning && (
                            <div style={{
                              position: "absolute", inset: "-6px",
                              border: `2px dashed ${stage.agentColor}`,
                              animation: "blink 0.8s step-end infinite",
                            }} />
                          )}
                          {/* Icon */}
                          <div style={{ fontSize: "28px", filter: isLocked ? "grayscale(1) opacity(0.3)" : "none", lineHeight: 1, flexShrink: 0 }}>
                            {stage.icon}
                          </div>
                          {/* Label — Fixed Height and JetBrains Mono */}
                          <div style={{
                            fontFamily: "JetBrains Mono", fontSize: "11px", fontWeight: "bold",
                            color: isLocked ? "#666" : "white",
                            textAlign: "center", lineHeight: "1.4",
                            height: "32px", display: "flex", alignItems: "center", justifyContent: "center",
                            overflow: "hidden",
                          }}>{stage.label}</div>
                          {/* Status pill */}
                          <div style={{
                            fontFamily: "JetBrains Mono", fontSize: "9px", fontWeight: "bold",
                            color: isLocked ? "#444" : isDone ? "#00EE55" : stage.agentColor,
                            background: isLocked ? "#0A0A0A" : "#001133",
                            padding: "4px 10px",
                            border: `2px solid ${isLocked ? "#333" : isDone ? "#00EE55" : stage.agentColor}`,
                            flexShrink: 0,
                          }}>
                            {stage.status === "RUNNING" ? "⚡ RUN" : stage.status === "DONE" ? "✓ DONE" : stage.status === "QUEUED" ? "⏳ NEXT" : "🔒"}
                          </div>
                        </button>

                        {/* Connector */}
                        {idx < pipeline.length - 1 && (
                          <div style={{ display: "flex", alignItems: "center", width: "48px", flexShrink: 0 }}>
                            <div style={{
                              height: "4px", flex: 1,
                              background: pipeline[idx + 1].status !== "LOCKED"
                                ? stage.agentColor
                                : "#333",
                            }} />
                            <div style={{ color: pipeline[idx + 1].status !== "LOCKED" ? stage.agentColor : "#333", fontSize: "16px", lineHeight: 1, marginLeft: "-4px" }}>▶</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

                {/* Right scroll arrow */}
                <button
                  onClick={() => pipelineRef.current?.scrollBy({ left: 200, behavior: "smooth" })}
                  style={{
                    position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", zIndex: 10,
                    background: "#001133", border: "2px solid #0066CC", color: "#0066CC",
                    fontFamily: "JetBrains Mono", fontSize: "18px", fontWeight: "bold",
                    width: "36px", height: "36px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "3px 3px 0 #CC0066",
                  }}
                >▶</button>
              </div>

              {/* Selected stage detail card */}
              {selected && (
                <div style={{
                  marginTop: "24px",
                  background: "white",
                  border: `2px solid ${selected.agentColor}`,
                  borderTop: `4px solid ${selected.agentColor}`,
                  padding: "32px 40px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "40px",
                }}
                  className="flex flex-col md:grid"
                >
                  {/* Left: agent info */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                      <div style={{
                        width: "48px", height: "48px", borderRadius: "50%",
                        background: selected.bg, border: `2px solid ${selected.agentColor}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "22px",
                      }}>{selected.agentIcon}</div>
                      <div>
                        <div style={{ fontFamily: "Press Start 2P", fontSize: "10px", color: selected.agentColor, marginBottom: "4px" }}>{selected.agent}</div>
                        <div style={{ fontFamily: "JetBrains Mono", fontSize: "11px", color: "#555" }}>Handling: <strong>{selected.label}</strong></div>
                      </div>
                      <div style={{
                        marginLeft: "auto",
                        background: statusBg[selected.status],
                        color: statusColor[selected.status],
                        fontFamily: "JetBrains Mono", fontSize: "10px", fontWeight: "bold",
                        padding: "6px 12px", border: `1px solid ${statusColor[selected.status]}`,
                      }}>{statusLabel[selected.status]}</div>
                    </div>
                    <p style={{ fontFamily: "JetBrains Mono", fontSize: "13px", color: "#374151", lineHeight: "1.7" }}>{selected.desc}</p>
                  </div>

                  {/* Right: task checklist */}
                  <div>
                    <div style={{ fontFamily: "JetBrains Mono", fontSize: "10px", color: "#9ca3af", marginBottom: "12px", letterSpacing: "2px" }}>TASK CHECKLIST</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {selected.tasks.map((task, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{
                            width: "18px", height: "18px", border: `2px solid ${selected.agentColor}`,
                            background: selected.status === "DONE" ? selected.agentColor : selected.status === "RUNNING" && i === 0 ? selected.agentColor : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "10px", color: "white", flexShrink: 0,
                          }}>
                            {(selected.status === "DONE" || (selected.status === "RUNNING" && i === 0)) ? "✓" : ""}
                          </div>
                          <span style={{
                            fontFamily: "JetBrains Mono", fontSize: "12px",
                            color: selected.status === "LOCKED" ? "#9ca3af" : "#374151",
                            textDecoration: selected.status === "DONE" ? "line-through" : "none",
                          }}>{task}</span>
                          {selected.status === "RUNNING" && i === 0 && (
                            <span style={{ fontFamily: "JetBrains Mono", fontSize: "9px", color: selected.agentColor, fontWeight: "bold" }} className="blink">RUNNING</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ══ Two column: Brain Panel + Feasibility ══ */}
            <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "40px", alignItems: "start" }} className="flex flex-col-reverse lg:grid">

              {/* Project Brain */}
              <div className="arcade-card" style={{ background: "#001133", border: "2px solid #0066CC", padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "16px" }}>🧠</span>
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: "10px", color: "#00EE55", letterSpacing: "2px" }}>[ PROJECT BRAIN ]</span>
                </div>
                <div style={{ fontFamily: "Press Start 2P", fontSize: "10px", color: "#0066CC", marginBottom: "16px" }}>MEMORY LOG</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
                  {brainLog.map((entry, i) => (
                    <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start", opacity: i === 0 ? 1 : 0.5 }}>
                      <span style={{ fontFamily: "JetBrains Mono", fontSize: "9px", color: "#4b5563", flexShrink: 0 }}>{entry.time}</span>
                      <span style={{ fontFamily: "JetBrains Mono", fontSize: "11px", color: i === 0 ? "#00EE55" : "#6b7280", lineHeight: "1.5" }}>&gt; {entry.msg}</span>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: "1px solid #1e3a5f", paddingTop: "16px", marginBottom: "16px" }}>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: "10px", color: "#0066CC", marginBottom: "10px" }}>AGENT ROSTER</div>
                  {[
                    { name: "Architect", icon: "⚙️", color: "#7c3aed", online: true },
                    { name: "Backend", icon: "🔧", color: "#0891b2", online: true },
                    { name: "Frontend", icon: "🖥️", color: "#CC0066", online: true },
                    { name: "Testing", icon: "✅", color: "#16a34a", online: true },
                    { name: "DevOps", icon: "☁️", color: "#d97706", online: false },
                  ].map(a => (
                    <div key={a.name} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: a.online ? "#00EE55" : "#374151", boxShadow: a.online ? "0 0 6px #00EE55" : "none" }} />
                      <span style={{ fontSize: "13px" }}>{a.icon}</span>
                      <span style={{ fontFamily: "JetBrains Mono", fontSize: "11px", color: a.online ? a.color : "#4b5563" }}>{a.name} Agent</span>
                      <span style={{ marginLeft: "auto", fontFamily: "JetBrains Mono", fontSize: "9px", color: a.online ? "#00EE55" : "#374151" }}>{a.online ? "ONLINE" : "PHASE 3"}</span>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: "1px solid #1e3a5f", paddingTop: "12px" }}>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: "10px", color: "#4b5563", marginBottom: "4px" }}>RocketRide Orchestration</div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: "11px", color: "#d97706" }}>⏳ Phase 3 — Workflow engine</div>
                </div>
              </div>

              {/* Feasibility + actions */}
              <div>
                {error && <div style={{ fontFamily: "JetBrains Mono", fontSize: "12px", color: "#CC0066", border: "1px solid #CC0066", padding: "12px 16px", marginBottom: "16px" }}>&gt; {error}</div>}

                {!analysis && (
                  <div className="arcade-card" style={{ padding: "28px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "16px" }}>
                    <div style={{ fontFamily: "Press Start 2P", fontSize: "12px", color: "#001133" }}>NEXT STEPS</div>
                    <p style={{ fontFamily: "JetBrains Mono", fontSize: "13px", color: "#555", lineHeight: "1.7" }}>
                      Run a <strong>Feasibility Scan</strong> to validate your idea before launching the pipeline — or go straight to generating your build playbook.
                    </p>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                      <button onClick={handleAnalyze} className="arcade-btn-primary" disabled={analyzing} style={{ background: "#CC0066", borderColor: "#880044", boxShadow: "4px 4px 0 #880044", fontSize: "10px" }}>
                        {analyzing ? "[ SCANNING... ]" : "[ 🔍 Feasibility Scan ]"}
                      </button>
                      <Link href={`/dashboard/${id}/playbook`} className="arcade-btn-secondary" style={{ textDecoration: "none", display: "inline-block", fontSize: "10px" }}>[ View Existing Playbook ]</Link>
                    </div>
                  </div>
                )}

                {analysis && (
                  <div className="arcade-card" style={{ padding: "28px", background: "#F0F8FF", border: "2px solid #0066CC" }}>
                    <div style={{ fontFamily: "Press Start 2P", fontSize: "12px", color: "#0066CC", marginBottom: "20px" }}>[ FEASIBILITY REPORT ]</div>
                    <div style={{ display: "flex", gap: "32px", marginBottom: "20px", flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontFamily: "JetBrains Mono", fontSize: "10px", color: "#0066CC", marginBottom: "4px" }}>SCORE</div>
                        <div style={{ fontFamily: "Press Start 2P", fontSize: "28px", color: analysis.feasibility.score > 7 ? "#16a34a" : "#d97706" }}>{analysis.feasibility.score}/10</div>
                      </div>
                      <div>
                        <div style={{ fontFamily: "JetBrains Mono", fontSize: "10px", color: "#0066CC", marginBottom: "4px" }}>VERDICT</div>
                        <div style={{ fontFamily: "JetBrains Mono", fontSize: "14px", fontWeight: "bold", color: analysis.feasibility.score > 7 ? "#16a34a" : "#d97706" }}>
                          {analysis.feasibility.verdict?.toUpperCase().replace("_", " ")}
                        </div>
                      </div>
                    </div>
                    <p style={{ fontFamily: "JetBrains Mono", fontSize: "13px", color: "#1A1A1A", lineHeight: "1.7", marginBottom: "16px" }}>{analysis.feasibility.reasoning}</p>
                    {analysis.capabilities?.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
                        {analysis.capabilities.map((c: any, i: number) => (
                          <span key={i} style={{ background: "white", border: "1px solid #0066CC", padding: "4px 10px", fontSize: "11px", fontFamily: "JetBrains Mono", color: "#0066CC" }}>{c.name}</span>
                        ))}
                      </div>
                    )}
                    <button onClick={handleGeneratePlaybook} disabled={generating} className="arcade-btn-primary" style={{ fontSize: "10px" }}>
                      {generating ? "[ RUNNING... ]" : "[ ▶ RUN PIPELINE NOW ]"}
                    </button>
                  </div>
                )}

                {/* Generating loading state */}
                {generating && (
                  <div className="arcade-card" style={{ padding: "24px", marginTop: "16px", border: "3px solid #0066CC" }}>
                    <div style={{ fontFamily: "Press Start 2P", fontSize: "12px", color: "#0066CC", marginBottom: "16px" }} className="blink">[ AGENTS EXECUTING... ]</div>
                    {loadMode === "choice" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <p style={{ fontFamily: "JetBrains Mono", fontSize: "13px", color: "#555" }}>While the pipeline runs, choose a waiting mode:</p>
                        <div style={{ display: "flex", gap: "12px" }}>
                          <button onClick={() => setLoadMode("terminal")} className="arcade-btn-secondary" style={{ fontSize: "10px" }}>[ Watch Terminal ]</button>
                          <button onClick={() => setLoadMode("game")} className="arcade-btn-primary" style={{ fontSize: "10px" }}>[ Play Snake 🐍 ]</button>
                        </div>
                      </div>
                    )}
                    {loadMode === "game" && <SquadSnake />}
                    {loadMode === "terminal" && (
                      <div style={{ background: "#18181b", padding: "20px", fontFamily: "JetBrains Mono", fontSize: "12px", color: "#00EE55", lineHeight: "2.2" }}>
                        <div>&gt; Architect Agent: Designing system topology... ⚡</div>
                        <div>&gt; Backend Agent: <span style={{ color: "#9ca3af" }}>QUEUED</span></div>
                        <div>&gt; Frontend Agent: <span style={{ color: "#9ca3af" }}>QUEUED</span></div>
                        <div>&gt; Testing Agent: <span style={{ color: "#9ca3af" }}>QUEUED</span></div>
                        <div>&gt; <span className="blink">Awaiting pipeline completion...</span></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
