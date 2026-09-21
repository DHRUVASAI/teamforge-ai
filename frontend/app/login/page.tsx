"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

const FEATURES = [
  { icon: "⚡", title: "AI Architecture", desc: "Get a full tech stack in seconds." },
  { icon: "📋", title: "Smart Playbooks", desc: "Phase-by-phase build guides." },
  { icon: "🤖", title: "Mentor Chat", desc: "AI that knows your entire project." },
  { icon: "🎯", title: "Task Engine", desc: "Auto-assigns work to every dev." },
];

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await login(form);
      saveAuth(res.data.access_token, res.data);
      router.push("/dashboard");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr.response?.data?.detail || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ background: '#FAF9F6', borderBottom: '3px solid #0066CC', padding: '8px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Press Start 2P', fontSize: '8px', color: '#0066CC' }} className="blink">&gt;&gt;&gt; TEAMFORGE COMMAND SYSTEM v2.0 &lt;&lt;&lt;</span>
        <Link href="/register" style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#CC0066', textDecoration: 'none' }}>[ NEW COMMANDER? JOIN → ]</Link>
      </div>

      {/* Full-bleed two-column layout */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 'calc(100vh - 40px)' }}>

        {/* LEFT — Feature Showcase Panel */}
        <div style={{ background: '#001133', padding: '80px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Dot grid background */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(0,102,204,0.3) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#CC0066', letterSpacing: '4px', marginBottom: '24px' }}>[ COMMANDER LOGIN ]</div>
            <h1 style={{ fontFamily: 'Press Start 2P', fontSize: '28px', color: 'white', lineHeight: 1.5, marginBottom: '16px' }}>WELCOME<br/>BACK.</h1>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, marginBottom: '64px', maxWidth: '400px' }}>
              Your squad is waiting. Log back in and continue your mission where you left off.
            </p>

            {/* Feature list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {FEATURES.map((f) => (
                <div key={f.title} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', border: '2px solid rgba(0,102,204,0.4)', background: 'rgba(0,102,204,0.1)' }}>
                  <span style={{ fontSize: '28px', flexShrink: 0 }}>{f.icon}</span>
                  <div>
                    <div style={{ fontFamily: 'Press Start 2P', fontSize: '9px', color: '#0066CC', marginBottom: '4px' }}>{f.title}</div>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '48px', fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#00FF41' }}>
              ● SYSTEM STATUS: ALL 7 AI ENGINES ONLINE
            </div>
          </div>
        </div>

        {/* RIGHT — Login Form Panel */}
        <div style={{ background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 64px' }}>
          <div style={{ width: '100%', maxWidth: '420px' }}>
            <div style={{ marginBottom: '48px' }}>
              <div style={{ fontFamily: 'Press Start 2P', fontSize: '22px', color: '#001133', lineHeight: 1.5, marginBottom: '12px' }}>Sign In</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '14px', color: '#666' }}>Enter your credentials to access Mission Control.</div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#0066CC', display: 'block', marginBottom: '8px', letterSpacing: '2px' }}>EMAIL ADDRESS</label>
                <input
                  className="arcade-input"
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="commander@squad.com"
                  style={{ fontSize: '15px', padding: '14px 16px' }}
                />
              </div>

              <div>
                <label style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#0066CC', display: 'block', marginBottom: '8px', letterSpacing: '2px' }}>PASSWORD</label>
                <input
                  className="arcade-input"
                  type="password"
                  required
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  style={{ fontSize: '15px', padding: '14px 16px' }}
                />
              </div>

              {error && (
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#CC0066', border: '2px solid #CC0066', padding: '12px 16px', background: 'rgba(204,0,102,0.05)' }}>
                  &gt; ERROR: {error}
                </div>
              )}

              <button
                type="submit"
                className="arcade-btn-primary"
                disabled={loading}
                style={{ marginTop: '8px', padding: '18px', fontSize: '12px', width: '100%' }}
              >
                {loading ? '[ AUTHENTICATING... ]' : '[ ENTER COMMAND CENTER ]'}
              </button>
            </form>

            <div style={{ marginTop: '32px', padding: '24px', background: '#FAF9F6', border: '2px solid #e5e7eb', textAlign: 'center' }}>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', color: '#666', marginBottom: '8px' }}>No account yet?</div>
              <Link href="/register" className="arcade-btn-secondary" style={{ textDecoration: 'none', display: 'inline-block', fontSize: '10px', padding: '10px 24px' }}>
                [ JOIN THE MISSION ]
              </Link>
            </div>

            <div style={{ marginTop: '24px', fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#999', textAlign: 'center' }}>
              By signing in you agree to our Terms of Service
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
