"use client";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";

const C = {
  blue:    "#0066CC",
  mag:     "#CC0066",
  magDeep: "#880044",
  ink:     "#001133",
  paper:   "#FAF9F6",
  dot:     "#cfcdc4",
  muted:   "#4a5070",
};

const BAR_COUNT = 14;
const DEFAULT_MSGS = [
  "> ANALYZING PROJECT SCOPE",
  "> RUNNING 7-LAYER AI PIPELINE",
  "> GENERATING ARCHITECTURE",
  "> ASSIGNING SQUAD TASKS",
];

export interface LoaderHandle {
  show: (msgs?: string[]) => { done: () => Promise<void>; set: (v: number) => void };
  hide: () => void;
}

const FullscreenLoader = forwardRef<LoaderHandle>((_, ref) => {
  const [visible, setVisible]   = useState(false);
  const [status,  setStatus]    = useState(DEFAULT_MSGS[0]);
  const [pct,     setPct]       = useState(0);
  const tickRef   = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const rotRef    = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const msgIdx    = useRef(0);
  const pctRef    = useRef(0);

  const hide = () => {
    clearInterval(tickRef.current);
    clearInterval(rotRef.current);
    setVisible(false);
  };

  useImperativeHandle(ref, () => ({
    hide,
    show: (msgs = DEFAULT_MSGS) => {
      pctRef.current = 0;
      setPct(0);
      msgIdx.current = 0;
      setStatus(msgs[0]);
      setVisible(true);

      // Ease toward 92%
      tickRef.current = setInterval(() => {
        pctRef.current += (92 - pctRef.current) * 0.06;
        setPct(Math.round(pctRef.current));
      }, 120);

      // Rotate status messages
      rotRef.current = setInterval(() => {
        msgIdx.current = (msgIdx.current + 1) % msgs.length;
        setStatus(msgs[msgIdx.current]);
      }, 900);

      return {
        set: (v: number) => {
          pctRef.current = Math.max(0, Math.min(100, v));
          setPct(Math.round(pctRef.current));
        },
        done: async () => {
          clearInterval(tickRef.current);
          clearInterval(rotRef.current);
          pctRef.current = 100;
          setPct(100);
          await new Promise(r => setTimeout(r, 420));
          hide();
        },
      };
    },
  }));

  if (!visible) return null;

  const onCount = Math.round(pct / 100 * BAR_COUNT);
  const fmtPct  = `[ ${String(Math.floor(pct)).padStart(3, " ")}% ]`;

  return (
    <>
      <style>{`
        @keyframes tf-tap {
          0%  {transform:rotate(55deg)}
          40% {transform:rotate(0)}
          58% {transform:rotate(0)}
          100%{transform:rotate(55deg)}
        }
        @keyframes tf-cur2 { 50%{opacity:0} }
      `}</style>

      <div
        role="status"
        aria-live="polite"
        style={{
          position:"fixed", inset:0, zIndex:190,
          display:"grid", placeItems:"center", padding:"20px",
          backgroundColor:C.paper,
          backgroundImage:`radial-gradient(circle,${C.dot} 1px,transparent 1.6px)`,
          backgroundSize:"24px 24px",
          fontFamily:"'JetBrains Mono',monospace",
        }}
      >
        <div style={{
          width:"min(92vw,500px)", padding:"0 30px 26px",
          border:`2px dashed ${C.mag}`, background:C.paper,
          display:"flex", flexDirection:"column", alignItems:"center",
        }}>
          {/* Small tapping forge */}
          <div style={{ position:"relative", width:"160px", height:"90px", margin:"26px auto 16px" }}>
            {/* Anvil */}
            <svg viewBox="0 0 32 18" shapeRendering="crispEdges"
              style={{ position:"absolute", left:0, bottom:0, width:"160px", height:"90px" }}>
              <rect x="1"  y="7"  width="4"  height="1" fill={C.ink}/>
              <rect x="3"  y="8"  width="2"  height="1" fill={C.ink}/>
              <rect x="5"  y="7"  width="22" height="1" fill={C.ink}/>
              <rect x="5"  y="8"  width="22" height="1" fill={C.ink}/>
              <rect x="27" y="7"  width="3"  height="2" fill={C.ink}/>
              <rect x="9"  y="9"  width="14" height="3" fill={C.ink}/>
              <rect x="7"  y="12" width="18" height="2" fill={C.ink}/>
              <rect x="5"  y="14" width="22" height="3" fill={C.ink}/>
              <rect x="5"  y="14" width="22" height="1" fill={C.blue}/>
              <rect x="5"  y="6"  width="22" height="1" fill={C.mag}/>
            </svg>
            {/* Hammer — loops */}
            <svg viewBox="0 0 30 8" shapeRendering="crispEdges"
              style={{
                position:"absolute", left:"50px", top:"6px",
                width:"90px", height:"24px",
                transformOrigin:"100% 50%",
                animation:"tf-tap 0.8s steps(4) infinite",
              }}>
              <rect x="0"  y="0" width="10" height="8" fill={C.ink}/>
              <rect x="0"  y="0" width="10" height="2" fill={C.blue}/>
              <rect x="10" y="3" width="20" height="2" fill={C.mag}/>
              <rect x="25" y="3" width="5"  height="2" fill={C.magDeep}/>
            </svg>
          </div>

          {/* Status text */}
          <div style={{
            minHeight:"1.7em", fontSize:"14px", letterSpacing:".06em",
            fontWeight:500, textAlign:"center", color:C.ink,
          }}>
            {status}
            <span style={{ display:"inline-block", animation:"tf-cur2 1s steps(1) infinite", marginLeft:"2px" }}>█</span>
          </div>

          {/* Progress bar */}
          <div style={{ display:"flex", gap:"4px", marginTop:"16px" }}>
            {Array.from({ length: BAR_COUNT }).map((_, i) => (
              <div key={i} style={{
                width:"17px", height:"17px", border:`2px solid ${C.ink}`,
                background: i < onCount ? C.blue : "transparent",
                transition:"background 0.1s steps(1)",
              }}/>
            ))}
          </div>

          {/* Percentage */}
          <div style={{
            marginTop:"14px",
            fontFamily:"'Press Start 2P',monospace",
            fontWeight:700, fontSize:"18px", color:C.mag,
          }}>
            {fmtPct}
          </div>

          {/* Cancel */}
          <button
            onClick={hide}
            style={{
              marginTop:"20px", background:"none", border:0, color:C.muted,
              fontFamily:"'JetBrains Mono',monospace",
              fontSize:"12px", letterSpacing:".1em",
              textDecoration:"underline dashed", textUnderlineOffset:"4px", cursor:"pointer",
            }}
          >[ CANCEL ]</button>
        </div>
      </div>
    </>
  );
});

FullscreenLoader.displayName = "FullscreenLoader";
export default FullscreenLoader;
