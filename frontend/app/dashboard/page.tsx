"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAuth, clearAuth } from "@/lib/auth";
import { getProjects, getTeam, joinTeam } from "@/lib/api";

interface Project {
  project_id?: string;
  id?: string;
  name: string;
  problem_statement: string;
  time_budget?: { value: number, unit: string };
  time_budget_value?: number;
  time_budget_unit?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; user_id: string } | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState("");

  useEffect(() => {
    const auth = getAuth();
    if (!auth) { router.push("/login"); return; }
    setUser(auth.user);
    
    const fetchData = async () => {
      try {
        const projRes = await getProjects();
        setProjects(Array.isArray(projRes.data) ? projRes.data : []);
      } catch (e) {
        console.error("Failed to load projects", e);
        setProjects([]);
      }
      
      try {
        const teamRes = await getTeam();
        setTeam(teamRes.data);
      } catch (e) {
        console.error("Failed to load team", e);
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, [router]);

  const logout = () => { clearAuth(); router.push("/"); };

  const handleJoinTeam = async () => {
    if (!joinCode) return;
    try {
      const res = await joinTeam({ team_code: joinCode });
      setTeam(res.data);
      setJoinCode("");
    } catch (err) {
      alert("Invalid Team Code");
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6' }}>
      <div style={{ background: '#FAF9F6', borderBottom: '3px solid #0066CC', padding: '8px 16px', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'Press Start 2P', fontSize: '8px', color: '#0066CC' }} className="blink">&gt;&gt;&gt; MISSION CONTROL &lt;&lt;&lt;</span>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#CC0066' }}>COMMANDER: {user?.name?.toUpperCase()}</span>
      </div>

      <nav style={{ borderBottom: '2px solid #0066CC', padding: '16px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: 'Press Start 2P', fontSize: '14px', color: '#0066CC' }}>TeamForge</span>
        </Link>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', color: '#1A1A1A' }}>Mission Control</span>
          <Link href="/profile" className="arcade-btn-primary" style={{ fontSize: '9px', padding: '8px 16px', textDecoration: 'none' }}>[ PROFILE ]</Link>
          <button onClick={logout} className="arcade-btn-secondary" style={{ fontSize: '9px', padding: '8px 16px' }}>[ LOG OUT ]</button>
        </div>
      </nav>

      <div style={{ padding: '48px 64px', display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '48px' }}>
        
        {/* LEFT COLUMN: MISSIONS */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
            <div>
              <h1 style={{ fontFamily: 'Press Start 2P', fontSize: '20px', color: '#001133', marginBottom: '8px' }}>YOUR MISSIONS</h1>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', color: '#555' }}>All active engineering missions for your squad</p>
            </div>
            <Link href="/dashboard/new" className="arcade-btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>[ + New Mission ]</Link>
          </div>

          {loading ? (
            <div style={{ fontFamily: 'JetBrains Mono', color: '#0066CC', fontSize: '14px' }}>Loading missions...</div>
          ) : projects.length === 0 ? (
            <div className="arcade-card" style={{ padding: '48px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Press Start 2P', fontSize: '14px', color: '#001133', marginBottom: '16px' }}>NO MISSIONS YET</div>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', color: '#555', marginBottom: '24px' }}>Start your first mission and get your AI-powered build plan.</p>
              <Link href="/dashboard/new" className="arcade-btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>[ Start First Mission ]</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
              {projects.map(p => {
                const linkId = p.project_id || p.id;
                const timeVal = p.time_budget?.value || p.time_budget_value;
                const timeUnit = p.time_budget?.unit || p.time_budget_unit;
                return (
                  <Link key={linkId} href={`/dashboard/${linkId}`} style={{ textDecoration: 'none' }}>
                    <div className="arcade-card" style={{ padding: '24px', cursor: 'pointer' }}>
                      <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#CC0066', marginBottom: '8px' }}>[ MISSION ACTIVE ]</div>
                      <div style={{ fontFamily: 'Press Start 2P', fontSize: '12px', color: '#001133', marginBottom: '12px', lineHeight: '1.5' }}>{p.name}</div>
                      <p style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#555', lineHeight: '1.6', marginBottom: '16px' }}>{p.problem_statement?.substring(0, 100)}...</p>
                      {timeVal && <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#0066CC' }}>Time: {timeVal} {timeUnit}</div>}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        
        {/* RIGHT COLUMN: TEAM INFO */}
        <div>
          <div className="arcade-card" style={{ padding: '24px', background: '#f8fafc' }}>
            <h2 style={{ fontFamily: 'Press Start 2P', fontSize: '14px', color: '#0066CC', marginBottom: '24px' }}>[ YOUR SQUAD ]</h2>
            
            {team ? (
              <>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', fontWeight: 'bold', marginBottom: '16px' }}>{team.name}</div>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#555', marginBottom: '4px' }}>INVITE CODE:</div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '14px', background: 'white', padding: '8px', border: '2px dashed #0066CC', display: 'inline-block', color: '#CC0066', fontWeight: 'bold' }}>{team.team_code}</div>
                </div>
                
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#555', marginBottom: '12px', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>MEMBERS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                  {team.members.map((m: any) => (
                    <div key={m.user_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', fontWeight: 'bold' }}>{m.name}</span>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#CC0066', background: 'white', border: '1px solid #CC0066', padding: '2px 6px' }}>{m.role}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#555' }}>Loading team info...</div>
            )}
            
            <div style={{ borderTop: '2px dashed #cbd5e1', paddingTop: '24px' }}>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#001133', marginBottom: '8px', fontWeight: 'bold' }}>JOIN ANOTHER SQUAD</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input value={joinCode} onChange={e => setJoinCode(e.target.value)} placeholder="SQUAD-XXXXXX" className="arcade-input" style={{ padding: '8px', fontSize: '12px', flex: 1 }} />
                <button onClick={handleJoinTeam} className="arcade-btn-primary" style={{ padding: '8px', fontSize: '10px' }}>[ JOIN ]</button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
