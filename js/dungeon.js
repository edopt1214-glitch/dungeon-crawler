import { TILE, VIS, MAP_WIDTH, MAP_HEIGHT, FLOOR_CONFIG, MONSTER_TEMPLATES, ITEM_TEMPLATES } from './constants.js';
import { randInt, randChoice, shuffle } from './utils.js';

// ── Room ─────────────────────────────────────────────────────────────────────
class Room {
  constructor(x, y, w, h) {
    this.x = x; this.y = y; this.w = w; this.h = h;
  }

  get cx() { return Math.floor(this.x + this.w / 2); }
  get cy() { return Math.floor(this.y + this.h / 2); }

  randomPoint(rng) {
    return {
      x: randInt(rng, this.x + 1, this.x + this.w - 2),
      y: randInt(rng, this.y + 1, this.y + this.h - 2),
    };
  }
}

// ── BSP Node ──────────────────────────────────────────────────────────────────
class BSPNode {
  constructor(x, y, w, h) {
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.left  = null;
    this.right = null;
    this.room  = null;
  }

  get isLeaf() { return this.left === null && this.right === null; }

  // Returns the (any) room inside this subtree — used for corridor connection
  getRoom() {
    if (this.room) return this.room;
    if (this.left  && this.left.getRoom())  return this.left.getRoom();
    if (this.right && this.right.getRoom()) return this.right.getRoom();
    return null;
  }

  // Collect all leaf rooms in visitation order
  collectRooms(out) {
    if (this.isLeaf) { if (this.room) out.push(this.room); return; }
    this.left?.collectRooms(out);
    this.right?.collectRooms(out);
  }

  // Recursive split — returns false if too small to split
  split(rng, minLeafSize = 10, depth = 0, maxDepth = 5) {
    if (!this.isLeaf) return false;
    if (depth >= maxDepth) return false;
    if (this.w < minLeafSize * 2 && this.h < minLeafSize * 2) return false;

    // Decide split axis: prefer to split the longer dimension
    let horizontal;
    if (this.w > this.h && this.w >= minLeafSize * 2) {
      horizontal = false;
    } else if (this.h >= minLeafSize * 2) {
      horizontal = true;
    } else {
      horizontal = false;
    }

    const max  = horizontal ? this.h : this.w;
    if (max < minLeafSize * 2) return false;

    // Split position: 40–60% of the relevant dimension
    const lo   = Math.max(minLeafSize, Math.floor(max * 0.4));
    const hi   = Math.min(max - minLeafSize, Math.floor(max * 0.6));
    const split = lo >= hi ? lo : randInt(rng, lo, hi);

    if (horizontal) {
      this.left  = new BSPNode(this.x, this.y,           this.w, split);
      this.right = new BSPNode(this.x, this.y + split,   this.w, this.h - split);
    } else {
      this.left  = new BSPNode(this.x,         this.y,   split,          this.h);
      this.right = new BSPNode(this.x + split, this.y,   this.w - split, this.h);
    }

    this.left.split(rng,  minLeafSize, depth + 1, maxDepth);
    this.right.split(rng, minLeafSize, depth + 1, maxDepth);
    return true;
  }

  // Place a room inside each leaf node, carving tiles to FLOOR
  createRooms(rng, tiles, mapW) {
    if (this.isLeaf) {
      // Inset room by a random 1–3 tile margin from the region edge
      const padX = randInt(rng, 1, Math.min(3, Math.floor(this.w / 4)));
      const padY = randInt(rng, 1, Math.min(3, Math.floor(this.h / 4)));
      const rx = this.x + padX;
      const ry = this.y + padY;
      const rw = this.w - padX * 2;
      const rh = this.h - padY * 2;

      if (rw < 3 || rh < 3) return; // region too small

      this.room = new Room(rx, ry, rw, rh);

      for (let y = ry; y < ry + rh; y++) {
        for (let x = rx; x < rx + rw; x++) {
          tiles[y * mapW + x] = TILE.FLOOR;
        }
      }
    } else {
      this.left?.createRooms(rng, tiles, mapW);
      this.right?.createRooms(rng, tiles, mapW);
    }
  }

  // Connect each pair of sibling rooms with an L-shaped corridor
  connectRooms(rng, tiles, mapW) {
    if (this.isLeaf) return;
    this.left?.connectRooms(rng, tiles, mapW);
    this.right?.connectRooms(rng, tiles, mapW);

    const roomA = this.left?.getRoom();
    const roomB = this.right?.getRoom();
    if (!roomA || !roomB) return;

    carveCorridor(rng, tiles, mapW, roomA.cx, roomA.cy, roomB.cx, roomB.cy);
  }
}

// ── Corridor carving ──────────────────────────────────────────────────────────
function carveCorridor(rng, tiles, mapW, x1, y1, x2, y2) {
  const carve = (x, y) => {
    if (x > 0 && y > 0) tiles[y * mapW + x] = TILE.FLOOR;
  };

  if (rng() < 0.5) {
    // Horizontal then vertical
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) carve(x, y1);
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) carve(x2, y);
  } else {
    // Vertical then horizontal
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) carve(x1, y);
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) carve(x, y2);
  }
}

// ── MapData ───────────────────────────────────────────────────────────────────
export class MapData {
  constructor(width, height) {
    this.width  = width;
    this.height = height;
    this.tiles      = new Uint8Array(width * height); // TILE values
    this.visibility = new Uint8Array(width * height); // VIS values
    this.rooms = [];
  }

  idx(x, y) { return y * this.width + x; }

  inBounds(x, y) { return x >= 0 && y >= 0 && x < this.width && y < this.height; }

  getTile(x, y) { return this.inBounds(x, y) ? this.tiles[this.idx(x, y)] : TILE.WALL; }

  isWalkable(x, y) {
    return this.inBounds(x, y) && this.tiles[this.idx(x, y)] !== TILE.WALL;
  }

  isOpaque(x, y) {
    return !this.inBounds(x, y) || this.tiles[this.idx(x, y)] === TILE.WALL;
  }

  getVis(x, y) { return this.inBounds(x, y) ? this.visibility[this.idx(x, y)] : VIS.UNSEEN; }

  setVisible(x, y) {
    if (this.inBounds(x, y)) this.visibility[this.idx(x, y)] = VIS.VISIBLE;
  }

  // Fade all currently-visible tiles to remembered
  fadeVisible() {
    for (let i = 0; i < this.visibility.length; i++) {
      if (this.visibility[i] === VIS.VISIBLE) this.visibility[i] = VIS.REMEMBERED;
    }
  }

  // Reveal everything (Scroll of Mapping)
  revealAll() {
    for (let i = 0; i < this.visibility.length; i++) {
      if (this.visibility[i] === VIS.UNSEEN) this.visibility[i] = VIS.REMEMBERED;
    }
  }
}

// ── Main generator ────────────────────────────────────────────────────────────
export function generateDungeon(depth, rng) {
  const W = MAP_WIDTH, H = MAP_HEIGHT;
  const map = new MapData(W, H);

  // BSP split and room creation
  const root = new BSPNode(1, 1, W - 2, H - 2);
  root.split(rng, 8, 0, 5);
  root.createRooms(rng, map.tiles, W);
  root.connectRooms(rng, map.tiles, W);

  const rooms = [];
  root.collectRooms(rooms);
  if (rooms.length === 0) {
    // Fallback: single central room
    const r = new Room(10, 10, 60, 30);
    for (let y = r.y; y < r.y + r.h; y++)
      for (let x = r.x; x < r.x + r.w; x++)
        map.tiles[y * W + x] = TILE.FLOOR;
    rooms.push(r);
  }
  map.rooms = rooms;

  // Stairs placement
  const firstRoom = rooms[0];
  const lastRoom  = rooms[rooms.length - 1];

  map.tiles[firstRoom.cy * W + firstRoom.cx] = TILE.STAIRS_UP;
  map.tiles[lastRoom.cy  * W + lastRoom.cx]  = TILE.STAIRS_DOWN;

  map.startPos  = { x: firstRoom.cx, y: firstRoom.cy };
  map.stairsPos = { x: lastRoom.cx,  y: lastRoom.cy  };

  // Spawn lists (returned for game.js to instantiate)
  const config = FLOOR_CONFIG[Math.min(depth, FLOOR_CONFIG.length - 1)];
  map.spawnMonsters = buildMonsterSpawns(rng, rooms, config, depth);
  map.spawnItems    = buildItemSpawns(rng, rooms, config, depth);

  return map;
}

// ── Entity spawn data builders ────────────────────────────────────────────────
function buildMonsterSpawns(rng, rooms, config, depth) {
  const spawns = [];
  const count  = randInt(rng, ...config.monsterCount);
  const pool   = config.monsters;

  // Skip first room (player start) and last room (stairs down)
  const usable = rooms.slice(1, -1).length > 0 ? rooms.slice(1, -1) : rooms.slice(1);

  for (let i = 0; i < count && usable.length > 0; i++) {
    const room = randChoice(rng, usable);
    const pt   = room.randomPoint(rng);
    const tmpl = MONSTER_TEMPLATES[randChoice(rng, pool)];
    spawns.push({ templateId: tmpl.id, x: pt.x, y: pt.y });
  }
  return spawns;
}

function buildItemSpawns(rng, rooms, config, depth) {
  const spawns = [];
  const count  = randInt(rng, ...config.itemCount);

  // Weighted item pool by depth
  const pool = buildItemPool(depth);
  const usable = rooms.length > 1 ? rooms.slice(1) : rooms;

  for (let i = 0; i < count && usable.length > 0; i++) {
    const room   = randChoice(rng, usable);
    const pt     = room.randomPoint(rng);
    const itemId = randChoice(rng, pool);
    spawns.push({ templateId: itemId, x: pt.x, y: pt.y });
  }
  return spawns;
}

function buildItemPool(depth) {
  const pool = [];
  // Potions always available
  pool.push('potion_minor', 'potion_minor', 'potion_minor');
  if (depth >= 4) pool.push('potion_major');
  if (depth >= 6) pool.push('potion_major');

  // Weapons scale with depth
  if (depth <= 4) pool.push('weapon_dagger');
  if (depth >= 3) pool.push('weapon_sword');
  if (depth >= 6) pool.push('weapon_axe');

  // Armor scales with depth
  if (depth <= 5) pool.push('armor_leather');
  if (depth >= 3) pool.push('armor_chain');
  if (depth >= 7) pool.push('armor_plate');

  // Scrolls from mid-game
  if (depth >= 4) pool.push('scroll_fireball');
  if (depth >= 5) pool.push('scroll_mapping');

  return pool;
}
