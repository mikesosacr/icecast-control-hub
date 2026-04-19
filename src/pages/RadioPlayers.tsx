import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Radio, Play, Square, Volume2, VolumeX, Copy, Check,
  Download, ChevronLeft, Wand2, Eye, Code2, Zap, Star,
  Music, Palette, Settings2, Globe, RefreshCw, ExternalLink,
  Loader2, Sun, Moon, Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";

const API = import.meta.env.VITE_API_BASE_URL;

// ─── Types ────────────────────────────────────────────────────────────────────
interface PlayerConfig {
  name: string;
  streamUrl: string;
  genre: string;
  logoEmoji: string;
  primaryColor: string;
  secondaryColor: string;
}

interface PlayerDef {
  id: string;
  name: string;
  description: string;
  tier: "premium" | "free";
  tag: string;
}

// ─── Player Definitions ───────────────────────────────────────────────────────
const PLAYERS: PlayerDef[] = [
  { id: "luna",      name: "Luna Player",     description: "Elegante, oscuro, glassmorphic con auras animadas", tier: "premium", tag: "🌙" },
  { id: "neon",      name: "Neon Pulse",       description: "Cyberpunk neón con visualizador de barras reactivo", tier: "premium", tag: "⚡" },
  { id: "broadcast", name: "Broadcast Pro",    description: "Estilo estudio de radio profesional, limpio y serio", tier: "premium", tag: "📡" },
  { id: "glass",     name: "Glassmorphic",     description: "Frosted glass con gradientes dinámicos y blur", tier: "premium", tag: "💎" },
  { id: "cosmic",    name: "Cosmic FM",        description: "Fondo estelar animado, partículas y aurora boreal", tier: "premium", tag: "🌌" },
  { id: "studio",    name: "Studio One",       description: "Minimalista de alta gama, tipografía editorial", tier: "premium", tag: "🎚️" },
  { id: "retro",     name: "Retro Wave",       description: "Synthwave de los 80s, grid neon y sunset palette", tier: "free",    tag: "🕹️" },
  { id: "minimal",   name: "Minimal",          description: "Ultra-limpio, solo lo esencial, fondo blanco", tier: "free",    tag: "◻️" },
];

const PREVIEW_THEMES = [
  { id: "white",    label: "Claro",  bg: "#f8fafc", text: "bg-slate-100 text-slate-700" },
  { id: "dark",     label: "Oscuro", bg: "#0f172a", text: "bg-slate-800 text-slate-200" },
  { id: "colorful", label: "Color",  bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", text: "bg-violet-100 text-violet-700" },
];

// ─── HTML Generator ────────────────────────────────────────────────────────────
function generatePlayerHTML(playerId: string, config: PlayerConfig): string {
  const { name, streamUrl, genre, logoEmoji, primaryColor, secondaryColor } = config;
  const url = streamUrl || "http://tu-servidor:8000/stream";

  switch (playerId) {
    case "luna": return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name} – Luna Player</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
  body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#080b12;font-family:'DM Sans',sans-serif;overflow:hidden}
  .aura{position:fixed;border-radius:50%;filter:blur(80px);opacity:.35;animation:drift 8s ease-in-out infinite alternate}
  .aura1{width:400px;height:400px;background:${primaryColor};top:-100px;left:-100px}
  .aura2{width:300px;height:300px;background:${secondaryColor};bottom:-50px;right:-50px;animation-delay:-4s}
  @keyframes drift{0%{transform:translate(0,0) scale(1)}100%{transform:translate(30px,20px) scale(1.1)}}
  .player{position:relative;width:380px;background:rgba(255,255,255,.05);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,.1);border-radius:24px;padding:28px;box-shadow:0 32px 64px rgba(0,0,0,.5)}
  .logo{width:64px;height:64px;border-radius:18px;background:linear-gradient(135deg,${primaryColor}40,${secondaryColor}40);border:1px solid rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:30px;margin-bottom:16px}
  .station{font-size:20px;font-weight:600;color:#fff;margin-bottom:4px}
  .genre{font-size:13px;color:rgba(255,255,255,.4);margin-bottom:24px}
  .live-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.3);color:#f87171;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:600;margin-bottom:24px}
  .dot{width:6px;height:6px;background:#ef4444;border-radius:50%;animation:blink 1s ease-in-out infinite}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
  .controls{display:flex;align-items:center;gap:14px}
  .btn{width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,${primaryColor},${secondaryColor});border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px ${primaryColor}50;transition:transform .2s,box-shadow .2s;color:#fff;font-size:20px;flex-shrink:0}
  .btn:hover{transform:scale(1.08);box-shadow:0 12px 32px ${primaryColor}60}
  .vol-wrap{flex:1;display:flex;align-items:center;gap:10px}
  .vol-icon{color:rgba(255,255,255,.4);font-size:14px}
  input[type=range]{flex:1;height:3px;-webkit-appearance:none;background:rgba(255,255,255,.15);border-radius:2px;outline:none}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:${primaryColor};cursor:pointer;box-shadow:0 2px 8px ${primaryColor}80}
  .song{margin-top:20px;padding-top:20px;border-top:1px solid rgba(255,255,255,.07);font-size:13px;color:rgba(255,255,255,.5);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .song span{color:rgba(255,255,255,.8);font-weight:500}
  .hidden{display:none}
</style></head><body>
<div class="aura aura1"></div><div class="aura aura2"></div>
<div class="player">
  <div class="logo">${logoEmoji}</div>
  <div class="station">${name}</div>
  <div class="genre">${genre || "Radio Online"}</div>
  <div class="live-badge hidden" id="live"><div class="dot"></div>EN VIVO</div>
  <div class="controls">
    <button class="btn" id="btn" onclick="toggle()">▶</button>
    <div class="vol-wrap">
      <span class="vol-icon">🔊</span>
      <input type="range" min="0" max="1" step="0.02" value="0.8" oninput="setVol(this.value)">
    </div>
  </div>
  <div class="song" id="song" style="display:none">♪ <span id="song-text"></span></div>
</div>
<audio id="a"></audio>
<script>
  let on=false;
  const a=document.getElementById('a');
  function toggle(){
    const btn=document.getElementById('btn'),lv=document.getElementById('live');
    if(on){a.pause();a.src='';btn.textContent='▶';lv.classList.add('hidden');on=false;}
    else{a.src='${url}';a.volume=0.8;a.play().then(()=>{btn.textContent='⏸';lv.classList.remove('hidden');on=true;}).catch(e=>alert('Error: '+e.message));}
  }
  function setVol(v){a.volume=v;}
</script>
</body></html>`;

    case "neon": return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name} – Neon Pulse</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&display=swap');
  body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#000;font-family:'Rajdhani',sans-serif}
  .scanlines{position:fixed;inset:0;background:repeating-linear-gradient(transparent,transparent 2px,rgba(0,255,255,.02) 2px,rgba(0,255,255,.02) 4px);pointer-events:none;z-index:10}
  .player{position:relative;width:400px;border:1px solid ${primaryColor};border-radius:4px;padding:28px;box-shadow:0 0 30px ${primaryColor}40,inset 0 0 30px rgba(0,0,0,.5)}
  .corner{position:absolute;width:12px;height:12px;border-color:${primaryColor};border-style:solid;opacity:.8}
  .tl{top:-1px;left:-1px;border-width:2px 0 0 2px}
  .tr{top:-1px;right:-1px;border-width:2px 2px 0 0}
  .bl{bottom:-1px;left:-1px;border-width:0 0 2px 2px}
  .br{bottom:-1px;right:-1px;border-width:0 2px 2px 0}
  .header{display:flex;align-items:center;gap:12px;margin-bottom:20px}
  .logo{width:48px;height:48px;border:2px solid ${primaryColor};display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 0 12px ${primaryColor}60}
  .info{flex:1}
  .station{font-size:22px;font-weight:700;color:${primaryColor};text-shadow:0 0 10px ${primaryColor};letter-spacing:2px;text-transform:uppercase}
  .genre{font-size:12px;color:rgba(255,255,255,.4);letter-spacing:3px;text-transform:uppercase;margin-top:2px}
  .bars{display:flex;align-items:flex-end;gap:3px;height:24px}
  .bar{width:4px;background:${primaryColor};border-radius:1px;opacity:.8;animation:none}
  .bar.active{animation:pulse var(--d,.4s) ease-in-out infinite alternate}
  @keyframes pulse{0%{height:4px;opacity:.4}100%{height:var(--h,18px);opacity:1}}
  .status{font-size:11px;letter-spacing:3px;text-transform:uppercase;margin-bottom:20px;color:rgba(255,255,255,.3)}
  .status.live{color:${primaryColor};text-shadow:0 0 8px ${primaryColor}}
  .controls{display:flex;align-items:center;gap:16px;margin-bottom:20px}
  .btn{width:52px;height:52px;border:2px solid ${primaryColor};background:transparent;cursor:pointer;color:${primaryColor};font-size:20px;display:flex;align-items:center;justify-content:center;transition:all .2s;box-shadow:0 0 12px ${primaryColor}40}
  .btn:hover{background:${primaryColor}20;box-shadow:0 0 24px ${primaryColor}60}
  .vol{flex:1;display:flex;flex-direction:column;gap:6px}
  .vol-label{font-size:10px;letter-spacing:3px;color:rgba(255,255,255,.3);text-transform:uppercase}
  input[type=range]{width:100%;height:2px;-webkit-appearance:none;background:rgba(255,255,255,.1);outline:none;border:none}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:12px;height:12px;border-radius:0;background:${primaryColor};cursor:pointer;box-shadow:0 0 8px ${primaryColor}}
  .divider{height:1px;background:linear-gradient(90deg,transparent,${primaryColor}40,transparent);margin:4px 0 12px}
  .meta{font-size:12px;color:rgba(255,255,255,.4);letter-spacing:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .meta span{color:${primaryColor}}
</style></head><body>
<div class="scanlines"></div>
<div class="player">
  <div class="corner tl"></div><div class="corner tr"></div>
  <div class="corner bl"></div><div class="corner br"></div>
  <div class="header">
    <div class="logo">${logoEmoji}</div>
    <div class="info">
      <div class="station">${name}</div>
      <div class="genre">${genre || "Online Radio"}</div>
    </div>
    <div class="bars" id="bars">
      ${[18,12,20,8,16,10,22,14,18,10].map((h,i)=>`<div class="bar" style="--h:${h}px;--d:${0.3+i*0.05}s;height:4px"></div>`).join('')}
    </div>
  </div>
  <div class="status" id="st">◉ STANDBY</div>
  <div class="controls">
    <button class="btn" id="btn" onclick="toggle()">▶</button>
    <div class="vol">
      <div class="vol-label">Volumen</div>
      <input type="range" min="0" max="1" step="0.02" value="0.8" oninput="a.volume=this.value">
    </div>
  </div>
  <div class="divider"></div>
  <div class="meta" id="meta">CONECTAR PARA ESCUCHAR</div>
</div>
<audio id="a"></audio>
<script>
  let on=false;
  const a=document.getElementById('a');
  const bars=document.querySelectorAll('.bar');
  function toggle(){
    const btn=document.getElementById('btn'),st=document.getElementById('st'),meta=document.getElementById('meta');
    if(on){a.pause();a.src='';btn.textContent='▶';st.className='status';st.textContent='◉ STANDBY';bars.forEach(b=>{b.classList.remove('active');b.style.height='4px'});meta.innerHTML='CONECTAR PARA ESCUCHAR';on=false;}
    else{a.src='${url}';a.volume=0.8;a.play().then(()=>{btn.textContent='⏸';st.className='status live';st.textContent='◉ EN VIVO';bars.forEach(b=>b.classList.add('active'));meta.innerHTML='<span>▶</span> ${name.toUpperCase()}';on=true;}).catch(e=>alert('Error: '+e.message));}
  }
</script>
</body></html>`;

    case "broadcast": return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name} – Broadcast Pro</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
  body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0d1117;font-family:'IBM Plex Sans',sans-serif}
  .player{width:420px;background:#161b22;border:1px solid #30363d;border-radius:12px;overflow:hidden}
  .topbar{background:#21262d;border-bottom:1px solid #30363d;padding:10px 16px;display:flex;align-items:center;gap:8px}
  .dot2{width:10px;height:10px;border-radius:50%}
  .d1{background:#ff5f57}.d2{background:#ffbd2e}.d3{background:#28c840}
  .title{flex:1;text-align:center;font-size:12px;color:#8b949e;font-family:'IBM Plex Mono',monospace}
  .body{padding:24px}
  .signal{display:flex;align-items:center;gap:10px;margin-bottom:20px;padding:10px 14px;background:#0d1117;border:1px solid #30363d;border-radius:8px}
  .sig-dot{width:8px;height:8px;border-radius:50%;background:#8b949e;flex-shrink:0}
  .sig-dot.live{background:#3fb950;box-shadow:0 0 8px #3fb95080;animation:blink 1s infinite}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}
  .sig-info{flex:1}
  .sig-name{font-size:14px;font-weight:600;color:#e6edf3}
  .sig-sub{font-size:11px;color:#8b949e;font-family:'IBM Plex Mono',monospace;margin-top:1px}
  .sig-emoji{font-size:22px}
  .row{display:flex;align-items:center;gap:12px;margin-bottom:20px}
  .btn{width:48px;height:48px;border-radius:8px;background:#238636;border:1px solid #2ea043;cursor:pointer;color:#fff;font-size:16px;display:flex;align-items:center;justify-content:center;transition:all .15s;flex-shrink:0}
  .btn:hover{background:#2ea043}
  .btn.stop{background:#da3633;border-color:#f85149}
  .btn.stop:hover{background:#f85149}
  .vol-group{flex:1}
  .vol-label{font-size:10px;color:#8b949e;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;font-family:'IBM Plex Mono',monospace}
  input[type=range]{width:100%;height:3px;-webkit-appearance:none;background:#30363d;border-radius:2px;outline:none}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:13px;height:13px;border-radius:3px;background:#58a6ff;cursor:pointer}
  .meta-box{background:#0d1117;border:1px solid #30363d;border-radius:8px;padding:10px 14px}
  .meta-label{font-size:10px;color:#8b949e;text-transform:uppercase;letter-spacing:1px;font-family:'IBM Plex Mono',monospace;margin-bottom:4px}
  .meta-val{font-size:13px;color:#e6edf3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .footer{padding:12px 24px;border-top:1px solid #21262d;display:flex;justify-content:space-between;align-items:center}
  .badge{font-size:10px;font-family:'IBM Plex Mono',monospace;padding:3px 8px;border-radius:4px;border:1px solid}
  .badge.offline{color:#8b949e;border-color:#30363d}
  .badge.online{color:#3fb950;border-color:#238636;background:#1f3d2a}
  .fps{font-size:10px;color:#8b949e;font-family:'IBM Plex Mono',monospace}
</style></head><body>
<div class="player">
  <div class="topbar">
    <div class="dot2 d1"></div><div class="dot2 d2"></div><div class="dot2 d3"></div>
    <div class="title">broadcast-pro v2.0</div>
  </div>
  <div class="body">
    <div class="signal">
      <div class="sig-dot" id="sd"></div>
      <div class="sig-info">
        <div class="sig-name">${name}</div>
        <div class="sig-sub">${genre || "online-radio"} · ${primaryColor}</div>
      </div>
      <div class="sig-emoji">${logoEmoji}</div>
    </div>
    <div class="row">
      <button class="btn" id="btn" onclick="toggle()">▶</button>
      <div class="vol-group">
        <div class="vol-label">audio level</div>
        <input type="range" min="0" max="1" step="0.02" value="0.8" oninput="a.volume=this.value">
      </div>
    </div>
    <div class="meta-box">
      <div class="meta-label">now playing</div>
      <div class="meta-val" id="meta">—</div>
    </div>
  </div>
  <div class="footer">
    <div class="badge offline" id="badge">● OFFLINE</div>
    <div class="fps">128kbps · AAC+</div>
  </div>
</div>
<audio id="a"></audio>
<script>
  let on=false;const a=document.getElementById('a');
  function toggle(){
    const btn=document.getElementById('btn'),sd=document.getElementById('sd'),badge=document.getElementById('badge'),meta=document.getElementById('meta');
    if(on){a.pause();a.src='';btn.textContent='▶';btn.className='btn';sd.className='sig-dot';badge.className='badge offline';badge.textContent='● OFFLINE';meta.textContent='—';on=false;}
    else{a.src='${url}';a.volume=0.8;a.play().then(()=>{btn.textContent='⏸';btn.className='btn stop';sd.className='sig-dot live';badge.className='badge online';badge.textContent='● ON AIR';meta.textContent='${name} en vivo';on=true;}).catch(e=>alert('Error: '+e.message));}
  }
</script>
</body></html>`;

    case "glass": return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name} – Glassmorphic</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
  body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,${primaryColor} 0%,${secondaryColor} 50%,#1a1a2e 100%);font-family:'Plus Jakarta Sans',sans-serif;overflow:hidden}
  .blob{position:fixed;border-radius:50%;filter:blur(60px);opacity:.6;animation:float 6s ease-in-out infinite}
  .b1{width:350px;height:350px;background:${primaryColor};top:-100px;right:-50px}
  .b2{width:250px;height:250px;background:${secondaryColor};bottom:-50px;left:-50px;animation-delay:-3s}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}
  .player{position:relative;width:380px;background:rgba(255,255,255,.12);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-radius:28px;border:1px solid rgba(255,255,255,.25);padding:32px;box-shadow:0 8px 32px rgba(0,0,0,.2),inset 0 1px 0 rgba(255,255,255,.2)}
  .top{display:flex;align-items:center;gap:16px;margin-bottom:28px}
  .logo{width:64px;height:64px;background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.3);border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:28px;box-shadow:0 4px 16px rgba(0,0,0,.15)}
  .station{font-size:22px;font-weight:700;color:#fff;letter-spacing:-.3px}
  .genre{font-size:13px;color:rgba(255,255,255,.55);margin-top:3px}
  .live{display:inline-flex;align-items:center;gap:6px;background:rgba(239,68,68,.25);border:1px solid rgba(239,68,68,.4);border-radius:20px;padding:5px 12px;font-size:11px;font-weight:700;color:#fca5a5;margin-bottom:24px;opacity:0;transition:opacity .3s}
  .live.show{opacity:1}
  .dot{width:5px;height:5px;background:#ef4444;border-radius:50%;animation:blink 1s infinite}
  @keyframes blink{50%{opacity:.2}}
  .btn{width:60px;height:60px;border-radius:50%;background:rgba(255,255,255,.25);border:1px solid rgba(255,255,255,.4);cursor:pointer;color:#fff;font-size:22px;display:flex;align-items:center;justify-content:center;transition:all .2s;box-shadow:0 4px 16px rgba(0,0,0,.15);flex-shrink:0}
  .btn:hover{background:rgba(255,255,255,.35);transform:scale(1.05)}
  .controls{display:flex;align-items:center;gap:16px;margin-bottom:24px}
  .vol{flex:1;display:flex;flex-direction:column;gap:8px}
  .vol-row{display:flex;align-items:center;gap:8px}
  .vol-icon{font-size:14px;opacity:.6;color:#fff}
  input[type=range]{flex:1;height:3px;-webkit-appearance:none;background:rgba(255,255,255,.2);border-radius:3px;outline:none}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#fff;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.2)}
  .divider{height:1px;background:rgba(255,255,255,.15);margin-bottom:20px}
  .song{font-size:13px;color:rgba(255,255,255,.6);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:center}
  .song span{color:#fff;font-weight:600}
</style></head><body>
<div class="blob b1"></div><div class="blob b2"></div>
<div class="player">
  <div class="top">
    <div class="logo">${logoEmoji}</div>
    <div><div class="station">${name}</div><div class="genre">${genre || "Radio Online"}</div></div>
  </div>
  <div class="live" id="live"><div class="dot"></div>EN VIVO</div>
  <div class="controls">
    <button class="btn" id="btn" onclick="toggle()">▶</button>
    <div class="vol">
      <div class="vol-row"><span class="vol-icon">🔊</span><input type="range" min="0" max="1" step="0.02" value="0.8" oninput="a.volume=this.value"></div>
    </div>
  </div>
  <div class="divider"></div>
  <div class="song" id="song">Presiona play para escuchar</div>
</div>
<audio id="a"></audio>
<script>
  let on=false;const a=document.getElementById('a');
  function toggle(){
    const btn=document.getElementById('btn'),lv=document.getElementById('live'),song=document.getElementById('song');
    if(on){a.pause();a.src='';btn.textContent='▶';lv.classList.remove('show');song.innerHTML='Presiona play para escuchar';on=false;}
    else{a.src='${url}';a.volume=0.8;a.play().then(()=>{btn.textContent='⏸';lv.classList.add('show');song.innerHTML='<span>${name}</span>';on=true;}).catch(e=>alert('Error: '+e.message));}
  }
</script>
</body></html>`;

    case "cosmic": return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name} – Cosmic FM</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');
  body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#03001e;font-family:'Outfit',sans-serif;overflow:hidden}
  canvas{position:fixed;inset:0;z-index:0}
  .aurora{position:fixed;bottom:0;left:0;right:0;height:40%;background:linear-gradient(to top,${primaryColor}20,${secondaryColor}10,transparent);filter:blur(40px);animation:aurora 8s ease-in-out infinite alternate}
  @keyframes aurora{0%{transform:scaleX(1) translateX(0)}100%{transform:scaleX(1.1) translateX(20px)}}
  .player{position:relative;z-index:1;width:380px;background:rgba(3,0,30,.7);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.08);border-radius:24px;padding:28px;box-shadow:0 0 60px ${primaryColor}20}
  .cosmos-header{text-align:center;margin-bottom:24px}
  .logo-ring{width:80px;height:80px;margin:0 auto 14px;border-radius:50%;background:radial-gradient(circle at 35% 35%,${primaryColor}40,transparent 60%),radial-gradient(circle at 70% 70%,${secondaryColor}30,transparent 60%);border:1px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;font-size:34px;box-shadow:0 0 30px ${primaryColor}30,inset 0 0 20px rgba(0,0,0,.3)}
  .station{font-size:24px;font-weight:700;color:#fff;letter-spacing:-.5px;margin-bottom:4px}
  .freq{font-size:12px;color:rgba(255,255,255,.3);letter-spacing:3px;text-transform:uppercase}
  .live-pill{display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,${primaryColor}30,${secondaryColor}20);border:1px solid ${primaryColor}40;border-radius:20px;padding:5px 14px;font-size:11px;font-weight:700;color:${primaryColor};margin:0 auto 20px;opacity:0;transition:opacity .4s}
  .live-pill.on{opacity:1}
  .pulsedot{width:6px;height:6px;background:${primaryColor};border-radius:50%;animation:pd 1.2s ease-in-out infinite}
  @keyframes pd{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.4);opacity:.5}}
  .controls{display:flex;align-items:center;justify-content:center;gap:20px;margin-bottom:20px}
  .btn{width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,${primaryColor},${secondaryColor});border:none;cursor:pointer;color:#fff;font-size:24px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 30px ${primaryColor}50,0 8px 20px rgba(0,0,0,.3);transition:all .2s}
  .btn:hover{transform:scale(1.08);box-shadow:0 0 50px ${primaryColor}70}
  .vol-row{display:flex;align-items:center;gap:10px;padding:0 10px}
  .vi{font-size:14px;opacity:.4;color:#fff}
  input[type=range]{flex:1;height:2px;-webkit-appearance:none;background:rgba(255,255,255,.1);border-radius:1px;outline:none}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:linear-gradient(135deg,${primaryColor},${secondaryColor});cursor:pointer;box-shadow:0 0 10px ${primaryColor}}
  .sep{height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent);margin:18px 0}
  .now{text-align:center;font-size:12px;color:rgba(255,255,255,.35);letter-spacing:1px}
  .now span{color:rgba(255,255,255,.7);display:block;font-size:14px;font-weight:600;margin-top:4px}
</style></head><body>
<div class="aurora"></div>
<div class="player">
  <div class="cosmos-header">
    <div class="logo-ring">${logoEmoji}</div>
    <div class="station">${name}</div>
    <div class="freq">${genre || "ONLINE RADIO"}</div>
  </div>
  <div style="text-align:center"><div class="live-pill" id="lp"><div class="pulsedot"></div>TRANSMITIENDO</div></div>
  <div class="controls">
    <button class="btn" id="btn" onclick="toggle()">▶</button>
  </div>
  <div class="vol-row"><span class="vi">🔇</span><input type="range" min="0" max="1" step="0.02" value="0.8" oninput="a.volume=this.value"><span class="vi">🔊</span></div>
  <div class="sep"></div>
  <div class="now" id="now">PRESS PLAY<span id="song"> —</span></div>
</div>
<audio id="a"></audio>
<script>
  let on=false;const a=document.getElementById('a');
  // Stars
  const c=document.createElement('canvas');c.style.cssText='position:fixed;inset:0;z-index:0';document.body.prepend(c);
  const ctx=c.getContext('2d');c.width=window.innerWidth;c.height=window.innerHeight;
  const stars=Array.from({length:150},()=>({x:Math.random()*c.width,y:Math.random()*c.height,r:Math.random()*1.5+.3,o:Math.random()}));
  function drawStars(){ctx.clearRect(0,0,c.width,c.height);stars.forEach(s=>{ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,'+s.o+')';ctx.fill();s.o+=Math.random()*.02-.01;if(s.o<.1)s.o=.1;if(s.o>1)s.o=1;});requestAnimationFrame(drawStars);}
  drawStars();
  function toggle(){
    const btn=document.getElementById('btn'),lp=document.getElementById('lp'),song=document.getElementById('song'),now=document.getElementById('now');
    if(on){a.pause();a.src='';btn.textContent='▶';lp.classList.remove('on');song.textContent=' —';now.childNodes[0].textContent='PRESS PLAY';on=false;}
    else{a.src='${url}';a.volume=0.8;a.play().then(()=>{btn.textContent='⏸';lp.classList.add('on');song.textContent='${name}';now.childNodes[0].textContent='EN VIVO';on=true;}).catch(e=>alert('Error: '+e.message));}
  }
</script>
</body></html>`;

    case "studio": return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name} – Studio One</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Jost:wght@300;400;500&display=swap');
  body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#fafafa;font-family:'Jost',sans-serif}
  .player{width:400px;background:#fff;border-radius:4px;overflow:hidden;box-shadow:0 2px 40px rgba(0,0,0,.08)}
  .accent-bar{height:3px;background:linear-gradient(90deg,${primaryColor},${secondaryColor})}
  .inner{padding:36px 36px 28px}
  .eyebrow{font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#999;margin-bottom:12px;font-weight:500}
  .station{font-family:'Cormorant Garamond',serif;font-size:36px;font-weight:600;color:#111;line-height:1.1;margin-bottom:4px}
  .genre{font-size:13px;color:#aaa;font-style:italic;font-family:'Cormorant Garamond',serif;margin-bottom:32px}
  .live-row{display:flex;align-items:center;gap:8px;margin-bottom:32px;opacity:0;transition:opacity .3s}
  .live-row.show{opacity:1}
  .live-line{flex:1;height:1px;background:#eee}
  .live-text{font-size:10px;letter-spacing:3px;color:${primaryColor};font-weight:500}
  .live-dot{width:5px;height:5px;border-radius:50%;background:${primaryColor};animation:blink 1.4s ease-in-out infinite}
  @keyframes blink{50%{opacity:0}}
  .controls-row{display:flex;align-items:center;gap:20px;margin-bottom:32px}
  .btn{width:52px;height:52px;border-radius:50%;background:${primaryColor};border:none;cursor:pointer;color:#fff;font-size:18px;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0;box-shadow:0 4px 16px ${primaryColor}40}
  .btn:hover{transform:translateY(-1px);box-shadow:0 6px 20px ${primaryColor}50}
  .vol{flex:1}
  .vol-label{font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#ccc;margin-bottom:8px}
  input[type=range]{width:100%;height:1px;-webkit-appearance:none;background:#e5e5e5;border-radius:1px;outline:none}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:12px;height:12px;border-radius:50%;background:${primaryColor};cursor:pointer}
  .footer-bar{background:#f9f9f9;border-top:1px solid #f0f0f0;padding:14px 36px;display:flex;align-items:center;justify-content:space-between}
  .logo-sm{font-size:20px}
  .meta{font-size:11px;color:#999;font-style:italic;font-family:'Cormorant Garamond',serif;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
</style></head><body>
<div class="player">
  <div class="accent-bar"></div>
  <div class="inner">
    <div class="eyebrow">Radio Online</div>
    <div class="station">${name}</div>
    <div class="genre">${genre || "música & más"}</div>
    <div class="live-row" id="lr">
      <div class="live-line"></div>
      <div class="live-dot"></div>
      <div class="live-text">EN VIVO</div>
      <div class="live-line"></div>
    </div>
    <div class="controls-row">
      <button class="btn" id="btn" onclick="toggle()">▶</button>
      <div class="vol">
        <div class="vol-label">Volumen</div>
        <input type="range" min="0" max="1" step="0.02" value="0.8" oninput="a.volume=this.value">
      </div>
    </div>
  </div>
  <div class="footer-bar">
    <div class="logo-sm">${logoEmoji}</div>
    <div class="meta" id="meta">—</div>
  </div>
</div>
<audio id="a"></audio>
<script>
  let on=false;const a=document.getElementById('a');
  function toggle(){
    const btn=document.getElementById('btn'),lr=document.getElementById('lr'),meta=document.getElementById('meta');
    if(on){a.pause();a.src='';btn.textContent='▶';lr.classList.remove('show');meta.textContent='—';on=false;}
    else{a.src='${url}';a.volume=0.8;a.play().then(()=>{btn.textContent='⏸';lr.classList.add('show');meta.textContent='${name} — en directo';on=true;}).catch(e=>alert('Error: '+e.message));}
  }
</script>
</body></html>`;

    case "retro": return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name} – Retro Wave</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');
  body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0a0015;overflow:hidden}
  .grid{position:fixed;bottom:0;left:0;right:0;height:60%;background:linear-gradient(transparent 0%,transparent 50%,#ff2d78 50%,#ff2d78 100%);background-size:40px 40px;background-position:0 0;mask-image:perspective(500px) rotateX(30deg);-webkit-mask-image:perspective(500px) rotateX(30deg);opacity:.3}
  .sun{position:fixed;width:200px;height:100px;background:linear-gradient(180deg,#ff6b35 0%,#ff2d78 50%,transparent 100%);border-radius:100px 100px 0 0;bottom:38%;left:50%;transform:translateX(-50%);opacity:.8;overflow:hidden}
  .sun-line{height:8px;background:#0a0015;margin-top:12px}
  .sun-line:nth-child(2){margin-top:20px}.sun-line:nth-child(3){margin-top:10px}
  .player{position:relative;z-index:1;width:400px;background:rgba(10,0,21,.9);border:2px solid #ff2d78;border-radius:2px;padding:28px;box-shadow:0 0 30px #ff2d7860,inset 0 0 40px rgba(255,45,120,.05)}
  .crt{position:absolute;inset:0;background:repeating-linear-gradient(transparent,transparent 2px,rgba(0,0,0,.15) 2px,rgba(0,0,0,.15) 4px);pointer-events:none;border-radius:2px}
  .station{font-family:'Press Start 2P',monospace;font-size:13px;color:#ff2d78;text-shadow:0 0 10px #ff2d78;margin-bottom:8px;letter-spacing:2px}
  .genre-txt{font-family:'VT323',monospace;font-size:20px;color:#ff9f43;margin-bottom:20px;letter-spacing:3px}
  .logo-row{display:flex;align-items:center;gap:12px;margin-bottom:22px}
  .logo-box{width:52px;height:52px;border:2px solid #ff2d78;display:flex;align-items:center;justify-content:center;font-size:24px;background:#1a0030;box-shadow:0 0 12px #ff2d7840}
  .freq-display{font-family:'VT323',monospace;font-size:28px;color:#00f0ff;text-shadow:0 0 8px #00f0ff;letter-spacing:4px}
  .status-txt{font-family:'VT323',monospace;font-size:16px;color:#ff9f43;margin-bottom:18px;letter-spacing:2px}
  .btn-row{display:flex;align-items:center;gap:14px;margin-bottom:18px}
  .btn{width:52px;height:52px;background:#ff2d78;border:2px solid #ff2d78;cursor:pointer;color:#fff;font-size:20px;display:flex;align-items:center;justify-content:center;font-family:'Press Start 2P',monospace;font-size:14px;transition:all .1s;box-shadow:0 0 16px #ff2d7860}
  .btn:hover{background:#ff6b9d;box-shadow:0 0 24px #ff2d7890}
  .btn:active{transform:translate(2px,2px);box-shadow:none}
  .vol{flex:1;display:flex;flex-direction:column;gap:6px}
  .vol-label{font-family:'VT323',monospace;font-size:14px;color:#ff9f43;letter-spacing:2px}
  input[type=range]{width:100%;height:4px;-webkit-appearance:none;background:#1a0030;border:1px solid #ff2d7860;outline:none}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;background:#ff2d78;cursor:pointer;border:1px solid #fff}
  .now{font-family:'VT323',monospace;font-size:16px;color:#00f0ff;text-shadow:0 0 6px #00f0ff50;letter-spacing:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
</style></head><body>
<div class="grid"></div>
<div class="sun"><div class="sun-line"></div><div class="sun-line"></div><div class="sun-line"></div></div>
<div class="player">
  <div class="crt"></div>
  <div class="logo-row">
    <div class="logo-box">${logoEmoji}</div>
    <div>
      <div class="station">${name.toUpperCase()}</div>
      <div class="genre-txt">${genre || "SYNTHWAVE RADIO"}</div>
    </div>
  </div>
  <div class="freq-display" id="freq">-- ---.--</div>
  <div class="status-txt" id="st">[ STANDBY ]</div>
  <div class="btn-row">
    <button class="btn" id="btn" onclick="toggle()">▶</button>
    <div class="vol">
      <div class="vol-label">VOL</div>
      <input type="range" min="0" max="1" step="0.02" value="0.8" oninput="a.volume=this.value">
    </div>
  </div>
  <div class="now" id="now">READY...</div>
</div>
<audio id="a"></audio>
<script>
  let on=false;const a=document.getElementById('a');
  function toggle(){
    const btn=document.getElementById('btn'),st=document.getElementById('st'),now=document.getElementById('now'),freq=document.getElementById('freq');
    if(on){a.pause();a.src='';btn.textContent='▶';st.textContent='[ STANDBY ]';now.textContent='READY...';freq.textContent='-- ---.--';on=false;}
    else{a.src='${url}';a.volume=0.8;a.play().then(()=>{btn.textContent='⏸';st.textContent='[ ON AIR ]';now.textContent='${name.toUpperCase()}';freq.textContent='FM 100.7';on=true;}).catch(e=>alert('Error: '+e.message));}
  }
</script>
</body></html>`;

    case "minimal":
    default: return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
  body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#fff;font-family:'Inter',sans-serif}
  .player{width:360px;padding:32px}
  .logo{font-size:32px;margin-bottom:16px}
  .station{font-size:22px;font-weight:600;color:#111;margin-bottom:4px;letter-spacing:-.3px}
  .genre{font-size:13px;color:#999;margin-bottom:28px}
  .live{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:500;color:#ef4444;margin-bottom:24px;opacity:0;transition:opacity .3s}
  .live.show{opacity:1}
  .dot{width:5px;height:5px;background:#ef4444;border-radius:50%;animation:blink 1.2s ease-in-out infinite}
  @keyframes blink{50%{opacity:0}}
  hr{border:none;border-top:1px solid #f0f0f0;margin-bottom:24px}
  .controls{display:flex;align-items:center;gap:16px}
  .btn{width:48px;height:48px;border-radius:50%;background:${primaryColor};border:none;cursor:pointer;color:#fff;font-size:18px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:transform .15s,box-shadow .15s;box-shadow:0 4px 12px ${primaryColor}40}
  .btn:hover{transform:scale(1.05);box-shadow:0 6px 16px ${primaryColor}50}
  .vol{flex:1;display:flex;align-items:center;gap:10px}
  .vi{font-size:13px;color:#ccc}
  input[type=range]{flex:1;height:2px;-webkit-appearance:none;background:#eee;border-radius:1px;outline:none}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:12px;height:12px;border-radius:50%;background:${primaryColor};cursor:pointer}
  .meta{margin-top:24px;font-size:12px;color:#bbb;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
</style></head><body>
<div class="player">
  <div class="logo">${logoEmoji}</div>
  <div class="station">${name}</div>
  <div class="genre">${genre || "Radio Online"}</div>
  <div class="live" id="lv"><div class="dot"></div>En vivo</div>
  <hr>
  <div class="controls">
    <button class="btn" id="btn" onclick="toggle()">▶</button>
    <div class="vol">
      <span class="vi">🔊</span>
      <input type="range" min="0" max="1" step="0.02" value="0.8" oninput="a.volume=this.value">
    </div>
  </div>
  <div class="meta" id="meta"></div>
</div>
<audio id="a"></audio>
<script>
  let on=false;const a=document.getElementById('a');
  function toggle(){
    const btn=document.getElementById('btn'),lv=document.getElementById('lv'),meta=document.getElementById('meta');
    if(on){a.pause();a.src='';btn.textContent='▶';lv.classList.remove('show');meta.textContent='';on=false;}
    else{a.src='${url}';a.volume=0.8;a.play().then(()=>{btn.textContent='⏸';lv.classList.add('show');meta.textContent='${name}';on=true;}).catch(e=>alert('Error: '+e.message));}
  }
</script>
</body></html>`;
  }
}

// ─── Preview Component ────────────────────────────────────────────────────────
function PlayerPreview({ playerId, config, previewBg }: { playerId: string; config: PlayerConfig; previewBg: string }) {
  const html = generatePlayerHTML(playerId, config);
  const bgStyle = previewBg === "colorful"
    ? { background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }
    : { background: previewBg === "dark" ? "#0f172a" : "#f8fafc" };

  return (
    <div className="w-full h-full rounded-xl overflow-hidden" style={bgStyle}>
      <iframe
        srcDoc={html}
        className="w-full h-full border-0"
        title={`preview-${playerId}`}
        sandbox="allow-scripts"
      />
    </div>
  );
}

// ─── Mini Player Card ─────────────────────────────────────────────────────────
function PlayerCard({ player, selected, onClick }: { player: PlayerDef; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
        selected
          ? "border-violet-500 bg-violet-50 shadow-md shadow-violet-100"
          : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{player.tag}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold truncate ${selected ? "text-violet-800" : "text-gray-800"}`}>
              {player.name}
            </span>
            {player.tier === "premium" && (
              <span className="flex-shrink-0 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md font-bold flex items-center gap-0.5">
                <Star size={9} fill="currentColor" /> PRO
              </span>
            )}
          </div>
          <div className="text-xs text-gray-400 mt-0.5 truncate">{player.description}</div>
        </div>
        {selected && (
          <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0">
            <Check size={11} className="text-white" />
          </div>
        )}
      </div>
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RadioPlayers() {
  const navigate = useNavigate();
  const [selectedPlayer, setSelectedPlayer] = useState("luna");
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [previewTheme, setPreviewTheme] = useState("dark");
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [config, setConfig] = useState<PlayerConfig>({
    name: "",
    streamUrl: "",
    genre: "",
    logoEmoji: "📻",
    primaryColor: "#6d28d9",
    secondaryColor: "#db2777",
  });

  const player = PLAYERS.find(p => p.id === selectedPlayer)!;
  const html = generatePlayerHTML(selectedPlayer, config);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(html);
    setCopied(true);
    toast.success("Código copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  }, [html]);

  const handleDownload = useCallback(() => {
    setDownloading(true);
    const blob = new Blob([html], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${(config.name || "player").replace(/\s+/g, "-").toLowerCase()}-${selectedPlayer}.html`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("Archivo descargado");
    setTimeout(() => setDownloading(false), 800);
  }, [html, config.name, selectedPlayer]);

  const EMOJIS = ["📻", "🎵", "🎶", "🎙️", "🎚️", "📡", "🌟", "🔥", "💎", "🌙", "⚡", "🎭", "🎸", "🎹", "🌊"];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 font-sans">

      {/* ── LEFT SIDEBAR: Player List ──────────────────────────────────────── */}
      <aside className="w-72 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col h-full">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <button
            onClick={() => navigate("/my-station")}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-700 mb-4 transition-colors"
          >
            <ChevronLeft size={14} /> Volver a Mi Estación
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-200">
              <Layers size={16} className="text-white" />
            </div>
            <div>
              <h1 className="font-black text-gray-900 text-sm leading-tight">Reproductores</h1>
              <p className="text-xs text-gray-400">Elige y personaliza tu player</p>
            </div>
          </div>
        </div>

        {/* Player list */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          <div className="text-xs font-bold text-amber-600 uppercase tracking-wider px-2 mb-1 flex items-center gap-1.5">
            <Star size={10} fill="currentColor" /> Premium
          </div>
          {PLAYERS.filter(p => p.tier === "premium").map(p => (
            <PlayerCard key={p.id} player={p} selected={selectedPlayer === p.id} onClick={() => setSelectedPlayer(p.id)} />
          ))}
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 mt-4 mb-1">
            Gratuitos
          </div>
          {PLAYERS.filter(p => p.tier === "free").map(p => (
            <PlayerCard key={p.id} player={p} selected={selectedPlayer === p.id} onClick={() => setSelectedPlayer(p.id)} />
          ))}
        </div>
      </aside>

      {/* ── CENTER: Config + Preview ───────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xl">{player.tag}</span>
            <div>
              <h2 className="font-black text-gray-900 text-sm">{player.name}</h2>
              <p className="text-xs text-gray-400">{player.description}</p>
            </div>
            {player.tier === "premium" && (
              <span className="text-xs bg-gradient-to-r from-amber-400 to-orange-400 text-white px-2.5 py-1 rounded-full font-bold shadow-sm">
                ✦ PREMIUM
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-300 bg-white px-3 py-2 rounded-xl transition-all"
            >
              {copied ? <><Check size={12} className="text-green-500" /> Copiado</> : <><Copy size={12} /> Copiar HTML</>}
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-violet-600 to-pink-600 text-white px-3 py-2 rounded-xl font-semibold shadow-md shadow-violet-200 hover:shadow-lg transition-all disabled:opacity-60"
            >
              {downloading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
              Descargar .html
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">

          {/* Config panel */}
          <div className="w-72 flex-shrink-0 bg-white border-r border-gray-100 overflow-y-auto">
            <div className="px-5 py-4 space-y-5">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Settings2 size={11} /> Configuración
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Nombre de la radio *</label>
                <input
                  value={config.name}
                  onChange={e => setConfig(c => ({ ...c, name: e.target.value }))}
                  placeholder="Ej: La Mejor FM"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-400 transition-all"
                />
              </div>

              {/* Stream URL */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                  <Globe size={10} className="inline mr-1" />URL del Stream
                </label>
                <input
                  value={config.streamUrl}
                  onChange={e => setConfig(c => ({ ...c, streamUrl: e.target.value }))}
                  placeholder="http://servidor:8000/stream"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-violet-400 transition-all"
                />
              </div>

              {/* Genre */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Género / Descripción</label>
                <input
                  value={config.genre}
                  onChange={e => setConfig(c => ({ ...c, genre: e.target.value }))}
                  placeholder="Ej: Rock, Pop, Electrónica"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-400 transition-all"
                />
              </div>

              {/* Logo Emoji */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Ícono / Logo</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {EMOJIS.map(e => (
                    <button
                      key={e}
                      onClick={() => setConfig(c => ({ ...c, logoEmoji: e }))}
                      className={`h-9 rounded-xl text-lg transition-all border-2 ${config.logoEmoji === e ? "border-violet-400 bg-violet-50 scale-110" : "border-transparent bg-gray-50 hover:border-gray-200"}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-2">
                  <Palette size={10} className="inline mr-1" />Colores
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={config.primaryColor}
                      onChange={e => setConfig(c => ({ ...c, primaryColor: e.target.value }))}
                      className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-white flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="text-xs text-gray-400 mb-1">Color primario</div>
                      <input
                        value={config.primaryColor}
                        onChange={e => setConfig(c => ({ ...c, primaryColor: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-violet-400"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={config.secondaryColor}
                      onChange={e => setConfig(c => ({ ...c, secondaryColor: e.target.value }))}
                      className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-white flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="text-xs text-gray-400 mb-1">Color secundario</div>
                      <input
                        value={config.secondaryColor}
                        onChange={e => setConfig(c => ({ ...c, secondaryColor: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-violet-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick color presets */}
              <div>
                <div className="text-xs text-gray-400 mb-2">Paletas rápidas</div>
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { primary: "#6d28d9", secondary: "#db2777", label: "Violeta" },
                    { primary: "#0ea5e9", secondary: "#06b6d4", label: "Cielo" },
                    { primary: "#ef4444", secondary: "#f97316", label: "Fuego" },
                    { primary: "#10b981", secondary: "#06b6d4", label: "Mar" },
                    { primary: "#f59e0b", secondary: "#ef4444", label: "Sunset" },
                    { primary: "#111827", secondary: "#374151", label: "Negro" },
                  ].map(preset => (
                    <button
                      key={preset.label}
                      onClick={() => setConfig(c => ({ ...c, primaryColor: preset.primary, secondaryColor: preset.secondary }))}
                      title={preset.label}
                      className="w-8 h-8 rounded-lg border-2 border-white shadow-sm hover:scale-110 transition-transform"
                      style={{ background: `linear-gradient(135deg, ${preset.primary}, ${preset.secondary})` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Preview / Code area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
            {/* Tab bar */}
            <div className="flex items-center gap-1 px-5 py-3 bg-white border-b border-gray-100">
              <button
                onClick={() => setActiveTab("preview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "preview" ? "bg-gray-100 text-gray-800" : "text-gray-400 hover:text-gray-600"}`}
              >
                <Eye size={12} /> Preview
              </button>
              <button
                onClick={() => setActiveTab("code")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "code" ? "bg-gray-100 text-gray-800" : "text-gray-400 hover:text-gray-600"}`}
              >
                <Code2 size={12} /> Código HTML
              </button>

              {activeTab === "preview" && (
                <div className="ml-auto flex items-center gap-1">
                  {PREVIEW_THEMES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setPreviewTheme(t.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${previewTheme === t.id ? "bg-gray-800 text-white border-gray-800" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              )}

              {activeTab === "code" && (
                <button onClick={handleCopy} className="ml-auto flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 transition-colors">
                  {copied ? <><Check size={11} className="text-green-500" /> Copiado</> : <><Copy size={11} /> Copiar</>}
                </button>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden p-5">
              {activeTab === "preview" ? (
                <PlayerPreview playerId={selectedPlayer} config={config} previewBg={previewTheme} />
              ) : (
                <div className="h-full rounded-xl overflow-hidden bg-gray-950 border border-gray-800">
                  <pre className="text-green-300 text-xs font-mono p-5 overflow-auto h-full leading-relaxed whitespace-pre-wrap break-all">
                    {html}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
