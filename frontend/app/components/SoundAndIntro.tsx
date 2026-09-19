"use client";
import { useEffect, useState } from "react";

export default function SoundAndIntro() {
  const [booting, setBooting] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lines, setLines] = useState<string[]>([]);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const bootSequence = [
      "TEAMFORGE OS v2.0 - BIOS SYSTEM LOG",
      "MEMORY CHECK... OK 640K",
      "LOADING KERNEL... OK",
      "MOUNTING /DEV/BRAIN... OK",
      "INITIALIZING NEURAL NETWORKS...",
      "SYNCING LLM ENDPOINTS... OK",
      "CHECKING FOR COINS... DETECTED 99 CREDITS",
    ];

    let delay = 0;
    bootSequence.forEach((line, index) => {
      delay += 150 + Math.random() * 200;
      setTimeout(() => {
        setLines(prev => [...prev, line]);
        // Play a tiny beep for each line
        playBootBeep();
      }, delay);
    });

    setTimeout(() => {
      setPhase(1);
      playSuccessChime();
    }, delay + 400);

    setTimeout(() => {
      setBooting(false);
    }, delay + 1400);
  }, []);

  let audioCtx: AudioContext | null = null;
  const getAudioContext = () => {
    if (typeof window === 'undefined') return null;
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  };

  const playBootBeep = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = 1200;
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {}
  };

  const playSuccessChime = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc1.frequency.value = 880; // A5
      osc2.frequency.value = 1108.73; // C#6
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.6);
      osc2.stop(now + 0.6);
    } catch (e) {}
  };

  useEffect(() => {
    const playHoverSound = () => {
      if (!soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        const now = ctx.currentTime;
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.065);
      } catch (e) {}
    };

    const playClickSound = () => {
      if (!soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(987.77, now);
        osc.frequency.setValueAtTime(1318.51, now + 0.045);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.23);
      } catch (e) {}
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('.arcade-card')) {
        playHoverSound();
      }
    };

    const handleClick = (e: MouseEvent) => {
      getAudioContext();
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('.arcade-card')) {
        playClickSound();
      }
    };

    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('click', handleClick);
    
    // Unlock on first interaction
    const unlock = () => getAudioContext();
    window.addEventListener('click', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });

    return () => {
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('click', handleClick);
    };
  }, [soundEnabled]);

  if (!booting) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#FAF9F6', display: 'flex', flexDirection: 'column',
      padding: '40px', overflow: 'hidden',
      fontFamily: '"JetBrains Mono", monospace', color: '#0066CC',
      border: '8px solid #0066CC',
      opacity: phase === 1 ? 0 : 1,
      transition: 'opacity 0.6s ease-out'
    }}>
      <div style={{ flex: 1 }}>
        {lines.map((line, i) => (
          <div key={i} style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
            &gt; {line}
          </div>
        ))}
        {phase === 0 && (
          <div style={{ animation: 'blink 1s step-end infinite', width: '10px', height: '18px', background: '#CC0066', display: 'inline-block', marginTop: '4px' }} />
        )}
      </div>

      {phase === 1 && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <h1 style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '32px', color: '#CC0066', textShadow: '4px 4px 0px #880044', animation: 'pulse 0.5s infinite alternate' }}>
            READY
          </h1>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
