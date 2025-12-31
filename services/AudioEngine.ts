
import { PIANO_FREQUENCIES } from '../constants';
import { InstrumentType } from '../types';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private silkFilter: BiquadFilterNode | null = null;
  private reverbGain: GainNode | null = null;
  private melodyIndex: number = 0;
  private currentMelody: string[] = [];
  private currentInstrument: InstrumentType = 'felt-piano';
  private activeNotes: Set<{ nodes: AudioNode[]; gains: GainNode[] }> = new Set();

  init() {
    if (this.ctx && this.ctx.state === 'running') return;
    
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 44100 });
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      
      this.silkFilter = this.ctx.createBiquadFilter();
      this.silkFilter.type = 'lowpass';
      this.silkFilter.frequency.setValueAtTime(2400, this.ctx.currentTime);
      this.silkFilter.Q.setValueAtTime(0.8, this.ctx.currentTime);

      this.reverbGain = this.ctx.createGain();
      this.reverbGain.gain.value = 0.2; 

      const delay = this.ctx.createDelay();
      delay.delayTime.value = 0.15;
      const feedback = this.ctx.createGain();
      feedback.gain.value = 0.1;
      
      this.masterGain.connect(this.silkFilter);
      this.silkFilter.connect(this.ctx.destination);
      
      this.silkFilter.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      feedback.connect(this.reverbGain);
      this.reverbGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  stopAllSounds() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    this.activeNotes.forEach((note) => {
      note.gains.forEach(g => {
        g.gain.cancelScheduledValues(now);
        g.gain.setValueAtTime(g.gain.value, now);
        g.gain.linearRampToValueAtTime(0, now + 0.04);
      });

      setTimeout(() => {
        note.nodes.forEach(n => {
          if (n instanceof OscillatorNode) {
            try { n.stop(); n.disconnect(); } catch (e) {}
          } else {
            try { n.disconnect(); } catch (e) {}
          }
        });
      }, 100);
    });
    this.activeNotes.clear();
    this.melodyIndex = 0;
  }

  setMelody(melody: string[], instrument: InstrumentType) {
    this.currentMelody = melody;
    this.currentInstrument = instrument;
    this.melodyIndex = 0;
  }

  resetMelody() {
    this.melodyIndex = 0;
  }

  private createPremiumVoice(
    freq: number, 
    gainVal: number, 
    attack: number, 
    decay: number, 
    sustain: number, 
    release: number,
    type: OscillatorType = 'sine',
    harmonicWarmth: number = 0.2
  ) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    
    const body = this.ctx.createOscillator();
    const bodyGain = this.ctx.createGain();
    body.type = type;
    body.frequency.setValueAtTime(freq, now);
    
    const bloom = this.ctx.createOscillator();
    const bloomGain = this.ctx.createGain();
    bloom.type = 'sine';
    bloom.frequency.setValueAtTime(freq * 1.001, now);

    // FIXED RELEASE: Mandatory 1 second cap
    const clampedRelease = 1.0;

    bodyGain.gain.setValueAtTime(0, now);
    bodyGain.gain.linearRampToValueAtTime(gainVal, now + attack); 
    bodyGain.gain.exponentialRampToValueAtTime(gainVal * sustain, now + attack + decay);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay + clampedRelease);

    bloomGain.gain.setValueAtTime(0, now);
    bloomGain.gain.linearRampToValueAtTime(gainVal * harmonicWarmth, now + attack * 1.1);
    bloomGain.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay + clampedRelease);

    body.connect(bodyGain);
    bodyGain.connect(this.masterGain);
    bloom.connect(bloomGain);
    bloomGain.connect(this.masterGain);

    body.start(now);
    bloom.start(now);

    const noteRef = { nodes: [body, bloom, bodyGain, bloomGain], gains: [bodyGain, bloomGain] };
    this.activeNotes.add(noteRef);

    setTimeout(() => {
      this.activeNotes.delete(noteRef);
      try { 
        body.stop(); 
        body.disconnect();
        bloom.stop();
        bloom.disconnect();
        bodyGain.disconnect();
        bloomGain.disconnect();
      } catch (e) {}
    }, (attack + decay + clampedRelease + 0.1) * 1000);
  }

  playNextNote() {
    if (!this.ctx || this.ctx.state !== 'running') this.init();
    if (!this.ctx || !this.masterGain || this.currentMelody.length === 0) return;

    const note = this.currentMelody[this.melodyIndex % this.currentMelody.length];
    const freq = PIANO_FREQUENCIES[note] || 440;
    this.melodyIndex++;

    switch (this.currentInstrument) {
      case 'angel-keys':
        this.createPremiumVoice(freq, 0.35, 0.03, 0.3, 0.2, 0.6);
        break;
      case 'crystal-piano':
        this.createPremiumVoice(freq, 0.3, 0.02, 0.4, 0.1, 1.0, 'sine', 0.5);
        break;
      case 'velvet-ivory':
        this.createPremiumVoice(freq, 0.38, 0.08, 0.4, 0.25, 0.8);
        break;
      case 'dream-grand':
        this.createPremiumVoice(freq, 0.42, 0.05, 0.3, 0.2, 1.0);
        break;
      default:
        this.createPremiumVoice(freq, 0.3, 0.05, 0.3, 0.2, 0.8);
    }
  }

  playMiss() {
    if (!this.ctx || !this.masterGain) return;
    this.stopAllSounds(); 
    const now = this.ctx.currentTime;
    const sub = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(45, now);
    sub.frequency.exponentialRampToValueAtTime(5, now + 0.3);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
    sub.connect(gain);
    gain.connect(this.ctx.destination);
    sub.start(now);
    sub.stop(now + 0.5);
  }
}

export const audioService = new AudioEngine();
