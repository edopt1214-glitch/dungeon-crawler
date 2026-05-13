// Mulberry32 — fast, quality seeded PRNG
export function createRNG(seed) {
  let s = seed >>> 0;
  return function () {
    s += 0x6D2B79F5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randInt(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}

export function randChoice(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

export function shuffle(rng, arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Chebyshev distance — matches 8-directional movement
export function chebyshev(x1, y1, x2, y2) {
  return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
}

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// Dim a hex color by a factor [0..1]
export function dimColor(hex, factor) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.floor(r * factor)},${Math.floor(g * factor)},${Math.floor(b * factor)})`;
}

// BFS: returns the next step from (sx,sy) toward (gx,gy), or null if unreachable.
// isPassable(x, y) → bool  determines walkability (caller provides context).
export function bfsStep(sx, sy, gx, gy, mapW, mapH, isPassable) {
  if (sx === gx && sy === gy) return null;

  const size   = mapW * mapH;
  const visited = new Uint8Array(size);
  const parent  = new Int32Array(size).fill(-1);

  const startIdx = sy * mapW + sx;
  const goalIdx  = gy * mapW + gx;

  visited[startIdx] = 1;
  const queue = [startIdx];

  const DIRS = [-mapW - 1, -mapW, -mapW + 1, -1, 1, mapW - 1, mapW, mapW + 1];
  const DX   = [-1, 0, 1, -1, 1, -1, 0, 1];
  const DY   = [-1, -1, -1, 0, 0, 1, 1, 1];

  let head = 0;
  while (head < queue.length) {
    const cur = queue[head++];
    if (cur === goalIdx) break;

    const cx = cur % mapW;
    const cy = (cur - cx) / mapW;

    for (let d = 0; d < 8; d++) {
      const nx = cx + DX[d];
      const ny = cy + DY[d];
      if (nx < 0 || ny < 0 || nx >= mapW || ny >= mapH) continue;
      const nidx = ny * mapW + nx;
      if (visited[nidx]) continue;
      if (!isPassable(nx, ny)) continue;
      visited[nidx] = 1;
      parent[nidx] = cur;
      queue.push(nidx);
    }
  }

  if (!visited[goalIdx]) return null;

  // Trace back to find the step immediately after start
  let cur = goalIdx;
  while (parent[cur] !== startIdx) {
    cur = parent[cur];
    if (cur === -1 || cur === startIdx) return null;
  }
  return { x: cur % mapW, y: Math.floor(cur / mapW) };
}

// BFS: returns a gradient map (distance from goal), useful for fleeing
export function bfsGradient(gx, gy, mapW, mapH, isPassable) {
  const size = mapW * mapH;
  const dist = new Int32Array(size).fill(-1);
  const goalIdx = gy * mapW + gx;
  dist[goalIdx] = 0;
  const queue = [goalIdx];

  const DX = [-1, 0, 1, -1, 1, -1, 0, 1];
  const DY = [-1, -1, -1, 0, 0, 1, 1, 1];

  let head = 0;
  while (head < queue.length) {
    const cur = queue[head++];
    const cx = cur % mapW;
    const cy = (cur - cx) / mapW;
    for (let d = 0; d < 8; d++) {
      const nx = cx + DX[d];
      const ny = cy + DY[d];
      if (nx < 0 || ny < 0 || nx >= mapW || ny >= mapH) continue;
      const nidx = ny * mapW + nx;
      if (dist[nidx] !== -1) continue;
      if (!isPassable(nx, ny)) continue;
      dist[nidx] = dist[cur] + 1;
      queue.push(nidx);
    }
  }
  return dist;
}
