"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createProject, evaluatePS } from "@/lib/api";
import { getAuth } from "@/lib/auth";

export default function NewMissionInteractive() {
  const router = useRouter();
  
  // 0 = Pick Mode, 1 = Multi-PS, 2 = Wizard Questions, 3 = Summary
  const [mode, setMode] = useState<"SELECT" | "MULTI" | "WIZARD" | "SUMMARY">("SELECT");
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    problem_statement: "",
    idea: "",
    team_composition: "1 Frontend, 1 Backend",
    time_budget_value: 24,
    time_budget_unit: "hours",
  });

  const [psInputs, setPsInputs] = useState([
    { id: "1", title: "", problem_statement: "", proposed_idea: "" },
    { id: "2", title: "", problem_statement: "", proposed_idea: "" }
  ]);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  const steps = [
    { id: "name", question: "COMMANDER, WHAT IS THE NAME OF THIS MISSION?", placeholder: "e.g. Project Apollo..." },
    { id: "problem_statement", question: "WHAT CRITICAL PROBLEM ARE YOU SOLVING?", placeholder: "e.g. People hate waiting..." },
    { id: "idea", question: "WHAT IS YOUR PROPOSED SOLUTION?", placeholder: "e.g. An automated queue app..." },
    { id: "team_composition", question: "WHO IS ON YOUR SQUAD?", placeholder: "e.g. 1 Fullstack, 1 AI Engineer" },
    { id: "time_budget", question: "HOW MUCH TIME DO YOU HAVE TO SHIP THIS?", placeholder: "24" }
  ];

  useEffect(() => {
    if (mode === "WIZARD" && inputRef.current && step < steps.length) {
      inputRef.current.focus();
    }
  }, [mode, step]);

  const handleNextWizard = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (step === 0 && !form.name.trim()) return;
    if (step === 1 && !form.problem_statement.trim()) return;
    if (step === 2 && !form.idea.trim()) return;
    if (step === 3 && !form.team_composition.trim()) return;
    if (step === 4 && !form.time_budget_value) return;
    
    if (step < steps.length - 1) {
      setStep(s => s + 1);
    } else {
      setMode("SUMMARY");
    }
  };

  const handleLaunch = async () => {
    setLoading(true);
    setError("");
    const auth = getAuth();
    if (!auth) { router.push("/login"); return; }
    try {
      const res = await createProject({
        name: form.name,
        problem_statement: form.problem_statement,
        idea: form.idea,
        time_budget: { value: form.time_budget_value, unit: form.time_budget_unit },
        team_id: auth.user.user_id,
        constraints: [`Team: ${form.team_composition}`]
      });
      router.push(`/dashboard/${res.data.project_id || res.data.id}`);
    } catch (err) {
      setError("Failed to launch mission.");
    } finally {
      setLoading(false);
    }
  };

  const runMultiAnalysis = async () => {
    setEvaluating(true);
    setError("");
    const auth = getAuth();
    if (!auth) return;
    try {
      const valid = psInputs.filter(p => p.title.trim() && p.problem_statement.trim());
      if (valid.length === 0) {
        setError("Please enter at least one idea.");
        setEvaluating(false);
        return;
      }
      const payload = {
        team_id: auth.user.user_id,
        time_budget_hours: form.time_budget_unit === 'hours' ? form.time_budget_value : form.time_budget_value * 24,
        candidate_problem_statements: valid
      };
      const res = await evaluatePS(payload);
      setEvaluationResult(res.data);
    } catch (err) {
      setError("Analysis failed.");
    } finally {
      setEvaluating(false);
    }
  };

  const selectWinner = (item: any) => {
    const matched = psInputs.find(p => p.id === item.id);
    if (matched) {
      setForm(f => ({ ...f, name: matched.title, problem_statement: matched.problem_statement, idea: matched.proposed_idea }));
      setMode("SUMMARY");
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6', color: '#001133' }}>
      <div style={{ padding: '24px 48px', display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid #0066CC', background: 'white' }}>
        <span style={{ fontFamily: 'Press Start 2P', fontSize: '12px', color: '#0066CC' }} className="blink">TEAMFORGE SETUP WIZARD v2.0</span>
        <Link href="/dashboard" style={{ fontFamily: 'JetBrains Mono', color: '#CC0066', textDecoration: 'none', fontWeight: 'bold' }}>[ ABORT ]</Link>
      </div>

      <div style={{ maxWidth: '900px', margin: '80px auto', padding: '0 24px' }}>
        
        {/* MODE 0: SELECT PATH */}
        {mode === "SELECT" && (
          <div style={{ animation: 'fadeIn 0.5s', textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'Press Start 2P', fontSize: '24px', color: '#001133', marginBottom: '48px', lineHeight: '1.5' }}>DO YOU HAVE A SPECIFIC MISSION IN MIND?</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              <button onClick={() => setMode("WIZARD")} style={{ background: 'white', border: '3px solid #0066CC', color: '#0066CC', padding: '48px 24px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '6px 6px 0 #003366' }} onMouseOver={e => e.currentTarget.style.background='#f0f9ff'} onMouseOut={e => e.currentTarget.style.background='white'}>
                <div style={{ fontFamily: 'Press Start 2P', fontSize: '14px', marginBottom: '16px', color: 'inherit' }}>[ YES ]</div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#1A1A1A' }}>I know exactly what I want to build. Launch the setup wizard.</div>
              </button>
              <button onClick={() => setMode("MULTI")} style={{ background: '#CC0066', border: '3px solid #880044', color: 'white', padding: '48px 24px', cursor: 'pointer', boxShadow: '6px 6px 0 #880044' }}>
                <div style={{ fontFamily: 'Press Start 2P', fontSize: '14px', marginBottom: '16px' }}>[ NO ]</div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'white' }}>I have a few ideas. Help me rank them based on my team and time constraints.</div>
              </button>
            </div>
          </div>
        )}

        {/* ... MUTLI MODE OMITTED FOR BREVITY, WILL KEEP IT THE SAME ... */}
        {mode === "MULTI" && (
          <div style={{ animation: 'fadeIn 0.5s' }}>
            <h1 style={{ fontFamily: 'Press Start 2P', fontSize: '20px', color: '#CC0066', marginBottom: '16px' }}>PROBLEM STATEMENT ANALYZER</h1>
            <p style={{ fontFamily: 'JetBrains Mono', color: '#555', marginBottom: '32px' }}>Enter up to 3 ideas. Our AI will rank them based on viability.</p>
            
            {!evaluationResult ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginBottom: '32px' }}>
                  {psInputs.map((input, idx) => (
                    <div key={input.id} style={{ borderLeft: '4px solid #CC0066', paddingLeft: '16px', background: 'white', padding: '16px', boxShadow: '4px 4px 0 #880044', border: '2px solid #CC0066' }}>
                      <div style={{ fontFamily: 'JetBrains Mono', color: '#CC0066', fontWeight: 'bold', marginBottom: '8px' }}>IDEA 0{idx + 1}</div>
                      <input className="arcade-input" style={{ marginBottom: '8px' }} placeholder="Title" value={input.title} onChange={e => { const n = [...psInputs]; n[idx].title = e.target.value; setPsInputs(n); }} />
                      <textarea className="arcade-input" rows={2} placeholder="Problem Statement..." value={input.problem_statement} onChange={e => { const n = [...psInputs]; n[idx].problem_statement = e.target.value; setPsInputs(n); }} />
                    </div>
                  ))}
                  <button onClick={() => setPsInputs([...psInputs, { id: Date.now().toString(), title: "", problem_statement: "", proposed_idea: "" }])} style={{ background: 'white', border: '2px dashed #0066CC', color: '#0066CC', padding: '16px', cursor: 'pointer', fontFamily: 'JetBrains Mono', fontWeight: 'bold' }}>+ ADD ANOTHER IDEA</button>
                </div>

                {error && <div style={{ color: '#CC0066', fontFamily: 'JetBrains Mono', fontWeight: 'bold', marginBottom: '16px' }}>&gt; ERROR: {error}</div>}
                
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button onClick={runMultiAnalysis} disabled={evaluating} style={{ background: '#0066CC', color: 'white', border: '2px solid #003366', boxShadow: '4px 4px 0 #003366', padding: '16px 32px', fontFamily: 'Press Start 2P', fontSize: '12px', cursor: 'pointer' }}>
                    {evaluating ? '[ ANALYZING... ]' : '[ RANK IDEAS ]'}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ background: '#f0fdf4', border: '2px solid #22c55e', boxShadow: '6px 6px 0 #166534', padding: '32px' }}>
                <h2 style={{ fontFamily: 'Press Start 2P', fontSize: '16px', color: '#166534', marginBottom: '16px' }}>[ RANKING COMPLETE ]</h2>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: '14px', color: '#166534', marginBottom: '32px', lineHeight: '1.6' }}>{evaluationResult.summary_recommendation}</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {evaluationResult.ranked_evaluations.map((item: any, idx: number) => (
                    <div key={idx} style={{ background: 'white', padding: '24px', border: '2px solid #22c55e' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontFamily: 'Press Start 2P', fontSize: '12px', color: idx === 0 ? '#166534' : '#888' }}>#{item.rank} {item.verdict}</span>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '16px', fontWeight: 'bold', color: '#166534' }}>{item.scores.overall_score}/10</span>
                      </div>
                      <div style={{ fontFamily: 'JetBrains Mono', fontSize: '16px', color: '#001133', fontWeight: 'bold', marginBottom: '8px' }}>{item.title}</div>
                      <div style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#555', marginBottom: '24px', lineHeight: '1.5' }}>{item.why_pick_reason}</div>
                      
                      <button onClick={() => selectWinner(item)} style={{ padding: '12px 24px', fontFamily: 'Press Start 2P', fontSize: '10px', background: idx === 0 ? '#22c55e' : 'white', color: idx === 0 ? 'white' : '#22c55e', border: '2px solid #166534', cursor: 'pointer', boxShadow: '3px 3px 0 #166534' }}>
                        [ SELECT & PROCEED ]
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODE 2: WIZARD */}
        {mode === "WIZARD" && (
          <div style={{ animation: 'fadeIn 0.5s' }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '14px', color: '#0066CC', fontWeight: 'bold', marginBottom: '16px' }}>
              &gt; STEP 0{step + 1} OF 0{steps.length}
            </div>
            <h1 style={{ fontFamily: 'Press Start 2P', fontSize: '24px', lineHeight: '1.5', marginBottom: '32px', color: '#001133' }}>
              {steps[step].question}
            </h1>

            <form onSubmit={handleNextWizard} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {step === 4 ? (
                <div style={{ display: 'flex', gap: '16px' }}>
                  <input ref={inputRef} type="number" min="1" className="arcade-input" style={{ fontSize: '24px', padding: '16px', borderColor: '#0066CC', borderWidth: '3px' }} value={form.time_budget_value} onChange={e => setForm(f => ({ ...f, time_budget_value: parseInt(e.target.value) || 1 }))} />
                  <select className="arcade-input" style={{ fontSize: '20px', borderColor: '#0066CC', borderWidth: '3px' }} value={form.time_budget_unit} onChange={e => setForm(f => ({ ...f, time_budget_unit: e.target.value }))}>
                    <option value="hours">HOURS</option>
                    <option value="days">DAYS</option>
                    <option value="weeks">WEEKS</option>
                  </select>
                </div>
              ) : (
                <input ref={inputRef} className="arcade-input" style={{ fontSize: '24px', padding: '16px', borderColor: '#0066CC', borderWidth: '3px' }} placeholder={steps[step].placeholder} value={step === 0 ? form.name : step === 1 ? form.problem_statement : step === 2 ? form.idea : form.team_composition} onChange={e => { const v = e.target.value; if (step===0) setForm(f=>({...f, name: v})); if (step===1) setForm(f=>({...f, problem_statement: v})); if (step===2) setForm(f=>({...f, idea: v})); if (step===3) setForm(f=>({...f, team_composition: v})); }} />
              )}
              
              <button type="submit" style={{ alignSelf: 'flex-start', background: '#0066CC', color: 'white', border: '2px solid #003366', boxShadow: '4px 4px 0 #003366', padding: '16px 32px', fontFamily: 'Press Start 2P', fontSize: '12px', cursor: 'pointer' }}>
                [ CONTINUE ]
              </button>
            </form>
          </div>
        )}

        {/* MODE 3: SUMMARY */}
        {mode === "SUMMARY" && (
          <div style={{ animation: 'fadeIn 0.5s' }}>
            <h1 style={{ fontFamily: 'Press Start 2P', fontSize: '24px', color: '#001133', marginBottom: '32px' }}>MISSION READY.</h1>
            
            <div style={{ background: 'white', border: '3px solid #0066CC', boxShadow: '6px 6px 0 #003366', padding: '32px', marginBottom: '32px' }}>
              <div style={{ marginBottom: '16px' }}><span style={{ color: '#0066CC', fontFamily: 'JetBrains Mono', fontWeight: 'bold' }}>NAME:</span> <span style={{ color: '#1A1A1A', fontFamily: 'JetBrains Mono' }}>{form.name}</span></div>
              <div style={{ marginBottom: '16px' }}><span style={{ color: '#0066CC', fontFamily: 'JetBrains Mono', fontWeight: 'bold' }}>PROBLEM:</span> <span style={{ color: '#1A1A1A', fontFamily: 'JetBrains Mono' }}>{form.problem_statement}</span></div>
              <div style={{ marginBottom: '16px' }}><span style={{ color: '#0066CC', fontFamily: 'JetBrains Mono', fontWeight: 'bold' }}>IDEA:</span> <span style={{ color: '#1A1A1A', fontFamily: 'JetBrains Mono' }}>{form.idea}</span></div>
              <div style={{ marginBottom: '16px' }}><span style={{ color: '#0066CC', fontFamily: 'JetBrains Mono', fontWeight: 'bold' }}>SQUAD:</span> <span style={{ color: '#1A1A1A', fontFamily: 'JetBrains Mono' }}>{form.team_composition}</span></div>
              <div><span style={{ color: '#0066CC', fontFamily: 'JetBrains Mono', fontWeight: 'bold' }}>TIME LIMIT:</span> <span style={{ color: '#1A1A1A', fontFamily: 'JetBrains Mono' }}>{form.time_budget_value} {form.time_budget_unit.toUpperCase()}</span></div>
            </div>

            {error && <div style={{ color: '#CC0066', fontFamily: 'JetBrains Mono', fontWeight: 'bold', marginBottom: '24px' }}>&gt; ERROR: {error}</div>}

            <div style={{ display: 'flex', gap: '24px' }}>
              <button onClick={handleLaunch} disabled={loading} style={{ background: '#CC0066', color: 'white', border: '2px solid #880044', boxShadow: '4px 4px 0 #880044', padding: '16px 32px', fontFamily: 'Press Start 2P', fontSize: '12px', cursor: 'pointer' }}>
                {loading ? '[ LAUNCHING... ]' : '[ LAUNCH MISSION ]'}
              </button>
            </div>
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}
