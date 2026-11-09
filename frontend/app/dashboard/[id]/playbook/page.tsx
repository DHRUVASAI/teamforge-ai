"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getPlaybook, askMentor, getArchitecture } from "@/lib/api";
import { getAuth } from "@/lib/auth";
import MermaidDiagram from "@/components/MermaidDiagram";

export default function PlaybookPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [playbook, setPlaybook] = useState<any>(null);
  const [arch, setArch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: string, text: string}[]>([]);

  const fetchPlaybookAndArch = () => {
    Promise.all([
      getPlaybook(id).then(res => setPlaybook(res.data)).catch(() => setError("Could not load playbook.")),
      getArchitecture(id).then(res => setArch(res.data)).catch(() => {})
    ]).finally(() => setLoading(false));
  };

  useEffect(() => {
    const auth = getAuth();
    if (!auth) { router.push("/login"); return; }
    if (!id) return;
    fetchPlaybookAndArch();
    // Real-time syncing simulation: polling every 15 seconds
    const interval = setInterval(fetchPlaybookAndArch, 15000);
    return () => clearInterval(interval);
  }, [id, router]);

  const toggleStep = (stepId: string) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const copyToClipboard = (text: string, e: React.MouseEvent) => {
    navigator.clipboard.writeText(text);
    const target = e.target as HTMLButtonElement;
    const originalText = target.innerText;
    target.innerText = "[ COPIED! ]";
    setTimeout(() => { target.innerText = originalText; }, 2000);
  };

  const sendMentorMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMsg.trim()) return;
    const newHistory = [...chatHistory, { role: 'user', text: chatMsg }];
    setChatHistory(newHistory);
    setChatMsg("");
    
    try {
      const auth = getAuth();
      const res = await askMentor(id, { question: chatMsg, member_id: auth?.user?.user_id || "unknown" });
      setChatHistory([...newHistory, { role: 'ai', text: res.data.answer }]);
    } catch (err) {
      setChatHistory([...newHistory, { role: 'ai', text: "ERROR: Connection to NVIDIA Mentor interrupted." }]);
    }
  };

  if (loading) return <div style={{ padding: 48, fontFamily: 'JetBrains Mono' }}>Loading mission playbook &amp; architecture...</div>;

  const evaluations = playbook?.evaluations || [];
  const stages = playbook?.stages || [];
  
  let totalSteps = 0;
  let finishedSteps = 0;
  stages.forEach((stage: any, stageIdx: number) => {
    (stage.steps || []).forEach((step: any, stepIdx: number) => {
      totalSteps++;
      if (completedSteps[`${stageIdx}-${stepIdx}`]) finishedSteps++;
    });
  });
  const progressPercent = totalSteps === 0 ? 0 : Math.round((finishedSteps / totalSteps) * 100);

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6' }}>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .anim-card {
          animation: slideUpFade 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          opacity: 0;
        }
        .anim-step {
          animation: slideUpFade 0.4s ease-out forwards;
          opacity: 0;
        }
        .hover-lift {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 8px 8px 0 #003366 !important;
        }
        .editable-field:hover {
          background: #f1f5f9;
          outline: 1px dashed #0066CC;
          cursor: text;
        }
      `}} />

      <nav style={{ borderBottom: '3px solid #0066CC', padding: '16px 48px', display: 'flex', justifyContent: 'space-between', background: 'white', position: 'sticky', top: 0, zIndex: 10, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link href={`/dashboard/${id}`} style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', color: '#0066CC', textDecoration: 'none', fontWeight: 'bold' }}>&lt; Back to Mission Brief</Link>
          <span style={{ fontFamily: 'Press Start 2P', fontSize: '8px', color: '#0066CC' }} className="blink">&gt;&gt;&gt; MISSION PLAYBOOK &lt;&lt;&lt;</span>
        </div>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', color: '#001133' }}>
          PROGRESS: <span style={{ color: progressPercent === 100 ? '#22c55e' : '#CC0066', fontWeight: 'bold', transition: 'color 0.3s' }}>{progressPercent}%</span>
        </div>
      </nav>

      <div style={{ padding: '48px 64px', maxWidth: '1050px', margin: '0 auto' }}>
        {error && <div style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#CC0066', border: '1px solid #CC0066', padding: '12px 16px', marginBottom: '24px' }}>&gt; {error}</div>}
        
        {playbook && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            
            <div className="anim-card" style={{ textAlign: 'center', animationDelay: '0.1s' }}>
              <h1 style={{ fontFamily: 'Press Start 2P', fontSize: '24px', color: '#001133', lineHeight: 1.5, marginBottom: '24px' }}>INTERACTIVE BUILD PLAN</h1>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#64748b', marginBottom: '16px' }}>
                <span>STATUS: <strong style={{ color: playbook.generation_status === 'SUCCESS' ? '#16a34a' : (playbook.generation_status === 'FALLBACK' ? '#e11d48' : '#d97706') }}>{playbook.generation_status || 'SUCCESS'}</strong></span>
                {playbook.provider_used && <span>MODEL: <strong>{playbook.provider_used}</strong></span>}
                {playbook.latency_ms && <span>LATENCY: <strong>{playbook.latency_ms}ms</strong></span>}
              </div>

              <div style={{ width: '100%', height: '16px', background: 'white', border: '2px solid #001133', boxShadow: '4px 4px 0 #003366', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${progressPercent}%`, background: '#22c55e', transition: 'width 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}></div>
              </div>
            </div>

            {playbook.generation_status === 'FALLBACK' && (
              <div style={{
                background: '#fff1f2',
                border: '3px solid #e11d48',
                boxShadow: '6px 6px 0 #881337',
                padding: '24px 32px',
                fontFamily: 'JetBrains Mono',
                color: '#9f1239'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'Press Start 2P', fontSize: '10px', color: '#e11d48' }}>
                    [!] RUNTIME NOTICE: DEGRADED LOCAL FALLBACK ACTIVE
                  </span>
                </div>
                <div style={{ fontSize: '13px', lineHeight: 1.6, marginBottom: '16px' }}>
                  The AI orchestration provider encountered rate limits or connection interruptions. 
                  This playbook was generated using the deterministic baseline fallback and <strong>must not be confused with full AI output</strong>.
                  {playbook.fallback_reason && (
                    <div style={{ marginTop: '8px', padding: '8px 12px', background: '#ffe4e6', borderLeft: '3px solid #e11d48', fontSize: '12px' }}>
                      Diagnostic Trace: {playbook.fallback_reason}
                    </div>
                  )}
                </div>
                <Link
                  href={`/dashboard/${id}`}
                  style={{
                    display: 'inline-block',
                    background: '#e11d48',
                    color: 'white',
                    fontFamily: 'Press Start 2P',
                    fontSize: '9px',
                    padding: '10px 16px',
                    textDecoration: 'none',
                    boxShadow: '3px 3px 0 #881337'
                  }}
                >
                  &lt; RETURN &amp; RETRY WITH DEDICATED MODEL
                </Link>
              </div>
            )}
            
            {/* ══ STAGE 1: BESPOKE ARCHITECTURE & TOPOLOGY ══ */}
            <div className="arcade-card anim-card hover-lift" style={{ padding: '32px', border: '3px solid #0066CC', boxShadow: '6px 6px 0 #003366', animationDelay: '0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ fontFamily: 'Press Start 2P', fontSize: '15px', color: '#CC0066' }}>[ STAGE 1: SYSTEM ARCHITECTURE ]</h2>
                {arch?.tier && (
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#0066CC', background: '#E0F2FE', padding: '6px 14px', border: '1px solid #0066CC', fontWeight: 'bold' }}>
                    BLUEPRINT: {arch.tier.toUpperCase()}
                  </span>
                )}
              </div>

              {arch?.bespoke_rationale && (
                <div style={{ background: '#F8FAFC', borderLeft: '4px solid #0066CC', padding: '16px 20px', marginBottom: '24px' }}>
                  <div style={{ fontFamily: 'Press Start 2P', fontSize: '9px', color: '#0066CC', marginBottom: '6px' }}>ARCHITECTURAL RATIONALE:</div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#334155', lineHeight: '1.6' }}>
                    {arch.bespoke_rationale}
                  </div>
                  {arch.deployment_recommendation && (
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#64748B', marginTop: '8px' }}>
                      <strong>Topology:</strong> {arch.deployment_recommendation}
                    </div>
                  )}
                </div>
              )}

              {/* Visual Mermaid Architecture Diagram */}
              {arch?.diagram_mermaid && (
                <div style={{ marginBottom: '32px' }}>
                  <MermaidDiagram code={arch.diagram_mermaid} title={arch.tier} />
                </div>
              )}

              {/* Domain Components Breakdown */}
              {arch?.components && arch.components.length > 0 && (
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ fontFamily: 'Press Start 2P', fontSize: '11px', color: '#001133', marginBottom: '16px', letterSpacing: '1px' }}>
                    &gt; DOMAIN COMPONENTS &amp; DATA OWNERSHIP:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    {arch.components.map((comp: any, cIdx: number) => (
                      <div key={cIdx} style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderTop: '3px solid #CC0066', padding: '16px', boxShadow: '2px 2px 0 #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', fontWeight: 'bold', color: '#001133' }}>{comp.name}</span>
                          {comp.data_ownership?.storage && (
                            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', background: '#ECFDF5', color: '#059669', border: '1px solid #10B981', padding: '2px 8px', fontWeight: 'bold' }}>
                              {comp.data_ownership.storage}
                            </span>
                          )}
                        </div>
                        <p style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#475569', lineHeight: '1.5', marginBottom: '10px' }}>
                          {comp.responsibility}
                        </p>
                        {comp.data_ownership?.schema_tables && comp.data_ownership.schema_tables.length > 0 && (
                          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#94A3B8' }}>
                            Tables: {comp.data_ownership.schema_tables.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tool Evaluator Matrix */}
              {evaluations.length > 0 && (
                <div>
                  <div style={{ fontFamily: 'Press Start 2P', fontSize: '11px', color: '#001133', marginBottom: '16px', letterSpacing: '1px' }}>
                    &gt; RECOMMENDED TOOL ACCELERATORS:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                    {evaluations.map((ev: any, idx: number) => (
                      <div key={idx} style={{ background: '#f8fafc', padding: '20px', border: '1px solid #cbd5e1', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform='scale(1.02)'} onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
                        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#0066CC', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 'bold' }}>{ev.capability}</div>
                        <div style={{ fontFamily: 'Press Start 2P', fontSize: '11px', color: '#001133', marginBottom: '12px', lineHeight: '1.4' }}>{ev.winning_tool}</div>
                        <div className="editable-field" contentEditable suppressContentEditableWarning style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#555', lineHeight: '1.5', padding: '4px' }}>{ev.rationale}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ══ STAGE 2: EXECUTION TRACKS ══ */}
            <div className="arcade-card anim-card" style={{ padding: '40px', border: '3px solid #0066CC', boxShadow: '6px 6px 0 #003366', animationDelay: '0.4s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h2 style={{ fontFamily: 'Press Start 2P', fontSize: '16px', color: '#0066CC' }}>[ STAGE 2: EXECUTION TRACKS ]</h2>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#888' }}>&lt; LIVE SYNC ENABLED &gt;</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                {stages.map((stage: any, stageIdx: number) => (
                  <div key={stageIdx} className="anim-step" style={{ animationDelay: `${0.5 + (stageIdx * 0.2)}s` }}>
                    <div className="editable-field" contentEditable suppressContentEditableWarning style={{ fontFamily: 'Press Start 2P', fontSize: '12px', color: '#001133', marginBottom: '8px', padding: '4px' }}>
                      PHASE 0{stageIdx + 1}: {stage.name.toUpperCase()}
                    </div>
                    <div className="editable-field" contentEditable suppressContentEditableWarning style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', color: '#555', marginBottom: '24px', borderBottom: '2px dashed #0066CC', paddingBottom: '16px', paddingLeft: '4px' }}>
                      {stage.description}
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {(stage.steps || []).map((step: any, stepIdx: number) => {
                        const stepKey = `${stageIdx}-${stepIdx}`;
                        const isDone = completedSteps[stepKey];
                        return (
                          <div key={stepIdx} className="hover-lift" style={{ 
                            borderLeft: `4px solid ${isDone ? '#22c55e' : '#0066CC'}`, 
                            padding: '16px 24px',
                            background: isDone ? '#f0fdf4' : 'white',
                            border: '1px solid #e2e8f0',
                            borderLeftWidth: '4px',
                            transition: 'all 0.3s',
                            opacity: isDone ? 0.7 : 1
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <button onClick={() => toggleStep(stepKey)} style={{
                                  width: '24px', height: '24px', border: '2px solid #001133',
                                  background: isDone ? '#22c55e' : 'white',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: '12px', cursor: 'pointer', color: 'white', fontWeight: 'bold'
                                }}>
                                  {isDone && "✓"}
                                </button>
                                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', fontWeight: 'bold', color: isDone ? '#64748b' : '#001133', textDecoration: isDone ? 'line-through' : 'none' }}>
                                  {step.instruction}
                                </span>
                              </div>
                              {step.ai_prompt && (
                                <button onClick={(e) => copyToClipboard(step.ai_prompt, e)} className="arcade-btn-secondary" style={{ padding: '6px 12px', fontSize: '9px', border: '1px solid #001133' }}>
                                  [ COPY PROMPT ]
                                </button>
                              )}
                            </div>

                            {step.ai_prompt && (
                              <div style={{ background: '#001133', border: '2px solid #0066CC', padding: '16px', position: 'relative', marginTop: '12px' }}>
                                <div style={{ position: 'absolute', top: '-10px', left: '16px', background: '#0066CC', color: 'white', fontFamily: 'Press Start 2P', fontSize: '8px', padding: '2px 8px' }}>
                                  AI PROMPT
                                </div>
                                <pre style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00FF41', whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.6 }}>
                                  {step.ai_prompt}
                                </pre>
                              </div>
                            )}

                            {step.context_files && step.context_files.length > 0 && (
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '12px' }}>
                                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#888' }}>CONTEXT:</span>
                                {step.context_files.map((file: string, fIdx: number) => (
                                  <span key={fIdx} style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', background: '#e2e8f0', color: '#475569', padding: '2px 6px', borderRadius: '2px' }}>
                                    {file}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Floating AI Engineer Mentor Chat Toggle */}
      <div style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 100 }}>
        {!chatOpen ? (
          <button 
            onClick={() => setChatOpen(true)}
            style={{ 
              background: '#CC0066', color: 'white', border: '3px solid #001133', 
              boxShadow: '4px 4px 0 #001133', padding: '16px 24px', 
              fontFamily: 'Press Start 2P', fontSize: '11px', cursor: 'pointer' 
            }}
            className="hover-lift"
          >
            💬 ASK AI MENTOR
          </button>
        ) : (
          <div style={{ width: '420px', height: '520px', background: '#001133', border: '3px solid #CC0066', boxShadow: '8px 8px 0 #000', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: '#CC0066', color: 'white', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'Press Start 2P', fontSize: '10px' }}>AI ENGINEER MENTOR</span>
              <button onClick={() => setChatOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: '16px' }}>✕</button>
            </div>
            
            <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#002244', border: '1px solid #004488', padding: '12px', color: '#38BDF8', fontFamily: 'JetBrains Mono', fontSize: '11px', lineHeight: 1.5 }}>
                &gt; I am your Omniscient Lead Engineer. Ask me anything about your architecture, database schema, or step-by-step implementation.
              </div>
              {chatHistory.map((item, idx) => (
                <div key={idx} style={{ 
                  alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start',
                  background: item.role === 'user' ? '#CC0066' : '#002244',
                  color: 'white',
                  padding: '10px 14px',
                  maxWidth: '85%',
                  border: '1px solid #001133',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '11px',
                  lineHeight: 1.5
                }}>
                  {item.text}
                </div>
              ))}
            </div>

            <form onSubmit={sendMentorMsg} style={{ display: 'flex', borderTop: '2px solid #004488' }}>
              <input 
                type="text" 
                value={chatMsg} 
                onChange={(e) => setChatMsg(e.target.value)} 
                placeholder="Ask architect why..."
                style={{ flex: 1, background: '#000A1A', color: 'white', border: 'none', padding: '12px', fontFamily: 'JetBrains Mono', fontSize: '11px', outline: 'none' }}
              />
              <button type="submit" style={{ background: '#0066CC', color: 'white', border: 'none', padding: '0 16px', fontFamily: 'Press Start 2P', fontSize: '10px', cursor: 'pointer' }}>
                SEND
              </button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}
