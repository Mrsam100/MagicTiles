
export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER',
  LOADING = 'LOADING'
}

export interface Tile {
  id: number;
  lane: number;
  y: number; // Percentage from top
  height: number;
  hit: boolean;
  missed: boolean;
}

export type InstrumentType = 
  | 'felt-piano' 
  | 'angel-keys' 
  | 'velvet-ivory' 
  | 'crystal-piano' 
  | 'dream-grand';

export interface Song {
  id: string;
  name: string;
  genre: string;
  melody: string[];
  icon: string;
  color: string;
  instrument: InstrumentType;
}

export interface ScoreData {
  score: number;
  perfectHits: number;
  combo: number;
  maxCombo: number;
  highScore: number;
}
