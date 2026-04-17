import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Inbox, Clock, CheckCircle, XCircle, Trash2, RefreshCw, FileImage, ExternalLink } from "lucide-react";

const API = import.meta.env.VITE_API_BASE_URL;

interface ServiceRequest {
  id: string;
  name: string;
  username: string;
  password: string;
  radioName: string;
  plan: string;
  codec: string;
  paymentMethod?: string;
  paymentRef?: string;
  paymentHolder?: string;
  receiptUrl?: string;
  status: "pending" | "pending_payment" | "approved" | "rejected";
  createdAt: string;
  submittedAt?: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:         { label: "Pendiente",       color: "bg-yellow-100 text-yellow-700", icon: <Clock size={13} /> },
  pending_payment: { label: "Pago Pendiente",  color: "bg-orange-100 text-orange-700", icon: <Clock size={13} /> },
  approved:        { label: "Aprobada",        color: "bg-green-100 text-green-700",  icon: <CheckCircle size={13} /> },
  rejected:        { label: "Rechazada",       color: "bg-red-100 text-red-700",      icon: <XCircle size={13} /> },
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  SINPE: "🇨🇷 SINPE Móvil",
  Wise:  "💳 Wise",
  PayPal: "🅿️ PayPal",
};

const SERVER_BASE = "http://129.146.17.95";

const ServiceRequests = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/service-requests`, {
        headers: { Authorization: `Basic ${localStorage.getItem("icecast_auth")}` }
      });
      const data = await res.json();
      if (data.success) setRequests(data.data.reverse());
    } catch { toast.error("Error al cargar solicitudes"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`${API}/service-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Basic ${localStorage.getItem("icecast_auth")}` },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        setRequests(r => r.map(x => x.id === id ? { ...x, status: status as any } : x));
        toast.success("Estado actualizado");
      } else toast.error(data.error || "Error");
    } catch { toast.error("Error de conexión"); }
  };

  const deleteRequest = async (id: string) => {
    if (!confirm("¿Eliminar esta solicitud?")) return;
    try {
      const res = await fetch(`${API}/service-requests/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Basic ${localStorage.getItem("icecast_auth")}` }
      });
      const data = await res.json();
      if (data.success) {
        setRequests(r => r.filter(x => x.id !== id));
        toast.success("Solicitud eliminada");
      } else toast.error(data.error || "Error");
    } catch { toast.error("Error de conexión"); }
  };

  const filtered = filter === "all" ? requests : requests.filter(r => r.status === filter);
  const counts = {
    all: requests.length,
    pending: requests.filter(r => r.status === "pending" || r.status === "pending_payment").length,
    approved: requests.filter(r => r.status === "approved").length,
    rejected: requests.filter(r => r.status === "rejected").length,
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <Inbox size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Solicitudes de Servicio</h1>
            <p className="text-sm text-gray-500">Solicitudes recibidas desde la landing page</p>
          </div>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
          <RefreshCw size={15} /> Actualizar
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "pending", "approved", "rejected"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === f ? "bg-blue-600 text-white shadow-md" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            {f === "all" ? "Todas" : STATUS_LABELS[f].label} ({counts[f]})
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Inbox size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No hay solicitudes {filter !== "all" && STATUS_LABELS[filter].label.toLowerCase()+"s"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => {
            const st = STATUS_LABELS[req.status] || STATUS_LABELS.pending;
            return (
              <div key={req.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
                {/* Info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Nombre</p>
                    <p className="text-sm font-bold text-gray-900">{req.name}</p>
                    <p className="text-xs text-gray-500">@{req.username}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Radio / Codec</p>
                    <p className="text-sm font-bold text-gray-900">{req.radioName}</p>
                    <p className="text-xs text-gray-500">{req.codec}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Plan</p>
                    <p className="text-sm font-bold text-gray-900">{req.plan}</p>
                    <p className="text-xs text-gray-500">{new Date(req.createdAt || req.submittedAt || "").toLocaleDateString("es-CR", { day:"2-digit", month:"short", year:"numeric" })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Contraseña</p>
                    <p className="text-sm font-mono text-gray-700 bg-gray-50 rounded px-2 py-0.5 inline-block">{req.password}</p>
                  </div>
                </div>
                {/* Fila de pago */}
                {req.paymentMethod && (
                  <div className="pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Método de Pago</p>
                      <p className="text-sm font-bold text-gray-900">{PAYMENT_METHOD_LABELS[req.paymentMethod] || req.paymentMethod}</p>
                      {req.paymentHolder && <p className="text-xs text-gray-500">{req.paymentHolder}</p>}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Referencia / ID</p>
                      <p className="text-sm font-mono font-bold text-gray-900 bg-gray-50 rounded px-2 py-0.5 inline-block">{req.paymentRef || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Comprobante</p>
                      {req.receiptUrl ? (
                        req.receiptUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <a href={`${SERVER_BASE}${req.receiptUrl}`} target="_blank" rel="noreferrer" className="block">
                            <img src={`${SERVER_BASE}${req.receiptUrl}`} alt="Comprobante" className="h-16 rounded-lg object-contain border border-gray-200 hover:opacity-80 transition-all" />
                          </a>
                        ) : (
                          <a href={`${SERVER_BASE}${req.receiptUrl}`} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1.5 text-blue-600 text-sm font-semibold hover:underline">
                            <FileImage size={15} /> Ver PDF <ExternalLink size={12} />
                          </a>
                        )
                      ) : (
                        <p className="text-xs text-gray-400 italic">Sin comprobante</p>
                      )}
                    </div>
                  </div>
                )}
                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <span className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${st.color}`}>
                    {st.icon} {st.label}
                  </span>
                  {req.status === "pending" && (
                    <>
                      <button onClick={() => updateStatus(req.id, "approved")} className="px-3 py-1.5 rounded-xl bg-green-50 text-green-700 text-xs font-bold hover:bg-green-100 transition-all">
                        Aprobar
                      </button>
                      <button onClick={() => updateStatus(req.id, "rejected")} className="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 transition-all">
                        Rechazar
                      </button>
                    </>
                  )}
                  <button onClick={() => deleteRequest(req.id)} className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ServiceRequests;
