import { randInt, pick } from "./rng.js";
import { SNAKE_DENSITY, LADDER_DENSITY, POWERUP_TILE_RATIO } from "../config.js";
import { getTileCenter } from "../state/board.js";

const POWERUP_POOL = ["shield", "doubleRoll", "teleport", "freeze", "miniJump", "swap"];
const POWERUP_WEIGHTS = { shield: 3, doubleRoll: 2, teleport: 2, freeze: 2, miniJump: 3, swap: 1 };

export function generateBoard(board, rng, opts = {}) {
  const N = board.size;
  const total = board.totalTiles;
  const desiredSnakes = opts.snakes ?? Math.floor(N * SNAKE_DENSITY);
  const desiredLadders = opts.ladders ?? Math.floor(N * LADDER_DENSITY);

  for (let outer = 0; outer < 5; outer++) {
    if (tryPlace(board, rng, desiredSnakes, desiredLadders) && verifyReachable(board)) {
      placePowerups(board, rng);
      return board;
    }
  }
  placePowerups(board, rng);
  return board;
}

function tryPlace(board, rng, snakeCount, ladderCount) {
  const N = board.size;
  const total = board.totalTiles;
  board.snakes = [];
  board.ladders = [];
  for (const t of board.tiles) t.type = "normal";
  const occupied = new Set();

  for (let i = 0; i < ladderCount; i++) {
    let placed = false;
    for (let a = 0; a < 100; a++) {
      const bottom = randInt(rng, N, total - 2 * N - 1);
      if (bottom < 0 || bottom >= total) continue;
      const minClimb = Math.ceil(N * 1.2);
      const maxClimb = total - 2 - bottom;
      if (maxClimb < minClimb) continue;
      const top = bottom + randInt(rng, minClimb, maxClimb);
      if (top >= total - 1) continue;
      if (board.tiles[top].row === board.tiles[bottom].row) continue;
      if (occupied.has(bottom) || occupied.has(top)) continue;
      board.ladders.push({ id: `L${i}`, bottomTile: bottom, topTile: top });
      board.tiles[bottom].type = "ladder-bottom";
      board.tiles[top].type = "ladder-top";
      occupied.add(bottom); occupied.add(top);
      placed = true;
      break;
    }
    if (!placed) return false;
  }

  for (let i = 0; i < snakeCount; i++) {
    let placed = false;
    for (let a = 0; a < 100; a++) {
      const head = randInt(rng, 2 * N, total - 2);
      if (head < 0 || head >= total) continue;
      const minDrop = Math.max(N, Math.ceil(N * 1.0));
      const maxDrop = head - N;
      if (maxDrop < minDrop) continue;
      const tail = head - randInt(rng, minDrop, maxDrop);
      if (tail < N) continue;
      if (board.tiles[head].row === board.tiles[tail].row) continue;
      if (occupied.has(head) || occupied.has(tail)) continue;
      board.snakes.push({
        id: `S${i}`,
        headTile: head,
        tailTile: tail,
        controlPoints: makeSnakeControls(board, head, tail, rng),
      });
      board.tiles[head].type = "snake-head";
      board.tiles[tail].type = "snake-tail";
      occupied.add(head); occupied.add(tail);
      placed = true;
      break;
    }
    if (!placed) return false;
  }

  return true;
}

function makeSnakeControls(board, headIdx, tailIdx, rng) {
  const head = getTileCenter(board, headIdx);
  const tail = getTileCenter(board, tailIdx);
  const cp1 = {
    x: head.x + (tail.x - head.x) * 0.33 + (rng() - 0.5) * board.tileSize * 1.2,
    y: head.y + (tail.y - head.y) * 0.33,
  };
  const cp2 = {
    x: head.x + (tail.x - head.x) * 0.66 + (rng() - 0.5) * board.tileSize * 1.2,
    y: head.y + (tail.y - head.y) * 0.66,
  };
  return [cp1, cp2];
}

function placePowerups(board, rng) {
  const N = board.size;
  const total = board.totalTiles;
  const count = Math.floor(N * POWERUP_TILE_RATIO);
  board.powerupTiles = new Map();
  let placed = 0;
  let attempts = 0;
  while (placed < count && attempts < 500) {
    attempts++;
    const idx = randInt(rng, N, total - N - 1);
    if (board.tiles[idx].type !== "normal") continue;
    const pool = POWERUP_POOL.flatMap((p) => Array(POWERUP_WEIGHTS[p]).fill(p));
    const id = pick(rng, pool);
    board.powerupTiles.set(idx, id);
    board.tiles[idx].type = "powerup";
    placed++;
  }
}

function verifyReachable(board) {
  const total = board.totalTiles;
  const visited = new Array(total).fill(false);
  const queue = [0];
  visited[0] = true;
  while (queue.length) {
    const cur = queue.shift();
    if (cur === total - 1) return true;
    for (let d = 1; d <= 6; d++) {
      let nxt = cur + d;
      if (nxt >= total) continue;
      const snake = board.snakes.find((s) => s.headTile === nxt);
      if (snake) nxt = snake.tailTile;
      const ladder = board.ladders.find((l) => l.bottomTile === nxt);
      if (ladder) nxt = ladder.topTile;
      if (!visited[nxt]) {
        visited[nxt] = true;
        queue.push(nxt);
      }
    }
  }
  return false;
}
