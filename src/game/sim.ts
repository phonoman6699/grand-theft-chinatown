export const VIEW_W = 960;
export const VIEW_H = 540;
export const GROUND = 438;
export const BEST_KEY = "grand-theft-pizzo-best";
export const LEVEL_METERS = 200;
export const FINISH_X = 200 + LEVEL_METERS * 52;
export const DECK = 112;

const GRAVITY = 2500;
const JUMP_V = -860;
const BUFF_JUMP = -1180;
const AIR_CLEAR = 0.58;
const DRINK_TIME = 0.7;
const BUFF_TIME = 8;

export type Puddle = { id: number; x: number; w: number };

export type Dog = {
  id: number;
  x: number;
  vx: number;
  w: number;
  phase: number;
  barked: boolean;
};

export type Platform = { id: number; x: number; w: number };

export type Poop = {
  id: number;
  x: number;
  y: number;
  vy: number;
  state: "fall" | "roof" | "stain";
  life: number;
};

export type Gallery = { id: number; x: number; w: number };

export type Bird = {
  id: number;
  x: number;
  y: number;
  stopX: number;
  vx: number;
  dropped: boolean;
  hold: number;
  fly: number;
  live: boolean;
  salvo: number;
  pause: number;
  approach: number;
};

export type Captain = {
  id: number;
  x: number;
  phase: "wait" | "arrive" | "call" | "throw" | "leave" | "gone";
  t: number;
  nextAt: number;
};

export type Glass = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
};

export type Choir = {
  id: number;
  x: number;
  song: number;
  done: boolean;
  riddle: { who: string; prompt: string; choices: string[]; answer: number };
};

const WHO = ["I tifosi", "La famiglia azzurra", "I ragazzi del corso", "Il comitato"];

const RIDDLES: { prompt: string; answer: string }[] = [
  { prompt: "’O sole, ’o sole mio…", answer: "sta ’nfronte a te" },
  { prompt: "Jammo, jammo, ’ncoppa jammo ja’…", answer: "funiculì, funiculà" },
  { prompt: "Venite all’agile barchetta mia…", answer: "Santa Lucia, Santa Lucia" },
  { prompt: "Vide ’o mare quant’è bello…", answer: "torna a Surriento" },
  { prompt: "Oi vita, oi vita mia…", answer: "oi core ’e chistu core" },
  { prompt: "Catarì, Catarì, pecché me dice…", answer: "sti parole amare" },
  { prompt: "Dicitencello vuje…", answer: "a n’ata femmena" },
  { prompt: "Quando sponta la luna a Marechiaro…", answer: "pure ’e stelle se ne vanno" },
  { prompt: "Te voglio bene assaje…", answer: "e tu nun pienze a me" },
  { prompt: "Io so’ nnammurato ’e Maria…", answer: "Maria Marì" },
  { prompt: "Si’ comm’a na vucchella…", answer: "è na cianciosa" },
  { prompt: "Era de maggio e te cadevano…", answer: "’e rose a migliare" },
  { prompt: "Voce ’e notte…", answer: "che vene da ’o mare" },
  { prompt: "Fenesta ca lucive e mo’ nun luce…", answer: "chi è morto, chi è morto" },
  { prompt: "Oi marenare’, vaie truvanno…", answer: "lu vento" },
  { prompt: "Comme facette mammeta…", answer: "ca ’mme facette a me" },
  { prompt: "Sul mare luccica…", answer: "l’astro d’argento" },
  { prompt: "Tu ca nun chiagne…", answer: "e rire me faje murì" },
  { prompt: "I’ te vurria vasà…", answer: "comme se vasa a sì" },
  { prompt: "E quante ne vedette, ’e…", answer: "lacreme napulitane" },
];

function dealRiddles(sim: Sim) {
  const order = RIDDLES.map((_, index) => index);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand(sim) * (i + 1));
    const swap = order[i];
    order[i] = order[j];
    order[j] = swap;
  }
  const picked = order.slice(0, 4);
  const spare = order
    .slice(4)
    .map((index) => RIDDLES[index].answer)
    .filter((line, index, all) => all.indexOf(line) === index);
  return picked.map((index, slot) => {
    const right = RIDDLES[index].answer;
    const wrongs = [spare.pop() ?? "jammo ja’", spare.pop() ?? "oi sole mio"].filter((line) => line !== right);
    const choices = [right, wrongs[0], wrongs[1]];
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(rand(sim) * (i + 1));
      const swap = choices[i];
      choices[i] = choices[j];
      choices[j] = swap;
    }
    return {
      who: WHO[slot] ?? WHO[0],
      prompt: RIDDLES[index].prompt,
      choices,
      answer: choices.indexOf(right),
    };
  });
}

export type Drop = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  r: number;
};

export type Sim = {
  x: number;
  y: number;
  vy: number;
  grounded: boolean;
  coyote: number;
  buffer: number;
  cut: boolean;
  alive: boolean;
  freeze: number;
  time: number;
  runTime: number;
  airTime: number;
  dist: number;
  speed: number;
  squash: number;
  trauma: number;
  puddles: Puddle[];
  dogs: Dog[];
  platforms: Platform[];
  galleries: Gallery[];
  poops: Poop[];
  birds: Bird[];
  captains: Captain[];
  choirs: Choir[];
  quiz: number | null;
  glasses: Glass[];
  cursor: number;
  nextId: number;
  drops: Drop[];
  seed: number;
  won: boolean;
  wonAt: number;
  lit: boolean;
  death: "wet" | "dog" | "poop" | null;
  level: 1 | 2 | 3;
  pump: "off" | "drink" | "on" | "used";
  drink: number;
  pumpedAt: number;
  dash: number;
  dashCool: number;
  sip: number;
};

export type Input = { pressed: boolean; held: boolean; creatine?: boolean; dash?: number };

export function createSim(seed = 1, level: 1 | 2 | 3 = 1): Sim {
  return {
    x: 200,
    y: GROUND,
    vy: 0,
    grounded: true,
    coyote: 0,
    buffer: 0,
    cut: false,
    alive: true,
    freeze: 0,
    time: 0,
    runTime: 0,
    airTime: 0,
    dist: 0,
    speed: 300,
    squash: 0,
    trauma: 0,
    puddles: [],
    dogs: [],
    platforms: [],
    galleries: [],
    poops: [],
    birds: [],
    captains: [],
    choirs: [],
    quiz: null,
    glasses: [],
    cursor: 860,
    nextId: 1,
    drops: [],
    seed: seed || 1,
    won: false,
    wonAt: 0,
    lit: false,
    death: null,
    level,
    pump: "off",
    drink: 0,
    pumpedAt: 0,
    dash: 0,
    dashCool: 0,
    sip: 0,
  };
}

export function metersOf(sim: Sim): number {
  return Math.floor(sim.dist / 52);
}

export function speedAt(dist: number): number {
  const t = Math.min(1, dist / 7200);
  return 300 + t * 250;
}

/** roll is 0..1. Higher is a wider puddle, still clearable with a full jump. */
export function puddleWidth(dist: number, roll: number): number {
  const speed = speedAt(dist);
  const progress = Math.min(1, dist / 8000);
  const maxW = Math.max(78, speed * AIR_CLEAR - 46);
  const minW = 68 + progress * 36;
  return minW + roll * Math.max(12, (maxW - minW) * 0.72);
}

function rand(sim: Sim): number {
  sim.seed = (sim.seed * 16807) % 2147483647;
  return (sim.seed - 1) / 2147483646;
}

function pushDrop(sim: Sim, x: number, y: number, vx: number, vy: number, life: number, r: number) {
  if (sim.drops.length > 140) sim.drops.shift();
  sim.drops.push({ x, y, vx, vy, life, max: life, r });
}

function spawnAhead(sim: Sim) {
  const horizon = Math.min(sim.x + VIEW_W + 280, FINISH_X - 520);
  if (sim.level === 2) {
    if (sim.galleries.length === 0) {
      sim.galleries.push(
        { id: sim.nextId++, x: 900, w: 1900 },
        { id: sim.nextId++, x: 6400, w: 2100 },
      );
    }
    if (sim.captains.length === 0) {
      const first = 1400 + rand(sim) * 2600;
      const second = Math.min(FINISH_X - 1600, first + 2400 + rand(sim) * 2800);
      sim.captains.push(
        { id: sim.nextId++, x: 0, phase: "wait", t: 0, nextAt: first },
        { id: sim.nextId++, x: 0, phase: "wait", t: 0, nextAt: second },
      );
    }
    spawnBirds(sim, horizon);
  } else if (sim.level === 3) {
    if (sim.choirs.length === 0) {
      const dealt = dealRiddles(sim);
      [2000, 4300, 6600, 8800].forEach((x, song) => {
        sim.choirs.push({ id: song, x, song, done: false, riddle: dealt[song] });
      });
    }
  } else spawnStreet(sim, horizon);
  const keep = sim.x - 500;
  const cut = sim.puddles.findIndex((p) => p.x + p.w >= keep);
  if (cut > 0) sim.puddles.splice(0, cut);
  else if (cut === -1) sim.puddles.length = 0;
  sim.dogs = sim.dogs.filter((dog) => dog.x > sim.x - 420);
  sim.platforms = sim.platforms.filter((p) => p.x + p.w > keep);
  sim.poops = sim.poops.filter((p) => p.x > keep && (p.state === "fall" || p.life > 0));
  sim.birds = sim.birds.filter((b) => b.stopX > keep - 200);
}

function spawnStreet(sim: Sim, horizon: number) {
  const span = FINISH_X - 200;
  while (sim.cursor < horizon) {
    const dogRoll = rand(sim);
    const along = (sim.cursor - 200) / span;
    const speed = speedAt(sim.cursor);
    const gap = speed * (0.78 + rand(sim) * 0.42) + 120;
    const dogChance = along > 0.46 && along < 0.9 ? 0.34 : 0;
    if (dogChance > 0 && dogRoll < dogChance) {
      sim.dogs.push({
        id: sim.nextId++,
        x: sim.cursor + 40,
        vx: -240,
        w: 78,
        phase: 0,
        barked: false,
      });
      sim.cursor += gap + 80;
      continue;
    }
    const roll = rand(sim);
    const w = puddleWidth(sim.cursor, roll);
    if (sim.cursor + w > FINISH_X - 520) break;
    sim.puddles.push({ id: sim.nextId++, x: sim.cursor, w });
    sim.cursor += w + gap;
  }
}

function spawnBirds(sim: Sim, horizon: number) {
  while (sim.cursor < horizon) {
    if (sim.cursor > FINISH_X - 640) break;
    const stopX = sim.cursor + 20;
    const pause = 0.12 + rand(sim) * 0.42;
    sim.birds.push({
      id: sim.nextId++,
      stopX,
      x: stopX + 240,
      y: 14,
      vx: -460,
      dropped: false,
      hold: pause,
      fly: rand(sim) * 6,
      live: false,
      salvo: rand(sim) < 0.4 ? 2 : 1,
      pause,
      approach: 220 + rand(sim) * 340,
    });
    sim.cursor += 360 + rand(sim) * 1040;
  }
}

function feetInPuddle(sim: Sim): Puddle | null {
  if (sim.y < GROUND - 12) return null;
  const left = sim.x - 15;
  const right = sim.x + 15;
  for (const p of sim.puddles) {
    if (right > p.x && left < p.x + p.w) return p;
  }
  return null;
}

function hitDog(sim: Sim): Dog | null {
  if (sim.y < GROUND - 34) return null;
  const left = sim.x - 14;
  const right = sim.x + 16;
  for (const dog of sim.dogs) {
    if (right > dog.x + 10 && left < dog.x + dog.w - 8) return dog;
  }
  return null;
}

function killDog(sim: Sim) {
  sim.alive = false;
  sim.death = "dog";
  sim.vy = 0;
  sim.freeze = 0.07;
  sim.trauma = Math.min(1, sim.trauma + 0.8);
  sim.squash = 1;
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI * (0.2 + (i / 10) * 0.6);
    const sp = 60 + (i % 4) * 28;
    pushDrop(sim, sim.x, GROUND - 8, Math.cos(a) * sp, Math.sin(a) * sp, 0.35, 2);
  }
}

function killPoop(sim: Sim) {
  sim.alive = false;
  sim.death = "poop";
  sim.vy = 0;
  sim.freeze = 0.07;
  sim.trauma = Math.min(1, sim.trauma + 0.7);
  sim.squash = 1;
}

function stepPoops(sim: Sim, dt: number) {
  const fallG = 980;
  const fallV = 40;
  const fallTo = (fromY: number, toY: number) => {
    let y = fromY;
    let vy = fallV;
    let t = 0;
    const dt = 1 / 60;
    while (y < toY && t < 3) {
      vy += fallG * dt;
      y += vy * dt;
      t += dt;
    }
    return t;
  };
  for (const bird of sim.birds) {
    if (!bird.live) {
      if (sim.x <= bird.stopX - bird.approach) continue;
      bird.live = true;
      bird.x = sim.x + 420;
      bird.hold = bird.pause;
    }
    if (!bird.dropped) {
      const fromY = bird.y + 30;
      const travel = fallTo(fromY, sim.y - 150);
      const aim = sim.x + Math.max(0, sim.speed) * travel;
      bird.x += (aim - bird.x) * (1 - Math.exp(-dt * 4.5));
      if (sim.x > bird.stopX - 60) bird.hold -= dt;
      if (bird.hold <= 0) {
        bird.x = aim;
        sim.poops.push({
          id: sim.nextId++,
          x: aim,
          y: fromY,
          vy: fallV,
          state: "fall",
          life: 2.8,
        });
        bird.salvo -= 1;
        if (bird.salvo > 0) bird.hold = 0.26 + (bird.fly % 1) * 0.16;
        else bird.dropped = true;
      }
    }
  }
  for (const poop of sim.poops) {
    if (poop.state !== "fall") {
      poop.life -= dt;
      continue;
    }
    poop.vy += fallG * dt;
    poop.y += poop.vy * dt;
    if (poop.y >= GROUND - 8) {
      poop.y = GROUND - 8;
      poop.vy = 0;
      poop.state = "stain";
    }
  }
}

function hitPoop(sim: Sim): boolean {
  const bodyTop = sim.y - 150;
  const bodyBot = sim.y - 6;
  for (const poop of sim.poops) {
    if (poop.life <= 0) continue;
    if (Math.abs(poop.x - sim.x) > 26) continue;
    if (poop.y < bodyTop || poop.y > bodyBot + 8) continue;
    const low = poop.y > sim.y - 40;
    if (low && !sim.grounded) continue;
    return true;
  }
  return false;
}

function kill(sim: Sim, puddle: Puddle) {
  sim.alive = false;
  sim.death = "wet";
  sim.vy = 0;
  sim.freeze = 0.07;
  sim.trauma = Math.min(1, sim.trauma + 0.72);
  sim.squash = 1;
  const splashX = Math.min(puddle.x + puddle.w, Math.max(puddle.x, sim.x));
  for (let i = 0; i < 18; i++) {
    const a = -Math.PI * (0.15 + (i / 18) * 0.7);
    const sp = 80 + (i % 5) * 36;
    pushDrop(sim, splashX, GROUND - 4, Math.cos(a) * sp, Math.sin(a) * sp, 0.45 + (i % 4) * 0.06, 2 + (i % 3));
  }
}

function tossNegroni(sim: Sim, fromX: number) {
  const travel = 1.05;
  const fromY = GROUND - 112;
  const targetX = sim.x + Math.max(0, sim.speed) * travel;
  const targetY = GROUND - 36;
  const glassG = 980;
  const startX = fromX - 24;
  sim.glasses.push({
    id: sim.nextId++,
    x: startX,
    y: fromY,
    vx: (targetX - startX) / travel,
    vy: (targetY - fromY) / travel - 0.5 * glassG * travel,
    life: travel + 0.4,
  });
}

function stepGlasses(sim: Sim, dt: number) {
  if (sim.level !== 2) return;
  const park = 620;
  for (const captain of sim.captains) {
    if (captain.phase === "gone") continue;
    if (captain.phase === "wait") {
      if (sim.x < captain.nextAt) continue;
      captain.phase = "arrive";
      captain.t = 400;
    }
    if (captain.phase === "arrive") {
      captain.t = Math.max(0, captain.t - 240 * dt);
      captain.x = sim.x + park + captain.t;
      if (captain.t <= 0) {
        captain.phase = "call";
        captain.t = 0.9;
      }
      continue;
    }
    if (captain.phase === "call") {
      captain.x = sim.x + park;
      captain.t -= dt;
      if (captain.t <= 0) {
        captain.phase = "throw";
        captain.t = 0.5;
      }
      continue;
    }
    if (captain.phase === "throw") {
      captain.x = sim.x + park;
      const before = captain.t;
      captain.t -= dt;
      if (before > 0 && captain.t <= 0) {
        tossNegroni(sim, captain.x);
        captain.phase = "leave";
        captain.t = 0;
      }
      continue;
    }
    captain.t += 320 * dt;
    captain.x = sim.x + park + captain.t;
    if (captain.t > 460) captain.phase = "gone";
  }
  for (const glass of sim.glasses) {
    if (glass.life <= 0) continue;
    glass.life -= dt;
    glass.vy += 980 * dt;
    glass.x += glass.vx * dt;
    glass.y += glass.vy * dt;
    if (glass.y >= GROUND - 18) glass.life = 0;
  }
  if (sim.sip <= 0) {
    for (const glass of sim.glasses) {
      if (glass.life <= 0) continue;
      if (Math.abs(glass.x - sim.x) > 32) continue;
      if (glass.y < sim.y - 168 || glass.y > sim.y + 6) continue;
      sim.sip = 2;
      glass.life = 0;
      sim.squash = 0.75;
    }
  }
  sim.glasses = sim.glasses.filter((glass) => glass.life > 0);
}

export function step(sim: Sim, dt: number, input: Input) {
  sim.time += dt;
  sim.trauma = Math.max(0, sim.trauma - dt * 1.7);
  sim.squash = Math.max(0, sim.squash - dt * 3.2);

  for (let i = sim.drops.length - 1; i >= 0; i--) {
    const d = sim.drops[i];
    d.life -= dt;
    d.vy += 900 * dt;
    d.x += d.vx * dt;
    d.y += d.vy * dt;
    if (d.y > GROUND) {
      d.y = GROUND;
      d.vy *= -0.25;
      d.vx *= 0.6;
    }
    if (d.life <= 0) sim.drops.splice(i, 1);
  }

  stepPoops(sim, dt);
  stepGlasses(sim, dt);

  if (sim.won) {
    if (!sim.lit && sim.time - sim.wonAt >= 2.7) {
      sim.lit = true;
      sim.trauma = 1;
      sim.squash = 0.85;
    }
    return;
  }
  if (!sim.alive) return;

  if (sim.freeze > 0) {
    sim.freeze -= dt;
    return;
  }

  if (input.pressed && sim.level !== 3) sim.buffer = 0.18;
  else sim.buffer = Math.max(0, sim.buffer - dt);

  if (input.creatine && sim.level !== 3 && sim.pump === "off" && sim.grounded && sim.quiz === null) {
    sim.pump = "drink";
    sim.drink = DRINK_TIME;
  }
  if (sim.pump === "drink") {
    sim.drink -= dt;
    if (sim.drink <= 0) {
      sim.pump = "on";
      sim.pumpedAt = sim.time;
      sim.squash = 1;
    }
  } else if (sim.pump === "on" && sim.time - sim.pumpedAt >= BUFF_TIME) {
    sim.pump = "used";
    sim.squash = 0.8;
  }

  if (sim.sip > 0) {
    sim.sip -= dt;
    sim.buffer = 0;
    sim.dash = 0;
  }
  const drinking = sim.sip > 0;

  const canJump = sim.level !== 3 && sim.quiz === null && !drinking && (sim.grounded || sim.coyote > 0);
  if (sim.buffer > 0 && canJump) {
    sim.vy = sim.pump === "on" ? BUFF_JUMP : JUMP_V;
    sim.grounded = false;
    sim.coyote = 0;
    sim.buffer = 0;
    sim.cut = false;
    sim.airTime = 0;
    sim.squash = 0.85;
  } else if (!input.held && sim.vy < 0 && !sim.cut && sim.airTime > 0.06) {
    sim.vy *= 0.46;
    sim.cut = true;
  }

  const cruise = speedAt(Math.max(0, sim.x - 200));
  sim.speed = drinking || sim.quiz !== null ? 0 : cruise;
  if (!drinking && sim.level === 2) {
    sim.dashCool = Math.max(0, sim.dashCool - dt);
    const dash = input.dash ?? 0;
    if (dash && sim.dashCool <= 0 && sim.dash === 0) {
      sim.dash = dash * 150;
      sim.dashCool = 1;
    }
  }
  sim.vy += GRAVITY * dt;
  if (sim.vy > 1100) sim.vy = 1100;
  sim.y += sim.vy * dt;
  sim.x += sim.speed * dt;
  if (sim.dash) {
    const stepDash = Math.sign(sim.dash) * Math.min(Math.abs(sim.dash), 1400 * dt);
    sim.x += stepDash;
    sim.dash -= stepDash;
    if (Math.abs(sim.dash) < 0.5) sim.dash = 0;
  }
  if (sim.x < 120) sim.x = 120;
  if (sim.speed > 0) sim.dist += sim.speed * dt;

  if (sim.y >= GROUND) {
    const landed = !sim.grounded;
    sim.y = GROUND;
    sim.vy = 0;
    sim.grounded = true;
    sim.airTime = 0;
    if (landed) sim.squash = 1;
  } else {
    sim.grounded = false;
    sim.airTime += dt;
    sim.coyote = Math.max(0, sim.coyote - dt);
  }

  if (sim.grounded && sim.speed > 0) {
    sim.runTime += dt;
    sim.coyote = 0.1;
  }

  for (const dog of sim.dogs) {
    dog.x += dog.vx * dt;
    dog.phase += dt * 10;
  }

  if (sim.level === 3 && sim.quiz === null) {
    for (const choir of sim.choirs) {
      if (choir.done || sim.x + 80 < choir.x) continue;
      sim.x = choir.x - 80;
      sim.speed = 0;
      sim.quiz = choir.id;
      break;
    }
  }

  if (sim.x >= FINISH_X) {
    sim.x = FINISH_X;
    sim.speed = 0;
    if (sim.grounded) {
      if (!sim.won) sim.wonAt = sim.time;
      sim.won = true;
      return;
    }
  }

  spawnAhead(sim);
  const hit = feetInPuddle(sim);
  if (hit) kill(sim, hit);
  else if (hitDog(sim)) killDog(sim);
  else if (hitPoop(sim)) killPoop(sim);
}

export function answerQuiz(sim: Sim, pick: number): boolean {
  if (sim.quiz === null) return false;
  const choir = sim.choirs.find((item) => item.id === sim.quiz);
  const song = choir?.riddle;
  if (!choir || !song || pick !== song.answer) return false;
  choir.done = true;
  sim.quiz = null;
  return true;
}

/** Full jump from just before the puddle, at the speed that distance implies. */
export function jumpClears(width: number, dist: number): boolean {
  const sim = createSim(3);
  sim.dist = dist;
  sim.x = 0;
  sim.y = GROUND;
  sim.puddles = [{ id: 1, x: 18, w: width }];
  sim.cursor = 999999;
  const dt = 1 / 60;
  step(sim, dt, { pressed: true, held: true });
  for (let i = 0; i < 120 && sim.alive; i++) step(sim, dt, { pressed: false, held: true });
  return sim.alive && sim.x > 18 + width + 15;
}
