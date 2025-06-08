
import { PlayerStyle, LayoutOption, FontOption } from "./types";

export const playerStyles: PlayerStyle[] = [
  {
    id: "minimal",
    name: "Minimalista",
    description: "Diseño limpio y sencillo",
    preview: "bg-white dark:bg-zinc-900 text-black dark:text-white shadow-sm border",
    category: "basic"
  },
  {
    id: "modernista",
    name: "Modernista",
    description: "Interfaz moderna con gradientes",
    preview: "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg",
    category: "premium"
  },
  {
    id: "retro",
    name: "Retro",
    description: "Estilo vintage clásico",
    preview: "bg-amber-100 dark:bg-amber-900 border-2 border-amber-700 text-amber-900 dark:text-amber-100",
    category: "themed"
  },
  {
    id: "neón",
    name: "Neón",
    description: "Colores vibrantes con brillo",
    preview: "bg-black text-[#0ff] shadow-[0_0_10px_#0ff] border border-[#0ff]",
    category: "themed"
  },
  {
    id: "glassmorphism",
    name: "Glassmorphism",
    description: "Efecto de vidrio translúcido",
    preview: "bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-lg",
    category: "premium"
  },
  {
    id: "compact",
    name: "Compacto",
    description: "Versión compacta y funcional",
    preview: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border rounded-full",
    category: "basic"
  },
  {
    id: "premium",
    name: "Premium",
    description: "Diseño profesional elegante",
    preview: "bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-2xl border border-slate-600",
    category: "premium"
  },
  {
    id: "vintage",
    name: "Vintage",
    description: "Estilo radio antigua",
    preview: "bg-gradient-to-b from-yellow-200 to-yellow-400 border-4 border-yellow-600 text-yellow-900",
    category: "themed"
  },
  {
    id: "luna-dark",
    name: "Luna Dark",
    description: "Estilo Luna oscuro elegante",
    preview: "bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white shadow-2xl border border-purple-500/30",
    category: "luna"
  },
  {
    id: "luna-light",
    name: "Luna Light",
    description: "Estilo Luna claro y moderno",
    preview: "bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800 shadow-xl border border-blue-200",
    category: "luna"
  },
  {
    id: "luna-gradient",
    name: "Luna Gradient",
    description: "Gradientes dinámicos Luna",
    preview: "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white shadow-2xl",
    category: "luna"
  },
  {
    id: "luna-glass",
    name: "Luna Glass",
    description: "Efecto cristal inspirado en Luna",
    preview: "bg-white/10 backdrop-blur-xl border border-white/20 text-white shadow-2xl",
    category: "luna"
  }
];

export const layoutOptions: LayoutOption[] = [
  { id: "horizontal", name: "Horizontal", description: "Controles en línea" },
  { id: "vertical", name: "Vertical", description: "Controles apilados" },
  { id: "card", name: "Tarjeta", description: "Formato de tarjeta completa" },
  { id: "mini", name: "Mini", description: "Versión compacta" }
];

export const fontOptions: FontOption[] = [
  { id: "inter", name: "Inter", description: "Moderno y legible" },
  { id: "roboto", name: "Roboto", description: "Clásico de Google" },
  { id: "poppins", name: "Poppins", description: "Amigable y redondeado" },
  { id: "montserrat", name: "Montserrat", description: "Elegante y profesional" }
];
