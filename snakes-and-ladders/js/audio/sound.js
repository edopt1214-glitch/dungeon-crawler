const sounds = {};
let muted = false;
let volume = 0.7;
let lastPlay = {};

const FILES = {
  dice: "assets/audio/dice.wav",
  move: "assets/audio/move.wav",
  hiss: "assets/audio/hiss.wav",
  chime: "assets/audio/chime.wav",
  win: "assets/audio/win.wav",
  click: "assets/audio/click.wav",
  powerup: "assets/audio/powerup.wav",
};

export function loadSounds() {
  for (const [name, src] of Object.entries(FILES)) {
    try {
      const a = new Audio();
      a.preload = "auto";
      a.src = src;
      sounds[name] = a;
    } catch (e) {
      // ignore missing files
    }
  }
}

export function setMuted(m) {
  muted = m;
}

export function isMuted() {
  return muted;
}

export function setVolume(v) {
  volume = Math.max(0, Math.min(1, v));
}

export function play(name, rateLimitMs = 0) {
  if (muted) return;
  const now = performance.now();
  if (rateLimitMs && lastPlay[name] && now - lastPlay[name] < rateLimitMs) return;
  lastPlay[name] = now;
  const a = sounds[name];
  if (!a) return;
  try {
    const clone = a.cloneNode();
    clone.volume = volume;
    const p = clone.play();
    if (p && p.catch) p.catch(() => {});
  } catch (e) {
    // ignore
  }
}
