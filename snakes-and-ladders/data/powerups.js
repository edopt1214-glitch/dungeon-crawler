import { logEvent, setToast } from "../js/state/gameState.js";

export const POWERUPS = {
  shield: {
    id: "shield",
    name: "Shield",
    icon: "\u{1F6E1}",
    description: "Negates the next snake bite.",
    needsPicker: false,
    activate(state, player) {
      player.effects.shield = true;
      setToast(state, `${player.name} raised a shield!`);
      logEvent(state, `${player.name} activated Shield`);
    },
  },
  doubleRoll: {
    id: "doubleRoll",
    name: "Double Roll",
    icon: "\u{1F3B2}",
    description: "Take an extra turn after this roll resolves.",
    needsPicker: false,
    activate(state, player) {
      player.effects.doubleRollPending = true;
      setToast(state, `${player.name} will roll twice!`);
      logEvent(state, `${player.name} activated Double Roll`);
    },
  },
  miniJump: {
    id: "miniJump",
    name: "Mini Jump",
    icon: "\u{1F9B5}",
    description: "Adds +2 to this roll.",
    needsPicker: false,
    activate(state, player) {
      player.effects.miniJumpPending = true;
      setToast(state, `${player.name} ready to jump further!`);
      logEvent(state, `${player.name} activated Mini Jump`);
    },
  },
  teleport: {
    id: "teleport",
    name: "Teleport",
    icon: "\u{2728}",
    description: "Jump to a chosen tile within range 20.",
    needsPicker: "tile",
    range: 20,
    activate(state, player, params) {
      const target = params.target;
      if (target == null) return;
      player.tile = target;
      const c = state.board.tiles[target];
      player.renderPos = { x: c.x, y: c.y };
      setToast(state, `${player.name} teleported to tile ${target + 1}`);
      logEvent(state, `${player.name} teleported to ${target + 1}`);
    },
  },
  freeze: {
    id: "freeze",
    name: "Freeze",
    icon: "\u{2744}",
    description: "Skip an opponent's next turn.",
    needsPicker: "opponent",
    activate(state, player, params) {
      const target = state.players[params.targetPlayerId];
      if (!target) return;
      target.effects.frozen = 1;
      setToast(state, `${target.name} is frozen!`);
      logEvent(state, `${player.name} froze ${target.name}`);
    },
  },
  swap: {
    id: "swap",
    name: "Swap",
    icon: "\u{1F501}",
    description: "Swap positions with an opponent.",
    needsPicker: "opponent",
    activate(state, player, params) {
      const target = state.players[params.targetPlayerId];
      if (!target) return;
      const a = player.tile;
      const b = target.tile;
      player.tile = b;
      target.tile = a;
      const cA = state.board.tiles[player.tile];
      const cB = state.board.tiles[target.tile];
      player.renderPos = { x: cA.x, y: cA.y };
      target.renderPos = { x: cB.x, y: cB.y };
      setToast(state, `${player.name} swapped with ${target.name}!`);
      logEvent(state, `${player.name} swapped places with ${target.name}`);
    },
  },
};

export function getPowerup(id) {
  return POWERUPS[id];
}
