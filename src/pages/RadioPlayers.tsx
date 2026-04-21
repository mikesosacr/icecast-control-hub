import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Copy, Check, Download, ChevronLeft,
  Palette, Settings2, Globe, Layers, Eye, Code2, Music2
} from "lucide-react";
import { toast } from "sonner";

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
  tag: string;
}

const PLAYERS: PlayerDef[] = [
  { id: "pulse",     name: "Pulse",         description: "Cover art + blur reactivo + historial", tag: "🎵" },
  { id: "luna",      name: "Luna",          description: "Glassmorphic oscuro con auras animadas", tag: "🌙" },
  { id: "neon",      name: "Neon",          description: "Cyberpunk con barras de audio reactivas", tag: "⚡" },
  { id: "broadcast", name: "Broadcast",     description: "Terminal profesional estilo estudio",     tag: "📡" },
  { id: "glass",     name: "Glass",         description: "Frosted glass con portada circular",      tag: "💎" },
  { id: "cosmic",    name: "Cosmic",        description: "Estrellas animadas y aurora boreal",      tag: "🌌" },
  { id: "studio",    name: "Studio",        description: "Editorial minimalista con tipografía fina",tag: "🎚️" },
  { id: "retro",     name: "Retro Wave",    description: "Synthwave 80s con grid neón animado",    tag: "🕹️" },
  { id: "minimal",   name: "Minimal",       description: "Limpio y elegante, foco en el contenido", tag: "◻️" },
];

// ─── Metadata script embebido en todos los players ────────────────────────────
// Consulta Icecast status-json.xsl, luego busca portada en MusicBrainz/iTunes
const META_SCRIPT = (streamUrl: string) => {
  // Extraemos base URL del stream para construir la URL de status
  return `
(function(){
  const STREAM = '${streamUrl}';
  // Construir URL base del servidor Icecast
  const u = new URL(STREAM.startsWith('http') ? STREAM : 'http://'+STREAM);
  const BASE = u.protocol+'//'+u.host;
  const MOUNT = u.pathname;

  let lastSong = '';
  let history = [];

  async function fetchCover(artist, title) {
    try {
      // Intentar iTunes Search API (sin CORS issues)
      const q = encodeURIComponent((artist+' '+title).trim());
      const r = await fetch('https://itunes.apple.com/search?term='+q+'&limit=1&entity=song', {mode:'cors'});
      if(r.ok){
        const d = await r.json();
        if(d.results && d.results[0] && d.results[0].artworkUrl100){
          return d.results[0].artworkUrl100.replace('100x100','600x600');
        }
      }
    } catch(e){}
    return null;
  }

  async function fetchMeta() {
    try {
      const r = await fetch(BASE+'/status-json.xsl', {cache:'no-store'});
      if(!r.ok) return;
      const d = await r.json();
      let src = d && d.icestats && d.icestats.source;
      if(!src) return;
      if(Array.isArray(src)) {
        src = src.find(s => s.listenurl && s.listenurl.includes(MOUNT.replace('/','').split('/')[0])) || src[0];
      }
      const title  = src.title  || src.song || '';
      const artist = src.artist || '';
      const song   = title || artist;
      if(!song) return;

      // Actualizar UI principal
      const elTitle  = document.getElementById('_meta_title');
      const elArtist = document.getElementById('_meta_artist');
      const elCover  = document.getElementById('_meta_cover');
      const elBg     = document.getElementById('_meta_bg');

      if(elTitle)  elTitle.textContent  = title  || 'En vivo';
      if(elArtist) elArtist.textContent = artist || '';

      // Solo buscar portada si cambia la canción
      if(song !== lastSong) {
        lastSong = song;
        // Agregar al historial
        history.unshift({title: title||'Desconocido', artist: artist||'', cover: null});
        history = history.slice(0,5);
        renderHistory();

        const cover = await fetchCover(artist, title);
        if(cover) {
          if(elCover) {
            elCover.style.backgroundImage = 'url('+cover+')';
            elCover.style.backgroundSize = 'cover';
            elCover.style.backgroundPosition = 'center';
          }
          if(elBg) {
            elBg.style.backgroundImage = 'url('+cover+')';
          }
          // Actualizar portada en historial
          if(history[0]) { history[0].cover = cover; renderHistory(); }
        }
      }
    } catch(e){}
  }

  function renderHistory() {
    const el = document.getElementById('_meta_history');
    if(!el) return;
    el.innerHTML = history.map((h,i) => \`
      <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:12px;background:rgba(255,255,255,\${i===0?.08:.04});margin-bottom:6px">
        <div style="width:36px;height:36px;border-radius:8px;flex-shrink:0;background:\${h.cover?'url('+h.cover+') center/cover':'rgba(255,255,255,.1)'};font-size:16px;display:flex;align-items:center;justify-content:center">\${h.cover?'':'🎵'}</div>
        <div style="min-width:0;flex:1">
          <div style="font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:\${i===0?'#fff':'rgba(255,255,255,.6)'}">\${h.title}</div>
          <div style="font-size:11px;color:rgba(255,255,255,.35);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">\${h.artist}</div>
        </div>
        \${i===0?'<div style="width:6px;height:6px;border-radius:50%;background:#ef4444;animation:blink 1s infinite;flex-shrink:0"></div>':''}
      </div>
    \`).join('');
  }

  fetchMeta();
  setInterval(fetchMeta, 10000);
})();
`;
};

// ─── Generador de HTML por player ─────────────────────────────────────────────
function generatePlayerHTML(id: string, cfg: PlayerConfig): string {
  const { name, streamUrl, genre, logoEmoji, primaryColor, secondaryColor } = cfg;
  const url = streamUrl || "http://tu-servidor:8000/stream";
  const n   = name  || "Mi Radio";
  const g   = genre || "Radio Online";
  const p1  = primaryColor;
  const p2  = secondaryColor;
  const meta = META_SCRIPT(url);

  // CSS @keyframes blink compartido
  const BLINK = `@keyframes blink{50%{opacity:.3}}`;

  switch (id) {

    // ── PULSE ──────────────────────────────────────────────────────────────
    case "pulse": return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${n}</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0a0a0a;font-family:'Syne',sans-serif;padding:20px}
${BLINK}
.shell{width:100%;max-width:380px;border-radius:24px;overflow:hidden;position:relative;background:#111;box-shadow:0 40px 80px rgba(0,0,0,.6)}
.bg-blur{position:absolute;inset:-20px;background-size:cover;background-position:center;filter:blur(40px) brightness(.3) saturate(1.5);transform:scale(1.1);transition:background-image 1.2s ease;z-index:0}
.body{position:relative;z-index:1;padding:20px}
.cover-wrap{position:relative;width:100%;height:180px;border-radius:18px;overflow:hidden;margin-bottom:18px;background:#1a1a1a}
.cover-img{width:100%;height:100%;background-size:cover;background-position:center;transition:background-image .8s ease;display:flex;align-items:center;justify-content:center;font-size:64px}
.cover-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.7) 0%,transparent 60%)}
.cover-live{position:absolute;bottom:12px;left:12px;display:none;align-items:center;gap:5px;background:rgba(239,68,68,.25);backdrop-filter:blur(8px);border:1px solid rgba(239,68,68,.5);color:#fca5a5;padding:4px 10px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:1px}
.cover-live.on{display:flex}
.dot{width:5px;height:5px;background:#ef4444;border-radius:50%;animation:blink 1s infinite}
.song-info{margin-bottom:16px}
.song-title{font-size:18px;font-weight:800;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-.3px}
.song-artist{font-size:13px;color:rgba(255,255,255,.45);margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.controls-row{display:flex;align-items:center;gap:14px;margin-bottom:16px}
.btn-play{width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,${p1},${p2});border:none;color:#fff;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px ${p1}50;transition:transform .15s,box-shadow .15s;flex-shrink:0}
.btn-play:hover{transform:scale(1.08);box-shadow:0 12px 32px ${p1}70}
.vol-wrap{flex:1;display:flex;flex-direction:column;gap:6px}
.vol-label{font-size:9px;letter-spacing:2px;color:rgba(255,255,255,.25);text-transform:uppercase}
input[type=range]{width:100%;height:3px;-webkit-appearance:none;background:rgba(255,255,255,.12);border-radius:3px;outline:none}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:${p1};cursor:pointer;box-shadow:0 0 8px ${p1}}
.sep{height:1px;background:rgba(255,255,255,.06);margin:4px 0 14px}
.hist-label{font-size:9px;letter-spacing:2px;color:rgba(255,255,255,.25);text-transform:uppercase;margin-bottom:10px}
</style></head><body>
<div class="shell">
  <div class="bg-blur" id="_meta_bg"></div>
  <div class="body">
    <div class="cover-wrap">
      <div class="cover-img" id="_meta_cover">${logoEmoji}</div>
      <div class="cover-overlay"></div>
      <div class="cover-live" id="_live"><div class="dot"></div>EN VIVO</div>
    </div>
    <div class="song-info">
      <div class="song-title" id="_meta_title">${n}</div>
      <div class="song-artist" id="_meta_artist">${g}</div>
    </div>
    <div class="controls-row">
      <button class="btn-play" id="_btn" onclick="toggle()">▶</button>
      <div class="vol-wrap">
        <div class="vol-label">Volumen</div>
        <input type="range" min="0" max="1" step="0.01" value="0.75" oninput="_a.volume=this.value">
      </div>
    </div>
    <div class="sep"></div>
    <div class="hist-label">Historial</div>
    <div id="_meta_history"></div>
  </div>
</div>
<audio id="_a"></audio>
<script>
let _on=false;
const _a=document.getElementById('_a');
function toggle(){
  const b=document.getElementById('_btn'),lv=document.getElementById('_live');
  if(_on){_a.pause();_a.src='';b.textContent='▶';lv.classList.remove('on');_on=false;}
  else{_a.src='${url}';_a.volume=0.75;_a.play().then(()=>{b.textContent='⏸';lv.classList.add('on');_on=true;}).catch(e=>alert('Error: '+e.message));}
}
${meta}
</script>
</body></html>`;

    // ── LUNA ───────────────────────────────────────────────────────────────
    case "luna": return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${n}</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#060810;font-family:'DM Sans',sans-serif;overflow:hidden}
${BLINK}
@keyframes drift{0%{transform:translate(0,0) scale(1)}100%{transform:translate(40px,25px) scale(1.15)}}
.aura{position:fixed;border-radius:50%;filter:blur(90px);pointer-events:none}
.a1{width:500px;height:500px;background:${p1};opacity:.22;top:-150px;left:-150px;animation:drift 9s ease-in-out infinite alternate}
.a2{width:400px;height:400px;background:${p2};opacity:.18;bottom:-100px;right:-100px;animation:drift 11s ease-in-out infinite alternate-reverse}
.a3{width:200px;height:200px;background:${p1};opacity:.12;top:40%;left:40%;animation:drift 7s ease-in-out infinite alternate}
.card{position:relative;width:360px;background:rgba(255,255,255,.04);backdrop-filter:blur(32px);-webkit-backdrop-filter:blur(32px);border:1px solid rgba(255,255,255,.08);border-radius:28px;padding:28px;box-shadow:0 40px 80px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.06)}
.top{display:flex;align-items:center;gap:14px;margin-bottom:22px}
.art{width:64px;height:64px;border-radius:16px;background:linear-gradient(135deg,${p1}30,${p2}20);border:1px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;font-size:28px;flex-shrink:0;background-size:cover;background-position:center;transition:background-image .8s}
.station-name{font-size:19px;font-weight:600;color:#fff;letter-spacing:-.3px}
.station-genre{font-size:12px;color:rgba(255,255,255,.35);margin-top:3px}
.live-tag{display:none;align-items:center;gap:5px;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.25);color:#fca5a5;padding:3px 9px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:.5px;margin-bottom:20px;width:fit-content}
.live-tag.on{display:flex}
.dot{width:5px;height:5px;background:#ef4444;border-radius:50%;animation:blink 1s infinite}
.now{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:14px;padding:12px 14px;margin-bottom:20px}
.now-label{font-size:9px;letter-spacing:2px;color:rgba(255,255,255,.25);text-transform:uppercase;margin-bottom:5px}
.now-title{font-size:14px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.now-artist{font-size:12px;color:rgba(255,255,255,.4);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.controls{display:flex;align-items:center;gap:12px}
.btn{width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,${p1},${p2});border:none;cursor:pointer;color:#fff;font-size:18px;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px ${p1}40;transition:transform .2s;flex-shrink:0}
.btn:hover{transform:scale(1.1)}
.vol{flex:1}
.vol-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.vol-lbl{font-size:9px;letter-spacing:2px;color:rgba(255,255,255,.25);text-transform:uppercase}
input[type=range]{width:100%;height:2px;-webkit-appearance:none;background:rgba(255,255,255,.1);border-radius:2px;outline:none}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:linear-gradient(135deg,${p1},${p2});cursor:pointer}
</style></head><body>
<div class="aura a1"></div><div class="aura a2"></div><div class="aura a3"></div>
<div class="card">
  <div class="top">
    <div class="art" id="_meta_cover">${logoEmoji}</div>
    <div>
      <div class="station-name">${n}</div>
      <div class="station-genre">${g}</div>
    </div>
  </div>
  <div class="live-tag" id="_live"><div class="dot"></div>EN VIVO</div>
  <div class="now">
    <div class="now-label">Sonando ahora</div>
    <div class="now-title" id="_meta_title">${n}</div>
    <div class="now-artist" id="_meta_artist">${g}</div>
  </div>
  <div class="controls">
    <button class="btn" id="_btn" onclick="toggle()">▶</button>
    <div class="vol">
      <div class="vol-top"><span class="vol-lbl">Volumen</span></div>
      <input type="range" min="0" max="1" step="0.02" value="0.8" oninput="_a.volume=this.value">
    </div>
  </div>
</div>
<audio id="_a"></audio>
<script>
let _on=false;const _a=document.getElementById('_a');
function toggle(){
  const b=document.getElementById('_btn'),lv=document.getElementById('_live');
  if(_on){_a.pause();_a.src='';b.textContent='▶';lv.classList.remove('on');_on=false;}
  else{_a.src='${url}';_a.volume=0.8;_a.play().then(()=>{b.textContent='⏸';lv.classList.add('on');_on=true;}).catch(e=>alert('Error: '+e.message));}
}
// Adaptar fetchCover para actualizar portada cuadrada de Luna
const _origFetch = window.fetchCover;
${meta}
</script>
</body></html>`;

    // ── NEON ───────────────────────────────────────────────────────────────
    case "neon": return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${n}</title>
<link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#000;overflow:hidden}
${BLINK}
@keyframes scanline{0%{top:-100%}100%{top:200%}}
@keyframes flicker{0%,96%,100%{opacity:1}97%{opacity:.85}98%{opacity:1}99%{opacity:.9}}
@keyframes barAnim{0%{height:4px;opacity:.5}100%{height:var(--h,20px);opacity:1}}
.scanline{position:fixed;inset:0;background:repeating-linear-gradient(transparent,transparent 3px,rgba(0,255,200,.015) 3px,rgba(0,255,200,.015) 4px);pointer-events:none;z-index:10;animation:flicker 5s infinite}
.moving-scan{position:fixed;left:0;right:0;height:60px;background:linear-gradient(to bottom,transparent,rgba(0,255,200,.03),transparent);animation:scanline 6s linear infinite;pointer-events:none;z-index:11}
.shell{position:relative;width:400px;border:1px solid ${p1};padding:24px;box-shadow:0 0 40px ${p1}30,0 0 80px ${p1}10,inset 0 0 40px rgba(0,0,0,.8)}
.corner{position:absolute;width:16px;height:16px;border-color:${p1};border-style:solid;box-shadow:0 0 6px ${p1}}
.tl{top:-1px;left:-1px;border-width:2px 0 0 2px}
.tr{top:-1px;right:-1px;border-width:2px 2px 0 0}
.bl{bottom:-1px;left:-1px;border-width:0 0 2px 2px}
.br{bottom:-1px;right:-1px;border-width:0 2px 2px 0}
.header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid ${p1}20}
.logo-box{width:52px;height:52px;border:1px solid ${p1}60;display:flex;align-items:center;justify-content:center;font-size:22px;position:relative;background-size:cover;background-position:center}
.logo-box::before{content:'';position:absolute;inset:0;box-shadow:inset 0 0 12px ${p1}20}
.title-wrap{flex:1;margin-left:14px}
.station{font-family:'Orbitron',monospace;font-size:14px;font-weight:700;color:${p1};text-shadow:0 0 12px ${p1};letter-spacing:2px;text-transform:uppercase}
.genre{font-family:'Share Tech Mono',monospace;font-size:11px;color:rgba(255,255,255,.35);letter-spacing:2px;margin-top:4px;text-transform:uppercase}
.bars{display:flex;align-items:flex-end;gap:3px;height:28px}
.bar{width:4px;background:${p1};border-radius:1px;height:4px;transition:height .1s}
.bar.on{animation:barAnim var(--d,.4s) ease-in-out infinite alternate}
.status-line{display:flex;align-items:center;gap:8px;margin-bottom:16px;font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:2px;text-transform:uppercase}
.status-dot{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.2);flex-shrink:0}
.status-dot.on{background:${p1};box-shadow:0 0 8px ${p1};animation:blink 1.5s infinite}
.status-text{color:rgba(255,255,255,.3)}
.status-text.on{color:${p1};text-shadow:0 0 8px ${p1}}
.meta-box{background:rgba(255,255,255,.02);border:1px solid ${p1}15;padding:12px 14px;margin-bottom:18px}
.meta-lbl{font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:3px;color:rgba(255,255,255,.2);text-transform:uppercase;margin-bottom:6px}
.meta-title{font-family:'Orbitron',monospace;font-size:13px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:.5px}
.meta-artist{font-family:'Share Tech Mono',monospace;font-size:11px;color:${p1};margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.controls{display:flex;align-items:center;gap:14px}
.btn{width:52px;height:52px;border:2px solid ${p1};background:transparent;cursor:pointer;color:${p1};font-size:18px;display:flex;align-items:center;justify-content:center;transition:all .15s;box-shadow:0 0 12px ${p1}30;font-family:'Orbitron',monospace;flex-shrink:0}
.btn:hover{background:${p1}15;box-shadow:0 0 24px ${p1}60}
.vol-wrap{flex:1}
.vol-lbl{font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:3px;color:rgba(255,255,255,.2);text-transform:uppercase;margin-bottom:8px}
input[type=range]{width:100%;height:2px;-webkit-appearance:none;background:${p1}20;border:none;outline:none}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:13px;height:13px;background:${p1};cursor:pointer;box-shadow:0 0 8px ${p1}}
</style></head><body>
<div class="scanline"></div>
<div class="moving-scan"></div>
<div class="shell">
  <div class="corner tl"></div><div class="corner tr"></div>
  <div class="corner bl"></div><div class="corner br"></div>
  <div class="header">
    <div class="logo-box" id="_meta_cover">${logoEmoji}</div>
    <div class="title-wrap">
      <div class="station">${n}</div>
      <div class="genre">${g}</div>
    </div>
    <div class="bars" id="_bars">${[16,10,20,7,18,12,22,9,16,11].map((h,i)=>`<div class="bar" style="--h:${h}px;--d:${.28+i*.04}s"></div>`).join('')}</div>
  </div>
  <div class="status-line">
    <div class="status-dot" id="_sdot"></div>
    <span class="status-text" id="_stxt">STANDBY</span>
  </div>
  <div class="meta-box">
    <div class="meta-lbl">Now Playing</div>
    <div class="meta-title" id="_meta_title">${n}</div>
    <div class="meta-artist" id="_meta_artist">${g}</div>
  </div>
  <div class="controls">
    <button class="btn" id="_btn" onclick="toggle()">▶</button>
    <div class="vol-wrap">
      <div class="vol-lbl">Audio Level</div>
      <input type="range" min="0" max="1" step="0.02" value="0.8" oninput="_a.volume=this.value">
    </div>
  </div>
</div>
<audio id="_a"></audio>
<script>
let _on=false;const _a=document.getElementById('_a');
const _bars=document.querySelectorAll('.bar');
function toggle(){
  const b=document.getElementById('_btn'),sd=document.getElementById('_sdot'),st=document.getElementById('_stxt');
  if(_on){_a.pause();_a.src='';b.textContent='▶';sd.className='status-dot';st.className='status-text';st.textContent='STANDBY';_bars.forEach(x=>{x.classList.remove('on');x.style.height='4px'});_on=false;}
  else{_a.src='${url}';_a.volume=0.8;_a.play().then(()=>{b.textContent='⏸';sd.className='status-dot on';st.className='status-text on';st.textContent='ON AIR';_bars.forEach(x=>x.classList.add('on'));_on=true;}).catch(e=>alert('Error: '+e.message));}
}
${meta}
</script>
</body></html>`;

    // ── BROADCAST ──────────────────────────────────────────────────────────
    case "broadcast": return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${n}</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0d1117;font-family:'IBM Plex Sans',sans-serif}
${BLINK}
.shell{width:420px;background:#161b22;border:1px solid #21262d;border-radius:10px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.5)}
.titlebar{background:#1c2128;border-bottom:1px solid #21262d;padding:9px 16px;display:flex;align-items:center;gap:8px}
.tc{width:11px;height:11px;border-radius:50%}
.t1{background:#ff5f57}.t2{background:#ffbd2e}.t3{background:#28ca41}
.ttitle{flex:1;text-align:center;font-family:'IBM Plex Mono',monospace;font-size:11px;color:#484f58;letter-spacing:.5px}
.body{padding:20px}
.station-row{display:flex;align-items:center;gap:14px;padding:12px 14px;background:#0d1117;border:1px solid #21262d;border-radius:8px;margin-bottom:16px}
.cover-sq{width:48px;height:48px;border-radius:6px;background:#21262d;flex-shrink:0;font-size:22px;display:flex;align-items:center;justify-content:center;background-size:cover;background-position:center;transition:background-image .8s}
.sig-info{flex:1;min-width:0}
.sig-name{font-size:14px;font-weight:600;color:#e6edf3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sig-sub{font-family:'IBM Plex Mono',monospace;font-size:11px;color:#484f58;margin-top:2px}
.sig-led{width:8px;height:8px;border-radius:50%;background:#484f58;flex-shrink:0}
.sig-led.on{background:#3fb950;box-shadow:0 0 8px #3fb95080;animation:blink 1.5s infinite}
.nowplay{background:#0d1117;border:1px solid #21262d;border-radius:8px;padding:12px 14px;margin-bottom:16px}
.np-label{font-family:'IBM Plex Mono',monospace;font-size:9px;color:#484f58;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px}
.np-title{font-size:14px;font-weight:600;color:#e6edf3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.np-artist{font-family:'IBM Plex Mono',monospace;font-size:11px;color:#58a6ff;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.controls{display:flex;align-items:center;gap:12px;margin-bottom:16px}
.btn{width:44px;height:44px;border-radius:7px;background:#238636;border:1px solid #2ea043;cursor:pointer;color:#fff;font-size:16px;display:flex;align-items:center;justify-content:center;transition:all .15s;flex-shrink:0}
.btn:hover{background:#2ea043}.btn.stop{background:#b91c1c;border-color:#dc2626}
.vol-g{flex:1}
.vol-lbl{font-family:'IBM Plex Mono',monospace;font-size:9px;color:#484f58;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px}
input[type=range]{width:100%;height:3px;-webkit-appearance:none;background:#21262d;border-radius:2px;outline:none}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:12px;height:12px;border-radius:3px;background:#58a6ff;cursor:pointer}
.footer{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:#1c2128;border-top:1px solid #21262d}
.badge{font-family:'IBM Plex Mono',monospace;font-size:10px;padding:3px 8px;border-radius:4px;border:1px solid}
.badge.off{color:#484f58;border-color:#21262d}
.badge.on{color:#3fb950;border-color:#2ea043;background:#162a1e}
.bps{font-family:'IBM Plex Mono',monospace;font-size:10px;color:#484f58}
</style></head><body>
<div class="shell">
  <div class="titlebar">
    <div class="tc t1"></div><div class="tc t2"></div><div class="tc t3"></div>
    <div class="ttitle">radio-studio — ${n.toLowerCase().replace(/\s/g,'-')}</div>
  </div>
  <div class="body">
    <div class="station-row">
      <div class="cover-sq" id="_meta_cover">${logoEmoji}</div>
      <div class="sig-info">
        <div class="sig-name">${n}</div>
        <div class="sig-sub">${g}</div>
      </div>
      <div class="sig-led" id="_led"></div>
    </div>
    <div class="nowplay">
      <div class="np-label">Now Playing</div>
      <div class="np-title" id="_meta_title">${n}</div>
      <div class="np-artist" id="_meta_artist">${g}</div>
    </div>
    <div class="controls">
      <button class="btn" id="_btn" onclick="toggle()">▶</button>
      <div class="vol-g">
        <div class="vol-lbl">Audio Level</div>
        <input type="range" min="0" max="1" step="0.02" value="0.8" oninput="_a.volume=this.value">
      </div>
    </div>
  </div>
  <div class="footer">
    <div class="badge off" id="_badge">● OFFLINE</div>
    <div class="bps">128kbps · Icecast2</div>
  </div>
</div>
<audio id="_a"></audio>
<script>
let _on=false;const _a=document.getElementById('_a');
function toggle(){
  const b=document.getElementById('_btn'),led=document.getElementById('_led'),badge=document.getElementById('_badge');
  if(_on){_a.pause();_a.src='';b.textContent='▶';b.className='btn';led.className='sig-led';badge.className='badge off';badge.textContent='● OFFLINE';_on=false;}
  else{_a.src='${url}';_a.volume=0.8;_a.play().then(()=>{b.textContent='⏸';b.className='btn stop';led.className='sig-led on';badge.className='badge on';badge.textContent='● ON AIR';_on=true;}).catch(e=>alert('Error: '+e.message));}
}
${meta}
</script>
</body></html>`;

    // ── GLASS ──────────────────────────────────────────────────────────────
    case "glass": return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${n}</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,${p1}cc 0%,${p2}aa 60%,#0f0f2e 100%);font-family:'Plus Jakarta Sans',sans-serif;overflow:hidden}
${BLINK}
@keyframes floatBlob{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-30px) scale(1.05)}}
.blob{position:fixed;border-radius:50%;filter:blur(70px);pointer-events:none}
.b1{width:400px;height:400px;background:${p1};opacity:.5;top:-120px;left:-80px;animation:floatBlob 8s ease-in-out infinite}
.b2{width:300px;height:300px;background:${p2};opacity:.4;bottom:-80px;right:-60px;animation:floatBlob 10s ease-in-out infinite reverse}
.b3{width:200px;height:200px;background:${p1};opacity:.3;top:50%;left:60%;animation:floatBlob 6s ease-in-out infinite}
.card{position:relative;width:360px;background:rgba(255,255,255,.1);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-radius:32px;border:1px solid rgba(255,255,255,.2);padding:28px;box-shadow:0 32px 64px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.25)}
.cover-circle{width:110px;height:110px;border-radius:50%;border:3px solid rgba(255,255,255,.2);margin:0 auto 20px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font-size:44px;background:rgba(255,255,255,.1);background-size:cover;background-position:center;transition:background-image .8s}
.station-nm{text-align:center;font-size:20px;font-weight:800;color:#fff;letter-spacing:-.4px;margin-bottom:4px}
.station-g{text-align:center;font-size:13px;color:rgba(255,255,255,.5);margin-bottom:16px}
.live-row{display:flex;justify-content:center;margin-bottom:16px}
.live-pill{display:none;align-items:center;gap:5px;background:rgba(239,68,68,.2);backdrop-filter:blur(8px);border:1px solid rgba(239,68,68,.35);color:#fca5a5;padding:4px 12px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:.5px}
.live-pill.on{display:flex}
.dot{width:5px;height:5px;background:#ef4444;border-radius:50%;animation:blink 1s infinite}
.now-box{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:12px 14px;margin-bottom:18px;text-align:center}
.now-lbl{font-size:9px;letter-spacing:2px;color:rgba(255,255,255,.3);text-transform:uppercase;margin-bottom:5px}
.now-title{font-size:14px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.now-artist{font-size:12px;color:rgba(255,255,255,.45);margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ctrl-row{display:flex;align-items:center;gap:14px}
.btn{width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,.2);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.35);cursor:pointer;color:#fff;font-size:20px;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0;box-shadow:0 4px 16px rgba(0,0,0,.2)}
.btn:hover{background:rgba(255,255,255,.3);transform:scale(1.07)}
.vol{flex:1}
.vol-lbl{font-size:9px;letter-spacing:2px;color:rgba(255,255,255,.3);text-transform:uppercase;margin-bottom:8px}
input[type=range]{width:100%;height:3px;-webkit-appearance:none;background:rgba(255,255,255,.15);border-radius:3px;outline:none}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#fff;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.3)}
</style></head><body>
<div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div>
<div class="card">
  <div class="cover-circle" id="_meta_cover">${logoEmoji}</div>
  <div class="station-nm">${n}</div>
  <div class="station-g">${g}</div>
  <div class="live-row"><div class="live-pill" id="_live"><div class="dot"></div>EN VIVO</div></div>
  <div class="now-box">
    <div class="now-lbl">Sonando ahora</div>
    <div class="now-title" id="_meta_title">${n}</div>
    <div class="now-artist" id="_meta_artist">${g}</div>
  </div>
  <div class="ctrl-row">
    <button class="btn" id="_btn" onclick="toggle()">▶</button>
    <div class="vol">
      <div class="vol-lbl">Volumen</div>
      <input type="range" min="0" max="1" step="0.02" value="0.8" oninput="_a.volume=this.value">
    </div>
  </div>
</div>
<audio id="_a"></audio>
<script>
let _on=false;const _a=document.getElementById('_a');
function toggle(){
  const b=document.getElementById('_btn'),lv=document.getElementById('_live');
  if(_on){_a.pause();_a.src='';b.textContent='▶';lv.classList.remove('on');_on=false;}
  else{_a.src='${url}';_a.volume=0.8;_a.play().then(()=>{b.textContent='⏸';lv.classList.add('on');_on=true;}).catch(e=>alert('Error: '+e.message));}
}
${meta}
</script>
</body></html>`;

    // ── COSMIC ─────────────────────────────────────────────────────────────
    case "cosmic": return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${n}</title>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#02001a;font-family:'Outfit',sans-serif;overflow:hidden}
${BLINK}
@keyframes aurora{0%{transform:scaleX(1) translateX(0) skewX(0deg)}50%{transform:scaleX(1.08) translateX(20px) skewX(2deg)}100%{transform:scaleX(1) translateX(0) skewX(0deg)}}
@keyframes orbit{from{transform:rotate(0deg) translateX(90px) rotate(0deg)}to{transform:rotate(360deg) translateX(90px) rotate(-360deg)}}
@keyframes twinkle{0%,100%{opacity:.8}50%{opacity:.2}}
canvas{position:fixed;inset:0;z-index:0}
.aurora-wrap{position:fixed;bottom:0;left:0;right:0;height:45%;pointer-events:none;z-index:1}
.aurora-layer{position:absolute;inset:0;filter:blur(50px);opacity:.6;animation:aurora 10s ease-in-out infinite}
.al1{background:linear-gradient(to top,${p1}30,${p2}15,transparent)}
.al2{background:linear-gradient(to top,${p2}20,transparent);animation-delay:-5s;animation-duration:14s}
.card{position:relative;z-index:2;width:360px;background:rgba(2,0,26,.75);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.07);border-radius:28px;padding:28px;box-shadow:0 0 80px ${p1}15}
.planet-wrap{position:relative;width:120px;height:120px;margin:0 auto 22px}
.planet{width:100%;height:100%;border-radius:50%;background:radial-gradient(circle at 35% 35%,${p1}50,${p2}30,#02001a);box-shadow:0 0 40px ${p1}30,inset -10px -10px 30px rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;font-size:46px;background-size:cover;background-position:center;transition:background-image .8s}
.planet-ring{position:absolute;top:50%;left:50%;width:160px;height:20px;border:2px solid ${p1}30;border-radius:50%;transform:translate(-50%,-50%) rotateX(70deg);box-shadow:0 0 10px ${p1}20}
.station-n{text-align:center;font-size:22px;font-weight:800;color:#fff;letter-spacing:-.5px;margin-bottom:4px}
.station-f{text-align:center;font-size:11px;color:rgba(255,255,255,.25);letter-spacing:3px;text-transform:uppercase;margin-bottom:16px}
.live-c{display:flex;justify-content:center;margin-bottom:16px}
.live-pill{display:none;align-items:center;gap:5px;background:linear-gradient(135deg,${p1}25,${p2}15);border:1px solid ${p1}40;border-radius:20px;padding:4px 14px;font-size:10px;font-weight:700;color:${p1};letter-spacing:1px}
.live-pill.on{display:flex}
.pd{width:6px;height:6px;background:${p1};border-radius:50%;animation:blink 1.2s infinite}
.now-w{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:14px;padding:12px 14px;margin-bottom:18px;text-align:center}
.now-lbl{font-size:9px;letter-spacing:2px;color:rgba(255,255,255,.2);text-transform:uppercase;margin-bottom:5px}
.now-t{font-size:14px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.now-a{font-size:12px;color:rgba(255,255,255,.35);margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ctrl{display:flex;align-items:center;justify-content:center;gap:16px}
.btn{width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,${p1},${p2});border:none;cursor:pointer;color:#fff;font-size:22px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 30px ${p1}40;transition:all .2s}
.btn:hover{transform:scale(1.08);box-shadow:0 0 50px ${p1}60}
.vol-w{flex:1}
.vol-lbl{font-size:9px;letter-spacing:2px;color:rgba(255,255,255,.2);text-transform:uppercase;margin-bottom:8px}
input[type=range]{width:100%;height:2px;-webkit-appearance:none;background:rgba(255,255,255,.08);border-radius:1px;outline:none}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:linear-gradient(135deg,${p1},${p2});cursor:pointer;box-shadow:0 0 8px ${p1}}
</style></head><body>
<div class="aurora-wrap"><div class="aurora-layer al1"></div><div class="aurora-layer al2"></div></div>
<div class="card">
  <div class="planet-wrap">
    <div class="planet" id="_meta_cover">${logoEmoji}</div>
    <div class="planet-ring"></div>
  </div>
  <div class="station-n">${n}</div>
  <div class="station-f">${g}</div>
  <div class="live-c"><div class="live-pill" id="_live"><div class="pd"></div>TRANSMITIENDO</div></div>
  <div class="now-w">
    <div class="now-lbl">Sonando ahora</div>
    <div class="now-t" id="_meta_title">${n}</div>
    <div class="now-a" id="_meta_artist">${g}</div>
  </div>
  <div class="ctrl">
    <button class="btn" id="_btn" onclick="toggle()">▶</button>
    <div class="vol-w">
      <div class="vol-lbl">Volumen</div>
      <input type="range" min="0" max="1" step="0.02" value="0.8" oninput="_a.volume=this.value">
    </div>
  </div>
</div>
<audio id="_a"></audio>
<script>
const _c=document.createElement('canvas');_c.style.cssText='position:fixed;inset:0;z-index:0;pointer-events:none';document.body.prepend(_c);
const _ctx=_c.getContext('2d');_c.width=window.innerWidth;_c.height=window.innerHeight;
const _stars=Array.from({length:200},()=>({x:Math.random()*_c.width,y:Math.random()*_c.height,r:Math.random()*1.6+.2,o:Math.random(),s:Math.random()*.03+.005}));
function _drawStars(){_ctx.clearRect(0,0,_c.width,_c.height);_stars.forEach(s=>{_ctx.beginPath();_ctx.arc(s.x,s.y,s.r,0,Math.PI*2);_ctx.fillStyle='rgba(255,255,255,'+s.o+')';_ctx.fill();s.o+=s.s;if(s.o>1||s.o<0)s.s*=-1;});requestAnimationFrame(_drawStars);}
_drawStars();
let _on=false;const _a=document.getElementById('_a');
function toggle(){
  const b=document.getElementById('_btn'),lv=document.getElementById('_live');
  if(_on){_a.pause();_a.src='';b.textContent='▶';lv.classList.remove('on');_on=false;}
  else{_a.src='${url}';_a.volume=0.8;_a.play().then(()=>{b.textContent='⏸';lv.classList.add('on');_on=true;}).catch(e=>alert('Error: '+e.message));}
}
${meta}
</script>
</body></html>`;

    // ── STUDIO ─────────────────────────────────────────────────────────────
    case "studio": return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${n}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f5f4f0;font-family:'Jost',sans-serif}
${BLINK}
.shell{width:400px;background:#fff;box-shadow:0 4px 60px rgba(0,0,0,.1);overflow:hidden}
.accent{height:4px;background:linear-gradient(90deg,${p1},${p2})}
.inner{padding:36px}
.top-row{display:flex;gap:18px;margin-bottom:28px;align-items:flex-start}
.cover-sq{width:80px;height:80px;flex-shrink:0;background:#f0eeea;display:flex;align-items:center;justify-content:center;font-size:32px;background-size:cover;background-position:center;transition:background-image .8s}
.meta-stack{flex:1;min-width:0;padding-top:4px}
.eyebrow{font-size:9px;letter-spacing:4px;text-transform:uppercase;color:#b8b4ae;margin-bottom:8px}
.station-nm{font-family:'Playfair Display',serif;font-size:26px;font-weight:700;color:#1a1a1a;line-height:1.1;margin-bottom:4px}
.genre-txt{font-size:12px;color:#a09c96;font-style:italic;font-family:'Playfair Display',serif}
.divider{height:1px;background:#f0eeea;margin-bottom:20px}
.live-row{display:flex;align-items:center;gap:10px;margin-bottom:20px;opacity:0;transition:opacity .4s}
.live-row.on{opacity:1}
.live-line{flex:1;height:1px;background:#e8e5e0}
.live-dot{width:5px;height:5px;border-radius:50%;background:${p1};animation:blink 1.4s infinite}
.live-txt{font-size:9px;letter-spacing:3px;text-transform:uppercase;color:${p1};font-weight:500}
.now-play{margin-bottom:22px}
.now-lbl{font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#b8b4ae;margin-bottom:6px}
.now-t{font-family:'Playfair Display',serif;font-size:16px;color:#1a1a1a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.now-a{font-size:12px;color:#a09c96;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ctrl{display:flex;align-items:center;gap:16px}
.btn{width:48px;height:48px;border-radius:50%;background:${p1};border:none;cursor:pointer;color:#fff;font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s;box-shadow:0 4px 16px ${p1}40}
.btn:hover{transform:translateY(-2px);box-shadow:0 8px 20px ${p1}50}
.vol-g{flex:1}
.vol-lbl{font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#c8c4be;margin-bottom:8px}
input[type=range]{width:100%;height:1px;-webkit-appearance:none;background:#e8e5e0;border-radius:1px;outline:none}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:13px;height:13px;border-radius:50%;background:${p1};cursor:pointer;box-shadow:0 2px 8px ${p1}40}
.foot{background:#faf9f7;border-top:1px solid #f0eeea;padding:14px 36px;display:flex;align-items:center;justify-content:space-between}
.foot-logo{font-size:22px}
.foot-tag{font-size:10px;color:#c8c4be;font-family:'Playfair Display',serif;font-style:italic}
</style></head><body>
<div class="shell">
  <div class="accent"></div>
  <div class="inner">
    <div class="top-row">
      <div class="cover-sq" id="_meta_cover">${logoEmoji}</div>
      <div class="meta-stack">
        <div class="eyebrow">Radio Online</div>
        <div class="station-nm">${n}</div>
        <div class="genre-txt">${g}</div>
      </div>
    </div>
    <div class="divider"></div>
    <div class="live-row" id="_live"><div class="live-line"></div><div class="live-dot"></div><div class="live-txt">En vivo</div><div class="live-line"></div></div>
    <div class="now-play">
      <div class="now-lbl">Sonando ahora</div>
      <div class="now-t" id="_meta_title">${n}</div>
      <div class="now-a" id="_meta_artist">${g}</div>
    </div>
    <div class="ctrl">
      <button class="btn" id="_btn" onclick="toggle()">▶</button>
      <div class="vol-g">
        <div class="vol-lbl">Volumen</div>
        <input type="range" min="0" max="1" step="0.02" value="0.8" oninput="_a.volume=this.value">
      </div>
    </div>
  </div>
  <div class="foot">
    <div class="foot-logo">${logoEmoji}</div>
    <div class="foot-tag">${n}</div>
  </div>
</div>
<audio id="_a"></audio>
<script>
let _on=false;const _a=document.getElementById('_a');
function toggle(){
  const b=document.getElementById('_btn'),lv=document.getElementById('_live');
  if(_on){_a.pause();_a.src='';b.textContent='▶';lv.classList.remove('on');_on=false;}
  else{_a.src='${url}';_a.volume=0.8;_a.play().then(()=>{b.textContent='⏸';lv.classList.add('on');_on=true;}).catch(e=>alert('Error: '+e.message));}
}
${meta}
</script>
</body></html>`;

    // ── RETRO ──────────────────────────────────────────────────────────────
    case "retro": return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${n}</title>
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#050010;overflow:hidden}
${BLINK}
@keyframes gridScroll{from{background-position:0 0}to{background-position:0 40px}}
@keyframes sunPulse{0%,100%{box-shadow:0 0 30px #ff6b35,0 0 60px #ff2d7880}50%{box-shadow:0 0 50px #ff6b35,0 0 100px #ff2d7890}}
.grid-floor{position:fixed;bottom:0;left:0;right:0;height:55%;background-image:linear-gradient(${p1}40 1px,transparent 1px),linear-gradient(90deg,${p1}40 1px,transparent 1px);background-size:50px 50px;transform:perspective(500px) rotateX(45deg);transform-origin:bottom;opacity:.4;animation:gridScroll 2s linear infinite;pointer-events:none}
.sun-wrap{position:fixed;bottom:44%;left:50%;transform:translateX(-50%);pointer-events:none}
.sun{width:200px;height:100px;background:linear-gradient(180deg,#ff9f43 0%,#ff6b35 30%,#ff2d78 70%,transparent 100%);border-radius:100px 100px 0 0;animation:sunPulse 3s ease-in-out infinite;overflow:hidden}
.sun-stripe{height:8px;background:#050010;margin-top:14px}
.sun-stripe:nth-child(2){margin-top:22px;height:6px}
.sun-stripe:nth-child(3){margin-top:10px;height:5px}
.shell{position:relative;z-index:2;width:420px;background:rgba(5,0,16,.95);border:2px solid ${p1};padding:28px;box-shadow:0 0 40px ${p1}50,0 0 80px ${p1}20,inset 0 0 40px rgba(0,0,0,.5)}
.crt-overlay{position:absolute;inset:0;background:repeating-linear-gradient(transparent,transparent 2px,rgba(0,0,0,.1) 2px,rgba(0,0,0,.1) 4px);pointer-events:none;z-index:1}
.inner{position:relative;z-index:2}
.header{display:flex;gap:14px;align-items:center;margin-bottom:22px;padding-bottom:18px;border-bottom:1px solid ${p1}30}
.cover-px{width:64px;height:64px;border:2px solid ${p1};flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:26px;background:#0a0020;box-shadow:0 0 12px ${p1}40;background-size:cover;background-position:center;transition:background-image .8s}
.hd-info{flex:1;min-width:0}
.station{font-family:'Press Start 2P',monospace;font-size:10px;color:${p1};text-shadow:0 0 10px ${p1};line-height:1.8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.genre-t{font-family:'VT323',monospace;font-size:20px;color:#ff9f43;letter-spacing:3px;margin-top:4px;text-transform:uppercase}
.freq{font-family:'VT323',monospace;font-size:32px;color:#00f5ff;text-shadow:0 0 12px #00f5ff;letter-spacing:5px;margin-bottom:8px}
.status{font-family:'VT323',monospace;font-size:18px;letter-spacing:3px;margin-bottom:18px}
.status.off{color:rgba(255,255,255,.2)}
.status.on{color:${p1};text-shadow:0 0 8px ${p1}}
.now-box{background:rgba(0,245,255,.03);border:1px solid rgba(0,245,255,.1);padding:10px 14px;margin-bottom:18px}
.now-lbl{font-family:'VT323',monospace;font-size:14px;color:rgba(0,245,255,.4);letter-spacing:2px;margin-bottom:4px}
.now-t{font-family:'VT323',monospace;font-size:18px;color:#00f5ff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:1px}
.now-a{font-family:'VT323',monospace;font-size:15px;color:#ff9f43;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ctrl-row{display:flex;align-items:center;gap:14px}
.btn{width:54px;height:54px;background:${p1};border:2px solid ${p1};cursor:pointer;color:#fff;font-size:20px;display:flex;align-items:center;justify-content:center;transition:all .1s;box-shadow:0 0 20px ${p1}60;flex-shrink:0}
.btn:hover{opacity:.85;transform:translate(1px,1px)}.btn:active{transform:translate(2px,2px);box-shadow:none}
.vol-g{flex:1}
.vol-lbl{font-family:'VT323',monospace;font-size:14px;color:#ff9f43;letter-spacing:2px;margin-bottom:6px}
input[type=range]{width:100%;height:4px;-webkit-appearance:none;background:#0a0020;border:1px solid ${p1}40;outline:none}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;background:${p1};cursor:pointer;box-shadow:0 0 8px ${p1}}
</style></head><body>
<div class="grid-floor"></div>
<div class="sun-wrap"><div class="sun"><div class="sun-stripe"></div><div class="sun-stripe"></div><div class="sun-stripe"></div></div></div>
<div class="shell">
  <div class="crt-overlay"></div>
  <div class="inner">
    <div class="header">
      <div class="cover-px" id="_meta_cover">${logoEmoji}</div>
      <div class="hd-info">
        <div class="station">${n.toUpperCase()}</div>
        <div class="genre-t">${g.toUpperCase()}</div>
      </div>
    </div>
    <div class="freq" id="_freq">-- ---</div>
    <div class="status off" id="_status">[ STANDBY ]</div>
    <div class="now-box">
      <div class="now-lbl">NOW PLAYING:</div>
      <div class="now-t" id="_meta_title">${n.toUpperCase()}</div>
      <div class="now-a" id="_meta_artist">${g.toUpperCase()}</div>
    </div>
    <div class="ctrl-row">
      <button class="btn" id="_btn" onclick="toggle()">▶</button>
      <div class="vol-g">
        <div class="vol-lbl">VOL</div>
        <input type="range" min="0" max="1" step="0.02" value="0.8" oninput="_a.volume=this.value">
      </div>
    </div>
  </div>
</div>
<audio id="_a"></audio>
<script>
let _on=false;const _a=document.getElementById('_a');
function toggle(){
  const b=document.getElementById('_btn'),st=document.getElementById('_status'),fr=document.getElementById('_freq');
  if(_on){_a.pause();_a.src='';b.textContent='▶';st.className='status off';st.textContent='[ STANDBY ]';fr.textContent='-- ---';_on=false;}
  else{_a.src='${url}';_a.volume=0.8;_a.play().then(()=>{b.textContent='⏸';st.className='status on';st.textContent='[ ON AIR ]';fr.textContent='FM 97.9';_on=true;}).catch(e=>alert('Error: '+e.message));}
}
${meta}
</script>
</body></html>`;

    // ── MINIMAL ────────────────────────────────────────────────────────────
    case "minimal":
    default: return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${n}</title>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;1,300&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f7f6f3;font-family:'Jost',sans-serif}
${BLINK}
.shell{width:360px;background:#fff;border-radius:3px;box-shadow:0 1px 3px rgba(0,0,0,.06),0 8px 40px rgba(0,0,0,.06);overflow:hidden}
.top-accent{height:3px;background:linear-gradient(90deg,${p1},${p2})}
.body{padding:32px}
.cover-row{display:flex;gap:16px;align-items:center;margin-bottom:28px}
.cover-art{width:72px;height:72px;flex-shrink:0;background:#f7f6f3;display:flex;align-items:center;justify-content:center;font-size:30px;border-radius:2px;background-size:cover;background-position:center;transition:background-image .8s}
.title-col{flex:1;min-width:0}
.radio-name{font-family:'Fraunces',serif;font-size:22px;font-weight:600;color:#111;letter-spacing:-.3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.radio-genre{font-size:12px;color:#a09c96;font-family:'Fraunces',serif;font-style:italic;margin-top:3px}
.live-tag{display:none;align-items:center;gap:5px;margin-top:7px;font-size:10px;color:#ef4444;font-weight:500;letter-spacing:.5px}
.live-tag.on{display:flex}
.dot{width:5px;height:5px;background:#ef4444;border-radius:50%;animation:blink 1.2s infinite}
.sep{height:1px;background:#f0eeea;margin-bottom:24px}
.now-section{margin-bottom:22px}
.now-lbl{font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#c8c4be;margin-bottom:6px}
.now-t{font-family:'Fraunces',serif;font-size:16px;color:#1a1a1a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.now-a{font-size:12px;color:#a09c96;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ctrl{display:flex;align-items:center;gap:14px}
.btn{width:46px;height:46px;border-radius:50%;background:${p1};border:none;cursor:pointer;color:#fff;font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s;box-shadow:0 4px 14px ${p1}40}
.btn:hover{transform:scale(1.06);box-shadow:0 6px 18px ${p1}50}
.vol{flex:1}
.vol-lbl{font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#c8c4be;margin-bottom:8px}
input[type=range]{width:100%;height:1px;-webkit-appearance:none;background:#e8e5e0;border-radius:1px;outline:none}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:13px;height:13px;border-radius:50%;background:${p1};cursor:pointer}
</style></head><body>
<div class="shell">
  <div class="top-accent"></div>
  <div class="body">
    <div class="cover-row">
      <div class="cover-art" id="_meta_cover">${logoEmoji}</div>
      <div class="title-col">
        <div class="radio-name">${n}</div>
        <div class="radio-genre">${g}</div>
        <div class="live-tag" id="_live"><div class="dot"></div>En vivo</div>
      </div>
    </div>
    <div class="sep"></div>
    <div class="now-section">
      <div class="now-lbl">Sonando ahora</div>
      <div class="now-t" id="_meta_title">${n}</div>
      <div class="now-a" id="_meta_artist">${g}</div>
    </div>
    <div class="ctrl">
      <button class="btn" id="_btn" onclick="toggle()">▶</button>
      <div class="vol">
        <div class="vol-lbl">Volumen</div>
        <input type="range" min="0" max="1" step="0.02" value="0.8" oninput="_a.volume=this.value">
      </div>
    </div>
  </div>
</div>
<audio id="_a"></audio>
<script>
let _on=false;const _a=document.getElementById('_a');
function toggle(){
  const b=document.getElementById('_btn'),lv=document.getElementById('_live');
  if(_on){_a.pause();_a.src='';b.textContent='▶';lv.classList.remove('on');_on=false;}
  else{_a.src='${url}';_a.volume=0.8;_a.play().then(()=>{b.textContent='⏸';lv.classList.add('on');_on=true;}).catch(e=>alert('Error: '+e.message));}
}
${meta}
</script>
</body></html>`;
  }
}

// ─── Live Preview (card de tamaño fijo, NO pantalla completa) ────────────────
function LivePreview({ playerId, config }: { playerId: string; config: PlayerConfig }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const html = generatePlayerHTML(playerId, config);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const blob = new Blob([html], { type: "text/html" });
    const url  = URL.createObjectURL(blob);
    iframe.src = url;
    return () => URL.revokeObjectURL(url);
  }, [html]);

  return (
    <div style={{
      width: "100%",
      height: 320,
      borderRadius: 12,
      overflow: "hidden",
      background: "#0f172a",
      border: "1px solid rgba(255,255,255,.06)",
      flexShrink: 0,
    }}>
      <iframe
        ref={iframeRef}
        title={`preview-${playerId}`}
        sandbox="allow-scripts"
        style={{ width: "100%", height: "100%", border: "none", display: "block" }}
      />
    </div>
  );
}

// ─── Player Chip (grilla compacta) ────────────────────────────────────────────
function PlayerChip({ player, selected, onClick }: {
  player: PlayerDef; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all text-center ${
        selected
          ? "border-violet-500 bg-violet-50"
          : "border-transparent bg-gray-50 hover:bg-gray-100 hover:border-gray-200"
      }`}
    >
      <span className="text-2xl leading-none">{player.tag}</span>
      <span className={`text-xs font-semibold leading-tight ${selected ? "text-violet-700" : "text-gray-600"}`}>
        {player.name}
      </span>
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function RadioPlayers() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("pulse");
  const [copied,   setCopied]   = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [cfg, setCfg] = useState<PlayerConfig>({
    name: "", streamUrl: "", genre: "",
    logoEmoji: "📻", primaryColor: "#6d28d9", secondaryColor: "#db2777",
  });

  const player = PLAYERS.find(p => p.id === selected)!;
  const html   = generatePlayerHTML(selected, cfg);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(html);
    setCopied(true);
    toast.success("Código copiado");
    setTimeout(() => setCopied(false), 2000);
  }, [html]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([html], { type: "text/html" });
    const a    = document.createElement("a");
    a.href     = URL.createObjectURL(blob);
    a.download = `${(cfg.name || "player").replace(/\s+/g, "-").toLowerCase()}-${selected}.html`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("Descargado");
  }, [html, cfg.name, selected]);

  const EMOJIS  = ["📻","🎵","🎶","🎙️","🎚️","📡","🌟","🔥","💎","🌙","⚡","🎭","🎸","🎹","🌊"];
  const PRESETS = [
    { p: "#6d28d9", s: "#db2777" }, { p: "#0ea5e9", s: "#06b6d4" },
    { p: "#ef4444", s: "#f97316" }, { p: "#10b981", s: "#06b6d4" },
    { p: "#f59e0b", s: "#ef4444" }, { p: "#111827", s: "#374151" },
  ];

  return (
    // Layout: columna izquierda fija (config + preview pequeño) | columna derecha (código)
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 font-sans">

      {/* ─── PANEL IZQUIERDO: Config + Preview acotado ─────────────────────── */}
      <aside className="w-80 flex-shrink-0 flex flex-col h-full bg-white border-r border-gray-100">

        {/* Header */}
        <div className="px-4 pt-3 pb-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => navigate("/my-station")}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
          >
            <ChevronLeft size={12} /> Mi Estación
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center">
              <Music2 size={12} className="text-white" />
            </div>
            <span className="text-sm font-bold text-gray-800">Players</span>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">

          {/* ① Selección de estilo — grilla 3 columnas */}
          <div className="px-4 pt-4 pb-3 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Estilo</p>
            <div className="grid grid-cols-3 gap-1.5">
              {PLAYERS.map(p => (
                <PlayerChip key={p.id} player={p} selected={selected === p.id} onClick={() => setSelected(p.id)} />
              ))}
            </div>
          </div>

          {/* ② Preview pequeño y acotado */}
          <div className="px-4 pt-4 pb-3 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Vista previa</p>
            <LivePreview playerId={selected} config={cfg} />
          </div>

          {/* ③ Config */}
          <div className="px-4 pt-4 pb-3 border-b border-gray-100 space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Configurar</p>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Nombre de la radio</label>
              <input
                value={cfg.name}
                onChange={e => setCfg(c => ({ ...c, name: e.target.value }))}
                placeholder="La Mejor FM"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:border-violet-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1 flex items-center gap-1">
                <Globe size={9} /> URL del Stream
              </label>
              <input
                value={cfg.streamUrl}
                onChange={e => setCfg(c => ({ ...c, streamUrl: e.target.value }))}
                placeholder="http://host:8000/mount"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono bg-gray-50 focus:outline-none focus:border-violet-400"
              />
              <p className="text-xs text-gray-400 mt-1">Metadata y portadas automáticas</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Género</label>
              <input
                value={cfg.genre}
                onChange={e => setCfg(c => ({ ...c, genre: e.target.value }))}
                placeholder="Rock, Pop, Electrónica..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:border-violet-400"
              />
            </div>
          </div>

          {/* ④ Ícono */}
          <div className="px-4 pt-4 pb-3 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ícono</p>
            <div className="grid grid-cols-5 gap-1">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => setCfg(c => ({ ...c, logoEmoji: e }))}
                  className={`h-9 rounded-lg text-lg transition-all ${cfg.logoEmoji === e ? "bg-violet-100 ring-2 ring-violet-400" : "bg-gray-50 hover:bg-gray-100"}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* ⑤ Colores */}
          <div className="px-4 pt-4 pb-4 space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Colores</p>
            <div className="flex gap-1.5 flex-wrap">
              {PRESETS.map((pr, i) => (
                <button
                  key={i}
                  onClick={() => setCfg(c => ({ ...c, primaryColor: pr.p, secondaryColor: pr.s }))}
                  className="w-8 h-8 rounded-lg border-2 border-white shadow hover:scale-110 transition-transform"
                  style={{ background: `linear-gradient(135deg,${pr.p},${pr.s})` }}
                />
              ))}
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-gray-400 block mb-1">Primario</label>
                <div className="flex items-center gap-1.5">
                  <input type="color" value={cfg.primaryColor}
                    onChange={e => setCfg(c => ({ ...c, primaryColor: e.target.value }))}
                    className="w-8 h-8 rounded border border-gray-200 cursor-pointer p-0.5 bg-white flex-shrink-0" />
                  <input value={cfg.primaryColor}
                    onChange={e => setCfg(c => ({ ...c, primaryColor: e.target.value }))}
                    className="flex-1 min-w-0 border border-gray-200 rounded px-2 py-1.5 text-xs font-mono bg-gray-50 focus:outline-none focus:border-violet-400" />
                </div>
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-400 block mb-1">Secundario</label>
                <div className="flex items-center gap-1.5">
                  <input type="color" value={cfg.secondaryColor}
                    onChange={e => setCfg(c => ({ ...c, secondaryColor: e.target.value }))}
                    className="w-8 h-8 rounded border border-gray-200 cursor-pointer p-0.5 bg-white flex-shrink-0" />
                  <input value={cfg.secondaryColor}
                    onChange={e => setCfg(c => ({ ...c, secondaryColor: e.target.value }))}
                    className="flex-1 min-w-0 border border-gray-200 rounded px-2 py-1.5 text-xs font-mono bg-gray-50 focus:outline-none focus:border-violet-400" />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Botones fijos en el fondo */}
        <div className="px-4 py-3 border-t border-gray-100 flex gap-2 flex-shrink-0">
          <button onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900 py-2.5 rounded-lg font-medium transition-all">
            {copied ? <><Check size={11} className="text-green-500" />Copiado</> : <><Copy size={11} />Copiar HTML</>}
          </button>
          <button onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-lg font-semibold shadow-sm transition-all">
            <Download size={11} />Descargar .html
          </button>
        </div>
      </aside>

      {/* ─── PANEL DERECHO: Código HTML ────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="h-10 flex-shrink-0 bg-white border-b border-gray-100 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{player.tag}</span>
            <span className="text-sm font-bold text-gray-700">{player.name}</span>
            <span className="text-xs text-gray-400">— {player.description}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
              {copied ? <><Check size={10} className="text-green-400" />Copiado</> : <><Copy size={10} />Copiar</>}
            </button>
            <span className="text-xs text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
              {(cfg.name||"player").replace(/\s+/g,"-").toLowerCase()}-{selected}.html
            </span>
          </div>
        </div>
        <div className="flex-1 bg-gray-950 overflow-auto">
          <pre className="text-green-300 text-xs font-mono p-5 leading-relaxed whitespace-pre-wrap break-all">
            {html}
          </pre>
        </div>
      </main>

    </div>
  );
}
