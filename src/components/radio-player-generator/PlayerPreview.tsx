
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
}

export const PlayerPreview = ({ style, radioName, layout, showVisualizer, showVolume, showProgress, description }: PlayerPreviewProps) => {
  const data: FormData = { 
    style: style as any, 
    radioName, 
    layout: layout as any, 
    showVisualizer, 
    showVolume, 
    showProgress, 
    description 
  };
  
  if (style.startsWith("luna-")) {
    return <LunaPlayer data={data} />;
  } else if (["retro", "vintage"].includes(style)) {
    return <VintagePlayer data={data} />;
  } else if (["premium", "modernista", "neón"].includes(style)) {
    return <PremiumPlayer data={data} />;
  } else {
    return <MinimalPlayer data={data} />;
  }
};
