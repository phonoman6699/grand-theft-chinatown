import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Lock, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import {
  isMuted,
  playBark,
  playBuff,
  playGulp,
  playJump,
  playLand,
  playSadMusic,
  playSplash,
  playSplat,
  playStep,
  playCigar,
  playVictory,
  resumeAudio,
  setMuted,
  fadeWater,
  startLevelMusic,
  startMenuMusic,
  startWater,
  setMusicRush,
  setCrowdNear,
  playCrowdCheer,
  playCrowdMiss,
  stopMusic,
  stopRain,
  unlockAudio,
} from "@/game/audio";
import { drawWorld, type Art } from "@/game/render";
import { BEST_KEY, FINISH_X, GROUND, VIEW_H, VIEW_W, answerQuiz, createSim, metersOf, step, type Sim } from "@/game/sim";
import run1 from "@/assets/sprites/run-1.png";
import run2 from "@/assets/sprites/run-2.png";
import run3 from "@/assets/sprites/run-3.png";
import run4 from "@/assets/sprites/run-4.png";
import jump1 from "@/assets/sprites/jump-1.png";
import jump2 from "@/assets/sprites/jump-2.png";
import jump3 from "@/assets/sprites/jump-3.png";
import jump4 from "@/assets/sprites/jump-4.png";
import pizzoPortrait from "@/assets/sprites/pizzo-portrait.png";
import ioaPortrait from "@/assets/sprites/ioa-portrait.png";
import capitanoPortrait from "@/assets/sprites/capitano-portrait.png";
import cigarSrc from "@/assets/sprites/pizzo-cigar.png";
import finale1 from "@/assets/sprites/finale-1.png";
import finale2 from "@/assets/sprites/finale-2.png";
import finale3 from "@/assets/sprites/finale-3.png";
import finale4 from "@/assets/sprites/finale-4.png";
import finale5 from "@/assets/sprites/finale-5.png";
import finale6 from "@/assets/sprites/finale-6.png";
import finale7 from "@/assets/sprites/finale-7.png";
import finale8 from "@/assets/sprites/finale-8.png";
import logo from "@/assets/chinatown-logo.png";
import drinkSrc from "@/assets/sprites/pizzo-drink.png";
import buffRun1 from "@/assets/sprites/buff-run-1.png";
import buffRun2 from "@/assets/sprites/buff-run-2.png";
import buffRun3 from "@/assets/sprites/buff-run-3.png";
import buffRun4 from "@/assets/sprites/buff-run-4.png";
import buffJump1 from "@/assets/sprites/buff-jump-1.png";
import buffJump2 from "@/assets/sprites/buff-jump-2.png";
import buffJump3 from "@/assets/sprites/buff-jump-3.png";
import buffJump4 from "@/assets/sprites/buff-jump-4.png";
import basilicaSrc from "@/assets/sprites/basilica.png";
import fountainSrc from "@/assets/sprites/fountain.png";
import cannelleSrc from "@/assets/sprites/cannelle.png";
import dogSrc from "@/assets/sprites/dog.png";
import liberamiaSrc from "@/assets/sprites/liberamia.png";
import cormorantSrc from "@/assets/sprites/cormorant.png";
import gallerySrc from "@/assets/sprites/gallery.png";
import poopSrc from "@/assets/sprites/poop-bird.png";
import captainSrc from "@/assets/sprites/captain.png";
import captainRunSrc from "@/assets/sprites/captain-run.png";
import captainRun2Src from "@/assets/sprites/captain-run-2.png";
import captainCallSrc from "@/assets/sprites/captain-call.png";
import captainThrowSrc from "@/assets/sprites/captain-throw.png";
import negroniSrc from "@/assets/sprites/negroni.png";
import treePlaneSrc from "@/assets/sprites/tree-plane.png";
import treeLindenSrc from "@/assets/sprites/tree-linden.png";
import treeChestnutSrc from "@/assets/sprites/tree-chestnut.png";
import treeCypressSrc from "@/assets/sprites/tree-cypress.png";
import treePineSrc from "@/assets/sprites/tree-pine.png";
import treePoplarSrc from "@/assets/sprites/tree-poplar.png";
import fanNSrc from "@/assets/sprites/crowd-1.png";
import fanWomanSrc from "@/assets/sprites/crowd-2.png";
import fanKidSrc from "@/assets/sprites/crowd-3.png";
import fanBearerSrc from "@/assets/sprites/crowd-4.png";
import castleSrc from "@/assets/sprites/castle.png";

const RUN_SRC = [run1, run2, run3, run4];
const JUMP_SRC = [jump1, jump2, jump3, jump4];
const BUFF_RUN_SRC = [buffRun1, buffRun2, buffRun3, buffRun4];
const BUFF_JUMP_SRC = [buffJump1, buffJump2, buffJump3, buffJump4];
const FINALE_SRC = [finale1, finale2, finale3, finale4, finale5, finale6, finale7, finale8];
const LANDMARK_SRC = [basilicaSrc, fountainSrc, cannelleSrc, dogSrc, liberamiaSrc, cormorantSrc, gallerySrc, poopSrc, captainSrc, negroniSrc, captainThrowSrc, captainRunSrc, captainRun2Src, captainCallSrc];
const TREE_SRC = [treePlaneSrc, treeLindenSrc, treeChestnutSrc, treeCypressSrc, treePineSrc, treePoplarSrc];
const FAN_SRC = [fanNSrc, fanWomanSrc, fanKidSrc, fanBearerSrc];
const STEP = 1 / 60;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(src));
    img.src = src;
  });
}

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY) || 0) || 0;
  } catch {
    return 0;
  }
}

function writeBest(n: number) {
  try {
    localStorage.setItem(BEST_KEY, String(n));
  } catch {
    /* private mode */
  }
}

export function GrandTheftPizzo() {
  const [screen, setScreen] = useState<"select" | "run">("select");
  const [startLevel, setStartLevel] = useState<1 | 2 | 3>(1);
  const [tester, setTester] = useState(false);
  const [ready, setReady] = useState(false);
  const [muted, setMutedUi] = useState(false);
  const [best, setBest] = useState(0);
  const art = useRef<Art>({
    run: [],
    jump: [],
    cigar: null,
    finale: [],
    buffRun: [],
    buffJump: [],
    drink: null,
    basilica: null,
    fountain: null,
    cannelle: null,
    dog: null,
    liberamia: null,
    cormorant: null,
    gallery: null,
    poop: null,
    captain: null,
    captainRun: null,
    captainRun2: null,
    captainCall: null,
    captainThrow: null,
    negroni: null,
    trees: [],
    fans: [],
    napoliFlag: null,
    castle: null,
  });

  useEffect(() => {
    setBest(readBest());
    let cancel = false;
    Promise.all(
      [...RUN_SRC, ...JUMP_SRC, cigarSrc, ...BUFF_RUN_SRC, ...BUFF_JUMP_SRC, drinkSrc, ...FINALE_SRC, ...LANDMARK_SRC, ...TREE_SRC, ...FAN_SRC, castleSrc].map(loadImage),
    )
      .then((imgs) => {
        if (cancel) return;
        art.current = {
          run: imgs.slice(0, 4),
          jump: imgs.slice(4, 8),
          cigar: imgs[8] ?? null,
          buffRun: imgs.slice(9, 13),
          buffJump: imgs.slice(13, 17),
          drink: imgs[17] ?? null,
          finale: imgs.slice(18, 26),
          basilica: imgs[26] ?? null,
          fountain: imgs[27] ?? null,
          cannelle: imgs[28] ?? null,
          dog: imgs[29] ?? null,
          liberamia: imgs[30] ?? null,
          cormorant: imgs[31] ?? null,
          gallery: imgs[32] ?? null,
          poop: imgs[33] ?? null,
          captain: imgs[34] ?? null,
          negroni: imgs[35] ?? null,
          captainThrow: imgs[36] ?? null,
          captainRun: imgs[37] ?? null,
          captainRun2: imgs[38] ?? null,
          captainCall: imgs[39] ?? null,
          trees: imgs.slice(40, 46),
          fans: imgs.slice(46, 50),
          napoliFlag: null,
          castle: imgs[50] ?? null,
        };
        setReady(true);
      })
      .catch(() => setReady(false));
    const onVis = () => {
      if (document.visibilityState === "visible") resumeAudio();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancel = true;
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  useEffect(() => {
    if (screen !== "select") return;
    const kick = () => startMenuMusic();
    window.addEventListener("pointerdown", kick);
    return () => window.removeEventListener("pointerdown", kick);
  }, [screen]);

  function toggleMute() {
    const next = !isMuted();
    setMuted(next);
    setMutedUi(next);
  }

  return screen === "select" ? (
    <SelectScreen
      best={best}
      ready={ready}
      muted={muted}
      onMute={toggleMute}
      onPlay={(level) => {
        unlockAudio();
        setStartLevel(level);
        setScreen("run");
      }}
      tester={tester}
      onTester={() => setTester(true)}
    />
  ) : (
    <Runner
      art={art.current}
      best={best}
      muted={muted}
      startLevel={startLevel}
      onMute={toggleMute}
      onBest={(n) => {
        setBest(n);
        writeBest(n);
      }}
      onExit={() => {
        setScreen("select");
        startMenuMusic();
      }}
    />
  );
}

function SelectScreen({
  best,
  ready,
  muted,
  onMute,
  onPlay,
  tester,
  onTester,
}: {
  best: number;
  ready: boolean;
  muted: boolean;
  onMute: () => void;
  onPlay: (level: 1 | 2 | 3) => void;
  tester: boolean;
  onTester: () => void;
}) {
  const [askPin, setAskPin] = useState(false);
  const [pin, setPin] = useState("");
  const [pinBad, setPinBad] = useState(false);

  function submitPin(event: FormEvent) {
    event.preventDefault();
    if (pin === "3483") {
      onTester();
      setAskPin(false);
      setPin("");
      setPinBad(false);
      return;
    }
    setPinBad(true);
  }

  return (
    <main className="min-h-dvh bg-[#090b0e]">
      <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-8">
        <header className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 h-1 w-14 bg-[#f2c14e]" />
            <div className="flex items-center gap-4 sm:gap-6">
              <h1 className="font-display text-[clamp(3.4rem,9vw,7.2rem)] leading-[0.8] tracking-wide text-fg">
                GRAND
                <br />
                THEFT
                <br />
                CHINATOWN
              </h1>
              <button
                type="button"
                className="shrink-0"
                onClick={() => {
                  setAskPin(true);
                  setPin("");
                  setPinBad(false);
                }}
                aria-label="PIN tester"
              >
                <img src={logo} alt="" className="size-24 sm:size-36" />
              </button>
            </div>
            {tester ? <p className="mt-3 text-xs tracking-[0.2em] text-[#f2c14e] uppercase">Tester</p> : null}
          </div>
          <button
            type="button"
            className="menu-pick inline-flex size-11 items-center justify-center rounded-md border border-line bg-surface text-fg"
            onClick={onMute}
            aria-label={muted ? "Attiva suono" : "Disattiva suono"}
            aria-pressed={muted}
          >
            {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
          </button>
        </header>

        {askPin && !tester ? (
          <form
            onSubmit={submitPin}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          >
            <div className="w-full max-w-xs rounded-md border border-[#f2c14e]/70 bg-[#090b0e] p-5">
              <p className="font-display text-3xl tracking-wide">PIN</p>
              <input
                value={pin}
                onChange={(event) => {
                  setPin(event.target.value.replace(/\D/g, "").slice(0, 4));
                  setPinBad(false);
                }}
                inputMode="numeric"
                autoComplete="off"
                autoFocus
                aria-label="PIN"
                className="mt-4 h-12 w-full rounded-md border border-line bg-black px-3 text-center text-xl tracking-[0.4em] text-fg outline-none"
              />
              {pinBad ? <p className="mt-2 text-sm text-[#f2c14e]">No</p> : null}
              <div className="mt-4 flex gap-2">
                <button type="submit" className="menu-pick h-11 flex-1 rounded-md bg-[#f2c14e] text-sm font-medium text-black">
                  Entra
                </button>
                <button
                  type="button"
                  className="menu-pick h-11 rounded-md border border-line px-4 text-sm"
                  onClick={() => setAskPin(false)}
                >
                  Chiudi
                </button>
              </div>
            </div>
          </form>
        ) : null}

        <section className="grid gap-3 sm:grid-cols-3" aria-label="Personaggi">
          <article className="flex flex-col overflow-hidden rounded-md border border-[#f2c14e]/70 bg-black">
            <div className="overflow-hidden bg-raised">
              <img src={pizzoPortrait} alt="Pizzo" className="aspect-[3/4] w-full object-cover object-top" />
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h2 className="font-display text-4xl tracking-wide">Pizzo</h2>
              <div className="mt-3 text-xs tracking-[0.14em] text-fg uppercase">
                <p className="text-subtle">Keys</p>
                <p className="mt-1">Spacebar or W — Jump</p>
                <p>Special move — Q</p>
              </div>
              {tester ? (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {([1, 2, 3] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      className="menu-pick inline-flex min-h-11 items-center justify-center rounded-md bg-[#f2c14e] px-2 text-sm font-medium text-black disabled:opacity-40"
                      onClick={() => onPlay(level)}
                      disabled={!ready}
                    >
                      Liv. {level}
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  type="button"
                  className="menu-pick mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#f2c14e] px-4 text-sm font-medium text-black disabled:opacity-40"
                  onClick={() => onPlay(1)}
                  disabled={!ready}
                >
                  <Play className="size-4" aria-hidden />
                  {ready ? "Gioca" : "Carico"}
                </button>
              )}
            </div>
          </article>

          <article className="flex flex-col overflow-hidden rounded-md border border-white/10 bg-black" aria-disabled="true">
            <div className="relative overflow-hidden bg-raised">
              <img src={ioaPortrait} alt="Ioa" className="aspect-[3/4] w-full object-cover object-top" />
              <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-sm bg-black/75 px-2 py-1 text-xs tracking-wider text-fg uppercase">
                <Lock className="size-3.5" aria-hidden />
                Bloccato
              </span>
            </div>
            <div className="p-4">
              <h2 className="font-display text-4xl tracking-wide text-muted">Ioa</h2>
            </div>
          </article>

          <article className="flex flex-col overflow-hidden rounded-md border border-white/10 bg-black" aria-disabled="true">
            <div className="relative overflow-hidden bg-raised">
              <img src={capitanoPortrait} alt="Capitano" className="aspect-[3/4] w-full object-cover object-top" />
              <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-sm bg-black/75 px-2 py-1 text-xs tracking-wider text-fg uppercase">
                <Lock className="size-3.5" aria-hidden />
                Bloccato
              </span>
            </div>
            <div className="p-4">
              <h2 className="font-display text-4xl tracking-wide text-muted">Capitano</h2>
            </div>
          </article>
        </section>

        <p className="text-xs tracking-[0.16em] text-subtle uppercase">Record {best} metri</p>
      </div>
    </main>
  );
}

function Runner({
  art,
  best,
  muted,
  onMute,
  onBest,
  onExit,
  startLevel,
}: {
  art: Art;
  best: number;
  muted: boolean;
  onMute: () => void;
  onBest: (n: number) => void;
  onExit: () => void;
  startLevel: 1 | 2 | 3;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const metersRef = useRef<HTMLSpanElement>(null);
  const simRef = useRef<Sim>(createSim(Date.now() % 99991 || 1, startLevel));
  const dashRef = useRef(0);
  const heldRef = useRef(false);
  const edgeRef = useRef(false);
  const creatineRef = useRef(false);
  const pausedRef = useRef(false);
  const shakeRef = useRef(
    typeof window === "undefined" || !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const introRef = useRef(true);
  const [paused, setPaused] = useState(false);
  const [ending, setEnding] = useState<"wet" | "dog" | "poop" | "cigar" | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const [shake, setShake] = useState(shakeRef.current);
  const [showHint, setShowHint] = useState(true);
  const [pumped, setPumped] = useState(false);
  const [intro, setIntro] = useState(true);
  const [quiz, setQuiz] = useState<number | null>(null);
  const [card, setCard] = useState<{ who: string; prompt: string } | null>(null);
  const [miss, setMiss] = useState<number[]>([]);
  const [options, setOptions] = useState<{ line: string; pick: number }[]>([]);
  const quizShown = useRef<number | null>(null);
  const optionsRef = useRef<{ line: string; pick: number }[]>([]);
  const chooseRef = useRef<(shown: number) => void>(() => {});
  const [level, setLevel] = useState<1 | 2 | 3>(startLevel);
  const bestRef = useRef(best);
  const onBestRef = useRef(onBest);
  bestRef.current = best;
  onBestRef.current = onBest;

  useEffect(() => {
    startLevelMusic(startLevel);
    if (startLevel === 1) startWater();
    return () => stopRain();
  }, []);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    introRef.current = intro;
  }, [intro]);

  useEffect(() => {
    shakeRef.current = shake;
  }, [shake]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let acc = 0;
    let last = performance.now();
    let reported = false;
    let prevGround = true;
    let prevFrame = 0;
    let prevPump: Sim["pump"] = "off";
    let prevSip = 0;
    let prevLit = false;
    let active = simRef.current;

    const fit = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const width = Math.max(1, Math.floor(rect.width * dpr));
      const height = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#14181c";
      ctx.fillRect(0, 0, rect.width, rect.height);
      const scale = Math.min(rect.width / VIEW_W, rect.height / VIEW_H);
      ctx.translate((rect.width - VIEW_W * scale) / 2, (rect.height - VIEW_H * scale) / 2);
      ctx.scale(scale, scale);
    };

    const loop = (now: number) => {
      try {
      const sim = simRef.current;
      if (sim !== active) {
        active = sim;
        reported = false;
        prevGround = true;
        prevFrame = 0;
        prevPump = "off";
        prevSip = 0;
        prevLit = false;
        acc = 0;
      }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!pausedRef.current && !introRef.current && sim.alive) {
        if (sim.won) {
          step(sim, dt, { pressed: false, held: false });
        } else {
          acc += dt;
          const creatine = creatineRef.current && sim.pump === "off";
          const vy0 = sim.vy;
          let steps = 0;
          while (acc >= STEP && steps < 5) {
            const pressed = edgeRef.current;
            const dash = dashRef.current;
            step(sim, STEP, {
              pressed,
              held: heldRef.current,
              creatine,
              dash,
            });
            if (pressed) edgeRef.current = false;
            if (dash) dashRef.current = 0;
            acc -= STEP;
            steps += 1;
          }
          if (acc > STEP) acc = 0;
          if (sim.vy < -400 && vy0 > -80) {
            playJump();
            setShowHint(false);
          }
          if (!prevGround && sim.grounded && sim.alive) playLand();
          const frame = Math.floor(sim.runTime * 9);
          if (sim.grounded && sim.alive && !sim.won && frame !== prevFrame) playStep();
          prevFrame = frame;
          prevGround = sim.grounded;
          if (sim.sip > prevSip) playGulp();
          prevSip = sim.sip;
          if (prevPump === "off" && sim.pump === "drink") {
            playGulp();
            setPumped(true);
          }
          if (prevPump !== "on" && sim.pump === "on") {
            playBuff();
            setMusicRush(true);
            setPumped(true);
          }
          if (prevPump === "on" && sim.pump !== "on") setMusicRush(false);
          prevPump = sim.pump;
          if (sim.pump !== "off") creatineRef.current = false;
          for (const dog of sim.dogs) {
            if (!dog.barked && dog.x < sim.x + 460 && dog.x > sim.x - 20) {
              dog.barked = true;
              playBark();
            }
          }
        }
        if (!prevLit && sim.lit) playCigar();
        prevLit = sim.lit;
        if (!sim.alive && !reported) {
          reported = true;
          if (sim.death === "dog") playBark();
          else if (sim.death === "poop") playSplat();
          else playSplash();
          playSadMusic();
          fadeWater();
          const m = metersOf(sim);
          if (m > bestRef.current) onBestRef.current(m);
          setOver(m);
          setEnding(sim.death === "dog" ? "dog" : sim.death === "poop" ? "poop" : "wet");
        }
        if (sim.won && !reported) {
          reported = true;
          playVictory();
          fadeWater();
          setMusicRush(false);
          const finished = sim;
          window.setTimeout(() => {
            if (simRef.current !== finished) return;
            const m = metersOf(finished);
            if (m > bestRef.current) onBestRef.current(m);
            setOver(m);
            setEnding("cigar");
          }, 5200);
        }
      }
      if (metersRef.current) metersRef.current.textContent = String(metersOf(sim));
      if (sim.quiz !== quizShown.current) {
        const was = quizShown.current;
        quizShown.current = sim.quiz;
        if (sim.level === 3) {
          if (sim.quiz !== null) setCrowdNear(true);
          else if (was !== null) {
            setCrowdNear(false);
            playCrowdCheer();
          }
        }
        setQuiz(sim.quiz);
        setMiss([]);
        const choir = sim.choirs.find((item) => item.id === sim.quiz);
        const song = choir?.riddle ?? null;
        setCard(song ? { who: song.who, prompt: song.prompt } : null);
        const bag = song ? song.choices.map((line, pick) => ({ line, pick })) : [];
        for (let i = bag.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const swap = bag[i];
          bag[i] = bag[j];
          bag[j] = swap;
        }
        optionsRef.current = bag;
        setOptions(bag);
      }
      fit();
      drawWorld(ctx, sim, art, shakeRef.current);
      } catch (err) {
        console.error(err);
      }
      raf = requestAnimationFrame(loop);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (introRef.current) {
        if (e.key === "." || e.code === "Period" || e.code === "NumpadDecimal") {
          e.preventDefault();
          introRef.current = false;
          setIntro(false);
        }
        return;
      }
      if (simRef.current.quiz !== null && /^[123]$/.test(e.key)) {
        e.preventDefault();
        chooseRef.current(Number(e.key) - 1);
        return;
      }
      if (e.code === "ArrowLeft" || e.code === "ArrowRight") {
        e.preventDefault();
        if (e.repeat) return;
        if (pausedRef.current || !simRef.current.alive || simRef.current.won) return;
        dashRef.current = e.code === "ArrowLeft" ? -1 : 1;
        return;
      }
      if (e.repeat) return;
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        if (pausedRef.current || !simRef.current.alive || simRef.current.won) return;
        edgeRef.current = true;
        heldRef.current = true;
      } else if (e.code === "KeyQ") {
        e.preventDefault();
        const sim = simRef.current;
        if (introRef.current || pausedRef.current || !sim.alive || sim.won || sim.pump !== "off") return;
        creatineRef.current = true;
      } else if (e.code === "Escape") {
        if (simRef.current.alive && !simRef.current.won) setPaused((v) => !v);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") heldRef.current = false;
    };
    const onBlur = () => {
      heldRef.current = false;
    };

    window.__pizzo = {
      getY: () => simRef.current.y,
      grounded: () => simRef.current.grounded,
      alive: () => simRef.current.alive,
      meters: () => metersOf(simRef.current),
      jump: () => {
        edgeRef.current = true;
        heldRef.current = true;
        window.setTimeout(() => {
          heldRef.current = false;
        }, 420);
      },
      forcePuddle: () => {
        const sim = simRef.current;
        sim.puddles.push({ id: 9999, x: sim.x - 20, w: 140 });
      },
      finish: () => {
        const sim = simRef.current;
        sim.x = FINISH_X;
        sim.y = GROUND;
        sim.vy = 0;
        sim.grounded = true;
      },
      won: () => simRef.current.won,
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      delete window.__pizzo;
    };
  }, [art]);

  function hop(down: boolean) {
    if (paused || over !== null || simRef.current.won || intro) return;
    if (down) edgeRef.current = true;
    heldRef.current = down;
  }

  function begin(next: 1 | 2 | 3) {
    setLevel(next);
    simRef.current = createSim(Date.now() % 99991 || 1, next);
    setOver(null);
    setEnding(null);
    setPaused(false);
    setShowHint(true);
    setPumped(false);
    setIntro(true);
    introRef.current = true;
    quizShown.current = null;
    optionsRef.current = [];
    setQuiz(null);
    setCard(null);
    setMiss([]);
    setOptions([]);
    creatineRef.current = false;
    heldRef.current = false;
    dashRef.current = 0;
    stopRain();
    if (next === 1) startWater();
    startLevelMusic(next);
  }

  chooseRef.current = (shown: number) => {
    const option = optionsRef.current[shown];
    if (!option || simRef.current.quiz === null) return;
    if (answerQuiz(simRef.current, option.pick)) return;
    playCrowdMiss();
    setMiss((current) => (current.includes(option.pick) ? current : [...current, option.pick]));
  };

  function retry() {
    begin(level);
  }

  return (
    <main className="flex h-dvh flex-col bg-bg">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="font-display text-lg leading-none tracking-wide sm:text-2xl">GRAND THEFT CHINATOWN</p>
          <p className="text-lg font-medium tabular-nums">
            <span ref={metersRef}>0</span>
            <span className="ml-1 text-sm font-normal text-muted">metri</span>
          </p>
        </div>
        <p className="text-sm text-muted tabular-nums">Record {Math.max(best, over ?? 0)}</p>
        <button
          type="button"
          className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-surface px-3 text-sm font-medium tracking-wide text-fg uppercase disabled:opacity-40"
          onClick={() => {
            creatineRef.current = true;
          }}
          disabled={pumped || over !== null || intro || level === 3}
        >
          Q
        </button>
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-md border border-line bg-surface text-fg"
          onClick={() => simRef.current.alive && !simRef.current.won && setPaused(true)}
          aria-label="Pausa"
        >
          <Pause className="size-5" />
        </button>
      </div>

      <div className="relative min-h-0 flex-1">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full touch-none"
          onPointerDown={(e) => {
            try {
              e.currentTarget.setPointerCapture(e.pointerId);
            } catch {
              /* the pointer can already be gone */
            }
            hop(true);
          }}
          onPointerUp={() => hop(false)}
          onPointerCancel={() => hop(false)}
        />
        {intro ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/55 px-4">
            <div className="w-full max-w-md rounded-md border border-[#f2c14e]/70 bg-[#090b0e] px-6 py-5 text-center">
              <p className="font-display text-4xl tracking-wide text-[#f2c14e] sm:text-5xl">
                {level === 1 ? "LIVELLO 1" : level === 2 ? "LIVELLO 2" : "LIVELLO 3"}
              </p>
              <div className="mt-5 space-y-1 text-sm tracking-wide text-fg uppercase">
                {level === 3 ? (
                  <>
                    <p>Corri e basta</p>
                    <p>Scegli la frase che chiude il ritornello</p>
                  </>
                ) : (
                  <>
                    <p>Barra spazio o W — salto</p>
                    {level === 2 ? (
                      <>
                        <p>Freccia sinistra — scatto indietro</p>
                        <p>Freccia destra — scatto avanti</p>
                        <p className="text-[#f2c14e]">La corsa non si ferma</p>
                      </>
                    ) : null}
                    <p>Q — mossa speciale</p>
                  </>
                )}
              </div>
              <p className="mt-5 text-sm tracking-[0.18em] text-[#f2c14e] uppercase">Premi . per iniziare</p>
            </div>
          </div>
        ) : null}
        {showHint && over === null && !paused && !intro && quiz === null ? (
          <p className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 rounded-md bg-bg/80 px-3 py-2 text-sm text-fg">
            {level === 3
              ? "Quando ti fermano, scegli il ritornello."
              : level === 2
              ? "Frecce — scatto avanti o indietro. Non si può ripetere subito."
              : "Tocca, barra o W — salto. Q — mossa."}
          </p>
        ) : null}
        {quiz !== null && card ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/55 px-4">
            <div className="w-full max-w-lg rounded-md border border-[#1aa3e0] bg-[#090b0e] p-5">
              <p className="text-xs tracking-[0.18em] text-[#1aa3e0] uppercase">{card.who}</p>
              <p className="mt-1 font-display text-3xl tracking-wide text-[#f2c14e]">Scegli la frase</p>
              <p className="mt-2 text-lg">{card.prompt}</p>
              <div className="mt-4 grid gap-2">
                {options.map((option, index) => (
                  <button
                    key={option.line}
                    type="button"
                    className={`menu-pick flex min-h-12 items-center gap-3 rounded-md border px-3 text-left text-sm ${
                      miss.includes(option.pick) ? "border-[#ff6b6b] text-[#ff8f8f]" : "border-line bg-black text-fg"
                    }`}
                    disabled={miss.includes(option.pick)}
                    onClick={() => chooseRef.current(index)}
                  >
                    <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-sm bg-[#1aa3e0] text-sm font-medium text-black">
                      {index + 1}
                    </span>
                    {option.line}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {paused ? (
          <Overlay title="Pausa" text="La strada è ferma.">
            <button type="button" className="btn-primary" onClick={() => setPaused(false)}>
              Continua
            </button>
            <button type="button" className="btn-ghost" onClick={onMute}>
              {muted ? "Suono spento" : "Suono acceso"}
            </button>
            <button type="button" className="btn-ghost" onClick={() => setShake((v) => !v)} aria-pressed={shake}>
              {shake ? "Scossa attiva" : "Scossa spenta"}
            </button>
            <button type="button" className="btn-ghost" onClick={onExit}>
              Personaggi
            </button>
          </Overlay>
        ) : null}

        {(ending === "wet" || ending === "dog" || ending === "poop") && over !== null ? (
          <Overlay
            title={ending === "dog" ? "Cane randagio" : ending === "poop" ? "Cormorano" : "Pozzanghera"}
            text={
              ending === "dog"
                ? `${over} metri. Ti è venuto addosso.`
                : ending === "poop"
                  ? `${over} metri. La cacca ti ha preso.`
                  : `${over} metri. Pizzo è finito in acqua.`
            }
          >
            <button type="button" className="btn-primary" onClick={retry}>
              <RotateCcw className="size-4" aria-hidden />
              Di nuovo
            </button>
            <button type="button" className="btn-ghost" onClick={onExit}>
              Personaggi
            </button>
          </Overlay>
        ) : null}

        {ending === "cigar" && over !== null ? (
          <Overlay
            title={level === 1 ? "Fontana Luminosa" : level === 2 ? "Liberamia" : "Collemaggio"}
            text={`${over} metri.`}
          >
            {level < 3 ? (
              <button type="button" className="btn-primary" onClick={() => begin((level + 1) as 2 | 3)}>
                Livello {level + 1}
              </button>
            ) : (
              <button type="button" className="btn-primary" onClick={retry}>
                <RotateCcw className="size-4" aria-hidden />
                Di nuovo
              </button>
            )}
            {level < 3 ? (
              <button type="button" className="btn-ghost" onClick={retry}>
                Ripeti il livello {level}
              </button>
            ) : null}
            <button type="button" className="btn-ghost" onClick={onExit}>
              Personaggi
            </button>
          </Overlay>
        ) : null}
      </div>
    </main>
  );
}

function Overlay({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-bg/70 p-4">
      <div className="rise w-full max-w-sm rounded-xl border border-line bg-surface p-5 shadow-lg">
        <h2 className="font-display text-3xl font-medium tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-muted">{text}</p>
        <div className="mt-5 flex flex-col gap-2">{children}</div>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    __pizzo?: {
      getY: () => number;
      grounded: () => boolean;
      alive: () => boolean;
      meters: () => number;
      jump: () => void;
      forcePuddle: () => void;
      finish: () => void;
      won: () => boolean;
    };
  }
}
