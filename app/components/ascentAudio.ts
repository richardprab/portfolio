import { useAscentStore } from "./three/store";
import { activeLegIndex } from "./three/anchors";
import { portfolioItems } from "../data/portfolio";

// The expedition's soundscape, synthesized entirely in WebAudio — no files,
// no network. A wind bed under a slow chord progression in A (the summit
// fanfare is an A-major arpeggio, so the finale lands ON the music); a soft
// echoed motif walks the chord tones, sparser at night, fuller with
// altitude; a small ascending chime marks each camp and switchback leg
// ("level up"); a triumphant swell when the summit is gained. Starts only
// from a user gesture, via the sound toggle.

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

// Aadd9 → F#m7 → Dmaj7 → Esus2, voiced [bass, fifth, color, color].
const CHORDS: number[][] = [
  [110.0, 164.81, 246.94, 277.18],
  [92.5, 138.59, 220.0, 329.63],
  [146.83, 220.0, 185.0, 277.18],
  [82.41, 123.47, 207.65, 246.94],
];
const CHORD_SECONDS = 7.5;

class AscentAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private padBus: GainNode | null = null;
  private padFilter: BiquadFilterNode | null = null;
  private windGain: GainNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private chordOscs: OscillatorNode[][] = [];
  private slotGains: GainNode[] = [];
  private subOsc: OscillatorNode | null = null;
  private unsub: (() => void) | null = null;
  private schedTimer: ReturnType<typeof setInterval> | null = null;
  private chordIndex = 0;
  private nextChordAt = 0;
  private rise = 0;
  private lastCamp = -1;
  private lastLeg = -1;
  private lastSite = -1;
  private fanfarePlayed = false;
  private on = false;

  // External-store contract for React (useSyncExternalStore).
  private listeners = new Set<() => void>();

  subscribe = (fn: () => void): (() => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };

  getOn = (): boolean => this.on;

  isOn(): boolean {
    return this.on;
  }

  // Dev-only diagnostic snapshot — read by verification scripts, never by
  // production UI.
  debugSnapshot() {
    return {
      on: this.on,
      ctxState: this.ctx?.state ?? "none",
      masterGain: this.master?.gain.value ?? null,
      chordIndex: this.chordIndex,
      lastCamp: this.lastCamp,
      lastLeg: this.lastLeg,
      lastSite: this.lastSite,
      fanfarePlayed: this.fanfarePlayed,
      oscCount: this.chordOscs.flat().length,
    };
  }

  toggle(): boolean {
    if (this.on) {
      this.setOn(false);
    } else {
      this.setOn(true);
    }
    return this.on;
  }

  setOn(next: boolean, persist = true): void {
    this.on = next;
    this.listeners.forEach((fn) => fn());
    if (next) {
      this.ensure();
      this.ctx?.resume().catch(() => {
        // Autoplay-blocked: stays suspended until kick() after a gesture.
      });
      this.master?.gain.setTargetAtTime(1, this.ctx!.currentTime, 0.6);
    } else if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.25);
    }
    if (!persist) return;
    try {
      localStorage.setItem("ascent-sound", next ? "1" : "0");
    } catch {
      // Storage unavailable: preference simply won't persist.
    }
  }

  // Browsers keep a pre-gesture AudioContext suspended; the first real
  // interaction calls this to let the armed score actually sound.
  kick(): void {
    if (this.on) this.ctx?.resume().catch(() => {});
  }

  private ensure(): void {
    if (this.ctx) return;
    const ctx = new AudioContext();
    this.ctx = ctx;

    // Master → gentle glue compressor → out, with a parallel generated-IR
    // reverb: the difference between "oscillators" and "a score in a
    // valley". The impulse is 3.2 s of exponentially decaying noise.
    const master = ctx.createGain();
    master.gain.value = 0;
    this.master = master;

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.knee.value = 12;
    compressor.ratio.value = 2.5;
    compressor.attack.value = 0.02;
    compressor.release.value = 0.3;
    compressor.connect(ctx.destination);
    master.connect(compressor);

    const irSeconds = 3.2;
    const ir = ctx.createBuffer(2, ctx.sampleRate * irSeconds, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < d.length; i++) {
        const t = i / d.length;
        d[i] = (Math.random() * 2 - 1) * Math.exp(-4.2 * t) * (1 - t * 0.4);
      }
    }
    const convolver = ctx.createConvolver();
    convolver.buffer = ir;
    const revSend = ctx.createGain();
    revSend.gain.value = 0.34;
    master.connect(revSend).connect(convolver).connect(compressor);

    // --- Wind: looped noise through a slowly wandering low-pass.
    const noiseSeconds = 3;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * noiseSeconds, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      // Lightly lowpassed white noise ≈ wind body.
      const white = Math.random() * 2 - 1;
      last = last * 0.94 + white * 0.06;
      data[i] = last * 3.2;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = "lowpass";
    windFilter.frequency.value = 420;
    windFilter.Q.value = 0.4;
    const windGain = ctx.createGain();
    windGain.gain.value = 0.05;
    noise.connect(windFilter).connect(windGain).connect(master);
    noise.start();
    const windLfo = ctx.createOscillator();
    windLfo.frequency.value = 0.06;
    const windLfoDepth = ctx.createGain();
    windLfoDepth.gain.value = 160;
    windLfo.connect(windLfoDepth).connect(windFilter.frequency);
    windLfo.start();
    this.windGain = windGain;
    this.windFilter = windFilter;

    // --- Pad: four gliding voices (two detuned oscillators each) that the
    // scheduler retunes through the progression. The two color voices fade
    // in with altitude, so the harmony literally opens as you climb.
    const padBus = ctx.createGain();
    padBus.gain.value = 0.05;
    const padFilter = ctx.createBiquadFilter();
    padFilter.type = "lowpass";
    padFilter.frequency.value = 900;
    padBus.connect(padFilter).connect(master);
    this.padBus = padBus;
    this.padFilter = padFilter;

    const baseGains = [0.5, 0.4, 0.0, 0.0];
    this.chordOscs = CHORDS[0].map((freq, slot) => {
      const g = ctx.createGain();
      g.gain.value = baseGains[slot];
      g.connect(padBus);
      this.slotGains.push(g);
      // Three detuned oscillators per voice: the beating between them is
      // what makes a pad sound like fabric instead of a test tone.
      return [-6, 3, 9].map((detune, k) => {
        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.value = freq;
        osc.detune.value = detune;
        const trim = ctx.createGain();
        trim.gain.value = k === 2 ? 0.5 : 0.8;
        osc.connect(trim).connect(g);
        osc.start();
        return osc;
      });
    });

    // A sine sub an octave under the bass voice: quiet warmth underneath.
    const sub = ctx.createOscillator();
    sub.type = "sine";
    sub.frequency.value = CHORDS[0][0] / 2;
    const subGain = ctx.createGain();
    subGain.gain.value = 0.32;
    sub.connect(subGain).connect(padBus);
    sub.start();
    this.subOsc = sub;

    // Slow swell so the bed never sits perfectly still.
    const padLfo = ctx.createOscillator();
    padLfo.frequency.value = 0.05;
    const padLfoDepth = ctx.createGain();
    padLfoDepth.gain.value = 0.012;
    padLfo.connect(padLfoDepth).connect(padBus.gain);
    padLfo.start();

    // --- The progression scheduler.
    this.nextChordAt = ctx.currentTime + CHORD_SECONDS;
    this.schedTimer = setInterval(() => this.tick(), 400);

    // --- Story events from the store.
    this.unsub = useAscentStore.subscribe((s) => {
      const campT = clamp(s.campT, 0, 4);
      const camp = Math.round(campT);
      if (camp !== this.lastCamp) {
        if (camp > this.lastCamp && this.lastCamp >= 0 && camp < 4) this.campChime(camp);
        this.lastCamp = camp;
      }
      if (camp === 2) {
        const leg = activeLegIndex(s.legProgress);
        if (leg !== this.lastLeg) {
          if (this.lastLeg >= 0 && leg > this.lastLeg) this.legChime(leg);
          this.lastLeg = leg;
        }
      }
      if (camp === 3) {
        const site = Math.min(
          portfolioItems.length - 1,
          Math.floor(s.siteProgress * portfolioItems.length)
        );
        if (site !== this.lastSite) {
          if (this.lastSite >= 0 && site > this.lastSite) this.siteChime(site);
          this.lastSite = site;
        }
      }
      if (campT >= 3.55 && !this.fanfarePlayed) {
        this.fanfarePlayed = true;
        this.fanfare();
      } else if (campT < 3.1 && this.fanfarePlayed) {
        this.fanfarePlayed = false;
      }
      // The bed climbs with you: brighter filter, stronger wind, the color
      // voices entering.
      this.rise = campT / 4;
      const t = ctx.currentTime;
      this.padFilter?.frequency.setTargetAtTime(900 + this.rise * 1900, t, 0.8);
      this.windFilter?.frequency.setTargetAtTime(420 + this.rise * 480, t, 0.8);
      this.windGain?.gain.setTargetAtTime(0.05 + this.rise * 0.035, t, 0.8);
      this.slotGains[2]?.gain.setTargetAtTime(this.rise * 0.34, t, 1.2);
      this.slotGains[3]?.gain.setTargetAtTime(Math.max(0, this.rise - 0.45) * 0.5, t, 1.2);
    });

    document.addEventListener("visibilitychange", () => {
      if (!this.ctx) return;
      if (document.hidden) this.ctx.suspend();
      else if (this.on) this.ctx.resume();
    });
  }

  // Advance the progression and sprinkle the motif. Runs on a coarse timer;
  // all precise timing goes through the AudioContext clock.
  private tick(): void {
    const ctx = this.ctx;
    if (!ctx || !this.on || ctx.state !== "running") return;
    const now = ctx.currentTime;

    if (now >= this.nextChordAt - 0.4) {
      this.chordIndex = (this.chordIndex + 1) % CHORDS.length;
      this.retune(this.chordIndex, 1.1);
      this.nextChordAt = Math.max(this.nextChordAt, now) + CHORD_SECONDS;
    }

  }

  private retune(index: number, glide: number): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    CHORDS[index].forEach((freq, slot) => {
      this.chordOscs[slot]?.forEach((osc) => osc.frequency.setTargetAtTime(freq, t, glide));
    });
    this.subOsc?.frequency.setTargetAtTime(CHORDS[index][0] / 2, t, glide);
  }

  private tone(
    freq: number,
    startIn: number,
    duration: number,
    peak: number,
    type: OscillatorType = "sine"
  ): void {
    if (!this.ctx || !this.master) return;
    const t0 = this.ctx.currentTime + startIn;
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(g).connect(this.master);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  }

  // A small glass bell: inharmonic partials with a soft strike — rings
  // ONLY at waypoints (camps, legs, sites), never ambiently.
  private bell(freq: number, startIn: number, peak: number): void {
    const partials: Array<[number, number, number]> = [
      [1, 1, 1.1],
      [2.76, 0.38, 0.7],
      [5.4, 0.14, 0.4],
    ];
    for (const [ratio, gain, dur] of partials) {
      this.tone(freq * ratio, startIn, dur, peak * gain);
    }
  }

  // Reaching a camp: two glass strikes, higher for each camp gained.
  private campChime(camp: number): void {
    const base = 392 * Math.pow(2, (camp * 2) / 12);
    this.bell(base, 0, 0.09);
    this.bell(base * 1.5, 0.12, 0.06);
  }

  // Passing a switchback leg: one bright strike upward.
  private legChime(leg: number): void {
    this.bell(523.25 * Math.pow(2, (leg * 2) / 12), 0, 0.075);
  }

  // Arriving at a project site: the lightest touch of the three.
  private siteChime(index: number): void {
    this.bell(659.25 * Math.pow(2, index / 12), 0, 0.055);
  }

  // The summit: a slow triumphant arpeggio over a swelling bed. The bed is
  // pulled home to the tonic so the fanfare lands on its own chord.
  private fanfare(): void {
    if (!this.ctx) return;
    this.chordIndex = 0;
    this.retune(0, 0.5);
    this.nextChordAt = this.ctx.currentTime + 10;
    const notes = [220, 277.18, 329.63, 440, 554.37];
    notes.forEach((freq, i) => {
      this.tone(freq, i * 0.22, 2.4 - i * 0.15, 0.11);
      this.tone(freq * 2, i * 0.22 + 0.05, 1.6, 0.03, "triangle");
    });
    this.tone(110, 0, 2.8, 0.12);
    const t = this.ctx.currentTime;
    this.padBus?.gain.cancelScheduledValues(t);
    this.padBus?.gain.setTargetAtTime(0.11, t, 0.4);
    this.padBus?.gain.setTargetAtTime(0.05, t + 4.5, 2.0);
    this.padFilter?.frequency.setTargetAtTime(3400, t, 0.4);
  }
}

export const ascentAudio = new AscentAudio();
