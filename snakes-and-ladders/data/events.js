import { logEvent, setToast } from "../js/state/gameState.js";
import { generateBoard } from "../js/core/boardGen.js";
import { pick, randInt } from "../js/core/rng.js";
import { getPowerup } from "./powerups.js";
import { MAX_HELD_POWERUPS } from "../js/config.js";

export const RANDOM_EVENTS = [
  {
    id: "earthquake",
    name: "Earthquake!",
    description: "Snakes and ladders shift to new positions.",
    rarity: 0.04,
    fire(state) {
      generateBoard(state.board, state.rng);
      setToast(state, "Earthquake! The board has shifted!");
      logEvent(state, "Earthquake reshuffled snakes and ladders");
      state.eventFlag = { type: "earthquake" };
    },
  },
  {
    id: "luckyDay",
    name: "Lucky Day",
    description: "Current player gets a random power-up.",
    rarity: 0.08,
    fire(state) {
      const p = state.players[state.currentPlayerIndex];
      if (p.powerups.length >= MAX_HELD_POWERUPS) return;
      const ids = ["shield", "doubleRoll", "teleport", "freeze", "miniJump"];
      const id = pick(state.rng, ids);
      p.powerups.push(id);
      setToast(state, `Lucky day! ${p.name} got ${getPowerup(id).name}`);
      logEvent(state, `${p.name} received ${getPowerup(id).name} (Lucky Day)`);
    },
  },
  {
    id: "fairWinds",
    name: "Fair Winds",
    description: "Current player advances 1 free tile.",
    rarity: 0.06,
    fire(state) {
      const p = state.players[state.currentPlayerIndex];
      const target = Math.min(p.tile + 1, state.board.totalTiles - 1);
      p.tile = target;
      const c = state.board.tiles[target];
      p.renderPos = { x: c.x, y: c.y };
      setToast(state, `Fair winds nudge ${p.name} forward!`);
      logEvent(state, `${p.name} got a free step from Fair Winds`);
    },
  },
];

export function maybeFireRandomEvent(state) {
  for (const ev of RANDOM_EVENTS) {
    if (state.rng() < ev.rarity) {
      ev.fire(state);
      return ev;
    }
  }
  return null;
}

export function fireEventById(state, id) {
  const ev = RANDOM_EVENTS.find((e) => e.id === id);
  if (ev) ev.fire(state);
  return ev;
}
