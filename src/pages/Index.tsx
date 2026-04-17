import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { login } from "@/services/api/auth";
import { ChangeCredentialsDialog } from "@/components/auth/ChangeCredentialsDialog";
import {
  Radio, BarChart2, Shield, Settings, Music, Layers, Zap, Users,
  ArrowRight, LogIn, Play, Check, CheckCircle, Star, Globe, Headphones, ChevronRight, Send, X
} from "lucide-react";

const API = import.meta.env.VITE_API_BASE_URL;

const ICON_MAP: Record<string, React.ReactNode> = {
  radio: <Radio size={22} />,
  users: <Users size={22} />,
  shield: <Shield size={22} />,
  zap: <Zap size={22} />,
  music: <Music size={22} />,
  settings: <Settings size={22} />,
  layers: <Layers size={22} />,
  chart: <BarChart2 size={22} />,
  globe: <Globe size={22} />,
  headphones: <Headphones size={22} />,
};

interface SiteConfig {
  siteName: string;
  tagline: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  logoUrl: string;
  heroImage: string;
  ctaText: string;
  ctaSubtext: string;
  features: { icon: string; title: string; description: string }[];
  plans: { name: string; price: string; period: string; color: string; features: string[]; highlighted: boolean }[];
  socialLinks: { facebook: string; twitter: string; instagram: string; youtube: string };
  contactEmail: string;
  footerText: string;
}

const defaultConfig: SiteConfig = {
  siteName: "StreamPro",
  tagline: "Tu plataforma de radio online",
  description: "La solución más completa para gestionar y transmitir audio en vivo. Profesional, rápido y confiable.",
  primaryColor: "#2563eb",
  accentColor: "#7c3aed",
  logoUrl: "",
  heroImage: "",
  ctaText: "Comenzar ahora",
  ctaSubtext: "Configura tu radio en minutos",
  features: [
    { icon: "radio", title: "Streaming en Vivo", description: "Transmite audio de alta calidad a tus oyentes en cualquier parte del mundo." },
    { icon: "users", title: "Gestión de Oyentes", description: "Monitorea y analiza tu audiencia en tiempo real con estadísticas detalladas." },
    { icon: "shield", title: "Seguridad Total", description: "Control de acceso por roles, autenticación segura y protección de tus streams." },
    { icon: "zap", title: "Alta Performance", description: "Infraestructura optimizada para transmisiones continuas sin interrupciones." },
    { icon: "music", title: "Multi-formato", description: "Soporte para MP3, AAC, OGG y más formatos de audio profesionales." },
    { icon: "settings", title: "Panel Completo", description: "Administra todo desde un solo lugar: streams, usuarios, estadísticas y más." }
  ],
  plans: [
    { name: "Básico", price: "9.99", period: "mes", color: "#2563eb", features: ["1 Stream", "128 kbps", "100 oyentes", "Soporte básico"], highlighted: false },
    { name: "Pro", price: "24.99", period: "mes", color: "#7c3aed", features: ["5 Streams", "320 kbps", "500 oyentes", "Soporte prioritario", "Estadísticas avanzadas"], highlighted: true },
    { name: "Business", price: "59.99", period: "mes", color: "#059669", features: ["Streams ilimitados", "Sin límite de bitrate", "Oyentes ilimitados", "Soporte 24/7", "SLA garantizado", "IP dedicada"], highlighted: false }
  ],
  socialLinks: { facebook: "", twitter: "", instagram: "", youtube: "" },
  contactEmail: "",
  footerText: "© 2025 StreamPro. Todos los derechos reservados."
};

const Index = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<SiteConfig>(defaultConfig);
  const [showLogin, setShowLogin] = useState(false);
  const [showServiceRequest, setShowServiceRequest] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [srForm, setSrForm] = useState({ name: "", username: "", password: "", radioName: "", plan: "", codec: "AAC", paymentMethod: "", paymentRef: "", paymentHolder: "", receiptUrl: "", phoneCountry: "+506", phone: "" });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptUploading, setReceiptUploading] = useState(false);
  const [srStep, setSrStep] = useState(1);
  const [srLoading, setSrLoading] = useState(false);
  const [showChangeCredentials, setShowChangeCredentials] = useState(false);
  const [creds, setCreds] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
  const isLoggedIn = !!localStorage.getItem("icecast_auth");

  useEffect(() => {
    fetch(`${API}/site-config`)
      .then(r => r.json())
      .then(d => { if (d.success && d.data) setConfig({ ...defaultConfig, ...d.data }); })
      .catch(() => {})
      .finally(() => setConfigLoading(false));
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const result = await login(creds);
      if (result.success && result.data) {
        const encoded = btoa(`${creds.username}:${creds.password}`);
        localStorage.setItem("icecast_auth", encoded);
        localStorage.setItem("icecast_user", creds.username);
        localStorage.setItem("icecast_role", result.data.user?.role || "admin");
        localStorage.setItem("icecast_user_data", JSON.stringify(result.data.user || {}));
        setShowLogin(false);
        toast.success("Inicio de sesión exitoso");
        if (result.data.user?.role === "streamer") navigate("/my-station");
        else navigate("/dashboard");
      } else {
        toast.error(result.error || "Credenciales inválidas");
      }
    } catch { toast.error("Error de conexión"); }
    setLoading(false);
  };

  const pc = config.primaryColor || "#2563eb";
  const ac = config.accentColor || "#7c3aed";

  if (configLoading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin" />
        <p className="text-sm text-gray-400 font-medium">Cargando...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      <style>{`
        :root { --pc: ${pc}; --ac: ${ac}; }
        .btn-primary { background: ${pc}; color: white; }
        .btn-primary:hover { background: ${pc}dd; }
        .text-brand { color: ${pc}; }
        .bg-brand { background: ${pc}; }
        .border-brand { border-color: ${pc}; }
        .bg-accent { background: ${ac}; }
        .hero-gradient { background: linear-gradient(135deg, ${pc}15 0%, ${ac}15 50%, white 100%); }
        .card-hover:hover { border-color: ${pc}40; box-shadow: 0 8px 30px ${pc}15; transform: translateY(-2px); }
        .plan-highlight { background: linear-gradient(135deg, ${pc}, ${ac}); }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:1} 100%{transform:scale(1.4);opacity:0} }
        .float { animation: float 4s ease-in-out infinite; }
        .pulse-ring::before { content:''; position:absolute; inset:-4px; border-radius:50%; border:2px solid ${pc}; animation: pulse-ring 2s ease-out infinite; }
      `}</style>

      {/* ── NAVBAR ───────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {config.logoUrl ? (
              <img src={config.logoUrl} alt={config.siteName} className="h-9 object-contain" />
            ) : (
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md" style={{ background: `linear-gradient(135deg, ${pc}, ${ac})` }}>
                <Radio size={18} />
              </div>
            )}
            <span className="text-xl font-black text-gray-900">{config.siteName}</span>
          </div>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <button
                onClick={() => navigate(localStorage.getItem("icecast_role") === "streamer" ? "/my-station" : "/dashboard")}
                className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all"
              >
                <ArrowRight size={15} /> Ir al Panel
              </button>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all"
              >
                <LogIn size={15} /> Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="hero-gradient pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full opacity-10 blur-3xl" style={{ background: ac }} />
        <div className="absolute bottom-0 left-10 w-56 h-56 rounded-full opacity-10 blur-3xl" style={{ background: pc }} />

        <div className="max-w-5xl mx-auto text-center relative">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 text-sm font-medium text-gray-600 mb-6 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: pc }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: pc }} />
            </span>
            Streaming en vivo 24/7
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 leading-tight mb-6">
            {config.tagline.split(" ").map((word, i, arr) =>
              i >= arr.length - 2
                ? <span key={i} className="text-brand"> {word}</span>
                : <span key={i}> {word}</span>
            )}
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            {config.description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => { setSelectedPlan(""); setShowServiceRequest(true); }}
              className="btn-primary flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all hover:scale-105"
            >
              <Play size={20} fill="white" /> {config.ctaText}
            </button>
            <p className="text-sm text-gray-400">{config.ctaSubtext}</p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-16">
            {[["99.9%", "Uptime garantizado"], ["24/7", "Soporte técnico"], ["∞", "Oyentes posibles"]].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-black text-brand">{val}</div>
                <div className="text-sm text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-sm font-bold uppercase tracking-widest text-brand mb-3 block">Características</span>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Todo lo que necesitas</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">Una plataforma completa diseñada para streamers profesionales</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {config.features.map((f, i) => (
              <div key={i} className="card-hover bg-white rounded-2xl border border-gray-100 p-6 transition-all duration-300 cursor-default shadow-sm">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 shadow-md" style={{ background: `linear-gradient(135deg, ${pc}, ${ac})` }}>
                  {ICON_MAP[f.icon] || <Zap size={22} />}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANS ────────────────────────────────────────────────────────────── */}
      {config.plans && config.plans.length > 0 && (
        <section className="py-20 px-4" style={{ background: `linear-gradient(135deg, ${pc}08, ${ac}08)` }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-sm font-bold uppercase tracking-widest text-brand mb-3 block">Precios</span>
              <h2 className="text-4xl font-black text-gray-900 mb-4">Planes para todos</h2>
              <p className="text-gray-500 text-lg">Sin contratos. Cancela cuando quieras.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {config.plans.map((plan, i) => (
                <div key={i} className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${plan.highlighted ? "scale-105 shadow-2xl" : "shadow-md hover:shadow-xl hover:-translate-y-1"}`}>
                  {plan.highlighted && (
                    <div className="absolute top-0 left-0 right-0 text-center py-1.5 text-xs font-bold text-white tracking-wider" style={{ background: plan.color }}>
                      ⭐ MÁS POPULAR
                    </div>
                  )}
                  <div className={`p-7 ${plan.highlighted ? "pt-10 plan-highlight text-white" : "bg-white border border-gray-100"}`}>
                    <div className={`text-sm font-bold uppercase tracking-wider mb-2 ${plan.highlighted ? "text-white/70" : "text-gray-400"}`}>{plan.name}</div>
                    <div className="flex items-end gap-1 mb-1">
                      <span className={`text-sm font-semibold ${plan.highlighted ? "text-white/80" : "text-gray-500"}`}>$</span>
                      <span className={`text-5xl font-black ${plan.highlighted ? "text-white" : "text-gray-900"}`}>{plan.price}</span>
                    </div>
                    <div className={`text-sm mb-6 ${plan.highlighted ? "text-white/60" : "text-gray-400"}`}>por {plan.period}</div>
                    <div className="space-y-3 mb-7">
                      {plan.features.map((feat, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.highlighted ? "bg-white/20" : ""}`} style={!plan.highlighted ? { background: `${plan.color}20` } : {}}>
                            <Check size={11} className={plan.highlighted ? "text-white" : ""} style={!plan.highlighted ? { color: plan.color } : {}} />
                          </div>
                          <span className={`text-sm ${plan.highlighted ? "text-white/90" : "text-gray-600"}`}>{feat}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => { setSelectedPlan(plan.name); setSrForm(f => ({ ...f, plan: plan.name })); setShowServiceRequest(true); }}
                      className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${plan.highlighted ? "bg-white text-gray-900 hover:bg-gray-100" : "text-white hover:opacity-90"}`}
                      style={!plan.highlighted ? { background: plan.color } : {}}
                    >
                      Comenzar con {plan.name}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA FINAL ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 text-white text-center" style={{ background: `linear-gradient(135deg, ${pc}, ${ac})` }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-black mb-4">¿Listo para transmitir?</h2>
          <p className="text-white/80 text-lg mb-8">Únete a los streamers que ya confían en {config.siteName}</p>
          <button
            onClick={() => { setSelectedPlan(""); setShowServiceRequest(true); }}
            className="bg-white font-bold text-lg px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            style={{ color: pc }}
          >
            {config.ctaText} →
          </button>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${pc}, ${ac})` }}>
              <Radio size={14} className="text-white" />
            </div>
            <span className="font-bold text-white">{config.siteName}</span>
          </div>
          <p className="text-sm">{config.footerText}</p>
          {config.contactEmail && (
            <a href={`mailto:${config.contactEmail}`} className="text-sm hover:text-white transition-colors">{config.contactEmail}</a>
          )}
        </div>
      </footer>

      {/* ── LOGIN MODAL ──────────────────────────────────────────────────────── */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-6 text-white text-center" style={{ background: `linear-gradient(135deg, ${pc}, ${ac})` }}>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Radio size={26} className="text-white" />
              </div>
              <h2 className="text-xl font-black">{config.siteName}</h2>
              <p className="text-white/70 text-sm mt-1">Accede a tu panel de control</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Usuario</label>
                <input
                  value={creds.username}
                  onChange={e => setCreds(p => ({ ...p, username: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && creds.username && creds.password && handleLogin()}
                  placeholder="tu_usuario"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Contraseña</label>
                <input
                  type="password"
                  value={creds.password}
                  onChange={e => setCreds(p => ({ ...p, password: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && creds.username && creds.password && handleLogin()}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition-all"
                />
              </div>
              <button
                onClick={handleLogin}
                disabled={loading || !creds.username || !creds.password}
                className="w-full py-3 rounded-xl font-bold text-white text-sm disabled:opacity-50 transition-all hover:opacity-90 shadow-lg"
                style={{ background: `linear-gradient(135deg, ${pc}, ${ac})` }}
              >
                {loading ? "Ingresando..." : "Ingresar al Panel"}
              </button>
              <button onClick={() => setShowLogin(false)} className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SERVICE REQUEST MODAL */}
      {showServiceRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 text-white" style={{ background: `linear-gradient(135deg, ${pc}, ${ac})` }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black">{srStep === 1 ? "Solicitar Servicio" : "Método de Pago"}</h2>
                  <p className="text-white/70 text-sm mt-1">{srStep === 1 ? (srForm.plan ? `Plan ${srForm.plan} seleccionado` : "Completa tus datos") : "Elige cómo realizar tu pago"}</p>
                </div>
                <div className="flex items-center gap-2">
                  {srStep === 2 && <button onClick={() => setSrStep(1)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all text-xs font-bold">←</button>}
                  <button onClick={() => { setShowServiceRequest(false); setSrStep(1); }} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all">
                    <X size={16} className="text-white" />
                  </button>
                </div>
              </div>
              {/* Step indicators */}
              <div className="flex items-center gap-2 mt-4">
                <div className="flex-1 h-1 rounded-full bg-white/40" style={{ background: srStep >= 1 ? "white" : "rgba(255,255,255,0.3)" }} />
                <div className="flex-1 h-1 rounded-full" style={{ background: srStep >= 2 ? "white" : "rgba(255,255,255,0.3)" }} />
              </div>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {srStep === 1 ? (<>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Nombre completo</label>
                  <input value={srForm.name} onChange={e => setSrForm(f => ({ ...f, name: e.target.value }))} placeholder="Juan Pérez" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Nombre de radio</label>
                  <input value={srForm.radioName} onChange={e => setSrForm(f => ({ ...f, radioName: e.target.value }))} placeholder="Radio Latina" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition-all" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Usuario deseado</label>
                <input value={srForm.username} onChange={e => setSrForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/\s/g, "") }))} placeholder="juanperez" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition-all" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Contraseña deseada</label>
                <input type="password" value={srForm.password} onChange={e => setSrForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition-all" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Teléfono para notificaciones <span className="text-blue-500 normal-case font-normal">(WhatsApp / Telegram)</span></label>
                <div className="flex gap-2">
                  <select value={srForm.phoneCountry} onChange={e => setSrForm(f => ({ ...f, phoneCountry: e.target.value }))} className="border border-gray-200 rounded-xl px-2 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition-all bg-white w-36 shrink-0">
                    <option value="+506">🇨🇷 +506 CR</option>
                    <option value="+1">🇺🇸 +1 US</option>
                    <option value="+1-CA">🇨🇦 +1 CA</option>
                    <option value="+52">🇲🇽 +52 MX</option>
                    <option value="+502">🇬🇹 +502 GT</option>
                    <option value="+503">🇸🇻 +503 SV</option>
                    <option value="+504">🇭🇳 +504 HN</option>
                    <option value="+505">🇳🇮 +505 NI</option>
                    <option value="+507">🇵🇦 +507 PA</option>
                    <option value="+53">🇨🇺 +53 CU</option>
                    <option value="+1-DO">🇩🇴 +1 DO</option>
                    <option value="+57">🇨🇴 +57 CO</option>
                    <option value="+58">🇻🇪 +58 VE</option>
                    <option value="+51">🇵🇪 +51 PE</option>
                    <option value="+593">🇪🇨 +593 EC</option>
                    <option value="+591">🇧🇴 +591 BO</option>
                    <option value="+56">🇨🇱 +56 CL</option>
                    <option value="+54">🇦🇷 +54 AR</option>
                    <option value="+598">🇺🇾 +598 UY</option>
                    <option value="+595">🇵🇾 +595 PY</option>
                    <option value="+55">🇧🇷 +55 BR</option>
                    <option value="+34">🇪🇸 +34 ES</option>
                    <option value="+44">🇬🇧 +44 UK</option>
                    <option value="+49">🇩🇪 +49 DE</option>
                    <option value="+33">🇫🇷 +33 FR</option>
                    <option value="+39">🇮🇹 +39 IT</option>
                    <option value="+351">🇵🇹 +351 PT</option>
                    <option value="+31">🇳🇱 +31 NL</option>
                    <option value="+7">🇷🇺 +7 RU</option>
                    <option value="+86">🇨🇳 +86 CN</option>
                    <option value="+81">🇯🇵 +81 JP</option>
                    <option value="+82">🇰🇷 +82 KR</option>
                    <option value="+91">🇮🇳 +91 IN</option>
                    <option value="+966">🇸🇦 +966 SA</option>
                    <option value="+971">🇦🇪 +971 AE</option>
                    <option value="+27">🇿🇦 +27 ZA</option>
                    <option value="+234">🇳🇬 +234 NG</option>
                    <option value="+61">🇦🇺 +61 AU</option>
                  </select>
                  <input value={srForm.phone} onChange={e => setSrForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, "") }))} placeholder="88887777" className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition-all" maxLength={15} />
                </div>
                <p className="text-xs text-gray-400 mt-1">Te enviaremos tus credenciales y confirmación de activación.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Plan</label>
                  <select value={srForm.plan} onChange={e => setSrForm(f => ({ ...f, plan: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition-all bg-white">
                    <option value="">Seleccionar...</option>
                    {config.plans.map(p => <option key={p.name} value={p.name}>{p.name} — ${p.price}/{p.period}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Codec preferido</label>
                  <select value={srForm.codec} onChange={e => setSrForm(f => ({ ...f, codec: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition-all bg-white">
                    <option value="AAC">AAC (recomendado)</option>
                    <option value="MP3">MP3</option>
                    <option value="OGG">OGG Vorbis</option>
                  </select>
                </div>
              </div>
              <button
                disabled={!srForm.name || !srForm.username || !srForm.password || !srForm.radioName || !srForm.plan}
                onClick={() => setSrStep(2)}
                className="w-full py-3 rounded-xl font-bold text-white text-sm disabled:opacity-50 transition-all hover:opacity-90 shadow-lg flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${pc}, ${ac})` }}
              >
                Continuar al Pago →
              </button>
              </>) : (() => {
                const planObj = config.plans.find(p => p.name === srForm.plan);
                const planPrice = parseFloat(planObj?.price || "0");
                const PAYPAL_FEE_PCT = 4.49 / 100;
                const PAYPAL_FEE_FIXED = 0.49;
                const paypalTotal = ((planPrice + PAYPAL_FEE_FIXED) / (1 - PAYPAL_FEE_PCT)).toFixed(2);
                const paypalFeeAmt = (parseFloat(paypalTotal) - planPrice).toFixed(2);
                const SINPE_RATE = 520;
                const sinpeTotal = Math.ceil(planPrice * SINPE_RATE);
                return (<>
                {/* Método selector */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Método de pago</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["SINPE", "Wise", "PayPal"].map(m => (
                      <button key={m} onClick={() => setSrForm(f => ({ ...f, paymentMethod: m }))}
                        className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${srForm.paymentMethod === m ? "border-blue-500 text-blue-600 bg-blue-50" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                        {m === "SINPE" ? "🇨🇷 SINPE" : m === "Wise" ? "💳 Wise" : "🅿️ PayPal"}
                      </button>
                    ))}
                  </div>
                </div>

                {srForm.paymentMethod === "SINPE" && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-bold text-green-700 uppercase tracking-wider">Instrucciones SINPE Móvil</p>
                    <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-green-100">
                      <span className="text-xs text-gray-500">Número</span>
                      <span className="font-black text-gray-900 text-lg tracking-widest">6137-7272</span>
                    </div>
                    <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-green-100">
                      <span className="text-xs text-gray-500">A nombre de</span>
                      <span className="font-bold text-gray-800">Maikel Solano Salas</span>
                    </div>
                    <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-green-100">
                      <span className="text-xs text-gray-500">Monto</span>
                      <span className="font-black text-green-700">₡{sinpeTotal.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-green-600">💡 Tipo de cambio referencial: ₡{SINPE_RATE}/USD</p>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Número de confirmación SINPE</label>
                      <input value={srForm.paymentRef || ""} onChange={e => setSrForm(f => ({ ...f, paymentRef: e.target.value }))} placeholder="Ej: 202412345678" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Nombre del titular de la cuenta</label>
                      <input value={srForm.paymentHolder || ""} onChange={e => setSrForm(f => ({ ...f, paymentHolder: e.target.value }))} placeholder="Juan Pérez" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 transition-all" />
                    </div>
                  </div>
                )}

                {srForm.paymentMethod === "Wise" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Instrucciones Wise</p>
                    <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-blue-100">
                      <span className="text-xs text-gray-500">Email</span>
                      <span className="font-bold text-gray-800 text-sm">mikesosa26@gmail.com</span>
                    </div>
                    <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-blue-100">
                      <span className="text-xs text-gray-500">Usuario Wise</span>
                      <span className="font-bold text-gray-800">@maikels99</span>
                    </div>
                    <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-blue-100">
                      <span className="text-xs text-gray-500">Monto</span>
                      <span className="font-black text-blue-700">${planPrice.toFixed(2)} USD</span>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Referencia / ID de transacción Wise</label>
                      <input value={srForm.paymentRef || ""} onChange={e => setSrForm(f => ({ ...f, paymentRef: e.target.value }))} placeholder="Ej: P123456789" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Nombre del titular de la cuenta</label>
                      <input value={srForm.paymentHolder || ""} onChange={e => setSrForm(f => ({ ...f, paymentHolder: e.target.value }))} placeholder="Juan Pérez" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition-all" />
                    </div>
                  </div>
                )}

                {srForm.paymentMethod === "PayPal" && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Instrucciones PayPal</p>
                    <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-indigo-100">
                      <span className="text-xs text-gray-500">Email PayPal</span>
                      <span className="font-bold text-gray-800 text-sm">mikesosa26@gmail.com</span>
                    </div>
                    {/* Calculadora */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1.5">
                      <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">💡 Calculadora de comisión</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Precio del plan</span>
                        <span className="font-bold">${planPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Comisión PayPal (4.49% + $0.49)</span>
                        <span className="font-bold text-amber-700">+${paypalFeeAmt}</span>
                      </div>
                      <div className="border-t border-amber-200 my-1" />
                      <div className="flex justify-between text-sm font-black">
                        <span>Total a enviar</span>
                        <span className="text-indigo-700 text-base">${paypalTotal}</span>
                      </div>
                      <p className="text-xs text-amber-600 mt-1">⚠️ Este cargo adicional de <strong>${paypalFeeAmt}</strong> corresponde a la comisión que cobra PayPal por la transacción internacional. No es un cargo nuestro.</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">ID / Referencia de transacción PayPal</label>
                      <input value={srForm.paymentRef || ""} onChange={e => setSrForm(f => ({ ...f, paymentRef: e.target.value }))} placeholder="Ej: 9XA12345BC678901D" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Nombre del titular de la cuenta PayPal</label>
                      <input value={srForm.paymentHolder || ""} onChange={e => setSrForm(f => ({ ...f, paymentHolder: e.target.value }))} placeholder="Juan Pérez" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 transition-all" />
                    </div>
                  </div>
                )}

                {srForm.paymentMethod && (<>
                  {/* Subida de comprobante */}
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center transition-all hover:border-blue-300 cursor-pointer relative"
                    onClick={() => document.getElementById('receipt-upload')?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={async e => {
                      e.preventDefault();
                      const file = e.dataTransfer.files[0];
                      if (file) {
                        setReceiptFile(file);
                        setReceiptUploading(true);
                        const fd = new FormData(); fd.append('file', file);
                        try {
                          const r = await fetch(`${API}/upload`, { method: 'POST', body: fd });
                          const d = await r.json();
                          if (d.success) { setSrForm(f => ({ ...f, receiptUrl: d.url })); toast.success("Comprobante subido"); }
                          else toast.error("Error al subir archivo");
                        } catch { toast.error("Error de conexión"); }
                        setReceiptUploading(false);
                      }
                    }}
                  >
                    <input id="receipt-upload" type="file" accept="image/*,.pdf" className="hidden"
                      onChange={async e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setReceiptFile(file);
                        setReceiptUploading(true);
                        const fd = new FormData(); fd.append('file', file);
                        try {
                          const r = await fetch(`${API}/upload`, { method: 'POST', body: fd });
                          const d = await r.json();
                          if (d.success) { setSrForm(f => ({ ...f, receiptUrl: d.url })); toast.success("Comprobante subido ✓"); }
                          else toast.error("Error al subir archivo");
                        } catch { toast.error("Error de conexión"); }
                        setReceiptUploading(false);
                      }}
                    />
                    {receiptUploading ? (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                        <p className="text-xs text-gray-400">Subiendo...</p>
                      </div>
                    ) : srForm.receiptUrl ? (
                      <div className="flex flex-col items-center gap-2 py-1">
                        {srForm.receiptUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <img src={`http://129.146.17.95${srForm.receiptUrl}`} alt="Comprobante" className="max-h-24 rounded-lg object-contain mx-auto" />
                        ) : (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle size={20} />
                            <span className="text-sm font-semibold">PDF subido</span>
                          </div>
                        )}
                        <p className="text-xs text-green-600 font-semibold">✓ Comprobante adjunto — clic para cambiar</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 py-2 text-gray-400">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                          <Send size={18} className="rotate-45" />
                        </div>
                        <p className="text-sm font-semibold text-gray-600">Adjuntar comprobante de pago</p>
                        <p className="text-xs">Imagen o PDF — clic o arrastra aquí</p>
                        <p className="text-xs text-gray-300">(Opcional pero recomendado)</p>
                      </div>
                    )}
                  </div>

                  <button
                    disabled={srLoading || !srForm.paymentRef || !srForm.paymentHolder || receiptUploading}
                    onClick={async () => {
                      setSrLoading(true);
                      try {
                        const res = await fetch(`${API}/service-requests`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...srForm, status: "pending_payment", submittedAt: new Date().toISOString() }) });
                        const data = await res.json();
                        if (data.success) {
                          toast.success("¡Solicitud enviada! Verificaremos tu pago y activaremos tu cuenta.");
                          setShowServiceRequest(false);
                          setSrStep(1);
                          setSrForm({ name: "", username: "", password: "", radioName: "", plan: "", codec: "AAC", paymentMethod: "", paymentRef: "", paymentHolder: "", receiptUrl: "", phoneCountry: "+506", phone: "" });
                          setReceiptFile(null);
                        } else { toast.error(data.error || "Error al enviar"); }
                      } catch { toast.error("Error de conexión"); }
                      setSrLoading(false);
                    }}
                    className="w-full py-3 rounded-xl font-bold text-white text-sm disabled:opacity-50 transition-all hover:opacity-90 shadow-lg flex items-center justify-center gap-2"
                    style={{ background: `linear-gradient(135deg, ${pc}, ${ac})` }}
                  >
                    <Send size={16} /> {srLoading ? "Enviando..." : "Confirmar y Enviar Solicitud"}
                  </button>
                </>)}
                </>);
              })()}
              <p className="text-center text-xs text-gray-400">
                ¿Ya tienes cuenta?{" "}
                <button onClick={() => { setShowServiceRequest(false); setShowLogin(true); }} className="font-semibold hover:underline" style={{ color: pc }}>
                  Inicia sesión aquí
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      <ChangeCredentialsDialog open={showChangeCredentials} onComplete={() => { setShowChangeCredentials(false); navigate("/dashboard"); }} />
    </div>
  );
};

export default Index;
