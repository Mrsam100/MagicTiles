
import { Song } from './types';

export const LANES = 4;
export const TILE_HEIGHT = 22; 
export const INITIAL_SPEED = 1.35; 
export const ACCELERATION = 0.0005; 
export const SPAWN_THRESHOLD = 18.0; 

export const PIANO_FREQUENCIES: { [key: string]: number } = {
  'G2': 98.00, 'A2': 110.00, 'B2': 123.47,
  'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
  'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
  'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51, 'F6': 1396.91, 'G6': 1567.98, 'A6': 1760.00, 'B6': 1975.53,
  'C7': 2093.00, 'D7': 2349.32, 'E7': 2637.02, 'F7': 2793.83, 'G7': 3135.96,
  'C#5': 554.37, 'F#4': 369.99, 'Ab4': 415.30, 'Bb4': 466.16, 'Eb5': 622.25, 'Ab5': 830.61, 'Bb5': 932.33, 'Eb6': 1244.51
};

export const SONGS: Song[] = [
  {
    id: 'sweet-remix-medley',
    name: 'ULTIMATE SWEET REMIX',
    genre: 'DJ PARTY MEDLEY',
    icon: 'fa-bolt-lightning',
    color: 'text-yellow-400',
    instrument: 'angel-keys',
    melody: [
      // Medley of Sweet Melodies - Distinct & Energetic
      'C5', 'F5', 'A5', 'C6', 'A5', 'F5', 'G5', 'E5', 
      'D5', 'G5', 'B5', 'D6', 'B5', 'G5', 'C6', 'G5',
      'C6', 'E6', 'G6', 'C7', 'G6', 'E6', 'F6', 'D6',
      'C6', 'A5', 'F5', 'D5', 'G5', 'B5', 'D6', 'G6'
    ]
  },
  {
    id: 'rose-serenade',
    name: 'ROSE GARDEN SERENADE',
    genre: 'ROMANTIC PIANO',
    icon: 'fa-heart',
    color: 'text-rose-400',
    instrument: 'velvet-ivory',
    melody: [
      // Different Vibe: Flowing Arpeggios
      'A4', 'C5', 'E5', 'A5', 'B5', 'G5', 'E5', 'C5',
      'F5', 'A5', 'C6', 'F6', 'E6', 'C6', 'A5', 'F5',
      'D5', 'F5', 'A5', 'D6', 'C6', 'A5', 'F5', 'D5',
      'G5', 'B5', 'D6', 'G6', 'F6', 'D6', 'B5', 'G5'
    ]
  },
  {
    id: 'angelic-crystal',
    name: 'ANGELIC CRYSTAL',
    genre: 'HEAVENLY BELLS',
    icon: 'fa-wand-sparkles',
    color: 'text-cyan-300',
    instrument: 'crystal-piano',
    melody: [
      // Different Vibe: High-pitched Shimmer
      'C6', 'G6', 'E6', 'C6', 'D6', 'A6', 'F6', 'D6',
      'E6', 'B6', 'G6', 'E6', 'F6', 'C7', 'A6', 'F6',
      'G6', 'D7', 'B6', 'G6', 'A6', 'E7', 'C7', 'A6',
      'B6', 'F7', 'D7', 'B6', 'C7', 'G7', 'E7', 'C7'
    ]
  },
  {
    id: 'golden-hour',
    name: 'GOLDEN HOUR BLISS',
    genre: 'SUNSET SONATA',
    icon: 'fa-sun',
    color: 'text-orange-400',
    instrument: 'dream-grand',
    melody: [
      // Different Vibe: Deep and Rich Arpeggios
      'C4', 'E4', 'G4', 'C5', 'G4', 'E4', 'C4', 'G3',
      'F4', 'A4', 'C5', 'F5', 'C5', 'A4', 'F4', 'C4',
      'G4', 'B4', 'D5', 'G5', 'D5', 'B4', 'G4', 'D4',
      'A4', 'C5', 'E5', 'A5', 'E5', 'C5', 'A4', 'E4'
    ]
  }
];

export const LANE_COLORS = ['bg-slate-900', 'bg-slate-900', 'bg-slate-900', 'bg-slate-900'];
export const LANE_GLOWS = ['border-blue-500/30', 'border-purple-500/30', 'border-cyan-500/30', 'border-indigo-500/30'];
