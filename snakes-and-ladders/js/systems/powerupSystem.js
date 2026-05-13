import { getPowerup } from "../../data/powerups.js";
import { MAX_HELD_POWERUPS } from "../config.js";
import { logEvent, setToast } from "../state/gameState.js";
import { pick } from "../core/rng.js";

export function grantPowerup(state, player, id) {
  if (player.powerups.length >= MAX_HELD_POWERUPS) {
    setToast(state, `${player.name}'s power-up slots are full`);
    return false;
  }
  player.powerups.push(id);
  const pu = getPowerup(id);
  setToast(state, `${player.name} picked up ${pu.name}!`);
  logEvent(state, `${player.name} picked up ${pu.name}`);
  return true;
}

export function grantRandomPowerup(state, player) {
  const ids = ["shield", "doubleRoll", "teleport", "freeze", "miniJump"];
  return grantPowerup(state, player, pick(state.rng, ids));
}

export function canActivatePowerup(state, player, idx) {
  if (state.turnPhase !== "IDLE") return false;
  if (player !== state.players[state.currentPlayerIndex]) return false;
  return idx >= 0 && idx < player.powerups.length;
}

export function activatePowerup(state, player, idx, params = {}) {
  if (!canActivatePowerup(state, player, idx)) return false;
  const id = player.powerups[idx];
  const pu = getPowerup(id);
  if (!pu) return false;

  player.powerups.splice(idx, 1);
  player.stats.powerupsUsed++;
  pu.activate(state, player, params);
  return true;
}
