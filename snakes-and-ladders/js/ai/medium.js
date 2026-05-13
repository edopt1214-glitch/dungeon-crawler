import { AI_PARAMS } from "../config.js";
import { getPowerup } from "../../data/powerups.js";

export function decideMedium(state, player) {
  if (player.powerups.length === 0) return null;
  const board = state.board;
  const N = board.size;

  for (let i = 0; i < player.powerups.length; i++) {
    const id = player.powerups[i];
    const params = scorePowerup(state, player, id, AI_PARAMS.medium);
    if (params) return { powerupIndex: i, powerupId: id, params };
  }
  return null;
}

function scorePowerup(state, player, id, params) {
  const board = state.board;

  if (id === "shield") {
    for (let d = 1; d <= params.snakeLookahead; d++) {
      const t = player.tile + d;
      if (t >= board.totalTiles) break;
      if (board.tiles[t].type === "snake-head") return {};
    }
    return null;
  }

  if (id === "doubleRoll") {
    if (player.tile < board.totalTiles * params.doubleRollHalf) return {};
    return null;
  }

  if (id === "miniJump") {
    for (let d = 1; d <= 6; d++) {
      const t = player.tile + d + 2;
      if (t >= board.totalTiles) continue;
      if (board.tiles[t].type === "ladder-bottom") return {};
    }
    return null;
  }

  if (id === "teleport") {
    const pu = getPowerup("teleport");
    const range = pu.range || 20;
    let best = null;
    for (let t = player.tile + 1; t <= Math.min(board.totalTiles - 1, player.tile + range); t++) {
      if (board.tiles[t].type === "snake-head") continue;
      if (board.tiles[t].type === "ladder-bottom") {
        const ladder = board.ladders.find((l) => l.bottomTile === t);
        if (ladder && (!best || ladder.topTile > best.score)) best = { target: t, score: ladder.topTile };
      } else if (t >= board.totalTiles - 6 && (!best || t > best.score)) {
        best = { target: t, score: t };
      }
    }
    if (best) return { target: best.target };
    return null;
  }

  if (id === "freeze") {
    const finish = board.totalTiles - 1;
    let leader = null;
    for (const p of state.players) {
      if (p.id === player.id) continue;
      if (finish - p.tile <= params.freezeProximity) {
        if (!leader || p.tile > leader.tile) leader = p;
      }
    }
    if (leader) return { targetPlayerId: leader.id };
    return null;
  }

  if (id === "swap") {
    const better = state.players.find((p) => p.id !== player.id && p.tile > player.tile + 15);
    if (better) return { targetPlayerId: better.id };
    return null;
  }

  return null;
}
