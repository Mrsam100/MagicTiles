
import React, { useEffect, useState } from 'react';
import { ScoreData } from '../types';

interface Props {
  username: string;
  scoreData: ScoreData;
  review: string;
  onRestart: () => void;
  onMenu: () => void;
}

const GameOver: React.FC<Props> = ({ username, scoreData, review, onRestart, onMenu }) => {
  const isNewRecord = scoreData.score >= scoreData.highScore && scoreData.score > 0;
  const displayUsername = username || 'ARTIST';
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowStats(true), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-start bg-white z-[100] px-4 sm:px-6 pt-6 sm:pt-10 overflow-y-auto custom-scrollbar pb-10">

      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#0f1c3a]/5 rounded-full blur-[80px] animate-pulse"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#2ecc71]/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="w-full max-w-sm flex flex-col items-center relative z-10">
        {/* Animated Icon Container */}
        <div className="relative mb-4 sm:mb-6 group">
          <div className={`absolute -inset-4 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000 ${isNewRecord ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center border-8 shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative transition-all duration-700 animate-float-slow ${isNewRecord ? 'bg-[#0f1c3a] border-[#1e293b]' : 'bg-slate-50 border-red-50/50'}`}>
            <i className={`fa-solid ${isNewRecord ? 'fa-crown text-white' : 'fa-triangle-exclamation text-red-500'} text-2xl sm:text-3xl drop-shadow-lg`}></i>

            {isNewRecord && (
               <div className="absolute -inset-1 rounded-full border-2 border-white/20 animate-ping opacity-20"></div>
            )}
          </div>
        </div>

        {/* Main Title with Shimmer */}
        <div className="text-center mb-4 sm:mb-6 animate-slide-down">
          <h2 className={`text-2xl sm:text-3xl font-orbitron font-black mb-1 tracking-tighter uppercase leading-none shimmer-text ${isNewRecord ? 'text-[#0f1c3a]' : 'text-red-600'}`}>
            {isNewRecord ? 'LEGENDARY!' : `NOT QUITE, ${displayUsername}`}
          </h2>
          <p className="text-slate-600 font-orbitron font-black text-[11px] sm:text-[12px] tracking-[0.4em] uppercase mt-2 opacity-70">
            PERFORMANCE ENDED
          </p>
        </div>

        {/* REDUCED Score Card */}
        <div className={`w-full mb-5 transform transition-all duration-700 ${showStats ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'}`}>
           <div className="bg-[#0f1c3a] p-5 sm:p-6 rounded-[2rem] text-center shadow-[0_30px_60px_-15px_rgba(15,28,58,0.25)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <i className="fa-solid fa-bolt-lightning text-5xl text-white rotate-12"></i>
              </div>
              <div className="relative z-10">
                <p className="text-[10px] sm:text-[11px] text-slate-300 font-orbitron font-black uppercase mb-1 tracking-[0.3em] opacity-80">FINAL SCORE</p>
                <p className="text-4xl sm:text-5xl font-orbitron text-white font-black tracking-tighter animate-score-bounce">{scoreData.score.toLocaleString()}</p>
              </div>
           </div>
        </div>
        
        {/* Secondary Stats Cards */}
        <div className="w-full grid grid-cols-2 gap-3 mb-6">
          <div className={`bg-slate-50 p-3.5 sm:p-4 rounded-[1.5rem] border border-slate-100 text-center shadow-sm transform transition-all duration-700 delay-200 ${showStats ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
            <p className="text-[10px] sm:text-[11px] text-slate-600 font-orbitron font-black uppercase mb-1 tracking-widest opacity-80">PERSONAL BEST</p>
            <p className="text-base sm:text-lg font-orbitron text-[#0f1c3a] font-black tracking-tighter">{scoreData.highScore.toLocaleString()}</p>
          </div>
          <div className={`bg-slate-50 p-3.5 sm:p-4 rounded-[1.5rem] border border-slate-100 text-center shadow-sm transform transition-all duration-700 delay-300 ${showStats ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
            <p className="text-[10px] sm:text-[11px] text-slate-600 font-orbitron font-black uppercase mb-1 tracking-widest opacity-80">MAX COMBO</p>
            <p className="text-base sm:text-lg font-orbitron text-[#0f1c3a] font-black tracking-tighter">x{scoreData.maxCombo}</p>
          </div>
        </div>

        {/* AI Analysis Box */}
        <div className={`relative w-full mb-8 transform transition-all duration-700 delay-500 ${showStats ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="pt-6 pb-5 px-5 sm:pt-7 sm:pb-6 sm:px-7 bg-slate-50 border border-slate-100 rounded-[1.8rem] shadow-sm flex flex-col items-center min-h-[90px] justify-center relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0f1c3a] text-white text-[10px] sm:text-[11px] font-black font-orbitron px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg flex items-center gap-2">
              <span className="w-1 h-1 bg-[#2ecc71] rounded-full animate-pulse"></span>
              AI REVIEW
            </div>
            <p className="text-[#0f1c3a] text-[11px] sm:text-[12px] font-medium leading-relaxed italic text-center animate-fade-in opacity-80">
              {review ? `"${review}"` : "Decoding your rhythm signature..."}
            </p>
          </div>
        </div>

        {/* Animated Action Buttons */}
        <div className={`flex flex-col w-full gap-3 transform transition-all duration-700 delay-700 ${showStats ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <button
            onPointerDown={onRestart}
            aria-label="Restart performance"
            className="w-full py-4 bg-[#0f1c3a] text-white font-orbitron font-black text-[10px] sm:text-[11px] tracking-[0.4em] rounded-[1.2rem] transition-all shadow-[0_15px_30px_-10px_rgba(15,28,58,0.2)] active:scale-95 hover:bg-[#1a2b4d] hover:-translate-y-1 flex items-center justify-center gap-3 uppercase group min-h-[52px]"
          >
            <span>RESTART</span>
            <i className="fa-solid fa-rotate-right text-[10px] sm:text-[11px] group-hover:rotate-180 transition-transform duration-500"></i>
          </button>

          <button
            onPointerDown={onMenu}
            aria-label="Return to menu"
            className="w-full py-3 bg-transparent text-slate-600 font-orbitron text-[10px] sm:text-[11px] tracking-[0.3em] rounded-[1.2rem] transition-all hover:text-[#0f1c3a] hover:bg-slate-50 active:scale-95 uppercase font-black min-h-[48px]"
          >
            RETURN TO MENU
          </button>
        </div>
      </div>

      <style>{`
        @keyframes score-bounce {
          0% { transform: scale(0.8); opacity: 0; }
          60% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes slide-down {
          0% { transform: translateY(-15px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .shimmer-text {
          background: linear-gradient(90deg, currentColor 0%, #aaa 50%, currentColor 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
        .animate-score-bounce { animation: score-bounce 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .animate-float-slow { animation: float-slow 3s ease-in-out infinite; }
        .animate-slide-down { animation: slide-down 0.6s ease-out forwards; }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
      `}</style>
    </div>
  );
};

export default GameOver;
