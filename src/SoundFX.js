/**
 * Procedural sound effects using Web Audio API.
 * No audio files needed — all sounds are synthesized on the fly.
 */
export class SoundFX {
  constructor(muteCheck) {
    this.muteCheck = muteCheck;
    this.ctx = null; // lazily created AudioContext
  }

  /** Lazily create AudioContext (must happen after user gesture). */
  getContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /** Returns true if sound should be suppressed. */
  isMuted() {
    return this.muteCheck && this.muteCheck();
  }

  // ── Primitives ──────────────────────────────────────────────

  /** Play a tone with frequency sweep. */
  tone(startFreq, endFreq, duration, type = 'square', volume = 0.15) {
    if (this.isMuted()) return;
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(endFreq, ctx.currentTime + duration);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  /** Play a noise burst (for hit/thwack sounds). */
  noise(duration, volume = 0.1) {
    if (this.isMuted()) return;
    const ctx = this.getContext();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
    source.connect(gain).connect(ctx.destination);
    source.start(ctx.currentTime);
  }

  /** Play a sequence of tones (for arpeggios/fanfares). */
  arpeggio(frequencies, noteDuration, type = 'square', volume = 0.12) {
    if (this.isMuted()) return;
    frequencies.forEach((freq, i) => {
      const delay = i * noteDuration;
      setTimeout(() => this.tone(freq, freq, noteDuration * 0.9, type, volume), delay * 1000);
    });
  }

  // ── Sound Effects ───────────────────────────────────────────

  playerSpawn() {
    this.tone(300, 600, 0.1, 'square', 0.12);
  }

  enemySpawn() {
    this.tone(500, 250, 0.1, 'square', 0.08);
  }

  combatHit() {
    this.noise(0.06, 0.1);
    this.tone(200, 100, 0.05, 'sawtooth', 0.06);
  }

  unitDeath() {
    this.tone(400, 100, 0.2, 'triangle', 0.1);
  }

  baseDamage() {
    this.tone(80, 40, 0.15, 'sine', 0.15);
    this.noise(0.08, 0.06);
  }

  victory() {
    this.arpeggio([523, 659, 784, 1047], 0.15, 'square', 0.15);
  }

  defeat() {
    this.arpeggio([400, 350, 300, 200], 0.2, 'triangle', 0.12);
  }

  coinChime() {
    this.tone(800, 1200, 0.08, 'sine', 0.1);
    setTimeout(() => this.tone(1200, 1400, 0.06, 'sine', 0.08), 80);
  }

  errorBuzz() {
    this.tone(150, 100, 0.15, 'sawtooth', 0.12);
  }

  abilityPurchase() {
    this.arpeggio([523, 659, 784], 0.08, 'sine', 0.12);
  }

  rainOfArrows() {
    this.noise(0.15, 0.12);
    this.tone(2000, 4000, 0.2, 'sine', 0.08);
  }

  healEffect() {
    this.tone(400, 600, 0.2, 'sine', 0.1);
    setTimeout(() => this.tone(500, 800, 0.2, 'sine', 0.08), 100);
  }
}
