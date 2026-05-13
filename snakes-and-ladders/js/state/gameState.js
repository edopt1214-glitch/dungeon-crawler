import { createBoard, getTileCenter } from "./board.js";
import { createPlayer } from "./player.js";
import { generateBoard } from "../core/boardGen.js";
import { mulberry32, randomSeed } from "../core/rng.js";

export function createGameState(opts) {
  const seed = opts.seed ?? randomSeed();
  const rng = mulberry32(seed);
  const board = createBoard(opts.boardSize);
  generateBoard(board, rng);

  const players = opts.playerConfigs.map((pc, i) => {
    const p = createPlayer(i, pc);
    p.tile = 0;
    const c = getTileCenter(board, 0);
    p.renderPos = { x: c.x, y: c.y };
    return p;
  });

  return {
    seed,
    rng,
    board,
    players,
    currentPlayerIndex: 0,
    turnPhase: "IDLE",
    dice: { value: 0, rolling: false, popupScale: 0 },
    tweens: [],
    pendingActivation: null,
    winner: null,
    theme: opts.theme || "classic",
    settings: opts.settings || { soundOn: true, sfxVolume: 0.7, animSpeed: 1.0 },
    achievementsUnlocked: new Set(opts.unlocked || []),
    persistentStats: opts.persistentStats || { gamesPlayed: 0, totalWins: 0, totalSnakesHit: 0, totalShieldsSaved: 0, themesPlayed: new Set() },
    toast: null,
    log: [],
    eventFlag: null,
    debugLog: [],
  };
}

export function currentPlayer(state) {
  return state.players[state.currentPlayerIndex];
}

export function logEvent(state, msg) {
  state.log.push(msg);
  if (state.log.length > 60) state.log.shift();
}

export function setToast(state, text, ttl = 1800) {
  state.toast = { text, ttl, original: ttl };
}
