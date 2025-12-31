
import React from 'react';
import { Song } from '../types';
import { SONGS } from '../constants';

interface Props {
  onStart: () => void;
  selectedSong: Song;
  setSelectedSong: (song: Song) => void;
  highScore: number;
}

const Menu: React.FC<Props> = ({ onStart, selectedSong, setSelectedSong, highScore }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-start bg-white px-5 py-8 overflow-hidden animate-simple-fade">
      
      <div className="relative z-10 w-full flex flex-col items-center mb-6 text-[#0f1c3a]">
        <div className="w-14 h-14 bg-[#0f1c3a] rounded-2xl flex items-center justify-center border-2 border-[#1e293b] shadow-md mb-2 relative overflow-hidden group hover:rotate-3 transition-transform">
          <span className="absolute inset-0 flex items-center justify-center text-white/5 text-4xl font-orbitron font-black -rotate-12 translate-y-0.5">N</span>
          <i className="fa-solid fa-wand-magic-sparkles text-white text-xl relative z-10 group-hover:scale-105 transition-transform"></i>
        </div>
        <h1 className="text-xl font-orbitron font-black text-[#0f1c3a] tracking-tighter uppercase leading-none">MAGIC TILES</h1>
        <p className="text-[7px] text-slate-400 font-orbitron tracking-[0.5em] uppercase font-black mt-1.5">Sourav Rajput Edition</p>
      </div>

      <div className="relative z-10 w-full mb-5">
        <div className="bg-slate-50 w-full py-3 px-5 rounded-[1.5rem] border border-slate-100 flex justify-between items-center shadow-sm relative overflow-hidden group">
          <div className="flex flex-col">
            <span className="text-[7px] font-orbitron text-slate-400 font-black uppercase tracking-widest mb-0.5 opacity-60">BEST SCORE</span>
            <span className="text-xl font-orbitron text-[#0f1c3a] font-black tracking-tighter">{highScore.toLocaleString()}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#0f1c3a]/5 flex items-center justify-center border border-[#0f1c3a]/5">
            <i className="fa-solid fa-trophy text-[#0f1c3a] text-sm opacity-80"></i>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full flex-1 flex flex-col min-h-0">
        <div className="flex justify-between items-center mb-3 px-1 text-[#0f1c3a]">
          <h2 className="text-xs font-orbitron font-black tracking-tight uppercase">MELODIES</h2>
          <span className="text-[7px] font-orbitron font-black uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-full text-slate-500">PREMIUM</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2.5 w-full flex-1 min-h-0 overflow-y-auto pr-0.5 custom-scrollbar pb-3">
          {SONGS.map((song) => (
            <button
              key={song.id}
              onPointerDown={() => setSelectedSong(song)}
              className={`flex flex-col items-start p-3.5 rounded-[1.8rem] border-4 transition-all duration-200 relative overflow-hidden h-[110px] active:scale-95 ${
                selectedSong.id === song.id 
                  ? 'bg-[#0f1c3a] border-[#1e293b] shadow-lg z-20' 
                  : 'bg-white border-slate-50 hover:border-slate-100'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 transition-all duration-300 ${selectedSong.id === song.id ? 'bg-white text-[#0f1c3a]' : 'bg-slate-50 border border-slate-100 ' + song.color}`}>
                <i className={`fa-solid ${song.icon} text-xs`}></i>
              </div>
              
              <div className="mt-auto overflow-hidden w-full text-left">
                <span className={`block text-[10px] font-orbitron font-black leading-tight uppercase truncate mb-0.5 ${selectedSong.id === song.id ? 'text-white' : 'text-[#0f1c3a]'}`}>
                  {song.name}
                </span>
                <span className={`block text-[7px] font-orbitron font-black uppercase tracking-widest truncate ${selectedSong.id === song.id ? 'text-slate-400' : 'text-slate-400'}`}>
                  {song.genre}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="relative z-10 w-full mt-3">
        <button 
          onPointerDown={onStart}
          className="w-full py-4 bg-[#0f1c3a] text-white font-orbitron font-black text-[11px] tracking-[0.3em] rounded-[1.5rem] shadow-xl active:scale-95 hover:bg-[#1a2b4d] transition-all duration-300 flex items-center justify-center gap-3 group"
        >
          START PERFORMANCE
          <i className="fa-solid fa-play text-[8px] group-hover:translate-x-1 transition-transform"></i>
        </button>
      </div>

      <style>{`
        @keyframes simple-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-simple-fade { animation: simple-fade 0.3s ease-out forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
      `}</style>
    </div>
  );
};

export default Menu;
