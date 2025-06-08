
import { LunaPlayer } from "./LunaPlayer";
import { MinimalPlayer, PremiumPlayer, VintagePlayer } from "./PlayerComponents";
import { FormData } from "./types";

interface PlayerPreviewProps {
  style: string;
  radioName: string;
  layout: string;
  showVisualizer?: boolean;
  showVolume?: boolean;
  showProgress?: boolean;
  description?: string;
  backgroundImage?: string;
  logoImage?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
}

export const PlayerPreview = ({ 
  style, 
  radioName, 
  layout, 
  showVisualizer, 
  showVolume, 
  showProgress, 
  description,
  backgroundImage,
  logoImage,
  primaryColor = "#3b82f6",
  secondaryColor = "#8b5cf6",
  fontFamily = "inter"
}: PlayerPreviewProps) => {
  const data: FormData = { 
    style: style as any, 
    radioName: radioName || "Mi Radio", 
    layout: layout as any, 
    showVisualizer: showVisualizer || false, 
    showVolume: showVolume || true, 
    showProgress: showProgress || true, 
    description,
    backgroundImage,
    logoImage,
    primaryColor,
    secondaryColor,
    fontFamily: fontFamily as any
  };

  // Debug information component
  const DebugInfo = () => (
    <div className="mb-4 p-3 bg-muted/50 rounded-lg border text-xs space-y-1">
      <div className="font-semibold text-muted-foreground">Vista Previa - Información de Debug:</div>
      {style.startsWith("luna-") ? (
        <>
          <div><span className="font-medium">Estilo Luna:</span> {style}</div>
          <div><span className="font-medium">Layout:</span> {layout}</div>
        </>
      ) : (
        <>
          <div><span className="font-medium">Estilo:</span> {style}</div>
          <div><span className="font-medium">Tamaño/Layout:</span> {layout}</div>
          <div><span className="font-medium">Fuente:</span> {fontFamily}</div>
        </>
      )}
      <div><span className="font-medium">Color Primario:</span> {primaryColor}</div>
      <div><span className="font-medium">Color Secundario:</span> {secondaryColor}</div>
      <div><span className="font-medium">Visualizador:</span> {showVisualizer ? "Sí" : "No"}</div>
      <div><span className="font-medium">Volumen:</span> {showVolume ? "Sí" : "No"}</div>
      <div><span className="font-medium">Progreso:</span> {showProgress ? "Sí" : "No"}</div>
    </div>
  );
  
  return (
    <div className="w-full">
      <DebugInfo />
      <div className="flex justify-center">
        {style.startsWith("luna-") ? (
          <LunaPlayer data={data} />
        ) : style === "retro" || style === "vintage" ? (
          <VintagePlayer data={data} />
        ) : style === "premium" || style === "modernista" || style === "neón" ? (
          <PremiumPlayer data={data} />
        ) : (
          <MinimalPlayer data={data} />
        )}
      </div>
    </div>
  );
};
