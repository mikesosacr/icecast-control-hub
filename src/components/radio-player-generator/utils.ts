
import { FormData } from "./types";

export const generatePlayerCode = (data: FormData): string => {
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

export const getPlayerClasses = (data: FormData): string => {
  const baseClasses = "p-4 rounded-lg w-full transition-all duration-300";
  
  switch(data.style) {
    case "luna-dark":
      return `${baseClasses} bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white shadow-2xl border border-purple-500/30`;
    case "luna-light":
      return `${baseClasses} bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800 shadow-xl border border-blue-200`;
    case "luna-gradient":
      return `${baseClasses} bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white shadow-2xl`;
    case "luna-glass":
      return `${baseClasses} bg-white/10 backdrop-blur-xl border border-white/20 text-white shadow-2xl`;
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

export const generatePlayerContent = (data: FormData): string => {
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
