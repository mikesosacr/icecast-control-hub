
import { useState } from "react";
import { Music, Play, Pause, Volume2, SkipBack, SkipForward, Heart, Share2, Repeat, Shuffle } from "lucide-react";
import { FormData } from "./types";

interface LunaPlayerProps {
  data: FormData;
}

export const LunaPlayer = ({ data }: LunaPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const getLunaStyles = () => {
    switch(data.style) {
      case "luna-dark":
        return "bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white shadow-2xl border border-purple-500/30";
      case "luna-light":
        return "bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800 shadow-xl border border-blue-200";
      case "luna-gradient":
        return "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white shadow-2xl";
      case "luna-glass":
        return "bg-white/10 backdrop-blur-xl border border-white/20 text-white shadow-2xl";
      default:
        return "bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white shadow-2xl";
    }
  };

  return (
    <div className={`p-6 rounded-2xl ${getLunaStyles()} w-full max-w-md mx-auto`}>
      {/* Album Art & Info */}
      <div className="text-center mb-6">
        <div className="w-48 h-48 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 border border-white/20 flex items-center justify-center">
          <Music size={64} className="opacity-60" />
        </div>
        <h3 className="text-xl font-bold mb-1 truncate">{data.radioName}</h3>
        {data.description && <p className="text-sm opacity-80 mb-2">{data.description}</p>}
        <p className="text-xs opacity-60">Artista - Canción Actual</p>
      </div>

      {/* Progress Bar */}
      {data.showProgress && (
        <div className="mb-6">
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-gradient-to-r from-pink-400 to-purple-400 w-1/3 rounded-full transition-all duration-500"></div>
          </div>
          <div className="flex justify-between text-xs opacity-70">
            <span>02:34</span>
            <span>04:12</span>
          </div>
        </div>
      )}

      {/* Main Controls */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <button className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all">
          <Shuffle size={18} />
        </button>
        <button className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all">
          <SkipBack size={20} />
        </button>
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 flex items-center justify-center transition-all shadow-lg"
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all">
          <SkipForward size={20} />
        </button>
        <button className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all">
          <Repeat size={18} />
        </button>
      </div>

      {/* Secondary Controls */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setIsFavorite(!isFavorite)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            isFavorite ? 'bg-red-500 text-white' : 'bg-white/20 hover:bg-white/30'
          }`}
        >
          <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>

        {data.showVolume && (
          <div className="flex items-center space-x-2 flex-1 mx-4">
            <Volume2 size={16} />
            <div className="flex-1 h-1.5 bg-white/20 rounded-full">
              <div className="h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full transition-all" style={{ width: `${volume}%` }}></div>
            </div>
            <span className="text-xs w-8">{volume}%</span>
          </div>
        )}

        <button className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all">
          <Share2 size={16} />
        </button>
      </div>

      {/* Visualizer */}
      {data.showVisualizer && (
        <div className="flex items-end justify-center space-x-1 mt-6 h-8">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="w-1 bg-gradient-to-t from-pink-400 to-purple-400 rounded-full animate-pulse" 
              style={{ 
                height: `${Math.random() * 24 + 8}px`,
                animationDelay: `${i * 50}ms`,
                animationDuration: `${Math.random() * 0.5 + 0.5}s`
              }}
            ></div>
          ))}
        </div>
      )}

      {/* Live indicator */}
      <div className="flex items-center justify-center mt-4">
        <div className="flex items-center space-x-2 px-3 py-1 bg-red-500/20 rounded-full border border-red-500/30">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium">EN VIVO</span>
        </div>
      </div>
    </div>
  );
};
