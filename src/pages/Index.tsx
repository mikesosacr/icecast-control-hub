import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { login } from "@/services/api/auth";
import { ChangeCredentialsDialog } from "@/components/auth/ChangeCredentialsDialog";
import {
  Radio, BarChart2, Shield, Settings, Music, Layers, Zap, Users,
  ArrowRight, LogIn, Play, Check, Star, Globe, Headphones, ChevronRight
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
              onClick={() => setShowLogin(true)}
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
                      onClick={() => setShowLogin(true)}
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
            onClick={() => setShowLogin(true)}
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

      <ChangeCredentialsDialog open={showChangeCredentials} onComplete={() => { setShowChangeCredentials(false); navigate("/dashboard"); }} />
    </div>
  );
};

export default Index;
