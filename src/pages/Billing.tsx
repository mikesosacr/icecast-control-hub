import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DollarSign, AlertTriangle, CheckCircle, XCircle, RefreshCw, Calendar, TrendingUp, Users, Edit2, RotateCcw } from "lucide-react";

const API = import.meta.env.VITE_API_BASE_URL;

interface BillingRecord {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  plan: string;
  planPrice: string;
  planPeriod: string;
  active: boolean;
  createdAt: string;
  expiresAt: string | null;
  daysLeft: number | null;
  status: "active" | "expiring_soon" | "expired" | "no_expiry";
  paymentMethod: string;
  paymentRef: string;
  approvedAt: string;
}

interface BillingStats {
  totalMRR: number;
  expiringSoon: number;
  expired: number;
  totalClients: number;
}

const STATUS_CONFIG = {
  active:        { label: "Activo",          color: "bg-green-100 text-green-700",  icon: <CheckCircle size={12} /> },
  expiring_soon: { label: "Vence pronto",    color: "bg-orange-100 text-orange-700", icon: <AlertTriangle size={12} /> },
  expired:       { label: "Vencido",         color: "bg-red-100 text-red-700",      icon: <XCircle size={12} /> },
  no_expiry:     { label: "Sin vencimiento", color: "bg-gray-100 text-gray-600",    icon: <Calendar size={12} /> },
};

const PAYMENT_LABELS: Record<string, string> = {
  SINPE: "🇨🇷 SINPE", Wise: "💳 Wise", PayPal: "🅿️ PayPal",
};

const Billing = () => {
  const [records, setRecords] = useState<BillingRecord[]>([]);
  const [stats, setStats] = useState<BillingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "expiring_soon" | "expired">("all");
  const [editModal, setEditModal] = useState<BillingRecord | null>(null);
  const [editDate, setEditDate] = useState("");
  const [saving, setSaving] = useState(false);

  const auth = localStorage.getItem("icecast_auth");
  const headers = { Authorization: `Basic ${auth}`, "Content-Type": "application/json" };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/billing`, { headers });
      const d = await res.json();
      if (d.success) { setRecords(d.data.records); setStats(d.data.stats); }
      else toast.error("Error al cargar billing");
    } catch { toast.error("Error de conexión"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRenew = async (record: BillingRecord) => {
    if (!confirm(`¿Renovar ${record.plan} para @${record.username}?`)) return;
    try {
      const res = await fetch(`${API}/billing/${record.id}/renew`, { method: "PATCH", headers });
      const d = await res.json();
      if (d.success) { toast.success("✅ Renovado correctamente"); load(); }
      else toast.error(d.error || "Error al renovar");
    } catch { toast.error("Error de conexión"); }
  };

  const handleEditExpiry = async () => {
    if (!editModal || !editDate) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/billing/${editModal.id}/expires`, {
        method: "PATCH", headers,
        body: JSON.stringify({ expiresAt: new Date(editDate).toISOString() })
      });
      const d = await res.json();
      if (d.success) { toast.success("Fecha actualizada"); setEditModal(null); load(); }
      else toast.error(d.error || "Error");
    } catch { toast.error("Error de conexión"); }
    setSaving(false);
  };

  const openEdit = (r: BillingRecord) => {
    setEditModal(r);
    setEditDate(r.expiresAt ? r.expiresAt.split("T")[0] : "");
  };

  const filtered = filter === "all" ? records : records.filter(r => r.status === filter);

  const StatCard = ({ icon, label, value, sub, color }: any) => (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>{icon}</div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-black text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <DollarSign size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Billing & Pagos</h1>
            <p className="text-sm text-gray-500">Gestión de suscripciones y vencimientos</p>
          </div>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-all">
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<TrendingUp size={20} className="text-white" />} label="MRR estimado" value={`$${stats.totalMRR.toFixed(2)}`} sub="ingresos mensuales" color="bg-blue-500" />
          <StatCard icon={<Users size={20} className="text-white" />} label="Clientes activos" value={stats.totalClients} sub="streamers registrados" color="bg-emerald-500" />
          <StatCard icon={<AlertTriangle size={20} className="text-white" />} label="Vencen pronto" value={stats.expiringSoon} sub="en los próximos 7 días" color={stats.expiringSoon > 0 ? "bg-orange-500" : "bg-gray-400"} />
          <StatCard icon={<XCircle size={20} className="text-white" />} label="Vencidos" value={stats.expired} sub="requieren renovación" color={stats.expired > 0 ? "bg-red-500" : "bg-gray-400"} />
        </div>
      )}

      {/* Alertas */}
      {stats && stats.expiringSoon > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle size={18} className="text-orange-500 shrink-0" />
          <p className="text-sm text-orange-700 font-medium">
            {stats.expiringSoon} cliente{stats.expiringSoon !== 1 ? "s" : ""} vence{stats.expiringSoon === 1 ? "" : "n"} en los próximos 7 días. Recuérdales renovar.
          </p>
        </div>
      )}
      {stats && stats.expired > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <XCircle size={18} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            {stats.expired} cuenta{stats.expired !== 1 ? "s" : ""} vencida{stats.expired !== 1 ? "s" : ""}. Considera desactivarla{stats.expired !== 1 ? "s" : ""} o contactar al cliente.
          </p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2">
        {([
          { key: "all", label: "Todos" },
          { key: "active", label: "Activos" },
          { key: "expiring_soon", label: "Vencen pronto" },
          { key: "expired", label: "Vencidos" },
        ] as const).map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === f.key ? "bg-blue-600 text-white shadow-md" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
            {f.label} ({f.key === "all" ? records.length : records.filter(r => r.status === f.key).length})
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <DollarSign size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No hay registros de billing</p>
          <p className="text-sm mt-1">Los clientes aparecen aquí cuando se aprueba su solicitud</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50">
                  {["Cliente","Plan","Precio","Pago","Vencimiento","Días restantes","Estado","Acciones"].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(r => {
                  const st = STATUS_CONFIG[r.status];
                  return (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-900">{r.name}</p>
                        <p className="text-xs text-gray-400">@{r.username}</p>
                        {r.email && <p className="text-xs text-gray-400">{r.email}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg">{r.plan}</span>
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900">${r.planPrice}<span className="text-xs text-gray-400 font-normal">/{r.planPeriod}</span></td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{PAYMENT_LABELS[r.paymentMethod] || r.paymentMethod || "—"}</td>
                      <td className="px-4 py-3">
                        {r.expiresAt ? (
                          <p className="text-sm font-medium text-gray-700">
                            {new Date(r.expiresAt).toLocaleDateString("es-CR", { day: "2-digit", month: "short", year: "numeric" })}
                          </p>
                        ) : <span className="text-gray-400 text-xs">Sin fecha</span>}
                      </td>
                      <td className="px-4 py-3">
                        {r.daysLeft !== null ? (
                          <span className={`font-bold text-sm ${r.daysLeft < 0 ? "text-red-600" : r.daysLeft <= 7 ? "text-orange-500" : "text-green-600"}`}>
                            {r.daysLeft < 0 ? `Venció hace ${Math.abs(r.daysLeft)}d` : `${r.daysLeft}d`}
                          </span>
                        ) : <span className="text-gray-400 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold w-fit ${st.color}`}>
                          {st.icon} {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(r)} title="Editar fecha"
                            className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all">
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => handleRenew(r)} title="Renovar"
                            className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-green-50 hover:text-green-600 transition-all">
                            <RotateCcw size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Expiry Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-blue-500 to-violet-600">
              <h2 className="text-lg font-black text-white">✏️ Editar vencimiento</h2>
              <p className="text-white/80 text-sm mt-0.5">@{editModal.username} · {editModal.plan}</p>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Nueva fecha de vencimiento</label>
                <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition-all" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setEditModal(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
                  Cancelar
                </button>
                <button onClick={handleEditExpiry} disabled={saving || !editDate}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-50">
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
