import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Save, Plus, Trash2, Eye, EyeOff, Globe, Palette, Type,
  Layout, CreditCard, Settings, ChevronDown, ChevronUp, Loader2, ExternalLink
} from "lucide-react";

const API = import.meta.env.VITE_API_BASE_URL;

const ICON_OPTIONS = ["radio","users","shield","zap","music","settings","layers","chart","globe","headphones"];

interface Plan {
  name: string; price: string; period: string; color: string; features: string[]; highlighted: boolean;
}
interface Feature {
  icon: string; title: string; description: string;
}
interface SiteConfig {
  siteName: string; tagline: string; description: string;
  primaryColor: string; accentColor: string;
  logoUrl: string; heroImage: string;
  ctaText: string; ctaSubtext: string;
  features: Feature[];
  plans: Plan[];
  contactEmail: string; footerText: string;
}

function Section({ title, icon, children, defaultOpen = true }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-2.5">
          <span className="text-blue-500">{icon}</span>
          <span className="font-semibold text-gray-800">{title}</span>
        </div>
        {open ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
      </button>
      {open && <div className="px-6 pb-6 border-t border-gray-100 pt-4 space-y-4">{children}</div>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition-all bg-white";

const SiteEditor = () => {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/site-config`)
      .then(r => r.json())
      .then(d => { if (d.success) setConfig(d.data); })
      .catch(() => toast.error("Error cargando configuración"))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const auth = localStorage.getItem("icecast_auth");
      const r = await fetch(`${API}/site-config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}` },
        body: JSON.stringify(config),
      });
      const d = await r.json();
      if (d.success) toast.success("Configuración guardada");
      else toast.error("Error al guardar");
    } catch { toast.error("Error de conexión"); }
    setSaving(false);
  };

  const set = (key: keyof SiteConfig, value: any) => setConfig(p => p ? ({ ...p, [key]: value }) : p);

  const updateFeature = (i: number, key: keyof Feature, val: string) => {
    if (!config) return;
    const f = [...config.features];
    f[i] = { ...f[i], [key]: val };
    set("features", f);
  };

  const addFeature = () => set("features", [...(config?.features || []), { icon: "radio", title: "Nueva función", description: "Descripción aquí" }]);
  const removeFeature = (i: number) => set("features", config!.features.filter((_, j) => j !== i));

  const updatePlan = (i: number, key: keyof Plan, val: any) => {
    if (!config) return;
    const p = [...config.plans];
    p[i] = { ...p[i], [key]: val };
    set("plans", p);
  };

  const updatePlanFeature = (pi: number, fi: number, val: string) => {
    if (!config) return;
    const p = [...config.plans];
    const feats = [...p[pi].features];
    feats[fi] = val;
    p[pi] = { ...p[pi], features: feats };
    set("plans", p);
  };

  const addPlanFeature = (pi: number) => {
    if (!config) return;
    const p = [...config.plans];
    p[pi] = { ...p[pi], features: [...p[pi].features, "Nueva característica"] };
    set("plans", p);
  };

  const removePlanFeature = (pi: number, fi: number) => {
    if (!config) return;
    const p = [...config.plans];
    p[pi] = { ...p[pi], features: p[pi].features.filter((_, j) => j !== fi) };
    set("plans", p);
  };

  const addPlan = () => set("plans", [...(config?.plans || []), { name: "Nuevo Plan", price: "0", period: "mes", color: "#2563eb", features: ["Característica 1"], highlighted: false }]);
  const removePlan = (i: number) => set("plans", config!.plans.filter((_, j) => j !== i));

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={24} className="animate-spin text-blue-500" />
    </div>
  );

  if (!config) return <div className="text-center py-20 text-gray-400">Error cargando configuración</div>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Editor de Sitio</h1>
          <p className="text-gray-500 text-sm mt-0.5">Personaliza la página principal de tu servicio</p>
        </div>
        <div className="flex gap-2">
          <a href="/" target="_blank" rel="noopener"
            className="flex items-center gap-2 text-sm border border-gray-200 rounded-xl px-4 py-2.5 text-gray-600 hover:border-gray-300 transition-all bg-white">
            <ExternalLink size={14} /> Ver sitio
          </a>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-2.5 font-semibold shadow-md transition-all disabled:opacity-60">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Guardar cambios
          </button>
        </div>
      </div>

      {/* ── BRANDING ──────────────────────────────────────────────────────── */}
      <Section title="Marca y Apariencia" icon={<Palette size={16} />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nombre del servicio">
            <input value={config.siteName} onChange={e => set("siteName", e.target.value)} className={inputCls} placeholder="StreamPro" />
          </Field>
          <Field label="Email de contacto">
            <input value={config.contactEmail} onChange={e => set("contactEmail", e.target.value)} className={inputCls} placeholder="hola@miradio.com" />
          </Field>
          <Field label="Color primario">
            <div className="flex gap-2">
              <input type="color" value={config.primaryColor} onChange={e => set("primaryColor", e.target.value)}
                className="w-10 h-10 rounded-lg border border-gray-200 p-0.5 cursor-pointer" />
              <input value={config.primaryColor} onChange={e => set("primaryColor", e.target.value)} className={`${inputCls} font-mono`} />
            </div>
          </Field>
          <Field label="Color de acento">
            <div className="flex gap-2">
              <input type="color" value={config.accentColor} onChange={e => set("accentColor", e.target.value)}
                className="w-10 h-10 rounded-lg border border-gray-200 p-0.5 cursor-pointer" />
              <input value={config.accentColor} onChange={e => set("accentColor", e.target.value)} className={`${inputCls} font-mono`} />
            </div>
          </Field>
          <Field label="URL del logo">
            <input value={config.logoUrl} onChange={e => set("logoUrl", e.target.value)} className={inputCls} placeholder="https://..." />
          </Field>
          <Field label="Imagen de fondo del hero">
            <input value={config.heroImage} onChange={e => set("heroImage", e.target.value)} className={inputCls} placeholder="https://..." />
          </Field>
        </div>
      </Section>

      {/* ── TEXTS ──────────────────────────────────────────────────────────── */}
      <Section title="Textos y Contenido" icon={<Type size={16} />}>
        <Field label="Tagline (título principal)">
          <input value={config.tagline} onChange={e => set("tagline", e.target.value)} className={inputCls} placeholder="Tu plataforma de radio online" />
        </Field>
        <Field label="Descripción">
          <textarea value={config.description} onChange={e => set("description", e.target.value)}
            rows={3} className={`${inputCls} resize-none`} placeholder="Descripción del servicio..." />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Texto del botón CTA">
            <input value={config.ctaText} onChange={e => set("ctaText", e.target.value)} className={inputCls} placeholder="Comenzar ahora" />
          </Field>
          <Field label="Subtexto del CTA">
            <input value={config.ctaSubtext} onChange={e => set("ctaSubtext", e.target.value)} className={inputCls} placeholder="Sin tarjeta de crédito" />
          </Field>
          <Field label="Texto del footer">
            <input value={config.footerText} onChange={e => set("footerText", e.target.value)} className={`${inputCls} sm:col-span-2`} />
          </Field>
        </div>
      </Section>

      {/* ── FEATURES ───────────────────────────────────────────────────────── */}
      <Section title="Características / Features" icon={<Layout size={16} />}>
        <div className="space-y-3">
          {config.features.map((f, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Icono</label>
                  <select value={f.icon} onChange={e => updateFeature(i, "icon", e.target.value)}
                    className={inputCls}>
                    {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-gray-400 block mb-1">Título</label>
                  <input value={f.title} onChange={e => updateFeature(i, "title", e.target.value)} className={inputCls} />
                </div>
              </div>
              <div className="flex gap-2">
                <input value={f.description} onChange={e => updateFeature(i, "description", e.target.value)}
                  className={`${inputCls} flex-1`} placeholder="Descripción..." />
                <button onClick={() => removeFeature(i)}
                  className="px-3 py-2 rounded-xl border border-red-100 hover:bg-red-50 text-red-400 hover:text-red-600 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          <button onClick={addFeature}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 rounded-xl text-sm text-gray-400 hover:text-blue-600 transition-all">
            <Plus size={15} /> Añadir característica
          </button>
        </div>
      </Section>

      {/* ── PLANS ──────────────────────────────────────────────────────────── */}
      <Section title="Planes y Precios" icon={<CreditCard size={16} />}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {config.plans.map((plan, pi) => (
            <div key={pi} className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input type="color" value={plan.color} onChange={e => updatePlan(pi, "color", e.target.value)}
                    className="w-7 h-7 rounded-lg border border-gray-200 p-0.5 cursor-pointer" />
                  <input value={plan.name} onChange={e => updatePlan(pi, "name", e.target.value)}
                    className="font-bold text-gray-800 text-sm bg-transparent border-b border-gray-200 focus:outline-none focus:border-blue-400 w-24" />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updatePlan(pi, "highlighted", !plan.highlighted)}
                    title="Destacar plan"
                    className={`p-1.5 rounded-lg transition-all ${plan.highlighted ? "bg-yellow-100 text-yellow-600" : "text-gray-300 hover:text-yellow-500"}`}>
                    ⭐
                  </button>
                  <button onClick={() => removePlan(pi)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-gray-400 block mb-1">Precio</label>
                  <input value={plan.price} onChange={e => updatePlan(pi, "price", e.target.value)}
                    className={inputCls} placeholder="9.99" />
                </div>
                <div className="w-24">
                  <label className="text-xs text-gray-400 block mb-1">Período</label>
                  <input value={plan.period} onChange={e => updatePlan(pi, "period", e.target.value)}
                    className={inputCls} placeholder="mes" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-2">Características incluidas</label>
                <div className="space-y-1.5">
                  {plan.features.map((feat, fi) => (
                    <div key={fi} className="flex gap-1.5">
                      <input value={feat} onChange={e => updatePlanFeature(pi, fi, e.target.value)}
                        className={`${inputCls} flex-1 text-xs py-1.5`} />
                      <button onClick={() => removePlanFeature(pi, fi)}
                        className="px-2 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => addPlanFeature(pi)}
                    className="w-full text-xs text-gray-400 hover:text-blue-600 border border-dashed border-gray-200 hover:border-blue-300 rounded-lg py-1.5 transition-all">
                    + añadir
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button onClick={addPlan}
            className="flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 rounded-xl text-sm text-gray-400 hover:text-blue-600 transition-all">
            <Plus size={20} /> Añadir plan
          </button>
        </div>
      </Section>

      {/* Save bottom */}
      <div className="flex justify-end pb-4">
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 py-3 font-semibold shadow-md transition-all disabled:opacity-60">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Guardar todos los cambios
        </button>
      </div>
    </div>
  );
};

export default SiteEditor;
