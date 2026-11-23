import { FINISH_X, GROUND, VIEW_H, VIEW_W, type Sim } from "@/game/sim";

export type Art = {
  run: HTMLImageElement[];
  jump: HTMLImageElement[];
  cigar: HTMLImageElement | null;
  finale: HTMLImageElement[];
  buffRun: HTMLImageElement[];
  buffJump: HTMLImageElement[];
  drink: HTMLImageElement | null;
  basilica: HTMLImageElement | null;
  fountain: HTMLImageElement | null;
  cannelle: HTMLImageElement | null;
  dog: HTMLImageElement | null;
  liberamia: HTMLImageElement | null;
  cormorant: HTMLImageElement | null;
  gallery: HTMLImageElement | null;
  poop: HTMLImageElement | null;
  captain: HTMLImageElement | null;
  captainRun: HTMLImageElement | null;
  captainRun2: HTMLImageElement | null;
  captainCall: HTMLImageElement | null;
  captainThrow: HTMLImageElement | null;
  negroni: HTMLImageElement | null;
  trees: HTMLImageElement[];
  fans: HTMLImageElement[];
  napoliFlag: HTMLImageElement | null;
  castle: HTMLImageElement | null;
  porta: HTMLImageElement | null;
};

type House = { x: number; w: number; h: number; roof: number };

const HOUSES: House[] = Array.from({ length: 22 }, (_, i) => ({
  x: i * 210,
  w: 120 + ((i * 47) % 70),
  h: 70 + ((i * 83) % 90),
  roof: 28 + ((i * 19) % 22),
}));

export function drawWorld(
  ctx: CanvasRenderingContext2D,
  sim: Sim,
  art: Art,
  shake: boolean,
) {
  const cam = sim.x - 230;
  const amp = shake ? sim.trauma * sim.trauma : 0;
  const ox = Math.sin(sim.time * 41) * 7 * amp;
  const oy = Math.cos(sim.time * 33) * 5 * amp;

  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  if (sim.level === 2) {
    sky.addColorStop(0, "#3d9be0");
    sky.addColorStop(0.42, "#8fd0f4");
    sky.addColorStop(0.74, "#f7e3a4");
    sky.addColorStop(1, "#f6d7a4");
  } else if (sim.level === 3) {
    sky.addColorStop(0, "#79c7f2");
    sky.addColorStop(0.5, "#d9f3c4");
    sky.addColorStop(1, "#c6e6a6");
  } else {
    sky.addColorStop(0, "#163246");
    sky.addColorStop(0.38, "#4e7384");
    sky.addColorStop(0.72, "#d08a68");
    sky.addColorStop(1, "#f0d7b4");
  }
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  if (sim.level === 2) {
    ctx.fillStyle = "#ffe56a";
    ctx.beginPath();
    ctx.arc(800, 74, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 229, 106, 0.28)";
    ctx.beginPath();
    ctx.arc(800, 74, 58, 0, Math.PI * 2);
    ctx.fill();
  } else if (sim.level === 3) {
    ctx.fillStyle = "#fff4c4";
    ctx.beginPath();
    ctx.arc(780, 86, 32, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.translate(ox, oy);
  if (sim.won) {
    const t = Math.min(1, (sim.time - sim.wonAt) / 2.2);
    const z = 1 + t * t * (3 - 2 * t) * 0.14;
    ctx.translate(230, sim.y);
    ctx.scale(z, z);
    ctx.translate(-230, -sim.y);
  }

  drawClouds(ctx, cam);
  if (sim.level === 3) {
    drawGranSasso(ctx, cam);
    drawFoothills(ctx, cam);
    drawAvenue(ctx, cam, false, art, sim);
    drawCastle(ctx, cam, art);
  } else {
    drawGranSasso(ctx, cam);
    drawFoothills(ctx, cam);
    drawTown(ctx, cam);
    if (sim.level === 2) drawGalleryBackdrop(ctx, sim, art, cam);
    drawCypresses(ctx, cam);
    drawTower(ctx, 2400 - cam);
    drawBernardino(ctx, 4300 - cam);
    drawFort(ctx, 6400 - cam);
  }
  if (sim.level === 3) {
    if (!drawPlaced(ctx, art.basilica, FINISH_X + 80 - cam, 500, 300)) {
      drawCollemaggio(ctx, FINISH_X + 40 - cam);
    }
  } else if (sim.level === 2) {
    if (!drawPlaced(ctx, art.liberamia, FINISH_X + 20 - cam, 460, 190)) {
      drawLiberamia(ctx, FINISH_X + 20 - cam);
    }
  } else {
    drawPlaced(ctx, art.cannelle, 8200 - cam, 380, 86);
    if (!drawPlaced(ctx, art.fountain, FINISH_X + 280 - cam, 168, 236)) drawFountain(ctx, FINISH_X + 280 - cam);
    else drawFountainJets(ctx, FINISH_X + 280 - cam + 70, sim.time);
  }
  if (sim.level !== 2 && sim.level !== 3) drawPortici(ctx, cam);
  if (sim.level === 1) drawCormorants(ctx, sim.time);

  drawSampietrini(ctx, cam);
  if (sim.level === 3) drawPortaNapoli(ctx, cam, art);

  drawFinish(ctx, FINISH_X - cam);

  for (const p of sim.puddles) {
    const x = p.x - cam;
    if (x > VIEW_W + 40 || x + p.w < -40) continue;
    ctx.save();
    ctx.translate(x, GROUND - 6);
    ctx.fillStyle = "rgba(92, 176, 206, 0.88)";
    ctx.beginPath();
    ctx.ellipse(p.w / 2, 8, p.w / 2, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(186, 228, 242, 0.55)";
    ctx.beginPath();
    ctx.ellipse(p.w / 2 - 4, 5, Math.max(8, p.w / 2 - 10), 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(232, 248, 252, 0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(p.w / 2, 4, p.w / 2 - 6, 9, 0, Math.PI * 1.05, Math.PI * 1.9);
    ctx.stroke();
    const ripple = (sim.time * 36 + p.id * 13) % (p.w * 0.45);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
    ctx.beginPath();
    ctx.ellipse(p.w / 2, 8, Math.max(8, ripple), 7, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  if (sim.level === 3) drawAvenue(ctx, cam, true, art, sim);
  drawDogs(ctx, sim, art, cam);
  if (sim.level === 3) drawChoirs(ctx, sim, art, cam);
  if (sim.level === 2) drawBirds(ctx, sim, art, cam);
  if (sim.level === 2) drawCaptains(ctx, sim, art, cam);

  const lift = Math.max(0, GROUND - sim.y);
  ctx.fillStyle = `rgba(0, 0, 0, ${0.28 - Math.min(0.2, lift / 700)})`;
  ctx.beginPath();
  ctx.ellipse(sim.x - cam, GROUND + 2, 22 - Math.min(10, lift / 20), 6, 0, 0, Math.PI * 2);
  ctx.fill();

  drawRunner(ctx, sim, art, cam);
  if (sim.level === 2) drawPoops(ctx, sim, art, cam);
  if (sim.level === 2) drawGlasses(ctx, sim, art, cam);
  drawPump(ctx, sim, cam);
  if (sim.won && art.finale.length < 8) drawSmoke(ctx, sim, cam);

  for (const d of sim.drops) {
    ctx.globalAlpha = Math.max(0, d.life / d.max);
    ctx.fillStyle = "#d5e2e6";
    ctx.beginPath();
    ctx.arc(d.x - cam, d.y, d.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.restore();

  if (sim.won) {
    const flash = sim.time - sim.wonAt;
    if (flash > 2.62 && flash < 3.05) {
      const u = 1 - Math.abs(flash - 2.78) / 0.22;
      ctx.fillStyle = `rgba(255, 196, 110, ${Math.max(0, u) * 0.32})`;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    }
  }

  ctx.fillStyle = "rgba(210, 220, 226, 0.35)";
  if (sim.level === 1) {
    for (let i = 0; i < 70; i++) {
      const rx = ((i * 137 + sim.time * (180 + (i % 5) * 40)) % (VIEW_W + 40)) - 20;
      const ry = ((i * 89 + sim.time * (320 + (i % 7) * 30)) % (VIEW_H + 30)) - 10;
      ctx.fillRect(rx + ox * 0.2, ry, 1.2, 10);
    }
  }
}

function packFor(sim: Sim, art: Art) {
  if (sim.pump === "on" && art.buffRun.length === 4) {
    return {
      run: art.buffRun,
      jump: art.buffJump.length === 4 ? art.buffJump : art.jump,
    };
  }
  return { run: art.run, jump: art.jump };
}

function frameFor(sim: Sim, art: Art): HTMLImageElement | null {
  if (sim.won && art.cigar && art.finale.length !== 4) return art.cigar;
  if (sim.pump === "drink" && art.drink) return art.drink;
  const pack = packFor(sim, art);
  if (!sim.grounded && pack.jump.length === 4) {
    if (sim.airTime < 0.08) return pack.jump[0];
    if (sim.vy < -180) return pack.jump[1];
    if (sim.vy < 220) return pack.jump[2];
    return pack.jump[3];
  }
  if (!pack.run.length) return null;
  const index = Math.floor(sim.runTime * 9) % pack.run.length;
  return pack.run[index] ?? null;
}

function drawRunner(ctx: CanvasRenderingContext2D, sim: Sim, art: Art, cam: number) {
  if (sim.won && art.finale.length >= 8) {
    drawFinale(ctx, sim, art.finale, cam);
    return;
  }
  const img = frameFor(sim, art);
  const x = sim.x - cam;
  const size = !sim.won && sim.pump === "on" ? 210 : 186;
  const squash = sim.squash;
  const sx = 1 + squash * 0.12;
  const sy = 1 - squash * 0.16;
  ctx.save();
  ctx.translate(x, sim.y);
  ctx.scale(sx, sy);
  if (img) {
    ctx.drawImage(img, -size / 2, -size, size, size);
  }
  ctx.restore();
}

function drawGalleryBackdrop(ctx: CanvasRenderingContext2D, sim: Sim, art: Art, cam: number) {
  for (const gallery of sim.galleries) {
    const x = gallery.x - cam * 0.36;
    if (x > VIEW_W + 80 || x + gallery.w < -80) continue;
    if (art.gallery) ctx.drawImage(art.gallery, x, GROUND - 250, gallery.w, 210);
  }
}

function drawBirds(ctx: CanvasRenderingContext2D, sim: Sim, art: Art, cam: number) {
  for (const bird of sim.birds) {
    if (!bird.live) continue;
    const bob = Math.sin(sim.time * 5 + bird.fly) * 3;
    const x = bird.x - cam - 30;
    if (x < -120 || x > VIEW_W + 40) continue;
    if (art.cormorant) ctx.drawImage(art.cormorant, x, bird.y + bob, 96, 42);
  }
}

function drawAvenue(ctx: CanvasRenderingContext2D, cam: number, front: boolean, art: Art, sim: Sim) {
  const trees = art.trees.filter((tree) => tree);
  const spacing = 300;
  const start = Math.floor(cam / spacing) * spacing - spacing;
  for (let world = start; world < cam + VIEW_W + spacing; world += spacing) {
    if (world > FINISH_X - 780) continue;
    if (sim.choirs.some((choir) => Math.abs(choir.x - world) < 280)) continue;
    const slot = Math.round(world / spacing);
    const img = trees[(slot + (front ? 1 : 0)) % Math.max(1, trees.length)];
    const x = world - cam + (front ? 120 : 10);
    if (!img) {
      drawPlane(ctx, x, front ? VIEW_H + 8 : GROUND - 6, front ? 1.05 : 0.9);
      continue;
    }
    const h = (front ? 190 : 250) + (Math.abs(slot) % 3) * 22;
    const w = h * (img.width / img.height);
    const foot = front ? VIEW_H - 6 : GROUND + 4;
    ctx.drawImage(img, x - w / 2, foot - h, w, h);
  }
}

function drawPlane(ctx: CanvasRenderingContext2D, x: number, ground: number, scale: number) {
  ctx.fillStyle = "#5c3d26";
  ctx.fillRect(x, ground - 78 * scale, 9 * scale, 78 * scale);
  ctx.fillStyle = "#2d7a3c";
  ctx.beginPath();
  ctx.arc(x + 4 * scale, ground - 86 * scale, 30 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#46a356";
  ctx.beginPath();
  ctx.arc(x - 14 * scale, ground - 70 * scale, 18 * scale, 0, Math.PI * 2);
  ctx.arc(x + 22 * scale, ground - 72 * scale, 16 * scale, 0, Math.PI * 2);
  ctx.fill();
}

function drawPortaNapoli(ctx: CanvasRenderingContext2D, cam: number, art: Art) {
  if (!art.porta) return;
  const h = 250;
  const w = h * (art.porta.width / art.porta.height);
  const x = FINISH_X - 700 - cam;
  if (x > VIEW_W + 20 || x + w < -20) return;
  ctx.drawImage(art.porta, x, GROUND - h + 8, w, h);
}

function drawCastle(ctx: CanvasRenderingContext2D, cam: number, art: Art) {
  if (!art.castle) return;
  const h = 168;
  const w = h * (art.castle.width / art.castle.height);
  const x = FINISH_X * 0.5 - cam - w / 2;
  if (x > VIEW_W + 20 || x + w < -20) return;
  ctx.drawImage(art.castle, x, GROUND - h - 18, w, h);
}

function drawChoirs(ctx: CanvasRenderingContext2D, sim: Sim, art: Art, cam: number) {
  const fans = art.fans.filter((fan) => fan);
  for (const choir of sim.choirs) {
    const img = fans[choir.song];
    if (!img) continue;
    const x = choir.x - cam;
    const h = 186;
    const w = h * (img.width / img.height);
    if (x + w / 2 < -40 || x - w / 2 > VIEW_W + 40) continue;
    const bob = choir.done ? Math.abs(Math.sin(sim.time * 6 + choir.id)) * 4 : 0;
    ctx.drawImage(img, x - w / 2, GROUND - h - bob, w, h);
  }
}

function drawPoops(ctx: CanvasRenderingContext2D, sim: Sim, art: Art, cam: number) {
  for (const poop of sim.poops) {
    if (poop.life <= 0) continue;
    const x = poop.x - cam;
    if (x < -40 || x > VIEW_W + 40) continue;
    const spin = poop.state === "fall" ? Math.sin(sim.time * 8 + poop.id) * 0.4 : 0;
    const fall = poop.state === "fall";
    const w = fall ? 36 : 42;
    const h = fall ? 52 : 20;
    ctx.save();
    ctx.translate(x, poop.y);
    ctx.rotate(spin);
    if (fall) {
      ctx.strokeStyle = "rgba(255, 252, 240, 0.9)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, -h * 0.2);
      ctx.lineTo(-3, -h * 0.85);
      ctx.stroke();
    }
    if (art.poop) {
      ctx.shadowColor = "#fffdf8";
      ctx.shadowBlur = 10;
      ctx.drawImage(art.poop, -w / 2, -h / 2, w, h);
      ctx.shadowColor = "#140e0a";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.drawImage(art.poop, -w / 2, -h / 2, w, h);
    }
    ctx.restore();
  }
}

function drawCaptains(ctx: CanvasRenderingContext2D, sim: Sim, art: Art, cam: number) {
  for (const captain of sim.captains) {
    if (captain.phase === "wait" || captain.phase === "gone") continue;
    const x = captain.x - cam;
    if (x < -180 || x > VIEW_W + 160) continue;
    const runA = art.captainRun ?? art.captain;
    const runB = art.captainRun2 ?? runA;
    if (!runA) continue;
    const thrown = art.captainThrow;
    const talking = captain.phase === "call";
    const throwing = captain.phase === "throw";
    const leaving = captain.phase === "leave";
    const arriving = captain.phase === "arrive";
    const stride = sim.time * (talking ? 7 : leaving ? 16 : 12);
    const frame = Math.sin(stride) > 0 ? runA : runB;
    if (!frame) continue;
    const bob = Math.abs(Math.sin(stride)) * (talking ? 5 : arriving || leaving ? 10 : 8);
    const squash = 1 + Math.sin(stride * 2) * (talking ? 0.03 : 0.06);
    let lean = Math.sin(stride) * (talking ? 0.04 : 0.09);
    let blend = 0;
    let lunge = 0;
    let hop = 0;
    if (talking && art.captainCall) hop = Math.abs(Math.sin(sim.time * 9)) * 6;
    if (throwing) {
      const p = 1 - Math.max(0, captain.t) / 0.5;
      const wind = Math.min(1, p / 0.45);
      const swing = wind < 1 ? -wind * 0.35 : Math.sin((p - 0.45) / 0.55 * Math.PI);
      blend = wind < 1 ? 0 : Math.min(1, (p - 0.45) / 0.35);
      lunge = Math.max(0, swing) * 46;
      lean = swing;
      hop = wind < 1 ? (1 - wind) * 4 : 0;
    }
    const h = 168 * squash;
    const posed = art.captainCall ?? frame;
    const body = ((throwing && blend < 0.5) || talking) ? posed : frame;
    const bodyW = h * (body.width / body.height);
    const throwW = thrown ? h * (thrown.width / thrown.height) : bodyW;
    ctx.save();
    ctx.translate(x - lunge, GROUND - bob - hop);
    ctx.rotate(lean);
    if (leaving) ctx.scale(-1, 1);
    ctx.globalAlpha = 1 - blend;
    ctx.drawImage(body, -bodyW / 2, -h, bodyW, h);
    if (thrown && blend > 0) {
      ctx.globalAlpha = blend;
      ctx.drawImage(thrown, -throwW * 0.7, -h, throwW, h);
    }
    ctx.restore();
    if (talking || throwing) drawNegroniBubble(ctx, x - lunge, GROUND - h - bob - hop - 16, talking ? 1 + Math.sin(sim.time * 10) * 0.06 : 1);
  }
}

function drawNegroniBubble(ctx: CanvasRenderingContext2D, x: number, y: number, pulse = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(pulse, pulse);
  ctx.fillStyle = "#fffdf6";
  ctx.strokeStyle = "#140e09";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(-78, -40, 156, 36, 10);
  ctx.moveTo(-10, -4);
  ctx.lineTo(0, 12);
  ctx.lineTo(10, -4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#140e09";
  ctx.font = "700 22px Impact, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("NEGRONI!", 0, -22);
  ctx.restore();
}

function drawGlasses(ctx: CanvasRenderingContext2D, sim: Sim, art: Art, cam: number) {
  for (const glass of sim.glasses) {
    const x = glass.x - cam;
    if (x < -40 || x > VIEW_W + 40) continue;
    const ang = Math.atan2(glass.vy, glass.vx);
    ctx.save();
    ctx.translate(x, glass.y);
    ctx.rotate(ang);
    ctx.globalAlpha = 0.35;
    if (art.negroni) ctx.drawImage(art.negroni, 18, -14, 26, 32);
    ctx.globalAlpha = 1;
    if (art.negroni) ctx.drawImage(art.negroni, -18, -22, 40, 48);
    ctx.restore();
  }
  if (sim.sip <= 0) return;
  const x = sim.x - cam;
  if (art.negroni) ctx.drawImage(art.negroni, x + 18, sim.y - 132, 26, 32);
}

function drawPump(ctx: CanvasRenderingContext2D, sim: Sim, cam: number) {
  if (sim.pump === "off") return;
  const shown = sim.pump === "drink" || sim.time - sim.pumpedAt < 1.2;
  if (!shown) return;
  const grow = sim.pump === "drink" ? 1 - sim.drink / 0.7 : 1;
  const fade = sim.pump === "drink" ? 1 : Math.max(0, 1 - Math.max(0, sim.time - sim.pumpedAt - 0.65) / 0.55);
  const pop = 0.62 + Math.min(1, grow) * 0.42 + Math.sin(sim.time * 14) * 0.035;
  const text = "PROTEINE +1000";
  const colors = ["#ff4d6d", "#ffd166", "#7ae582", "#4cc9f0", "#f72585", "#ff9f1c", "#c77dff", "#fff3b0", "#80ffdb", "#ff6b6b", "#f4a261", "#e9ff70", "#72efdd", "#ffffff"];
  ctx.save();
  ctx.translate(sim.x - cam, sim.y - (sim.pump === "on" ? 228 : 196));
  ctx.rotate(Math.sin(sim.time * 8) * 0.07);
  ctx.scale(pop, pop);
  ctx.globalAlpha = fade;
  ctx.font = "800 32px Outfit, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const width = ctx.measureText(text).width;
  ctx.lineWidth = 7;
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#140d10";
  ctx.strokeText(text, -width / 2, 0);
  let x = -width / 2;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i] ?? "";
    const w = ctx.measureText(ch).width;
    ctx.fillStyle = colors[i % colors.length] ?? "#fff";
    ctx.fillText(ch, x, Math.sin(sim.time * 12 + i) * 3);
    x += w;
  }
  for (let i = 0; i < 8; i++) {
    const a = sim.time * 3.2 + i * 0.8;
    ctx.fillStyle = colors[i % colors.length] ?? "#fff";
    ctx.beginPath();
    ctx.arc(Math.cos(a) * (36 + (i % 4) * 14), Math.sin(a * 1.4) * 16 - 6, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawDogs(ctx: CanvasRenderingContext2D, sim: Sim, art: Art, cam: number) {
  const img = art.dog;
  for (const dog of sim.dogs) {
    const x = dog.x - cam;
    const bob = Math.sin(dog.phase * 1.4) * 4;
    const w = 176;
    const h = 90;
    if (x > VIEW_W + 30 || x + w < -30) continue;
    if (!img) continue;
    ctx.drawImage(img, x - 20, GROUND - h + bob, w, h);
  }
}

function drawSampietrini(ctx: CanvasRenderingContext2D, cam: number) {
  const top = GROUND - 30;
  ctx.fillStyle = "#3c3935";
  ctx.fillRect(-24, top, VIEW_W + 48, VIEW_H - top + 8);
  ctx.fillStyle = "#6a645c";
  ctx.fillRect(-24, top - 4, VIEW_W + 48, 4);

  const stoneW = 46;
  const stoneH = 18;
  const gap = 3;
  const pitch = stoneW + gap;
  const shades = ["#46423e", "#4e4a45", "#403d39", "#524e48"];
  const camI = Math.floor(cam);
  const first = Math.floor(camI / pitch) - 2;
  const cols = Math.ceil(VIEW_W / pitch) + 4;
  for (let row = 0; row < 3; row++) {
    const stagger = row % 2 === 0 ? 0 : Math.floor(pitch / 2);
    const y = top + 5 + row * (stoneH + gap);
    for (let i = 0; i < cols; i++) {
      const col = first + i;
      const x = col * pitch + stagger - camI;
      ctx.fillStyle = shades[Math.abs((col + row) % 4)] ?? shades[0];
      ctx.fillRect(x, y, stoneW, stoneH);
    }
  }
}

function drawClouds(ctx: CanvasRenderingContext2D, cam: number) {
  const s = -cam * 0.04;
  ctx.fillStyle = "rgba(255, 248, 240, 0.28)";
  const clouds = [
    [40, 62, 100],
    [280, 108, 74],
    [520, 48, 120],
    [800, 96, 86],
    [1040, 70, 90],
  ];
  for (const [x, y, w] of clouds) {
    const px = ((((x ?? 0) + s) % 1400) + 1400) % 1400 - 100;
    ctx.beginPath();
    ctx.ellipse(px, y ?? 0, w ?? 80, 16, 0, 0, Math.PI * 2);
    ctx.ellipse(px + (w ?? 80) * 0.35, (y ?? 0) - 12, (w ?? 80) * 0.5, 14, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFoothills(ctx: CanvasRenderingContext2D, cam: number) {
  const s = -cam * 0.2;
  ctx.fillStyle = "#5d6a62";
  ctx.beginPath();
  ctx.moveTo(-80 + s, GROUND - 20);
  ctx.lineTo(60 + s, GROUND - 90);
  ctx.lineTo(220 + s, GROUND - 50);
  ctx.lineTo(380 + s, GROUND - 120);
  ctx.lineTo(560 + s, GROUND - 40);
  ctx.lineTo(760 + s, GROUND - 100);
  ctx.lineTo(980 + s, GROUND - 30);
  ctx.lineTo(1200 + s, GROUND - 20);
  ctx.closePath();
  ctx.fill();
}

function drawCypresses(ctx: CanvasRenderingContext2D, cam: number) {
  const span = 280;
  for (let i = 0; i < 8; i++) {
    let x = i * span + 40 - cam * 0.5;
    x = ((x % (span * 8)) + span * 8) % (span * 8) - 40;
    const h = 70 + (i % 3) * 18;
    ctx.fillStyle = "#24362c";
    ctx.beginPath();
    ctx.moveTo(x, GROUND - 42);
    ctx.lineTo(x + 8, GROUND - 42 - h);
    ctx.lineTo(x + 16, GROUND - 42);
    ctx.closePath();
    ctx.fill();
  }
}

function drawPlaced(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  x: number,
  w: number,
  h: number,
) {
  if (!img) return false;
  if (x > VIEW_W + 40 || x + w < -40) return true;
  ctx.drawImage(img, x, GROUND - h, w, h);
  return true;
}

function drawFountainJets(ctx: CanvasRenderingContext2D, x: number, time: number) {
  if (x < -40 || x > VIEW_W + 40) return;
  ctx.fillStyle = "rgba(120, 210, 230, 0.8)";
  for (let i = 0; i < 4; i++) {
    const fall = (time * 70 + i * 18) % 46;
    ctx.fillRect(x + (i - 1.5) * 6, GROUND - 150 + fall, 2, 8);
  }
}

function drawBernardino(ctx: CanvasRenderingContext2D, x: number) {
  if (x < -180 || x > VIEW_W + 40) return;
  ctx.fillStyle = "#d8c3a5";
  ctx.fillRect(x + 28, GROUND - 168, 120, 130);
  ctx.fillStyle = "#efe6d6";
  ctx.beginPath();
  ctx.moveTo(x + 16, GROUND - 168);
  ctx.lineTo(x + 88, GROUND - 230);
  ctx.lineTo(x + 160, GROUND - 168);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#2c2420";
  ctx.beginPath();
  ctx.arc(x + 88, GROUND - 150, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6a5346";
  ctx.fillRect(x + 74, GROUND - 78, 28, 40);
  ctx.fillStyle = "#c4b49a";
  ctx.fillRect(x, GROUND - 42, 176, 14);
}

function drawPortici(ctx: CanvasRenderingContext2D, cam: number) {
  ctx.strokeStyle = "#5c4c42";
  ctx.lineWidth = 7;
  const span = 78;
  const offset = -((cam * 0.78) % span);
  for (let x = offset; x < VIEW_W + span; x += span) {
    ctx.beginPath();
    ctx.arc(x + 28, GROUND - 46, 22, Math.PI, 0);
    ctx.stroke();
    ctx.fillStyle = "#6a584c";
    ctx.fillRect(x + 4, GROUND - 48, 6, 20);
    ctx.fillRect(x + 48, GROUND - 48, 6, 20);
  }
}

function drawCormorants(ctx: CanvasRenderingContext2D, time: number) {
  const flocks = [
    { period: 15, delay: 1, y: 54, n: 4 },
    { period: 19, delay: 10, y: 102, n: 3 },
  ];
  for (const flock of flocks) {
    const t = (time + flock.delay) % flock.period;
    if (t > 6.5) continue;
    const lead = -140 + (t / 6.5) * (VIEW_W + 320);
    for (let i = 0; i < flock.n; i++) {
      const x = lead - i * 58;
      const y = flock.y + Math.sin(time * 2.2 + i) * 6 + (i % 2) * 12;
      const flap = Math.sin(time * 11 + i * 1.3);
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = "#12161a";
      ctx.beginPath();
      ctx.ellipse(0, 0, 15, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(8, -1);
      ctx.quadraticCurveTo(20, -10, 28, -3);
      ctx.lineTo(26, 0);
      ctx.quadraticCurveTo(16, -2, 8, 3);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(26, -4);
      ctx.lineTo(38, -2);
      ctx.lineTo(26, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-2, -1);
      ctx.quadraticCurveTo(8, -6 - flap * 16, 20, flap * 4);
      ctx.lineTo(-4, 3);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(-24, -5);
      ctx.lineTo(-12, 4);
      ctx.fill();
      ctx.restore();
    }
  }
}

function drawGranSasso(ctx: CanvasRenderingContext2D, cam: number) {
  const s = -cam * 0.12;
  ctx.fillStyle = "#4d5a62";
  ctx.beginPath();
  ctx.moveTo(-200 + s, GROUND - 36);
  ctx.lineTo(40 + s, GROUND - 70);
  ctx.lineTo(260 + s, GROUND - 150);
  ctx.lineTo(430 + s, GROUND - 248);
  ctx.lineTo(540 + s, GROUND - 168);
  ctx.lineTo(690 + s, GROUND - 214);
  ctx.lineTo(980 + s, GROUND - 54);
  ctx.lineTo(1300 + s, GROUND - 28);
  ctx.lineTo(-200 + s, GROUND - 28);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#e6e1d8";
  ctx.beginPath();
  ctx.moveTo(340 + s, GROUND - 186);
  ctx.lineTo(430 + s, GROUND - 248);
  ctx.lineTo(500 + s, GROUND - 176);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(600 + s, GROUND - 164);
  ctx.lineTo(690 + s, GROUND - 214);
  ctx.lineTo(770 + s, GROUND - 150);
  ctx.closePath();
  ctx.fill();
}

function drawTown(ctx: CanvasRenderingContext2D, cam: number) {
  const span = 22 * 210;
  for (const house of HOUSES) {
    let x = house.x - cam * 0.38;
    x = ((x % span) + span) % span - 80;
    ctx.fillStyle = "#8d7362";
    ctx.fillRect(x, GROUND - 48 - house.h, house.w, house.h);
    ctx.fillStyle = "#7a4034";
    ctx.beginPath();
    ctx.moveTo(x - 8, GROUND - 48 - house.h);
    ctx.lineTo(x + house.w / 2, GROUND - 48 - house.h - house.roof);
    ctx.lineTo(x + house.w + 8, GROUND - 48 - house.h);
    ctx.closePath();
    ctx.fill();
    for (let wy = GROUND - 36 - house.h; wy < GROUND - 64; wy += 22) {
      for (let wx = x + 12; wx < x + house.w - 14; wx += 20) {
        if (((wx + wy) & 24) > 10) {
          ctx.fillStyle = ((wx / 20 + wy) & 3) === 0 ? "#f0c27a" : "rgba(232, 214, 180, 0.35)";
          ctx.fillRect(wx, wy, 8, 12);
        }
      }
    }
  }
}

function drawTower(ctx: CanvasRenderingContext2D, x: number) {
  if (x < -80 || x > VIEW_W + 80) return;
  ctx.fillStyle = "#c4a48e";
  ctx.fillRect(x, GROUND - 230, 46, 200);
  ctx.fillStyle = "#6e5144";
  ctx.beginPath();
  ctx.moveTo(x - 6, GROUND - 230);
  ctx.lineTo(x + 23, GROUND - 268);
  ctx.lineTo(x + 52, GROUND - 230);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#2a2420";
  ctx.beginPath();
  ctx.arc(x + 23, GROUND - 188, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#e7e4de";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 23, GROUND - 194);
  ctx.lineTo(x + 23, GROUND - 182);
  ctx.moveTo(x + 23, GROUND - 188);
  ctx.lineTo(x + 29, GROUND - 188);
  ctx.stroke();
}

function drawFort(ctx: CanvasRenderingContext2D, x: number) {
  if (x < -260 || x > VIEW_W + 40) return;
  ctx.fillStyle = "#b08970";
  ctx.beginPath();
  ctx.moveTo(x, GROUND - 90);
  ctx.lineTo(x + 70, GROUND - 130);
  ctx.lineTo(x + 150, GROUND - 90);
  ctx.lineTo(x + 150, GROUND - 20);
  ctx.lineTo(x, GROUND - 20);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#c4a48e";
  ctx.fillRect(x + 36, GROUND - 150, 78, 70);
  ctx.fillStyle = "#3a302c";
  ctx.fillRect(x + 66, GROUND - 78, 18, 48);
  ctx.fillRect(x + 52, GROUND - 128, 14, 18);
  ctx.fillRect(x + 84, GROUND - 128, 14, 18);
}

function drawLiberamia(ctx: CanvasRenderingContext2D, x: number) {
  if (x < -420 || x > VIEW_W + 20) return;
  ctx.fillStyle = "#e39a3a";
  ctx.fillRect(x, GROUND - 210, 360, 210);
  ctx.fillStyle = "#f4efe6";
  ctx.fillRect(x + 110, GROUND - 168, 140, 28);
  ctx.fillStyle = "#1c140e";
  ctx.font = "16px sans-serif";
  ctx.fillText("LIBERAMIA", x + 128, GROUND - 148);
  ctx.fillStyle = "#2a241c";
  ctx.fillRect(x + 124, GROUND - 130, 112, 130);
  for (const [cx, color] of [[36, "#e23b3b"], [78, "#f2d234"], [250, "#7d5cff"], [300, "#3fbf62"]] as const) {
    ctx.fillStyle = color;
    ctx.fillRect(x + cx, GROUND - 46, 22, 28);
    ctx.fillStyle = "#f7f4ee";
    ctx.beginPath();
    ctx.arc(x + cx + 18, GROUND - 28, 12, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFountain(ctx: CanvasRenderingContext2D, x: number) {
  if (x < -340 || x > VIEW_W + 20) return;
  ctx.fillStyle = "#d5c3b0";
  ctx.fillRect(x, GROUND - 78, 300, 52);
  ctx.fillStyle = "#8d7464";
  for (let i = 0; i < 9; i++) {
    const ax = x + 16 + i * 32;
    ctx.beginPath();
    ctx.arc(ax, GROUND - 52, 10, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = "rgba(170, 198, 206, 0.55)";
    ctx.fillRect(ax - 1, GROUND - 50, 2, 22);
    ctx.fillStyle = "#8d7464";
  }
  ctx.fillStyle = "#6e8f96";
  ctx.fillRect(x + 8, GROUND - 28, 284, 10);
}

function drawCollemaggio(ctx: CanvasRenderingContext2D, x: number) {
  if (x < -280 || x > VIEW_W + 40) return;
  const bands = ["#f3efe8", "#d7a394"];
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = bands[i % 2];
    ctx.fillRect(x, GROUND - 36 - (i + 1) * 18, 220, 18);
  }
  ctx.fillStyle = "#f3efe8";
  ctx.fillRect(x + 78, GROUND - 214, 64, 36);
  ctx.beginPath();
  ctx.moveTo(x + 70, GROUND - 214);
  ctx.lineTo(x + 110, GROUND - 248);
  ctx.lineTo(x + 150, GROUND - 214);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#2c2420";
  ctx.beginPath();
  ctx.arc(x + 110, GROUND - 132, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#f3efe8";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x + 110, GROUND - 132, 16, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#3a302c";
  ctx.fillRect(x + 92, GROUND - 78, 36, 48);
}

function drawFinish(ctx: CanvasRenderingContext2D, x: number) {
  if (x < -20 || x > VIEW_W + 20) return;
  ctx.fillStyle = "#2a2420";
  ctx.fillRect(x, GROUND - 150, 6, 120);
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = i % 2 === 0 ? "#f3efe8" : "#2a2420";
    ctx.fillRect(x + 6, GROUND - 150 + i * 10, 28, 10);
  }
}

function smooth(u: number) {
  const x = Math.min(1, Math.max(0, u));
  return x * x * (3 - 2 * x);
}

function drawFinale(
  ctx: CanvasRenderingContext2D,
  sim: Sim,
  frames: HTMLImageElement[],
  cam: number,
) {
  const t = sim.time - sim.wonAt;
  const hold = 0.42;
  const last = frames.length - 1;
  const index = Math.min(last, Math.floor(t / hold));
  const next = Math.min(last, index + 1);
  const u = index < last ? t / hold - index : 1;
  const blend = index < last && u > 0.7 ? smooth((u - 0.7) / 0.3) : 0;
  const zoom = 1 + smooth(Math.min(1, t / 2.4)) * 0.08;
  const bob = Math.sin(t * 2.2) * 1.6;
  const size = 200;
  const tips: Array<[number, number] | null> = [
    null,
    null,
    null,
    null,
    null,
    [0.63, 0.3],
    [0.65, 0.31],
    [0.609, 0.272],
  ];
  const localTip = (frame: number) => {
    const tip = tips[frame];
    if (!tip) return null;
    return { x: -size / 2 + tip[0] * size, y: -size + tip[1] * size };
  };
  const a = localTip(index);
  const b = localTip(next);
  const tip = a && b ? { x: a.x + (b.x - a.x) * blend, y: a.y + (b.y - a.y) * blend } : (b ?? a);
  ctx.save();
  ctx.translate(sim.x - cam, sim.y - bob);
  ctx.scale(zoom, zoom);
  const paint = (img: HTMLImageElement | undefined, alpha: number) => {
    if (!img || alpha <= 0.02) return;
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, -size / 2, -size, size, size);
  };
  paint(frames[index], 1 - blend);
  if (next !== index) paint(frames[next], blend);
  ctx.globalAlpha = 1;
  if (tip && index >= 5) {
    const glow = index === 6 ? 0.85 : 0.45;
    const light = ctx.createRadialGradient(tip.x, tip.y, 2, tip.x, tip.y, 36);
    light.addColorStop(0, `rgba(255, 190, 70, ${glow})`);
    light.addColorStop(1, "rgba(255, 120, 30, 0)");
    ctx.fillStyle = light;
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 36, 0, Math.PI * 2);
    ctx.fill();
    if (index < 7) {
      for (let i = 0; i < 7; i++) {
        const age = (t * 2.4 + i * 0.17) % 1;
        const ang = -Math.PI * 0.55 + (i - 3) * 0.28;
        ctx.globalAlpha = (1 - age) * 0.9;
        ctx.fillStyle = i % 2 === 0 ? "#ffe08a" : "#ff7a32";
        ctx.beginPath();
        ctx.arc(tip.x + Math.cos(ang) * age * 18, tip.y + Math.sin(ang) * age * 16, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    for (let i = 0; i < 6; i++) {
      const age = (t * 0.55 + i * 0.16) % 1;
      ctx.globalAlpha = (1 - age) * 0.55;
      ctx.fillStyle = i % 2 === 0 ? "#f7f4ee" : "#d5cfc4";
      ctx.beginPath();
      ctx.arc(tip.x + age * 6, tip.y - age * 28, 2.4 + age * 7, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawSmoke(ctx: CanvasRenderingContext2D, sim: Sim, cam: number) {
  const t = sim.time - sim.wonAt;
  const tipX = sim.x - cam + 52;
  const tipY = sim.y - 124;
  if (t > 1.75) {
    const glow = t < 2.15 ? (t - 1.75) / 0.4 : Math.max(0.45, 1 - (t - 2.15) * 0.12);
    const light = ctx.createRadialGradient(tipX, tipY, 2, tipX, tipY, 150);
    light.addColorStop(0, `rgba(255, 176, 64, ${0.7 * glow})`);
    light.addColorStop(0.45, `rgba(255, 90, 30, ${0.22 * glow})`);
    light.addColorStop(1, "rgba(255, 80, 20, 0)");
    ctx.fillStyle = light;
    ctx.fillRect(tipX - 160, tipY - 160, 320, 280);
  }
  if (t > 1.85 && t < 3.3) {
    for (let i = 0; i < 12; i++) {
      const age = ((t - 1.85) * 1.3 + i * 0.15) % 1;
      const ang = -Math.PI * 0.15 - (i / 12) * Math.PI * 0.9;
      ctx.globalAlpha = (1 - age) * 0.85;
      ctx.fillStyle = i % 3 === 0 ? "#ffe08a" : "#ff7a32";
      ctx.beginPath();
      ctx.arc(tipX + Math.cos(ang) * age * 70, tipY + Math.sin(ang) * age * 48, 2.2 + (1 - age) * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  if (t < 2.55) return;
  for (let i = 0; i < 8; i++) {
    const age = (t * 0.32 + i * 0.13) % 1;
    ctx.globalAlpha = (1 - age) * 0.5;
    ctx.fillStyle = i % 2 === 0 ? "#f7f3ec" : "#c9c2b6";
    ctx.beginPath();
    ctx.arc(tipX + Math.sin(t + i) * 10 + age * 18, tipY - age * 64, 5 + age * 16, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
