
import React, { useState, useCallback, useEffect } from 'react';
import { GameStatus, ScoreData, Song } from './types';
import { geminiService } from './services/GeminiService';
import { storageService } from './services/StorageService';
import { SONGS } from './constants';
import { audioService } from './services/AudioEngine';
import { sanitizeUsername, validateUsername } from './utils/security';
import MagicTiles from './components/MagicTiles';
import Menu from './components/Menu';
import GameOver from './components/GameOver';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.LOADING);
  const [username, setUsername] = useState<string>(storageService.getUsername());
  const [selectedSong, setSelectedSong] = useState<Song>(SONGS[0]);
  const [scoreData, setScoreData] = useState<ScoreData>({ score: 0, perfectHits: 0, combo: 0, maxCombo: 0, highScore: 0 });
  const [levelInfo, setLevelInfo] = useState({ title: '', subtitle: '' });
  const [review, setReview] = useState<string>('');
  const [isIdentityError, setIsIdentityError] = useState(false);

  useEffect(() => {
    const savedHighScore = storageService.getHighScore();
    setScoreData(prev => ({ ...prev, highScore: savedHighScore }));
  }, []);

  const proceedToMenu = useCallback(() => {
    const sanitized = sanitizeUsername(username);

    if (!validateUsername(sanitized)) {
      setIsIdentityError(true);
      setTimeout(() => setIsIdentityError(false), 2000);
      return;
    }

    setUsername(sanitized);
    storageService.setUsername(sanitized);
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
    const currentHighScore = storageService.getHighScore();
    const newHighScore = Math.max(currentHighScore, finalScore.score);
    storageService.setHighScore(newHighScore);
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
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-50 px-6 sm:px-8 py-safe">
            <div className="relative z-10 w-full max-w-[340px] sm:max-w-[260px] flex flex-col items-center animate-fade-in">

              <div className="mb-8 sm:mb-10 text-center transform hover:scale-105 transition-transform duration-500">
                 <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#0f1c3a] rounded-3xl flex items-center justify-center border border-blue-900 shadow-2xl mx-auto mb-4 sm:mb-6 relative overflow-hidden group">
                    <div className="absolute inset-0 border-[4px] border-t-white rounded-3xl animate-spin-slow opacity-20"></div>
                    <span className="absolute inset-0 flex items-center justify-center text-white/5 text-4xl sm:text-5xl font-orbitron font-black -rotate-12 translate-y-0.5">N</span>
                    <i className="fa-solid fa-wand-magic-sparkles text-white text-2xl sm:text-3xl relative z-10 group-hover:scale-110 transition-transform duration-700"></i>
                 </div>
                 <h1 className="text-lg sm:text-xl font-orbitron font-black text-[#0f1c3a] tracking-tighter uppercase mb-1">MAGIC TILES</h1>
                 <p className="text-[9px] sm:text-[10px] text-slate-600 font-orbitron tracking-[0.3em] sm:tracking-[0.4em] uppercase font-black">Sourav Rajput Edition</p>
              </div>

              <div className="w-full mb-6 sm:mb-8">
                <label className="block text-[10px] sm:text-[11px] font-orbitron font-black text-slate-600 text-center mb-3 sm:mb-4 tracking-[0.2em] sm:tracking-[0.3em] uppercase opacity-80">PLAYER IDENTITY</label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={12}
                    value={username}
                    onChange={(e) => setUsername(sanitizeUsername(e.target.value))}
                    placeholder="ENTER NAME"
                    aria-label="Enter your player name"
                    className={`w-full bg-slate-50 border-2 ${isIdentityError ? 'border-red-500 animate-shake' : 'border-slate-100 focus:border-[#0f1c3a]'} rounded-2xl py-3.5 sm:py-4 px-4 sm:px-6 text-center font-orbitron text-[13px] sm:text-[14px] text-[#0f1c3a] focus:outline-none shadow-inner transition-all placeholder:text-slate-500 uppercase font-black tracking-wide sm:tracking-widest min-h-[50px]`}
                  />
                </div>
              </div>

              <button
                onPointerDown={proceedToMenu}
                aria-label="Proceed to menu"
                className="w-full py-4 bg-[#0f1c3a] text-white font-orbitron font-black text-[10px] sm:text-[11px] tracking-[0.25em] sm:tracking-[0.3em] rounded-2xl shadow-xl active:scale-95 hover:bg-[#1a2b4d] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 uppercase group min-h-[52px]"
              >
                ACCESS <i className="fa-solid fa-chevron-right text-[10px] sm:text-[11px] group-hover:translate-x-1 transition-transform"></i>
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

      {/* Landscape mode warning for mobile */}
      <div className="landscape-warning">
        <i className="fa-solid fa-mobile-screen-button"></i>
        <h2 className="text-white font-orbitron font-black text-xl mb-2 uppercase tracking-wide">Rotate Your Device</h2>
        <p className="text-white/80 font-inter text-sm max-w-xs">Please rotate your device to portrait mode for the best gaming experience</p>
      </div>
    </div>
  );
};

export default App;
