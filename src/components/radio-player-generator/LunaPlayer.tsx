
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

  const getLayoutStyles = () => {
    switch(data.layout) {
      case "horizontal":
        return {
          container: "flex items-center gap-6 p-6 rounded-2xl w-full max-w-4xl mx-auto",
          albumArt: "w-32 h-32 flex-shrink-0",
          content: "flex-1 min-w-0",
          controls: "flex items-center gap-4"
        };
      case "vertical":
        return {
          container: "flex flex-col p-6 rounded-2xl w-full max-w-md mx-auto",
          albumArt: "w-48 h-48 mx-auto",
          content: "w-full text-center",
          controls: "flex justify-center items-center gap-4"
        };
      case "card":
        return {
          container: "p-8 rounded-3xl w-full max-w-lg mx-auto shadow-2xl",
          albumArt: "w-40 h-40 mx-auto",
          content: "w-full text-center",
          controls: "flex justify-center items-center gap-6"
        };
      case "mini":
        return {
          container: "flex items-center gap-3 p-3 rounded-xl w-full max-w-sm mx-auto",
          albumArt: "w-12 h-12 flex-shrink-0",
          content: "flex-1 min-w-0 text-left",
          controls: "flex items-center gap-2"
        };
      default:
        return {
          container: "p-6 rounded-2xl w-full max-w-md mx-auto",
          albumArt: "w-48 h-48 mx-auto",
          content: "w-full text-center",
          controls: "flex justify-center items-center gap-4"
        };
    }
  };

  const containerStyle = data.backgroundImage ? {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${data.backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  } : {};

  const layoutStyles = getLayoutStyles();
  const isHorizontal = data.layout === "horizontal";
  const isMini = data.layout === "mini";
  const isCard = data.layout === "card";

  return (
    <div 
      className={`${layoutStyles.container} ${getLunaStyles()} relative`}
      style={containerStyle}
    >
      {/* Album Art */}
      <div className={`${layoutStyles.albumArt} ${isMini ? 'mb-0' : 'mb-4'} rounded-${isMini ? 'lg' : '2xl'} bg-gradient-to-br from-white/20 to-white/5 border border-white/20 flex items-center justify-center overflow-hidden`}>
        {data.logoImage ? (
          <img src={data.logoImage} alt={data.radioName} className="w-full h-full object-cover" />
        ) : (
          <Music size={isMini ? 24 : isCard ? 48 : 64} className="opacity-60" />
        )}
      </div>

      {/* Content */}
      <div className={layoutStyles.content}>
        {/* Radio Info */}
        <div className={`${isHorizontal || isMini ? 'text-left' : 'text-center'} ${isMini ? 'mb-2' : 'mb-6'}`}>
          <h3 className={`${isMini ? 'text-sm' : isCard ? 'text-2xl' : 'text-xl'} font-bold mb-1 truncate`}>
            {data.radioName}
          </h3>
          {data.description && !isMini && (
            <p className={`${isCard ? 'text-base' : 'text-sm'} opacity-80 mb-2`}>
              {data.description}
            </p>
          )}
          {!isMini && (
            <p className="text-xs opacity-60">Artista - Canción Actual</p>
          )}
        </div>

        {/* Progress Bar */}
        {data.showProgress && !isMini && (
          <div className={`${isHorizontal ? 'mb-4' : 'mb-6'}`}>
            <div className={`${isCard ? 'h-2' : 'h-1.5'} bg-white/20 rounded-full overflow-hidden mb-2`}>
              <div className="h-full bg-gradient-to-r from-pink-400 to-purple-400 w-1/3 rounded-full transition-all duration-500"></div>
            </div>
            <div className="flex justify-between text-xs opacity-70">
              <span>02:34</span>
              <span>04:12</span>
            </div>
          </div>
        )}

        {/* Main Controls */}
        <div className={`${layoutStyles.controls} ${isMini ? 'mb-0' : 'mb-6'}`}>
          {!isMini && (
            <button className={`${isCard ? 'w-14 h-14' : 'w-12 h-12'} rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all`}>
              <Shuffle size={isCard ? 20 : 18} />
            </button>
          )}
          {!isMini && (
            <button className={`${isCard ? 'w-14 h-14' : 'w-12 h-12'} rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all`}>
              <SkipBack size={isCard ? 22 : 20} />
            </button>
          )}
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={`${isMini ? 'w-8 h-8' : isCard ? 'w-20 h-20' : 'w-16 h-16'} rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 flex items-center justify-center transition-all shadow-lg`}
          >
            {isPlaying ? <Pause size={isMini ? 16 : isCard ? 28 : 24} /> : <Play size={isMini ? 16 : isCard ? 28 : 24} />}
          </button>
          {!isMini && (
            <button className={`${isCard ? 'w-14 h-14' : 'w-12 h-12'} rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all`}>
              <SkipForward size={isCard ? 22 : 20} />
            </button>
          )}
          {!isMini && (
            <button className={`${isCard ? 'w-14 h-14' : 'w-12 h-12'} rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all`}>
              <Repeat size={isCard ? 20 : 18} />
            </button>
          )}
        </div>

        {/* Secondary Controls */}
        {!isMini && (
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setIsFavorite(!isFavorite)}
              className={`${isCard ? 'w-12 h-12' : 'w-10 h-10'} rounded-full flex items-center justify-center transition-all ${
                isFavorite ? 'bg-red-500 text-white' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              <Heart size={isCard ? 18 : 16} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>

            {data.showVolume && (
              <div className="flex items-center space-x-2 flex-1 mx-4">
                <Volume2 size={isCard ? 18 : 16} />
                <div className={`flex-1 ${isCard ? 'h-2' : 'h-1.5'} bg-white/20 rounded-full`}>
                  <div className="h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full transition-all" style={{ width: `${volume}%` }}></div>
                </div>
                <span className={`${isCard ? 'text-sm' : 'text-xs'} w-8`}>{volume}%</span>
              </div>
            )}

            <button className={`${isCard ? 'w-12 h-12' : 'w-10 h-10'} rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all`}>
              <Share2 size={isCard ? 18 : 16} />
            </button>
          </div>
        )}

        {/* Mini controls for volume and secondary actions */}
        {isMini && (
          <div className="flex items-center gap-2 ml-2">
            {data.showVolume && (
              <div className="flex items-center gap-1">
                <Volume2 size={12} />
                <div className="w-12 h-1 bg-white/20 rounded-full">
                  <div className="h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full w-3/4"></div>
                </div>
              </div>
            )}
            <button 
              onClick={() => setIsFavorite(!isFavorite)}
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                isFavorite ? 'bg-red-500 text-white' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              <Heart size={12} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>
        )}

        {/* Visualizer */}
        {data.showVisualizer && !isMini && (
          <div className={`flex items-end justify-center space-x-1 mt-6 ${isCard ? 'h-10' : 'h-8'}`}>
            {[...Array(isCard ? 24 : 20)].map((_, i) => (
              <div 
                key={i}
                className="w-1 bg-gradient-to-t from-pink-400 to-purple-400 rounded-full animate-pulse" 
                style={{ 
                  height: `${Math.random() * (isCard ? 32 : 24) + 8}px`,
                  animationDelay: `${i * 50}ms`,
                  animationDuration: `${Math.random() * 0.5 + 0.5}s`
                }}
              ></div>
            ))}
          </div>
        )}

        {/* Live indicator */}
        {!isMini && (
          <div className="flex items-center justify-center mt-4">
            <div className={`flex items-center space-x-2 ${isCard ? 'px-4 py-2' : 'px-3 py-1'} bg-red-500/20 rounded-full border border-red-500/30`}>
              <div className={`${isCard ? 'w-2.5 h-2.5' : 'w-2 h-2'} bg-red-500 rounded-full animate-pulse`}></div>
              <span className={`${isCard ? 'text-sm' : 'text-xs'} font-medium`}>EN VIVO</span>
            </div>
          </div>
        )}

        {/* Mini live indicator */}
        {isMini && (
          <div className="flex items-center mt-1">
            <div className="flex items-center space-x-1 px-2 py-0.5 bg-red-500/20 rounded border border-red-500/30">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium">LIVE</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
