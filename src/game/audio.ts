type Graph = {
  ctx: AudioContext;
  master: GainNode;
  sfx: GainNode;
  rain: AudioBufferSourceNode | null;
};

let graph: Graph | null = null;
let muted = false;
let rainOn = false;

function ctxNow(): AudioContext | null {
  return graph?.ctx ?? null;
}

export function unlockAudio() {
  if (typeof window === "undefined") return;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return;
  if (!graph) {
    const ctx = new Ctor({ latencyHint: "interactive" });
    const master = ctx.createGain();
    const sfx = ctx.createGain();
    sfx.gain.value = 0.9;
    sfx.connect(master);
    master.gain.value = muted ? 0 : 0.85;
    master.connect(ctx.destination);
    graph = { ctx, master, sfx, rain: null };
  }
  if (graph.ctx.state === "suspended") void graph.ctx.resume();
}

export function resumeAudio() {
  if (graph && graph.ctx.state === "suspended") void graph.ctx.resume();
}

export function setMuted(next: boolean) {
  muted = next;
  const g = graph;
  if (!g) return;
  g.master.gain.setTargetAtTime(next ? 0 : 0.85, g.ctx.currentTime, 0.02);
}

export function isMuted() {
  return muted;
}

function envGain(at: number, peak: number, dur: number) {
  const g = graph;
  if (!g) return null;
  const gain = g.ctx.createGain();
  gain.connect(g.sfx);
  const t = g.ctx.currentTime;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.001, peak), t + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  return { gain, t, stop: t + dur + 0.02, at };
}

function tone(freq: number, dur: number, type: OscillatorType, peak: number, slideTo?: number) {
  try {
  const g = graph;
  if (!g || muted || g.ctx.state === "closed") return;
  const shaped = envGain(freq, peak, dur);
  if (!shaped) return;
  const osc = g.ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, shaped.t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), shaped.t + dur);
  osc.connect(shaped.gain);
  osc.start(shaped.t);
  osc.stop(shaped.stop);
  osc.onended = () => {
    osc.disconnect();
    shaped.gain.disconnect();
  };
  } catch {
    /* a suspended audio device must not stop the run */
  }
}

function noise(dur: number, peak: number, band: number) {
  try {
  const g = graph;
  if (!g || muted || g.ctx.state === "closed") return;
  const seconds = Math.max(0.05, dur);
  const buffer = g.ctx.createBuffer(1, Math.floor(g.ctx.sampleRate * seconds), g.ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = g.ctx.createBufferSource();
  src.buffer = buffer;
  const filter = g.ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = band;
  filter.Q.value = 0.7;
  const shaped = envGain(band, peak, dur);
  if (!shaped) return;
  src.connect(filter);
  filter.connect(shaped.gain);
  src.start(shaped.t);
  src.stop(shaped.stop);
  src.onended = () => {
    src.disconnect();
    filter.disconnect();
    shaped.gain.disconnect();
  };
  } catch {
    /* ignore a dropped sound */
  }
}

export function playJump() {
  const wobble = 0.94 + Math.random() * 0.12;
  tone(220 * wobble, 0.12, "triangle", 0.18, 480 * wobble);
  noise(0.08, 0.08, 1400);
}

export function playLand() {
  noise(0.09, 0.07, 280);
  tone(90, 0.07, "sine", 0.08, 50);
}

export function playSplash() {
  noise(0.28, 0.22, 420);
  tone(140, 0.18, "sine", 0.12, 60);
}

export function playSplat() {
  noise(0.16, 0.12, 900);
  tone(90, 0.12, "sine", 0.08, 50);
}

export function playGulp() {
  noise(0.1, 0.1, 700);
  tone(180, 0.16, "sine", 0.16, 110);
}

export function playBark() {
  noise(0.07, 0.07, 380);
  tone(190, 0.08, "square", 0.07, 110);
  window.setTimeout(() => tone(150, 0.11, "square", 0.06, 80), 90);
}

export function playBuff() {
  tone(196, 0.08, "square", 0.07, 392);
  tone(330, 0.1, "square", 0.08, 523);
  window.setTimeout(() => tone(523, 0.16, "square", 0.09, 784), 90);
  noise(0.06, 0.05, 1600);
}

export function playStep() {
  noise(0.04, 0.035, 500 + Math.random() * 200);
}

export function startRain() {
  try {
  const g = graph;
  if (!g || rainOn || muted || g.ctx.state === "closed") return;
  const seconds = 2;
  const buffer = g.ctx.createBuffer(1, g.ctx.sampleRate * seconds, g.ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = g.ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  const filter = g.ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 900;
  const gain = g.ctx.createGain();
  gain.gain.value = 0.0001;
  gain.gain.setTargetAtTime(0.045, g.ctx.currentTime, 0.4);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(g.master);
  src.start();
  g.rain = src;
  rainOn = true;
  } catch {
    rainOn = false;
  }
}

export function stopRain() {
  const g = graph;
  window.clearTimeout(waterStopTimer);
  if (g?.rain) {
    try {
      g.rain.stop();
    } catch {
      /* already stopped */
    }
    g.rain.disconnect();
    g.rain = null;
  }
  if (waterLfo) {
    try {
      waterLfo.stop();
    } catch {
      /* already stopped */
    }
    waterLfo.disconnect();
    waterLfo = null;
  }
  waterGain = null;
  rainOn = false;
}

type MusicKind = "menu" | "level" | "sun" | "hymn" | "sad";

let musicKind: MusicKind | null = null;
let musicTimer = 0;
let musicStep = 0;
let musicRush = false;

const MENU_PHRASES = [
  [57, 60, 64, 67, 64, 60, 55, 52],
  [55, 59, 62, 67, 64, 62, 59, 0],
  [52, 55, 57, 64, 67, 64, 60, 55],
  [60, 64, 69, 72, 69, 64, 60, 57],
  [57, 55, 52, 55, 59, 62, 59, 55],
];
const LEVEL_PHRASES = [
  [72, 76, 79, 76, 74, 79, 77, 72],
  [67, 72, 76, 74, 71, 74, 72, 67],
  [69, 72, 76, 81, 79, 76, 72, 69],
  [64, 67, 72, 76, 74, 71, 67, 64],
  [76, 79, 84, 79, 76, 74, 72, 76],
  [72, 71, 69, 67, 69, 72, 76, 72],
];
const SUN_PHRASES = [
  [76, 79, 84, 88, 84, 79, 76, 72],
  [74, 77, 81, 86, 83, 79, 74, 72],
  [79, 83, 88, 91, 88, 84, 79, 76],
  [72, 76, 79, 84, 81, 77, 74, 72],
  [81, 84, 88, 93, 88, 84, 81, 79],
];
const HYMN_PHRASES = [
  [67, 71, 74, 79, 74, 71, 67, 64],
  [64, 67, 71, 74, 72, 69, 67, 64],
  [69, 72, 76, 79, 76, 72, 69, 65],
  [62, 65, 69, 74, 71, 67, 65, 62],
];
const SAD_PHRASES = [
  [64, 62, 60, 57, 55, 52, 50, 0],
  [60, 57, 55, 52, 50, 48, 47, 0],
  [67, 64, 62, 59, 55, 52, 48, 0],
  [62, 60, 57, 55, 52, 50, 47, 48],
];
const RUSH_PHRASES = [
  [79, 84, 88, 84, 81, 88, 86, 79, 84, 88, 91, 88],
  [76, 81, 84, 88, 84, 81, 79, 76, 81, 84, 88, 84],
];

function musicNote(midi: number, dur: number, peak: number, type: OscillatorType = "square") {
  if (!midi) return;
  const g = graph;
  if (!g || muted || g.ctx.state === "closed") return;
  try {
    const osc = g.ctx.createOscillator();
    const gain = g.ctx.createGain();
    osc.type = type;
    osc.frequency.value = 440 * 2 ** ((midi - 69) / 12);
    const t = g.ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain);
    gain.connect(g.sfx);
    osc.start(t);
    osc.stop(t + dur + 0.02);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  } catch {
    /* a dropped note must not stop the song */
  }
}

function musicTick() {
  const phrases =
    musicKind === "menu"
      ? MENU_PHRASES
      : musicKind === "sad"
        ? SAD_PHRASES
        : musicRush
          ? RUSH_PHRASES
        : musicKind === "hymn"
          ? HYMN_PHRASES
          : musicKind === "sun"
            ? SUN_PHRASES
            : LEVEL_PHRASES;
  const width = phrases[0]?.length ?? 8;
  const phrase = phrases[Math.floor(musicStep / width) % phrases.length] ?? [];
  const note = phrase[musicStep % width] ?? 0;
  const tempo = musicKind === "menu" ? 300 : musicKind === "sad" ? 460 : musicRush ? 92 : musicKind === "hymn" ? 190 : musicKind === "sun" ? 146 : 168;
  const dur = musicKind === "menu" ? 0.24 : musicKind === "sad" ? 0.38 : musicRush ? 0.07 : musicKind === "sun" ? 0.12 : 0.13;
  const peak = musicKind === "menu" ? 0.045 : musicKind === "sad" ? 0.04 : musicRush ? 0.05 : 0.042;
  const voice = musicKind === "level" ? "square" : "triangle";
  musicNote(note, dur, peak, voice);
  if (musicKind === "level" || musicKind === "sun" || musicKind === "hymn") {
    const bass = (note || 72) - (musicRush ? 12 : 24);
    if (musicStep % (musicRush ? 2 : 4) === 0) musicNote(bass, dur, 0.03, "square");
  }
  if (musicKind === "menu" && musicStep % 8 === 0) musicNote((note || 57) - 12, 0.3, 0.028, "square");
  musicStep += 1;
  musicTimer = window.setTimeout(musicTick, tempo);
}

function startMusic(kind: MusicKind, restart = false) {
  unlockAudio();
  if (musicKind === kind && !restart) return;
  stopMusic();
  musicKind = kind;
  musicRush = false;
  musicStep = 0;
  musicTick();
}

export function startMenuMusic() {
  startMusic("menu");
  stopCrowd();
}

export function startLevelMusic(level: 1 | 2 | 3 = 1) {
  startMusic(level === 3 ? "hymn" : level === 2 ? "sun" : "level", true);
  if (level === 3) startCrowd();
  else stopCrowd();
}

export function playSadMusic() {
  stopCrowd();
  startMusic("sad", true);
}

export function setMusicRush(on: boolean) {
  if ((musicKind !== "level" && musicKind !== "sun" && musicKind !== "hymn") || musicRush === on) return;
  musicRush = on;
  window.clearTimeout(musicTimer);
  musicTick();
}

export function stopMusic() {
  window.clearTimeout(musicTimer);
  musicTimer = 0;
  musicKind = null;
  musicRush = false;
}

export function playVictory() {
  stopCrowd();
  stopMusic();
  const line = [
    [67, 71, 74],
    [67, 71, 74],
    [69, 72, 76],
    [71, 74, 79],
    [74, 78, 83],
    [74, 78, 83],
    [72, 76, 81],
    [71, 74, 79],
    [69, 74, 79],
    [67, 71, 74],
    [72, 79, 84],
    [76, 84, 91],
  ];
  line.forEach((chord, i) => {
    window.setTimeout(() => {
      const last = i === line.length - 1;
      chord.forEach((note, voice) => {
        musicNote(note, last ? 0.85 : 0.2, voice === 0 ? 0.07 : 0.04, voice === 0 ? "square" : "triangle");
      });
      if (i % 2 === 0) musicNote((chord[0] ?? 67) - 12, last ? 0.7 : 0.16, 0.035, "square");
    }, i * 180);
  });
}

export function playCigar() {
  noise(0.18, 0.12, 1800);
  tone(520, 0.22, "sawtooth", 0.06, 180);
  window.setTimeout(() => noise(0.35, 0.05, 900), 160);
}

let waterGain: GainNode | null = null;
let waterLfo: OscillatorNode | null = null;
let waterStopTimer = 0;

export function startWater() {
  try {
    const g = graph;
    if (!g || muted || g.ctx.state === "closed" || rainOn) return;
    const seconds = 2;
    const buffer = g.ctx.createBuffer(1, g.ctx.sampleRate * seconds, g.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = g.ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const filter = g.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 700;
    filter.Q.value = 0.6;
    const lfo = g.ctx.createOscillator();
    lfo.frequency.value = 0.18;
    const lfoGain = g.ctx.createGain();
    lfoGain.gain.value = 380;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    const gain = g.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, g.ctx.currentTime);
    gain.gain.setTargetAtTime(0.03, g.ctx.currentTime, 1.1);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(g.master);
    src.start();
    lfo.start();
    g.rain = src;
    waterGain = gain;
    waterLfo = lfo;
    rainOn = true;
  } catch {
    rainOn = false;
  }
}

export function fadeWater() {
  const g = graph;
  window.clearTimeout(waterStopTimer);
  if (waterGain && g) {
    try {
      waterGain.gain.cancelScheduledValues(g.ctx.currentTime);
      waterGain.gain.setTargetAtTime(0.0001, g.ctx.currentTime, 0.35);
    } catch {
      /* already fading */
    }
  }
  waterStopTimer = window.setTimeout(() => stopRain(), 1600);
}

export function audioContextState(): AudioContextState | "none" {
  return ctxNow()?.state ?? "none";
}

let crowdOn = false;
let crowdNear = false;
let crowdTimer = 0;
let crowdGain: GainNode | null = null;
let crowdSrc: AudioBufferSourceNode | null = null;
let crowdLfo: OscillatorNode | null = null;

function terrace(loud: boolean) {
  const peak = loud ? 0.045 : 0.02;
  [0, 150, 300, 520].forEach((at, i) => {
    window.setTimeout(() => {
      const freq = i === 3 ? 262 : 196;
      tone(freq, 0.18, "triangle", peak);
      tone(freq * 1.25, 0.16, "square", peak * 0.35);
      noise(0.04, loud ? 0.05 : 0.02, 1600);
    }, at);
  });
}

function crowdTick() {
  if (!crowdOn) return;
  if (crowdNear) terrace(true);
  else if (Math.random() < 0.55) tone(170 + Math.random() * 50, 0.22, "triangle", 0.018);
  crowdTimer = window.setTimeout(crowdTick, crowdNear ? 2100 : 1700);
}

export function startCrowd() {
  try {
    unlockAudio();
    const g = graph;
    if (!g || muted || g.ctx.state === "closed" || crowdOn) return;
    const seconds = 2;
    const buffer = g.ctx.createBuffer(1, g.ctx.sampleRate * seconds, g.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = g.ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const filter = g.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 480;
    filter.Q.value = 0.45;
    const lfo = g.ctx.createOscillator();
    lfo.frequency.value = 0.35;
    const lfoGain = g.ctx.createGain();
    lfoGain.gain.value = 90;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    const gain = g.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, g.ctx.currentTime);
    gain.gain.setTargetAtTime(0.02, g.ctx.currentTime, 0.8);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(g.sfx);
    src.start();
    lfo.start();
    crowdSrc = src;
    crowdGain = gain;
    crowdLfo = lfo;
    crowdOn = true;
    crowdNear = false;
    crowdTick();
  } catch {
    crowdOn = false;
  }
}

export function setCrowdNear(on: boolean) {
  if (!crowdOn) startCrowd();
  crowdNear = on;
  const g = graph;
  if (!crowdGain || !g) return;
  crowdGain.gain.setTargetAtTime(on ? 0.055 : 0.02, g.ctx.currentTime, 0.15);
  if (on) terrace(true);
}

export function playCrowdCheer() {
  noise(0.45, 0.07, 700);
  [262, 330, 392, 523].forEach((freq, i) => tone(freq, 0.55, i % 2 ? "triangle" : "square", 0.04));
  window.setTimeout(() => noise(0.3, 0.04, 1200), 120);
}

export function playCrowdMiss() {
  tone(311, 0.28, "sawtooth", 0.04, 140);
  noise(0.2, 0.03, 500);
}

export function stopCrowd() {
  window.clearTimeout(crowdTimer);
  crowdTimer = 0;
  crowdOn = false;
  crowdNear = false;
  const g = graph;
  if (crowdGain && g) {
    try {
      crowdGain.gain.cancelScheduledValues(g.ctx.currentTime);
      crowdGain.gain.setTargetAtTime(0.0001, g.ctx.currentTime, 0.2);
    } catch {
      /* already fading */
    }
  }
  const src = crowdSrc;
  const lfo = crowdLfo;
  crowdSrc = null;
  crowdGain = null;
  crowdLfo = null;
  window.setTimeout(() => {
    try {
      src?.stop();
    } catch {
      /* already stopped */
    }
    try {
      lfo?.stop();
    } catch {
      /* already stopped */
    }
  }, 600);
}
