import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Radio, Users, Signal, Music, Wifi, WifiOff, LogOut, Copy,
  Play, Square, Volume2, VolumeX, Edit3, Check, X, Clock,
  TrendingUp, BarChart2, Headphones, Mic, MicOff, Settings,
  ChevronDown, ChevronUp, Zap, Home, Activity, List,
  Sliders, Code, Download, Globe, FileCode, Layers, Info,
  Link, Wand2, Loader2, Palette, LayoutTemplate
} from "lucide-react";
import { toast } from "sonner";

const API = import.meta.env.VITE_API_BASE_URL;

// ─── Types ────────────────────────────────────────────────────────────────────
type Section = "overview" | "encoder" | "history" | "stats" | "player-gen";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2 py-2 border-b border-gray-100 last:border-0 group">
      <span className="text-xs text-gray-400 w-32 shrink-0 font-medium uppercase tracking-wide">{label}</span>
      <span className="flex-1 text-sm font-mono text-gray-700 truncate">{value}</span>
      <button
        onClick={() => { navigator.clipboard.writeText(value); setCopied(true); toast.success(`${label} copiado`); setTimeout(() => setCopied(false), 2000); }}
        className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-lg text-gray-500 transition-all shrink-0"
      >
        <Copy size={10} />{copied ? "✓" : "Copiar"}
      </button>
    </div>
  );
}

function PulsingDot({ active }: { active: boolean }) {
  return (
    <span className="relative flex h-2.5 w-2.5 shrink-0">
      {active && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />}
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${active ? "bg-red-500" : "bg-gray-300"}`} />
    </span>
  );
}

function WaveBars({ active }: { active: boolean }) {
  return (
    <div className="flex items-end gap-px h-4">
      {[3,5,4,6,3,5,4].map((h, i) => (
        <div key={i}
          className={`w-0.5 rounded-full transition-all ${active ? "bg-red-500" : "bg-gray-300"}`}
          style={active ? { height: `${h*2}px`, animation: `wb ${0.35+i*0.06}s ease-in-out infinite alternate` } : { height: "2px" }}
        />
      ))}
      <style>{`@keyframes wb{0%{height:2px;opacity:.5}100%{height:14px;opacity:1}}`}</style>
    </div>
  );
}

function Sparkline({ data, color = "#ef4444", height = 60 }: { data: number[]; color?: string; height?: number }) {
  if (data.length < 2) return <div className="text-xs text-gray-300 py-2 text-center">Acumulando datos...</div>;
  const max = Math.max(...data, 1);
  const W = 400; const H = height; const P = 4;
  const pts = data.map((v, i) => `${P + (i / (data.length - 1)) * (W - P * 2)},${H - P - (v / max) * (H - P * 2)}`);
  const area = `M ${pts[0]} L ${pts.join(" L ")} L ${P + (W - P * 2)},${H - P} L ${P},${H - P} Z`;
  const gid = `g${color.replace("#", "")}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={P + (W - P * 2)} cy={H - P - (data[data.length - 1] / max) * (H - P * 2)} r="4" fill={color} />
    </svg>
  );
}

// ─── Audio Monitor ────────────────────────────────────────────────────────────
function AudioMonitor({ streamUrl, isLive }: { streamUrl?: string; isLive: boolean }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [vol, setVol] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    const a = ref.current; if (!a || !streamUrl) return;
    if (playing) { a.pause(); a.src = ""; setPlaying(false); }
    else {
      setLoading(true); a.src = streamUrl; a.volume = vol;
      try { await a.play(); setPlaying(true); } catch { toast.error("No se pudo conectar"); }
      setLoading(false);
    }
  };
  useEffect(() => { if (!isLive && playing) { ref.current?.pause(); setPlaying(false); } }, [isLive]);

  return (
    <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
      <Headphones size={14} className="text-gray-400 shrink-0" />
      <audio ref={ref} onEnded={() => setPlaying(false)} />
      <button onClick={toggle} disabled={!isLive || loading}
        className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 transition-all ${playing ? "bg-red-50 border-red-200 text-red-500" : "bg-white border-gray-200 text-gray-400 hover:border-gray-300 disabled:opacity-30"}`}>
        {loading ? <span className="w-3 h-3 border border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          : playing ? <Square size={11} fill="currentColor" /> : <Play size={11} fill="currentColor" />}
      </button>
      <button onClick={() => { if (ref.current) ref.current.muted = !muted; setMuted(!muted); }}
        className="text-gray-300 hover:text-gray-600 transition-colors shrink-0">
        {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
      </button>
      <input type="range" min="0" max="1" step="0.05" value={muted ? 0 : vol}
        onChange={e => { const v = +e.target.value; setVol(v); if (ref.current) ref.current.volume = v; }}
        className="flex-1 h-1 accent-red-400 cursor-pointer" />
      {playing && <span className="text-xs font-bold text-red-500 animate-pulse shrink-0">● LIVE</span>}
      {!isLive && <span className="text-xs text-gray-400 shrink-0">Offline</span>}
    </div>
  );
}

// ─── Metadata Editor ──────────────────────────────────────────────────────────
function MetaEditor({ mount, encoderInfo }: { mount: string; encoderInfo: any }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(""); const [artist, setArtist] = useState(""); const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    try {
      const song = artist ? `${artist} - ${title}` : title;
      const p = new URLSearchParams({ mode: "updinfo", mount, charset: "UTF-8", song });
      const r = await fetch(`http://${encoderInfo.host}:${encoderInfo.port}/admin/metadata?${p}`,
        { headers: { Authorization: "Basic " + btoa(`${encoderInfo.username}:${encoderInfo.password}`) } });
      if (r.ok || r.status === 200) { toast.success("Metadata actualizada"); setOpen(false); setTitle(""); setArtist(""); }
      else toast.error("Error al actualizar metadata");
    } catch { toast.error("Error de conexión"); }
    setSaving(false);
  };
  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-300 bg-white rounded-lg px-3 py-1.5 transition-all">
      <Edit3 size={11} /> Actualizar metadata
    </button>
  );
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <input value={artist} onChange={e => setArtist(e.target.value)} placeholder="Artista"
        className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400 w-32" />
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título"
        className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400 flex-1 min-w-32" />
      <button onClick={save} disabled={!title || saving}
        className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-1.5 disabled:opacity-40">
        {saving ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />} OK
      </button>
      <button onClick={() => setOpen(false)}
        className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-lg px-3 py-1.5">
        <X size={10} /> Cancel
      </button>
    </div>
  );
}

// ─── Player Generator (embedded) ─────────────────────────────────────────────
const PSTYLES = [
  { id: "minimal", name: "Minimal", cat: "basic", cls: "bg-white border-2 border-gray-200 text-gray-900" },
  { id: "dark", name: "Dark", cat: "basic", cls: "bg-gray-900 border border-gray-700 text-white" },
  { id: "glass", name: "Glass", cat: "premium", cls: "bg-white/20 border border-white/40 text-white bg-gradient-to-br from-blue-400/30 to-purple-400/30" },
  { id: "neon", name: "Neón", cat: "premium", cls: "bg-black border border-cyan-400 text-cyan-300" },
  { id: "gradient", name: "Gradient", cat: "premium", cls: "bg-gradient-to-r from-pink-500 to-violet-600 text-white" },
  { id: "retro", name: "Retro", cat: "themed", cls: "bg-amber-100 border-4 border-amber-700 text-amber-900" },
  { id: "broadcast", name: "Broadcast", cat: "themed", cls: "bg-slate-900 border border-red-500/50 text-white" },
];

function genReactCode(name: string, url: string, color: string, style: string) {
  return `// Reproductor ${style} — generado por Icecast Control Hub
import React, { useState, useRef } from 'react';
const STREAM = "${url || 'http://tu-servidor:8000/stream'}";
export const RadioPlayer = () => {
  const [on, setOn] = useState(false);
  const [vol, setVol] = useState(0.8);
  const ref = useRef(null);
  const toggle = async () => {
    const a = ref.current;
    if (on) { a.pause(); a.src=''; setOn(false); }
    else { a.src=STREAM; a.volume=vol; try{await a.play();setOn(true);}catch(e){console.error(e);} }
  };
  return (
    <div style={{fontFamily:'Inter,sans-serif',background:'${style === "gradient" ? `linear-gradient(135deg,${color},#8b5cf6)` : style === "dark" ? "#111827" : "#fff"}',color:'${style === "minimal" ? "#111" : "#fff"}',borderRadius:14,padding:20,maxWidth:420,boxShadow:'0 20px 40px rgba(0,0,0,.15)'}}>
      <audio ref={ref}/>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
        <div style={{width:46,height:46,borderRadius:10,background:'${color}30',border:'1px solid ${color}50',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>📻</div>
        <div><div style={{fontWeight:700,fontSize:16}}>${name || "Mi Radio"}</div>{on&&<div style={{fontSize:11,color:'#ef4444',fontWeight:700,marginTop:2}}>● EN VIVO</div>}</div>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <button onClick={toggle} style={{width:48,height:48,borderRadius:'50%',background:'${color}',border:'none',color:'#fff',cursor:'pointer',fontSize:18,boxShadow:'0 4px 15px ${color}50',display:'flex',alignItems:'center',justifyContent:'center'}}>{on?'⏸':'▶'}</button>
        <div style={{display:'flex',alignItems:'center',gap:8,flex:1}}>
          <span style={{fontSize:14,opacity:.6}}>🔊</span>
          <input type="range" min="0" max="1" step="0.05" value={vol} onChange={e=>{setVol(+e.target.value);if(ref.current)ref.current.volume=+e.target.value;}} style={{flex:1,accentColor:'${color}'}}/>
        </div>
      </div>
    </div>
  );
};
export default RadioPlayer;`;
}

function genHTMLCode(name: string, url: string, color: string) {
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><title>${name || "Radio Player"}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0f172a;font-family:Inter,system-ui,sans-serif}.player{background:#1e293b;color:#fff;border-radius:16px;padding:24px;width:400px;box-shadow:0 25px 50px rgba(0,0,0,.4)}.header{display:flex;align-items:center;gap:14px;margin-bottom:18px}.logo{width:50px;height:50px;border-radius:10px;background:${color}30;border:1px solid ${color}50;display:flex;align-items:center;justify-content:center;font-size:24px}.name{font-weight:700;font-size:17px}.live{color:#ef4444;font-size:11px;font-weight:700;display:none;margin-top:3px}.controls{display:flex;align-items:center;gap:12px}.btn{width:50px;height:50px;border-radius:50%;background:${color};border:none;color:#fff;cursor:pointer;font-size:18px;box-shadow:0 4px 15px ${color}50;transition:transform .15s}.btn:hover{transform:scale(1.08)}.vol{display:flex;align-items:center;gap:8px;flex:1;opacity:.7}.vol input{flex:1;accent-color:${color}}</style></head>
<body><div class="player">
  <div class="header"><div class="logo">📻</div><div><div class="name">${name || "Mi Radio"}</div><div class="live" id="lv">● EN VIVO</div></div></div>
  <div class="controls">
    <button class="btn" id="btn" onclick="go()">▶</button>
    <div class="vol">🔊<input type="range" min="0" max="1" step="0.05" value="0.8" oninput="a.volume=this.value"></div>
  </div>
</div>
<audio id="a"></audio>
<script>const a=document.getElementById('a');let on=false;function go(){const b=document.getElementById('btn'),lv=document.getElementById('lv');if(on){a.pause();a.src='';b.textContent='▶';lv.style.display='none';}else{a.src='${url || "http://tu-servidor:8000/stream"}';a.volume=0.8;a.play().then(()=>{b.textContent='⏸';lv.style.display='block';}).catch(e=>alert('Error: '+e.message));}on=!on;}</script>
</body></html>`;
}

function PlayerGen({ defaultUrl, defaultName }: { defaultUrl?: string; defaultName?: string }) {
  const [pname, setPname] = useState(defaultName || "");
  const [purl, setPurl] = useState(defaultUrl || "");
  const [color, setColor] = useState("#3b82f6");
  const [style, setStyle] = useState("dark");
  const [catFilter, setCatFilter] = useState("all");
  const [exportType, setExportType] = useState<"react" | "html">("react");
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = () => {
    if (!pname.trim()) { toast.error("Ingresa el nombre de la radio"); return; }
    setGenerating(true);
    setTimeout(() => { setGenerating(false); setGenerated(true); toast.success("¡Reproductor generado!"); }, 1200);
  };

  const code = exportType === "react" ? genReactCode(pname, purl, color, style) : genHTMLCode(pname, purl, color);
  const filtered = catFilter === "all" ? PSTYLES : PSTYLES.filter(s => s.cat === catFilter);

  const download = () => {
    const ext = exportType === "react" ? "jsx" : "html";
    const blob = new Blob([code], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${pname.replace(/\s+/g, "") || "RadioPlayer"}.${ext}`;
    a.click();
    toast.success(`Descargado como .${ext}`);
  };

  return (
    <div className="space-y-5">
      {/* Config */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Nombre de la radio *</label>
            <input value={pname} onChange={e => setPname(e.target.value)} placeholder="Mi Radio FM"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition-all" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">URL del Stream</label>
            <input value={purl} onChange={e => setPurl(e.target.value)} placeholder="http://servidor:8000/stream"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-blue-400 transition-all" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Color principal</label>
            <div className="flex gap-2">
              <input type="color" value={color} onChange={e => setColor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-gray-200 p-0.5 cursor-pointer bg-white" />
              <input value={color} onChange={e => setColor(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-400" />
            </div>
          </div>
        </div>

        {/* Style picker */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estilo</label>
            <div className="flex gap-1">
              {["all","basic","premium","themed"].map(c => (
                <button key={c} onClick={() => setCatFilter(c)}
                  className={`px-2 py-1 rounded-lg text-xs transition-all ${catFilter === c ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                  {c === "all" ? "Todos" : c === "basic" ? "Básicos" : c === "premium" ? "Premium" : "Temáticos"}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {filtered.map(s => (
              <button key={s.id} onClick={() => setStyle(s.id)}
                className={`relative h-14 rounded-xl border-2 overflow-hidden text-xs font-bold transition-all ${s.cls} ${style === s.id ? "border-blue-500 ring-2 ring-blue-400/30 scale-105" : "border-transparent hover:border-gray-300"}`}>
                <span className="absolute inset-0 flex items-center justify-center bg-black/10">{s.name}</span>
                {style === s.id && <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center"><Check size={8} className="text-white" /></span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button onClick={generate} disabled={generating}
        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-blue-500/20 transition-all disabled:opacity-60">
        {generating ? <><Loader2 size={16} className="animate-spin" /> Generando...</> : <><Wand2 size={16} /> Generar Reproductor</>}
      </button>

      {/* Export */}
      {generated && (
        <div className="space-y-3">
          <div className="flex gap-2">
            {[["react","Componente React (.jsx)"],["html","HTML Standalone (.html)"]].map(([t, label]) => (
              <button key={t} onClick={() => setExportType(t as "react" | "html")}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-medium transition-all ${exportType === t ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="relative">
            <pre className="bg-gray-950 text-green-300 text-xs font-mono p-4 rounded-xl overflow-x-auto max-h-60 leading-relaxed">{code}</pre>
            <div className="absolute top-2 right-2 flex gap-1.5">
              <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); toast.success("Copiado"); setTimeout(() => setCopied(false), 2000); }}
                className="flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5 rounded-lg transition-all">
                {copied ? <><Check size={11} /> OK</> : <><Copy size={11} /> Copiar</>}
              </button>
              <button onClick={download}
                className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg transition-all">
                <Download size={11} /> Descargar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sidebar Nav Item ─────────────────────────────────────────────────────────
function NavItem({ icon, label, section, active, onClick, badge }: {
  icon: React.ReactNode; label: string; section: Section; active: boolean; onClick: () => void; badge?: string;
}) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${active ? "bg-blue-600 text-white shadow-sm shadow-blue-200" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}>
      <span className={active ? "text-white" : "text-gray-400"}>{icon}</span>
      <span className="flex-1">{label}</span>
      {badge && <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${active ? "bg-white/20 text-white" : "bg-red-100 text-red-600"}`}>{badge}</span>}
    </button>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color = "blue" }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; color?: string }) {
  const colors: Record<string, string> = {
    red: "bg-red-50 border-red-100 text-red-500",
    blue: "bg-blue-50 border-blue-100 text-blue-500",
    green: "bg-green-50 border-green-100 text-green-500",
    indigo: "bg-indigo-50 border-indigo-100 text-indigo-500",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3 ${colors[color]}`}>{icon}</div>
      <div className="text-2xl font-black text-gray-900 tabular-nums leading-none mb-1">{value}</div>
      <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const MyStation = () => {
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>("overview");
  const [userData, setUserData] = useState<any>(null);
  const [liveStats, setLiveStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [listenerHist, setListenerHist] = useState<number[]>([]);
  const [songHist, setSongHist] = useState<{ song: string; time: Date }[]>([]);
  const [uptimeSecs, setUptimeSecs] = useState(0);
  const [showEncoderFields, setShowEncoderFields] = useState(false);
  const iRef = useRef<any>(null);
  const lastSong = useRef("");

  useEffect(() => {
    const role = localStorage.getItem("icecast_role");
    if (role !== "streamer") { navigate("/dashboard"); return; }
    const d = localStorage.getItem("icecast_user_data");
    if (d) setUserData(JSON.parse(d));
    setIsLoading(false);
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, [navigate]);

  const fetchStats = useCallback(async () => {
    try {
      const auth = localStorage.getItem("icecast_auth");
      const r = await fetch(`${API}/servers/local/stats`, { headers: { Authorization: `Basic ${auth}` } });
      setLiveStats(await r.json());
    } catch {}
  }, []);

  useEffect(() => {
    if (!userData) return;
    fetchStats();
    iRef.current = setInterval(fetchStats, 5000);
    return () => clearInterval(iRef.current);
  }, [userData, fetchStats]);

  useEffect(() => {
    if (!liveStats || !userData) return;
    const mp = userData?.mountpoints?.[0];
    if (!mp) return;
    const live = liveStats?.mountpoints?.find((l: any) => l.mount === mp.point);
    setListenerHist(p => [...p.slice(-39), live?.listeners?.current ?? 0]);
    if (live) setUptimeSecs(p => p + 5); else setUptimeSecs(0);
    const song = live?.currentSong || "";
    if (song && song !== lastSong.current) {
      lastSong.current = song;
      setSongHist(p => [{ song, time: new Date() }, ...p].slice(0, 20));
    }
  }, [liveStats, userData]);

  const logout = () => {
    ["icecast_auth", "icecast_user", "icecast_role", "icecast_user_data"].forEach(k => localStorage.removeItem(k));
    toast.success("Sesión cerrada");
    navigate("/");
  };

  const fmt = (s: number) => `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  const mps = userData?.mountpoints || [];
  const mp = mps[0];
  const live = mp && liveStats?.mountpoints?.find((l: any) => l.mount === mp.point);
  const isLive = !!live;
  const listeners = live?.listeners?.current ?? 0;
  const peak = live?.listeners?.peak ?? 0;
  const song = live?.currentSong || "";
  const artist = live?.artist || "";
  const streamUrl = mp?.encoderInfo ? `http://${mp.encoderInfo.host}:8000${mp.point}` : undefined;
  const avg = listenerHist.length ? Math.round(listenerHist.reduce((a, b) => a + b, 0) / listenerHist.length) : 0;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100 font-sans">

      {/* ── SIDEBAR ────────────────────────────────────────────────────────── */}
      <aside className="w-64 shrink-0 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-500 ${isLive ? "bg-red-500 border-red-400 shadow-md shadow-red-200" : "bg-gray-100 border-gray-200"}`}>
              <Radio size={16} className={isLive ? "text-white" : "text-gray-400"} />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm leading-tight">{userData?.username}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <PulsingDot active={isLive} />
                <span className={`text-xs font-semibold ${isLive ? "text-red-500" : "text-gray-400"}`}>{isLive ? "EN VIVO" : "OFFLINE"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Station info */}
        {mp && (
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Estación</div>
            <div className="font-bold text-gray-800 text-sm truncate">{mp.name}</div>
            <div className="text-xs text-gray-400 font-mono">{mp.point}</div>
            {isLive && song && (
              <div className="flex items-center gap-1.5 mt-2 bg-white rounded-lg px-2.5 py-1.5 border border-gray-100">
                <WaveBars active />
                <span className="text-xs text-gray-600 truncate">{song}</span>
              </div>
            )}
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Panel de control</div>
          <NavItem icon={<Home size={15} />} label="Resumen" section="overview" active={section === "overview"} onClick={() => setSection("overview")} />
          <NavItem icon={<Wifi size={15} />} label="Configuración Encoder" section="encoder" active={section === "encoder"} onClick={() => setSection("encoder")} />
          <NavItem icon={<List size={15} />} label="Historial" section="history" active={section === "history"} onClick={() => setSection("history")} badge={songHist.length > 0 ? String(songHist.length) : undefined} />
          <NavItem icon={<Activity size={15} />} label="Estadísticas" section="stats" active={section === "stats"} onClick={() => setSection("stats")} />
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mt-4 mb-2">Herramientas</div>
          <NavItem icon={<Wand2 size={15} />} label="Generador de Reproductores" section="player-gen" active={section === "player-gen"} onClick={() => setSection("player-gen")} />
        </nav>

        {/* Clock + Logout */}
        <div className="px-5 py-4 border-t border-gray-100 space-y-3">
          <div className="text-center">
            <div className="text-lg font-mono font-bold text-gray-800 tabular-nums">
              {currentTime.toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
            <div className="text-xs text-gray-400">
              {currentTime.toLocaleDateString("es-CR", { weekday: "long", day: "numeric", month: "short" })}
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-200 hover:bg-red-50 rounded-xl py-2 transition-all">
            <LogOut size={13} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── CONTENT ────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto h-full">
        {!mp ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <WifiOff size={56} className="text-gray-200 mb-4" />
            <h2 className="text-xl font-bold text-gray-500 mb-2">Sin estación asignada</h2>
            <p className="text-gray-400 text-sm">Contacta al administrador para activar tu cuenta.</p>
          </div>
        ) : (
          <>
            {/* ── OVERVIEW ─────────────────────────────────────────────────── */}
            {section === "overview" && (
              <div className="p-6 space-y-5">
                {/* Top bar */}
                <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${isLive ? "border-red-200" : "border-gray-200"}`}>
                  {isLive && <div className="h-1 bg-gradient-to-r from-red-500 via-orange-400 to-red-500 animate-pulse" />}
                  <div className="p-5 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <WaveBars active={isLive} />
                      <div className="min-w-0">
                        <h1 className="text-xl font-black text-gray-900 truncate">{mp.name}</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs font-bold uppercase tracking-wider ${isLive ? "text-red-500" : "text-gray-400"}`}>{isLive ? "Transmitiendo" : "Sin señal"}</span>
                          <span className="text-gray-200">·</span>
                          <span className="text-xs text-gray-400 font-mono">{mp.genre || mp.type}</span>
                        </div>
                      </div>
                    </div>
                    {isLive && mp.encoderInfo && <MetaEditor mount={mp.point} encoderInfo={mp.encoderInfo} />}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold ${isLive ? "bg-red-50 border-red-200 text-red-600" : "bg-gray-50 border-gray-200 text-gray-400"}`}>
                      <PulsingDot active={isLive} />
                      {isLive ? "AL AIRE" : "OFFLINE"}
                    </div>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard icon={<Users size={18} />} label="Oyentes" value={listeners} sub={`Pico: ${peak}`} color="red" />
                  <StatCard icon={<TrendingUp size={18} />} label="Promedio" value={avg} sub="oyentes/sesión" color="blue" />
                  <StatCard icon={<Clock size={18} />} label="Uptime" value={fmt(uptimeSecs)} color="indigo" />
                  <StatCard icon={<Signal size={18} />} label="Bitrate" value={`${mp.bitrate} kbps`} sub={mp.type} color="green" />
                </div>

                {/* Now playing + monitor */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Music size={14} className="text-gray-400" />
                      <span className="text-sm font-semibold text-gray-700">Sonando ahora</span>
                      {isLive && <span className="ml-auto text-xs text-red-500 font-bold animate-pulse">● LIVE</span>}
                    </div>
                    <div className={`rounded-xl px-4 py-3 border mb-4 ${isLive && song ? "bg-red-50 border-red-100" : "bg-gray-50 border-gray-100 opacity-50"}`}>
                      <div className="font-semibold text-gray-800 truncate">{song || (isLive ? "Sin metadata" : "—")}</div>
                      {artist && <div className="text-sm text-gray-500 mt-0.5">{artist}</div>}
                    </div>
                    <AudioMonitor streamUrl={streamUrl} isLive={isLive} />
                  </div>

                  {/* Listener sparkline */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity size={14} className="text-gray-400" />
                      <span className="text-sm font-semibold text-gray-700">Oyentes en tiempo real</span>
                    </div>
                    <div className="text-3xl font-black text-gray-900 mb-3">{listeners}</div>
                    <Sparkline data={listenerHist} color="#ef4444" height={70} />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>hace {Math.round(listenerHist.length * 5 / 60)}m</span>
                      <span>ahora</span>
                    </div>
                  </div>
                </div>

                {/* Recent tracks preview */}
                {songHist.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <List size={14} className="text-gray-400" />
                        <span className="text-sm font-semibold text-gray-700">Canciones recientes</span>
                      </div>
                      <button onClick={() => setSection("history")} className="text-xs text-blue-500 hover:text-blue-700">Ver todo →</button>
                    </div>
                    <div className="space-y-1">
                      {songHist.slice(0, 5).map((e, i) => (
                        <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg ${i === 0 ? "bg-red-50 border border-red-100" : "hover:bg-gray-50"}`}>
                          <span className={`text-xs font-mono w-4 ${i === 0 ? "text-red-500" : "text-gray-300"}`}>{i === 0 ? "▶" : i + 1}</span>
                          <span className={`flex-1 text-xs truncate ${i === 0 ? "font-semibold text-gray-800" : "text-gray-500"}`}>{e.song}</span>
                          <span className="text-xs text-gray-300 font-mono">{e.time.toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── ENCODER ──────────────────────────────────────────────────── */}
            {section === "encoder" && (
              <div className="p-6 space-y-4">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Wifi size={16} className="text-blue-500" />
                    <h2 className="font-bold text-gray-800">Configuración del Encoder</h2>
                  </div>
                  {mp.encoderInfo ? (
                    <div className="space-y-0.5">
                      <CopyField label="Host / IP" value={mp.encoderInfo.host} />
                      <CopyField label="Puerto" value={String(mp.encoderInfo.port)} />
                      <CopyField label="Mountpoint" value={mp.encoderInfo.mount} />
                      <CopyField label="Usuario" value={mp.encoderInfo.username} />
                      <CopyField label="Contraseña" value={mp.encoderInfo.password} />
                      <CopyField label="Protocolo" value={mp.encoderInfo.protocol} />
                      <CopyField label="Stream URL" value={mp.encoderInfo.streamUrl} />
                    </div>
                  ) : <p className="text-sm text-gray-400">Sin datos de encoder configurados.</p>}
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <div className="text-sm font-semibold text-gray-700 mb-3">Encoders compatibles</div>
                  <div className="flex flex-wrap gap-2">
                    {["BUTT", "Mixxx", "Liquidsoap", "Ices2", "Darkice", "VLC", "OBS Studio", "Rocket Broadcaster"].map(e => (
                      <span key={e} className="text-xs bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 font-medium">{e}</span>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <div className="text-sm font-semibold text-gray-700 mb-4">Detalles del stream</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[["Nombre", mp.name], ["Género", mp.genre || "—"], ["Bitrate", `${mp.bitrate} kbps`], ["Formato", mp.type || "audio/mpeg"], ["Visibilidad", mp.isPublic ? "Público" : "Privado"], ["Mount", mp.point]].map(([l, v]) => (
                      <div key={l}>
                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">{l}</div>
                        <div className="text-sm font-semibold text-gray-800 font-mono">{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── HISTORY ──────────────────────────────────────────────────── */}
            {section === "history" && (
              <div className="p-6">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <List size={15} className="text-indigo-500" />
                      <span className="font-semibold text-gray-800">Historial de canciones</span>
                    </div>
                    <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2.5 py-1 rounded-lg">{songHist.length} canciones</span>
                  </div>
                  {songHist.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <Music size={40} className="text-gray-200 mb-3" />
                      <p className="text-gray-400 text-sm">Las canciones aparecerán cuando estés en vivo</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {songHist.map((e, i) => (
                        <div key={i} className={`flex items-center gap-4 px-6 py-3 transition-colors ${i === 0 ? "bg-red-50" : "hover:bg-gray-50"}`}>
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? "bg-red-500 text-white" : "bg-gray-100 text-gray-400"}`}>{i === 0 ? "▶" : i + 1}</div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm truncate ${i === 0 ? "font-semibold text-gray-900" : "text-gray-600"}`}>{e.song}</div>
                          </div>
                          <div className="text-xs text-gray-400 font-mono shrink-0">{e.time.toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── STATS ────────────────────────────────────────────────────── */}
            {section === "stats" && (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard icon={<Users size={18} />} label="Oyentes actuales" value={listeners} color="red" />
                  <StatCard icon={<TrendingUp size={18} />} label="Pico de oyentes" value={peak} color="blue" />
                  <StatCard icon={<Activity size={18} />} label="Promedio sesión" value={avg} color="indigo" />
                  <StatCard icon={<Clock size={18} />} label="Uptime" value={fmt(uptimeSecs)} color="green" />
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={14} className="text-emerald-500" />
                    <span className="font-semibold text-gray-800 text-sm">Audiencia — últimos {Math.round(listenerHist.length * 5 / 60)} minutos</span>
                  </div>
                  <Sparkline data={listenerHist} color="#10b981" height={100} />
                  <div className="flex justify-between text-xs text-gray-400 mt-2 font-mono">
                    <span>← más antiguo</span><span>ahora →</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <div className="text-sm font-semibold text-gray-700 mb-3">Info del stream</div>
                    <div className="space-y-2 text-sm">
                      {[["Bitrate", `${mp.bitrate} kbps`], ["Formato", mp.type || "audio/mpeg"], ["Mountpoint", mp.point], ["Estado", isLive ? "🟢 En vivo" : "🔴 Offline"]].map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-gray-400">{k}</span>
                          <span className="font-medium text-gray-700 font-mono text-xs">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <div className="text-sm font-semibold text-gray-700 mb-3">Canciones reproducidas</div>
                    <div className="text-3xl font-black text-gray-900">{songHist.length}</div>
                    <div className="text-xs text-gray-400 mt-1">en esta sesión</div>
                    {songHist.length > 0 && (
                      <div className="mt-3 text-xs text-gray-500">
                        Última: <span className="font-medium text-gray-700 truncate block">{songHist[0].song}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── PLAYER GEN ───────────────────────────────────────────────── */}
            {section === "player-gen" && (
              <div className="p-6">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Wand2 size={16} className="text-violet-500" />
                    <h2 className="font-bold text-gray-800">Generador de Reproductores</h2>
                    <span className="ml-2 text-xs bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full font-medium">IA</span>
                  </div>
                  <PlayerGen
                    defaultUrl={streamUrl}
                    defaultName={mp.name}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default MyStation;
