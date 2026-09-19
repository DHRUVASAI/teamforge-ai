"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAuth } from "@/lib/auth";

const RETRO_PALETTE = [
  [15, 15, 15],    // Darkest
  [48, 48, 48],    // Dark grey
  [133, 133, 133], // Grey
  [255, 255, 255], // White
  [255, 219, 172], // Very Light skin
  [241, 194, 125], // Light skin
  [224, 172, 105], // Medium skin
  [141, 85, 36],   // Dark skin
  [191, 59, 59],   // Red
  [61, 148, 61],   // Green
  [59, 93, 191],   // Blue
  [235, 187, 61]   // Yellow
];

const getClosestColor = (r: number, g: number, b: number) => {
  let minDistance = Infinity;
  let closest = RETRO_PALETTE[0];
  for (const color of RETRO_PALETTE) {
    const dr = r - color[0];
    const dg = g - color[1];
    const db = b - color[2];
    const dist = (dr*dr) + (dg*dg) + (db*db);
    if (dist < minDistance) {
      minDistance = dist;
      closest = color;
    }
  }
  return closest;
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  const [socials, setSocials] = useState({ github: "", twitter: "", linkedin: "" });
  const [projects, setProjects] = useState<any[]>([]);
  const [team, setTeam] = useState<any>(null);

  useEffect(() => {
    const auth = getAuth();
    if (!auth) { router.push("/login"); return; }
    setUser(auth.user);
    
    // Fetch user projects & team
    import("@/lib/api").then(({ getProjects, getTeam }) => {
      getProjects()
        .then(res => setProjects(Array.isArray(res.data) ? res.data : []))
        .catch(err => console.error(err));
        
      getTeam()
        .then(res => setTeam(res.data))
        .catch(err => console.error(err));
    });

    const savedAvatar = localStorage.getItem("tf_avatar");
    if (savedAvatar) setAvatar(savedAvatar);
    const savedSocials = localStorage.getItem("tf_socials");
    if (savedSocials) setSocials(JSON.parse(savedSocials));
  }, [router]);

  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Camera API not supported. Make sure you are using localhost or HTTPS.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.error(e));
        setCameraActive(true);
        setAvatar(null);
      }
    } catch (err: any) {
      alert(`Camera access failed: ${err.message}. Please allow permissions in your browser.`);
    }
  };

  const captureAndPixelate = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsAiProcessing(true);
    
    setTimeout(() => {
      const ctx = canvasRef.current!.getContext("2d");
      if (!ctx) return;
      
      const scaledWidth = 56;
      const scaledHeight = 56;
      
      const video = videoRef.current!;
      const minDim = Math.min(video.videoWidth, video.videoHeight);
      const startX = (video.videoWidth - minDim) / 2;
      const startY = (video.videoHeight - minDim) / 2;
      
      // Draw center crop to canvas
      ctx.drawImage(video, startX, startY, minDim, minDim, 0, 0, scaledWidth, scaledHeight);
      
      // Quantize to Retro Palette
      const imageData = ctx.getImageData(0, 0, scaledWidth, scaledHeight);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        // Brighten the image slightly since webcams are often dark
        const r = Math.min(255, data[i] * 1.15);
        const g = Math.min(255, data[i+1] * 1.15);
        const b = Math.min(255, data[i+2] * 1.15);

        const closest = getClosestColor(r, g, b);
        data[i] = closest[0];
        data[i+1] = closest[1];
        data[i+2] = closest[2];
      }
      ctx.putImageData(imageData, 0, 0);

      // Now scale it back up with nearest-neighbor to look like crisp pixels
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = scaledWidth;
      tempCanvas.height = scaledHeight;
      const tempCtx = tempCanvas.getContext("2d")!;
      tempCtx.putImageData(imageData, 0, 0);
      
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(tempCanvas, 0, 0, scaledWidth, scaledHeight, 0, 0, canvasRef.current!.width, canvasRef.current!.height);

      const dataUrl = canvasRef.current!.toDataURL("image/png");
      setAvatar(dataUrl);
      localStorage.setItem("tf_avatar", dataUrl);
      
      const stream = videoRef.current!.srcObject as MediaStream;
      if (stream) stream.getTracks().forEach(track => track.stop());
      setCameraActive(false);
      setIsAiProcessing(false);
    }, 1500); // Fake AI generation time
  };

  const saveSocials = () => {
    localStorage.setItem("tf_socials", JSON.stringify(socials));
    alert("Profile saved!");
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6' }}>
      <nav style={{ borderBottom: '3px solid #0066CC', padding: '16px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: 'Press Start 2P', fontSize: '14px', color: '#0066CC' }}>TeamForge</span>
        </Link>
        <Link href="/dashboard" style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', color: '#1A1A1A', fontWeight: 'bold' }}>&lt; Back to Dashboard</Link>
      </nav>

      <div style={{ padding: '48px 64px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'Press Start 2P', fontSize: '24px', color: '#001133', marginBottom: '40px', textAlign: 'center' }}>COMMANDER PROFILE</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '48px' }}>
          {/* Avatar Section */}
          <div className="arcade-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 style={{ fontFamily: 'Press Start 2P', fontSize: '12px', color: '#0066CC', marginBottom: '24px' }}>[ AI RETRO AVATAR ]</h2>
            
            <div style={{ width: 200, height: 200, background: 'black', border: '4px solid #001133', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
              <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: cameraActive && !isAiProcessing ? 'block' : 'none', transform: 'scaleX(-1)' }} />
              {avatar && !cameraActive && !isAiProcessing && <img src={avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              {!avatar && !cameraActive && !isAiProcessing && (
                <div style={{ fontFamily: 'JetBrains Mono', color: '#888', fontSize: '10px', textAlign: 'center', padding: '16px' }}>NO AVATAR<br/>DETECTED</div>
              )}
              {isAiProcessing && (
                <div style={{ position: 'absolute', inset: 0, background: '#001133', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="blink" style={{ fontFamily: 'Press Start 2P', color: '#00FFFF', fontSize: '10px', lineHeight: 1.5, textAlign: 'center' }}>AI<br/>GENERATING<br/>PIXELS...</div>
                </div>
              )}
            </div>

            <canvas ref={canvasRef} width={200} height={200} style={{ display: 'none' }} />

            {!cameraActive ? (
              <button onClick={startCamera} className="arcade-btn-primary" style={{ fontSize: '10px', width: '100%' }}>[ START CAMERA ]</button>
            ) : (
              <button onClick={captureAndPixelate} disabled={isAiProcessing} className="arcade-btn-secondary" style={{ fontSize: '10px', width: '100%', background: isAiProcessing ? '#eee' : 'white' }}>
                {isAiProcessing ? '[ PROCESSING ]' : '[ GENERATE 8-BIT AI ]'}
              </button>
            )}
          </div>

          {/* Details Section */}
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div className="arcade-card" style={{ padding: '32px' }}>
                <h2 style={{ fontFamily: 'Press Start 2P', fontSize: '12px', color: '#0066CC', marginBottom: '24px' }}>[ DOSSIER ]</h2>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#555', display: 'block', marginBottom: '8px' }}>CALLSIGN</label>
                  <div style={{ fontFamily: 'Press Start 2P', fontSize: '14px', color: '#001133' }}>{user?.name?.toUpperCase()}</div>
                </div>
                <div>
                  <label style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#555', display: 'block', marginBottom: '8px' }}>EMAIL FREQUENCY</label>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '14px', color: '#001133', fontWeight: 'bold', wordBreak: 'break-all' }}>{user?.email}</div>
                </div>
              </div>

              <div className="arcade-card" style={{ padding: '32px' }}>
                <h2 style={{ fontFamily: 'Press Start 2P', fontSize: '12px', color: '#0066CC', marginBottom: '24px' }}>[ ACTIVE SQUAD ]</h2>
                {team ? (
                  <>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#555', display: 'block', marginBottom: '8px' }}>SQUAD NAME</label>
                      <div style={{ fontFamily: 'Press Start 2P', fontSize: '12px', color: '#001133', lineHeight: 1.5 }}>{team.name}</div>
                    </div>
                    <div>
                      <label style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#555', display: 'block', marginBottom: '8px' }}>INVITE CODE</label>
                      <div style={{ fontFamily: 'JetBrains Mono', fontSize: '14px', color: '#CC0066', fontWeight: 'bold' }}>{team.team_code}</div>
                    </div>
                  </>
                ) : (
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#555' }}>NO SQUAD ASSIGNED</div>
                )}
              </div>
            </div>

            <div className="arcade-card" style={{ padding: '32px', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'Press Start 2P', fontSize: '12px', color: '#CC0066', marginBottom: '24px' }}>[ SOCIAL LINKS ]</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <input placeholder="GitHub URL" value={socials.github} onChange={e => setSocials({...socials, github: e.target.value})} className="arcade-input" style={{ borderColor: '#CC0066' }} />
                <input placeholder="Twitter/X URL" value={socials.twitter} onChange={e => setSocials({...socials, twitter: e.target.value})} className="arcade-input" style={{ borderColor: '#CC0066' }} />
                <input placeholder="LinkedIn URL" value={socials.linkedin} onChange={e => setSocials({...socials, linkedin: e.target.value})} className="arcade-input" style={{ borderColor: '#CC0066' }} />
              </div>
              
              <button onClick={saveSocials} className="arcade-btn-secondary" style={{ width: '100%', borderColor: '#CC0066', color: '#CC0066' }}>[ SAVE NETWORK LINKS ]</button>
            </div>
            
            <div className="arcade-card" style={{ padding: '32px' }}>
              <h2 style={{ fontFamily: 'Press Start 2P', fontSize: '12px', color: '#0066CC', marginBottom: '24px' }}>[ COMPLETED MISSIONS ]</h2>
              {projects.length === 0 ? (
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#555' }}>NO MISSIONS COMPLETED YET</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {projects.map(p => (
                    <div key={p.project_id || p.id} style={{ border: '1px solid #cbd5e1', padding: '16px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontFamily: 'Press Start 2P', fontSize: '10px', color: '#001133' }}>{p.name}</div>
                      <Link href={`/dashboard/${p.project_id || p.id}/playbook`} className="arcade-btn-secondary" style={{ padding: '4px 8px', fontSize: '8px', textDecoration: 'none' }}>VIEW PLAYBOOK</Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
