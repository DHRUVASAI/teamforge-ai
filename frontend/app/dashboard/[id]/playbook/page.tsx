"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getPlaybook, askMentor } from "@/lib/api";
import { getAuth } from "@/lib/auth";

export default function PlaybookPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [playbook, setPlaybook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: string, text: string}[]>([]);

  const fetchPlaybook = () => {
    getPlaybook(id)
      .then(res => setPlaybook(res.data))
      .catch(() => setError("Could not load playbook."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const auth = getAuth();
    if (!auth) { router.push("/login"); return; }
    if (!id) return;
    fetchPlaybook();
    // Real-time syncing simulation: polling every 10 seconds
    const interval = setInterval(fetchPlaybook, 10000);
    return () => clearInterval(interval);
  }, [id, router]);

  const toggleStep = (stepId: string) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
    // In a real app, we would sync this state to backend here via API call
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

  if (loading) return <div style={{ padding: 48, fontFamily: 'JetBrains Mono' }}>Loading playbook...</div>;

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

      <div style={{ padding: '48px 64px', maxWidth: '1000px', margin: '0 auto' }}>
        {error && <div style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#CC0066', border: '1px solid #CC0066', padding: '12px 16px', marginBottom: '24px' }}>&gt; {error}</div>}
        
        {playbook && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            
            <div className="anim-card" style={{ textAlign: 'center', animationDelay: '0.1s' }}>
              <h1 style={{ fontFamily: 'Press Start 2P', fontSize: '24px', color: '#001133', lineHeight: 1.5, marginBottom: '24px' }}>INTERACTIVE BUILD PLAN</h1>
              <div style={{ width: '100%', height: '16px', background: 'white', border: '2px solid #001133', boxShadow: '4px 4px 0 #003366', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${progressPercent}%`, background: '#22c55e', transition: 'width 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}></div>
              </div>
            </div>
            
            <div className="arcade-card anim-card hover-lift" style={{ padding: '32px', border: '3px solid #0066CC', boxShadow: '6px 6px 0 #003366', animationDelay: '0.2s' }}>
              <h2 style={{ fontFamily: 'Press Start 2P', fontSize: '16px', color: '#CC0066', marginBottom: '32px', textAlign: 'center' }}>[ STAGE 1: ARCHITECTURE ]</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                {evaluations.map((ev: any, idx: number) => (
                  <div key={idx} style={{ background: '#f8fafc', padding: '24px', border: '1px solid #cbd5e1', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform='scale(1.02)'} onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#0066CC', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 'bold' }}>{ev.capability}</div>
                    <div style={{ fontFamily: 'Press Start 2P', fontSize: '12px', color: '#001133', marginBottom: '16px', lineHeight: '1.4' }}>{ev.winning_tool}</div>
                    <div className="editable-field" contentEditable suppressContentEditableWarning style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#555', lineHeight: '1.5', padding: '4px' }}>{ev.rationale}</div>
                  </div>
                ))}
              </div>
            </div>

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
                                  width: '24px', height: '24px', background: isDone ? '#22c55e' : 'white', border: `2px solid ${isDone ? '#166534' : '#0066CC'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', transition: 'all 0.2s'
                                }}>
                                  {isDone && '✓'}
                                </button>
                                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: isDone ? '#166534' : '#CC0066', fontWeight: 'bold' }}>STEP 0{stepIdx + 1}</span>
                              </div>
                              <select style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', padding: '4px 8px', border: '1px solid #cbd5e1', background: 'transparent' }}>
                                <option>Assignee: Unassigned</option>
                                <option>Dev 1 (Backend)</option>
                                <option>Dev 2 (Frontend)</option>
                              </select>
                            </div>
                            
                            <div className="editable-field" contentEditable suppressContentEditableWarning style={{ fontFamily: 'JetBrains Mono', fontSize: '14px', color: '#1A1A1A', fontWeight: 'bold', marginBottom: '16px', lineHeight: '1.6', paddingLeft: '40px', paddingRight: '4px', paddingTop: '4px', paddingBottom: '4px' }}>
                              {step.instruction}
                            </div>
                            
                            {step.ai_prompt && (
                              <div style={{ paddingLeft: '40px' }}>
                                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '16px', position: 'relative' }}>
                                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#0066CC', fontWeight: 'bold', marginBottom: '8px' }}>AI PROMPT CONTEXT:</div>
                                  <div className="editable-field" contentEditable suppressContentEditableWarning style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#334155', lineHeight: '1.6', whiteSpace: 'pre-wrap', padding: '4px' }}>
                                    {step.ai_prompt}
                                  </div>
                                  <button onClick={(e) => copyToClipboard(step.ai_prompt, e)} style={{
                                    position: 'absolute', top: '12px', right: '12px', background: 'white', border: '1px solid #0066CC', color: '#0066CC', fontFamily: 'JetBrains Mono', fontSize: '8px', padding: '4px 8px', cursor: 'pointer', boxShadow: '1px 1px 0 #0066CC'
                                  }}>
                                    [ COPY ]
                                  </button>
                                </div>
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

      {/* FLOATING AI MENTOR WIDGET */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 100 }}>
        {!chatOpen && (
          <button onClick={() => setChatOpen(true)} className="arcade-btn-primary hover-lift" style={{ padding: '16px', borderRadius: '50%', width: '64px', height: '64px', fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '4px 4px 0 #003366', border: '3px solid #001133' }}>
            🤖
          </button>
        )}
        {chatOpen && (
          <div className="arcade-card anim-card" style={{ width: '350px', height: '450px', display: 'flex', flexDirection: 'column', border: '3px solid #001133', boxShadow: '6px 6px 0 #003366', animationDelay: '0s' }}>
            <div style={{ background: '#0066CC', color: 'white', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: 'Press Start 2P', fontSize: '10px' }}>AI MENTOR</div>
              <button onClick={() => setChatOpen(false)} style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'JetBrains Mono', fontWeight: 'bold' }}>X</button>
            </div>
            
            <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: '#FAF9F6' }}>
              <div style={{ background: 'white', border: '1px solid #0066CC', padding: '12px', fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#001133', borderRadius: '0' }}>
                Hey Commander. I have full context of this mission and the roles of your teammates. Need help executing a step?
              </div>
              {chatHistory.map((msg, idx) => (
                <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', background: msg.role === 'user' ? '#0066CC' : 'white', color: msg.role === 'user' ? 'white' : '#001133', border: `1px solid ${msg.role === 'user' ? '#003366' : '#0066CC'}`, padding: '12px', fontFamily: 'JetBrains Mono', fontSize: '12px', maxWidth: '80%' }}>
                  {msg.text}
                </div>
              ))}
            </div>

            <form onSubmit={sendMentorMsg} style={{ padding: '12px', borderTop: '2px solid #0066CC', background: 'white', display: 'flex', gap: '8px' }}>
              <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} placeholder="Ask mentor..." className="arcade-input" style={{ flex: 1, padding: '8px', fontSize: '12px' }} />
              <button type="submit" className="arcade-btn-primary" style={{ padding: '8px', fontSize: '10px' }}>&gt;</button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}
