// OfficeSoundEngine.js - Motor de audio interactivo sintetizado para la Oficina Virtual SERAM
// Utiliza la Web Audio API estándar (0 dependencias externas, carga instantánea de 0ms)

class OfficeSoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    try {
      this.muted = localStorage.getItem('seram_sound_muted') === 'true';
    } catch (_) {
      this.muted = false;
    }
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {
        // Silenciar error si el navegador bloquea autoplay
      });
    }
  }

  isMuted() {
    return this.muted;
  }

  setMuted(muted) {
    this.muted = muted;
    try {
      localStorage.setItem('seram_sound_muted', muted ? 'true' : 'false');
    } catch (_) {
      // Ignorar si storage está deshabilitado
    }
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  // Sonido de pasos Point & Click (suave y rítmico)
  playFootstep(variation = 0) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freq = 120 + (variation % 2 === 0 ? 15 : -10);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.08);

      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.09);
    } catch (_) {
      // Silenciar excepción de Web Audio
    }
  }

  // Clic en escritorio o interacción táctil
  playDeskClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.05);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.07);
    } catch (_) {
      // Silenciar excepción de Web Audio
    }
  }

  // Tintineo y vapor de cafetera en Sala Recreativa
  playCoffeeBrew() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, t); // E5
      osc.frequency.exponentialRampToValueAtTime(1318.5, t + 0.12); // E6

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.36);
    } catch (_) {
      // Silenciar excepción de Web Audio
    }
  }

  // Apertura de módulo o drawer
  playModuleOpen() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25]; // Acorde A-Mayor moderno
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + i * 0.04);

        gain.gain.setValueAtTime(0.05, t + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.04 + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t + i * 0.04);
        osc.stop(t + i * 0.04 + 0.19);
      });
    } catch (_) {
      // Silenciar excepción de Web Audio
    }
  }
}

export const soundEngine = new OfficeSoundEngine();
export default soundEngine;
