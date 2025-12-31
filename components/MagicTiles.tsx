
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Tile, ScoreData } from '../types';
import {
  LANES,
  TILE_HEIGHT,
  INITIAL_SPEED,
  ACCELERATION,
  SPAWN_THRESHOLD,
  GRACE_PERIOD_MS,
  COUNTDOWN_INTERVAL_MS,
  HIT_BUFFER_VH,
  LANE_FEEDBACK_DURATION_MS,
  FEEDBACK_FLOAT_DURATION_MS,
  PARTICLE_LIFETIME_MS,
  PARTICLES_PER_HIT
} from '../constants';
import { audioService } from '../services/AudioEngine';
import { CleanupTimer } from '../utils/timers';
import { useKeyboardControls } from '../hooks/useKeyboardControls';

interface Props {
  onGameOver: (score: ScoreData) => void;
  levelInfo: { title: string; subtitle: string };
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
}

interface FloatingFeedback {
  id: number;
  text: string;
  points: string;
  x: number;
  y: number;
  color: string;
}

// Optimization: Memoize static background to prevent unnecessary re-renders
const GameBackground = React.memo(() => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-10">
    <div className="absolute top-[5%] left-[12%] text-[10rem] text-white rotate-[15deg]"><i className="fa-solid fa-fan"></i></div>
    <div className="absolute top-[35%] right-[5%] text-[12rem] text-white rotate-[-10deg]"><i className="fa-solid fa-leaf"></i></div>
    <div className="absolute bottom-[20%] left-[5%] text-[11rem] text-white rotate-[20deg]"><i className="fa-solid fa-spa"></i></div>
    <div className="absolute bottom-[8%] right-[10%] text-[14rem] text-white rotate-[45deg]"><i className="fa-solid fa-clover"></i></div>
  </div>
));

// Optimization: Memoize HUD to isolate score/combo updates from game loop re-renders
const GameHUD = React.memo(({ score, combo }: { score: number; combo: number }) => (
  <div className="absolute top-[6%] left-0 right-0 flex flex-col items-center z-50 pointer-events-none">
    <div className="relative">
      <div className={`absolute -inset-6 blur-[20px] rounded-full transition-all duration-700 ${combo > 10 ? 'bg-white/25 scale-110' : 'bg-white/10 scale-90'}`}></div>
      <div className="relative text-4xl font-orbitron text-white font-black leading-none tracking-tighter drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
        {score.toLocaleString()}
      </div>
      {combo > 2 && (
        <div key={combo} className="mt-2 text-[12px] font-orbitron font-black text-center tracking-[0.4em] uppercase animate-combo-pop flex flex-col items-center text-white">
          <div className="w-8 h-[2px] mb-2 rounded-full bg-white/50"></div>
          x{combo}
        </div>
      )}
    </div>
  </div>
));

const MagicTiles: React.FC<Props> = ({ onGameOver, levelInfo }) => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [feedbacks, setFeedbacks] = useState<FloatingFeedback[]>([]);
  const [activeLanes, setActiveLanes] = useState<boolean[]>(new Array(LANES).fill(false));
  const [isMissed, setIsMissed] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [countdown, setCountdown] = useState<number | string | null>(3);
  const [isPaused, setIsPaused] = useState(false);

  const gameLoopRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const lastTileIdRef = useRef(0);
  const lanePoolRef = useRef<number[]>([]);
  const tilesRef = useRef<Tile[]>([]);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const maxComboRef = useRef(0);
  const speedRef = useRef(INITIAL_SPEED);
  const gameOverCalledRef = useRef(false);
  const particleIdRef = useRef(0);
  const feedbackIdRef = useRef(0);
  const isPausedRef = useRef(true);
  const startGraceTimeRef = useRef<number>(0);
  const timerCleanup = useRef(new CleanupTimer());

  const containerRef = useRef<HTMLDivElement>(null);

  const SWEET_WORDS = [
    { text: "SWEET!", color: "text-white" },
    { text: "DIVINE!", color: "text-yellow-200" },
    { text: "ANGELIC!", color: "text-cyan-100" },
    { text: "HEAVENLY!", color: "text-rose-100" },
    { text: "PERFECT!", color: "text-white" }
  ];

  const getNextLane = useCallback(() => {
    if (lanePoolRef.current.length === 0) {
      const pool = Array.from({ length: LANES }, (_, i) => i);
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      lanePoolRef.current = pool;
    }
    return lanePoolRef.current.pop()!;
  }, []);

  const spawnTile = useCallback((initialY: number = -TILE_HEIGHT) => {
    const lane = getNextLane();
    const newTile: Tile = {
      id: ++lastTileIdRef.current,
      lane,
      y: initialY,
      height: TILE_HEIGHT,
      hit: false,
      missed: false,
    };
    tilesRef.current.push(newTile);
  }, [getNextLane]);

  const triggerGameOver = useCallback((missedTileId?: number) => {
    if (gameOverCalledRef.current) return;
    if (isPausedRef.current || (Date.now() - startGraceTimeRef.current < GRACE_PERIOD_MS)) return;

    gameOverCalledRef.current = true;
    audioService.stopAllSounds();
    audioService.playMiss();

    setIsMissed(true);
    setIsShaking(true);

    timerCleanup.current.setTimeout(() => setIsShaking(false), 350);

    if (missedTileId !== undefined) {
      tilesRef.current = tilesRef.current.map(t => t.id === missedTileId ? { ...t, missed: true } : t);
      setTiles([...tilesRef.current]);
    }

    timerCleanup.current.setTimeout(() => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      onGameOver({
        score: scoreRef.current,
        perfectHits: 0,
        combo: comboRef.current,
        maxCombo: maxComboRef.current,
        highScore: 0
      });
    }, COUNTDOWN_INTERVAL_MS);
  }, [onGameOver]);

  // Store stable references to avoid recreating the game loop
  const spawnTileRef = useRef(spawnTile);
  const triggerGameOverRef = useRef(triggerGameOver);

  // Update refs when functions change
  useEffect(() => {
    spawnTileRef.current = spawnTile;
    triggerGameOverRef.current = triggerGameOver;
  }, [spawnTile, triggerGameOver]);

  // Stable game loop function
  const updateRef = useRef<(timestamp: number) => void>();
  updateRef.current = (timestamp: number) => {
    if (gameOverCalledRef.current) return;

    if (isPausedRef.current) {
      lastTimeRef.current = timestamp;
      gameLoopRef.current = requestAnimationFrame(updateRef.current!);
      return;
    }

    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp;
      gameLoopRef.current = requestAnimationFrame(updateRef.current!);
      return;
    }

    const dt = Math.min(timestamp - lastTimeRef.current, 32);
    lastTimeRef.current = timestamp;
    const timeStep = dt / 16.666;

    // Optimized movement: reuse objects if possible or minimize spreads
    const nextTiles: Tile[] = [];
    let hasMissed = false;
    let missedId = -1;

    for (let i = 0; i < tilesRef.current.length; i++) {
      const tile = tilesRef.current[i];
      const nextY = tile.y + (speedRef.current * timeStep);

      if (nextY > 105 && !tile.hit && !tile.missed) {
        hasMissed = true;
        missedId = tile.id;
        break;
      }

      if (nextY < 110) {
        // Reuse reference if nothing changes (but y always changes)
        nextTiles.push({ ...tile, y: nextY });
      }
    }

    if (hasMissed) {
      triggerGameOverRef.current(missedId);
      return;
    }

    tilesRef.current = nextTiles;

    const lastTile = tilesRef.current[tilesRef.current.length - 1];
    if (!lastTile || lastTile.y >= (0 - (TILE_HEIGHT - SPAWN_THRESHOLD))) {
      spawnTileRef.current((lastTile ? lastTile.y - SPAWN_THRESHOLD : -TILE_HEIGHT) - TILE_HEIGHT);
    }

    speedRef.current += (ACCELERATION * timeStep);
    setTiles([...tilesRef.current]);
    gameLoopRef.current = requestAnimationFrame(updateRef.current!);
  };

  useEffect(() => {
    audioService.init();
    audioService.resetMelody();
    spawnTileRef.current();

    let timer = 3;
    const interval = setInterval(() => {
      timer -= 1;
      if (timer === 0) setCountdown("GO!");
      else if (timer < 0) {
        setCountdown(null);
        isPausedRef.current = false;
        startGraceTimeRef.current = Date.now();
        clearInterval(interval);
      }
      else setCountdown(timer);
    }, COUNTDOWN_INTERVAL_MS);

    // Start the game loop
    const startGameLoop = (timestamp: number) => {
      updateRef.current?.(timestamp);
    };
    gameLoopRef.current = requestAnimationFrame(startGameLoop);

    return () => {
      clearInterval(interval);
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = 0;
      }
      audioService.stopAllSounds();
      timerCleanup.current.clearAll();
    };
  }, []); // Empty dependency array - runs once on mount

  // Keyboard lane press handler
  const handleLanePress = useCallback((laneIndex: number) => {
    if (!containerRef.current) return;

    // Calculate center of lane for visual feedback
    const rect = containerRef.current.getBoundingClientRect();
    const laneWidth = rect.width / LANES;
    const clientX = rect.left + (laneIndex + 0.5) * laneWidth;
    const clientY = rect.top + rect.height * 0.7; // 70% down the screen

    handleInteraction(laneIndex, clientX, clientY);
  }, []);

  // Enable keyboard controls when game is active
  useKeyboardControls({
    onLanePress: handleLanePress,
    isActive: countdown === null && !gameOverCalledRef.current && !isPaused
  });

  // Toggle pause function
  const togglePause = useCallback(() => {
    // Can't pause during countdown or if game is over
    if (countdown !== null || gameOverCalledRef.current) return;

    setIsPaused(prev => {
      const newPaused = !prev;
      isPausedRef.current = newPaused;
      return newPaused;
    });
  }, [countdown]);

  // Keyboard pause listener (ESC/P keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePause]);

  const handleInteraction = (laneIndex: number, clientX: number, clientY: number) => {
    if (gameOverCalledRef.current || isPausedRef.current || !containerRef.current) return;
    if (Date.now() - startGraceTimeRef.current < GRACE_PERIOD_MS) return;

    audioService.init();

    // Visual lane feedback
    setActiveLanes(prev => { const next = [...prev]; next[laneIndex] = true; return next; });
    timerCleanup.current.setTimeout(() => { setActiveLanes(prev => { const next = [...prev]; next[laneIndex] = false; return next; }); }, LANE_FEEDBACK_DURATION_MS);

    const tilesInLane = tilesRef.current.filter(t => t.lane === laneIndex && !t.hit);
    const rect = containerRef.current.getBoundingClientRect();
    const tapY_vh = ((clientY - rect.top) / rect.height) * 100;

    const hitTile = tilesInLane.find(t => {
      return tapY_vh >= (t.y - HIT_BUFFER_VH) && tapY_vh <= (t.y + TILE_HEIGHT + HIT_BUFFER_VH);
    });

    if (hitTile) {
      hitTile.hit = true;
      audioService.playNextNote();
      
      const word = SWEET_WORDS[Math.floor(Math.random() * SWEET_WORDS.length)];
      scoreRef.current += 1; 
      comboRef.current += 1;
      if (comboRef.current > maxComboRef.current) maxComboRef.current = comboRef.current;
      
      setScore(scoreRef.current);
      setCombo(comboRef.current);

      const fId = ++feedbackIdRef.current;
      const newFeedback: FloatingFeedback = {
        id: fId,
        text: word.text,
        points: "+1",
        x: clientX,
        y: clientY,
        color: word.color
      };
      setFeedbacks(prev => [...prev, newFeedback]);
      timerCleanup.current.setTimeout(() => setFeedbacks(current => current.filter(f => f.id !== fId)), FEEDBACK_FLOAT_DURATION_MS);

      const pIdBase = ++particleIdRef.current * 10;
      const newPs = Array.from({ length: PARTICLES_PER_HIT }).map((_, idx) => ({
        id: pIdBase + idx,
        x: clientX + (Math.random() - 0.5) * 60,
        y: clientY + (Math.random() - 0.5) * 60,
        color: "#ffffff"
      }));
      setParticles(prev => [...prev, ...newPs]);
      timerCleanup.current.setTimeout(() => setParticles(p => p.filter(x => x.id < pIdBase || x.id >= pIdBase + PARTICLES_PER_HIT)), PARTICLE_LIFETIME_MS);

      tilesRef.current = tilesRef.current.filter(t => t.id !== hitTile.id);
      setTiles([...tilesRef.current]);
    } else {
      triggerGameOver();
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`flex-1 relative flex flex-col h-full w-full overflow-hidden select-none touch-action-none ${isShaking ? 'animate-shake' : ''}`}
    >
      <div className="absolute inset-0 bg-[#00e676]"></div>
      
      <GameBackground />

      <div className={`absolute inset-0 z-[100] transition-opacity duration-150 pointer-events-none ${isMissed ? 'opacity-75 bg-red-600' : 'opacity-0 bg-transparent'}`}></div>
      
      {countdown !== null && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center pointer-events-none">
           <div key={countdown} className="text-5xl font-orbitron font-black text-white animate-countdown-zoom drop-shadow-[0_8px_32px_rgba(0,0,0,0.6)] uppercase">{countdown}</div>
        </div>
      )}

      <GameHUD score={score} combo={combo} />

      {/* Pause Button (Desktop only, hidden during countdown) */}
      {countdown === null && (
        <button
          onClick={togglePause}
          className="absolute top-4 right-4 z-[150] w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 hidden sm:flex"
          aria-label={isPaused ? "Resume game" : "Pause game"}
        >
          <i className={`fa-solid ${isPaused ? 'fa-play' : 'fa-pause'} text-[#0f1c3a] text-sm`}></i>
        </button>
      )}

      <div className="flex-1 flex w-full relative z-10">
        {[...Array(LANES)].map((_, i) => (
          <div 
            key={i} 
            className={`flex-1 relative overflow-hidden ${i < LANES - 1 ? 'border-r-[2.8px] border-black' : ''}`} 
            onPointerDown={(e) => { e.preventDefault(); handleInteraction(i, e.clientX, e.clientY); }}
          >
             <div className={`absolute inset-0 bg-white/40 transition-opacity duration-100 pointer-events-none z-30 ${activeLanes[i] ? 'opacity-100' : 'opacity-0'}`}></div>
          </div>
        ))}
      </div>

      <div className="absolute inset-0 z-20 pointer-events-none">
        {tiles.map(tile => (
          <div 
            key={tile.id} 
            className="absolute will-change-transform" 
            style={{ 
              height: `${tile.height}%`, 
              width: `${100 / LANES}%`, 
              left: `${(tile.lane / LANES) * 100}%`, 
              transform: `translate3d(0, ${tile.y}vh, 0)`, 
              opacity: tile.hit ? 0 : 1, 
              zIndex: tile.hit ? 40 : 20
            }}
          >
            <div className={`w-full mx-auto h-full rounded-[2px] overflow-hidden relative shadow-2xl flex items-center justify-center ${tile.missed ? 'bg-white' : 'bg-black'}`}>
               <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-30"></div>
               <div className="relative z-10 opacity-80">
                  <i className={`fa-solid fa-music ${tile.missed ? 'text-red-700' : 'text-white'}`}></i>
               </div>
               {!tile.missed && <div className="absolute top-0 left-0 right-0 h-[4px] bg-white/25"></div>}
            </div>
          </div>
        ))}
      </div>

      {particles.map(p => <div key={p.id} className="particle text-2xl" style={{ left: p.x, top: p.y, color: p.color }}><i className="fa-solid fa-sparkle"></i></div>)}
      
      {feedbacks.map(f => (
        <div key={f.id} className="fixed pointer-events-none z-[100] flex flex-col items-center animate-feedback-float" style={{ left: f.x, top: f.y }}>
           <span className="text-sm font-orbitron font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{f.points}</span>
           <span className={`text-xl font-orbitron font-black italic tracking-tighter ${f.color} drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]`}>
             {f.text}
           </span>
        </div>
      ))}

      {/* Pause Overlay */}
      {isPaused && (
        <div className="absolute inset-0 z-[300] bg-[#0f1c3a]/95 flex flex-col items-center justify-center gap-6 px-6">
          <div className="text-center mb-4">
            <i className="fa-solid fa-pause text-white text-6xl mb-4 opacity-90"></i>
            <h2 className="text-3xl font-orbitron font-black text-white uppercase tracking-tight mb-2">Paused</h2>
            <p className="text-white/70 font-orbitron text-xs tracking-widest uppercase">Take a breath</p>
          </div>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={togglePause}
              className="w-full py-4 bg-white text-[#0f1c3a] font-orbitron font-black text-xs tracking-[0.3em] rounded-2xl shadow-xl hover:bg-white/90 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase"
            >
              <i className="fa-solid fa-play text-xs"></i>
              Resume
            </button>

            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-transparent text-white/80 font-orbitron font-black text-xs tracking-[0.3em] rounded-2xl hover:bg-white/10 active:scale-95 transition-all uppercase border-2 border-white/20"
            >
              <i className="fa-solid fa-arrow-left text-xs mr-2"></i>
              Quit to Menu
            </button>
          </div>

          <p className="text-white/50 font-orbitron text-[10px] tracking-wider uppercase mt-4">
            Press <kbd className="px-2 py-1 bg-white/10 rounded">ESC</kbd> or <kbd className="px-2 py-1 bg-white/10 rounded">P</kbd> to resume
          </p>
        </div>
      )}

      <style>{`
        @keyframes feedback-float {
          0% { transform: translate(-50%, 0) scale(0.6); opacity: 0; }
          25% { transform: translate(-50%, -15px) scale(1.1); opacity: 1; }
          100% { transform: translate(-50%, -100px) scale(0.5); opacity: 0; }
        }
        @keyframes combo-pop {
          0% { transform: scale(0.7); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes countdown-zoom { 
          0% { transform: scale(0.05); opacity: 0; } 
          15% { transform: scale(1.1); opacity: 1; } 
          100% { transform: scale(1.8); opacity: 0; } 
        }
        @keyframes shake { 
          0%, 100% { transform: translate(0, 0); } 
          20% { transform: translate(-5px, 5px); }
          40% { transform: translate(5px, -5px); }
          60% { transform: translate(-3px, 0px); }
          80% { transform: translate(0px, -3px); }
        }
        .animate-feedback-float { animation: feedback-float 0.6s ease-out forwards; }
        .animate-combo-pop { animation: combo-pop 0.18s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .animate-countdown-zoom { animation: countdown-zoom 0.95s ease-out forwards; }
        .animate-shake { animation: shake 0.07s infinite; }
      `}</style>
    </div>
  );
};

export default MagicTiles;
