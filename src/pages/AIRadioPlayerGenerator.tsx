import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play, Pause, Volume2, VolumeX, Radio, Wand2, Copy, Download,
  Code, Globe, Monitor, Settings, ChevronDown, ChevronUp,
  Check, X, Loader2, Palette, Sliders, Eye, Link, LogOut,
  RefreshCw, Wifi, WifiOff, Music, ExternalLink, FileCode,
  Layers, Zap, LayoutTemplate, Info
} from "lucide-react";
import { toast } from "sonner";

const API = import.meta.env.VITE_API_BASE_URL;

// ─── Types ────────────────────────────────────────────────────────────────────
interface StreamConfig {
  streamUrl: string;
  radioName: string;
  description: string;
  genre: string;
  logoUrl: string;
}

interface PlayerConfig {
  style: string;
  layout: string;
  primaryColor: string;
  secondaryColor: string;
  showVisualizer: boolean;
  showVolume: boolean;
  showProgress: boolean;
  fontFamily: string;
  bgImage: string;
}

interface MountpointOption {
  point: string;
  name: string;
  streamUrl: string;
  isLive?: boolean;
}

// ─── Player Styles ────────────────────────────────────────────────────────────
const STYLES = [
  { id: "minimal",       name: "Minimal",       desc: "Limpio y moderno",          cat: "basic",   preview: "bg-white border-2 border-gray-200 text-gray-900" },
  { id: "dark",          name: "Dark",           desc: "Oscuro elegante",           cat: "basic",   preview: "bg-gray-900 border border-gray-700 text-white" },
  { id: "glassmorphism", name: "Glass",          desc: "Cristal translúcido",       cat: "premium", preview: "bg-white/20 backdrop-blur border border-white/40 text-white bg-gradient-to-br from-blue-400/30 to-purple-400/30" },
  { id: "neon",          name: "Neón",           desc: "Brillante y eléctrico",     cat: "premium", preview: "bg-black border border-cyan-400 text-cyan-300" },
  { id: "gradient",      name: "Gradient",       desc: "Degradado vibrante",        cat: "premium", preview: "bg-gradient-to-r from-pink-500 to-violet-600 text-white" },
  { id: "retro",         name: "Retro",          desc: "Estilo vintage",            cat: "themed",  preview: "bg-amber-100 border-4 border-amber-700 text-amber-900" },
  { id: "broadcast",     name: "Broadcast",      desc: "Estilo profesional radio",  cat: "themed",  preview: "bg-slate-900 border border-red-500/50 text-white" },
  { id: "wave",          name: "Wave",           desc: "Dinámico con ondas",        cat: "premium", preview: "bg-gradient-to-br from-indigo-900 to-blue-800 text-white" },
];

const LAYOUTS = [
  { id: "horizontal", name: "Horizontal", desc: "Clásico apaisado" },
  { id: "vertical",   name: "Vertical",   desc: "Compacto vertical" },
  { id: "card",       name: "Card",       desc: "Tarjeta cuadrada" },
  { id: "mini",       name: "Mini",       desc: "Mínimo espacio" },
];

const FONTS = [
  { id: "inter",      name: "Inter",      sample: "Aa" },
  { id: "poppins",    name: "Poppins",    sample: "Aa" },
  { id: "montserrat", name: "Montserrat", sample: "Aa" },
  { id: "roboto",     name: "Roboto",     sample: "Aa" },
];

// ─── Live Player Preview ──────────────────────────────────────────────────────
function LivePreview({
  stream, player, isPlaying, onTogglePlay, currentSong
}: {
  stream: StreamConfig;
  player: PlayerConfig;
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentSong: string;
}) {
  const getContainerStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      fontFamily: player.fontFamily === "poppins" ? "'Poppins', sans-serif"
        : player.fontFamily === "montserrat" ? "'Montserrat', sans-serif"
        : player.fontFamily === "roboto" ? "'Roboto', sans-serif"
        : "'Inter', sans-serif",
      transition: "all 0.3s ease",
    };
    if (player.bgImage) base.backgroundImage = `url(${player.bgImage})`;
    return base;
  };

  const name = stream.radioName || "Mi Radio";
  const desc = stream.description || "";
  const song = currentSong || (isPlaying ? "En vivo..." : "—");
  const pc = player.primaryColor || "#3b82f6";
  const sc = player.secondaryColor || "#8b5cf6";

  const wrapCls = player.layout === "mini"
    ? "max-w-xs w-full"
    : player.layout === "card"
    ? "w-64"
    : player.layout === "vertical"
    ? "max-w-xs w-full"
    : "max-w-lg w-full";

  let containerCls = "rounded-xl overflow-hidden shadow-2xl p-5 ";
  switch (player.style) {
    case "dark":         containerCls += "bg-gray-900 text-white border border-gray-700"; break;
    case "glassmorphism":containerCls += "bg-white/10 backdrop-blur-xl border border-white/30 text-white"; break;
    case "neon":         containerCls += "bg-black border-2 text-white"; break;
    case "gradient":     containerCls += "text-white"; break;
    case "retro":        containerCls += "bg-amber-50 border-4 border-amber-700 text-amber-900"; break;
    case "broadcast":    containerCls += "bg-slate-900 border border-red-500/40 text-white"; break;
    case "wave":         containerCls += "text-white"; break;
    default:             containerCls += "bg-white border border-gray-200 text-gray-900"; break;
  }

  const gradStyle: React.CSSProperties = (player.style === "gradient" || player.style === "wave")
    ? { background: `linear-gradient(135deg, ${pc}, ${sc})` }
    : player.style === "neon"
    ? { borderColor: pc, boxShadow: `0 0 20px ${pc}40` }
    : {};

  const btnStyle: React.CSSProperties = {
    background: player.style === "neon" ? "transparent" : player.style === "retro" ? "#92400e" : pc,
    color: player.style === "retro" ? "white" : "white",
    border: player.style === "neon" ? `2px solid ${pc}` : "none",
    boxShadow: player.style === "neon" ? `0 0 10px ${pc}80` : "none",
  };

  const isVertical = player.layout === "vertical" || player.layout === "card";

  return (
    <div className={wrapCls}>
      <div className={containerCls} style={{ ...getContainerStyle(), ...gradStyle }}>
        {/* Header */}
        <div className={`flex ${isVertical ? "flex-col items-center text-center gap-3" : "items-center gap-4"} mb-4`}>
          {/* Logo / icon */}
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 shadow-lg"
            style={{ background: player.style === "neon" ? "transparent" : `${pc}30`, border: `1px solid ${pc}50` }}
          >
            {stream.logoUrl ? (
              <img src={stream.logoUrl} alt="" className="w-10 h-10 object-contain rounded" />
            ) : (
              <Radio size={22} style={{ color: player.style === "minimal" || player.style === "retro" ? pc : "currentColor" }} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-base leading-tight truncate">{name}</div>
            {desc && <div className="text-xs opacity-60 mt-0.5 truncate">{desc}</div>}
            {stream.genre && <div className="text-xs opacity-40 mt-0.5">{stream.genre}</div>}
          </div>
          {/* Live indicator */}
          {isPlaying && (
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span className="text-xs font-bold text-red-400">LIVE</span>
            </div>
          )}
        </div>

        {/* Now playing */}
        <div className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-lg ${player.style === "minimal" ? "bg-gray-100" : "bg-black/20"}`}>
          <Music size={12} className="opacity-50 shrink-0" />
          <span className="text-xs opacity-70 truncate">{song}</span>
        </div>

        {/* Controls */}
        <div className={`flex ${isVertical ? "flex-col items-center gap-3" : "items-center gap-3"}`}>
          <button
            onClick={onTogglePlay}
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 shrink-0"
            style={btnStyle}
          >
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
          </button>

          {player.showProgress && (
            <div className="flex-1 w-full">
              <div className="h-1.5 rounded-full opacity-30" style={{ background: player.style === "minimal" ? "#e5e7eb" : "white" }}>
                <div className="h-full rounded-full w-1/3" style={{ background: pc }} />
              </div>
            </div>
          )}

          {player.showVolume && (
            <div className="flex items-center gap-2 shrink-0">
              <Volume2 size={14} className="opacity-50" />
              <div className="w-16 h-1.5 rounded-full opacity-30" style={{ background: player.style === "minimal" ? "#e5e7eb" : "white" }}>
                <div className="h-full w-2/3 rounded-full" style={{ background: pc }} />
              </div>
            </div>
          )}
        </div>

        {/* Visualizer */}
        {player.showVisualizer && (
          <div className="flex items-end justify-center gap-px mt-4 h-8">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="w-1 rounded-full"
                style={{
                  height: isPlaying ? `${8 + (i % 5) * 6}px` : "3px",
                  background: pc,
                  opacity: 0.7,
                  animation: isPlaying ? `wave-bar ${0.4 + (i % 4) * 0.1}s ease-in-out infinite alternate` : "none",
                  transition: "height 0.3s",
                }}
              />
            ))}
          </div>
        )}
      </div>
      <style>{`
        @keyframes wave-bar {
          0% { height: 3px; }
          100% { height: 24px; }
        }
      `}</style>
    </div>
  );
}

// ─── Code Generators ──────────────────────────────────────────────────────────
function generateReactCode(stream: StreamConfig, player: PlayerConfig): string {
  return `// Reproductor de Radio - Generado por Icecast Control Hub
// Estilo: ${player.style} | Layout: ${player.layout}
import React, { useState, useRef } from 'react';

const STREAM_URL = "${stream.streamUrl || 'https://tu-servidor.com:8000/stream'}";

export const RadioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef(null);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      audio.src = '';
      setIsPlaying(false);
    } else {
      audio.src = STREAM_URL;
      audio.volume = volume;
      try { await audio.play(); setIsPlaying(true); }
      catch(e) { console.error('Error al reproducir:', e); }
    }
  };

  const handleVolume = (v) => {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  return (
    <div style={{
      fontFamily: '${player.fontFamily}, sans-serif',
      background: '${player.style === "gradient" ? `linear-gradient(135deg, ${player.primaryColor}, ${player.secondaryColor})` : player.style === "dark" ? "#111827" : "#ffffff"}',
      color: '${player.style === "minimal" ? "#111827" : "#ffffff"}',
      borderRadius: '12px',
      padding: '20px',
      maxWidth: '480px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
      border: '1px solid rgba(255,255,255,0.1)',
    }}>
      <audio ref={audioRef} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 10,
          background: '${player.primaryColor}30',
          border: '1px solid ${player.primaryColor}50',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22,
        }}>📻</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>${stream.radioName || "Mi Radio"}</div>
          ${stream.description ? `<div style={{ fontSize: 12, opacity: 0.6 }}>${stream.description}</div>` : ""}
        </div>
        {isPlaying && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, color: '#ef4444', fontSize: 12, fontWeight: 700 }}>
            <span>●</span> LIVE
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={toggle}
          style={{
            width: 48, height: 48, borderRadius: '50%',
            background: '${player.primaryColor}',
            border: 'none', color: 'white', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, boxShadow: '0 4px 12px ${player.primaryColor}50',
          }}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        ${player.showVolume ? `
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <span style={{ fontSize: 14, opacity: 0.6 }}>🔊</span>
          <input
            type="range" min="0" max="1" step="0.05"
            value={volume}
            onChange={(e) => handleVolume(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: '${player.primaryColor}' }}
          />
        </div>` : ""}
      </div>

      ${player.showProgress ? `
      <div style={{ marginTop: 12, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.2)', overflow: 'hidden' }}>
        <div style={{ width: isPlaying ? '40%' : '0%', height: '100%', background: '${player.primaryColor}', borderRadius: 2, transition: 'width 0.5s' }} />
      </div>` : ""}
    </div>
  );
};

export default RadioPlayer;`;
}

function generateHTMLCode(stream: StreamConfig, player: PlayerConfig): string {
  const pc = player.primaryColor || "#3b82f6";
  const bgColor = player.style === "dark" ? "#111827"
    : player.style === "neon" ? "#000000"
    : player.style === "gradient" ? "none"
    : "#ffffff";
  const textColor = player.style === "minimal" ? "#111827" : "#ffffff";
  const bgStyle = player.style === "gradient"
    ? `background: linear-gradient(135deg, ${pc}, ${player.secondaryColor || "#8b5cf6"});`
    : `background: ${bgColor};`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${stream.radioName || "Radio Player"}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #0f172a; font-family: '${player.fontFamily}', system-ui, sans-serif; }
    .player { ${bgStyle} color: ${textColor}; border-radius: 16px; padding: 24px; width: 420px; box-shadow: 0 25px 50px rgba(0,0,0,0.3); }
    .header { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
    .logo { width: 52px; height: 52px; border-radius: 10px; background: ${pc}30; border: 1px solid ${pc}50; display: flex; align-items: center; justify-content: center; font-size: 24px; }
    .station-name { font-size: 17px; font-weight: 700; }
    .station-desc { font-size: 12px; opacity: 0.6; margin-top: 2px; }
    .live-badge { margin-left: auto; color: #ef4444; font-size: 11px; font-weight: 700; display: none; align-items: center; gap: 4px; }
    .live-badge.active { display: flex; }
    .now-playing { background: rgba(0,0,0,0.2); border-radius: 8px; padding: 8px 12px; font-size: 12px; opacity: 0.7; margin-bottom: 16px; }
    .controls { display: flex; align-items: center; gap: 12px; }
    .play-btn { width: 52px; height: 52px; border-radius: 50%; background: ${pc}; border: none; color: white; cursor: pointer; font-size: 18px; box-shadow: 0 4px 15px ${pc}50; transition: transform 0.15s; flex-shrink: 0; }
    .play-btn:hover { transform: scale(1.08); }
    .volume-wrap { display: flex; align-items: center; gap: 8px; flex: 1; font-size: 14px; opacity: 0.7; }
    .volume-wrap input { flex: 1; accent-color: ${pc}; }
    .progress { margin-top: 14px; height: 4px; border-radius: 2px; background: rgba(255,255,255,0.2); overflow: hidden; }
    .progress-fill { height: 100%; background: ${pc}; border-radius: 2px; width: 0%; transition: width 0.5s; }
  </style>
</head>
<body>
  <div class="player">
    <div class="header">
      <div class="logo">📻</div>
      <div>
        <div class="station-name">${stream.radioName || "Mi Radio"}</div>
        ${stream.description ? `<div class="station-desc">${stream.description}</div>` : ""}
      </div>
      <div class="live-badge" id="liveBadge">● LIVE</div>
    </div>

    <div class="now-playing" id="nowPlaying">▬ Sin reproducir</div>

    <div class="controls">
      <button class="play-btn" id="playBtn" onclick="togglePlay()">▶</button>
      ${player.showVolume ? `
      <div class="volume-wrap">
        🔊 <input type="range" min="0" max="1" step="0.05" value="0.8" oninput="setVolume(this.value)">
      </div>` : ""}
    </div>

    ${player.showProgress ? `<div class="progress"><div class="progress-fill" id="progress"></div></div>` : ""}
  </div>

  <audio id="audio"></audio>

  <script>
    const STREAM_URL = "${stream.streamUrl || 'https://tu-servidor.com:8000/stream'}";
    const audio = document.getElementById('audio');
    let playing = false;

    function togglePlay() {
      const btn = document.getElementById('playBtn');
      const badge = document.getElementById('liveBadge');
      if (playing) {
        audio.pause();
        audio.src = '';
        btn.textContent = '▶';
        badge.classList.remove('active');
        ${player.showProgress ? "document.getElementById('progress').style.width = '0%';" : ""}
      } else {
        audio.src = STREAM_URL;
        audio.volume = 0.8;
        audio.play().then(() => {
          btn.textContent = '⏸';
          badge.classList.add('active');
          document.getElementById('nowPlaying').textContent = '♪ En vivo...';
        }).catch(e => { alert('No se pudo conectar al stream: ' + e.message); });
      }
      playing = !playing;
    }

    function setVolume(v) { audio.volume = parseFloat(v); }
  </script>
</body>
</html>`;
}

function generateEmbedCode(stream: StreamConfig, player: PlayerConfig): string {
  const url = stream.streamUrl || "https://tu-servidor.com:8000/stream";
  return `<!-- Reproductor ${stream.radioName || "Radio"} - Embed Code -->
<iframe
  src="https://tu-sitio.com/player?stream=${encodeURIComponent(url)}&name=${encodeURIComponent(stream.radioName || "Radio")}&color=${encodeURIComponent(player.primaryColor || "#3b82f6")}&style=${player.style}"
  width="420"
  height="120"
  frameborder="0"
  allow="autoplay"
  style="border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.2);"
  title="Radio Player - ${stream.radioName || "Mi Radio"}"
></iframe>

<!-- Alternativa: Script embebible -->
<div id="radio-player-${Date.now()}"></div>
<script>
  (function() {
    var config = {
      streamUrl: "${url}",
      radioName: "${stream.radioName || "Mi Radio"}",
      primaryColor: "${player.primaryColor || "#3b82f6"}",
      style: "${player.style}",
      containerId: "radio-player-${Date.now()}"
    };
    // Cargar reproductor desde CDN o servidor propio
    // Configura el stream URL arriba y hostea el HTML generado
    console.log('Configuración del reproductor:', config);
  })();
</script>`;
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────
function Section({ title, icon, children, collapsible = false }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; collapsible?: boolean;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        className={`w-full flex items-center justify-between px-5 py-4 ${collapsible ? "hover:bg-gray-50 transition-colors cursor-pointer" : "cursor-default"}`}
        onClick={() => collapsible && setOpen(!open)}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-blue-500">{icon}</span>
          <span className="font-semibold text-gray-800 text-sm">{title}</span>
        </div>
        {collapsible && (open ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />)}
      </button>
      {open && <div className="px-5 pb-5 border-t border-gray-100">{children}</div>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const AIRadioPlayerGenerator = () => {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [activeTab, setActiveTab] = useState<"config" | "preview" | "export">("config");
  const [styleFilter, setStyleFilter] = useState("all");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [currentSong, setCurrentSong] = useState("");
  const [exportTab, setExportTab] = useState<"react" | "html" | "embed">("react");
  const [copiedKey, setCopiedKey] = useState("");
  const [userMountpoints, setUserMountpoints] = useState<MountpointOption[]>([]);
  const [selectedMount, setSelectedMount] = useState("");
  const [isStreamer, setIsStreamer] = useState(false);

  const [stream, setStream] = useState<StreamConfig>({
    streamUrl: "",
    radioName: "",
    description: "",
    genre: "",
    logoUrl: "",
  });

  const [player, setPlayer] = useState<PlayerConfig>({
    style: "dark",
    layout: "horizontal",
    primaryColor: "#3b82f6",
    secondaryColor: "#8b5cf6",
    showVisualizer: true,
    showVolume: true,
    showProgress: true,
    fontFamily: "inter",
    bgImage: "",
  });

  // Load user data if streamer
  useEffect(() => {
    const role = localStorage.getItem("icecast_role");
    const userData = localStorage.getItem("icecast_user_data");
    if (role === "streamer" && userData) {
      setIsStreamer(true);
      try {
        const parsed = JSON.parse(userData);
        const mps: MountpointOption[] = (parsed.mountpoints || []).map((mp: any) => ({
          point: mp.point,
          name: mp.name,
          streamUrl: mp.encoderInfo ? `http://${mp.encoderInfo.host}:8000${mp.point}` : "",
        }));
        setUserMountpoints(mps);
        if (mps.length > 0) {
          setSelectedMount(mps[0].point);
          setStream(prev => ({
            ...prev,
            streamUrl: mps[0].streamUrl,
            radioName: mps[0].name,
          }));
        }
      } catch {}
    }
  }, []);

  // Handle mountpoint selection
  const handleMountSelect = (point: string) => {
    setSelectedMount(point);
    const mp = userMountpoints.find(m => m.point === point);
    if (mp) {
      setStream(prev => ({ ...prev, streamUrl: mp.streamUrl, radioName: mp.name }));
    }
  };

  // Audio toggle for preview
  const togglePreviewPlay = async () => {
    const audio = audioRef.current;
    if (!audio || !stream.streamUrl) {
      toast.error("Ingresa una URL de stream primero");
      return;
    }
    if (isPlaying) {
      audio.pause();
      audio.src = "";
      setIsPlaying(false);
    } else {
      audio.src = stream.streamUrl;
      audio.volume = 0.7;
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        toast.error("No se pudo conectar al stream. Verifica la URL.");
      }
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
    };
  }, []);

  const handleGenerate = () => {
    if (!stream.radioName.trim()) { toast.error("Ingresa el nombre de la radio"); return; }
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGenerated(true);
      setActiveTab("preview");
      toast.success("¡Reproductor generado!");
    }, 1500);
  };

  const copyCode = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Código copiado");
    setTimeout(() => setCopiedKey(""), 2000);
  };

  const downloadFile = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Descargado: ${filename}`);
  };

  const filteredStyles = styleFilter === "all" ? STYLES : STYLES.filter(s => s.cat === styleFilter);

  const setS = (k: keyof StreamConfig, v: string) => setStream(prev => ({ ...prev, [k]: v }));
  const setP = (k: keyof PlayerConfig, v: any) => setPlayer(prev => ({ ...prev, [k]: v }));

  const reactCode = generateReactCode(stream, player);
  const htmlCode = generateHTMLCode(stream, player);
  const embedCode = generateEmbedCode(stream, player);

  const tabClass = (t: string) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-md">
              <Wand2 size={17} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm">Generador de Reproductores</div>
              <div className="text-xs text-gray-400">Crea reproductores personalizados para tu radio</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isStreamer && (
              <button
                onClick={() => navigate("/my-station")}
                className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-2 transition-all hover:border-gray-300"
              >
                <Radio size={13} /> Mi Estación
              </button>
            )}
            {!isStreamer && (
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-2 transition-all"
              >
                <Settings size={13} /> Dashboard
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-3 flex items-center gap-1.5">
          <button className={tabClass("config")} onClick={() => setActiveTab("config")}>
            <span className="flex items-center gap-1.5"><Settings size={13} /> Configurar</span>
          </button>
          <button className={tabClass("preview")} onClick={() => setActiveTab("preview")}>
            <span className="flex items-center gap-1.5"><Eye size={13} /> Vista Previa</span>
          </button>
          <button
            className={tabClass("export") + (!generated ? " opacity-40 cursor-not-allowed" : "")}
            onClick={() => generated && setActiveTab("export")}
          >
            <span className="flex items-center gap-1.5"><Download size={13} /> Exportar</span>
          </button>
          {!generated && (
            <span className="text-xs text-gray-400 ml-2">← Genera primero tu reproductor</span>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* ── CONFIG TAB ───────────────────────────────────────────────────── */}
        {activeTab === "config" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-4">

              {/* Stream Source */}
              <Section title="Fuente del Stream" icon={<Wifi size={16} />}>
                <div className="space-y-4 pt-4">
                  {/* Streamer: mountpoint selector */}
                  {isStreamer && userMountpoints.length > 0 && (
                    <div>
                      <label className="text-xs font-medium text-gray-600 uppercase tracking-wider block mb-2">
                        Tu estación
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {userMountpoints.map(mp => (
                          <button
                            key={mp.point}
                            onClick={() => handleMountSelect(mp.point)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                              selectedMount === mp.point
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50/50"
                            }`}
                          >
                            <Radio size={14} />
                            {mp.name}
                            <span className="text-xs opacity-50 font-normal">{mp.point}</span>
                          </button>
                        ))}
                      </div>
                      <div className="mt-3 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100 flex items-start gap-2">
                        <Info size={13} className="text-blue-400 mt-0.5 shrink-0" />
                        <span className="text-xs text-blue-600">URL cargada automáticamente desde tu mountpoint</span>
                      </div>
                    </div>
                  )}

                  {/* Manual URL */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wider block mb-1.5">
                      URL del Stream {isStreamer ? "(o ingresar manualmente)" : "*"}
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Link size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          value={stream.streamUrl}
                          onChange={e => setS("streamUrl", e.target.value)}
                          placeholder="http://servidor.com:8000/stream"
                          className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white transition-all"
                        />
                      </div>
                      <button
                        onClick={togglePreviewPlay}
                        disabled={!stream.streamUrl}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                          isPlaying
                            ? "bg-red-100 text-red-600 border border-red-200 hover:bg-red-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 disabled:opacity-40"
                        }`}
                      >
                        {isPlaying ? <><WifiOff size={14} /> Detener</> : <><Wifi size={14} /> Probar</>}
                      </button>
                    </div>
                    {isPlaying && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-green-600">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                        </span>
                        Conectado al stream · Escuchando en vivo
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 uppercase tracking-wider block mb-1.5">Nombre de la Radio *</label>
                      <input
                        value={stream.radioName}
                        onChange={e => setS("radioName", e.target.value)}
                        placeholder="La Clásica FM"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 uppercase tracking-wider block mb-1.5">Género</label>
                      <input
                        value={stream.genre}
                        onChange={e => setS("genre", e.target.value)}
                        placeholder="Pop, Rock, Clásica..."
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white transition-all"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-gray-600 uppercase tracking-wider block mb-1.5">Descripción</label>
                      <input
                        value={stream.description}
                        onChange={e => setS("description", e.target.value)}
                        placeholder="Música las 24 horas del día"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white transition-all"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-gray-600 uppercase tracking-wider block mb-1.5">URL del Logo (opcional)</label>
                      <input
                        value={stream.logoUrl}
                        onChange={e => setS("logoUrl", e.target.value)}
                        placeholder="https://tu-sitio.com/logo.png"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>
              </Section>

              {/* Style Selection */}
              <Section title="Estilo del Reproductor" icon={<Palette size={16} />}>
                <div className="pt-4 space-y-4">
                  {/* Filter pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {["all", "basic", "premium", "themed"].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setStyleFilter(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          styleFilter === cat
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {cat === "all" ? "Todos" : cat === "basic" ? "Básicos" : cat === "premium" ? "Premium" : "Temáticos"}
                      </button>
                    ))}
                  </div>

                  {/* Style grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                    {filteredStyles.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setP("style", s.id)}
                        className={`relative h-20 rounded-xl border-2 overflow-hidden transition-all text-xs font-semibold ${s.preview} ${
                          player.style === s.id
                            ? "border-blue-500 ring-2 ring-blue-500/30 scale-105"
                            : "border-transparent hover:scale-102 hover:border-gray-300"
                        }`}
                      >
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/10">
                          <span className="font-bold">{s.name}</span>
                          <span className="text-xs opacity-70 font-normal">{s.desc}</span>
                        </div>
                        {player.style === s.id && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check size={10} className="text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </Section>

              {/* Layout & Options */}
              <Section title="Diseño y Funciones" icon={<LayoutTemplate size={16} />} collapsible>
                <div className="pt-4 space-y-4">
                  {/* Layout */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wider block mb-2">Layout</label>
                    <div className="grid grid-cols-4 gap-2">
                      {LAYOUTS.map(l => (
                        <button
                          key={l.id}
                          onClick={() => setP("layout", l.id)}
                          className={`px-3 py-2.5 rounded-xl border text-xs font-medium transition-all text-center ${
                            player.layout === l.id
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 text-gray-500 hover:border-gray-300"
                          }`}
                        >
                          <div className="font-semibold">{l.name}</div>
                          <div className="text-gray-400 text-xs mt-0.5 font-normal hidden sm:block">{l.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Colors */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-600 uppercase tracking-wider block mb-1.5">Color Primario</label>
                      <div className="flex gap-2">
                        <input type="color" value={player.primaryColor} onChange={e => setP("primaryColor", e.target.value)}
                          className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-white" />
                        <input value={player.primaryColor} onChange={e => setP("primaryColor", e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-blue-400 bg-white" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 uppercase tracking-wider block mb-1.5">Color Secundario</label>
                      <div className="flex gap-2">
                        <input type="color" value={player.secondaryColor} onChange={e => setP("secondaryColor", e.target.value)}
                          className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-white" />
                        <input value={player.secondaryColor} onChange={e => setP("secondaryColor", e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-blue-400 bg-white" />
                      </div>
                    </div>
                  </div>

                  {/* Font */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wider block mb-2">Tipografía</label>
                    <div className="grid grid-cols-4 gap-2">
                      {FONTS.map(f => (
                        <button
                          key={f.id}
                          onClick={() => setP("fontFamily", f.id)}
                          className={`py-2.5 rounded-xl border text-xs transition-all ${
                            player.fontFamily === f.id
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 text-gray-500 hover:border-gray-300"
                          }`}
                        >
                          {f.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { key: "showVisualizer", label: "Visualizador" },
                      { key: "showVolume", label: "Control de Volumen" },
                      { key: "showProgress", label: "Barra de Progreso" },
                    ].map(opt => (
                      <label
                        key={opt.key}
                        className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-xs font-medium text-gray-700">{opt.label}</span>
                        <div
                          onClick={() => setP(opt.key as keyof PlayerConfig, !(player as any)[opt.key])}
                          className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${(player as any)[opt.key] ? "bg-blue-500" : "bg-gray-300"}`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${(player as any)[opt.key] ? "translate-x-4" : "translate-x-0.5"}`} />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </Section>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white rounded-2xl font-semibold text-base shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <><Loader2 size={20} className="animate-spin" /> Generando reproductor...</>
                ) : (
                  <><Wand2 size={20} /> Generar Reproductor</>
                )}
              </button>
            </div>

            {/* Live preview sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-36">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye size={14} className="text-blue-500" />
                    <span className="font-semibold text-gray-800 text-sm">Vista Previa</span>
                  </div>
                  <span className="text-xs text-gray-400">Tiempo real</span>
                </div>
                <div className="p-6 flex justify-center items-center min-h-64 bg-gradient-to-br from-gray-100 to-gray-200">
                  <LivePreview
                    stream={stream}
                    player={player}
                    isPlaying={isPlaying}
                    onTogglePlay={togglePreviewPlay}
                    currentSong={currentSong}
                  />
                </div>
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                  <p className="text-xs text-gray-400 text-center">Los cambios se reflejan instantáneamente</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PREVIEW TAB ──────────────────────────────────────────────────── */}
        {activeTab === "preview" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor size={16} className="text-blue-500" />
                  <span className="font-semibold text-gray-800">Reproductor Generado</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab("config")}
                    className="text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-gray-300 transition-all flex items-center gap-1.5"
                  >
                    <Settings size={12} /> Editar
                  </button>
                  <button
                    onClick={() => setActiveTab("export")}
                    className="text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-1.5 transition-all flex items-center gap-1.5"
                  >
                    <Download size={12} /> Exportar
                  </button>
                </div>
              </div>

              {/* Preview on different backgrounds */}
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                {[
                  { bg: "bg-white", label: "Fondo blanco" },
                  { bg: "bg-gray-800", label: "Fondo oscuro" },
                  { bg: "bg-gradient-to-br from-blue-400 to-violet-500", label: "Fondo colorido" },
                ].map(({ bg, label }) => (
                  <div key={label} className={`${bg} p-8 flex flex-col items-center gap-4`}>
                    <LivePreview
                      stream={stream}
                      player={player}
                      isPlaying={isPlaying}
                      onTogglePlay={togglePreviewPlay}
                      currentSong={currentSong}
                    />
                    <span className="text-xs opacity-50 text-white mix-blend-difference">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Config summary */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Resumen de configuración</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Estilo", value: STYLES.find(s => s.id === player.style)?.name || player.style },
                  { label: "Layout", value: LAYOUTS.find(l => l.id === player.layout)?.name || player.layout },
                  { label: "Fuente", value: player.fontFamily },
                  { label: "Stream", value: stream.streamUrl ? "Configurado" : "Sin configurar" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="text-xs text-gray-400">{label}</div>
                    <div className="text-sm font-semibold text-gray-800 mt-0.5 truncate">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── EXPORT TAB ───────────────────────────────────────────────────── */}
        {activeTab === "export" && (
          <div className="space-y-4">
            {/* Export type selector */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Formato de exportación</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: "react" as const,
                    icon: <FileCode size={22} />,
                    title: "Componente React",
                    desc: "Archivo .jsx listo para proyectos React/Next.js",
                    badge: "Recomendado",
                    color: "blue",
                  },
                  {
                    id: "html" as const,
                    icon: <Globe size={22} />,
                    title: "HTML Standalone",
                    desc: "Página HTML completa, funciona sin frameworks",
                    badge: "Universal",
                    color: "orange",
                  },
                  {
                    id: "embed" as const,
                    icon: <Layers size={22} />,
                    title: "Embed / iFrame",
                    desc: "Código para insertar en cualquier sitio web",
                    badge: "Fácil",
                    color: "violet",
                  },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setExportTab(opt.id)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      exportTab === opt.id
                        ? `border-${opt.color}-500 bg-${opt.color}-50`
                        : "border-gray-100 hover:border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className={`mb-2 ${exportTab === opt.id ? `text-${opt.color}-500` : "text-gray-400"}`}>{opt.icon}</div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-800 text-sm">{opt.title}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${
                        opt.color === "blue" ? "bg-blue-100 text-blue-600"
                        : opt.color === "orange" ? "bg-orange-100 text-orange-600"
                        : "bg-violet-100 text-violet-600"
                      }`}>{opt.badge}</span>
                    </div>
                    <p className="text-xs text-gray-400">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Code block */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-2">
                  <Code size={15} className="text-gray-500" />
                  <span className="font-semibold text-gray-700 text-sm">
                    {exportTab === "react" ? "RadioPlayer.jsx" : exportTab === "html" ? "player.html" : "embed.html"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyCode(exportTab, exportTab === "react" ? reactCode : exportTab === "html" ? htmlCode : embedCode)}
                    className="flex items-center gap-1.5 text-xs bg-white border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800 rounded-lg px-3 py-1.5 transition-all"
                  >
                    {copiedKey === exportTab ? <><Check size={12} className="text-green-500" /> Copiado</> : <><Copy size={12} /> Copiar</>}
                  </button>
                  <button
                    onClick={() => {
                      if (exportTab === "react") downloadFile(`${stream.radioName.replace(/\s+/g, "") || "RadioPlayer"}.jsx`, reactCode, "text/javascript");
                      else if (exportTab === "html") downloadFile(`${stream.radioName.replace(/\s+/g, "") || "player"}.html`, htmlCode, "text/html");
                      else downloadFile("embed.html", embedCode, "text/html");
                    }}
                    className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-1.5 transition-all"
                  >
                    <Download size={12} /> Descargar
                  </button>
                </div>
              </div>
              <div className="relative">
                <pre className="p-5 text-xs font-mono text-gray-700 bg-gray-950 text-gray-200 overflow-x-auto max-h-[500px] leading-relaxed">
                  <code>{exportTab === "react" ? reactCode : exportTab === "html" ? htmlCode : embedCode}</code>
                </pre>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={15} className="text-amber-500" />
                <span className="font-semibold text-gray-800 text-sm">Instrucciones de instalación</span>
              </div>
              {exportTab === "react" && (
                <ol className="space-y-2.5">
                  {[
                    "Descarga el archivo RadioPlayer.jsx usando el botón de arriba",
                    "Cópialo a la carpeta src/components/ de tu proyecto React",
                    `Importa y usa: <RadioPlayer streamUrl="${stream.streamUrl || 'tu-stream-url'}" />`,
                    "Asegúrate de tener lucide-react instalado: npm install lucide-react",
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-600">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              )}
              {exportTab === "html" && (
                <ol className="space-y-2.5">
                  {[
                    "Descarga el archivo player.html",
                    "Ábrelo directamente en un navegador para probarlo",
                    "Sube el archivo a tu servidor web o hosting",
                    "La URL del stream ya está configurada dentro del archivo",
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-600">
                      <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              )}
              {exportTab === "embed" && (
                <ol className="space-y-2.5">
                  {[
                    "Copia el código del iframe de arriba",
                    "Pégalo en el HTML de tu sitio web donde quieras mostrar el reproductor",
                    "Ajusta width y height según tu diseño",
                    "Nota: necesitas hostear el HTML generado para que el iframe funcione",
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-600">
                      <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIRadioPlayerGenerator;
