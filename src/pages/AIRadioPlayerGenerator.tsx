
import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Wand2, Download, Copy, Music } from "lucide-react";
import { toast } from "sonner";

// Esquema para el formulario de generación de player
const formSchema = z.object({
  radioName: z.string().min(2, {
    message: "El nombre de la radio debe tener al menos 2 caracteres.",
  }),
  description: z.string().optional(),
  color: z.string().optional(),
  style: z.enum(["minimal", "modernista", "retro", "neón", "glassmorphism"]),
  features: z.array(z.string()).optional(),
});

// Estilos predefinidos de los reproductores
const playerStyles = [
  {
    id: "minimal",
    name: "Minimalista",
    description: "Diseño limpio y sencillo con controles básicos",
    preview: "bg-white dark:bg-zinc-900 text-black dark:text-white shadow-sm border"
  },
  {
    id: "modernista",
    name: "Modernista",
    description: "Interfaz moderna con efectos visuales suaves",
    preview: "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
  },
  {
    id: "retro",
    name: "Retro",
    description: "Estilo vintage con elementos clásicos de radio",
    preview: "bg-amber-100 dark:bg-amber-900 border-2 border-amber-700 text-amber-900 dark:text-amber-100"
  },
  {
    id: "neón",
    name: "Neón",
    description: "Colores vibrantes con efectos de brillo tipo neón",
    preview: "bg-black text-[#0ff] shadow-[0_0_10px_#0ff] border border-[#0ff]"
  },
  {
    id: "glassmorphism",
    name: "Glassmorphism",
    description: "Efecto de vidrio translúcido con desenfoque",
    preview: "bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-lg"
  }
];

// Componente de ejemplo de player (simplificado)
const PlayerPreview = ({ style, radioName }) => {
  const playerStyle = playerStyles.find(s => s.id === style) || playerStyles[0];
  
  return (
    <div className={`p-4 rounded-lg transition-all ${playerStyle.preview} w-full max-w-md mx-auto`}>
      <div className="flex items-center justify-between mb-2">
        <div className="font-bold truncate">{radioName || "Nombre de la Radio"}</div>
        <div className="text-xs opacity-70">EN VIVO</div>
      </div>
      <div className="flex items-center justify-center space-x-4 py-3">
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors">
          <Music size={18} />
        </button>
      </div>
      <div className="text-center text-xs opacity-70">Reproductor de ejemplo</div>
    </div>
  );
};

// Componentes para los diferentes tipos de reproductores generados
const SimplePlayer = ({ data }) => {
  return (
    <div className={`p-4 rounded-lg ${data.style === "minimal" ? "bg-white dark:bg-zinc-900 text-black dark:text-white border" : 
                      data.style === "modernista" ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white" :
                      data.style === "retro" ? "bg-amber-100 dark:bg-amber-900 border-2 border-amber-700 text-amber-900 dark:text-amber-100" :
                      data.style === "neón" ? "bg-black text-[#0ff] shadow-[0_0_10px_#0ff] border border-[#0ff]" :
                      "bg-white/20 backdrop-blur-md border border-white/30 text-white"
                    } w-full`}>
      <div className="flex items-center justify-between mb-2">
        <div className="font-bold truncate">{data.radioName}</div>
        <div className="text-xs opacity-70">EN VIVO</div>
      </div>
      <div className="flex items-center justify-between py-3">
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        </button>
        <div className="w-full mx-4">
          <div className="h-1 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white w-1/3 rounded-full"></div>
          </div>
        </div>
        <div className="text-xs">03:45</div>
      </div>
    </div>
  );
};

const ModernPlayer = ({ data }) => {
  // Implementación específica para el player moderno
  const bgGradient = data.style === "neón" 
    ? "bg-black shadow-[0_0_20px_rgba(0,255,255,0.7)]" 
    : "bg-gradient-to-r from-blue-500 to-purple-600";

  return (
    <div className={`p-5 rounded-xl ${bgGradient} text-white w-full`}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-bold text-lg">{data.radioName}</h3>
          <p className="text-xs opacity-70">{data.description || "Transmitiendo en vivo"}</p>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
          <span className="text-xs font-medium">EN VIVO</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center space-x-2 py-3">
        <button className="w-12 h-12 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        </button>
        
        <div className="flex-1 mx-3 space-y-1">
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white w-2/5 rounded-full"></div>
          </div>
          <div className="flex justify-between text-xs opacity-80">
            <span>01:24</span>
            <span>04:32</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button className="w-8 h-8 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
          </button>
          <button className="w-8 h-8 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h.01"></path><path d="M7 20v-4"></path><path d="M12 20v-8"></path><path d="M17 20V8"></path><path d="M22 4v16"></path></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const RetroPlayer = ({ data }) => {
  // Implementación específica para el player retro
  return (
    <div className={`p-5 rounded-lg ${data.style === "retro" ? "bg-amber-100 dark:bg-amber-900 border-2 border-amber-700" : "bg-stone-200 dark:bg-stone-800 border-2 border-stone-400"} w-full`}>
      <div className="flex flex-col items-center">
        <div className="w-full flex justify-between mb-3">
          <div className="font-serif font-bold">{data.radioName}</div>
          <div className="text-xs px-2 py-1 bg-red-500 text-white rounded">EN VIVO</div>
        </div>
        
        <div className="w-full h-8 bg-stone-300 dark:bg-stone-700 rounded mb-4 px-2 flex items-center">
          <div className="w-1 h-4 bg-red-500 animate-pulse mr-1"></div>
          <div className="w-1 h-5 bg-red-500 animate-pulse mr-1"></div>
          <div className="w-1 h-3 bg-red-500 animate-pulse mr-1"></div>
          <div className="w-1 h-6 bg-red-500 animate-pulse mr-1"></div>
          <div className="w-1 h-4 bg-red-500 animate-pulse mr-1"></div>
          <div className="w-1 h-2 bg-red-500 animate-pulse mr-1"></div>
          <div className="w-1 h-5 bg-red-500 animate-pulse mr-1"></div>
          <div className="flex-1"></div>
          <div className="text-xs font-mono">FM 101.5</div>
        </div>
        
        <div className="flex space-x-4">
          <button className="w-12 h-12 rounded-full border-2 border-amber-700 dark:border-amber-500 flex items-center justify-center hover:bg-amber-200 dark:hover:bg-amber-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>
          </button>
          <button className="w-12 h-12 rounded-full border-2 border-amber-700 dark:border-amber-500 flex items-center justify-center hover:bg-amber-200 dark:hover:bg-amber-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </button>
          <button className="w-12 h-12 rounded-full border-2 border-amber-700 dark:border-amber-500 flex items-center justify-center hover:bg-amber-200 dark:hover:bg-amber-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><polygon points="19 5 19 19"></polygon></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente principal
const AIRadioPlayerGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlayers, setGeneratedPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [generatedCode, setGeneratedCode] = useState("");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      radioName: "",
      description: "",
      color: "",
      style: "minimal",
      features: [],
    },
  });

  const onSubmit = (data) => {
    setIsGenerating(true);

    // Simular llamada a la API de generación
    setTimeout(() => {
      const newPlayers = [];
      
      // Crear jugadores de ejemplo basados en el estilo seleccionado
      if (data.style === "minimal" || data.style === "glassmorphism") {
        newPlayers.push({
          id: 'simple-' + Date.now(),
          type: 'simple',
          ...data
        });
      } else if (data.style === "modernista" || data.style === "neón") {
        newPlayers.push({
          id: 'modern-' + Date.now(),
          type: 'modern',
          ...data
        });
      } else {
        newPlayers.push({
          id: 'retro-' + Date.now(),
          type: 'retro',
          ...data
        });
      }

      // Generar código de ejemplo
      const sampleCode = `
// Código React para el reproductor ${data.style}
import React, { useState, useEffect } from 'react';

export const RadioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  
  // Función para reproducir/pausar
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    // Aquí iría la lógica para controlar el audio
  };

  return (
    <div className="${
      data.style === "minimal" ? "bg-white shadow rounded-lg p-4" :
      data.style === "modernista" ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl p-5" :
      data.style === "retro" ? "bg-amber-100 border-2 border-amber-700 rounded-lg p-4" :
      data.style === "neón" ? "bg-black text-[#0ff] shadow-[0_0_10px_#0ff] rounded-lg p-4" :
      "bg-white/20 backdrop-blur-md border border-white/30 rounded-lg p-4"
    }">
      <h3 className="font-bold text-lg">${data.radioName}</h3>
      <div className="flex items-center justify-between mt-3">
        <button 
          onClick={togglePlay} 
          className="w-12 h-12 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30"
        >
          {isPlaying ? "⏸️" : "▶️"}
        </button>
        <div className="w-full mx-4">
          <div className="h-1.5 bg-white/20 rounded-full">
            <div className="h-full bg-white w-1/3 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
      `;

      setGeneratedPlayers(newPlayers);
      setGeneratedCode(sampleCode);
      setSelectedPlayer(newPlayers[0]);
      setIsGenerating(false);
      
      toast.success("¡Reproductor generado con éxito!");
    }, 2000);
  };

  const renderPlayerComponent = (player) => {
    switch(player.type) {
      case 'simple':
        return <SimplePlayer data={player} />;
      case 'modern':
        return <ModernPlayer data={player} />;
      case 'retro':
        return <RetroPlayer data={player} />;
      default:
        return null;
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    toast.success("Código copiado al portapapeles");
  };

  return (
    <>
      <PageHeader 
        heading="Generador de Reproductores de Audio con IA" 
        text="Crea reproductores de audio personalizados para tus puntos de montaje utilizando IA"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Diseña tu reproductor</CardTitle>
            <CardDescription>
              Configura el estilo y las características que deseas para tu reproductor de radio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción (opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Música las 24 horas" 
                          className="resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="style"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estilo del Reproductor</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                        {playerStyles.map(style => (
                          <div key={style.id} className="text-center">
                            <FormControl>
                              <button
                                type="button"
                                className={`w-full h-20 rounded-md border-2 transition-all ${
                                  field.value === style.id
                                    ? "border-primary ring-2 ring-primary ring-opacity-50"
                                    : "border-transparent hover:border-muted-foreground/25"
                                } ${style.preview}`}
                                onClick={() => field.onChange(style.id)}
                                aria-label={style.name}
                              />
                            </FormControl>
                            <div className="text-xs mt-1 font-medium">{style.name}</div>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="pt-2">
                  <PlayerPreview 
                    style={form.watch("style")} 
                    radioName={form.watch("radioName")} 
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
                      Generando...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Generar Reproductor
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          {generatedPlayers.length > 0 ? (
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="preview">Vista Previa</TabsTrigger>
                <TabsTrigger value="code">Código</TabsTrigger>
              </TabsList>
              
              <TabsContent value="preview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Reproductor Generado</CardTitle>
                    <CardDescription>
                      Vista previa del reproductor generado con IA
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedPlayer && renderPlayerComponent(selectedPlayer)}
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" onClick={copyCode}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar Código
                    </Button>
                    <Button>
                      <Download className="mr-2 h-4 w-4" />
                      Descargar
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="code">
                <Card>
                  <CardHeader>
                    <CardTitle>Código del Reproductor</CardTitle>
                    <CardDescription>
                      Código React para implementar este reproductor
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="p-4 rounded-lg bg-muted overflow-x-auto text-xs sm:text-sm">
                      <code>{generatedCode}</code>
                    </pre>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button variant="secondary" onClick={copyCode}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar Código
                    </Button>
                  </CardFooter>
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
                  Completa el formulario y haz clic en "Generar Reproductor" para crear un nuevo diseño con IA
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
