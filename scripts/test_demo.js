const tests = [
  { idea: "A multiplayer game", time: "24 Hours", squad: "2-4" },
  { idea: "An AI chatbot assistant", time: "1 Month", squad: "5+" },
  { idea: "An ecommerce store", time: "1 Week", squad: "Solo" },
  { idea: "A social network for dogs", time: "1 Month", squad: "5+" },
];

function simulate(demoIdea, demoTime, demoSquad) {
  const idea = demoIdea.toLowerCase();
  let frontend = "Next.js 14 (React)";
  let backend = "FastAPI (Python)";
  let database = "PostgreSQL";
  let infra = "Docker + AWS EC2";
  let special = "";

  if (idea.includes("mobile") || idea.includes("app") || idea.includes("ios") || idea.includes("android")) {
    frontend = "React Native (Expo)"; backend = "FastAPI (Python)";
    database = "PostgreSQL + Redis cache"; infra = "AWS ECS + CloudFront";
    special = "> PUSH NOTIFICATIONS: Firebase Cloud Messaging";
  } else if (idea.includes("game") || idea.includes("gaming") || idea.includes("multiplayer")) {
    frontend = "React + Phaser.js"; backend = "Node.js + Socket.io";
    database = "Redis (real-time) + PostgreSQL"; infra = "AWS GameLift";
    special = "> REAL-TIME: WebSocket rooms for multiplayer sync";
  } else if (idea.includes("ai") || idea.includes("ml") || idea.includes("chat") || idea.includes("bot")) {
    frontend = "Next.js 14 (React)"; backend = "FastAPI + LangChain";
    database = "PostgreSQL + Pinecone (vector DB)"; infra = "AWS EC2 + GPU instance";
    special = "> VECTOR STORE: Embeddings for semantic search";
  } else if (idea.includes("shop") || idea.includes("ecommerce") || idea.includes("store") || idea.includes("sell")) {
    frontend = "Next.js 14 (React)"; backend = "FastAPI (Python)";
    database = "PostgreSQL + Redis"; infra = "Vercel + AWS RDS";
    special = "> PAYMENTS: Stripe integration required";
  } else if (idea.includes("social") || idea.includes("network") || idea.includes("community") || idea.includes("feed")) {
    frontend = "Next.js 14 (React)"; backend = "FastAPI + WebSockets";
    database = "PostgreSQL + Redis (feed caching)"; infra = "AWS EC2 + S3 (media)";
    special = "> REAL-TIME FEED: Redis pub/sub for live updates";
  } else if (idea.includes("dashboard") || idea.includes("analytics") || idea.includes("data") || idea.includes("chart")) {
    frontend = "Next.js + Recharts"; backend = "FastAPI (Python)";
    database = "PostgreSQL + ClickHouse (analytics)"; infra = "AWS EC2 + CloudFront";
    special = "> ANALYTICS ENGINE: ClickHouse for high-speed queries";
  }

  const taskCount = demoTime === "24 Hours" ? 8 : demoTime === "1 Week" ? 18 : 42;
  const focusMode = demoTime === "24 Hours"
    ? "HACKATHON MODE: Skip auth boilerplate. Build core loop first. SQLite OK."
    : demoTime === "1 Week"
    ? "MVP MODE: JWT auth + core features. Local Postgres. Ship fast."
    : "ENTERPRISE MODE: Full CI/CD pipeline. Scalable DB. E2E test suite.";

  const squadLines = demoSquad === "Solo"
    ? "> SQUAD     : Solo dev — monorepo, no microservices, deploy all-in-one.\n> ROLE SPLIT: You own everything. Focus on speed, not scale."
    : demoSquad === "2-4"
    ? "> SQUAD     : Small team — 1 lead + devs, shared repo, feature branches.\n> ROLE SPLIT: FE dev, BE dev, shared DB + DevOps tasks."
    : "> SQUAD     : Full team — Lead Arch, 2 FE, 2 BE, 1 DevOps, 1 QA.\n> ROLE SPLIT: Parallel tracks. CI/CD from Day 1. PR review required.";

  let text = "";
  text += `[ TEAMFORGE AI ] Analyzing: "${demoIdea}"\n`;
  text += `[ SYSTEM ] Time: ${demoTime} | Squad: ${demoSquad} | Generating...\n\n`;
  text += `╔══════════════════════════════════╗\n`;
  text += `║     RECOMMENDED TECH STACK       ║\n`;
  text += `╚══════════════════════════════════╝\n\n`;
  text += `> FRONTEND  : ${frontend}\n`;
  text += `> BACKEND   : ${backend}\n`;
  text += `> DATABASE  : ${database}\n`;
  text += `> INFRA     : ${infra}\n`;
  if (special) text += special + "\n";
  text += "\n";
  text += squadLines + "\n";
  text += `\n[ AI ] Structuring ${demoTime} roadmap...\n`;
  text += `> ${focusMode}\n\n`;
  text += `╔══════════════════════════════════╗\n`;
  text += `║     PHASE BREAKDOWN              ║\n`;
  text += `╚══════════════════════════════════╝\n\n`;
  text += `> Phase 1 : Setup & Auth\n`;
  text += `> Phase 2 : Core Feature Build\n`;
  text += `> Phase 3 : UI & Integration\n`;
  if (demoTime !== "24 Hours") text += `> Phase 4 : Testing & Deploy\n`;
  if (demoTime === "1 Month") text += `> Phase 5 : Scale & Optimize\n`;
  text += `\n[ COMPLETE ] ${taskCount} micro-tasks generated across all phases.\n`;
  text += `\n> Log in to get the FULL interactive playbook with\n`;
  text += `  AI prompts, task assignments, and risk analysis. →`;

  console.log("\n" + "█".repeat(55));
  console.log(`  IDEA: ${demoIdea}`);
  console.log(`  TIME: ${demoTime}  |  SQUAD: ${demoSquad}`);
  console.log("█".repeat(55));
  console.log(text);
}

tests.forEach(t => simulate(t.idea, t.time, t.squad));
