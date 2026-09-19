"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

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
      <div style={{ background: '#FAF9F6', borderBottom: '3px solid #0066CC', padding: '8px 16px' }}>
        <span style={{ fontFamily: 'Press Start 2P', fontSize: '8px', color: '#0066CC' }} className="blink">&gt;&gt;&gt; TEAMFORGE COMMAND SYSTEM v2.0 &lt;&lt;&lt;</span>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div className="arcade-card" style={{ padding: '40px' }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#CC0066', marginBottom: '16px' }}>[ COMMANDER LOGIN ]</div>
            <h1 style={{ fontFamily: 'Press Start 2P', fontSize: '16px', color: '#001133', marginBottom: '32px', lineHeight: '1.6' }}>WELCOME BACK</h1>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#0066CC', display: 'block', marginBottom: '6px' }}>EMAIL ADDRESS</label>
                <input className="arcade-input" type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="commander@squad.com" />
              </div>
              <div>
                <label style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#0066CC', display: 'block', marginBottom: '6px' }}>PASSWORD</label>
                <input className="arcade-input" type="password" required value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" />
              </div>
              {error && <div style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#CC0066', border: '1px solid #CC0066', padding: '8px 12px' }}>&gt; ERROR: {error}</div>}
              <button type="submit" className="arcade-btn-primary" disabled={loading} style={{ marginTop: '8px' }}>
                {loading ? '[ LOGGING IN... ]' : '[ ENTER COMMAND CENTER ]'}
              </button>
            </form>
            <div style={{ marginTop: '24px', fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#1A1A1A', textAlign: 'center' }}>
              No account? <Link href="/register" style={{ color: '#0066CC' }}>Join the Mission</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
