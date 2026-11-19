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

export type Bird = {
  id: number;
  x: number;
  w: number;
  y: number;
  cool: number;
  next: number;
  on: boolean;
};

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
  poops: Poop[];
  birds: Bird[];
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
};

export type Input = { pressed: boolean; held: boolean; creatine?: boolean };

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
    poops: [],
    birds: [],
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

const DECK_H = 16;
const DROP_AT = [-90, 55, 145, 260];

function spawnAhead(sim: Sim) {
  const horizon = Math.min(sim.x + VIEW_W + 280, FINISH_X - 520);
  if (sim.level === 2) spawnShelters(sim, horizon);
  else spawnStreet(sim, horizon);
  const keep = sim.x - 500;
  const cut = sim.puddles.findIndex((p) => p.x + p.w >= keep);
  if (cut > 0) sim.puddles.splice(0, cut);
  else if (cut === -1) sim.puddles.length = 0;
  sim.dogs = sim.dogs.filter((dog) => dog.x > sim.x - 420);
  sim.platforms = sim.platforms.filter((p) => p.x + p.w > keep);
  sim.poops = sim.poops.filter((p) => p.x > keep && (p.state === "fall" || p.life > 0));
  sim.birds = sim.birds.filter((b) => b.x + b.w > keep - 200);
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

function spawnShelters(sim: Sim, horizon: number) {
  while (sim.cursor < horizon) {
    const w = 210;
    if (sim.cursor + w > FINISH_X - 520) break;
    sim.platforms.push({ id: sim.nextId++, x: sim.cursor, w });
    sim.birds.push({
      id: sim.nextId++,
      x: sim.cursor,
      w,
      y: GROUND - 270,
      cool: 0,
      next: 0,
      on: false,
    });
    const speed = speedAt(sim.cursor);
    sim.cursor += w + speed * 0.85 + 220;
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

function overDeck(sim: Sim, x: number): Platform | null {
  for (const p of sim.platforms) {
    if (x > p.x + 10 && x < p.x + p.w - 10) return p;
  }
  return null;
}

function sheltered(sim: Sim): boolean {
  return sim.y > GROUND - 24 && overDeck(sim, sim.x) !== null;
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
  for (const bird of sim.birds) {
    if (bird.next >= DROP_AT.length) continue;
    const dropX = bird.x + DROP_AT[bird.next];
    if (!bird.on && sim.x > dropX - 250) bird.on = true;
    if (!bird.on) continue;
    bird.cool -= dt;
    if (bird.cool > 0) continue;
    sim.poops.push({
      id: sim.nextId++,
      x: dropX,
      y: bird.y,
      vy: 40,
      state: "fall",
      life: 1.6,
    });
    bird.next += 1;
    bird.cool = 0.36;
  }
  const top = GROUND - DECK;
  for (const poop of sim.poops) {
    if (poop.state !== "fall") {
      poop.life -= dt;
      continue;
    }
    poop.vy += 1500 * dt;
    poop.y += poop.vy * dt;
    const roof = overDeck(sim, poop.x);
    if (roof && poop.y >= top && poop.y <= top + DECK_H + 8) {
      poop.y = top;
      poop.vy = 0;
      poop.state = "roof";
      continue;
    }
    if (poop.y >= GROUND - 4) {
      poop.y = GROUND - 4;
      poop.vy = 0;
      poop.state = "stain";
    }
  }
}

function hitPoop(sim: Sim): boolean {
  if (sheltered(sim) || (sim.grounded && sim.y < GROUND - 40)) return false;
  const top = sim.y - 64;
  for (const poop of sim.poops) {
    if (poop.state === "roof" || poop.life <= 0) continue;
    if (poop.x < sim.x - 16 || poop.x > sim.x + 16) continue;
    if (poop.y >= top && poop.y <= sim.y + 6) return true;
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

  if (input.pressed) sim.buffer = 0.18;
  else sim.buffer = Math.max(0, sim.buffer - dt);

  if (input.creatine && sim.pump === "off" && sim.grounded) {
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

  const canJump = sim.grounded || sim.coyote > 0;
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

  sim.speed = speedAt(sim.dist);
  const prevY = sim.y;
  sim.vy += GRAVITY * dt;
  if (sim.vy > 1100) sim.vy = 1100;
  sim.y += sim.vy * dt;
  sim.x += sim.speed * dt;
  sim.dist += sim.speed * dt;

  const deckTop = GROUND - DECK;
  const deckUnder = deckTop + DECK_H;
  if (sim.vy < 0 && prevY >= deckUnder && sim.y < deckUnder && overDeck(sim, sim.x)) {
    sim.y = deckUnder;
    sim.vy = 80;
  }

  let surface = GROUND;
  if (sim.vy >= 0 && prevY <= deckTop && sim.y >= deckTop && overDeck(sim, sim.x)) surface = deckTop;

  if (sim.y >= surface) {
    const landed = !sim.grounded;
    sim.y = surface;
    sim.vy = 0;
    sim.grounded = true;
    sim.airTime = 0;
    if (landed) sim.squash = 1;
  } else {
    sim.grounded = false;
    sim.airTime += dt;
    sim.coyote = Math.max(0, sim.coyote - dt);
  }

  if (sim.grounded) {
    sim.runTime += dt;
    sim.coyote = 0.1;
  }

  for (const dog of sim.dogs) {
    dog.x += dog.vx * dt;
    dog.phase += dt * 10;
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
