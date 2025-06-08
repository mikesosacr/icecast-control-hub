
import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { formSchema, FormData, GeneratedPlayer } from "@/components/radio-player-generator/types";
import { ConfigurationForm } from "@/components/radio-player-generator/ConfigurationForm";
import { PlayerPreview } from "@/components/radio-player-generator/PlayerPreview";
import { ResultsSection } from "@/components/radio-player-generator/ResultsSection";
import { generatePlayerCode } from "@/components/radio-player-generator/utils";

const AIRadioPlayerGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlayers, setGeneratedPlayers] = useState<GeneratedPlayer[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<GeneratedPlayer | null>(null);
  const [generatedCode, setGeneratedCode] = useState("");
  const [activeStyleCategory, setActiveStyleCategory] = useState("all");

  const form = useForm<FormData>({
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

  const onSubmit = (data: FormData) => {
    setIsGenerating(true);

    setTimeout(() => {
      const newPlayer: GeneratedPlayer = {
        id: Date.now(),
        type: 'enhanced',
        timestamp: new Date().toISOString(),
        radioName: data.radioName,
        description: data.description,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        style: data.style,
        layout: data.layout,
        showVisualizer: data.showVisualizer,
        showPlaylist: data.showPlaylist,
        showVolume: data.showVolume,
        showProgress: data.showProgress,
        fontFamily: data.fontFamily,
      };

      const enhancedCode = generatePlayerCode(data);
      
      setGeneratedPlayers([newPlayer]);
      setGeneratedCode(enhancedCode);
      setSelectedPlayer(newPlayer);
      setIsGenerating(false);
      
      toast.success("¡Reproductor generado con éxito!");
    }, 2000);
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
          <ConfigurationForm
            form={form}
            onSubmit={onSubmit}
            isGenerating={isGenerating}
            activeStyleCategory={activeStyleCategory}
            setActiveStyleCategory={setActiveStyleCategory}
          />
          
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              Vista Previa en Tiempo Real
            </h3>
            <div className="flex justify-center">
              <PlayerPreview 
                style={form.watch("style")} 
                radioName={form.watch("radioName") || "Mi Radio"} 
                layout={form.watch("layout")}
                showVisualizer={form.watch("showVisualizer")}
                showVolume={form.watch("showVolume")}
                showProgress={form.watch("showProgress")}
                description={form.watch("description")}
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <ResultsSection
            generatedPlayers={generatedPlayers}
            selectedPlayer={selectedPlayer}
            generatedCode={generatedCode}
            copyCode={copyCode}
            exportPlayer={exportPlayer}
          />
        </div>
      </div>
    </>
  );
};

export default AIRadioPlayerGenerator;
