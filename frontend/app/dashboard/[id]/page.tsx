"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getProject, generatePlaybook, analyzeProject, updateProject } from "@/lib/api";
import { getAuth } from "@/lib/auth";

interface Project {
  project_id?: string;
  id?: string;
  name: string;
  problem_statement: string;
  idea: string;
  time_budget?: { value: number, unit: string };
  time_budget_value?: number;
  time_budget_unit?: string;
  constraints?: string[];
}

const SnakeGame = () => {
  return (
    <div style={{ width: '100%', minHeight: '680px', position: 'relative', border: '3px solid #001233', overflow: 'hidden', background: '#f4f2f0' }}>
      <iframe 
        src="/snake-game.html" 
        style={{ width: '100%', height: '100%', border: 'none', outline: 'none', position: 'absolute', top: 0, left: 0 }}
        title="Squad Snake"
      />
    </div>
  );
};

export default function MissionDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [loadMode, setLoadMode] = useState<'choice' | 'terminal' | 'game' | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => {
    const auth = getAuth();
    if (!auth) { router.push("/login"); return; }
    if (!id) return;
    getProject(id)
      .then(res => {
        setProject(res.data);
        setEditForm({
          name: res.data.name,
          time_budget_value: res.data.time_budget?.value || res.data.time_budget_value || 10,
          time_budget_unit: res.data.time_budget?.unit || res.data.time_budget_unit || 'days',
          constraints: res.data.constraints?.[0]?.replace('Team: ', '') || '1 Frontend, 1 Backend'
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
        constraints: [`Team: ${editForm.constraints}`]
      });
      setProject(res.data);
      setEditing(false);
    } catch (e) {
      alert("Failed to update mission parameters.");
    }
  };

  const handleGeneratePlaybook = async () => {
    setGenerating(true);
    setLoadMode('choice');
    setError("");
    try {
      await generatePlaybook(id);
      router.push(`/dashboard/${id}/playbook`);
    } catch {
      setError("Could not generate playbook. AI may be warming up.");
      setGenerating(false);
      setLoadMode(null);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError("");
    try {
      const res = await analyzeProject(id);
      setAnalysis(res.data);
    } catch {
      setError("Analysis failed. Try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return <div style={{ padding: 48, fontFamily: 'JetBrains Mono' }}>Loading mission...</div>;

  const timeVal = project?.time_budget?.value || project?.time_budget_value;
  const timeUnit = project?.time_budget?.unit || project?.time_budget_unit;

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6' }}>
      <nav style={{ borderBottom: '3px solid #0066CC', padding: '16px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}><span style={{ fontFamily: 'Press Start 2P', fontSize: '14px', color: '#0066CC' }}>TeamForge</span></Link>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#CC0066', fontWeight: 'bold' }}>[ MISSION BRIEFING ]</span>
        </div>
        <Link href="/dashboard" style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', color: '#0066CC', fontWeight: 'bold', textDecoration: 'none' }}>&lt; All Missions</Link>
      </nav>
      
      <div style={{ padding: '48px 64px', maxWidth: '900px' }}>
        {project && (
          <>
            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontFamily: 'Press Start 2P', fontSize: '20px', color: '#001133', marginBottom: '8px', lineHeight: 1.5 }}>{project.name}</h1>
                {timeVal && <div style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#0066CC' }}>TIME: {timeVal} {timeUnit?.toUpperCase()} | TEAM: {project.constraints?.[0]?.replace('Team: ', '') || 'Unknown'}</div>}
              </div>
              <button onClick={() => setEditing(!editing)} className="arcade-btn-secondary" style={{ padding: '8px 16px', fontSize: '10px' }}>
                {editing ? '[ CANCEL EDIT ]' : '[ EDIT PARAMETERS ]'}
              </button>
            </div>
            
            {editing && (
              <div className="arcade-card" style={{ padding: '24px', marginBottom: '40px', background: '#fff9c4', border: '3px solid #eab308' }}>
                <h2 style={{ fontFamily: 'Press Start 2P', fontSize: '12px', color: '#eab308', marginBottom: '16px' }}>[ UPDATE CONSTRAINTS ]</h2>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <input type="number" className="arcade-input" value={editForm.time_budget_value} onChange={e => setEditForm({...editForm, time_budget_value: Number(e.target.value)})} style={{ width: '100px' }} />
                  <select className="arcade-input" value={editForm.time_budget_unit} onChange={e => setEditForm({...editForm, time_budget_unit: e.target.value})}>
                    <option value="hours">HOURS</option>
                    <option value="days">DAYS</option>
                    <option value="weeks">WEEKS</option>
                  </select>
                  <input className="arcade-input" placeholder="Team (e.g. 1 Frontend, 2 Backend)" value={editForm.constraints} onChange={e => setEditForm({...editForm, constraints: e.target.value})} style={{ flex: 1 }} />
                </div>
                <button onClick={handleUpdate} className="arcade-btn-primary" style={{ background: '#eab308', borderColor: '#ca8a04', boxShadow: '4px 4px 0 #a16207' }}>[ SAVE CHANGES ]</button>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
              <div className="arcade-card" style={{ padding: '24px' }}>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#0066CC', marginBottom: '8px' }}>THE PROBLEM</div>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', color: '#1A1A1A', lineHeight: '1.7' }}>{project.problem_statement}</p>
              </div>
              <div className="arcade-card" style={{ padding: '24px' }}>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#0066CC', marginBottom: '8px' }}>YOUR IDEA</div>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', color: '#1A1A1A', lineHeight: '1.7' }}>{project.idea}</p>
              </div>
            </div>

            {error && <div style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#CC0066', border: '1px solid #CC0066', padding: '12px 16px', marginBottom: '24px' }}>&gt; {error}</div>}
            
            {!analysis && (
                <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
                  <button onClick={handleAnalyze} className="arcade-btn-primary" disabled={analyzing} style={{ background: '#CC0066', borderColor: '#880044', boxShadow: '4px 4px 0 #880044' }}>
                    {analyzing ? '[ SCANNING... ]' : '[ Run Feasibility Scan ]'}
                  </button>
                </div>
            )}

            {analysis && (
              <div className="arcade-card" style={{ padding: '32px', marginBottom: '40px', background: '#F0F8FF' }}>
                <h2 style={{ fontFamily: 'Press Start 2P', fontSize: '14px', color: '#0066CC', marginBottom: '24px' }}>[ FEASIBILITY REPORT ]</h2>
                
                <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                  <div>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#0066CC', marginBottom: '4px' }}>SCORE</div>
                    <div style={{ fontFamily: 'Press Start 2P', fontSize: '24px', color: analysis.feasibility.score > 7 ? '#22c55e' : '#eab308' }}>{analysis.feasibility.score}/10</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#0066CC', marginBottom: '4px' }}>VERDICT</div>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '14px', fontWeight: 'bold' }}>{analysis.feasibility.verdict.toUpperCase().replace('_', ' ')}</div>
                  </div>
                </div>
                
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#0066CC', marginBottom: '8px' }}>REASONING</div>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', color: '#1A1A1A', lineHeight: '1.6' }}>{analysis.feasibility.reasoning}</p>
                </div>

                {analysis.feasibility.proposed_scope_reduction.length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#CC0066', marginBottom: '8px' }}>REQUIRED SCOPE REDUCTIONS</div>
                    <ul style={{ listStyle: 'square', paddingLeft: '20px', fontFamily: 'JetBrains Mono', fontSize: '13px', color: '#CC0066' }}>
                      {analysis.feasibility.proposed_scope_reduction.map((r: string, i: number) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                )}

                <div>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#0066CC', marginBottom: '8px' }}>DETECTED REQUIRED CAPABILITIES</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {analysis.capabilities.map((c: any, i: number) => (
                        <span key={i} style={{ background: 'white', border: '1px solid #0066CC', padding: '4px 8px', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>{c.name} ({c.complexity})</span>
                      ))}
                    </div>
                </div>

              </div>
            )}

            {/* GENERATION INLINE UI */}
            {!generating ? (
              <div style={{ display: 'flex', gap: '16px' }}>
                <button onClick={handleGeneratePlaybook} className="arcade-btn-primary">
                  [ Generate My Build Plan ]
                </button>
                <Link href={`/dashboard/${id}/playbook`} className="arcade-btn-secondary" style={{ textDecoration: 'none', display: 'inline-block' }}>[ View Existing Playbook ]</Link>
              </div>
            ) : (
              <div className="arcade-card" style={{ padding: '32px', background: 'white', border: '3px solid #0066CC' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ fontFamily: 'Press Start 2P', fontSize: '16px', color: '#0066CC' }} className="blink">[ AI IS THINKING... ]</h2>
                </div>

                {loadMode === 'choice' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', color: '#1A1A1A' }}>While NVIDIA Nemotron builds your playbook, choose a waiting protocol:</div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <button onClick={() => setLoadMode('terminal')} className="arcade-btn-secondary">[ Watch Terminal ]</button>
                      <button onClick={() => setLoadMode('game')} className="arcade-btn-primary">[ Play Snake ]</button>
                    </div>
                  </div>
                )}

                {loadMode === 'game' && <SnakeGame />}

                {loadMode === 'terminal' && (
                  <div style={{ background: '#f8fafc', border: '2px solid #cbd5e1', padding: '24px', position: 'relative', overflow: 'hidden' }}>
                    <style dangerouslySetInnerHTML={{__html: `
                      @keyframes typeReveal { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
                      .line-1 { animation: typeReveal 0.2s ease-out forwards; opacity: 0; }
                      .line-2 { animation: typeReveal 0.2s ease-out 0.5s forwards; opacity: 0; }
                      .line-3 { animation: typeReveal 0.2s ease-out 1.2s forwards; opacity: 0; }
                      .line-4 { animation: typeReveal 0.2s ease-out 1.8s forwards; opacity: 0; }
                      .line-5 { animation: typeReveal 0.2s ease-out 2.5s forwards; opacity: 0; }
                      .line-6 { animation: typeReveal 0.2s ease-out 3.2s forwards; opacity: 0; }
                      .line-7 { animation: typeReveal 0.2s ease-out 3.8s forwards; opacity: 0; }
                    `}} />
                    <div style={{ fontFamily: 'JetBrains Mono', color: '#0066CC', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px' }}>TEAMFORGE.EXE - SYSTEM LOG</div>
                    <div style={{ lineHeight: '2.5', fontSize: '13px', color: '#334155', fontFamily: 'JetBrains Mono' }}>
                      <div className="line-1">&gt; Initiating lazy architecture protocol... [OK]</div>
                      <div className="line-2">&gt; Extracting team capability vector... [OK]</div>
                      <div className="line-3">&gt; Injecting constraints to AI Evaluator... [OK]</div>
                      <div className="line-4" style={{ color: '#CC0066', fontWeight: 'bold' }}>&gt; NVIDIA Reasoning Engine: Evaluating optimal BaaS tools...</div>
                      <div className="line-5">&gt; Compiling workstream DAG... [OK]</div>
                      <div className="line-6">&gt; Generating interactive checklist schema...</div>
                      <div className="line-7" style={{ color: '#0066CC', fontWeight: 'bold' }}>&gt; <span className="blink">Awaiting final JSON payload...</span></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
