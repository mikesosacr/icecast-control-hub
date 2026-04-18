import { useState, useEffect } from "react";
import { useServerControl } from "@/hooks/useIcecastApi";
import { toast } from "sonner";
import { Server, RefreshCw, Play, Square, RotateCcw, Cpu, HardDrive, MemoryStick, Wifi, Clock, Monitor, AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE_URL;

const fmt = (bytes: number) => {
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + " GB";
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(0) + " MB";
  return (bytes / 1024).toFixed(0) + " KB";
};

const fmtUptime = (s: number) => {
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  return [d > 0 && `${d}d`, h > 0 && `${h}h`, `${m}m`].filter(Boolean).join(" ");
};

const ProgressBar = ({ value, color = "bg-blue-500" }: { value: number; color?: string }) => (
  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
    <div className={`h-full rounded-full transition-all ${color} ${value > 85 ? "bg-red-500" : value > 65 ? "bg-orange-400" : color}`}
      style={{ width: `${Math.min(value, 100)}%` }} />
  </div>
);

const ServerControl = () => {
  const { startServer, stopServer, restartServer, isStarting, isStopping, isRestarting } = useServerControl();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const auth = localStorage.getItem("icecast_auth");
  const headers = { Authorization: `Basic ${auth}` };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/servers/local/stats`, { headers });
      const d = await res.json();
      setStats(d.success ? d.data : d);
    } catch { toast.error("Error al cargar stats"); }
    setLoading(false);
    setLastUpdate(new Date());
  };

  useEffect(() => { load(); }, []);

  const isOnline = !!stats;
  const memPct = stats?.memoryPct || 0;
  const diskPct = stats?.disk?.pct || 0;
  const cpuPct = stats?.cpu || 0;

  const handleAction = async (action: "start" | "stop" | "restart") => {
    if (action === "start") startServer("local");
    else if (action === "stop") stopServer("local");
    else restartServer("local");
    setTimeout(load, 3000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
            <Server size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Control del Servidor</h1>
            <p className="text-sm text-gray-400">Actualizado: {lastUpdate.toLocaleTimeString("es-CR")}</p>
          </div>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-all">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Actualizar
        </button>
      </div>

      {/* Status banner */}
      <div className={`rounded-2xl p-4 flex items-center gap-3 ${isOnline ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
        <div className={`w-3 h-3 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
        <div className="flex-1">
          <span className={`text-sm font-bold ${isOnline ? "text-green-700" : "text-red-700"}`}>
            Icecast {isOnline ? "en línea" : "fuera de línea"}
          </span>
          {stats?.hostname && <span className="text-xs text-gray-500 ml-2">· {stats.hostname} · {stats.platform}/{stats.arch}</span>}
        </div>
        {stats?.uptime && <span className="text-xs text-green-600 font-medium">⏱ {fmtUptime(stats.uptime)}</span>}
      </div>

      {/* Controles Icecast */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-900 mb-4">Control de Icecast</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button onClick={() => handleAction("start")} disabled={isStarting || isOnline}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-50 text-green-700 font-bold text-sm border border-green-200 hover:bg-green-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            <Play size={16} /> {isStarting ? "Iniciando..." : "Iniciar"}
          </button>
          <button onClick={() => handleAction("restart")} disabled={isRestarting || !isOnline}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm border border-blue-200 hover:bg-blue-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            <RotateCcw size={16} className={isRestarting ? "animate-spin" : ""} /> {isRestarting ? "Reiniciando..." : "Reiniciar"}
          </button>
          <button onClick={() => handleAction("stop")} disabled={isStopping || !isOnline}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-700 font-bold text-sm border border-red-200 hover:bg-red-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            <Square size={16} /> {isStopping ? "Deteniendo..." : "Detener"}
          </button>
        </div>
      </div>

      {/* VPS Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CPU */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Cpu size={18} className="text-blue-500" />
            <h2 className="font-bold text-gray-900">CPU</h2>
          </div>
          {loading ? <div className="h-20 bg-gray-100 rounded-xl animate-pulse" /> : (
            <div className="space-y-3">
              <div className="flex items-end justify-between">
                <span className="text-4xl font-black text-gray-900">{cpuPct}%</span>
                <span className={`text-sm font-bold ${cpuPct > 85 ? "text-red-500" : cpuPct > 65 ? "text-orange-500" : "text-green-500"}`}>
                  {cpuPct > 85 ? "⚠️ Alto" : cpuPct > 65 ? "Moderado" : "✓ Normal"}
                </span>
              </div>
              <ProgressBar value={cpuPct} color="bg-blue-500" />
              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Núcleos</span><span className="font-semibold">{stats?.cpuCores || "N/A"}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Load avg (1m)</span><span className="font-semibold">{stats?.loadAvg?.[0]?.toFixed(2) || "N/A"}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Load avg (5m)</span><span className="font-semibold">{stats?.loadAvg?.[1]?.toFixed(2) || "N/A"}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Load avg (15m)</span><span className="font-semibold">{stats?.loadAvg?.[2]?.toFixed(2) || "N/A"}</span>
                </div>
                {stats?.cpuModel && <p className="text-xs text-gray-400 pt-1 truncate">{stats.cpuModel}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Memoria */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <MemoryStick size={18} className="text-violet-500" />
            <h2 className="font-bold text-gray-900">Memoria RAM</h2>
          </div>
          {loading ? <div className="h-20 bg-gray-100 rounded-xl animate-pulse" /> : (
            <div className="space-y-3">
              <div className="flex items-end justify-between">
                <span className="text-4xl font-black text-gray-900">{memPct}%</span>
                <span className={`text-sm font-bold ${memPct > 85 ? "text-red-500" : memPct > 65 ? "text-orange-500" : "text-green-500"}`}>
                  {memPct > 85 ? "⚠️ Crítico" : memPct > 65 ? "Moderado" : "✓ Normal"}
                </span>
              </div>
              <ProgressBar value={memPct} color="bg-violet-500" />
              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Usado</span><span className="font-semibold">{fmt(stats?.memory || 0)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Libre</span><span className="font-semibold">{fmt(stats?.memoryFree || 0)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Total</span><span className="font-semibold">{fmt(stats?.memoryTotal || 0)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Disco */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <HardDrive size={18} className="text-emerald-500" />
            <h2 className="font-bold text-gray-900">Disco</h2>
          </div>
          {loading ? <div className="h-20 bg-gray-100 rounded-xl animate-pulse" /> : (
            <div className="space-y-3">
              <div className="flex items-end justify-between">
                <span className="text-4xl font-black text-gray-900">{diskPct}%</span>
                <span className={`text-sm font-bold ${diskPct > 85 ? "text-red-500" : diskPct > 65 ? "text-orange-500" : "text-green-500"}`}>
                  {diskPct > 85 ? "⚠️ Lleno" : diskPct > 65 ? "Moderado" : "✓ Normal"}
                </span>
              </div>
              <ProgressBar value={diskPct} color="bg-emerald-500" />
              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Usado</span><span className="font-semibold">{fmt(stats?.disk?.used || 0)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Libre</span><span className="font-semibold">{fmt((stats?.disk?.total || 0) - (stats?.disk?.used || 0))}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Total</span><span className="font-semibold">{fmt(stats?.disk?.total || 0)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info del sistema + Icecast stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sistema */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Monitor size={18} className="text-gray-500" />
            <h2 className="font-bold text-gray-900">Información del Sistema</h2>
          </div>
          {loading ? <div className="h-32 bg-gray-100 rounded-xl animate-pulse" /> : (
            <div className="space-y-2">
              {[
                { label: "Hostname", value: stats?.hostname || "N/A" },
                { label: "Plataforma", value: `${stats?.platform || "N/A"} (${stats?.arch || "N/A"})` },
                { label: "Kernel", value: stats?.osRelease || "N/A" },
                { label: "Uptime del VPS", value: fmtUptime(stats?.uptime || 0) },
                { label: "CPUs", value: `${stats?.cpuCores || "N/A"} núcleos` },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-400">{label}</span>
                  <span className="text-sm font-semibold text-gray-800 truncate max-w-48">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Icecast stats */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Wifi size={18} className="text-blue-500" />
            <h2 className="font-bold text-gray-900">Estadísticas Icecast</h2>
          </div>
          {loading ? <div className="h-32 bg-gray-100 rounded-xl animate-pulse" /> : (
            <div className="space-y-2">
              {[
                { label: "Versión", value: stats?.version || "N/A" },
                { label: "Oyentes actuales", value: stats?.listeners?.current ?? "N/A" },
                { label: "Pico de oyentes", value: stats?.listeners?.peak ?? "N/A" },
                { label: "Ancho de banda salida", value: `${stats?.bandwidth?.outgoing || 0} kbps` },
                { label: "Mountpoints activos", value: stats?.mountpoints?.length || 0 },
                { label: "Inicio del servidor", value: stats?.serverStart ? new Date(stats.serverStart).toLocaleString("es-CR") : "N/A" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-400">{label}</span>
                  <span className="text-sm font-semibold text-gray-800">{String(value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mountpoints activos */}
      {stats?.mountpoints?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Streams Activos</h2>
            <Link to="/mountpoints" className="text-xs text-blue-500 hover:underline">Gestionar</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.mountpoints.map((mp: any) => (
              <div key={mp.mount} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm font-bold text-gray-900 truncate">{mp.name || mp.mount}</span>
                </div>
                <p className="text-xs text-gray-400 mb-2 font-mono">{mp.mount}</p>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <span className="text-gray-400">Oyentes</span><span className="font-semibold text-gray-700">{mp.listeners?.current || 0}</span>
                  <span className="text-gray-400">Pico</span><span className="font-semibold text-gray-700">{mp.listeners?.peak || 0}</span>
                  <span className="text-gray-400">Bitrate</span><span className="font-semibold text-gray-700">{mp.bitrate} kbps</span>
                  <span className="text-gray-400">Formato</span><span className="font-semibold text-gray-700 truncate">{mp.contentType?.split("/")[1] || "N/A"}</span>
                </div>
                {mp.currentSong && <p className="text-xs text-blue-500 mt-2 truncate">♪ {mp.currentSong}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accesos rápidos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Ver Logs", icon: "📋", to: "/logs" },
          { label: "Configuración", icon: "⚙️", to: "/configuration" },
          { label: "Mountpoints", icon: "📡", to: "/mountpoints" },
          { label: "Estadísticas", icon: "📊", to: "/statistics" },
        ].map(({ label, icon, to }) => (
          <Link key={label} to={to} className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-sm font-medium text-gray-700">
            <span>{icon}</span>{label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ServerControl;
