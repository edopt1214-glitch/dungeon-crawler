import { AI_PARAMS } from "../config.js";
import { pick, randInt } from "../core/rng.js";
import { getPowerup } from "../../data/powerups.js";

export function decideEasy(state, player) {
  if (player.powerups.length === 0) return null;
  if (state.rng() >= AI_PARAMS.easy.randomPowerupChance) return null;

  const idx = randInt(state.rng, 0, player.powerups.length - 1);
  const id = player.powerups[idx];
  const pu = getPowerup(id);
  return {
    powerupIndex: idx,
    powerupId: id,
    params: pickParams(state, player, pu),
  };
}

function pickParams(state, player, pu) {
  if (pu.needsPicker === "tile") {
    const range = pu.range || 10;
    const candidates = [];
    for (let t = player.tile + 1; t <= Math.min(state.board.totalTiles - 1, player.tile + range); t++) {
      if (state.board.tiles[t].type !== "snake-head") candidates.push(t);
    }
    if (!candidates.length) return null;
    return { target: pick(state.rng, candidates) };
  }
  if (pu.needsPicker === "opponent") {
    const opps = state.players.filter((p) => p.id !== player.id);
    if (!opps.length) return null;
    return { targetPlayerId: pick(state.rng, opps).id };
  }
  return {};
}
