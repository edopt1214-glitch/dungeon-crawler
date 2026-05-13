import { createGameState, logEvent, setToast, currentPlayer } from "./state/gameState.js";
import { createRenderer } from "./render/renderer.js";
import { createHUD } from "./input/hud.js";
import { showMenu, hideMenu } from "./input/menu.js";
import { pickTileForTeleport, pickOpponent } from "./input/picker.js";
import { startRoll } from "./core/turnMachine.js";
import { activatePowerup } from "./systems/powerupSystem.js";
import { decideAction } from "./ai/aiController.js";
import { getPowerup } from "../data/powerups.js";
import { triggerEvent } from "./systems/eventSystem.js";
import { loadSettings, saveSettings } from "./persistence/storage.js";
import { loadPersistentStats, persistAchievements } from "./systems/achievementSystem.js";
import { loadSounds, setMuted, setVolume, play, isMuted } from "./audio/sound.js";
import { DEFAULT_BOARD_SIZE } from "./config.js";

const els = {
  boardCanvas: document.getElementById("boardCanvas"),
  overlayCanvas: document.getElementById("overlayCanvas"),
  piecesCanvas: document.getElementById("piecesCanvas"),
  toast: document.getElementById("toast"),
  playersPanel: document.getElementById("playersPanel"),
  logList: document.getElementById("logList"),
  dieFace: document.getElementById("dieFace"),
  rollBtn: document.getElementById("rollBtn"),
  powerupList: document.getElementById("powerupList"),
  achievementsList: document.getElementById("achievementsList"),
  themeSelect: document.getElementById("themeSelect"),
  sizeSelect: document.getElementById("sizeSelect"),
  newGameBtn: document.getElementById("newGameBtn"),
  muteBtn: document.getElementById("muteBtn"),
  menuOverlay: document.getElementById("menuOverlay"),
  winOverlay: document.getElementById("winOverlay"),
  winTitle: document.getElementById("winTitle"),
  winSubtitle: document.getElementById("winSubtitle"),
  playAgainBtn: document.getElementById("playAgainBtn"),
  pickerOverlay: document.getElementById("pickerOverlay"),
};

let state = null;
let renderer = null;
let hud = null;

const settings = loadSettings();
const persistent = loadPersistentStats();
setMuted(!settings.soundOn);
setVolume(settings.sfxVolume ?? 0.7);
els.muteBtn.textContent = settings.soundOn ? "\u{1F50A}" : "\u{1F507}";

loadSounds();

function bootMenu() {
  showMenu(els.menuOverlay, { boardSize: DEFAULT_BOARD_SIZE, theme: settings.theme || "classic" }, startGame);
}

function startGame(opts) {
  hideMenu(els.menuOverlay);
  els.winOverlay.classList.add("hidden");

  state = createGameState({
    boardSize: opts.boardSize,
    theme: opts.theme,
    playerConfigs: opts.playerConfigs,
    settings,
    unlocked: persistent.unlocked,
    persistentStats: persistent.stats,
  });

  settings.theme = opts.theme;
  saveSettings(settings);
  els.themeSelect.value = opts.theme;
  els.sizeSelect.value = String(opts.boardSize);

  logEvent(state, `Game start: ${opts.playerConfigs.length} players, ${opts.boardSize}x${opts.boardSize} board, ${opts.theme} theme`);

  if (!renderer) {
    renderer = createRenderer(() => state, els);
  } else {
    renderer.markBoardDirty();
    renderer.markOverlayDirty();
  }
  if (!hud) {
    hud = createHUD(() => state, els, {
      onRoll: handleHumanRoll,
      onActivatePowerup: handleActivatePowerup,
    });
  }

  scheduleAI(600);
  watchGameOver();
}

function handleHumanRoll() {
  const p = currentPlayer(state);
  if (!p || p.isAI) return;
  if (state.turnPhase !== "IDLE") return;
  startRoll(state);
  scheduleAI(200);
}

async function handleActivatePowerup(idx) {
  const p = currentPlayer(state);
  if (!p || p.isAI) return;
  const id = p.powerups[idx];
  if (!id) return;
  const pu = getPowerup(id);

  let params = {};
  if (pu.needsPicker === "tile") {
    const t = await pickTileForTeleport(els.pickerOverlay, state, p);
    if (t == null) return;
    params.target = t;
  } else if (pu.needsPicker === "opponent") {
    const tid = await pickOpponent(els.pickerOverlay, state, p, pu.name);
    if (tid == null) return;
    params.targetPlayerId = tid;
  }
  activatePowerup(state, p, idx, params);
  play("powerup");
}

let aiTimer = null;
function scheduleAI(delay) {
  if (aiTimer) clearTimeout(aiTimer);
  aiTimer = setTimeout(aiTick, delay);
}
function aiTick() {
  aiTimer = null;
  if (!state || state.winner) return;
  if (state.tweens.length > 0 || state.turnPhase !== "IDLE") {
    scheduleAI(200);
    return;
  }
  const p = currentPlayer(state);
  if (!p.isAI) return;

  const action = decideAction(state, p);
  if (action && action.params != null) {
    activatePowerup(state, p, action.powerupIndex, action.params);
    play("powerup");
    setTimeout(() => {
      startRoll(state);
      scheduleAI(400);
    }, 500);
  } else {
    startRoll(state);
    scheduleAI(400);
  }
}

function watchGameOver() {
  const id = setInterval(() => {
    if (!state) { clearInterval(id); return; }
    if (state.winner && state.turnPhase === "GAME_OVER" && state.tweens.length === 0) {
      clearInterval(id);
      els.winTitle.textContent = `${state.winner.name} wins!`;
      els.winSubtitle.textContent = `Rolls: ${state.winner.stats.rolls} | Ladders: ${state.winner.stats.laddersClimbed} | Snakes: ${state.winner.stats.snakesHit}`;
      els.winOverlay.classList.remove("hidden");
      persistAchievements(state);
    }
  }, 200);
}

els.themeSelect.addEventListener("change", (e) => {
  if (!state) return;
  state.theme = e.target.value;
  settings.theme = state.theme;
  saveSettings(settings);
  renderer.markBoardDirty();
});

els.sizeSelect.addEventListener("change", () => {
  // size change requires a new game
});

els.newGameBtn.addEventListener("click", () => {
  bootMenu();
});

els.playAgainBtn.addEventListener("click", () => {
  els.winOverlay.classList.add("hidden");
  bootMenu();
});

els.muteBtn.addEventListener("click", () => {
  const newSound = !settings.soundOn;
  settings.soundOn = newSound;
  setMuted(!newSound);
  els.muteBtn.textContent = newSound ? "\u{1F50A}" : "\u{1F507}";
  saveSettings(settings);
});

document.addEventListener("keydown", (e) => {
  if (e.shiftKey && e.key === "E" && state) {
    const ids = ["earthquake", "luckyDay", "fairWinds"];
    const choice = ids[Math.floor(Math.random() * ids.length)];
    triggerEvent(state, choice);
    if (choice === "earthquake" && renderer) renderer.markOverlayDirty();
  }
});

bootMenu();
