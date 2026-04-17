import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Mail, Send, Eye, EyeOff, Save } from "lucide-react";

const API = import.meta.env.VITE_API_BASE_URL;

interface SmtpForm {
  host: string;
  port: string;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
}

export const SmtpConfig = () => {
  const [form, setForm] = useState<SmtpForm>({
    host: "smtp.gmail.com", port: "587", secure: false,
    user: "", pass: "", fromName: "", fromEmail: ""
  });
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetch(`${API}/smtp-config`, {
      headers: { Authorization: `Basic ${localStorage.getItem("icecast_auth")}` }
    })
      .then(r => r.json())
      .then(d => { if (d.success && d.data) setForm(f => ({ ...f, ...d.data, port: String(d.data.port || 587) })); })
      .catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/smtp-config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Basic ${localStorage.getItem("icecast_auth")}` },
        body: JSON.stringify({ ...form, port: parseInt(form.port) })
      });
      const d = await res.json();
      if (d.success) toast.success("Configuración SMTP guardada");
      else toast.error(d.error || "Error al guardar");
    } catch { toast.error("Error de conexión"); }
    setSaving(false);
  };

  const test = async () => {
    setTesting(true);
    try {
      const res = await fetch(`${API}/smtp-test`, {
        method: "POST",
        headers: { Authorization: `Basic ${localStorage.getItem("icecast_auth")}` }
      });
      const d = await res.json();
      if (d.success) toast.success(d.message);
      else toast.error(d.error || "Error al enviar test");
    } catch { toast.error("Error de conexión"); }
    setTesting(false);
  };

  const f = (field: keyof SmtpForm, val: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: val }));

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
          <Mail size={18} className="text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Configuración de Email (SMTP)</h3>
          <p className="text-xs text-gray-500">Se usa para notificar a clientes al aprobar su cuenta</p>
        </div>
      </div>

      {/* Gmail hint */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-semibold mb-1">💡 Para Gmail:</p>
        <ol className="list-decimal list-inside space-y-1 text-xs text-blue-700">
          <li>Activa la verificación en 2 pasos en tu cuenta Google</li>
          <li>Ve a <strong>Seguridad → Contraseñas de aplicaciones</strong></li>
          <li>Crea una contraseña para "Correo" y úsala aquí (no tu contraseña real)</li>
        </ol>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 sm:col-span-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Servidor SMTP</label>
          <input value={form.host} onChange={e => f("host", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
            placeholder="smtp.gmail.com" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Puerto</label>
          <select value={form.port} onChange={e => f("port", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white">
            <option value="587">587 (TLS - recomendado)</option>
            <option value="465">465 (SSL)</option>
            <option value="25">25 (sin cifrado)</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Usuario (email)</label>
          <input value={form.user} onChange={e => f("user", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
            placeholder="tucuenta@gmail.com" type="email" />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Contraseña de aplicación</label>
          <div className="relative">
            <input value={form.pass} onChange={e => f("pass", e.target.value)}
              type={showPass ? "text" : "password"}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-blue-400"
              placeholder="xxxx xxxx xxxx xxxx" />
            <button onClick={() => setShowPass(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Nombre del remitente</label>
          <input value={form.fromName} onChange={e => f("fromName", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
            placeholder="Radio Admin" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Email del remitente</label>
          <input value={form.fromEmail} onChange={e => f("fromEmail", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
            placeholder="noreply@tudominio.com" type="email" />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-50">
          <Save size={15} /> {saving ? "Guardando..." : "Guardar"}
        </button>
        <button onClick={test} disabled={testing || !form.user}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200 transition-all disabled:opacity-50">
          <Send size={15} /> {testing ? "Enviando..." : "Enviar email de prueba"}
        </button>
      </div>
    </div>
  );
};
