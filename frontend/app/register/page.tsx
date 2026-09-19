"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

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
      <div style={{ background: '#FAF9F6', borderBottom: '3px solid #0066CC', padding: '8px 16px' }}>
        <span style={{ fontFamily: 'Press Start 2P', fontSize: '8px', color: '#0066CC' }} className="blink">&gt;&gt;&gt; TEAMFORGE COMMAND SYSTEM v2.0 &lt;&lt;&lt;</span>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div className="arcade-card" style={{ padding: '40px' }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#CC0066', marginBottom: '16px' }}>[ NEW COMMANDER ]</div>
            <h1 style={{ fontFamily: 'Press Start 2P', fontSize: '14px', color: '#001133', marginBottom: '32px', lineHeight: '1.6' }}>JOIN THE MISSION</h1>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#0066CC', display: 'block', marginBottom: '6px' }}>YOUR NAME</label>
                <input className="arcade-input" type="text" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Commander Name" />
              </div>
              <div>
                <label style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#0066CC', display: 'block', marginBottom: '6px' }}>EMAIL ADDRESS</label>
                <input className="arcade-input" type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="commander@squad.com" />
              </div>
              <div>
                <label style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#0066CC', display: 'block', marginBottom: '6px' }}>PASSWORD (min. 6 characters)</label>
                <input className="arcade-input" type="password" required minLength={6} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" />
              </div>
              {error && <div style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#CC0066', border: '1px solid #CC0066', padding: '8px 12px' }}>&gt; ERROR: {error}</div>}
              <button type="submit" className="arcade-btn-primary" disabled={loading} style={{ marginTop: '8px' }}>
                {loading ? '[ CREATING SQUAD... ]' : '[ START YOUR MISSION ]'}
              </button>
            </form>
            <div style={{ marginTop: '24px', fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#1A1A1A', textAlign: 'center' }}>
              Already a commander? <Link href="/login" style={{ color: '#0066CC' }}>Log In</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
