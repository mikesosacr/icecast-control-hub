import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Inbox, Clock, CheckCircle, XCircle, Trash2, RefreshCw, FileImage, ExternalLink, CheckCheck, Ban, User, Radio, CreditCard } from "lucide-react";

const API = import.meta.env.VITE_API_BASE_URL;
const SERVER_BASE = "http://129.146.17.95";

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
  phoneCountry?: string;
  phone?: string;
  email?: string;
  status: "pending" | "pending_payment" | "approved" | "rejected";
  createdAt: string;
  submittedAt?: string;
  note?: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:         { label: "Pendiente",      color: "bg-yellow-100 text-yellow-700", icon: <Clock size={13} /> },
  pending_payment: { label: "Pago Pendiente", color: "bg-orange-100 text-orange-700", icon: <Clock size={13} /> },
  approved:        { label: "Aprobada",       color: "bg-green-100 text-green-700",   icon: <CheckCircle size={13} /> },
  rejected:        { label: "Rechazada",      color: "bg-red-100 text-red-700",       icon: <XCircle size={13} /> },
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  SINPE: "🇨🇷 SINPE Móvil", Wise: "💳 Wise", PayPal: "🅿️ PayPal",
};

type ModalMode = "approve" | "reject" | null;

const ServiceRequests = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [modalReq, setModalReq] = useState<ServiceRequest | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [note, setNote] = useState("");
  const [notifyEmail, setNotifyEmail] = useState("");
  const [acting, setActing] = useState(false);

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

  const openModal = (req: ServiceRequest, mode: ModalMode) => {
    setModalReq(req);
    setModalMode(mode);
    setNote("");
    setNotifyEmail(mode === "approve" ? (req.email || "") : "");
  };

  const closeModal = () => { setModalReq(null); setModalMode(null); setNote(""); setNotifyEmail(""); };

  const handleApprove = async () => {
    if (!modalReq) return;
    setActing(true);
    try {
      const res = await fetch(`${API}/service-requests/${modalReq.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Basic ${localStorage.getItem("icecast_auth")}` },
        body: JSON.stringify({ note, notifyEmail })
      });
      const data = await res.json();
      if (data.success) {
        setRequests(r => r.map(x => x.id === modalReq.id ? { ...x, status: "approved" } : x));
        toast.success("✅ Cuenta creada y aprobada" + (data.emailSent ? " — Email enviado" : ""));
        closeModal();
      } else toast.error(data.error || "Error al aprobar");
    } catch { toast.error("Error de conexión"); }
    setActing(false);
  };

  const handleReject = async () => {
    if (!modalReq) return;
    setActing(true);
    try {
      const res = await fetch(`${API}/service-requests/${modalReq.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Basic ${localStorage.getItem("icecast_auth")}` },
        body: JSON.stringify({ note })
      });
      const data = await res.json();
      if (data.success) {
        setRequests(r => r.map(x => x.id === modalReq.id ? { ...x, status: "rejected" } : x));
        toast.success("Solicitud rechazada");
        closeModal();
      } else toast.error(data.error || "Error al rechazar");
    } catch { toast.error("Error de conexión"); }
    setActing(false);
  };

  const deleteRequest = async (id: string) => {
    if (!confirm("¿Eliminar esta solicitud?")) return;
    try {
      const res = await fetch(`${API}/service-requests/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Basic ${localStorage.getItem("icecast_auth")}` }
      });
      const data = await res.json();
      if (data.success) { setRequests(r => r.filter(x => x.id !== id)); toast.success("Eliminada"); }
      else toast.error(data.error || "Error");
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
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === f ? "bg-blue-600 text-white shadow-md" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
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
          <p className="font-medium">No hay solicitudes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => {
            const st = STATUS_LABELS[req.status] || STATUS_LABELS.pending;
            const canAct = req.status === "pending" || req.status === "pending_payment";
            return (
              <div key={req.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
                {/* Info grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Nombre</p>
                    <p className="text-sm font-bold text-gray-900">{req.name}</p>
                    <p className="text-xs text-gray-500">@{req.username}</p>
                    {req.phone && <p className="text-xs text-gray-400">{req.phoneCountry} {req.phone}</p>}
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

                {/* Pago */}
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
                          <a href={`${SERVER_BASE}${req.receiptUrl}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-600 text-sm font-semibold hover:underline">
                            <FileImage size={15} /> Ver PDF <ExternalLink size={12} />
                          </a>
                        )
                      ) : <p className="text-xs text-gray-400 italic">Sin comprobante</p>}
                    </div>
                  </div>
                )}

                {/* Nota si existe */}
                {req.note && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Nota interna</p>
                    <p className="text-sm text-gray-600 italic">"{req.note}"</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-gray-50">
                  <span className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${st.color}`}>
                    {st.icon} {st.label}
                  </span>
                  {canAct && (<>
                    <button onClick={() => openModal(req, "approve")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 text-green-700 text-xs font-bold hover:bg-green-100 transition-all">
                      <CheckCheck size={13} /> Aprobar cuenta
                    </button>
                    <button onClick={() => openModal(req, "reject")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 transition-all">
                      <Ban size={13} /> Rechazar
                    </button>
                  </>)}
                  <button onClick={() => deleteRequest(req.id)}
                    className="ml-auto w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Opción C */}
      {modalReq && modalMode && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className={`p-5 ${modalMode === "approve" ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gradient-to-r from-red-500 to-rose-600"}`}>
              <h2 className="text-lg font-black text-white">
                {modalMode === "approve" ? "✅ Aprobar y crear cuenta" : "❌ Rechazar solicitud"}
              </h2>
              <p className="text-white/80 text-sm mt-0.5">
                {modalMode === "approve" ? "Se creará el usuario y mountpoint automáticamente" : "La solicitud quedará como rechazada"}
              </p>
            </div>

            {/* Resumen */}
            <div className="p-5 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User size={14} className="text-gray-400" />
                  <span className="text-gray-500">Cliente:</span>
                  <span className="font-bold text-gray-900">{modalReq.name}</span>
                  <span className="text-gray-400">@{modalReq.username}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Radio size={14} className="text-gray-400" />
                  <span className="text-gray-500">Radio:</span>
                  <span className="font-bold text-gray-900">{modalReq.radioName}</span>
                  <span className="text-gray-400">· {modalReq.plan}</span>
                </div>
                {modalReq.paymentMethod && (
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard size={14} className="text-gray-400" />
                    <span className="text-gray-500">Pago:</span>
                    <span className="font-bold text-gray-900">{PAYMENT_METHOD_LABELS[modalReq.paymentMethod] || modalReq.paymentMethod}</span>
                    {modalReq.paymentRef && <span className="text-gray-400 font-mono text-xs">{modalReq.paymentRef}</span>}
                  </div>
                )}
                {modalReq.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">📱</span>
                    <span className="text-gray-500">Tel:</span>
                    <span className="font-bold text-gray-900">{modalReq.phoneCountry} {modalReq.phone}</span>
                  </div>
                )}
                {modalReq.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">✉️</span>
                    <span className="text-gray-500">Email:</span>
                    <span className="font-bold text-gray-900">{modalReq.email}</span>
                  </div>
                )}
              </div>

              {modalMode === "approve" && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                    Enviar credenciales por email <span className="text-gray-400 normal-case font-normal">(opcional)</span>
                  </label>
                  <input value={notifyEmail} onChange={e => setNotifyEmail(e.target.value)}
                    type="email" placeholder="email@cliente.com"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 transition-all" />
                  <p className="text-xs text-gray-400 mt-1">Requiere SMTP configurado en Configuration → Email</p>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                  Nota interna <span className="text-gray-400 normal-case font-normal">(opcional)</span>
                </label>
                <textarea value={note} onChange={e => setNote(e.target.value)}
                  placeholder={modalMode === "approve" ? "Ej: Pago verificado el 17/04/2026" : "Ej: Comprobante no válido"}
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-all resize-none" />
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={closeModal} disabled={acting}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
                  Cancelar
                </button>
                {modalMode === "approve" ? (
                  <button onClick={handleApprove} disabled={acting}
                    className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    <CheckCheck size={15} /> {acting ? "Creando..." : "Confirmar y crear cuenta"}
                  </button>
                ) : (
                  <button onClick={handleReject} disabled={acting}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    <Ban size={15} /> {acting ? "Rechazando..." : "Confirmar rechazo"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceRequests;
