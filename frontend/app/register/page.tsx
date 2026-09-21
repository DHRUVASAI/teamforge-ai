"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

const STEPS = [
  { num: "01", label: "Drop your idea" },
  { num: "02", label: "AI architects your stack" },
  { num: "03", label: "Get your playbook" },
  { num: "04", label: "Build & ship with your squad" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await register(form);
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
        <Link href="/login" style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#0066CC', textDecoration: 'none' }}>[ ALREADY HAVE AN ACCOUNT? → ]</Link>
      </div>

      {/* Full-bleed two-column layout */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 'calc(100vh - 40px)' }}>

        {/* LEFT — Register Form */}
        <div style={{ background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 64px' }}>
          <div style={{ width: '100%', maxWidth: '420px' }}>
            <div style={{ marginBottom: '40px' }}>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#CC0066', letterSpacing: '4px', marginBottom: '16px' }}>[ NEW COMMANDER ]</div>
              <div style={{ fontFamily: 'Press Start 2P', fontSize: '22px', color: '#001133', lineHeight: 1.5, marginBottom: '12px' }}>JOIN THE<br/>MISSION.</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '14px', color: '#666' }}>Create your account and start building with AI in under 60 seconds.</div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#0066CC', display: 'block', marginBottom: '8px', letterSpacing: '2px' }}>YOUR NAME</label>
                <input
                  className="arcade-input"
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Commander Name"
                  style={{ fontSize: '15px', padding: '14px 16px' }}
                />
              </div>

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
                  minLength={6}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Min. 6 characters"
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
                {loading ? '[ CREATING SQUAD... ]' : '[ START YOUR MISSION ]'}
              </button>
            </form>

            <div style={{ marginTop: '32px', padding: '20px', background: '#FAF9F6', border: '2px solid #e5e7eb', textAlign: 'center' }}>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', color: '#666', marginBottom: '8px' }}>Already a commander?</div>
              <Link href="/login" style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', color: '#0066CC', textDecoration: 'underline' }}>
                Log in to your account →
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT — Visual Onboarding Panel */}
        <div style={{ background: '#001133', padding: '80px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Dot grid background */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(204,0,102,0.2) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#CC0066', letterSpacing: '4px', marginBottom: '24px' }}>[ HOW IT WORKS ]</div>
            <h2 style={{ fontFamily: 'Press Start 2P', fontSize: '20px', color: 'white', lineHeight: 1.6, marginBottom: '16px' }}>FROM IDEA TO<br/>SHIPPED IN<br/>4 STEPS.</h2>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: '64px' }}>
              TeamForge AI compresses weeks of planning into minutes.
            </p>

            {/* Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
              {STEPS.map((step, i) => (
                <div key={step.num} style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', paddingBottom: i < STEPS.length - 1 ? '32px' : '0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: '48px', height: '48px', background: '#CC0066', border: '3px solid #CC0066', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: 'Press Start 2P', fontSize: '10px', color: 'white' }}>{step.num}</span>
                    </div>
                    {i < STEPS.length - 1 && <div style={{ width: '2px', flex: 1, minHeight: '24px', background: 'rgba(204,0,102,0.3)', marginTop: '4px' }} />}
                  </div>
                  <div style={{ paddingTop: '12px' }}>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '15px', color: 'white', fontWeight: 'bold' }}>{step.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div style={{ marginTop: '64px', padding: '24px', border: '2px solid rgba(0,102,204,0.4)', background: 'rgba(0,102,204,0.1)' }}>
              <div style={{ fontFamily: 'Press Start 2P', fontSize: '8px', color: '#0066CC', marginBottom: '12px' }}>POWERED BY</div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {['NVIDIA NIM', 'Google Gemini', 'Groq LPU'].map(brand => (
                  <span key={brand} style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'white', padding: '4px 10px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
