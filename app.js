const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const scoreEl = document.querySelector("#score");
const bestEl = document.querySelector("#best");
const worldNameEl = document.querySelector("#worldName");
const animalNameEl = document.querySelector("#animalName");
const livesEl = document.querySelector("#lives");
const rankEl = document.querySelector("#rank");
const jumpButton = document.querySelector("#jumpButton");
const goButton = document.querySelector("#goButton");
const pauseButton = document.querySelector("#pauseButton");
const restartButton = document.querySelector("#restartButton");
const stopButton = document.querySelector("#stopButton");

const worlds = [
  {
    name: "Livello 1",
    subtitle: "Grand Prix 8-bit: fieno, sponsor e dignita incerta",
    quality: "pixel",
    sky: ["#111a4f", "#273477", "#1b2140"],
    ground: "#2f6b2f",
    line: "#d6f15b",
    obstacle: "#e05c2b",
    trap: "#0b1027",
    accent: "#ffe45f",
    music: [196, 247, 262, 330, 262, 247],
  },
  {
    name: "Livello 2",
    subtitle: "Circuito arcade: curva del fieno obbligatoria",
    quality: "sprite",
    sky: ["#2770a8", "#46a1bc", "#244c58"],
    ground: "#3f8d4d",
    line: "#d8ef70",
    obstacle: "#8d5a2b",
    trap: "#27313f",
    accent: "#ffdf6f",
    music: [220, 277, 330, 370, 440, 370, 330, 277],
  },
  {
    name: "Livello 3",
    subtitle: "Arena lucida: giudici con occhiali enormi",
    quality: "cartoon",
    sky: ["#78bde8", "#c3d974", "#587343"],
    ground: "#598c42",
    line: "#e8ff9e",
    obstacle: "#9c6a3b",
    trap: "#32404a",
    accent: "#ffffff",
    music: [262, 330, 392, 494, 523, 494, 392, 330],
  },
  {
    name: "Livello 4",
    subtitle: "Grand Prix fantasy: tribune, torri e protocolli assurdi",
    quality: "painted",
    sky: ["#3d4965", "#6b7f83", "#29332d"],
    ground: "#48593e",
    line: "#c2d6b0",
    obstacle: "#6a5142",
    trap: "#171a22",
    accent: "#d3edf0",
    music: [147, 196, 220, 294, 349, 392, 349, 294],
  },
  {
    name: "Livello 5",
    subtitle: "Finale fotorealistico: show jumping apocalittico",
    quality: "cinematic",
    sky: ["#8597a5", "#d8c49a", "#4b524c"],
    ground: "#4e5b48",
    line: "#f2e2ad",
    obstacle: "#4a413b",
    trap: "#0d0e10",
    accent: "#fff4cb",
    music: [110, 147, 165, 220, 294, 330, 440, 330],
  },
];

const animals = [
  { name: "Pulce con curriculum", size: 0.38, jump: 600, color: "#9e6f49", legs: 6, type: "tiny" },
  { name: "Gatto offeso", size: 0.48, jump: 650, color: "#d8994f", legs: 4, type: "cat" },
  { name: "Cane stagista", size: 0.58, jump: 675, color: "#b77845", legs: 4, type: "dog" },
  { name: "Vitello dubbioso", size: 0.72, jump: 710, color: "#d7c4ad", legs: 4, type: "calf" },
  { name: "Somarello manager", size: 0.84, jump: 735, color: "#9b9a8a", legs: 4, type: "donkey" },
  { name: "Cavallino medio", size: 1, jump: 780, color: "#b87342", legs: 4, type: "horse" },
  { name: "Cavallone gonfio", size: 1.16, jump: 820, color: "#7b4b31", legs: 4, type: "horse" },
  { name: "Unicorno fiscale", size: 1.22, jump: 850, color: "#f1edf2", legs: 4, type: "unicorn" },
  { name: "Ippogrifo perplesso", size: 1.35, jump: 890, color: "#c9b38d", legs: 4, type: "winged" },
  { name: "Drago da cortile", size: 1.55, jump: 940, color: "#4c9a69", legs: 4, type: "dragon" },
  { name: "Drago CEO", size: 1.76, jump: 980, color: "#233f35", legs: 4, type: "dragon" },
];

const goodMessages = [
  "Salto perfetto",
  "Eleganza discutibile",
  "Zoccolo certificato",
  "Atterraggio quasi legale",
];

const okMessages = [
  "Passa, ma il pubblico tossisce",
  "Salto accettabile per un martedi",
  "Nessuno ha visto niente",
];

const badMessages = [
  "Timing sbagliato",
  "Saltometro in sciopero",
  "La fisica presenta reclamo",
  "L'ostacolo vince ai punti",
];

const state = {
  best: Number(localStorage.getItem("bestia-salta-best") || 0),
  flash: "",
  flashTimer: 0,
  gameOver: false,
  awaitingGo: false,
  lastTime: 0,
  lives: 3,
  paused: false,
  score: 0,
  shake: 0,
  started: false,
  stepDistance: 0,
  transitionDir: 0,
  transitionName: "",
  transitionTimer: 0,
  worldIndex: 0,
};

const audio = {
  context: null,
  enabled: false,
  master: null,
  musicGain: null,
  nextBeat: 0,
  beat: 0,
};

const world = {
  decorations: [
    { x: 90, y: 120, size: 28, speed: 15 },
    { x: 430, y: 88, size: 20, speed: 11 },
    { x: 760, y: 148, size: 34, speed: 19 },
  ],
  groundY: 420,
  hazards: [],
  nextSetDistance: 0,
  particles: [],
};

const player = {
  h: 58,
  jumpBuffer: 0,
  onGround: true,
  rank: 5,
  vy: 0,
  w: 74,
  x: 138,
  y: 362,
};

let distance = 0;

function currentAnimal() {
  return animals[player.rank];
}

function currentWorld() {
  return worlds[state.worldIndex];
}

function animalHeight() {
  return Math.round(58 * currentAnimal().size);
}

function animalWidth() {
  return Math.round(74 * currentAnimal().size);
}

function setPlayerSize() {
  player.w = animalWidth();
  player.h = animalHeight();
  player.y = Math.min(player.y, world.groundY - player.h);
  if (player.onGround) player.y = world.groundY - player.h;
}

function resetGame() {
  state.flash = "Cavallino medio: reputazione fragile";
  state.flashTimer = 1.8;
  state.awaitingGo = false;
  state.gameOver = false;
  state.lastTime = 0;
  state.lives = 3;
  state.paused = false;
  state.score = 0;
  state.shake = 0;
  state.stepDistance = 0;
  state.started = true;
  state.transitionDir = 0;
  state.transitionName = "";
  state.transitionTimer = 0;
  state.worldIndex = 0;
  audio.beat = 0;
  audio.nextBeat = 0;
  player.jumpBuffer = 0;
  player.onGround = true;
  player.rank = 5;
  player.vy = 0;
  distance = 0;
  world.hazards = [];
  world.nextSetDistance = 230;
  world.particles = [];
  setPlayerSize();
  pauseButton.textContent = "Pausa";
  pauseButton.setAttribute("aria-pressed", "false");
  syncControls();
  updateHud();
}

function updateHud() {
  scoreEl.textContent = Math.floor(state.score);
  bestEl.textContent = state.best;
  worldNameEl.textContent = currentWorld().name;
  animalNameEl.textContent = currentAnimal().name;
  livesEl.textContent = `x${state.lives}`;
  rankEl.textContent = `${player.rank + 1}/${animals.length}`;
}

function requestJump() {
  if (state.awaitingGo) return;
  startAudio();
  if (!state.started || state.gameOver) {
    resetGame();
  }
  player.jumpBuffer = 0.12;
}

function stopGame() {
  state.awaitingGo = false;
  state.flash = "";
  state.flashTimer = 0;
  state.gameOver = false;
  state.paused = false;
  state.started = false;
  state.transitionDir = 0;
  state.transitionName = "";
  state.transitionTimer = 0;
  world.hazards = [];
  world.particles = [];
  player.jumpBuffer = 0;
  player.vy = 0;
  player.onGround = true;
  setPlayerSize();
  pauseButton.textContent = "Pausa";
  pauseButton.setAttribute("aria-pressed", "false");
  syncControls();
  updateHud();
}

function continueWorld() {
  if (!state.awaitingGo) return;
  startAudio();
  state.awaitingGo = false;
  state.flash = `Via: ${currentWorld().name}`;
  state.flashTimer = 0.9;
  state.transitionTimer = 0;
  state.transitionDir = 0;
  state.transitionName = "";
  state.stepDistance = 0;
  world.hazards = [];
  world.nextSetDistance = distance + 245;
  player.jumpBuffer = 0;
  player.vy = 0;
  player.onGround = true;
  setPlayerSize();
  syncControls();
}

function syncControls() {
  goButton.hidden = !state.awaitingGo;
  jumpButton.disabled = state.awaitingGo || state.paused;
  pauseButton.disabled = !state.started || state.gameOver || state.awaitingGo;
}

function jump() {
  const animal = currentAnimal();
  player.vy = -animal.jump;
  player.onGround = false;
  player.jumpBuffer = 0;

  addParticles(player.x + player.w * 0.38, world.groundY - 4, currentWorld().accent, 8);
  playJumpSound();
  judgeJumpTiming();
}

function judgeJumpTiming() {
  const obstacle = world.hazards.find((hazard) => hazard.kind === "obstacle" && !hazard.resolved);
  if (!obstacle) return;

  const animal = currentAnimal();
  const takeoff = player.x + player.w;
  const target = obstacle.x + obstacle.w * 0.25;
  const distanceToTarget = target - takeoff;
  const goodWindow = 76 + animal.size * 28;
  const okWindow = 132 + animal.size * 34;

  if (Math.abs(distanceToTarget) <= goodWindow) {
    obstacle.resolved = true;
    obstacle.judgement = "perfect";
    evolve(1, pick(goodMessages));
    state.score += 90 + state.worldIndex * 20 + player.rank * 2;
  } else if (Math.abs(distanceToTarget) <= okWindow) {
    obstacle.resolved = true;
    obstacle.judgement = "ok";
    state.flash = pick(okMessages);
    state.flashTimer = 0.9;
    state.score += 35 + state.worldIndex * 8;
  } else {
    obstacle.resolved = true;
    obstacle.judgement = "miss";
    evolve(-1, pick(badMessages));
    state.score = Math.max(0, state.score - 30);
  }
}

function evolve(delta, message) {
  player.rank += delta;
  let worldShift = 0;

  if (player.rank >= animals.length) {
    if (state.worldIndex < worlds.length - 1) {
      state.worldIndex += 1;
      worldShift = 1;
      player.rank = 5;
      state.lives = Math.min(5, state.lives + 1);
      state.flash = `Promozione assurda: ${currentWorld().name}`;
      state.score += 250;
    } else {
      player.rank = animals.length - 1;
      state.flash = "Creatura leggendaria con ricevuta";
      state.score += 160;
    }
  } else if (player.rank < 0) {
    if (state.worldIndex > 0) {
      state.worldIndex -= 1;
      worldShift = -1;
      player.rank = 5;
      state.flash = `Retrocesso senza colloquio: ${currentWorld().name}`;
      state.lives = Math.max(1, state.lives - 1);
    } else {
      player.rank = 0;
      loseLife("Troppo piccolo per l'ostacolo, troppo grande per l'orgoglio");
    }
  } else {
    state.flash = `${message}: ${currentAnimal().name}`;
  }

  state.flashTimer = 1.25;
  setPlayerSize();
  addParticles(player.x + player.w / 2, player.y + player.h / 2, currentWorld().accent, 18);
  if (worldShift !== 0) celebrateWorldChange(worldShift);
}

function loseLife(message) {
  state.lives -= 1;
  state.flash = `${message}: -1 vita`;
  state.flashTimer = 1.2;
  state.shake = 12;
  addParticles(player.x + player.w / 2, player.y + player.h / 2, "#f06449", 22);
  playThudSound();

  if (state.lives <= 0) {
    endGame();
  }
}

function spawnSet() {
  const animal = currentAnimal();
  const obstacleH = 32 + animal.size * 34 + state.worldIndex * 5;
  const obstacleW = 22 + animal.size * 20;
  const x = canvas.width + 40;

  world.hazards.push({
    h: obstacleH,
    judgement: "",
    kind: "obstacle",
    resolved: false,
    w: obstacleW,
    x,
    y: world.groundY - obstacleH,
  });

  world.hazards.push({
    h: 18,
    kind: "trap",
    triggered: false,
    w: 54 + animal.size * 16,
    x: x + 245 + Math.random() * 90,
    y: world.groundY - 8,
  });
}

function update(dt) {
  if (state.awaitingGo) {
    state.transitionTimer = Math.max(0, state.transitionTimer - dt);
    return;
  }

  if (!state.started || state.paused || state.gameOver) return;

  const speed = 330 + state.worldIndex * 38 + player.rank * 5;
  const movement = speed * dt;
  distance += movement;
  state.stepDistance += movement;
  state.score += dt * (15 + state.worldIndex * 3 + player.rank * 0.6);
  state.flashTimer = Math.max(0, state.flashTimer - dt);
  state.transitionTimer = Math.max(0, state.transitionTimer - dt);
  updateMusic();

  player.jumpBuffer = Math.max(0, player.jumpBuffer - dt);
  if (player.jumpBuffer > 0 && player.onGround) jump();

  player.vy += 2080 * dt;
  player.y += player.vy * dt;

  if (player.y >= world.groundY - player.h) {
    const landed = !player.onGround;
    player.y = world.groundY - player.h;
    player.vy = 0;
    player.onGround = true;
    if (landed) playStepSound(0.8);
  } else {
    player.onGround = false;
  }

  const stepGap = Math.max(54, 112 - currentAnimal().size * 22);
  if (player.onGround && state.stepDistance >= stepGap) {
    state.stepDistance = 0;
    playStepSound(0.45);
  }

  if (distance >= world.nextSetDistance) {
    spawnSet();
    world.nextSetDistance = distance + 390 + Math.random() * 170 - state.worldIndex * 12;
  }

  for (const hazard of world.hazards) {
    hazard.x -= movement;
  }
  world.hazards = world.hazards.filter((hazard) => hazard.x + hazard.w > -80);

  for (const hazard of world.hazards) {
    if (hazard.kind === "obstacle" && !hazard.resolved && hazard.x + hazard.w < player.x - 10) {
      hazard.resolved = true;
      evolve(-1, "Ostacolo ignorato con troppa sicurezza");
    }

    if (hazard.kind === "trap" && !hazard.triggered && player.onGround && collides(hazard, 8)) {
      hazard.triggered = true;
      loseLife("Buco aziendale");
    }

    if (hazard.kind === "obstacle" && hazard.judgement !== "perfect" && collides(hazard, 10)) {
      hazard.resolved = true;
      hazard.judgement = "hit";
      evolve(-1, "Faccia contro arredamento");
      player.vy = -420;
    }
  }

  for (const decoration of world.decorations) {
    decoration.x -= decoration.speed * dt * (1 + state.worldIndex * 0.08);
    if (decoration.x < -90) decoration.x = canvas.width + 90;
  }

  for (const particle of world.particles) {
    particle.life -= dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
  }
  world.particles = world.particles.filter((particle) => particle.life > 0);
  state.shake = Math.max(0, state.shake - dt * 18);
  updateHud();
}

function collides(hazard, pad) {
  return (
    player.x + pad < hazard.x + hazard.w &&
    player.x + player.w - pad > hazard.x &&
    player.y + pad < hazard.y + hazard.h &&
    player.y + player.h - pad > hazard.y
  );
}

function addParticles(x, y, color, count) {
  for (let i = 0; i < count; i += 1) {
    world.particles.push({
      color,
      life: 0.35 + Math.random() * 0.45,
      r: 2 + Math.random() * 5,
      vx: -160 + Math.random() * 260,
      vy: -140 + Math.random() * 160,
      x,
      y,
    });
  }
}

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function startAudio() {
  if (audio.enabled) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  audio.context = new AudioContext();
  audio.master = audio.context.createGain();
  audio.musicGain = audio.context.createGain();
  audio.master.gain.value = 0.24;
  audio.musicGain.gain.value = 0.07;
  audio.musicGain.connect(audio.master);
  audio.master.connect(audio.context.destination);
  audio.enabled = true;

  if (audio.context.state === "suspended") {
    audio.context.resume();
  }
}

function playTone(freq, duration, type, gain, destination = audio.master, delay = 0) {
  if (!audio.enabled || !audio.context) return;
  const now = audio.context.currentTime + delay;
  const oscillator = audio.context.createOscillator();
  const envelope = audio.context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(freq, now);
  envelope.gain.setValueAtTime(0.0001, now);
  envelope.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), now + 0.015);
  envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  oscillator.connect(envelope);
  envelope.connect(destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.03);
}

function playNoise(duration, gain, delay = 0) {
  if (!audio.enabled || !audio.context) return;
  const now = audio.context.currentTime + delay;
  const buffer = audio.context.createBuffer(1, audio.context.sampleRate * duration, audio.context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }

  const source = audio.context.createBufferSource();
  const envelope = audio.context.createGain();
  source.buffer = buffer;
  envelope.gain.setValueAtTime(gain, now);
  envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  source.connect(envelope);
  envelope.connect(audio.master);
  source.start(now);
}

function updateMusic() {
  if (!audio.enabled || !audio.context || !state.started || state.gameOver || state.paused || state.awaitingGo) return;
  const now = audio.context.currentTime;
  if (now < audio.nextBeat) return;

  const theme = currentWorld();
  const note = theme.music[audio.beat % theme.music.length];
  const beatInBar = audio.beat % 8;
  const octave = beatInBar === 3 || beatInBar === 7 ? 2 : 1;
  const type = getLeadWave(theme.quality);
  const tempo = Math.max(0.2, 0.42 - state.worldIndex * 0.035);

  playTone(note * octave, 0.16 + state.worldIndex * 0.015, type, 0.7, audio.musicGain);

  if (beatInBar % 2 === 0) {
    playTone(note / 2, 0.24, "sine", 0.34, audio.musicGain);
  }

  if (state.worldIndex >= 2 && beatInBar % 4 === 0) {
    playTone(note * 1.5, 0.32, "triangle", 0.22, audio.musicGain, 0.015);
    playTone(note * 2, 0.28, "sine", 0.16, audio.musicGain, 0.04);
  }

  if (state.worldIndex >= 3 && beatInBar === 6) {
    playTone(note * 2.5, 0.45, "sine", 0.12, audio.musicGain, 0.02);
  }

  if (beatInBar === 0 || beatInBar === 4) playNoise(0.035, 0.012 + state.worldIndex * 0.003);
  if (beatInBar === 2 || beatInBar === 6) playTone(95 + state.worldIndex * 18, 0.035, "square", 0.025);

  audio.beat += 1;
  audio.nextBeat = now + tempo;
}

function getLeadWave(quality) {
  if (quality === "pixel") return "square";
  if (quality === "sprite") return "square";
  if (quality === "cartoon") return "triangle";
  if (quality === "painted") return "sine";
  return "sine";
}

function playJumpSound() {
  const base = 280 + currentAnimal().size * 95 + state.worldIndex * 25;
  playTone(base, 0.11, "square", 0.12);
  playTone(base * 1.8, 0.16, "triangle", 0.08, audio.master, 0.045);
}

function playStepSound(volume) {
  const animal = currentAnimal();
  const base = Math.max(70, 170 - animal.size * 42);
  playTone(base, 0.045, "square", 0.04 * volume);
  if (animal.size > 1.15) playNoise(0.035, 0.018 * volume);
}

function playThudSound() {
  playTone(82, 0.16, "sawtooth", 0.14);
  playNoise(0.12, 0.06);
}

function playWorldFanfare(direction) {
  const up = [392, 523, 659, 784, 1046];
  const down = [392, 330, 262, 196, 131];
  const notes = direction > 0 ? up : down;
  notes.forEach((note, index) => {
    playTone(note, 0.18, direction > 0 ? "square" : "sawtooth", 0.16, audio.master, index * 0.11);
  });
  playNoise(0.22, direction > 0 ? 0.045 : 0.03, 0.18);
}

function celebrateWorldChange(direction) {
  state.awaitingGo = true;
  state.transitionDir = direction;
  state.transitionName = currentWorld().name;
  state.transitionTimer = 999;
  state.shake = direction > 0 ? 7 : 13;
  player.vy = 0;
  player.onGround = true;
  setPlayerSize();
  world.hazards = [];
  world.nextSetDistance = distance + 245;
  syncControls();
  playWorldFanfare(direction);

  const color = direction > 0 ? currentWorld().accent : "#f06449";
  for (let i = 0; i < 54; i += 1) {
    addParticles(canvas.width / 2 + (Math.random() - 0.5) * 240, 170 + Math.random() * 120, color, 1);
  }
}

function endGame() {
  state.gameOver = true;
  state.awaitingGo = false;
  state.best = Math.max(state.best, Math.floor(state.score));
  localStorage.setItem("bestia-salta-best", String(state.best));
  syncControls();
  updateHud();
}

function draw() {
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (state.shake > 0) {
    ctx.translate((Math.random() - 0.5) * state.shake, (Math.random() - 0.5) * state.shake);
  }

  drawWorld();
  drawHazards();
  drawParticles();
  drawAnimal();
  drawTimingGuide();
  drawWorldTransition();
  drawOverlay();
  ctx.restore();
}

function drawWorld() {
  const theme = currentWorld();
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, theme.sky[0]);
  gradient.addColorStop(0.62, theme.sky[1]);
  gradient.addColorStop(1, theme.sky[2]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (theme.quality === "pixel") drawPixelBackdrop(theme);
  if (theme.quality === "sprite") drawSpriteBackdrop(theme);
  if (theme.quality === "cartoon") drawCartoonBackdrop(theme);
  if (theme.quality === "painted") drawPaintedBackdrop(theme);
  if (theme.quality === "cinematic") drawCinematicBackdrop(theme);

  drawGrandPrixVenue(theme);
  drawGroundDetail(theme);
  ctx.strokeStyle = theme.line;
  ctx.lineWidth = theme.quality === "pixel" ? 6 : 4;
  ctx.beginPath();
  ctx.moveTo(0, world.groundY + 1);
  ctx.lineTo(canvas.width, world.groundY + 1);
  ctx.stroke();

  const stripe = (distance * 0.38) % 74;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
  ctx.lineWidth = 2;
  for (let x = -stripe; x < canvas.width; x += 74) {
    ctx.beginPath();
    ctx.moveTo(x, world.groundY + 48);
    ctx.lineTo(x + 36, world.groundY + 48);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.font = "700 18px Arial";
  ctx.textAlign = "left";
  ctx.fillText(theme.subtitle, 24, 38);
}

function drawGroundDetail(theme) {
  const groundShade = ctx.createLinearGradient(0, world.groundY, 0, canvas.height);
  groundShade.addColorStop(0, theme.quality === "pixel" ? "rgba(255, 229, 135, 0.18)" : "rgba(255, 255, 255, 0.16)");
  groundShade.addColorStop(1, "rgba(0, 0, 0, 0.24)");
  ctx.fillStyle = groundShade;
  ctx.fillRect(0, world.groundY, canvas.width, canvas.height - world.groundY);

  const offset = (distance * (0.42 + state.worldIndex * 0.05)) % 64;
  ctx.strokeStyle = theme.quality === "cinematic" ? "rgba(255, 244, 203, 0.22)" : "rgba(255, 255, 255, 0.16)";
  ctx.lineWidth = theme.quality === "pixel" ? 4 : theme.quality === "sprite" ? 3 : 2;
  for (let x = -offset; x < canvas.width + 64; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, world.groundY + 24);
    ctx.quadraticCurveTo(x + 24, world.groundY + 12, x + 64, world.groundY + 24);
    ctx.stroke();
  }

  drawCourseMarkers(theme);
}

function drawGrandPrixVenue(theme) {
  const isPixel = theme.quality === "pixel";
  const trackTop = world.groundY - 18;
  const track = ctx.createLinearGradient(0, trackTop, 0, canvas.height);
  track.addColorStop(0, isPixel ? "#7b8f3f" : lighten(theme.ground, 0.12));
  track.addColorStop(0.22, isPixel ? "#c79b4a" : "#b89158");
  track.addColorStop(1, isPixel ? "#6d4a28" : "#5d432e");
  ctx.fillStyle = track;
  ctx.fillRect(0, trackTop, canvas.width, canvas.height - trackTop);

  drawGrandPrixRails(theme, trackTop);
  drawGrandPrixStands(theme);
  drawGrandPrixScoreboard(theme);
}

function drawGrandPrixRails(theme, trackTop) {
  const railY = trackTop - 18;
  const offset = (distance * 0.2) % 88;
  ctx.save();
  ctx.strokeStyle = theme.quality === "pixel" ? "#f5f1e8" : "rgba(245, 241, 232, 0.86)";
  ctx.lineWidth = theme.quality === "pixel" ? 5 : 4;
  ctx.beginPath();
  ctx.moveTo(0, railY);
  ctx.lineTo(canvas.width, railY);
  ctx.moveTo(0, railY + 22);
  ctx.lineTo(canvas.width, railY + 22);
  ctx.stroke();

  ctx.fillStyle = theme.quality === "pixel" ? "#f5f1e8" : "rgba(245, 241, 232, 0.92)";
  for (let x = -offset; x < canvas.width + 40; x += 88) {
    if (theme.quality === "pixel") {
      ctx.fillRect(Math.round(x), railY - 8, 8, 38);
    } else {
      roundRect(x, railY - 10, 8, 42, 3);
      ctx.fill();
    }
  }

  ctx.strokeStyle = theme.quality === "cinematic" ? "rgba(255, 244, 203, 0.28)" : "rgba(255, 255, 255, 0.18)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, world.groundY + 86);
  ctx.lineTo(canvas.width, world.groundY + 54);
  ctx.stroke();
  ctx.restore();
}

function drawGrandPrixStands(theme) {
  const offset = (distance * 0.018) % 360;
  const baseY = world.groundY - 74;
  ctx.save();
  for (let x = -offset; x < canvas.width + 360; x += 360) {
    const standX = x + 24;
    ctx.fillStyle = theme.quality === "pixel" ? "rgba(14,18,28,0.42)" : "rgba(18, 22, 28, 0.36)";
    ctx.fillRect(standX, baseY - 72, 250, 72);
    ctx.fillStyle = theme.quality === "pixel" ? "#d6f15b" : "rgba(255, 255, 255, 0.62)";
    for (let i = 0; i < 7; i += 1) {
      const rowY = baseY - 60 + i * 9;
      ctx.fillRect(standX + 12, rowY, 220 - i * 12, 3);
    }
    ctx.fillStyle = theme.accent;
    for (let i = 0; i < 18; i += 1) {
      const px = standX + 18 + i * 12;
      const py = baseY - 58 + (i % 5) * 11;
      if (theme.quality === "pixel") ctx.fillRect(px, py, 6, 6);
      else {
        ctx.beginPath();
        ctx.arc(px, py, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.restore();
}

function drawGrandPrixScoreboard(theme) {
  const boardX = 660;
  const boardY = 46;
  ctx.save();
  ctx.fillStyle = theme.quality === "pixel" ? "#101114" : "rgba(10, 12, 16, 0.72)";
  if (theme.quality === "pixel") {
    ctx.fillRect(boardX, boardY, 220, 62);
    ctx.fillStyle = theme.line;
    ctx.fillRect(boardX + 8, boardY + 8, 204, 8);
  } else {
    roundRect(boardX, boardY, 230, 70, 8);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.24)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.fillStyle = theme.accent;
  ctx.font = theme.quality === "pixel" ? "700 15px 'Courier New', monospace" : "700 16px Arial";
  ctx.textAlign = "center";
  ctx.fillText("BESTIA GRAND PRIX", boardX + 115, boardY + 34);
  ctx.fillStyle = "rgba(245, 241, 232, 0.88)";
  ctx.font = theme.quality === "pixel" ? "700 12px 'Courier New', monospace" : "700 12px Arial";
  ctx.fillText(`ROUND ${state.worldIndex + 1}  OSTACOLO: SI SPERA`, boardX + 115, boardY + 54);
  ctx.restore();
}

function drawCourseMarkers(theme) {
  const offset = (distance * 0.48) % 190;
  ctx.save();
  for (let x = canvas.width - offset; x > -80; x -= 190) {
    const y = world.groundY + 76;
    ctx.fillStyle = theme.quality === "pixel" ? "#f5f1e8" : "rgba(245, 241, 232, 0.92)";
    if (theme.quality === "pixel") {
      ctx.fillRect(Math.round(x), y - 24, 28, 24);
      ctx.fillRect(Math.round(x + 9), y, 10, 20);
    } else {
      roundRect(x, y - 28, 34, 28, 5);
      ctx.fill();
      ctx.fillRect(x + 14, y, 6, 24);
    }
    ctx.fillStyle = theme.trap;
    ctx.font = theme.quality === "pixel" ? "700 14px 'Courier New', monospace" : "700 15px Arial";
    ctx.textAlign = "center";
    ctx.fillText(String(((Math.floor((distance + x) / 190) % 9) + 1)), x + 17, y - 9);
  }
  ctx.restore();
}

function drawPixelBackdrop(theme) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  for (let y = 0; y < canvas.height; y += 12) {
    ctx.fillRect(0, y, canvas.width, 3);
  }

  ctx.fillStyle = theme.accent;
  ctx.fillRect(780, 70, 48, 48);
  ctx.fillStyle = "#ff7ac8";
  ctx.fillRect(808, 94, 8, 8);
  ctx.fillRect(824, 110, 8, 8);

  ctx.fillStyle = "rgba(0,0,0,0.24)";
  for (let x = 0; x < canvas.width; x += 48) {
    ctx.fillRect(x, world.groundY - 18, 24, 18);
  }

  for (const decoration of world.decorations) {
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.fillRect(Math.round(decoration.x / 8) * 8, Math.round(decoration.y / 8) * 8, 80, 16);
    ctx.fillRect(Math.round(decoration.x / 8) * 8 + 24, Math.round(decoration.y / 8) * 8 - 16, 40, 16);
  }

  ctx.fillStyle = "#f0c33c";
  ctx.font = "700 16px 'Courier New', monospace";
  ctx.fillText("INSERT FIENO", 36, 84);
}

function drawSpriteBackdrop(theme) {
  const parallax = (distance * 0.04) % canvas.width;
  ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
  for (let x = -parallax; x < canvas.width + 120; x += 120) {
    ctx.fillRect(x, 118, 64, 10);
    ctx.fillRect(x + 18, 106, 34, 10);
  }

  ctx.fillStyle = theme.accent;
  ctx.beginPath();
  ctx.arc(795, 84, 34, 0, Math.PI * 2);
  ctx.fill();

  drawHills("rgba(24, 66, 78, 0.68)", 302, 72, 0.05);
  drawHills("rgba(30, 96, 66, 0.66)", 344, 92, 0.12);
  drawArcadeTrees(0.22, "#215a37", "#5fb65c");
  drawArcadeTrees(0.36, "#2e6b3f", "#77d36b");
}

function drawCartoonBackdrop(theme) {
  const skyGlow = ctx.createLinearGradient(0, 80, 0, world.groundY);
  skyGlow.addColorStop(0, "rgba(255, 255, 255, 0.16)");
  skyGlow.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = skyGlow;
  ctx.fillRect(0, 0, canvas.width, world.groundY);

  ctx.fillStyle = theme.accent;
  ctx.beginPath();
  ctx.arc(795, 84, 36, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(795, 84, 52, 0.2, Math.PI * 1.25);
  ctx.stroke();

  for (const decoration of world.decorations) {
    ctx.fillStyle = "rgba(255,255,255,0.48)";
    ctx.beginPath();
    ctx.arc(decoration.x, decoration.y, decoration.size, 0, Math.PI * 2);
    ctx.arc(decoration.x + decoration.size, decoration.y + 8, decoration.size * 0.75, 0, Math.PI * 2);
    ctx.arc(decoration.x - decoration.size, decoration.y + 10, decoration.size * 0.65, 0, Math.PI * 2);
    ctx.fill();
  }
  drawHills("rgba(77, 144, 91, 0.52)", 322, 92, 0.08);
  drawHills("rgba(46, 100, 70, 0.58)", 362, 122, 0.18);
  drawCartoonFlowers();
}

function drawPaintedBackdrop(theme) {
  const twilight = ctx.createRadialGradient(705, 92, 10, 705, 92, 430);
  twilight.addColorStop(0, "rgba(211, 237, 240, 0.32)");
  twilight.addColorStop(0.48, "rgba(128, 113, 144, 0.16)");
  twilight.addColorStop(1, "rgba(15, 18, 24, 0)");
  ctx.fillStyle = twilight;
  ctx.fillRect(0, 0, canvas.width, world.groundY);

  const mist = ctx.createLinearGradient(0, 150, 0, world.groundY);
  mist.addColorStop(0, "rgba(255, 255, 255, 0)");
  mist.addColorStop(0.42, "rgba(210, 230, 232, 0.2)");
  mist.addColorStop(0.66, "rgba(110, 132, 150, 0.12)");
  mist.addColorStop(1, "rgba(255, 255, 255, 0)");

  drawHills("rgba(16, 21, 36, 0.82)", 244, 198, 0.025);
  drawHills("rgba(42, 51, 60, 0.7)", 302, 154, 0.07);
  drawHills("rgba(76, 77, 75, 0.58)", 358, 112, 0.16);
  drawDistantCastle();
  ctx.fillStyle = mist;
  ctx.fillRect(0, 120, canvas.width, world.groundY - 120);

  ctx.fillStyle = theme.accent;
  ctx.beginPath();
  ctx.arc(780, 92, 30, 0, Math.PI * 2);
  ctx.fill();
  drawMagicMotes();
  drawRuins();
  drawVignette(0.26);
}

function drawCinematicBackdrop(theme) {
  const skyMood = ctx.createLinearGradient(0, 0, canvas.width, world.groundY);
  skyMood.addColorStop(0, "rgba(32, 38, 45, 0.18)");
  skyMood.addColorStop(0.48, "rgba(255, 244, 203, 0.12)");
  skyMood.addColorStop(1, "rgba(11, 12, 13, 0.22)");
  ctx.fillStyle = skyMood;
  ctx.fillRect(0, 0, canvas.width, world.groundY);

  const glow = ctx.createRadialGradient(760, 96, 6, 760, 96, 180);
  glow.addColorStop(0, theme.accent);
  glow.addColorStop(0.28, "rgba(255, 244, 203, 0.42)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(520, 0, 360, 270);
  drawHills("rgba(22, 24, 23, 0.9)", 274, 194, 0.035);
  drawHills("rgba(60, 66, 60, 0.62)", 340, 142, 0.1);
  drawHills("rgba(104, 98, 82, 0.48)", 388, 92, 0.22);
  drawCinematicCloudBands();
  drawCinematicLightRays();
  drawLensFlare();
  drawForegroundGrass();
  drawFilmGrain();
  drawVignette(0.34);
}

function drawHills(color, baseY, height, drift = 0) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, world.groundY);
  const offset = (distance * drift) % 160;
  for (let x = -offset - 120; x <= canvas.width + 160; x += 120) {
    ctx.lineTo(x, baseY + Math.sin((x + distance * 0.01) * 0.01) * 20);
    ctx.lineTo(x + 60, baseY - height + Math.cos((x + distance * 0.02) * 0.009) * 16);
  }
  ctx.lineTo(canvas.width, world.groundY);
  ctx.closePath();
  ctx.fill();
}

function drawArcadeTrees(speed, trunk, leaves) {
  const offset = (distance * speed) % 160;
  for (let x = -offset; x < canvas.width + 120; x += 150) {
    ctx.fillStyle = trunk;
    ctx.fillRect(x + 32, world.groundY - 94, 16, 94);
    ctx.fillStyle = leaves;
    ctx.fillRect(x + 8, world.groundY - 128, 64, 24);
    ctx.fillRect(x, world.groundY - 104, 80, 24);
    ctx.fillRect(x + 18, world.groundY - 152, 44, 24);
  }
}

function drawCartoonFlowers() {
  const offset = (distance * 0.52) % 90;
  for (let x = -offset; x < canvas.width + 40; x += 90) {
    const y = world.groundY - 16 - Math.sin((x + distance) * 0.02) * 5;
    ctx.strokeStyle = "rgba(35, 82, 42, 0.8)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, world.groundY);
    ctx.lineTo(x + 5, y);
    ctx.stroke();
    ctx.fillStyle = x % 180 === 0 ? "#ff7ac8" : "#ffdf6f";
    ctx.beginPath();
    ctx.arc(x + 5, y, 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawRuins() {
  const offset = (distance * 0.07) % 280;
  ctx.fillStyle = "rgba(210, 218, 208, 0.22)";
  for (let x = canvas.width - offset; x > -260; x -= 280) {
    ctx.fillRect(x, world.groundY - 132, 22, 132);
    ctx.fillRect(x + 54, world.groundY - 112, 22, 112);
    ctx.fillRect(x - 8, world.groundY - 132, 98, 16);
    ctx.fillStyle = "rgba(15, 18, 21, 0.24)";
    ctx.fillRect(x + 11, world.groundY - 92, 42, 54);
    ctx.fillStyle = "rgba(210, 218, 208, 0.22)";
  }
}

function drawDistantCastle() {
  const offset = (distance * 0.035) % 520;
  const x = 610 - offset;
  ctx.fillStyle = "rgba(22, 26, 36, 0.42)";
  ctx.fillRect(x, 202, 128, 118);
  ctx.fillRect(x + 18, 162, 24, 158);
  ctx.fillRect(x + 86, 176, 26, 144);
  ctx.beginPath();
  ctx.moveTo(x + 18, 162);
  ctx.lineTo(x + 30, 126);
  ctx.lineTo(x + 42, 162);
  ctx.moveTo(x + 86, 176);
  ctx.lineTo(x + 99, 134);
  ctx.lineTo(x + 112, 176);
  ctx.fill();
}

function drawMagicMotes() {
  ctx.save();
  ctx.globalAlpha = 0.62;
  for (let i = 0; i < 22; i += 1) {
    const x = (i * 83 + distance * (0.08 + i * 0.002)) % canvas.width;
    const y = 115 + ((i * 47) % 230) + Math.sin(distance * 0.01 + i) * 9;
    const r = 1.4 + (i % 4) * 0.45;
    ctx.fillStyle = i % 3 === 0 ? "#d3edf0" : "rgba(255, 244, 203, 0.9)";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawCinematicCloudBands() {
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = "#fff4cb";
  const offset = (distance * 0.025) % 420;
  for (let x = -offset - 120; x < canvas.width + 240; x += 420) {
    ctx.beginPath();
    ctx.ellipse(x + 120, 118, 150, 16, -0.08, 0, Math.PI * 2);
    ctx.ellipse(x + 260, 152, 190, 20, 0.04, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawCinematicLightRays() {
  ctx.save();
  ctx.globalAlpha = 0.26;
  ctx.fillStyle = "#fff4cb";
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath();
    ctx.moveTo(742 + i * 18, 58);
    ctx.lineTo(510 + i * 84, world.groundY);
    ctx.lineTo(620 + i * 84, world.groundY);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawLensFlare() {
  ctx.save();
  ctx.globalAlpha = 0.4;
  const points = [
    [760, 96, 14],
    [705, 132, 7],
    [640, 176, 4],
    [560, 230, 9],
  ];
  for (const [x, y, r] of points) {
    const flare = ctx.createRadialGradient(x, y, 1, x, y, r * 3);
    flare.addColorStop(0, "rgba(255, 244, 203, 0.9)");
    flare.addColorStop(1, "rgba(255, 244, 203, 0)");
    ctx.fillStyle = flare;
    ctx.beginPath();
    ctx.arc(x, y, r * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawForegroundGrass() {
  const offset = (distance * 0.78) % 34;
  ctx.strokeStyle = "rgba(230, 224, 190, 0.38)";
  ctx.lineWidth = 2;
  for (let x = -offset; x < canvas.width + 20; x += 17) {
    const h = 16 + Math.sin(x * 0.17) * 8;
    ctx.beginPath();
    ctx.moveTo(x, world.groundY + 2);
    ctx.lineTo(x + 5, world.groundY - h);
    ctx.stroke();
  }
}

function drawFilmGrain() {
  ctx.save();
  ctx.globalAlpha = 0.045;
  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 90; i += 1) {
    const x = (i * 97 + Math.floor(distance)) % canvas.width;
    const y = (i * 53) % canvas.height;
    ctx.fillRect(x, y, 1.5, 1.5);
  }
  ctx.restore();
}

function drawVignette(strength) {
  const vignette = ctx.createRadialGradient(canvas.width / 2, canvas.height * 0.48, 120, canvas.width / 2, canvas.height * 0.5, canvas.width * 0.68);
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(1, `rgba(0, 0, 0, ${strength})`);
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawHazards() {
  const theme = currentWorld();
  for (const hazard of world.hazards) {
    if (hazard.kind === "trap") {
      ctx.fillStyle = hazard.triggered ? "#f06449" : theme.trap;
      ctx.beginPath();
      ctx.ellipse(hazard.x + hazard.w / 2, hazard.y + 8, hazard.w / 2, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
      ctx.fillRect(hazard.x + 10, hazard.y + 2, hazard.w - 20, 4);
      continue;
    }

    drawJumpObstacle(hazard, theme);
  }
}

function drawJumpObstacle(hazard, theme) {
  const pixel = theme.quality === "pixel";
  const cleared = hazard.judgement === "perfect";
  const railColor = cleared ? theme.line : theme.obstacle;
  const x = hazard.x;
  const y = hazard.y;
  const w = Math.max(hazard.w, 44);
  const h = hazard.h;
  const postW = pixel ? 8 : Math.max(7, w * 0.13);
  const leftPost = x - postW * 0.6;
  const rightPost = x + w - postW * 0.4;
  const railCount = state.worldIndex >= 3 ? 4 : 3;

  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
  ctx.beginPath();
  ctx.ellipse(x + w / 2, world.groundY + 5, w * 0.9, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  if (pixel) {
    ctx.fillStyle = "#f5f1e8";
    ctx.fillRect(Math.round(leftPost), Math.round(y), postW, h);
    ctx.fillRect(Math.round(rightPost), Math.round(y), postW, h);
    ctx.fillStyle = railColor;
    for (let i = 0; i < railCount; i += 1) {
      const railY = y + 8 + i * Math.max(9, h / (railCount + 0.4));
      ctx.fillRect(Math.round(x), Math.round(railY), w, 7);
      ctx.fillStyle = i % 2 === 0 ? theme.accent : railColor;
    }
    ctx.fillStyle = "#101114";
    ctx.fillRect(Math.round(x + w * 0.42), Math.round(y + h - 20), 22, 16);
    ctx.fillStyle = theme.accent;
    ctx.font = "700 12px 'Courier New', monospace";
    ctx.fillText(String((Math.floor((distance + x) / 390) % 9) + 1), x + w * 0.42 + 6, y + h - 8);
    ctx.restore();
    return;
  }

  const postGradient = ctx.createLinearGradient(0, y, 0, y + h);
  postGradient.addColorStop(0, "rgba(255, 255, 255, 0.94)");
  postGradient.addColorStop(1, "rgba(185, 190, 196, 0.88)");
  ctx.fillStyle = postGradient;
  roundRect(leftPost, y - 6, postW, h + 10, 4);
  ctx.fill();
  roundRect(rightPost, y - 6, postW, h + 10, 4);
  ctx.fill();

  for (let i = 0; i < railCount; i += 1) {
    const railY = y + 10 + i * Math.max(11, h / (railCount + 0.35));
    const railH = Math.max(7, h * 0.09);
    const railGradient = ctx.createLinearGradient(x, railY, x + w, railY + railH);
    const stripe = i % 2 === 0 ? theme.accent : railColor;
    railGradient.addColorStop(0, lighten(stripe, 0.2));
    railGradient.addColorStop(0.52, stripe);
    railGradient.addColorStop(1, darken(stripe, 0.28));
    ctx.fillStyle = railGradient;
    roundRect(x, railY, w, railH, railH / 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.fillRect(x + 8, railY + 2, w - 16, 2);
  }

  if (state.worldIndex >= 2) {
    ctx.fillStyle = "rgba(245, 241, 232, 0.9)";
    ctx.beginPath();
    ctx.moveTo(x + w * 0.18, world.groundY);
    ctx.lineTo(x + w * 0.36, y + h * 0.58);
    ctx.lineTo(x + w * 0.5, world.groundY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(10, 12, 16, 0.38)";
    ctx.fillRect(x + w * 0.27, y + h * 0.74, w * 0.16, 4);
  }

  ctx.fillStyle = theme.quality === "cinematic" ? "rgba(10, 12, 16, 0.78)" : "rgba(10, 12, 16, 0.64)";
  roundRect(x + w * 0.36, y + h - 23, 32, 22, 4);
  ctx.fill();
  ctx.fillStyle = theme.accent;
  ctx.font = "700 13px Arial";
  ctx.textAlign = "center";
  ctx.fillText(String((Math.floor((distance + x) / 390) % 9) + 1), x + w * 0.36 + 16, y + h - 8);

  if (state.worldIndex >= 3) {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(leftPost + postW / 2, y - 4);
    ctx.lineTo(x + w * 0.5, y - 22);
    ctx.lineTo(rightPost + postW / 2, y - 4);
    ctx.stroke();
  }
  ctx.restore();
}

function drawAnimal() {
  const animal = currentAnimal();
  const pixel = currentWorld().quality === "pixel";
  const lean = player.onGround ? 0 : Math.max(-0.18, Math.min(0.2, player.vy / 2300));

  ctx.save();
  ctx.translate(player.x + player.w / 2, player.y + player.h / 2);
  ctx.rotate(lean);
  ctx.scale(pixel ? 1 : 1, pixel ? 1 : 1);

  if (pixel || state.worldIndex < 2) {
    drawBody(animal, pixel);
    drawAnimalExtras(animal, pixel);
  } else {
    drawRealisticAnimal(animal);
  }
  ctx.restore();
}

function drawBody(animal, pixel) {
  const w = player.w;
  const h = player.h;
  const step = pixel ? 6 : 1;
  const bodyX = -w * 0.36;
  const bodyY = -h * 0.15;
  const bodyW = w * 0.66;
  const bodyH = h * 0.38;
  const headX = w * 0.18;
  const headY = -h * 0.35;
  const headW = w * 0.28;
  const headH = h * 0.28;

  ctx.fillStyle = animal.color;
  if (pixel) {
    block(bodyX, bodyY, bodyW, bodyH, step);
    block(headX, headY, headW, headH, step);
  } else {
    roundRect(bodyX, bodyY, bodyW, bodyH, 12);
    ctx.fill();
    roundRect(headX, headY, headW, headH, 10);
    ctx.fill();
  }

  ctx.fillStyle = darken(animal.color, 0.4);
  const legCount = animal.legs;
  for (let i = 0; i < legCount; i += 1) {
    const lx = bodyX + bodyW * (0.12 + i / Math.max(1, legCount - 1) * 0.76);
    const ly = bodyY + bodyH - 2;
    const phase = player.onGround && state.started && !state.paused && !state.awaitingGo
      ? Math.sin(distance * 0.16 + i * Math.PI)
      : 0;
    drawSimpleLeg(lx, ly, w, h, phase, pixel, step);
  }

  ctx.fillStyle = "#101114";
  ctx.fillRect(headX + headW * 0.64, headY + headH * 0.3, Math.max(3, w * 0.035), Math.max(3, h * 0.035));
  ctx.strokeStyle = darken(animal.color, 0.5);
  ctx.lineWidth = Math.max(3, w * 0.035);
  ctx.beginPath();
  ctx.moveTo(bodyX - w * 0.02, bodyY + bodyH * 0.2);
  ctx.lineTo(bodyX - w * 0.18, bodyY - h * 0.12);
  ctx.stroke();
}

function drawSimpleLeg(lx, ly, w, h, phase, pixel, step) {
  const legWidth = w * 0.055;
  const upper = h * 0.18;
  const lower = h * 0.2;
  const footShift = phase * w * 0.065;

  if (pixel) {
    block(lx, ly, legWidth, upper, step);
    block(lx + footShift, ly + upper - step * 0.35, legWidth, lower, step);
    block(lx + footShift - w * 0.025, ly + upper + lower - step * 0.25, w * 0.12, h * 0.045, step);
    return;
  }

  ctx.save();
  ctx.strokeStyle = ctx.fillStyle;
  ctx.lineWidth = Math.max(4, legWidth);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(lx, ly);
  ctx.lineTo(lx + phase * w * 0.035, ly + upper);
  ctx.lineTo(lx - footShift, ly + upper + lower);
  ctx.stroke();

  ctx.strokeStyle = "rgba(15,17,20,0.8)";
  ctx.lineWidth = Math.max(2, legWidth * 0.55);
  ctx.beginPath();
  ctx.moveTo(lx - footShift - w * 0.045, ly + upper + lower);
  ctx.lineTo(lx - footShift + w * 0.06, ly + upper + lower);
  ctx.stroke();
  ctx.restore();
}

function drawAnimalExtras(animal, pixel) {
  const w = player.w;
  const h = player.h;
  ctx.fillStyle = currentWorld().accent;

  if (animal.type === "unicorn") {
    ctx.beginPath();
    ctx.moveTo(w * 0.36, -h * 0.36);
    ctx.lineTo(w * 0.48, -h * 0.68);
    ctx.lineTo(w * 0.25, -h * 0.46);
    ctx.closePath();
    ctx.fill();
  }

  if (animal.type === "winged" || animal.type === "dragon") {
    ctx.fillStyle = animal.type === "dragon" ? darken(animal.color, 0.25) : "#e8d8aa";
    ctx.beginPath();
    ctx.moveTo(-w * 0.12, -h * 0.16);
    ctx.lineTo(-w * 0.52, -h * 0.6);
    ctx.lineTo(-w * 0.34, -h * 0.02);
    ctx.closePath();
    ctx.fill();
  }

  if (animal.type === "dragon") {
    ctx.fillStyle = "#f0c33c";
    for (let i = 0; i < 4; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-w * 0.28 + i * w * 0.13, -h * 0.14);
      ctx.lineTo(-w * 0.22 + i * w * 0.13, -h * 0.34);
      ctx.lineTo(-w * 0.16 + i * w * 0.13, -h * 0.14);
      ctx.closePath();
      ctx.fill();
    }
  }

  if (animal.type === "cat" || animal.type === "dog") {
    ctx.fillStyle = darken(animal.color, 0.28);
    ctx.beginPath();
    ctx.moveTo(w * 0.22, -h * 0.34);
    ctx.lineTo(w * 0.28, -h * 0.52);
    ctx.lineTo(w * 0.35, -h * 0.34);
    ctx.fill();
  }

  if (pixel) {
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-w * 0.28, -h * 0.04, w * 0.42, 6);
    ctx.globalAlpha = 1;
  }
}

function drawRealisticAnimal(animal) {
  if (animal.type === "dragon") {
    drawRealisticDragon(animal);
    return;
  }

  if (animal.type === "winged") {
    drawRealisticWingedAnimal(animal);
    return;
  }

  drawRealisticQuadruped(animal);
}

function drawRealisticQuadruped(animal) {
  const w = player.w;
  const h = player.h;
  const main = animal.color;
  const shade = darken(main, 0.3);
  const dark = darken(main, 0.52);
  const light = lighten(main, 0.2);
  const isHorse = animal.type === "horse" || animal.type === "unicorn" || animal.type === "donkey";
  const isSmall = animal.type === "cat" || animal.type === "dog" || animal.type === "tiny";
  const run = Math.sin(distance * 0.075);

  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
  ctx.beginPath();
  ctx.ellipse(0, h * 0.45, w * 0.42, h * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  const bodyY = isSmall ? h * 0.02 : h * 0.01;
  const bodyH = isSmall ? h * 0.32 : h * 0.38;
  const bodyW = isSmall ? w * 0.72 : w * 0.78;
  const bodyX = -w * 0.34;

  const bodyGradient = ctx.createLinearGradient(bodyX, -h * 0.2, bodyX + bodyW, h * 0.28);
  bodyGradient.addColorStop(0, light);
  bodyGradient.addColorStop(0.45, main);
  bodyGradient.addColorStop(1, shade);
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.ellipse(bodyX + bodyW * 0.48, bodyY, bodyW * 0.5, bodyH * 0.58, -0.05, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = shade;
  ctx.beginPath();
  ctx.ellipse(bodyX + bodyW * 0.15, bodyY + bodyH * 0.02, bodyW * 0.2, bodyH * 0.46, -0.18, 0, Math.PI * 2);
  ctx.fill();

  drawRealisticLeg(bodyX + bodyW * 0.2, bodyY + bodyH * 0.25, h * 0.48, dark, run, -1);
  drawRealisticLeg(bodyX + bodyW * 0.36, bodyY + bodyH * 0.26, h * 0.48, shade, -run, 1);
  drawRealisticLeg(bodyX + bodyW * 0.68, bodyY + bodyH * 0.2, h * 0.5, dark, -run, -1);
  drawRealisticLeg(bodyX + bodyW * 0.82, bodyY + bodyH * 0.18, h * 0.5, shade, run, 1);

  ctx.strokeStyle = dark;
  ctx.lineWidth = Math.max(4, w * 0.045);
  ctx.lineCap = "round";
  ctx.beginPath();
  if (animal.type === "cat") {
    ctx.moveTo(bodyX - w * 0.03, bodyY - h * 0.02);
    ctx.bezierCurveTo(bodyX - w * 0.34, bodyY - h * 0.34, bodyX - w * 0.3, bodyY + h * 0.18, bodyX - w * 0.08, bodyY + h * 0.03);
  } else if (animal.type === "dog") {
    ctx.moveTo(bodyX - w * 0.02, bodyY);
    ctx.bezierCurveTo(bodyX - w * 0.24, bodyY - h * 0.2, bodyX - w * 0.22, bodyY - h * 0.38, bodyX - w * 0.05, bodyY - h * 0.22);
  } else {
    ctx.moveTo(bodyX - w * 0.02, bodyY - h * 0.02);
    ctx.bezierCurveTo(bodyX - w * 0.22, bodyY - h * 0.18, bodyX - w * 0.26, bodyY - h * 0.28, bodyX - w * 0.12, bodyY - h * 0.34);
  }
  ctx.stroke();

  const neckBaseX = bodyX + bodyW * 0.83;
  const neckBaseY = bodyY - bodyH * 0.08;
  const neckTopX = neckBaseX + w * (isHorse ? 0.17 : 0.11);
  const neckTopY = neckBaseY - h * (isHorse ? 0.33 : 0.23);

  ctx.strokeStyle = main;
  ctx.lineWidth = Math.max(10, w * (isHorse ? 0.13 : 0.11));
  ctx.beginPath();
  ctx.moveTo(neckBaseX, neckBaseY);
  ctx.quadraticCurveTo(neckBaseX + w * 0.08, neckBaseY - h * 0.22, neckTopX, neckTopY);
  ctx.stroke();

  ctx.fillStyle = main;
  ctx.beginPath();
  if (isHorse) {
    ctx.ellipse(neckTopX + w * 0.12, neckTopY + h * 0.01, w * 0.2, h * 0.13, -0.06, 0, Math.PI * 2);
  } else {
    ctx.ellipse(neckTopX + w * 0.12, neckTopY + h * 0.03, w * 0.18, h * 0.15, 0.05, 0, Math.PI * 2);
  }
  ctx.fill();

  ctx.fillStyle = dark;
  if (animal.type === "cat" || animal.type === "dog") {
    ctx.beginPath();
    ctx.moveTo(neckTopX + w * 0.02, neckTopY - h * 0.08);
    ctx.lineTo(neckTopX + w * 0.07, neckTopY - h * 0.23);
    ctx.lineTo(neckTopX + w * 0.14, neckTopY - h * 0.08);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(neckTopX + w * 0.16, neckTopY - h * 0.08);
    ctx.lineTo(neckTopX + w * 0.22, neckTopY - h * 0.21);
    ctx.lineTo(neckTopX + w * 0.26, neckTopY - h * 0.06);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.ellipse(neckTopX + w * 0.02, neckTopY - h * 0.1, w * 0.045, h * 0.12, -0.25, 0, Math.PI * 2);
    ctx.ellipse(neckTopX + w * 0.17, neckTopY - h * 0.1, w * 0.045, h * 0.12, 0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  if (animal.type === "unicorn") {
    ctx.fillStyle = currentWorld().accent;
    ctx.beginPath();
    ctx.moveTo(neckTopX + w * 0.16, neckTopY - h * 0.14);
    ctx.lineTo(neckTopX + w * 0.24, neckTopY - h * 0.48);
    ctx.lineTo(neckTopX + w * 0.06, neckTopY - h * 0.19);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = "#101114";
  ctx.beginPath();
  ctx.arc(neckTopX + w * 0.2, neckTopY - h * 0.01, Math.max(2.4, w * 0.025), 0, Math.PI * 2);
  ctx.fill();

  if (isHorse || animal.type === "donkey") {
    ctx.strokeStyle = dark;
    ctx.lineWidth = Math.max(3, w * 0.035);
    ctx.beginPath();
    ctx.moveTo(neckBaseX - w * 0.02, neckBaseY - h * 0.08);
    ctx.quadraticCurveTo(neckBaseX + w * 0.08, neckBaseY - h * 0.28, neckTopX + w * 0.02, neckTopY - h * 0.08);
    ctx.stroke();
  }
  ctx.restore();
}

function drawRealisticLeg(x, y, len, color, phase, direction) {
  const kneeX = x + direction * phase * 8;
  const kneeY = y + len * 0.48;
  const hoofX = x - direction * phase * 12;
  const hoofY = y + len;

  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(4, player.w * 0.045);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(kneeX, kneeY);
  ctx.lineTo(hoofX, hoofY);
  ctx.stroke();

  ctx.strokeStyle = "#141414";
  ctx.lineWidth = Math.max(3, player.w * 0.035);
  ctx.beginPath();
  ctx.moveTo(hoofX - 5, hoofY);
  ctx.lineTo(hoofX + 8, hoofY);
  ctx.stroke();
}

function drawRealisticWingedAnimal(animal) {
  drawRealisticQuadruped(animal);
  const w = player.w;
  const h = player.h;
  const flap = Math.sin(distance * 0.05) * 0.12;
  ctx.save();
  ctx.globalAlpha = 0.92;
  ctx.fillStyle = "rgba(235, 219, 170, 0.88)";
  ctx.strokeStyle = darken(animal.color, 0.42);
  ctx.lineWidth = Math.max(2, w * 0.02);
  ctx.beginPath();
  ctx.moveTo(-w * 0.12, -h * 0.1);
  ctx.bezierCurveTo(-w * 0.42, -h * (0.5 + flap), -w * 0.72, -h * 0.44, -w * 0.42, h * 0.08);
  ctx.quadraticCurveTo(-w * 0.25, -h * 0.02, -w * 0.12, -h * 0.1);
  ctx.fill();
  ctx.stroke();

  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.moveTo(-w * (0.23 + i * 0.08), -h * (0.12 + i * 0.035));
    ctx.lineTo(-w * (0.36 + i * 0.08), h * 0.04);
    ctx.stroke();
  }
  ctx.restore();
}

function drawRealisticDragon(animal) {
  const w = player.w;
  const h = player.h;
  const main = animal.color;
  const shade = darken(main, 0.34);
  const dark = darken(main, 0.58);
  const light = lighten(main, 0.18);
  const run = Math.sin(distance * 0.066);

  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.beginPath();
  ctx.ellipse(0, h * 0.45, w * 0.5, h * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = shade;
  ctx.beginPath();
  ctx.ellipse(-w * 0.06, h * 0.02, w * 0.52, h * 0.28, -0.08, 0, Math.PI * 2);
  ctx.fill();

  const bodyGradient = ctx.createLinearGradient(-w * 0.48, -h * 0.2, w * 0.5, h * 0.25);
  bodyGradient.addColorStop(0, light);
  bodyGradient.addColorStop(0.5, main);
  bodyGradient.addColorStop(1, dark);
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.ellipse(-w * 0.02, -h * 0.02, w * 0.46, h * 0.3, -0.08, 0, Math.PI * 2);
  ctx.fill();

  drawRealisticLeg(-w * 0.28, h * 0.16, h * 0.48, dark, run, -1);
  drawRealisticLeg(-w * 0.1, h * 0.17, h * 0.5, shade, -run, 1);
  drawRealisticLeg(w * 0.2, h * 0.12, h * 0.5, dark, -run, -1);
  drawRealisticLeg(w * 0.36, h * 0.1, h * 0.5, shade, run, 1);

  ctx.strokeStyle = dark;
  ctx.lineWidth = Math.max(7, w * 0.065);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-w * 0.42, -h * 0.02);
  ctx.bezierCurveTo(-w * 0.78, -h * 0.18, -w * 0.82, h * 0.18, -w * 0.54, h * 0.16);
  ctx.stroke();

  ctx.strokeStyle = main;
  ctx.lineWidth = Math.max(12, w * 0.1);
  ctx.beginPath();
  ctx.moveTo(w * 0.28, -h * 0.08);
  ctx.quadraticCurveTo(w * 0.42, -h * 0.28, w * 0.58, -h * 0.24);
  ctx.stroke();

  ctx.fillStyle = main;
  ctx.beginPath();
  ctx.ellipse(w * 0.68, -h * 0.22, w * 0.2, h * 0.14, 0.03, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = currentWorld().accent;
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath();
    ctx.moveTo(-w * 0.32 + i * w * 0.15, -h * 0.22);
    ctx.lineTo(-w * 0.27 + i * w * 0.15, -h * 0.42);
    ctx.lineTo(-w * 0.21 + i * w * 0.15, -h * 0.2);
    ctx.closePath();
    ctx.fill();
  }

  const flap = Math.sin(distance * 0.045) * 0.16;
  ctx.fillStyle = "rgba(36, 56, 46, 0.88)";
  ctx.strokeStyle = dark;
  ctx.lineWidth = Math.max(2, w * 0.02);
  ctx.beginPath();
  ctx.moveTo(-w * 0.02, -h * 0.16);
  ctx.bezierCurveTo(-w * 0.34, -h * (0.62 + flap), -w * 0.7, -h * 0.46, -w * 0.38, h * 0.06);
  ctx.quadraticCurveTo(-w * 0.18, -h * 0.05, -w * 0.02, -h * 0.16);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(w * 0.12, -h * 0.15);
  ctx.bezierCurveTo(w * 0.4, -h * (0.52 + flap), w * 0.72, -h * 0.32, w * 0.34, h * 0.08);
  ctx.quadraticCurveTo(w * 0.22, -h * 0.02, w * 0.12, -h * 0.15);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#101114";
  ctx.beginPath();
  ctx.arc(w * 0.74, -h * 0.24, Math.max(3, w * 0.026), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawTimingGuide() {
  const target = world.hazards.find((hazard) => hazard.kind === "obstacle" && !hazard.resolved);
  if (!target || target.x < player.x) return;

  const d = target.x - (player.x + player.w);
  if (d > 210) return;

  const alpha = Math.max(0, 1 - Math.abs(d - 70) / 150);
  ctx.globalAlpha = alpha * 0.7;
  ctx.strokeStyle = currentWorld().accent;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(player.x + player.w + 44, world.groundY - 42, 24, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawParticles() {
  for (const particle of world.particles) {
    ctx.globalAlpha = Math.max(0, particle.life);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawOverlay() {
  if (state.started && !state.gameOver && !state.paused && state.flashTimer <= 0) return;

  if (!state.started || state.gameOver || state.paused) {
    ctx.fillStyle = "rgba(10, 12, 16, 0.62)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#f5f1e8";

  if (!state.started) {
    ctx.font = "700 50px Arial";
    ctx.fillText("Bestia Salta", canvas.width / 2, 208);
    ctx.font = "700 22px Arial";
    ctx.fillText("Clicca bene: evolvi. Clicca male: carriera animale finita.", canvas.width / 2, 256);
    ctx.fillText("Poi evita i buchi con pessime intenzioni.", canvas.width / 2, 288);
    return;
  }

  if (state.gameOver) {
    ctx.font = "700 50px Arial";
    ctx.fillText("Fine della stalla", canvas.width / 2, 214);
    ctx.font = "700 22px Arial";
    ctx.fillText("Salta per ripartire con falsa sicurezza", canvas.width / 2, 264);
    return;
  }

  if (state.paused) {
    ctx.font = "700 50px Arial";
    ctx.fillText("Pausa", canvas.width / 2, 244);
    return;
  }

  if (state.flashTimer > 0) {
    ctx.globalAlpha = Math.min(1, state.flashTimer);
    ctx.font = "700 30px Arial";
    ctx.fillText(state.flash, canvas.width / 2, 86);
    ctx.globalAlpha = 1;
  }
}

function drawWorldTransition() {
  if (state.transitionTimer <= 0) return;

  const progress = state.awaitingGo ? 1 : 1 - state.transitionTimer / 1.55;
  const alpha = Math.sin(progress * Math.PI);
  const heldAlpha = state.awaitingGo ? 1 : alpha;
  const theme = currentWorld();
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  ctx.save();
  ctx.globalAlpha = heldAlpha * 0.86;
  ctx.fillStyle = state.transitionDir > 0 ? "rgba(255, 228, 95, 0.18)" : "rgba(240, 100, 73, 0.22)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalAlpha = heldAlpha;
  ctx.strokeStyle = state.transitionDir > 0 ? theme.accent : "#f06449";
  ctx.lineWidth = 10;
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, 50 + progress * 440 + i * 42, 0, Math.PI * 2);
    ctx.stroke();
  }

  const stripeW = 80 + progress * 180;
  ctx.fillStyle = state.transitionDir > 0 ? "rgba(255, 228, 95, 0.82)" : "rgba(240, 100, 73, 0.78)";
  ctx.fillRect(-stripeW + progress * canvas.width, 0, stripeW, canvas.height);
  ctx.fillRect(canvas.width - progress * canvas.width, 0, stripeW, canvas.height);

  ctx.textAlign = "center";
  ctx.fillStyle = "#101114";
  ctx.font = "700 44px Arial";
  ctx.fillText(state.transitionDir > 0 ? "PROMOZIONE!" : "RETROCESSIONE!", centerX, centerY - 20);
  ctx.font = "700 24px Arial";
  ctx.fillText(state.transitionName, centerX, centerY + 24);
  if (state.awaitingGo) {
    ctx.font = "700 18px Arial";
    ctx.fillText("Premi Vai per lanciarti nel nuovo livello", centerX, centerY + 62);
  }
  ctx.restore();
}

function block(x, y, w, h, step) {
  ctx.fillRect(Math.round(x / step) * step, Math.round(y / step) * step, Math.round(w / step) * step, Math.round(h / step) * step);
}

function darken(hex, amount) {
  const n = Number.parseInt(hex.slice(1), 16);
  const r = Math.max(0, ((n >> 16) & 255) * (1 - amount));
  const g = Math.max(0, ((n >> 8) & 255) * (1 - amount));
  const b = Math.max(0, (n & 255) * (1 - amount));
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

function lighten(hex, amount) {
  const n = Number.parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) + (255 - ((n >> 16) & 255)) * amount;
  const g = ((n >> 8) & 255) + (255 - ((n >> 8) & 255)) * amount;
  const b = (n & 255) + (255 - (n & 255)) * amount;
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

function frame(time) {
  const dt = state.lastTime ? Math.min(0.033, (time - state.lastTime) / 1000) : 0;
  state.lastTime = time;
  update(dt);
  draw();
  requestAnimationFrame(frame);
}

function togglePause() {
  if (!state.started || state.gameOver || state.awaitingGo) return;
  state.paused = !state.paused;
  pauseButton.textContent = state.paused ? "Riprendi" : "Pausa";
  pauseButton.setAttribute("aria-pressed", String(state.paused));
  syncControls();
}

let orientationLockTried = false;

function shouldTryLandscapeLock() {
  return window.matchMedia("(pointer: coarse)").matches && window.matchMedia("(max-width: 920px), (max-height: 540px)").matches;
}

async function requestLandscapeMode() {
  if (orientationLockTried || !shouldTryLandscapeLock()) return;
  orientationLockTried = true;

  try {
    if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
      await document.documentElement.requestFullscreen({ navigationUI: "hide" });
    }
  } catch (error) {
    // Some mobile browsers only allow fullscreen in installed apps.
  }

  try {
    if (screen.orientation?.lock) await screen.orientation.lock("landscape");
  } catch (error) {
    // Safari and several in-app browsers ignore orientation locks.
  }
}

function withLandscapeMode(action) {
  return (event) => {
    requestLandscapeMode();
    action(event);
  };
}

window.addEventListener("keydown", (event) => {
  if (event.code === "Space" || event.code === "ArrowUp" || event.code === "KeyW") {
    event.preventDefault();
    requestJump();
  }

  if (event.code === "KeyP") togglePause();
  if (event.code === "KeyR") resetGame();
  if (event.code === "Enter") continueWorld();
  if (event.code === "Escape") stopGame();
});

canvas.addEventListener("pointerdown", withLandscapeMode(requestJump));
jumpButton.addEventListener("click", withLandscapeMode(requestJump));
goButton.addEventListener("click", withLandscapeMode(continueWorld));
restartButton.addEventListener("click", () => {
  requestLandscapeMode();
  startAudio();
  resetGame();
});
pauseButton.addEventListener("click", withLandscapeMode(togglePause));
stopButton.addEventListener("click", withLandscapeMode(stopGame));

setPlayerSize();
syncControls();
updateHud();
requestAnimationFrame(frame);
