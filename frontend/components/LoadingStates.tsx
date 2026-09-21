import React from 'react';

const C = {
  blue:     "#0065CC",
  mag:      "#C90068",
  magDeep:  "#950048",
  ink:      "#001233",
  paper:    "#F4F2F0",
  blueSoft: "#AECAE7",
  dot:      "#D3D1CD",
};

export function SkeletonBlock({ width = "100%", height = "120px", className = "" }: { width?: string, height?: string, className?: string }) {
  return (
    <div 
      className={`relative overflow-hidden border-2 border-[#001233] bg-[#E8F0FE] ${className}`}
      style={{ width, height, boxShadow: '4px 4px 0px rgba(0,18,51,0.1)' }}
    >
      {/* Retro scanline overlay on skeleton */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, #0065CC 0 1px, transparent 1px 3px)'
      }} />
      
      {/* Glint animation */}
      <div className="absolute inset-0 tf-skeleton-glint" style={{
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
        width: '50%',
      }} />

      <style>{`
        @keyframes tf-glint {
          0% { transform: translateX(-150%) skewX(-15deg); }
          100% { transform: translateX(300%) skewX(-15deg); }
        }
        .tf-skeleton-glint {
          animation: tf-glint 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}

export function InlineProgress({ pct, label = "LOADING..." }: { pct: number, label?: string }) {
  const bars = 10;
  const activeBars = Math.round((pct / 100) * bars);
  
  return (
    <div className="flex flex-col gap-2 font-['JetBrains_Mono',monospace]">
      <div className="flex justify-between items-center text-[10px] md:text-xs font-bold text-[#001233]">
        <span className="flex items-center gap-1 uppercase tracking-wider">
          <span className="inline-block w-2 h-2 bg-[#C90068] animate-pulse" />
          {label}
        </span>
        <span className="text-[#0065CC] font-['Press_Start_2P',monospace] text-[8px] md:text-[10px]">
          {Math.floor(pct)}%
        </span>
      </div>
      
      <div className="flex gap-1">
        {Array.from({ length: bars }).map((_, i) => (
          <div 
            key={i} 
            className="h-3 flex-1 border border-[#001233]"
            style={{
              backgroundColor: i < activeBars ? C.blue : 'transparent',
              transition: 'background-color 0.2s steps(1)'
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function LoadingButton({ children, onClick, className = "" }: { children: React.ReactNode, onClick?: () => void, className?: string }) {
  return (
    <button
      onClick={onClick}
      disabled
      className={`relative inline-flex items-center justify-center font-['Press_Start_2P',monospace] text-[10px] md:text-xs px-6 py-4 cursor-wait ${className}`}
      style={{
        backgroundColor: C.paper,
        color: C.blue,
        border: `2px dashed ${C.blue}`,
      }}
    >
      <span className="tf-loading-text flex items-center gap-2">
        {children}
        <span className="tf-dots inline-block w-4 text-left"></span>
      </span>

      <style>{`
        @keyframes tf-dots {
          0% { content: ""; }
          25% { content: "."; }
          50% { content: ".."; }
          75% { content: "..."; }
        }
        .tf-dots::after {
          content: "";
          animation: tf-dots 1.5s infinite steps(1);
        }
      `}</style>
    </button>
  );
}
