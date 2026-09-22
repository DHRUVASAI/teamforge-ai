"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "@/lib/auth";
import IntroOverlay from "@/components/IntroOverlay";
import FullscreenLoader, { type LoaderHandle } from "@/components/FullscreenLoader";

export default function Home() {
  const router = useRouter();
  const [isAuth,    setIsAuth]    = useState(false);
  const [scrollPos, setScrollPos] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const loaderRef = useRef<LoaderHandle>(null);

  // Demo State
  const [demoIdea, setDemoIdea] = useState("");
  const [demoTime, setDemoTime] = useState("1 Week");
  const [demoSquad, setDemoSquad] = useState("Solo");
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [demoOutput, setDemoOutput] = useState("");

  useEffect(() => {
    setIsAuth(!!getAuth());
    
    const handleScroll = () => {
      setScrollPos(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStart = async () => {
    const l = loaderRef.current?.show([
      "> INITIALIZING MISSION CONTROL",
      "> LOADING AI PIPELINE",
      "> PREPARING YOUR SQUAD",
      "> ALMOST READY...",
    ]);
    await new Promise(r => setTimeout(r, 2800));
    await l?.done();
    router.push(isAuth ? "/dashboard" : "/register");
  };

  const runDemo = () => {
    if (!demoIdea.trim()) {
      setDemoIdea("Please enter a project idea first!");
      return;
    }
    setIsDemoRunning(true);
    setDemoOutput("");

    const idea = demoIdea.toLowerCase();

    // Smart stack detection based on idea keywords
    let frontend = "Next.js 14 (React)";
    let backend = "FastAPI (Python)";
    let database = "PostgreSQL";
    let infra = "Docker + AWS EC2";
    let special = "";

    if (idea.includes("mobile") || idea.includes("app") || idea.includes("ios") || idea.includes("android")) {
      frontend = "React Native (Expo)";
      backend = "FastAPI (Python)";
      database = "PostgreSQL + Redis cache";
      infra = "AWS ECS + CloudFront";
      special = "> PUSH NOTIFICATIONS: Firebase Cloud Messaging\n";
    } else if (idea.includes("game") || idea.includes("gaming") || idea.includes("multiplayer")) {
      frontend = "React + Phaser.js";
      backend = "Node.js + Socket.io";
      database = "Redis (real-time) + PostgreSQL";
      infra = "AWS GameLift";
      special = "> REAL-TIME: WebSocket rooms for multiplayer sync\n";
    } else if (idea.includes("ai") || idea.includes("ml") || idea.includes("chat") || idea.includes("bot")) {
      frontend = "Next.js 14 (React)";
      backend = "FastAPI + LangChain";
      database = "PostgreSQL + Pinecone (vector DB)";
      infra = "AWS EC2 + GPU instance";
      special = "> VECTOR STORE: Embeddings for semantic search\n";
    } else if (idea.includes("shop") || idea.includes("ecommerce") || idea.includes("store") || idea.includes("sell")) {
      frontend = "Next.js 14 (React)";
      backend = "FastAPI (Python)";
      database = "PostgreSQL + Redis";
      infra = "Vercel + AWS RDS";
      special = "> PAYMENTS: Stripe integration required\n";
    } else if (idea.includes("social") || idea.includes("network") || idea.includes("community") || idea.includes("feed")) {
      frontend = "Next.js 14 (React)";
      backend = "FastAPI + WebSockets";
      database = "PostgreSQL + Redis (feed caching)";
      infra = "AWS EC2 + S3 (media)";
      special = "> REAL-TIME FEED: Redis pub/sub for live updates\n";
    } else if (idea.includes("dashboard") || idea.includes("analytics") || idea.includes("data") || idea.includes("chart")) {
      frontend = "Next.js + Recharts";
      backend = "FastAPI (Python)";
      database = "PostgreSQL + ClickHouse (analytics)";
      infra = "AWS EC2 + CloudFront";
      special = "> ANALYTICS ENGINE: ClickHouse for high-speed queries\n";
    }

    const taskCount = demoTime === "24 Hours" ? 8 : demoTime === "1 Week" ? 18 : 42;
    const focusMode = demoTime === "24 Hours"
      ? "HACKATHON MODE: Skip auth boilerplate. Build core loop first. SQLite OK."
      : demoTime === "1 Week"
      ? "MVP MODE: JWT auth + core features. Local Postgres. Ship fast."
      : "ENTERPRISE MODE: Full CI/CD pipeline. Scalable DB. E2E test suite.";

    // Squad size affects team structure and task split
    const squadLines =
      demoSquad === "Solo"
        ? "> SQUAD     : Solo dev — monorepo, no microservices, deploy all-in-one.\n> ROLE SPLIT: You own everything. Focus on speed, not scale.\n"
        : demoSquad === "2-4"
        ? "> SQUAD     : Small team — 1 lead + devs, shared repo, feature branches.\n> ROLE SPLIT: FE dev, BE dev, shared DB + DevOps tasks.\n"
        : "> SQUAD     : Full team — Lead Arch, 2 FE, 2 BE, 1 DevOps, 1 QA.\n> ROLE SPLIT: Parallel tracks. CI/CD from Day 1. PR review required.\n";

    let text = `[ TEAMFORGE AI ] Analyzing: "${demoIdea}"\n`;
    text += `[ SYSTEM ] Time: ${demoTime} | Squad: ${demoSquad} | Generating...\n\n`;
    text += `╔══════════════════════════════════╗\n`;
    text += `║     RECOMMENDED TECH STACK       ║\n`;
    text += `╚══════════════════════════════════╝\n\n`;
    text += `> FRONTEND  : ${frontend}\n`;
    text += `> BACKEND   : ${backend}\n`;
    text += `> DATABASE  : ${database}\n`;
    text += `> INFRA     : ${infra}\n`;
    if (special) text += special + "\n";
    text += `\n`;
    text += squadLines;
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

    let i = 0;
    const interval = setInterval(() => {
      setDemoOutput(prev => prev + text.charAt(i));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setIsDemoRunning(false);
      }
    }, 12);
  };

  return (
    <div className="min-h-screen" style={{ background: '#FAF9F6' }}>

      {/* ── Intro animation (first visit only) ── */}
      {showIntro && <IntroOverlay onDone={() => setShowIntro(false)} />}

      {/* ── Full-screen loader (START MISSION, etc.) ── */}
      <FullscreenLoader ref={loaderRef} />

      
      {/* GLOBAL STYLES & KEYFRAMES */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 0 rgba(0, 102, 204, 0.4); }
          70% { box-shadow: 0 0 0 20px rgba(0, 102, 204, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 102, 204, 0); }
        }
        @keyframes slideLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes slideRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        @keyframes glitch {
          0% { transform: translate(0) }
          20% { transform: translate(-2px, 2px) }
          40% { transform: translate(-2px, -2px) }
          60% { transform: translate(2px, 2px) }
          80% { transform: translate(2px, -2px) }
          100% { transform: translate(0) }
        }
        .retro-input::placeholder { color: #888; }
        .terminal-cursor { display: inline-block; width: 8px; height: 15px; background: #00FF41; animation: blink 1s step-end infinite; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}} />

      {/* HEADER */}
      <nav className="px-4 md:px-12" style={{ padding: '24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', borderBottom: '4px solid #001133', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ fontFamily: 'Press Start 2P', fontSize: '18px', color: '#001133' }}>
          TeamForge<span style={{ color: '#CC0066' }}>.AI</span>
        </div>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          {!isAuth && (
            <Link href="/login" style={{ fontFamily: 'JetBrains Mono', fontWeight: 'bold', color: '#001133', textDecoration: 'none', fontSize: '14px' }}>
              [ LOG IN ]
            </Link>
          )}
          <button onClick={handleStart} className="arcade-btn-secondary" style={{ padding: '12px 24px', fontSize: '12px' }}>
            {isAuth ? '[ MISSION CONTROL ]' : '[ LAUNCH SYSTEM ]'}
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="scanline" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '80px 0' }}>
        
        {/* Abstract Background Grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundSize: '40px 40px', backgroundImage: 'radial-gradient(circle, #0066CC 1px, transparent 1px)', opacity: 0.2 }} />
        <div style={{ position: 'absolute', left: '20%', top: 0, bottom: 0, width: '1px', background: 'rgba(0,102,204,0.2)' }} />
        <div style={{ position: 'absolute', right: '20%', top: 0, bottom: 0, width: '1px', background: 'rgba(204,0,102,0.1)' }} />

        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px' }}>
          <div style={{ fontFamily: 'JetBrains Mono', color: '#CC0066', fontWeight: 'bold', marginBottom: '24px', letterSpacing: '4px', border: '2px dashed #CC0066', display: 'inline-block', padding: '8px 16px' }}>
            &gt; SYSTEM INITIALIZED
          </div>
          
          <h1 style={{ fontFamily: 'Press Start 2P', fontSize: 'clamp(32px, 5vw, 64px)', lineHeight: '1.2', color: '#001133', marginBottom: '32px', textShadow: '4px 4px 0 rgba(0,102,204,0.3)', maxWidth: '1000px', margin: '0 auto 32px' }}>
            THE AI ENGINEER THAT <span style={{ color: '#0066CC', position: 'relative' }}>ACTUALLY BUILDS<span style={{ position: 'absolute', bottom: '-8px', left: 0, right: 0, height: '8px', background: '#CC0066' }}></span></span> WITH YOUR SQUAD.
          </h1>
          
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: '18px', color: '#333', maxWidth: '700px', margin: '0 auto 48px', lineHeight: '1.8', background: 'rgba(255,255,255,0.8)', padding: '24px', borderLeft: '8px solid #0066CC' }}>
            Generate enterprise architecture, divide tasks, and get real-time integration help from an AI that knows your entire codebase. Powered by NVIDIA Nemotron.
          </p>

          <button onClick={handleStart} style={{ 
            background: '#0066CC', color: 'white', border: '4px solid #001133', 
            padding: '24px 64px', fontFamily: 'Press Start 2P', fontSize: '16px', 
            cursor: 'pointer', boxShadow: '8px 8px 0 #CC0066', 
            transition: 'all 0.1s', animation: 'pulseGlow 4s infinite'
          }} onMouseDown={e => { e.currentTarget.style.transform='translate(8px, 8px)'; e.currentTarget.style.boxShadow='0 0 0 #CC0066'; }} onMouseUp={e => { e.currentTarget.style.transform='translate(0, 0)'; e.currentTarget.style.boxShadow='8px 8px 0 #CC0066'; }}>
            [ START MISSION ]
          </button>
        </div>
      </section>

      {/* MARQUEE SEPARATOR */}
      <div style={{ background: '#001133', borderTop: '4px solid #0066CC', borderBottom: '4px solid #CC0066', padding: '16px 0', overflow: 'hidden', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'inline-block', animation: 'slideLeft 20s linear infinite' }}>
          {[...Array(10)].map((_, i) => (
            <span key={i} style={{ fontFamily: 'Press Start 2P', fontSize: '14px', color: 'white', marginRight: '48px' }}>
              &gt; NEXT.JS &gt; FASTAPI &gt; SUPABASE &gt; POSTGRESQL &gt; PLAYWRIGHT 
            </span>
          ))}
        </div>
      </div>

      {/* INTERACTIVE DEMO SECTION */}
      <section style={{ padding: '120px 48px', background: 'white', position: 'relative' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#CC0066', letterSpacing: '4px', marginBottom: '16px' }}>[ LIVE PREVIEW ]</div>
            <h2 style={{ fontFamily: 'Press Start 2P', fontSize: '28px', color: '#001133', marginBottom: '20px' }}>TRY IT RIGHT NOW</h2>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: '16px', color: '#555', maxWidth: '600px', margin: '0 auto', lineHeight: 1.8 }}>
              No account needed. Type your idea and watch our AI architect design your entire system in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr]" style={{ gap: '0px', border: '4px solid #001133', boxShadow: '12px 12px 0 #CC0066' }}>
            
            {/* Left — Inputs */}
            <div className="border-b-4 lg:border-b-0 lg:border-r-4 border-[#001133]" style={{ padding: '48px 40px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div>
                <div style={{ fontFamily: 'Press Start 2P', fontSize: '10px', color: '#0066CC', marginBottom: '16px', letterSpacing: '1px' }}>&gt; WHAT ARE YOU BUILDING?</div>
                <textarea
                  placeholder="e.g. A social network for dogs with real-time barking feeds..."
                  value={demoIdea}
                  onChange={e => setDemoIdea(e.target.value)}
                  style={{ width: '100%', height: '160px', padding: '16px', border: '3px solid #001133', fontFamily: 'JetBrains Mono', fontSize: '14px', resize: 'none', outline: 'none', lineHeight: 1.7, background: 'white', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <div style={{ fontFamily: 'Press Start 2P', fontSize: '10px', color: '#CC0066', marginBottom: '16px', letterSpacing: '1px' }}>&gt; TIME LIMIT</div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {["24 Hours", "1 Week", "1 Month"].map(t => (
                    <button
                      key={t}
                      onClick={() => setDemoTime(t)}
                      style={{
                        flex: 1, padding: '14px 8px', border: '3px solid #001133',
                        background: demoTime === t ? '#CC0066' : 'white',
                        color: demoTime === t ? 'white' : '#001133',
                        fontFamily: 'JetBrains Mono', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer',
                        transition: 'all 0.1s'
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontFamily: 'Press Start 2P', fontSize: '10px', color: '#001133', marginBottom: '16px', letterSpacing: '1px' }}>&gt; TEAM SIZE</div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {["Solo", "2-4", "5+"].map(s => (
                    <button key={s} onClick={() => setDemoSquad(s)} style={{ flex: 1, padding: '14px 8px', border: '3px solid #001133', background: demoSquad === s ? '#0066CC' : 'white', color: demoSquad === s ? 'white' : '#001133', fontFamily: 'JetBrains Mono', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', transition: 'all 0.1s' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ flex: 1 }} />

              <button
                onClick={runDemo}
                disabled={isDemoRunning}
                style={{ width: '100%', padding: '22px', background: isDemoRunning ? '#555' : '#0066CC', color: 'white', border: '4px solid #001133', fontFamily: 'Press Start 2P', fontSize: '11px', cursor: isDemoRunning ? 'not-allowed' : 'pointer', boxShadow: isDemoRunning ? 'none' : '6px 6px 0 #001133', transition: 'all 0.1s' }}
              >
                {isDemoRunning ? '[ AI THINKING... ]' : '[ SIMULATE AI ARCHITECT ]'}
              </button>

              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#999', textAlign: 'center', lineHeight: 1.6 }}>
                ↑ Free preview. No signup required.
              </div>
            </div>

            {/* Right — Terminal Output */}
            <div style={{ background: '#0a0e1a', display: 'flex', flexDirection: 'column', minHeight: '600px' }}>
              {/* Terminal chrome bar */}
              <div style={{ background: '#1a1f2e', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '2px solid #0066CC', flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', background: '#CC0066', borderRadius: '50%' }} />
                  <div style={{ width: '12px', height: '12px', background: '#ebbb3d', borderRadius: '50%' }} />
                  <div style={{ width: '12px', height: '12px', background: '#00FF41', borderRadius: '50%' }} />
                </div>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginLeft: '8px' }}>teamforge-ai ~ output</span>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#00FF41', padding: '2px 8px', border: '1px solid #00FF41' }}>● LIVE</span>
                </div>
              </div>

              {/* Terminal body */}
              <div style={{ flex: 1, padding: '32px', overflowY: 'auto', position: 'relative' }}>
                <div className="scanline" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.3 }} />
                <pre style={{ fontFamily: 'JetBrains Mono', color: '#00FF41', fontSize: '14px', whiteSpace: 'pre-wrap', lineHeight: '1.8', margin: 0 }}>
                  {demoOutput || `// ═══════════════════════════════════════════\n// TEAMFORGE AI — ARCHITECTURE SIMULATOR\n// ═══════════════════════════════════════════\n//\n// Status  : ONLINE\n// Engines : NVIDIA + Gemini + Groq\n// Layers  : 7 / 7 Active\n//\n// ─────────────────────────────────────────\n//\n// Type your project idea on the left and\n// click [ SIMULATE AI ARCHITECT ] to watch\n// the AI design your full tech stack,\n// architecture, and development plan\n// in real-time.\n//\n// ─────────────────────────────────────────\n// Waiting for input...`}
                  {isDemoRunning && <span className="blink">█</span>}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* MASSIVE FEATURES GRID */}
      <section style={{ padding: '120px 48px', background: '#FAF9F6', position: 'relative' }}>
        <h2 style={{ fontFamily: 'Press Start 2P', fontSize: '32px', color: '#001133', textAlign: 'center', marginBottom: '80px' }}>[ CAPABILITIES ]</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ maxWidth: '1200px', margin: '0 auto', gap: '48px' }}>
          
          {/* Feature 1 */}
          <div style={{ background: 'white', border: '4px solid #0066CC', padding: '40px', boxShadow: '12px 12px 0 #001133', transform: `translateY(${scrollPos > 800 ? 0 : 50}px)`, opacity: scrollPos > 800 ? 1 : 0, transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
            <div style={{ fontSize: '48px', marginBottom: '24px' }}>⚡</div>
            <h3 style={{ fontFamily: 'Press Start 2P', fontSize: '14px', color: '#0066CC', marginBottom: '16px', lineHeight: '1.5' }}>DYNAMIC ARCHITECTURE</h3>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: '14px', lineHeight: '1.7', color: '#333' }}>
              Input your problem and time limit. Whether you have 24 hours or 2 months, our AI instantly drafts the perfect stack-from simple monolithic SaaS to enterprise microservices.
            </p>
          </div>

          {/* Feature 2 */}
          <div style={{ background: 'white', border: '4px solid #CC0066', padding: '40px', boxShadow: '12px 12px 0 #001133', transform: `translateY(${scrollPos > 800 ? 0 : 50}px)`, opacity: scrollPos > 800 ? 1 : 0, transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.2s' }}>
            <div style={{ fontSize: '48px', marginBottom: '24px' }}>📋</div>
            <h3 style={{ fontFamily: 'Press Start 2P', fontSize: '14px', color: '#CC0066', marginBottom: '16px', lineHeight: '1.5' }}>INTERACTIVE PLAYBOOKS</h3>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: '14px', lineHeight: '1.7', color: '#333' }}>
              Stop guessing what to build next. Get a strictly ordered, multi-phase checklist. Every single step contains a pre-written AI prompt you can copy and paste into Cursor.
            </p>
          </div>

          {/* Feature 3 */}
          <div style={{ background: 'white', border: '4px solid #001133', padding: '40px', boxShadow: '12px 12px 0 #0066CC', transform: `translateY(${scrollPos > 800 ? 0 : 50}px)`, opacity: scrollPos > 800 ? 1 : 0, transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.4s' }}>
            <div style={{ fontSize: '48px', marginBottom: '24px' }}>🤖</div>
            <h3 style={{ fontFamily: 'Press Start 2P', fontSize: '14px', color: '#001133', marginBottom: '16px', lineHeight: '1.5' }}>AI ENGINEER MENTOR</h3>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: '14px', lineHeight: '1.7', color: '#333' }}>
              Stuck connecting the backend to the frontend? Click the Mentor Chat window. Our NVIDIA-powered AI knows exactly what phase you are on and helps you integrate instantly.
            </p>
          </div>

        </div>
      </section>

      {/* MARQUEE SEPARATOR 2 */}
      <div style={{ background: '#001133', borderTop: '4px solid #CC0066', borderBottom: '4px solid #0066CC', padding: '16px 0', overflow: 'hidden', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'inline-block', animation: 'slideRight 20s linear infinite' }}>
          {[...Array(10)].map((_, i) => (
            <span key={i} style={{ fontFamily: 'Press Start 2P', fontSize: '14px', color: 'white', marginRight: '48px' }}>
              &lt; BUILD FASTER &lt; SHIP SOONER &lt; NO MORE BLOCKERS &lt; FULL SYNC 
            </span>
          ))}
        </div>
      </div>

      {/* CTA BANNER */}
      <section style={{ padding: '120px 24px', background: '#0066CC', textAlign: 'center', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)' }} />
        
        <div style={{ position: 'relative', zIndex: 10 }}>
          <h2 style={{ fontFamily: 'Press Start 2P', fontSize: '32px', marginBottom: '40px', textShadow: '4px 4px 0 #001133' }}>READY TO LAUNCH?</h2>
          <button onClick={handleStart} style={{ 
            background: 'white', color: '#0066CC', border: '4px solid #001133', 
            padding: '24px 64px', fontFamily: 'Press Start 2P', fontSize: '20px', 
            cursor: 'pointer', boxShadow: '12px 12px 0 #001133', transition: 'all 0.1s'
          }} onMouseDown={e => { e.currentTarget.style.transform='translate(12px, 12px)'; e.currentTarget.style.boxShadow='0 0 0 #001133'; }} onMouseUp={e => { e.currentTarget.style.transform='translate(0, 0)'; e.currentTarget.style.boxShadow='12px 12px 0 #001133'; }} onMouseOver={e => e.currentTarget.style.animation='glitch 0.3s'}>
            [ ENTER COMMAND CENTER ]
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#001133', padding: '48px', textAlign: 'center', borderTop: '4px solid white' }}>
        <div style={{ fontFamily: 'Press Start 2P', fontSize: '12px', color: 'white', marginBottom: '16px' }}>TeamForge<span style={{ color: '#CC0066' }}>.AI</span></div>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#888' }}>c 2026. Built with NVIDIA Nemotron.</div>
      </footer>

    </div>
  );
}
