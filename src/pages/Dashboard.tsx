import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, Radio, Inbox, Clock, CheckCircle, XCircle, TrendingUp, Wifi, RefreshCw, ArrowRight, LogOut } from "lucide-react";
import { toast } from "sonner";

const API = import.meta.env.VITE_API_BASE_URL;

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState<any>(null);
  const [serverStats, setServerStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [mountpoints, setMountpoints] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const auth = localStorage.getItem("icecast_auth");
  const headers = { Authorization: `Basic ${auth}` };

  const load = async () => {
    setLoading(true);
    try {
      const [statusRes, statsRes, usersRes, mountsRes, reqRes] = await Promise.allSettled([
        fetch(`${API}/server-status`, { headers }),
        fetch(`${API}/servers/local/stats`, { headers }),
        fetch(`${API}/users`, { headers }),
        fetch(`${API}/servers/local/mountpoints`, { headers }),
        fetch(`${API}/service-requests`, { headers }),
      ]);
      if (statusRes.status === "fulfilled") setServerStatus(await statusRes.value.json());
      if (statsRes.status === "fulfilled") { const d = await statsRes.value.json(); setServerStats(d.success ? d.data : null); }
      if (usersRes.status === "fulfilled") { const d = await usersRes.value.json(); setUsers(Array.isArray(d) ? d : (d.data || [])); }
      if (mountsRes.status === "fulfilled") { const d = await mountsRes.value.json(); setMountpoints(d.success ? (d.data || []) : []); }
      if (reqRes.status === "fulfilled") { const d = await reqRes.value.json(); setRequests(d.success ? (d.data || []) : []); }
    } catch { toast.error("Error al cargar datos"); }
    setLoading(false);
    setLastRefresh(new Date());
  };

  useEffect(() => { load(); }, []);

  const handleLogout = () => {
    localStorage.removeItem("icecast_auth");
    localStorage.removeItem("icecast_user");
    localStorage.removeItem("icecast_role");
    toast.success("Sesión cerrada");
    navigate("/");
  };

  const activeUsers = users.filter(u => u.active !== false).length;
  const activeMounts = mountpoints.filter(mp => mp.status === "active").length;
  const totalListeners = mountpoints.reduce((s, mp) => s + (mp.listeners?.current || 0), 0);
  const pendingRequests = requests.filter(r => r.status === "pending" || r.status === "pending_payment").length;
  const approvedRequests = requests.filter(r => r.status === "approved").length;
  const rejectedRequests = requests.filter(r => r.status === "rejected").length;
  const isOnline = serverStatus?.status === "running";

  const StatCard = ({ icon, label, value, sub, color, to }: any) => (
    <Link to={to || "#"} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-all group">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-black text-gray-900">{loading ? "—" : value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      {to && <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-all mt-1 shrink-0" />}
    </Link>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Última actualización: {lastRefresh.toLocaleTimeString("es-CR")}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-all">
            <RefreshCw size={14} /> Actualizar
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-all">
            <LogOut size={14} /> Salir
          </button>
        </div>
      </div>

      <div className={`rounded-2xl p-4 flex items-center gap-3 ${isOnline ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
        <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
        <span className={`text-sm font-semibold ${isOnline ? "text-green-700" : "text-red-700"}`}>
          Servidor Icecast {isOnline ? "en línea" : "fuera de línea"} · Puerto {serverStatus?.port || 8000}
        </span>
        {serverStats?.uptime && (
          <span className="text-xs text-green-500 ml-auto">Uptime: {Math.floor(serverStats.uptime / 3600)}h {Math.floor((serverStats.uptime % 3600) / 60)}m</span>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Wifi size={20} className="text-white" />} label="Oyentes activos" value={totalListeners} sub={`en ${activeMounts} stream${activeMounts !== 1 ? "s" : ""} activo${activeMounts !== 1 ? "s" : ""}`} color="bg-blue-500" />
        <StatCard icon={<Radio size={20} className="text-white" />} label="Mountpoints" value={`${activeMounts}/${mountpoints.length}`} sub="activos / total" color="bg-violet-500" to="/mountpoints" />
        <StatCard icon={<Users size={20} className="text-white" />} label="Usuarios" value={activeUsers} sub={`${users.length} registrados`} color="bg-emerald-500" to="/users" />
        <StatCard icon={<Inbox size={20} className="text-white" />} label="Solicitudes pendientes" value={pendingRequests} sub={pendingRequests > 0 ? "requieren atención" : "al día"} color={pendingRequests > 0 ? "bg-orange-500" : "bg-gray-400"} to="/service-requests" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Solicitudes</h2>
            <Link to="/service-requests" className="text-xs text-blue-500 hover:underline">Ver todas</Link>
          </div>
          <div className="space-y-3">
            {[
              { icon: <Clock size={15} className="text-orange-500" />, label: "Pendientes", value: pendingRequests, cls: "bg-orange-50", tcls: "text-orange-700", vcls: "text-orange-600" },
              { icon: <CheckCircle size={15} className="text-green-500" />, label: "Aprobadas", value: approvedRequests, cls: "bg-green-50", tcls: "text-green-700", vcls: "text-green-600" },
              { icon: <XCircle size={15} className="text-red-400" />, label: "Rechazadas", value: rejectedRequests, cls: "bg-red-50", tcls: "text-red-600", vcls: "text-red-500" },
              { icon: <TrendingUp size={15} className="text-gray-400" />, label: "Total", value: requests.length, cls: "bg-gray-50", tcls: "text-gray-600", vcls: "text-gray-700" },
            ].map(({ icon, label, value, cls, tcls, vcls }) => (
              <div key={label} className={`flex items-center justify-between p-3 ${cls} rounded-xl`}>
                <div className="flex items-center gap-2">{icon}<span className={`text-sm font-medium ${tcls}`}>{label}</span></div>
                <span className={`text-lg font-black ${vcls}`}>{loading ? "—" : value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Streams</h2>
            <Link to="/mountpoints" className="text-xs text-blue-500 hover:underline">Gestionar</Link>
          </div>
          {loading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          ) : mountpoints.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Radio size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No hay mountpoints</p>
              <Link to="/mountpoints/new" className="text-xs text-blue-500 hover:underline mt-1 block">Crear uno</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {mountpoints.slice(0, 5).map((mp: any) => (
                <div key={mp.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${mp.status === "active" ? "bg-green-400" : "bg-gray-300"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{mp.name || mp.point}</p>
                    <p className="text-xs text-gray-400">{mp.point}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 shrink-0">
                    <Users size={11} />{mp.listeners?.current || 0}
                  </div>
                </div>
              ))}
              {mountpoints.length > 5 && <p className="text-xs text-center text-gray-400 pt-1">+{mountpoints.length - 5} más</p>}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Servidor</h2>
            <Link to="/server-control" className="text-xs text-blue-500 hover:underline">Control</Link>
          </div>
          <div className="space-y-3">
            {[
              { label: "Estado", value: isOnline ? "🟢 En línea" : "🔴 Fuera de línea" },
              { label: "Puerto Icecast", value: serverStatus?.port || 8000 },
              { label: "CPU", value: serverStats?.cpu ? `${serverStats.cpu}%` : "N/A" },
              { label: "Memoria", value: serverStats?.memory ? `${Math.round(serverStats.memory / 1024 / 1024)} MB` : "N/A" },
              { label: "Ancho de banda", value: serverStats?.bandwidth?.outgoing ? `${(serverStats.bandwidth.outgoing / 1024).toFixed(1)} KB/s` : "N/A" },
              { label: "Conexiones", value: serverStats?.connections?.current ?? "N/A" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{label}</span>
                <span className="text-sm font-semibold text-gray-800">{String(value)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-1">
            <Link to="/configuration" className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-all text-sm text-gray-600 font-medium">
              <span>⚙️ Configuración</span><ArrowRight size={13} className="text-gray-300" />
            </Link>
            <Link to="/logs" className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-all text-sm text-gray-600 font-medium">
              <span>📋 Ver Logs</span><ArrowRight size={13} className="text-gray-300" />
            </Link>
          </div>
        </div>
      </div>

      {requests.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Solicitudes Recientes</h2>
            <Link to="/service-requests" className="text-xs text-blue-500 hover:underline flex items-center gap-1">Ver todas <ArrowRight size={11} /></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  {["Cliente","Radio","Plan","Pago","Estado","Fecha"].map(h => <th key={h} className="text-left pb-3 font-semibold">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {requests.slice(0, 5).map((r: any) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-medium text-gray-900">{r.name}<span className="text-gray-400 font-normal ml-1 text-xs">@{r.username}</span></td>
                    <td className="py-3 text-gray-600">{r.radioName}</td>
                    <td className="py-3 text-gray-600">{r.plan}</td>
                    <td className="py-3 text-gray-500 text-xs">{r.paymentMethod || "—"}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${r.status === "approved" ? "bg-green-100 text-green-700" : r.status === "rejected" ? "bg-red-100 text-red-600" : r.status === "pending_payment" ? "bg-orange-100 text-orange-600" : "bg-yellow-100 text-yellow-700"}`}>
                        {r.status === "approved" ? "Aprobada" : r.status === "rejected" ? "Rechazada" : r.status === "pending_payment" ? "Pago Pendiente" : "Pendiente"}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-gray-400">{new Date(r.createdAt || r.submittedAt || "").toLocaleDateString("es-CR", { day: "2-digit", month: "short" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
