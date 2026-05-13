import { AI_PARAMS } from "../config.js";
import { getPowerup } from "../../data/powerups.js";
import { decideMedium } from "./medium.js";

export function decideHard(state, player) {
  if (player.powerups.length === 0) return null;
  const N = state.board.size;
  const params = AI_PARAMS.hard;

  for (let i = 0; i < player.powerups.length; i++) {
    const id = player.powerups[i];
    if (id === "shield") {
      const ev = shieldEV(state, player);
      if (ev >= params.shieldEVThreshold * N) return { powerupIndex: i, powerupId: id, params: {} };
    }
    if (id === "teleport") {
      const choice = bestTeleport(state, player);
      if (choice) return { powerupIndex: i, powerupId: id, params: { target: choice } };
    }
    if (id === "swap") {
      const leader = state.players
        .filter((p) => p.id !== player.id)
        .sort((a, b) => b.tile - a.tile)[0];
      if (leader && leader.tile > player.tile + 20 && state.board.totalTiles - leader.tile <= 12) {
        return { powerupIndex: i, powerupId: id, params: { targetPlayerId: leader.id } };
      }
    }
  }
  return decideMedium(state, player);
}

function shieldEV(state, player) {
  const board = state.board;
  let sum = 0;
  for (let d = 1; d <= 6; d++) {
    const t = player.tile + d;
    if (t >= board.totalTiles) continue;
    if (board.tiles[t].type === "snake-head") {
      const snake = board.snakes.find((s) => s.headTile === t);
      if (snake) sum += (snake.headTile - snake.tailTile) * (1 / 6);
    }
  }
  return sum;
}

function bestTeleport(state, player) {
  const pu = getPowerup("teleport");
  const range = pu.range || 20;
  const board = state.board;
  let best = null;
  for (let t = player.tile + 1; t <= Math.min(board.totalTiles - 1, player.tile + range); t++) {
    if (board.tiles[t].type === "snake-head") continue;
    let effective = t;
    if (board.tiles[t].type === "ladder-bottom") {
      const ladder = board.ladders.find((l) => l.bottomTile === t);
      if (ladder) effective = ladder.topTile;
    }
    if (!best || effective > best.effective) best = { target: t, effective };
  }
  if (best && best.effective > player.tile + 6) return best.target;
  return null;
}
