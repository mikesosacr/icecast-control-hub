
import { useState } from "react";
import { Play, Pause, Volume2, SkipBack, SkipForward } from "lucide-react";
import { FormData } from "./types";

interface PlayerProps {
  data: FormData;
}

export const MinimalPlayer = ({ data }: PlayerProps) => {
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

export const PremiumPlayer = ({ data }: PlayerProps) => {
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

export const VintagePlayer = ({ data }: PlayerProps) => {
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
