import { Tween, Easing } from "../render/tween.js";
import { rollDie } from "./dice.js";
import { logEvent, setToast, currentPlayer } from "../state/gameState.js";
import { getTileCenter } from "../state/board.js";
import {
  HOP_DURATION_MS,
  HOP_HEIGHT_PX,
  SLIDE_DURATION_MS,
  CLIMB_DURATION_MS,
  DICE_ROLL_DURATION_MS,
  EXACT_FINISH,
} from "../config.js";
import { checkAchievements } from "../systems/achievementSystem.js";
import { grantPowerup } from "../systems/powerupSystem.js";
import { tickEvents } from "../systems/eventSystem.js";
import { play } from "../audio/sound.js";

export function startRoll(state) {
  if (state.turnPhase !== "IDLE") return;
  const p = currentPlayer(state);
  state.turnPhase = "ROLLING";
  state.dice.rolling = true;
  state.dice.value = 0;
  play("dice");

  state.tweens.push(new Tween({
    duration: DICE_ROLL_DURATION_MS / (state.settings.animSpeed || 1),
    easing: Easing.linear,
    onUpdate: (e) => {
      state.dice.popupScale = 0.6 + 0.4 * Math.sin(e * Math.PI * 6);
      state.dice.value = 1 + Math.floor(Math.random() * 6);
    },
    onComplete: () => {
      state.dice.rolling = false;
      state.dice.popupScale = 1;
      state.dice.value = rollDie(state.rng);
      p.stats.rolls++;
      let dv = state.dice.value;
      if (p.effects.miniJumpPending) {
        dv += 2;
        p.effects.miniJumpPending = false;
        setToast(state, `+2 from Mini Jump! Total: ${dv}`);
      }
      logEvent(state, `${p.name} rolled ${state.dice.value}${dv !== state.dice.value ? ` (+2 = ${dv})` : ""}`);
      enqueueMove(state, p, dv);
    },
  }));
}

function enqueueMove(state, player, steps) {
  state.turnPhase = "MOVING";
  const total = state.board.totalTiles;
  let target = player.tile + steps;

  if (target > total - 1) {
    if (EXACT_FINISH) {
      const overshoot = target - (total - 1);
      target = total - 1 - overshoot;
      if (target < 0) target = player.tile;
      setToast(state, `${player.name} overshot!`);
      logEvent(state, `${player.name} bounced back from overshoot`);
    } else {
      target = total - 1;
    }
  }

  const direction = target >= player.tile ? 1 : -1;
  const path = [];
  for (let t = player.tile + direction; direction > 0 ? t <= target : t >= target; t += direction) {
    path.push(t);
  }

  if (path.length === 0) {
    state.turnPhase = "RESOLVING_TILE";
    resolveTile(state, player);
    return;
  }

  enqueueHopSequence(state, player, path);
}

function enqueueHopSequence(state, player, path) {
  const animSpeed = state.settings.animSpeed || 1;
  let i = 0;

  const doNext = () => {
    if (i >= path.length) {
      state.turnPhase = "RESOLVING_TILE";
      resolveTile(state, player);
      return;
    }
    const nextTile = path[i++];
    const from = { x: player.renderPos.x, y: player.renderPos.y };
    const to = getTileCenter(state.board, nextTile);
    play("move", 80);

    state.tweens.push(new Tween({
      duration: HOP_DURATION_MS / animSpeed,
      easing: Easing.easeOutQuad,
      onUpdate: (e) => {
        player.renderPos.x = from.x + (to.x - from.x) * e;
        const baseY = from.y + (to.y - from.y) * e;
        player.renderPos.y = baseY - Math.sin(e * Math.PI) * HOP_HEIGHT_PX;
      },
      onComplete: () => {
        player.tile = nextTile;
        player.renderPos.x = to.x;
        player.renderPos.y = to.y;
        doNext();
      },
    }));
  };
  doNext();
}

function resolveTile(state, player) {
  const tile = state.board.tiles[player.tile];
  const animSpeed = state.settings.animSpeed || 1;

  if (tile.type === "snake-head") {
    const snake = state.board.snakes.find((s) => s.headTile === player.tile);
    if (player.effects.shield) {
      player.effects.shield = false;
      player.stats.shieldsSaved++;
      setToast(state, `${player.name}'s shield blocked a snake!`);
      logEvent(state, `${player.name}'s shield absorbed the bite`);
      play("powerup");
      checkAchievements(state, "shieldSave");
      gotoCheckWin(state, player);
      return;
    }
    player.stats.snakesHit++;
    play("hiss");
    setToast(state, `${player.name} got bitten!`);
    logEvent(state, `${player.name} bit by snake at ${player.tile + 1}, sliding to ${snake.tailTile + 1}`);
    slideAlongSnake(state, player, snake, animSpeed);
    checkAchievements(state, "snake");
    return;
  }

  if (tile.type === "ladder-bottom") {
    const ladder = state.board.ladders.find((l) => l.bottomTile === player.tile);
    player.stats.laddersClimbed++;
    play("chime");
    setToast(state, `${player.name} climbed a ladder!`);
    logEvent(state, `${player.name} climbed from ${player.tile + 1} to ${ladder.topTile + 1}`);
    climbLadder(state, player, ladder, animSpeed);
    checkAchievements(state, "ladder");
    return;
  }

  if (tile.type === "powerup") {
    const pid = state.board.powerupTiles.get(player.tile);
    if (pid) {
      state.board.powerupTiles.delete(player.tile);
      state.board.tiles[player.tile].type = "normal";
      grantPowerup(state, player, pid);
      play("powerup");
    }
    gotoCheckWin(state, player);
    return;
  }

  gotoCheckWin(state, player);
}

function slideAlongSnake(state, player, snake, animSpeed) {
  const head = getTileCenter(state.board, snake.headTile);
  const tail = getTileCenter(state.board, snake.tailTile);
  const cp = snake.controlPoints;

  state.tweens.push(new Tween({
    duration: SLIDE_DURATION_MS / animSpeed,
    easing: Easing.easeInOutQuad,
    onUpdate: (e) => {
      const pt = cubicBezier(e, head, cp[0], cp[1], tail);
      player.renderPos.x = pt.x;
      player.renderPos.y = pt.y;
    },
    onComplete: () => {
      player.tile = snake.tailTile;
      player.renderPos.x = tail.x;
      player.renderPos.y = tail.y;
      gotoCheckWin(state, player);
    },
  }));
}

function climbLadder(state, player, ladder, animSpeed) {
  const bottom = getTileCenter(state.board, ladder.bottomTile);
  const top = getTileCenter(state.board, ladder.topTile);

  state.tweens.push(new Tween({
    duration: CLIMB_DURATION_MS / animSpeed,
    easing: Easing.easeOutCubic,
    onUpdate: (e) => {
      player.renderPos.x = bottom.x + (top.x - bottom.x) * e;
      player.renderPos.y = bottom.y + (top.y - bottom.y) * e;
    },
    onComplete: () => {
      player.tile = ladder.topTile;
      player.renderPos.x = top.x;
      player.renderPos.y = top.y;
      gotoCheckWin(state, player);
    },
  }));
}

function cubicBezier(t, p0, p1, p2, p3) {
  const u = 1 - t;
  const x = u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x;
  const y = u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y;
  return { x, y };
}

function gotoCheckWin(state, player) {
  state.turnPhase = "CHECK_WIN";
  if (player.tile === state.board.totalTiles - 1) {
    state.winner = player;
    state.turnPhase = "GAME_OVER";
    play("win");
    logEvent(state, `${player.name} wins!`);
    setToast(state, `${player.name} wins!`, 4000);
    if (state.players.every((q) => q === player || q.tile < player.tile - 10) && state.players.length > 1) {
      // not strictly correct comeback condition, but ok placeholder
    }
    checkAchievements(state, "win");
    return;
  }

  const playAgain = state.dice.value === 6 || player.effects.doubleRollPending;
  if (player.effects.doubleRollPending) player.effects.doubleRollPending = false;

  if (playAgain) {
    if (state.dice.value === 6) logEvent(state, `${player.name} rolled a 6 - extra turn!`);
    state.turnPhase = "IDLE";
    return;
  }

  state.turnPhase = "NEXT_TURN";
  advanceTurn(state);
}

function advanceTurn(state) {
  const n = state.players.length;
  let safety = 0;
  do {
    state.currentPlayerIndex = (state.currentPlayerIndex + 1) % n;
    const np = state.players[state.currentPlayerIndex];
    if (np.effects.frozen > 0) {
      np.effects.frozen--;
      logEvent(state, `${np.name} is frozen and skips this turn`);
      setToast(state, `${np.name} is frozen!`);
      safety++;
      if (safety > n * 2) break;
      continue;
    }
    break;
  } while (true);

  tickEvents(state);
  state.turnPhase = "IDLE";
}
