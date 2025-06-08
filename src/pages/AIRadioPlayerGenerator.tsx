
import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Wand2, Download, Copy, Music, Palette, Settings, Play, Pause, Volume2, SkipBack, SkipForward } from "lucide-react";
import { toast } from "sonner";

// Enhanced schema for the form
const formSchema = z.object({
  radioName: z.string().min(2, {
    message: "El nombre de la radio debe tener al menos 2 caracteres.",
  }),
  description: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  style: z.enum(["minimal", "modernista", "retro", "neón", "glassmorphism", "compact", "premium", "vintage"]),
  layout: z.enum(["horizontal", "vertical", "card", "mini"]),
  showVisualizer: z.boolean().optional(),
  showPlaylist: z.boolean().optional(),
  showVolume: z.boolean().optional(),
  showProgress: z.boolean().optional(),
  fontFamily: z.enum(["inter", "roboto", "poppins", "montserrat"]).optional(),
});

// Enhanced player styles
const playerStyles = [
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
  }
];

// Layout options
const layoutOptions = [
  { id: "horizontal", name: "Horizontal", description: "Controles en línea" },
  { id: "vertical", name: "Vertical", description: "Controles apilados" },
  { id: "card", name: "Tarjeta", description: "Formato de tarjeta completa" },
  { id: "mini", name: "Mini", description: "Versión compacta" }
];

// Font options
const fontOptions = [
  { id: "inter", name: "Inter", description: "Moderno y legible" },
  { id: "roboto", name: "Roboto", description: "Clásico de Google" },
  { id: "poppins", name: "Poppins", description: "Amigable y redondeado" },
  { id: "montserrat", name: "Montserrat", description: "Elegante y profesional" }
];

// Enhanced player components
const MinimalPlayer = ({ data }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  
  return (
    <div className={`p-4 rounded-lg ${data.style === "minimal" ? "bg-white dark:bg-zinc-900 border" : 
                      data.style === "compact" ? "bg-gray-100 dark:bg-gray-800 rounded-full flex items-center" :
                      "bg-white/20 backdrop-blur-md border border-white/30"
                    } w-full transition-all duration-300`}>
      <div className={`${data.layout === "mini" ? "flex items-center space-x-3" : "space-y-3"}`}>
        <div className={`${data.layout === "vertical" ? "text-center" : "flex items-center justify-between"}`}>
          <div className="flex-1">
            <div className="font-bold truncate text-sm">{data.radioName}</div>
            {data.description && <div className="text-xs opacity-70 truncate">{data.description}</div>}
          </div>
          {data.layout !== "mini" && <div className="text-xs opacity-70 px-2 py-1 bg-red-500 text-white rounded">EN VIVO</div>}
        </div>
        
        <div className={`${data.layout === "vertical" ? "flex flex-col items-center space-y-2" : "flex items-center space-x-3"}`}>
          {data.showProgress && data.layout !== "mini" && (
            <div className="flex-1">
              <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-current w-1/3 rounded-full transition-all"></div>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            {data.showVolume && data.layout !== "mini" && (
              <>
                <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
                  <SkipBack size={14} />
                </button>
              </>
            )}
            
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            
            {data.showVolume && data.layout !== "mini" && (
              <>
                <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
                  <SkipForward size={14} />
                </button>
                <div className="flex items-center space-x-1">
                  <Volume2 size={14} />
                  <div className="w-16 h-1 bg-white/30 rounded-full">
                    <div className="h-full bg-current rounded-full" style={{ width: `${volume}%` }}></div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {data.showVisualizer && data.layout === "card" && (
          <div className="flex items-center justify-center space-x-1 py-2">
            {[...Array(12)].map((_, i) => (
              <div 
                key={i}
                className="w-1 bg-current rounded-full animate-pulse" 
                style={{ 
                  height: `${Math.random() * 20 + 5}px`,
                  animationDelay: `${i * 100}ms`
                }}
              ></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const PremiumPlayer = ({ data }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  
  const getStyleClasses = () => {
    switch(data.style) {
      case "premium":
        return "bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-2xl border border-slate-600";
      case "modernista":
        return "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-xl";
      case "neón":
        return "bg-black text-[#0ff] shadow-[0_0_20px_rgba(0,255,255,0.7)] border border-[#0ff]";
      default:
        return "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg";
    }
  };

  return (
    <div className={`p-6 rounded-xl ${getStyleClasses()} w-full transition-all duration-300`}>
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-bold text-xl mb-1">{data.radioName}</h3>
            {data.description && <p className="text-sm opacity-80">{data.description}</p>}
            <p className="text-xs opacity-60 mt-1">Artista - Canción Actual</p>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center mb-2">
              <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
              <span className="text-xs font-medium">EN VIVO</span>
            </div>
            <div className="text-xs opacity-70">1,234 oyentes</div>
          </div>
        </div>
        
        {data.showProgress && (
          <div className="space-y-2">
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white w-2/5 rounded-full transition-all duration-500"></div>
            </div>
            <div className="flex justify-between text-xs opacity-80">
              <span>02:34</span>
              <span>04:12</span>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 transition-all">
              <SkipBack size={18} />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-14 h-14 rounded-full flex items-center justify-center bg-white/30 hover:bg-white/40 transition-all shadow-lg"
            >
              {isPlaying ? <Pause size={22} /> : <Play size={22} />}
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 transition-all">
              <SkipForward size={18} />
            </button>
          </div>
          
          {data.showVolume && (
            <div className="flex items-center space-x-3">
              <Volume2 size={18} />
              <div className="w-20 h-1.5 bg-white/20 rounded-full">
                <div className="h-full bg-white rounded-full transition-all" style={{ width: `${volume}%` }}></div>
              </div>
              <span className="text-xs w-8">{volume}%</span>
            </div>
          )}
        </div>
        
        {data.showVisualizer && (
          <div className="flex items-end justify-center space-x-1 h-8">
            {[...Array(16)].map((_, i) => (
              <div 
                key={i}
                className="w-1.5 bg-white/60 rounded-full animate-pulse" 
                style={{ 
                  height: `${Math.random() * 24 + 8}px`,
                  animationDelay: `${i * 80}ms`,
                  animationDuration: `${Math.random() * 0.5 + 0.5}s`
                }}
              ></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const VintagePlayer = ({ data }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  return (
    <div className={`p-5 rounded-lg ${
      data.style === "retro" ? "bg-amber-100 dark:bg-amber-900 border-2 border-amber-700" : 
      data.style === "vintage" ? "bg-gradient-to-b from-yellow-200 to-yellow-400 border-4 border-yellow-600 text-yellow-900" :
      "bg-stone-200 dark:bg-stone-800 border-2 border-stone-400"
    } w-full font-serif`}>
      <div className="space-y-4">
        <div className="text-center">
          <div className="font-bold text-lg mb-1">{data.radioName}</div>
          <div className="text-xs opacity-70">RADIO ESTACIÓN</div>
        </div>
        
        <div className="relative">
          <div className="w-full h-20 bg-stone-300 dark:bg-stone-700 rounded border-2 border-stone-400 p-3 flex items-center">
            <div className="flex-1 flex items-center space-x-1">
              {[...Array(20)].map((_, i) => (
                <div 
                  key={i}
                  className="w-1 bg-red-500 rounded-full animate-pulse" 
                  style={{ 
                    height: `${Math.random() * 30 + 10}px`,
                    animationDelay: `${i * 100}ms`
                  }}
                ></div>
              ))}
            </div>
            <div className="text-right">
              <div className="text-xs font-mono">FM 101.5</div>
              <div className="text-xs opacity-70">MHz</div>
            </div>
          </div>
          
          <div className="absolute top-2 right-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        <div className="flex justify-center space-x-4">
          <button className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center hover:bg-current hover:text-white transition-all">
            <SkipBack size={16} />
          </button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-16 h-16 rounded-full border-4 border-current flex items-center justify-center hover:bg-current hover:text-white transition-all shadow-lg"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center hover:bg-current hover:text-white transition-all">
            <SkipForward size={16} />
          </button>
        </div>
        
        <div className="text-center text-xs opacity-70">
          {isPlaying ? "♪ Reproduciendo..." : "● Pausado"}
        </div>
      </div>
    </div>
  );
};

// Player preview component
const PlayerPreview = ({ style, radioName, layout, showVisualizer, showVolume, showProgress }) => {
  const data = { style, radioName, layout, showVisualizer, showVolume, showProgress };
  
  if (["retro", "vintage"].includes(style)) {
    return <VintagePlayer data={data} />;
  } else if (["premium", "modernista", "neón"].includes(style)) {
    return <PremiumPlayer data={data} />;
  } else {
    return <MinimalPlayer data={data} />;
  }
};

// Main component
const AIRadioPlayerGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlayers, setGeneratedPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [generatedCode, setGeneratedCode] = useState("");
  const [activeStyleCategory, setActiveStyleCategory] = useState("all");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      radioName: "",
      description: "",
      primaryColor: "#3b82f6",
      secondaryColor: "#8b5cf6",
      style: "minimal",
      layout: "horizontal",
      showVisualizer: true,
      showPlaylist: false,
      showVolume: true,
      showProgress: true,
      fontFamily: "inter",
    },
  });

  const filteredStyles = activeStyleCategory === "all" 
    ? playerStyles 
    : playerStyles.filter(style => style.category === activeStyleCategory);

  const onSubmit = (data) => {
    setIsGenerating(true);

    setTimeout(() => {
      const newPlayer = {
        id: Date.now(),
        type: 'enhanced',
        ...data,
        timestamp: new Date().toISOString()
      };

      // Generate enhanced code
      const enhancedCode = generatePlayerCode(data);
      
      setGeneratedPlayers([newPlayer]);
      setGeneratedCode(enhancedCode);
      setSelectedPlayer(newPlayer);
      setIsGenerating(false);
      
      toast.success("¡Reproductor generado con éxito!");
    }, 2000);
  };

  const generatePlayerCode = (data) => {
    return `
// Reproductor ${data.style} generado con IA
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, SkipBack, SkipForward } from 'lucide-react';

export const AIRadioPlayer = ({ 
  streamUrl = "https://tu-servidor.com/stream",
  radioName = "${data.radioName}",
  description = "${data.description || ''}"
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(${data.showVolume ? '80' : '100'});
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    audio.addEventListener('timeupdate', updateTime);
    
    return () => audio.removeEventListener('timeupdate', updateTime);
  }, []);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        await audio.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Error al reproducir:', error);
    }
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  return (
    <div className="${getPlayerClasses(data)}">
      <audio 
        ref={audioRef}
        src={streamUrl}
        onLoadStart={() => console.log('Cargando stream...')}
        onError={(e) => console.error('Error de audio:', e)}
      />
      
      ${generatePlayerContent(data)}
    </div>
  );
};

// Estilos CSS adicionales (si usas CSS modules o styled-components)
const playerStyles = {
  container: {
    fontFamily: '${data.fontFamily === 'inter' ? 'Inter' : data.fontFamily === 'roboto' ? 'Roboto' : data.fontFamily === 'poppins' ? 'Poppins' : 'Montserrat'}, sans-serif',
    transition: 'all 0.3s ease',
  }
};

export default AIRadioPlayer;
    `.trim();
  };

  const getPlayerClasses = (data) => {
    const baseClasses = "p-4 rounded-lg w-full transition-all duration-300";
    
    switch(data.style) {
      case "minimal":
        return `${baseClasses} bg-white dark:bg-zinc-900 text-black dark:text-white border shadow-sm`;
      case "modernista":
        return `${baseClasses} bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-xl`;
      case "premium":
        return `${baseClasses} bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-2xl border border-slate-600`;
      case "neón":
        return `${baseClasses} bg-black text-[#0ff] shadow-[0_0_20px_rgba(0,255,255,0.7)] border border-[#0ff]`;
      case "glassmorphism":
        return `${baseClasses} bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-lg`;
      case "retro":
        return `${baseClasses} bg-amber-100 dark:bg-amber-900 border-2 border-amber-700 text-amber-900 dark:text-amber-100`;
      case "vintage":
        return `${baseClasses} bg-gradient-to-b from-yellow-200 to-yellow-400 border-4 border-yellow-600 text-yellow-900`;
      case "compact":
        return `${baseClasses} bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border rounded-full`;
      default:
        return baseClasses;
    }
  };

  const generatePlayerContent = (data) => {
    return `
      <div className="${data.layout === 'vertical' ? 'space-y-4' : 'flex items-center justify-between'}">
        <div className="flex-1">
          <h3 className="font-bold text-lg">{radioName}</h3>
          ${data.description ? '<p className="text-sm opacity-80">{description}</p>' : ''}
        </div>
        
        <div className="flex items-center space-x-3">
          ${data.showVolume ? '<button onClick={() => {/* Previous track */}}><SkipBack size={18} /></button>' : ''}
          <button onClick={togglePlay} className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          ${data.showVolume ? '<button onClick={() => {/* Next track */}}><SkipForward size={18} /></button>' : ''}
          
          ${data.showVolume ? `
          <div className="flex items-center space-x-2">
            <Volume2 size={16} />
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={volume}
              onChange={(e) => handleVolumeChange(e.target.value)}
              className="w-20 h-1 bg-white/30 rounded-full"
            />
          </div>` : ''}
        </div>
        
        ${data.showProgress ? `
        <div className="w-full mt-3">
          <div className="h-1 bg-white/30 rounded-full">
            <div className="h-full bg-white rounded-full w-1/3"></div>
          </div>
        </div>` : ''}
        
        ${data.showVisualizer ? `
        <div className="flex items-center justify-center space-x-1 mt-3">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="w-1 bg-current rounded-full animate-pulse" style={{height: Math.random() * 20 + 5 + 'px'}}></div>
          ))}
        </div>` : ''}
      </div>
    `;
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    toast.success("Código copiado al portapapeles");
  };

  const exportPlayer = () => {
    const blob = new Blob([generatedCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.getValues('radioName').replace(/\s+/g, '')}-player.jsx`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Reproductor exportado como archivo");
  };

  return (
    <>
      <PageHeader 
        heading="Generador de Reproductores de Audio con IA" 
        text="Crea reproductores de audio personalizados y avanzados para tus puntos de montaje utilizando IA"
      />
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Configuración del Reproductor
              </CardTitle>
              <CardDescription>
                Personaliza todos los aspectos de tu reproductor de radio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="radioName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de la Radio</FormLabel>
                          <FormControl>
                            <Input placeholder="Mi Radio Online" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="layout"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diseño</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un diseño" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {layoutOptions.map(layout => (
                                <SelectItem key={layout.id} value={layout.id}>
                                  <div>
                                    <div className="font-medium">{layout.name}</div>
                                    <div className="text-xs text-muted-foreground">{layout.description}</div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Música las 24 horas del día" 
                            className="resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-base">Estilo del Reproductor</FormLabel>
                      <div className="flex gap-1">
                        {["all", "basic", "premium", "themed"].map(category => (
                          <Button
                            key={category}
                            type="button"
                            variant={activeStyleCategory === category ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveStyleCategory(category)}
                          >
                            {category === "all" ? "Todos" : 
                             category === "basic" ? "Básicos" :
                             category === "premium" ? "Premium" : "Temáticos"}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="style"
                      render={({ field }) => (
                        <FormItem>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {filteredStyles.map(style => (
                              <div key={style.id} className="text-center">
                                <FormControl>
                                  <button
                                    type="button"
                                    className={`w-full h-16 rounded-md border-2 transition-all text-xs ${
                                      field.value === style.id
                                        ? "border-primary ring-2 ring-primary ring-opacity-50"
                                        : "border-transparent hover:border-muted-foreground/25"
                                    } ${style.preview}`}
                                    onClick={() => field.onChange(style.id)}
                                  >
                                    {style.name}
                                  </button>
                                </FormControl>
                                <div className="text-xs mt-1 font-medium">{style.name}</div>
                                <div className="text-xs text-muted-foreground">{style.description}</div>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <FormLabel className="text-base flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Características
                    </FormLabel>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="showVisualizer"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-y-0">
                            <FormLabel className="text-sm">Visualizador</FormLabel>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="showVolume"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-y-0">
                            <FormLabel className="text-sm">Control de Volumen</FormLabel>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="showProgress"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-y-0">
                            <FormLabel className="text-sm">Barra de Progreso</FormLabel>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="showPlaylist"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-y-0">
                            <FormLabel className="text-sm">Lista de Reproducción</FormLabel>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="primaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color Primario</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input type="color" {...field} className="w-12 h-10 p-1 border" />
                              <Input {...field} placeholder="#3b82f6" className="flex-1" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="secondaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color Secundario</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input type="color" {...field} className="w-12 h-10 p-1 border" />
                              <Input {...field} placeholder="#8b5cf6" className="flex-1" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="fontFamily"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fuente</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {fontOptions.map(font => (
                                <SelectItem key={font.id} value={font.id}>
                                  <div>
                                    <div className="font-medium">{font.name}</div>
                                    <div className="text-xs text-muted-foreground">{font.description}</div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generando reproductor personalizado...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Generar Reproductor con IA
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Vista Previa en Tiempo Real
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PlayerPreview 
                style={form.watch("style")} 
                radioName={form.watch("radioName") || "Mi Radio"} 
                layout={form.watch("layout")}
                showVisualizer={form.watch("showVisualizer")}
                showVolume={form.watch("showVolume")}
                showProgress={form.watch("showProgress")}
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          {generatedPlayers.length > 0 ? (
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="preview">Vista Previa</TabsTrigger>
                <TabsTrigger value="code">Código</TabsTrigger>
                <TabsTrigger value="export">Exportar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="preview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Reproductor Generado</CardTitle>
                    <CardDescription>
                      Vista previa interactiva del reproductor generado con IA
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedPlayer && (
                      <PlayerPreview 
                        style={selectedPlayer.style}
                        radioName={selectedPlayer.radioName}
                        layout={selectedPlayer.layout}
                        showVisualizer={selectedPlayer.showVisualizer}
                        showVolume={selectedPlayer.showVolume}
                        showProgress={selectedPlayer.showProgress}
                      />
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="text-sm text-muted-foreground">
                      Generado: {selectedPlayer && new Date(selectedPlayer.timestamp).toLocaleString()}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={copyCode}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copiar
                      </Button>
                      <Button onClick={exportPlayer}>
                        <Download className="mr-2 h-4 w-4" />
                        Exportar
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="code">
                <Card>
                  <CardHeader>
                    <CardTitle>Código del Reproductor</CardTitle>
                    <CardDescription>
                      Código React completo y optimizado para tu reproductor
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <pre className="p-4 rounded-lg bg-muted overflow-x-auto text-xs max-h-96 scrollbar-modern">
                        <code>{generatedCode}</code>
                      </pre>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="absolute top-2 right-2"
                        onClick={copyCode}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="export">
                <Card>
                  <CardHeader>
                    <CardTitle>Opciones de Exportación</CardTitle>
                    <CardDescription>
                      Exporta tu reproductor en diferentes formatos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button variant="outline" onClick={exportPlayer} className="h-auto p-4">
                        <div className="text-left">
                          <div className="font-medium">Componente React</div>
                          <div className="text-sm text-muted-foreground">Archivo .jsx listo para usar</div>
                        </div>
                      </Button>
                      
                      <Button variant="outline" onClick={() => toast.info("Próximamente disponible")} className="h-auto p-4">
                        <div className="text-left">
                          <div className="font-medium">HTML + CSS</div>
                          <div className="text-sm text-muted-foreground">Código HTML independiente</div>
                        </div>
                      </Button>
                      
                      <Button variant="outline" onClick={() => toast.info("Próximamente disponible")} className="h-auto p-4">
                        <div className="text-left">
                          <div className="font-medium">WordPress Plugin</div>
                          <div className="text-sm text-muted-foreground">Plugin para WordPress</div>
                        </div>
                      </Button>
                      
                      <Button variant="outline" onClick={() => toast.info("Próximamente disponible")} className="h-auto p-4">
                        <div className="text-left">
                          <div className="font-medium">Embed Code</div>
                          <div className="text-sm text-muted-foreground">Código iframe embebido</div>
                        </div>
                      </Button>
                    </div>
                    
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Instrucciones de Instalación</h4>
                      <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                        <li>Descarga el archivo del reproductor</li>
                        <li>Importa el componente en tu proyecto React</li>
                        <li>Configura la URL de tu stream de Icecast</li>
                        <li>Personaliza los estilos según tus necesidades</li>
                      </ol>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Resultados</CardTitle>
                <CardDescription>
                  Aquí aparecerán los reproductores generados por la IA
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-6 mb-4">
                  <Music size={32} className="text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium mb-2">Ningún reproductor generado</h3>
                <p className="text-muted-foreground max-w-xs mx-auto">
                  Completa la configuración y haz clic en "Generar Reproductor" para crear un diseño personalizado con IA
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default AIRadioPlayerGenerator;
