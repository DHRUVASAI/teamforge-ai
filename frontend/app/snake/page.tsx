"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";

export default function SquadSnake() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const $ = (s: string) => container.querySelector(s) as HTMLElement;
    const cv = $('#cv') as HTMLCanvasElement;
    const ctx = cv.getContext('2d')!;
    
    const board = $('#board');
    const overlay = $('#overlay');
    const ovTitle = $('#ovTitle');
    const ovText = $('#ovText');
    const ovBtn = $('#ovBtn');
    
    const scoreEl = $('#score');
    const bestEl = $('#best');
    const levelEl = $('#level');
    const levelBox = $('#levelBox');

    const N = 20;
    const LEVEL_EVERY = 5;
    const DIRS: Record<string, { x: number, y: number }> = { 
      up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, 
      left: { x: -1, y: 0 }, right: { x: 1, y: 0 } 
    };

    let cell = 24, dpr = 1;
    let snake: { x: number, y: number }[] = [];
    let dir = DIRS.right;
    let queue: { x: number, y: number }[] = [];
    let food: { x: number, y: number } | null = null;
    let score = 0;
    let best = 0;
    let interval = 140;
    let state = 'idle';
    let acc = 0;
    let last = 0;
    let particles: any[] = [];
    let frameId: number;

    try { best = parseInt(localStorage.getItem('tf-snake-best') || '0', 10) || 0; } catch (e) {}
    const pad3 = (n: number) => String(n).padStart(3, '0');
    bestEl.textContent = pad3(best);

    /* ---------- theme colors for the canvas ---------- */
    let C: any = {};
    function readColors() {
      // Hardcode colors to guarantee perfect matches without relying on CSS variable inheritance in canvas
      C = { 
        paper: "#f4f2f0", 
        ink: "#001233", 
        blue: "#0065cc", 
        soft: "#aecae7", 
        mag: "#c90068", 
        dot: "#d3d1cd" 
      };
    }
    readColors();

    /* ---------- sizing ---------- */
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = board.clientWidth - 8; // minus the 4px borders
      cell = Math.max(8, Math.floor(w * dpr / N));
      cv.width = cell * N;
      cv.height = cell * N;
    }
    window.addEventListener('resize', resize);

    /* ---------- game logic ---------- */
    const levelOf = (s: number) => 1 + Math.floor(s / LEVEL_EVERY);
    const intervalOf = (lv: number) => Math.max(58, 140 - (lv - 1) * 12);

    function reset() {
      snake = [{ x: 9, y: 10 }, { x: 8, y: 10 }, { x: 7, y: 10 }];
      dir = DIRS.right; queue = []; score = 0; interval = intervalOf(1); acc = 0; particles = [];
      food = spawnFood();
      scoreEl.textContent = pad3(0); levelEl.textContent = '1';
    }

    function spawnFood() {
      const taken = new Set(snake.map(p => p.x + ',' + p.y));
      const free = [];
      for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
          if (!taken.has(x + ',' + y)) free.push({ x, y });
        }
      }
      return free.length ? free[Math.floor(Math.random() * free.length)] : null;
    }

    function setDir(name: string) {
      const d = DIRS[name]; 
      if (!d) return;
      const ref = queue.length ? queue[queue.length - 1] : dir;
      if ((d.x === -ref.x && d.y === -ref.y) || (d.x === ref.x && d.y === ref.y)) return;
      if (queue.length < 2) queue.push(d);
    }

    function step() {
      if (queue.length) dir = queue.shift()!;
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      const eating = food && head.x === food.x && head.y === food.y;
      const body = eating ? snake : snake.slice(0, -1);
      
      if (head.x < 0 || head.y < 0 || head.x >= N || head.y >= N || body.some(p => p.x === head.x && p.y === head.y)) {
        return gameOver(false);
      }
      
      snake.unshift(head);
      if (eating && food) {
        score++;
        scoreEl.textContent = pad3(score);
        burst(food.x, food.y, 12);
        const lv = levelOf(score);
        if (lv !== levelOf(score - 1)) {
          levelEl.textContent = String(lv); interval = intervalOf(lv);
          levelBox.classList.remove('flash'); 
          void levelBox.offsetWidth; 
          levelBox.classList.add('flash');
        }
        food = spawnFood();
        if (!food) return gameOver(true);
      } else {
        snake.pop();
      }
    }

    function burst(gx: number, gy: number, n: number) {
      const now = performance.now();
      const colors = [C.blue, C.mag, C.ink];
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const d = 0.8 + Math.random() * 1.6;
        particles.push({ 
          x: gx + .5, y: gy + .5, 
          vx: Math.cos(a) * d, vy: Math.sin(a) * d, 
          born: now, col: colors[i % 3], big: i % 2 
        });
      }
    }

    /* ---------- states ---------- */
    function showOverlay(title: string, html: string, btn: string) {
      ovTitle.textContent = title; 
      ovText.innerHTML = html; 
      ovBtn.textContent = btn;
      overlay.hidden = false; 
      ovBtn.focus({ preventScroll: true });
    }
    function start() {
      reset(); state = 'run'; overlay.hidden = true; last = performance.now();
    }
    function pause() {
      if (state !== 'run') return;
      state = 'pause'; 
      showOverlay('> PAUSED', 'Take a breath. Your squad is waiting.', '[ RESUME ]');
    }
    function resume() { 
      state = 'run'; overlay.hidden = true; last = performance.now(); 
    }
    function gameOver(won: boolean) {
      state = 'over';
      const record = score > best;
      if (record) { 
        best = score; 
        bestEl.textContent = pad3(best); 
        try { localStorage.setItem('tf-snake-best', String(best)); } catch (e) {} 
      }
      board.classList.remove('shake'); 
      void board.offsetWidth; 
      board.classList.add('shake');
      
      showOverlay(
        won ? '> ALL COMMITS COLLECTED' : '> MISSION FAILED',
        `Commits collected: <b>${score}</b><br>${record && score > 0 ? '> New best score!' : 'Best: <b>' + best + '</b>'}`,
        '[ RETRY ]'
      );
    }
    function primary() {
      if (state === 'pause') resume(); else start();
    }

    /* ---------- input ---------- */
    const KEYS: Record<string, string> = { 
      ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', 
      w: 'up', s: 'down', a: 'left', d: 'right', 
      W: 'up', S: 'down', A: 'left', D: 'right' 
    };

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const d = KEYS[e.key];
      if (d) {
        e.preventDefault();
        if (state === 'idle' || state === 'over') start();
        else if (state === 'pause') resume();
        setDir(d);
        return;
      }
      if (e.key === ' ' || e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        if (e.target === ovBtn && e.key === ' ') return;
        e.preventDefault();
        if (state === 'run') pause(); 
        else if (state === 'pause' && e.key !== 'Escape') resume();
        else if ((state === 'idle' || state === 'over') && e.key !== 'Escape') start();
      }
    };
    
    window.addEventListener('keydown', handleKeydown);
    ovBtn.addEventListener('click', primary);
    $('#restartTop').addEventListener('click', start);
    
    const handleVis = () => { if (document.hidden) pause(); };
    document.addEventListener('visibilitychange', handleVis);

    const padBtns = container.querySelectorAll('.pad button') as NodeListOf<HTMLButtonElement>;
    padBtns.forEach(b => b.addEventListener('pointerdown', e => {
      e.preventDefault();
      if (state === 'idle' || state === 'over') start(); 
      else if (state === 'pause') resume();
      setDir(b.dataset.d!);
    }));

    let sx = 0, sy = 0, swiping = false;
    const handlePointerDown = (e: PointerEvent) => { sx = e.clientX; sy = e.clientY; swiping = true; };
    const handlePointerMove = (e: PointerEvent) => {
      if (!swiping || state !== 'run') return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
      setDir(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
      sx = e.clientX; sy = e.clientY;
    };
    const handlePointerUp = () => { swiping = false; };
    
    cv.addEventListener('pointerdown', handlePointerDown);
    cv.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    /* ---------- drawing ---------- */
    function draw(now: number) {
      const s = cell, off = s * 0.16;
      ctx.fillStyle = C.paper; 
      ctx.fillRect(0, 0, cv.width, cv.height);

      // dotted grid, one dot per cell
      ctx.fillStyle = C.dot;
      const dot = Math.max(2, Math.round(s / 10));
      for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
          ctx.fillRect(x * s + s / 2 - dot / 2, y * s + s / 2 - dot / 2, dot, dot);
        }
      }

      // food (blinks in steps)
      if (food) {
        const big = Math.floor(now / 400) % 2;
        const inset = s * (big ? 0.14 : 0.22);
        ctx.fillStyle = C.soft; ctx.fillRect(food.x * s + inset + off, food.y * s + inset + off, s - inset * 2, s - inset * 2);
        ctx.fillStyle = C.ink;  ctx.fillRect(food.x * s + inset, food.y * s + inset, s - inset * 2, s - inset * 2);
        const b = inset + s * 0.1;
        ctx.fillStyle = C.mag;  ctx.fillRect(food.x * s + b, food.y * s + b, s - b * 2, s - b * 2);
      }

      // snake: hard shadow first, then bodies, then head
      const pad = s * 0.06;
      ctx.fillStyle = C.soft;
      snake.forEach(p => ctx.fillRect(p.x * s + pad + off, p.y * s + pad + off, s - pad * 2, s - pad * 2));
      
      for (let i = snake.length - 1; i > 0; i--) {
        const p = snake[i], b = s * 0.14;
        ctx.fillStyle = C.ink;  ctx.fillRect(p.x * s + pad, p.y * s + pad, s - pad * 2, s - pad * 2);
        ctx.fillStyle = C.blue; ctx.fillRect(p.x * s + pad + b, p.y * s + pad + b, s - (pad + b) * 2, s - (pad + b) * 2);
      }
      
      const h = snake[0];
      ctx.fillStyle = C.ink; 
      ctx.fillRect(h.x * s + pad, h.y * s + pad, s - pad * 2, s - pad * 2);
      
      const cx = h.x * s + s / 2, cy = h.y * s + s / 2;
      const e = Math.max(3, s * 0.17), px = -dir.y, py = dir.x;
      ctx.fillStyle = C.paper;
      [-1, 1].forEach(k => ctx.fillRect(
        cx + dir.x * s * 0.14 + px * k * s * 0.2 - e / 2, 
        cy + dir.y * s * 0.14 + py * k * s * 0.2 - e / 2, 
        e, e
      ));

      // sparks
      particles = particles.filter(p => now - p.born < 450);
      particles.forEach(p => {
        const t = Math.floor((now - p.born) / 75) / 6;
        const x = (p.x + p.vx * t * 1.4) * s;
        const y = (p.y + p.vy * t * 1.4 + t * t * 1.2) * s;
        const z = s * (p.big ? 0.2 : 0.11);
        ctx.fillStyle = p.col; 
        ctx.fillRect(x - z / 2, y - z / 2, z, z);
      });
    }

    function frame(now: number) {
      if (state === 'run') {
        acc += Math.min(now - last, 100);
        while (acc >= interval && state === 'run') { acc -= interval; step(); }
      }
      last = now;
      draw(now);
      frameId = requestAnimationFrame(frame);
    }

    /* ---------- boot ---------- */
    reset(); 
    resize();
    showOverlay('> READY', 'Collect <b>commits</b> to grow the squad.<br>Hit a wall or your own tail and the mission ends.', '[ START MISSION ]');
    frameId = requestAnimationFrame(t => { last = t; frame(t); });

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('visibilitychange', handleVis);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  return (
    <div ref={containerRef} className="tf-snake-wrapper min-h-screen bg-[#f4f2f0] text-[#001233] selection:bg-[#0065cc] selection:text-white pb-[64px]">
      <style>{`
        .tf-snake-wrapper {
          background-image: radial-gradient(circle,#d3d1cd 1px,transparent 1.6px),repeating-linear-gradient(0deg,rgba(0,18,51,.03) 0 1px,transparent 1px 3px);
          background-size: 24px 24px,auto;
          font-family: 'JetBrains Mono', monospace;
        }
        
        .tf-snake-wrapper button { font: inherit; color: inherit; cursor: pointer; }
        .tf-snake-wrapper button:focus-visible { outline: 3px solid #c90068; outline-offset: 3px; }

        /* header */
        .tf-snake-top {
          display: flex; justify-content: space-between; align-items: center;
          padding: 26px clamp(18px,4vw,56px);
          background: #ffffff; border-bottom: 4px solid #001233;
        }
        .tf-snake-brand { font-size: 17px; letter-spacing: .02em; }
        .tf-snake-brand b { font-weight: 400; color: #c90068; }
        .tf-snake-btn-mc {
          font-family: 'Press Start 2P', monospace; font-weight: 700; font-size: 13px; letter-spacing: .14em;
          color: #c90068; background: #ffffff;
          border: 2px solid #c90068; padding: 12px 22px;
          box-shadow: 4px 4px 0 #950048;
          transition: transform .12s steps(2), box-shadow .12s steps(2);
        }
        .tf-snake-btn-mc:hover { transform: translate(3px,3px); box-shadow: 1px 1px 0 #950048; }

        /* layout */
        .tf-snake-frame { max-width: 1180px; margin: 0 auto; border-left: 1px solid #c9d6ea; border-right: 1px solid #c9d6ea; }
        .tf-snake-page {
          min-height: calc(100svh - 92px);
          display: flex; flex-direction: column; align-items: center;
          padding: 36px 20px 64px; text-align: center;
        }
        .tf-snake-badge {
          display: inline-block; border: 2px dashed #c90068; padding: 10px 18px;
          font-family: 'Press Start 2P', monospace; font-weight: 700; font-size: 14px; letter-spacing: .3em; color: #c90068;
        }
        .tf-snake-h1 {
          margin: 20px 0 0; font-family: 'Press Start 2P', monospace; font-weight: 700;
          font-size: clamp(30px,8vw,72px); line-height: 1.02;
          color: #001233; text-shadow: .045em .045em 0 #aecae7;
        }
        .tf-snake-h1 .blue { color: #0065cc; position: relative; display: inline-block; }
        .tf-snake-h1 .blue::after { content: ""; position: absolute; left: 0; right: 0; bottom: -.06em; height: .085em; background: #c90068; }
        .tf-snake-blurb {
          margin: 26px 0 0; max-width: 640px; padding: 18px 30px;
          border-left: 8px solid #0065cc; background: rgba(255,255,255,.8);
          font-size: 14px; line-height: 2; letter-spacing: .02em; text-align: center;
        }

        /* HUD */
        .tf-snake-hud { display: flex; gap: 14px; margin-top: 32px; width: min(92vw,520px); }
        .tf-snake-stat {
          flex: 1; border: 2px dashed #c90068; padding: 8px 10px 6px; background: rgba(255,255,255,.8); text-align: left;
        }
        .tf-snake-stat small { display: block; font-size: 11px; letter-spacing: .14em; color: #3a3f52; }
        .tf-snake-stat b { font-family: 'Press Start 2P', monospace; font-weight: 700; font-size: 26px; line-height: 1.15; color: #001233; }
        .tf-snake-stat.flash b { animation: tf-flash .5s steps(1) 2; }
        @keyframes tf-flash { 50% { color: #c90068; } }

        /* board */
        .tf-snake-board {
          position: relative; margin-top: 16px; width: min(92vw,520px); aspect-ratio: 1;
          border: 4px solid #001233; box-shadow: 8px 8px 0 #aecae7; background: #f4f2f0;
        }
        .tf-snake-board.shake { animation: tf-shake .3s steps(5); }
        @keyframes tf-shake {
          0% { transform: translate(0,0); }
          20% { transform: translate(-6px,3px); }
          40% { transform: translate(5px,-4px); }
          60% { transform: translate(-4px,-2px); }
          80% { transform: translate(3px,2px); }
          100% { transform: translate(0,0); }
        }
        .tf-snake-board canvas { display: block; width: 100%; height: 100%; touch-action: none; image-rendering: pixelated; }
        
        .tf-snake-overlay {
          position: absolute; inset: 0; display: grid; place-items: center; padding: 16px;
          background: rgba(244, 242, 240, 0.78);
        }
        .tf-snake-overlay[hidden] { display: none !important; }
        
        .tf-snake-panel {
          width: min(100%,360px); padding: 22px 20px; border: 2px dashed #c90068; background: #f4f2f0;
        }
        .tf-snake-panel h2 { margin: 0; font-family: 'Press Start 2P', monospace; font-weight: 700; font-size: 26px; letter-spacing: .06em; color: #c90068; }
        .tf-snake-panel p { margin: 12px 0 0; font-size: 13px; line-height: 1.8; color: #3a3f52; }
        .tf-snake-panel p b { color: #001233; }
        
        .tf-snake-btn-go {
          margin-top: 20px; padding: 14px 26px; min-width: 220px;
          background: #0065cc; color: #fff; border: 4px solid #001233;
          font-weight: 500; font-size: 15px; font-family: 'Press Start 2P', monospace;
          transition: transform .12s steps(2), background .12s steps(2);
        }
        .tf-snake-btn-go:hover { transform: translate(3px,3px); background: #001233; color: #f4f2f0; }

        .tf-snake-hint { margin: 26px 0 0; font-size: 13px; color: #3a3f52; line-height: 1.7; max-width: 520px; }

        /* touch pad (touch devices only) */
        .pad { display: none; margin-top: 22px; grid-template-columns: repeat(3,64px); grid-template-rows: repeat(2,64px); gap: 8px; justify-content: center; }
        .pad button {
          border: 3px solid #001233; background: rgba(255,255,255,.8); font-family: 'Press Start 2P', monospace; font-size: 22px; color: #001233;
          box-shadow: 4px 4px 0 #aecae7; touch-action: manipulation;
        }
        .pad button:active { transform: translate(3px,3px); box-shadow: 1px 1px 0 #aecae7; background: #0065cc; color: #fff; }
        .pad .u { grid-column: 2; grid-row: 1; }
        .pad .l { grid-column: 1; grid-row: 2; }
        .pad .d { grid-column: 2; grid-row: 2; }
        .pad .r { grid-column: 3; grid-row: 2; }
        
        @media (pointer:coarse) { .pad { display: grid; } .tf-snake-hint .kb { display: none; } }

        @media (max-width:560px) {
          .tf-snake-btn-mc { font-size: 11px; padding: 10px 12px; letter-spacing: .08em; }
          .tf-snake-brand { font-size: 15px; }
          .tf-snake-badge { font-size: 11px; letter-spacing: .2em; }
          .tf-snake-stat b { font-size: 22px; }
          .tf-snake-blurb { padding: 14px 18px; font-size: 13px; }
        }
      `}</style>

      <header className="tf-snake-top">
        <Link href="/" className="tf-snake-brand no-underline">
          TeamForge<b>.AI</b>
        </Link>
        <button className="tf-snake-btn-mc" id="restartTop" type="button">[ RESTART ]</button>
      </header>

      <main className="tf-snake-frame">
        <section className="tf-snake-page">
          <div className="tf-snake-badge">&gt; SNAKE.EXE LOADED</div>
          <h1 className="tf-snake-h1">SQUAD <span className="blue">SNAKE</span></h1>
          <p className="tf-snake-blurb">Steer the squad, collect commits, and stay off the walls and your own tail. Every 5 commits, the sprint speeds up.</p>

          <div className="tf-snake-hud" aria-label="Score">
            <div className="tf-snake-stat"><small>SCORE</small><b id="score">000</b></div>
            <div className="tf-snake-stat"><small>BEST</small><b id="best">000</b></div>
            <div className="tf-snake-stat" id="levelBox"><small>SPRINT</small><b id="level">1</b></div>
          </div>

          <div className="tf-snake-board" id="board">
            <canvas id="cv" aria-label="Snake game board" role="img"></canvas>
            <div className="tf-snake-overlay" id="overlay" role="status" aria-live="polite">
              <div className="tf-snake-panel">
                <h2 id="ovTitle">&gt; READY</h2>
                <p id="ovText"></p>
                <button className="tf-snake-btn-go" id="ovBtn" type="button">[ START MISSION ]</button>
              </div>
            </div>
          </div>

          <p className="tf-snake-hint"><span className="kb">Arrow keys or WASD to steer. Space to pause.</span> Swipe on the board to steer on touch screens.</p>

          <div className="pad" aria-label="Direction pad">
            <button className="u" type="button" data-d="up" aria-label="Up">▲</button>
            <button className="l" type="button" data-d="left" aria-label="Left">◀</button>
            <button className="d" type="button" data-d="down" aria-label="Down">▼</button>
            <button className="r" type="button" data-d="right" aria-label="Right">▶</button>
          </div>
        </section>
      </main>
    </div>
  );
}
