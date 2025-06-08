
import { useState } from "react";
import { Play, Pause, Volume2, SkipBack, SkipForward, Music, Heart, Share2 } from "lucide-react";
import { FormData } from "./types";

interface PlayerProps {
  data: FormData;
}

export const MinimalPlayer = ({ data }: PlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  
  const containerStyle = data.backgroundImage ? {
    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(${data.backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  } : {};

  const getFontClass = () => {
    switch(data.fontFamily) {
      case "inter": return "font-sans";
      case "roboto": return "font-sans";
      case "poppins": return "font-sans";
      case "montserrat": return "font-sans";
      default: return "font-sans";
    }
  };

  const getLayoutClasses = () => {
    switch(data.layout) {
      case "horizontal": return "flex items-center gap-4 p-4";
      case "vertical": return "flex flex-col items-center text-center p-6 space-y-4";
      case "card": return "flex flex-col items-center text-center p-8 space-y-6 rounded-2xl";
      case "mini": return "flex items-center gap-2 p-2";
      default: return "flex items-center gap-4 p-4";
    }
  };
  
  return (
    <div 
      className={`${getFontClass()} ${getLayoutClasses()} ${
        data.style === "minimal" ? "bg-card border shadow-sm" : 
        data.style === "compact" ? "bg-muted rounded-full" :
        "bg-card/80 backdrop-blur-sm border"
      } w-full max-w-lg transition-all duration-300`}
      style={{
        ...containerStyle,
        color: data.primaryColor
      }}
    >
      {/* Album Art */}
      {data.logoImage && data.layout !== "mini" && (
        <div className={`${data.layout === "card" ? "w-24 h-24" : "w-12 h-12"} rounded-lg overflow-hidden flex-shrink-0`}>
          <img src={data.logoImage} alt={data.radioName} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className={`${data.layout === "vertical" || data.layout === "card" ? "text-center" : "text-left"}`}>
          <div className={`font-bold truncate ${data.layout === "card" ? "text-lg" : "text-sm"}`}>
            {data.radioName}
          </div>
          {data.description && (
            <div className="text-xs opacity-70 truncate mt-1">{data.description}</div>
          )}
        </div>

        {/* Progress Bar */}
        {data.showProgress && data.layout !== "mini" && (
          <div className="mt-3">
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all" 
                style={{ 
                  backgroundColor: data.primaryColor,
                  width: "33%" 
                }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className={`flex items-center ${data.layout === "mini" ? "gap-1" : "gap-2"}`}>
        {data.layout !== "mini" && (
          <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
            <SkipBack size={14} />
          </button>
        )}
        
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className={`${data.layout === "mini" ? "w-8 h-8" : "w-10 h-10"} flex items-center justify-center rounded-full transition-colors`}
          style={{ backgroundColor: data.primaryColor, color: 'white' }}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        
        {data.layout !== "mini" && (
          <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
            <SkipForward size={14} />
          </button>
        )}

        {data.showVolume && data.layout !== "mini" && (
          <div className="flex items-center gap-1 ml-2">
            <Volume2 size={14} />
            <div className="w-16 h-1 bg-muted rounded-full">
              <div 
                className="h-full rounded-full" 
                style={{ 
                  backgroundColor: data.primaryColor,
                  width: `${volume}%` 
                }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Live indicator */}
      <div className={`${data.layout === "mini" ? "ml-2" : ""}`}>
        <div className="flex items-center space-x-1 px-2 py-1 bg-red-500/20 rounded border border-red-500/30">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-red-600">LIVE</span>
        </div>
      </div>

      {/* Visualizer */}
      {data.showVisualizer && (data.layout === "card" || data.layout === "vertical") && (
        <div className="flex items-end justify-center space-x-1 py-2">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i}
              className="w-1 rounded-full animate-pulse" 
              style={{ 
                backgroundColor: data.primaryColor,
                height: `${Math.random() * 20 + 5}px`,
                animationDelay: `${i * 100}ms`
              }}
            ></div>
          ))}
        </div>
      )}
    </div>
  );
};

export const PremiumPlayer = ({ data }: PlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [isFavorite, setIsFavorite] = useState(false);
  
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

  const containerStyle = data.backgroundImage ? {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${data.backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  } : {};

  const getFontClass = () => {
    switch(data.fontFamily) {
      case "inter": return "font-sans";
      case "roboto": return "font-sans";
      case "poppins": return "font-sans";
      case "montserrat": return "font-sans";
      default: return "font-sans";
    }
  };

  return (
    <div 
      className={`${getFontClass()} p-6 rounded-xl ${getStyleClasses()} w-full max-w-2xl transition-all duration-300`}
      style={containerStyle}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1 flex items-center space-x-4">
            {data.logoImage && (
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                <img src={data.logoImage} alt={data.radioName} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-xl mb-1 truncate">{data.radioName}</h3>
              {data.description && <p className="text-sm opacity-80 truncate">{data.description}</p>}
              <p className="text-xs opacity-60 mt-1">Artista - Canción Actual</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center mb-2">
              <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
              <span className="text-xs font-medium">EN VIVO</span>
            </div>
            <div className="text-xs opacity-70">1,234 oyentes</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        {data.showProgress && (
          <div className="space-y-2">
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full w-2/5 rounded-full transition-all duration-500"
                style={{ backgroundColor: data.primaryColor }}
              ></div>
            </div>
            <div className="flex justify-between text-xs opacity-80">
              <span>02:34</span>
              <span>04:12</span>
            </div>
          </div>
        )}
        
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 transition-all">
              <SkipBack size={18} />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg"
              style={{ backgroundColor: data.primaryColor }}
            >
              {isPlaying ? <Pause size={22} /> : <Play size={22} />}
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 transition-all">
              <SkipForward size={18} />
            </button>
            <button 
              onClick={() => setIsFavorite(!isFavorite)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isFavorite ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>
          
          {data.showVolume && (
            <div className="flex items-center space-x-3">
              <Volume2 size={18} />
              <div className="w-20 h-1.5 bg-white/20 rounded-full">
                <div 
                  className="h-full rounded-full transition-all" 
                  style={{ 
                    backgroundColor: data.primaryColor,
                    width: `${volume}%` 
                  }}
                ></div>
              </div>
              <span className="text-xs w-8">{volume}%</span>
            </div>
          )}
        </div>
        
        {/* Visualizer */}
        {data.showVisualizer && (
          <div className="flex items-end justify-center space-x-1 h-8">
            {[...Array(16)].map((_, i) => (
              <div 
                key={i}
                className="w-1.5 rounded-full animate-pulse" 
                style={{ 
                  backgroundColor: data.primaryColor,
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

export const VintagePlayer = ({ data }: PlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const containerStyle = data.backgroundImage ? {
    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url(${data.backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  } : {};

  const getFontClass = () => {
    switch(data.fontFamily) {
      case "inter": return "font-serif";
      case "roboto": return "font-serif";
      case "poppins": return "font-serif";
      case "montserrat": return "font-serif";
      default: return "font-serif";
    }
  };
  
  return (
    <div 
      className={`${getFontClass()} p-5 rounded-lg ${
        data.style === "retro" ? "bg-amber-100 dark:bg-amber-900 border-2 border-amber-700 text-amber-900 dark:text-amber-100" : 
        data.style === "vintage" ? "bg-gradient-to-b from-yellow-200 to-yellow-400 border-4 border-yellow-600 text-yellow-900" :
        "bg-stone-200 dark:bg-stone-800 border-2 border-stone-400 text-stone-900 dark:text-stone-100"
      } w-full max-w-md`}
      style={containerStyle}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="text-center flex items-center justify-center space-x-3">
          {data.logoImage && (
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-current">
              <img src={data.logoImage} alt={data.radioName} className="w-full h-full object-cover" />
            </div>
          )}
          <div>
            <div className="font-bold text-lg mb-1">{data.radioName}</div>
            <div className="text-xs opacity-70">RADIO ESTACIÓN</div>
          </div>
        </div>
        
        {/* Radio Display */}
        <div className="relative">
          <div className="w-full h-20 bg-stone-300 dark:bg-stone-700 rounded border-2 border-stone-400 p-3 flex items-center">
            <div className="flex-1 flex items-center space-x-1">
              {data.showVisualizer && [...Array(20)].map((_, i) => (
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
        
        {/* Controls */}
        <div className="flex justify-center space-x-4">
          <button className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center hover:bg-current hover:text-white transition-all">
            <SkipBack size={16} />
          </button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all shadow-lg"
            style={{ 
              borderColor: data.primaryColor,
              backgroundColor: isPlaying ? data.primaryColor : 'transparent',
              color: isPlaying ? 'white' : 'inherit'
            }}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center hover:bg-current hover:text-white transition-all">
            <SkipForward size={16} />
          </button>
        </div>
        
        {/* Status */}
        <div className="text-center text-xs opacity-70">
          {isPlaying ? "♪ Reproduciendo..." : "● Pausado"}
        </div>
      </div>
    </div>
  );
};
