class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public voiceEnabled: boolean = true;
  private synth: SpeechSynthesis | null = null;
  private indoVoice: SpeechSynthesisVoice | null = null;
  private activeUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return;
    // Look for Indonesian voice, or fallback to an expressive default voice
    this.indoVoice = voices.find(v => v.lang.startsWith('id') || v.lang.startsWith('in')) 
      || voices.find(v => v.lang.startsWith('en')) 
      || voices[0] || null;
  }

  public speak(
    text: string, 
    rate: number = 1.15, 
    pitch: number = 1.05,
    onEnd?: () => void
  ): () => void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && !this.synth) {
      this.synth = window.speechSynthesis;
    }
    this.loadVoices();

    if (!this.enabled || !this.voiceEnabled || !this.synth) {
      if (onEnd) {
        const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
        const estDurationMs = Math.max(1600, Math.min(8000, (wordCount / (2.5 * rate)) * 1000 + 400));
        const t = setTimeout(onEnd, estDurationMs);
        return () => clearTimeout(t);
      }
      return () => {};
    }

    let finished = false;
    let fallbackTimer: NodeJS.Timeout | null = null;

    const finish = () => {
      if (finished) return;
      finished = true;
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }
      this.activeUtterance = null;
      if (onEnd) {
        onEnd();
      }
    };

    try {
      if (this.synth.speaking || this.synth.pending) {
        this.synth.cancel();
      }
      // Bersihkan tanda '#' agar tidak dibaca sebagai "tanda pagar" atau "hashtag" oleh Text-to-Speech
      const speechSafeText = text
        .replace(/Rider\s*#(\d+)/gi, 'Rider $1')
        .replace(/#(\d+)/g, 'nomor $1')
        .replace(/#/g, ' ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(speechSafeText);
      this.activeUtterance = utterance; // Prevent garbage collection on Android/Chrome

      if (this.indoVoice) {
        utterance.voice = this.indoVoice;
      }
      utterance.lang = this.indoVoice?.lang || 'id-ID';
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = 1.0;

      utterance.onend = () => {
        finish();
      };

      utterance.onerror = () => {
        finish();
      };

      // Generous fallback safety timeout ONLY in case browser speech engine crashes or stalls
      // We allow ~750ms per word + 5000ms buffer so real speech is NEVER cut off
      const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
      const maxEstimatedMs = Math.max(6000, (wordCount * 750) / rate + 5000);
      fallbackTimer = setTimeout(() => {
        finish();
      }, maxEstimatedMs);

      this.synth.speak(utterance);
    } catch {
      finish();
    }

    return () => {
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }

  public cancelSpeech() {
    this.activeUtterance = null;
    if (this.synth) {
      this.synth.cancel();
    }
  }

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playCardFlip() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  public playEnergyZap() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  public playPedalRatchet() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800 + i * 80, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.03);
      }, i * 35);
    }
  }

  public playSkidDrift() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    // White noise buffer for skid sound
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.25);
    filter.Q.value = 3;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
    noise.stop(this.ctx.currentTime + 0.25);
  }

  public playBellRing() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760, this.ctx.currentTime); // High A6 bell

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.6);
  }

  public playWinFanfare() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.35);
      }, idx * 110);
    });
  }

  public playWhoosh() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1500, this.ctx.currentTime + 0.1);
    filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.2);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
    noise.stop(this.ctx.currentTime + 0.2);
  }

  public playSprintBurst() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(750, this.ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  public playCountdownBeep(high: boolean = false) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(high ? 880 : 440, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + (high ? 0.35 : 0.12));

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + (high ? 0.35 : 0.12));
  }

  public playCameraFlash() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(2400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  public playLossTone() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [400, 350, 300];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
      }, idx * 90);
    });
  }

  /**
   * Efek Suara Turunan: Deru desiran angin aero kencang (High-speed Downhill Wind Gust)
   */
  public playDownhillWind(durationSec: number = 0.85) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const bufferSize = Math.floor(ctx.sampleRate * durationSec);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Resonant sweep bandpass to simulate howling wind
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1900, ctx.currentTime + durationSec * 0.4);
    filter.frequency.exponentialRampToValueAtTime(650, ctx.currentTime + durationSec);
    filter.Q.setValueAtTime(3.8, ctx.currentTime);

    // Highpass to eliminate muddy hum and keep crisp rushing air
    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(280, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.02, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.24, ctx.currentTime + durationSec * 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);

    noise.connect(filter);
    filter.connect(highpass);
    highpass.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    noise.stop(ctx.currentTime + durationSec);
  }

  /**
   * Efek Suara Tanjakan: Helaan napas berat pembalap (Heavy Panting/Exhaustion Breath) & derit torsi kayuhan
   */
  public playHeavyBreathingClimb(cycles: number = 2) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const ctx = this.ctx;

    for (let c = 0; c < cycles; c++) {
      const cycleStart = c * 0.48;

      // Inhalation / Exhalation Breath noise
      const breathDuration = 0.38;
      const bufferSize = Math.floor(ctx.sampleRate * breathDuration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      setTimeout(() => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        // Breath formant filter (lowpass + bandpass)
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(380, now);
        filter.frequency.exponentialRampToValueAtTime(750, now + 0.15);
        filter.frequency.exponentialRampToValueAtTime(320, now + breathDuration);
        filter.Q.value = 2.2;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.16, now + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + breathDuration);

        // Low frequency crank torque strain grunt
        const torqueOsc = this.ctx.createOscillator();
        const torqueGain = this.ctx.createGain();
        torqueOsc.type = 'triangle';
        torqueOsc.frequency.setValueAtTime(110 - c * 8, now);
        torqueOsc.frequency.exponentialRampToValueAtTime(70, now + 0.22);

        torqueGain.gain.setValueAtTime(0.12, now);
        torqueGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        torqueOsc.connect(torqueGain);
        torqueGain.connect(this.ctx.destination);

        noise.start();
        noise.stop(now + breathDuration);
        torqueOsc.start();
        torqueOsc.stop(now + 0.22);
      }, cycleStart * 1000);
    }
  }

  /**
   * Efek Suara Tikungan: Decitan cengkeraman ban & asphalt scrubbing (Cornering Tire Grip Squeal)
   */
  public playTireCornering() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const dur = 0.35;
    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // High Q squeal filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2900, ctx.currentTime + 0.12);
    filter.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + dur);
    filter.Q.value = 5.5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.02, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    noise.stop(ctx.currentTime + dur);
  }

  /**
   * Efek Suara Medan Datar: Gemuruh laju peloton & putaran bearing aero (Paceline Aero Hum)
   */
  public playAeroPacelineHum() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const dur = 0.55;

    // Harmonized smooth tire hum
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(190, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + dur * 0.5);
    osc1.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + dur);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(380, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + dur * 0.5);
    osc2.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + dur);

    gain.gain.setValueAtTime(0.01, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + dur);
    osc2.stop(ctx.currentTime + dur);
  }

  /**
   * Efek Suara Cipratan Air / Hujan (Wet Tire Water Spray)
   */
  public playWetTireSpray() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const dur = 0.32;
    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(3200, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    noise.stop(ctx.currentTime + dur);
  }

  /**
   * Efek Suara Hujan Lebat (Continuous Storm Rain Downpour)
   */
  public playRainDownpour(dur: number = 2.5) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const bufferSize = Math.floor(ctx.sampleRate * Math.min(dur, 4.0));
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, ctx.currentTime);
    filter.Q.value = 1.2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.10, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.10, ctx.currentTime + dur - 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    noise.stop(ctx.currentTime + dur);
  }

  /**
   * Efek Gemuruh Petir Kejauhan (Distant Thunder Rumble)
   */
  public playThunderRumble() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const dur = 1.6;
    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + dur);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.14, ctx.currentTime + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    noise.stop(ctx.currentTime + dur);
  }

  /**
   * Helper Terpadu untuk Memainkan Suara Berdasarkan Karakteristik Medan
   */
  public playTerrainSound(terrain: string, isIntense: boolean = false) {
    if (!this.enabled) return;

    switch (terrain) {
      case 'TANJAKAN':
        this.playHeavyBreathingClimb(isIntense ? 3 : 2);
        break;
      case 'TURUNAN':
        this.playDownhillWind(isIntense ? 1.1 : 0.75);
        break;
      case 'TIKUNGAN':
        this.playTireCornering();
        break;
      case 'DATAR':
      default:
        this.playAeroPacelineHum();
        break;
    }
  }
}

export const sound = new SoundManager();
