
import React, { useState, useCallback, useEffect } from 'react';
import { GameStatus, ScoreData, Song } from './types';
import { geminiService } from './services/GeminiService';
import { SONGS } from './constants';
import { audioService } from './services/AudioEngine';
import MagicTiles from './components/MagicTiles';
import Menu from './components/Menu';
import GameOver from './components/GameOver';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.LOADING);
  const [username, setUsername] = useState<string>(localStorage.getItem('mt_username') || '');
  const [selectedSong, setSelectedSong] = useState<Song>(SONGS[0]);
  const [scoreData, setScoreData] = useState<ScoreData>({ score: 0, perfectHits: 0, combo: 0, maxCombo: 0, highScore: 0 });
  const [levelInfo, setLevelInfo] = useState({ title: '', subtitle: '' });
  const [review, setReview] = useState<string>('');
  const [isIdentityError, setIsIdentityError] = useState(false);

  useEffect(() => {
    const savedHighScore = localStorage.getItem('mt_high_score');
    if (savedHighScore) {
      setScoreData(prev => ({ ...prev, highScore: parseInt(savedHighScore) }));
    }
  }, []);

  const proceedToMenu = useCallback(() => {
    if (!username.trim()) {
      setIsIdentityError(true);
      setTimeout(() => setIsIdentityError(false), 2000);
      return;
    }
    localStorage.setItem('mt_username', username);
    setStatus(GameStatus.MENU);
  }, [username]);

  const startGame = useCallback(async () => {
    audioService.init();
    audioService.setMelody(selectedSong.melody, selectedSong.instrument);
    setLevelInfo({ title: selectedSong.name, subtitle: selectedSong.genre });
    setScoreData(prev => ({ ...prev, score: 0, combo: 0, maxCombo: 0 }));
    setStatus(GameStatus.PLAYING);
  }, [selectedSong]);

  const handleGameOver = useCallback(async (finalScore: ScoreData) => {
    const currentHighScore = parseInt(localStorage.getItem('mt_high_score') || '0');
    const newHighScore = Math.max(currentHighScore, finalScore.score);
    localStorage.setItem('mt_high_score', newHighScore.toString());
    const updatedScoreData = { ...finalScore, highScore: newHighScore };
    
    setScoreData(updatedScoreData);
    setStatus(GameStatus.GAMEOVER);
    
    const initialReview = geminiService.getRandomFallback(username || 'Maestro');
    setReview(initialReview);

    try {
      const aiReview = await geminiService.getPerformanceReview(username || 'Maestro', finalScore.score, finalScore.maxCombo);
      setReview(aiReview);
    } catch (e) {
      // Fallback is already set
    }
  }, [username]);

  const backToMenu = () => setStatus(GameStatus.MENU);

  return (
    <div className="w-full h-screen bg-white flex justify-center items-center overflow-hidden">
      <div className="game-container relative z-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] bg-white">
        
        {status === GameStatus.LOADING && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-50 px-8">
            <div className="relative z-10 w-full max-w-[260px] flex flex-col items-center animate-fade-in">
              
              <div className="mb-10 text-center transform hover:scale-105 transition-transform duration-500">
                 <div className="w-20 h-20 bg-[#0f1c3a] rounded-3xl flex items-center justify-center border border-blue-900 shadow-2xl mx-auto mb-6 relative overflow-hidden group">
                    <div className="absolute inset-0 border-[4px] border-t-white rounded-3xl animate-spin-slow opacity-20"></div>
                    <span className="absolute inset-0 flex items-center justify-center text-white/5 text-5xl font-orbitron font-black -rotate-12 translate-y-0.5">N</span>
                    <i className="fa-solid fa-wand-magic-sparkles text-white text-3xl relative z-10 group-hover:scale-110 transition-transform duration-700"></i>
                 </div>
                 <h1 className="text-xl font-orbitron font-black text-[#0f1c3a] tracking-tighter uppercase mb-1">MAGIC TILES</h1>
                 <p className="text-[7px] text-slate-400 font-orbitron tracking-[0.5em] uppercase font-black">Sourav Rajput Edition</p>
              </div>

              <div className="w-full mb-8">
                <label className="block text-[8px] font-orbitron font-black text-slate-400 text-center mb-4 tracking-[0.3em] uppercase opacity-70">PLAYER IDENTITY</label>
                <div className="relative">
                  <input 
                    type="text" 
                    maxLength={12}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ENTER NAME"
                    className={`w-full bg-slate-50 border-2 ${isIdentityError ? 'border-red-500 animate-shake' : 'border-slate-100 focus:border-[#0f1c3a]'} rounded-2xl py-4 px-6 text-center font-orbitron text-[14px] text-[#0f1c3a] focus:outline-none shadow-inner transition-all placeholder:text-slate-300 uppercase font-black tracking-widest`}
                  />
                </div>
              </div>

              <button 
                onPointerDown={proceedToMenu}
                className="w-full py-4 bg-[#0f1c3a] text-white font-orbitron font-black text-[11px] tracking-[0.3em] rounded-2xl shadow-xl active:scale-95 hover:bg-[#1a2b4d] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 uppercase group"
              >
                ACCESS <i className="fa-solid fa-chevron-right text-[8px] group-hover:translate-x-1 transition-transform"></i>
              </button>
            </div>
          </div>
        )}

        {status === GameStatus.MENU && (
          <Menu 
            onStart={startGame} 
            selectedSong={selectedSong}
            setSelectedSong={setSelectedSong}
            highScore={scoreData.highScore}
          />
        )}

        {status === GameStatus.PLAYING && (
          <MagicTiles 
            onGameOver={handleGameOver} 
            levelInfo={levelInfo}
          />
        )}

        {status === GameStatus.GAMEOVER && (
          <GameOver 
            username={username}
            scoreData={scoreData} 
            review={review} 
            onRestart={startGame} 
            onMenu={backToMenu}
          />
        )}
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        @keyframes shake { 
          0%, 100% { transform: translate(0, 0); } 
          25% { transform: translate(-4px, 4px); } 
          50% { transform: translate(4px, -4px); } 
        }
        .animate-shake { animation: shake 0.08s infinite; }
      `}</style>
    </div>
  );
};

export default App;
