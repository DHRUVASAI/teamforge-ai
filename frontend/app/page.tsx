"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isLoggedIn, getAuth } from "@/lib/auth";

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [scrollPos, setScrollPos] = useState(0);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setMounted(true);
    setAuthed(isLoggedIn());
    const handleScroll = () => setScrollPos(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleStart = () => {
    if (isLoggedIn()) {
      router.push("/dashboard");
    } else {
      router.push("/register");
    }
  };

  if (!mounted) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6', color: '#001133', overflow: 'hidden' }}>
      
      {/* GLOBAL ANIMATIONS */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatY {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes slideLeft {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes slideRight {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px #0066CC, inset 0 0 10px #0066CC; }
          50% { box-shadow: 0 0 40px #CC0066, inset 0 0 20px #CC0066; }
        }
        @keyframes scanlineMove {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
        .animated-bg {
          background-image: radial-gradient(#0066CC 1px, transparent 1px);
          background-size: 32px 32px;
          background-position: 0 0;
          animation: bgMove 20s linear infinite;
        }
        @keyframes bgMove {
          100% { background-position: 320px 320px; }
        }
        .glass-panel {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
        }
      `}} />

      {/* FIXED NAV */}
      <nav className="glass-panel" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid #001133' }}>
        <div style={{ fontFamily: 'Press Start 2P', fontSize: '20px', color: '#0066CC', textShadow: '2px 2px 0 #001133' }}>
          TeamForge<span style={{ color: '#CC0066' }}>.AI</span>
        </div>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <Link href={authed ? "/dashboard" : "/login"} style={{ fontFamily: 'JetBrains Mono', fontWeight: 'bold', fontSize: '14px', color: '#001133', textDecoration: 'none' }}>
              {authed ? '[ MISSION CONTROL ]' : '[ LOG IN ]'}
            </Link>
          <button onClick={handleStart} style={{ background: '#CC0066', color: 'white', border: '3px solid #001133', padding: '12px 24px', fontFamily: 'Press Start 2P', fontSize: '10px', cursor: 'pointer', boxShadow: '4px 4px 0 #001133', transition: 'transform 0.1s' }} onMouseDown={e => e.currentTarget.style.transform='translate(4px, 4px)'} onMouseUp={e => e.currentTarget.style.transform='translate(0, 0)'}>
            LAUNCH SYSTEM
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="animated-bg" style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '120px 24px 80px', overflow: 'hidden' }}>
        
        {/* Decorative Grid Lines */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '20%', width: '1px', background: 'rgba(0,102,204,0.2)' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, right: '20%', width: '1px', background: 'rgba(204,0,102,0.2)' }} />

        <div style={{ zIndex: 10, textAlign: 'center', animation: 'floatY 6s ease-in-out infinite' }}>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '16px', color: '#CC0066', fontWeight: 'bold', marginBottom: '24px', letterSpacing: '4px', background: 'white', display: 'inline-block', padding: '8px 16px', border: '2px dashed #CC0066' }}>
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

      {/* MASSIVE FEATURES GRID */}
      <section style={{ padding: '120px 48px', background: '#FAF9F6', position: 'relative' }}>
        <h2 style={{ fontFamily: 'Press Start 2P', fontSize: '32px', color: '#001133', textAlign: 'center', marginBottom: '80px' }}>[ CAPABILITIES ]</h2>
        
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '48px' }}>
          
          {/* Feature 1 */}
          <div style={{ background: 'white', border: '4px solid #0066CC', padding: '40px', boxShadow: '12px 12px 0 #001133', transform: `translateY(${scrollPos > 400 ? 0 : 50}px)`, opacity: scrollPos > 400 ? 1 : 0, transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
            <div style={{ fontSize: '48px', marginBottom: '24px' }}>🗺️</div>
            <h3 style={{ fontFamily: 'Press Start 2P', fontSize: '14px', color: '#0066CC', marginBottom: '16px', lineHeight: '1.5' }}>DYNAMIC ARCHITECTURE</h3>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: '14px', lineHeight: '1.7', color: '#333' }}>
              Input your problem and time limit. Whether you have 24 hours or 2 months, our AI instantly drafts the perfect stack—from simple monolithic SaaS to enterprise microservices.
            </p>
          </div>

          {/* Feature 2 */}
          <div style={{ background: 'white', border: '4px solid #CC0066', padding: '40px', boxShadow: '12px 12px 0 #001133', transform: `translateY(${scrollPos > 400 ? 0 : 50}px)`, opacity: scrollPos > 400 ? 1 : 0, transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.2s' }}>
            <div style={{ fontSize: '48px', marginBottom: '24px' }}>📋</div>
            <h3 style={{ fontFamily: 'Press Start 2P', fontSize: '14px', color: '#CC0066', marginBottom: '16px', lineHeight: '1.5' }}>INTERACTIVE PLAYBOOKS</h3>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: '14px', lineHeight: '1.7', color: '#333' }}>
              Stop guessing what to build next. Get a strictly ordered, multi-phase checklist. Every single step contains a pre-written AI prompt you can copy and paste into Cursor.
            </p>
          </div>

          {/* Feature 3 */}
          <div style={{ background: 'white', border: '4px solid #001133', padding: '40px', boxShadow: '12px 12px 0 #0066CC', transform: `translateY(${scrollPos > 400 ? 0 : 50}px)`, opacity: scrollPos > 400 ? 1 : 0, transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.4s' }}>
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
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#888' }}>© 2026. Built with NVIDIA Nemotron.</div>
      </footer>

    </div>
  );
}
