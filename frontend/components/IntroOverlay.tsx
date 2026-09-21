"use client";
import { useEffect, useRef } from "react";

// TeamForge color palette
const C = {
  blue:     "#0066CC",
  mag:      "#CC0066",
  magDeep:  "#880044",
  ink:      "#001133",
  paper:    "#FAF9F6",
  blueSoft: "rgba(0,102,204,0.22)",
  dot:      "#cfcdc4",
};

const BOOT_LINES = [
  { text: "> BOOTING TEAMFORGE.AI v2.0",        ok: false },
  { text: "> LOADING 7-LAYER AI PIPELINE...",    ok: true  },
  { text: "> NVIDIA + GEMINI + GROQ ONLINE",     ok: true  },
  { text: "> ALL SQUAD ENGINES READY",           ok: true  },
];

interface Props { onDone: () => void; }

export default function IntroOverlay({ onDone }: Props) {
  const overlayRef   = useRef<HTMLDivElement>(null);
  const tilesRef     = useRef<HTMLDivElement>(null);
  const stageRef     = useRef<HTMLDivElement>(null);
  const loneRef      = useRef<HTMLDivElement>(null);
  const bootRef      = useRef<HTMLDivElement>(null);
  const bootLinesRef = useRef<HTMLDivElement>(null);
  const rigRef       = useRef<HTMLDivElement>(null);
  const sceneRef     = useRef<HTMLDivElement>(null);
  const hammerRef    = useRef<SVGSVGElement>(null);
  const sparksRef    = useRef<HTMLDivElement>(null);
  const hotRectRef   = useRef<SVGRectElement>(null);
  const logoRef      = useRef<HTMLDivElement>(null);

  const skipRef   = useRef(false);
  const wakersRef = useRef<Array<() => void>>([]);

  const finish = () => {
    const el = overlayRef.current;
    if (el) el.style.display = "none";
    try { sessionStorage.setItem("tf-intro", "1"); } catch {}
    onDone();
  };

  const skip = () => {
    if (skipRef.current) return;
    skipRef.current = true;
    wakersRef.current.forEach(f => f());
    wakersRef.current = [];
    finish();
  };

  const sleep = (ms: number) =>
    new Promise<void>((res, rej) => {
      if (skipRef.current) return rej("skip");
      const t = setTimeout(res, ms);
      wakersRef.current.push(() => { clearTimeout(t); rej("skip"); });
    });

  const typeLine = async (line: HTMLDivElement, text: string, ok: boolean) => {
    const cur = document.createElement("span");
    cur.className = "tf-cur";
    cur.textContent = "█";
    const tn = document.createTextNode("");
    line.append(tn, cur);
    for (const ch of text) { tn.data += ch; await sleep(16); }
    if (ok) {
      const s = document.createElement("span");
      s.style.cssText = `color:${C.blue};font-weight:700`;
      s.textContent = " [OK]";
      line.insertBefore(s, cur);
    }
    await sleep(100);
    cur.remove();
  };

  const spawnSparks = (n: number) => {
    const box = sparksRef.current;
    if (!box) return;
    const colors = [C.blue, C.mag, C.ink];
    for (let i = 0; i < n; i++) {
      const a = -Math.PI * (0.08 + Math.random() * 0.84);
      const d = 40 + Math.random() * 100;
      const s = document.createElement("i");
      s.className = "tf-spark";
      s.style.setProperty("--dx", Math.cos(a) * d + "px");
      s.style.setProperty("--dy", Math.sin(a) * d + "px");
      s.style.width  = (i % 2 ? 8 : 4) + "px";
      s.style.height = (i % 2 ? 8 : 4) + "px";
      s.style.background = colors[i % colors.length];
      box.appendChild(s);
      setTimeout(() => s.remove(), 700);
    }
  };

  const shake = (k: number) => {
    const rig = rigRef.current;
    if (!rig) return;
    rig.style.setProperty("--sh", String(k));
    rig.classList.remove("tf-shake");
    void rig.offsetWidth;
    rig.classList.add("tf-shake");
  };

  const strike = async (n: number) => {
    const h = hammerRef.current;
    if (!h) return;
    h.classList.remove("tf-hammer-hit");
    void (h as unknown as HTMLElement).offsetWidth;
    h.classList.add("tf-hammer-hit");
    await sleep(280);
    // heat color on anvil top bar
    if (hotRectRef.current) {
      hotRectRef.current.style.fill =
        n === 1 ? C.ink : n === 2 ? C.blue : C.mag;
    }
    spawnSparks(n === 3 ? 18 : 9);
    shake(n === 3 ? 2 : 1);
    if (n === 3 && logoRef.current) {
      logoRef.current.classList.add("tf-logo-on");
    }
    await sleep(n === 3 ? 300 : 200);
    if (n < 3) { h.classList.remove("tf-hammer-hit"); await sleep(130); }
  };

  const buildTiles = () => {
    const el = tilesRef.current;
    if (!el) return;
    const sz = window.innerWidth < 600 ? 72 : 96;
    const cols = Math.ceil(window.innerWidth / sz);
    const rows = Math.ceil(window.innerHeight / sz);
    el.style.gridTemplateColumns = `repeat(${cols}, ${sz}px)`;
    el.style.gridAutoRows = sz + "px";
    el.innerHTML = "";
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const t = document.createElement("i");
        t.className = "tf-tile";
        t.style.setProperty("--d", `${(r + c) * 18 + Math.random() * 140}ms`);
        el.appendChild(t);
      }
  };

  useEffect(() => {
    try { if (sessionStorage.getItem("tf-intro") === "1") { onDone(); return; } } catch {}

    buildTiles();

    const run = async () => {
      await sleep(600);

      if (loneRef.current)                 loneRef.current.style.display = "none";
      if (bootRef.current)                 bootRef.current.style.visibility = "visible";

      const blEl = bootLinesRef.current;
      if (blEl) {
        for (const { text, ok } of BOOT_LINES) {
          const line = document.createElement("div");
          blEl.appendChild(line);
          await typeLine(line, text, ok);
        }
      }
      await sleep(250);

      // slide boot panel out
      const st = stageRef.current;
      if (st) { st.style.animation = "tf-logout 0.35s steps(4) forwards"; }
      await sleep(350);

      // drop in forge scene
      const sc = sceneRef.current;
      if (sc) { sc.style.opacity = "1"; sc.style.animation = "tf-drop 0.4s steps(5) forwards"; }
      await sleep(450);

      for (let n = 1; n <= 3; n++) await strike(n);
      await sleep(750);

      // dissolve tiles
      const tiles = tilesRef.current;
      if (tiles) {
        [...tiles.children].forEach(c => {
          const t = c as HTMLElement;
          t.style.animation = `tf-vanish 0.2s steps(2) calc(${t.style.getPropertyValue("--d")} + 250ms) forwards`;
        });
      }
      if (st) st.style.animation = "tf-fadeout 0.25s steps(3) forwards";
      await sleep(900);
    };

    run().catch(() => {}).finally(finish);

    const onKey = () => skip();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <style>{`
        .tf-cur  { display:inline-block; animation:tf-blink 1s steps(1) infinite; margin-left:2px; }
        .tf-tile {
          background-color:${C.paper};
          background-image:radial-gradient(circle,${C.dot} 1px,transparent 1.6px);
          background-size:24px 24px;
        }
        .tf-spark {
          position:absolute; left:0; top:0;
          animation:tf-spark 0.6s steps(6) forwards;
        }
        .tf-shake  { animation:tf-shake 0.24s steps(4); }
        .tf-hammer-hit { animation:tf-swing 0.28s steps(4) forwards !important; }
        .tf-logo-on {
          visibility:visible !important;
          animation:tf-stamp 0.3s steps(4) both !important;
        }
        @keyframes tf-blink  { 50%{opacity:0} }
        @keyframes tf-spark  {
          0%   { transform:translate(0,0); opacity:1 }
          60%  { transform:translate(var(--dx),var(--dy)) }
          100% { transform:translate(var(--dx),calc(var(--dy) + 36px)); opacity:0 }
        }
        @keyframes tf-swing  { from{transform:rotate(55deg)} to{transform:rotate(0)} }
        @keyframes tf-drop   { from{transform:translateY(-70px);opacity:0} to{transform:none;opacity:1} }
        @keyframes tf-logout { to{transform:translateY(-40px) scale(.85);opacity:0} }
        @keyframes tf-fadeout{ to{opacity:0} }
        @keyframes tf-vanish {
          0%  {opacity:1;transform:scale(1)}
          50% {transform:scale(.6)}
          100%{opacity:0;transform:scale(.2)}
        }
        @keyframes tf-stamp  {
          0%  {transform:scale(1.7);opacity:0}
          70% {transform:scale(.94);opacity:1}
          100%{transform:scale(1)}
        }
        @keyframes tf-shake  {
          0%  {transform:translate(0,0)}
          25% {transform:translate(calc(-5px*var(--sh,1)),calc(3px*var(--sh,1)))}
          50% {transform:translate(calc(4px*var(--sh,1)),calc(-3px*var(--sh,1)))}
          75% {transform:translate(calc(-3px*var(--sh,1)),calc(-2px*var(--sh,1)))}
          100%{transform:translate(0,0)}
        }
      `}</style>

      <div
        ref={overlayRef}
        onClick={skip}
        style={{
          position:"fixed", inset:0, zIndex:200, cursor:"pointer",
          fontFamily:"'JetBrains Mono',monospace",
        }}
      >
        {/* Tile grid */}
        <div
          ref={tilesRef}
          style={{ position:"absolute", inset:0, display:"grid", justifyContent:"start", alignContent:"start" }}
          aria-hidden="true"
        />

        {/* Stage */}
        <div
          ref={stageRef}
          style={{ position:"absolute", inset:0, display:"grid", placeItems:"center", padding:"20px" }}
        >
          {/* Blinking cursor */}
          <div
            ref={loneRef}
            style={{
              gridArea:"1/1", fontFamily:"'Press Start 2P',monospace",
              fontSize:"44px", color:C.ink, animation:"tf-blink 1s steps(1) infinite",
            }}
            aria-hidden="true"
          >█</div>

          {/* Boot log */}
          <div
            ref={bootRef}
            style={{
              gridArea:"1/1", width:"min(92vw,520px)", padding:"20px 24px",
              border:`2px dashed ${C.mag}`, background:C.paper,
              fontSize:"14px", lineHeight:"1.95", visibility:"hidden",
            }}
          >
            <div ref={bootLinesRef} />
          </div>

          {/* Forge + Logo */}
          <div ref={rigRef} style={{ gridArea:"1/1", display:"flex", flexDirection:"column", alignItems:"center" }}>
            <div ref={sceneRef} style={{ opacity:0 }}>
              {/* Forge container — u = 10px */}
              <div style={{ position:"relative", width:"320px", height:"180px" }}>
                {/* Anvil */}
                <svg
                  viewBox="0 0 32 18" shapeRendering="crispEdges"
                  style={{
                    position:"absolute", left:0, bottom:0, width:"320px", height:"180px",
                    filter:`drop-shadow(6px 6px 0 ${C.blueSoft})`,
                  }}
                >
                  <rect x="1"  y="7"  width="4"  height="1" fill={C.ink}/>
                  <rect x="3"  y="8"  width="2"  height="1" fill={C.ink}/>
                  <rect x="5"  y="7"  width="22" height="1" fill={C.ink}/>
                  <rect x="5"  y="8"  width="22" height="1" fill={C.ink}/>
                  <rect x="27" y="7"  width="3"  height="2" fill={C.ink}/>
                  <rect x="9"  y="9"  width="14" height="3" fill={C.ink}/>
                  <rect x="7"  y="12" width="18" height="2" fill={C.ink}/>
                  <rect x="5"  y="14" width="22" height="3" fill={C.ink}/>
                  <rect x="5"  y="14" width="22" height="1" fill={C.blue}/>
                  {/* Heat-sensitive top bar */}
                  <rect ref={hotRectRef} x="5" y="6" width="22" height="1" fill={C.ink}/>
                </svg>

                {/* Hammer */}
                <svg
                  ref={hammerRef} viewBox="0 0 30 8" shapeRendering="crispEdges"
                  style={{
                    position:"absolute", left:"100px", top:"12px",
                    width:"180px", height:"48px",
                    transformOrigin:"100% 50%", transform:"rotate(55deg)",
                  }}
                >
                  <rect x="0"  y="0" width="10" height="8" fill={C.ink}/>
                  <rect x="0"  y="0" width="10" height="2" fill={C.blue}/>
                  <rect x="10" y="3" width="20" height="2" fill={C.mag}/>
                  <rect x="25" y="3" width="5"  height="2" fill={C.magDeep}/>
                </svg>

                {/* Sparks origin */}
                <div
                  ref={sparksRef}
                  style={{ position:"absolute", left:"130px", top:"60px", width:0, height:0, pointerEvents:"none" }}
                />
              </div>
            </div>

            {/* Logo stamp */}
            <div
              ref={logoRef}
              style={{
                marginTop:"26px", visibility:"hidden", whiteSpace:"nowrap",
                fontFamily:"'Press Start 2P',monospace", fontWeight:700,
                fontSize:"clamp(26px,5.5vw,46px)", color:C.ink,
                textShadow:`0.06em 0.06em 0 ${C.blueSoft}`,
              }}
            >
              TeamForge<span style={{ color:C.mag }}>.AI</span>
            </div>
          </div>
        </div>

        {/* Skip button */}
        <button
          onClick={e => { e.stopPropagation(); skip(); }}
          style={{
            position:"absolute",
            right:"max(18px,env(safe-area-inset-right,0px))",
            bottom:"max(18px,env(safe-area-inset-bottom,0px))",
            background:"none", border:`2px dashed ${C.mag}`, color:C.mag,
            fontFamily:"'JetBrains Mono',monospace",
            fontSize:"12px", letterSpacing:".12em", padding:"8px 12px", cursor:"pointer",
          }}
        >[ SKIP &gt; ]</button>
      </div>
    </>
  );
}
