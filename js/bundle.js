(function () {
'use strict';

// ─────────────────────────────────────────────────────────────
// constants.js
// ─────────────────────────────────────────────────────────────
const TILE = { WALL: 0, FLOOR: 1, STAIRS_DOWN: 2, STAIRS_UP: 3 };
const VIS  = { UNSEEN: 0, REMEMBERED: 1, VISIBLE: 2 };

const COLORS = {
  WALL_FG: '#4a4a4a', WALL_BG: '#0d0d0d',
  FLOOR_FG: '#2a2a2a', FLOOR_BG: '#141414',
  STAIRS_DOWN_FG: '#ffff44', STAIRS_UP_FG: '#ffaa44',
  PLAYER: '#ffffff',
  RAT: '#888888', GOBLIN: '#55aa55', ORC: '#448844',
  TROLL: '#336633', NECROMANCER: '#bb44bb',
  GOBLIN_ARCHER: '#66bb66', SKELETON: '#ccccaa', SLIME: '#44bb44',
  SLIME_SMALL: '#88cc88', DARK_ELF: '#9966cc',
  GOBLIN_KING: '#22cc22', ORC_WARCHIEF: '#55aa33', LICH: '#cc44ff',
  POTION: '#ff5555', POTION_MAJOR: '#ff9999',
  WEAPON: '#bbbb55', WEAPON_SWORD: '#cccc66', WEAPON_AXE: '#dddd88',
  ARMOR: '#5555bb', ARMOR_CHAIN: '#7777cc', ARMOR_PLATE: '#9999dd',
  SCROLL: '#55aaff', SCROLL_MAPPING: '#aaddff',
  GOLD: '#ffaa00',
};

const MONSTER_TEMPLATES = {
  rat: {
    id: 'rat', name: 'Rat', glyph: 'r', color: COLORS.RAT,
    hp: 5, attack: 1, defense: 0, speed: 100, xpValue: 10, alertRange: 4,
    lootTable: [{ id: 'gold', chance: 0.50, amount: [15, 45] }],
  },
  goblin: {
    id: 'goblin', name: 'Goblin', glyph: 'g', color: COLORS.GOBLIN,
    hp: 12, attack: 2, defense: 1, speed: 100, xpValue: 25, alertRange: 6,
    retreatBelow: 0.3,
    lootTable: [
      { id: 'gold', chance: 0.60, amount: [30, 120] },
      { id: 'potion_minor', chance: 0.10 },
    ],
  },
  orc: {
    id: 'orc', name: 'Orc', glyph: 'o', color: COLORS.ORC,
    hp: 25, attack: 7, defense: 3, speed: 100, xpValue: 50, alertRange: 5,
    lootTable: [
      { id: 'gold', chance: 0.75, amount: [75, 225] },
      { id: 'potion_minor', chance: 0.15 },
      { id: 'weapon_dagger', chance: 0.10 },
      { id: 'armor_leather', chance: 0.08 },
    ],
  },
  troll: {
    id: 'troll', name: 'Troll', glyph: 'T', color: COLORS.TROLL,
    hp: 50, attack: 10, defense: 5, speed: 60, xpValue: 120, alertRange: 6,
    regenPerTurn: 2,
    lootTable: [
      { id: 'gold', chance: 0.85, amount: [150, 375] },
      { id: 'potion_major', chance: 0.20 },
      { id: 'weapon_sword', chance: 0.10 },
      { id: 'armor_chain', chance: 0.10 },
    ],
  },
  necromancer: {
    id: 'necromancer', name: 'Necromancer', glyph: 'N', color: COLORS.NECROMANCER,
    hp: 18, attack: 6, defense: 2, speed: 100, xpValue: 200, alertRange: 8,
    preferDistMin: 4, preferDistMax: 6, summonEvery: 4,
    lootTable: [
      { id: 'gold', chance: 0.90, amount: [225, 600] },
      { id: 'scroll_fireball', chance: 0.30 },
      { id: 'scroll_mapping', chance: 0.20 },
      { id: 'potion_major', chance: 0.25 },
    ],
  },
  goblin_archer: {
    id: 'goblin_archer', name: 'Goblin Archer', glyph: 'g', color: '#66bb66',
    hp: 8, attack: 5, defense: 0, speed: 100, xpValue: 30, alertRange: 8,
    isRanged: true, rangeMax: 6,
    lootTable: [
      { id: 'gold', chance: 0.55, amount: [15, 75] },
    ],
  },
  skeleton: {
    id: 'skeleton', name: 'Skeleton', glyph: 's', color: '#ccccaa',
    hp: 15, attack: 5, defense: 2, speed: 80, xpValue: 35, alertRange: 6,
    lootTable: [
      { id: 'gold', chance: 0.55, amount: [30, 90] },
    ],
  },
  slime: {
    id: 'slime', name: 'Slime', glyph: 'S', color: '#44bb44',
    hp: 18, attack: 3, defense: 1, speed: 60, xpValue: 20, alertRange: 4,
    splits: true,
    lootTable: [],
  },
  slime_small: {
    id: 'slime_small', name: 'Small Slime', glyph: 's', color: '#88cc88',
    hp: 8, attack: 2, defense: 0, speed: 60, xpValue: 10, alertRange: 4,
    lootTable: [],
  },
  dark_elf: {
    id: 'dark_elf', name: 'Dark Elf', glyph: 'E', color: '#9966cc',
    hp: 20, attack: 8, defense: 2, speed: 120, xpValue: 60, alertRange: 7,
    retreatBelow: 0.2,
    lootTable: [
      { id: 'gold', chance: 0.70, amount: [75, 225] },
      { id: 'weapon_dagger', chance: 0.12 },
    ],
  },
  goblin_king: {
    id: 'goblin_king', name: 'Goblin King', glyph: 'G', color: '#22cc22',
    hp: 80, attack: 9, defense: 4, speed: 100, xpValue: 300, alertRange: 8,
    isBoss: true, summonEvery: 5, cleave: true,
    lootTable: [
      { id: 'gold', chance: 1.0, amount: [300, 750] },
      { id: 'potion_major', chance: 0.50 },
      { id: 'weapon_sword', chance: 0.30 },
    ],
  },
  orc_warchief: {
    id: 'orc_warchief', name: 'Orc Warchief', glyph: 'O', color: '#55aa33',
    hp: 130, attack: 14, defense: 7, speed: 100, xpValue: 500, alertRange: 7,
    isBoss: true, enrageBelow: 0.5,
    lootTable: [
      { id: 'gold', chance: 1.0, amount: [600, 1200] },
      { id: 'potion_major', chance: 0.70 },
      { id: 'weapon_axe', chance: 0.40 },
      { id: 'armor_chain', chance: 0.30 },
    ],
  },
  lich: {
    id: 'lich', name: 'Lich', glyph: 'L', color: '#cc44ff',
    hp: 100, attack: 12, defense: 5, speed: 100, xpValue: 1000, alertRange: 10,
    isBoss: true, isRanged: true, rangeMax: 8, preferDistMin: 3, preferDistMax: 7,
    summonEvery: 3, lichShield: 3,
    lootTable: [
      { id: 'gold', chance: 1.0, amount: [900, 1800] },
      { id: 'scroll_fireball', chance: 0.80 },
      { id: 'potion_major', chance: 0.80 },
      { id: 'armor_plate', chance: 0.40 },
    ],
  },
};

const ITEM_TEMPLATES = {
  gold:            { id: 'gold',            name: 'Gold',                    glyph: '$', color: COLORS.GOLD,           itemType: 'gold',       stackable: true,  description: 'Shiny coins.' },
  potion_minor:    { id: 'potion_minor',    name: 'Healing Potion',          glyph: '!', color: COLORS.POTION,         itemType: 'consumable', stackable: true,  stats: { healAmount: 15 }, description: 'Restores 15 HP.' },
  potion_major:    { id: 'potion_major',    name: 'Greater Healing Potion',  glyph: '!', color: COLORS.POTION_MAJOR,   itemType: 'consumable', stackable: true,  stats: { healAmount: 30 }, description: 'Restores 30 HP.' },
  weapon_dagger:   { id: 'weapon_dagger',   name: 'Dagger',                  glyph: '/', color: COLORS.WEAPON,         itemType: 'weapon',     stats: { attack: 3 },   description: '+3 attack.' },
  weapon_sword:    { id: 'weapon_sword',    name: 'Sword',                   glyph: '/', color: COLORS.WEAPON_SWORD,   itemType: 'weapon',     stats: { attack: 6 },   description: '+6 attack.' },
  weapon_axe:      { id: 'weapon_axe',      name: 'Battle Axe',              glyph: '/', color: COLORS.WEAPON_AXE,    itemType: 'weapon',     stats: { attack: 10 },  description: '+10 attack.' },
  armor_leather:   { id: 'armor_leather',   name: 'Leather Armor',           glyph: '[', color: COLORS.ARMOR,          itemType: 'armor',      stats: { defense: 2 },  description: '+2 defense.' },
  armor_chain:     { id: 'armor_chain',     name: 'Chain Mail',              glyph: '[', color: COLORS.ARMOR_CHAIN,    itemType: 'armor',      stats: { defense: 4 },  description: '+4 defense.' },
  armor_plate:     { id: 'armor_plate',     name: 'Plate Armor',             glyph: '[', color: COLORS.ARMOR_PLATE,    itemType: 'armor',      stats: { defense: 7 },  description: '+7 defense.' },
  boots_leather:   { id: 'boots_leather',   name: 'Leather Boots',           glyph: 'b', color: '#aa8855',             itemType: 'boots',      stats: { defense: 1 },  description: '+1 DEF. Halves spike trap damage.' },
  boots_iron:      { id: 'boots_iron',      name: 'Iron Boots',              glyph: 'b', color: '#9999bb',             itemType: 'boots',      stats: { defense: 2 },  description: '+2 DEF. Immune to spike traps.' },
  helmet_leather:  { id: 'helmet_leather',  name: 'Leather Helmet',          glyph: '^', color: '#aa8855',             itemType: 'helmet',     stats: { defense: 1 },  description: '+1 DEF.' },
  helmet_iron:     { id: 'helmet_iron',     name: 'Iron Helmet',             glyph: '^', color: '#9999bb',             itemType: 'helmet',     stats: { defense: 2, maxHp: 5 }, description: '+2 DEF, +5 Max HP.' },
  scroll_fireball: { id: 'scroll_fireball', name: 'Scroll of Fireball',      glyph: '?', color: COLORS.SCROLL,         itemType: 'scroll',     stats: { damage: 15 },  description: 'Deals 15 damage to all visible enemies.' },
  scroll_mapping:  { id: 'scroll_mapping',  name: 'Scroll of Mapping',       glyph: '?', color: COLORS.SCROLL_MAPPING, itemType: 'scroll',                             description: 'Reveals the entire floor.' },
};

const FLOOR_CONFIG = [
  null,
  { monsters: ['rat', 'goblin'],                                                          boss: null,           monsterCount: [12, 15], itemCount: [4, 6], trapCount: [1, 2], killsRequired: 10 },
  { monsters: ['goblin', 'orc', 'skeleton', 'goblin_archer', 'dark_elf', 'slime'],        boss: 'orc_warchief', monsterCount: [18, 24], itemCount: [4, 7], trapCount: [2, 4], killsRequired: 15 },
  { monsters: ['orc', 'troll', 'skeleton', 'dark_elf', 'necromancer', 'lich', 'slime'],   boss: 'goblin_king',  monsterCount: [24, 32], itemCount: [5, 8], trapCount: [3, 6], killsRequired: 20 },
];

// Shop catalog shown in floor-complete dialog (indexed by the floor just cleared)
const SHOP_BY_DEPTH = [
  null,
  // Cleared floor 1 → shop before floor 2
  [
    { id: 'potion_minor',   price: 75 },
    { id: 'potion_major',   price: 150 },
    { id: 'weapon_dagger',  price: 125 },
    { id: 'armor_leather',  price: 100 },
    { id: 'boots_leather',  price: 90 },
    { id: 'helmet_leather', price: 90 },
  ],
  // Cleared floor 2 → shop before floor 3
  [
    { id: 'potion_major',    price: 150 },
    { id: 'scroll_fireball', price: 200 },
    { id: 'weapon_sword',    price: 275 },
    { id: 'armor_chain',     price: 250 },
    { id: 'boots_iron',      price: 190 },
    { id: 'helmet_iron',     price: 190 },
  ],
];

// Always-visible sidebar shop (items unlock by depth)
const SHOP_CATALOG = [
  { id: 'potion_minor',    price: 75,  minDepth: 1 },
  { id: 'potion_major',    price: 150, minDepth: 1 },
  { id: 'scroll_mapping',  price: 120, minDepth: 1 },
  { id: 'weapon_dagger',   price: 125, minDepth: 1 },
  { id: 'armor_leather',   price: 100, minDepth: 1 },
  { id: 'boots_leather',   price: 90,  minDepth: 1 },
  { id: 'helmet_leather',  price: 90,  minDepth: 1 },
  { id: 'scroll_fireball', price: 200, minDepth: 2 },
  { id: 'weapon_sword',    price: 275, minDepth: 2 },
  { id: 'armor_chain',     price: 250, minDepth: 2 },
  { id: 'boots_iron',      price: 190, minDepth: 2 },
  { id: 'helmet_iron',     price: 190, minDepth: 2 },
  { id: 'weapon_axe',      price: 450, minDepth: 3 },
  { id: 'armor_plate',     price: 400, minDepth: 3 },
];

// ── Persistent storage helpers ────────────────────────────────
function loadBankGold() {
  return parseInt(localStorage.getItem('dc_bank_gold') || '0', 10);
}
function saveBankGold(gold) {
  localStorage.setItem('dc_bank_gold', String(Math.max(0, gold)));
}
function loadGameStats() {
  const raw = localStorage.getItem('dc_game_stats');
  const defaults = {
    floorAttempts:    [0, 0, 0, 0],
    floorCompletions: [0, 0, 0, 0],
    floorDeaths:      [0, 0, 0, 0],
    victories: 0,
  };
  if (!raw) return defaults;
  const s = JSON.parse(raw);
  // Merge in case new keys were added
  return {
    floorAttempts:    s.floorAttempts    || defaults.floorAttempts,
    floorCompletions: s.floorCompletions || defaults.floorCompletions,
    floorDeaths:      s.floorDeaths      || defaults.floorDeaths,
    victories:        s.victories        || 0,
  };
}
function saveGameStats(s) {
  localStorage.setItem('dc_game_stats', JSON.stringify(s));
}

const MAP_WIDTH       = 80;
const MAP_HEIGHT      = 50;
const MAX_DEPTH       = 3;
const MAX_INVENTORY   = 26;
const FOV_RADIUS_BASE = 8;

const RARITY = {
  COMMON:    { id: 'common',    name: 'Common',    color: '#aaaaaa', mult: 1.0 },
  UNCOMMON:  { id: 'uncommon',  name: 'Uncommon',  color: '#44dd44', mult: 1.3 },
  RARE:      { id: 'rare',      name: 'Rare',      color: '#4499ff', mult: 1.7 },
  EPIC:      { id: 'epic',      name: 'Epic',      color: '#aa44ff', mult: 2.2 },
  LEGENDARY: { id: 'legendary', name: 'Legendary', color: '#ffaa00', mult: 3.0 },
};

function rollRarity(rng, depth) {
  const r = rng();
  // Higher depth = better chances
  if (depth >= 3) {
    if (r < 0.05) return RARITY.LEGENDARY;
    if (r < 0.15) return RARITY.EPIC;
    if (r < 0.35) return RARITY.RARE;
    if (r < 0.60) return RARITY.UNCOMMON;
    return RARITY.COMMON;
  }
  if (depth >= 2) {
    if (r < 0.02) return RARITY.LEGENDARY;
    if (r < 0.08) return RARITY.EPIC;
    if (r < 0.22) return RARITY.RARE;
    if (r < 0.45) return RARITY.UNCOMMON;
    return RARITY.COMMON;
  }
  if (r < 0.01) return RARITY.LEGENDARY;
  if (r < 0.04) return RARITY.EPIC;
  if (r < 0.12) return RARITY.RARE;
  if (r < 0.30) return RARITY.UNCOMMON;
  return RARITY.COMMON;
}

// ─────────────────────────────────────────────────────────────
// utils.js
// ─────────────────────────────────────────────────────────────
function createRNG(seed) {
  let s = seed >>> 0;
  return function () {
    s += 0x6D2B79F5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randInt(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}

function randChoice(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function chebyshev(x1, y1, x2, y2) {
  return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function dimColor(hex, factor) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.floor(r * factor)},${Math.floor(g * factor)},${Math.floor(b * factor)})`;
}

function bfsStep(sx, sy, gx, gy, mapW, mapH, isPassable) {
  if (sx === gx && sy === gy) return null;
  const size    = mapW * mapH;
  const visited = new Uint8Array(size);
  const parent  = new Int32Array(size).fill(-1);
  const startIdx = sy * mapW + sx;
  const goalIdx  = gy * mapW + gx;
  visited[startIdx] = 1;
  const queue = [startIdx];
  const DX = [-1, 0, 1, -1, 1, -1, 0, 1];
  const DY = [-1, -1, -1, 0, 0, 1, 1, 1];
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
  let cur = goalIdx;
  while (parent[cur] !== startIdx) {
    cur = parent[cur];
    if (cur === -1 || cur === startIdx) return null;
  }
  return { x: cur % mapW, y: Math.floor(cur / mapW) };
}

function bfsGradient(gx, gy, mapW, mapH, isPassable) {
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

// ─────────────────────────────────────────────────────────────
// dungeon.js
// ─────────────────────────────────────────────────────────────
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

class BSPNode {
  constructor(x, y, w, h) {
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.left = null; this.right = null; this.room = null;
  }
  get isLeaf() { return this.left === null && this.right === null; }
  getRoom() {
    if (this.room) return this.room;
    if (this.left  && this.left.getRoom())  return this.left.getRoom();
    if (this.right && this.right.getRoom()) return this.right.getRoom();
    return null;
  }
  collectRooms(out) {
    if (this.isLeaf) { if (this.room) out.push(this.room); return; }
    this.left?.collectRooms(out);
    this.right?.collectRooms(out);
  }
  split(rng, minLeafSize = 10, depth = 0, maxDepth = 5) {
    if (!this.isLeaf) return false;
    if (depth >= maxDepth) return false;
    if (this.w < minLeafSize * 2 && this.h < minLeafSize * 2) return false;
    let horizontal;
    if (this.w > this.h && this.w >= minLeafSize * 2) {
      horizontal = false;
    } else if (this.h >= minLeafSize * 2) {
      horizontal = true;
    } else {
      horizontal = false;
    }
    const max = horizontal ? this.h : this.w;
    if (max < minLeafSize * 2) return false;
    const lo    = Math.max(minLeafSize, Math.floor(max * 0.4));
    const hi    = Math.min(max - minLeafSize, Math.floor(max * 0.6));
    const split = lo >= hi ? lo : randInt(rng, lo, hi);
    if (horizontal) {
      this.left  = new BSPNode(this.x, this.y,         this.w, split);
      this.right = new BSPNode(this.x, this.y + split, this.w, this.h - split);
    } else {
      this.left  = new BSPNode(this.x,         this.y, split,          this.h);
      this.right = new BSPNode(this.x + split, this.y, this.w - split, this.h);
    }
    this.left.split(rng,  minLeafSize, depth + 1, maxDepth);
    this.right.split(rng, minLeafSize, depth + 1, maxDepth);
    return true;
  }
  createRooms(rng, tiles, mapW) {
    if (this.isLeaf) {
      const padX = randInt(rng, 1, Math.min(3, Math.floor(this.w / 4)));
      const padY = randInt(rng, 1, Math.min(3, Math.floor(this.h / 4)));
      const rx = this.x + padX;
      const ry = this.y + padY;
      const rw = this.w - padX * 2;
      const rh = this.h - padY * 2;
      if (rw < 3 || rh < 3) return;
      this.room = new Room(rx, ry, rw, rh);
      for (let y = ry; y < ry + rh; y++)
        for (let x = rx; x < rx + rw; x++)
          tiles[y * mapW + x] = TILE.FLOOR;
    } else {
      this.left?.createRooms(rng, tiles, mapW);
      this.right?.createRooms(rng, tiles, mapW);
    }
  }
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

function carveCorridor(rng, tiles, mapW, x1, y1, x2, y2) {
  const carve = (x, y) => { if (x > 0 && y > 0) tiles[y * mapW + x] = TILE.FLOOR; };
  if (rng() < 0.5) {
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) carve(x, y1);
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) carve(x2, y);
  } else {
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) carve(x1, y);
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) carve(x, y2);
  }
}

class MapData {
  constructor(width, height) {
    this.width  = width;
    this.height = height;
    this.tiles      = new Uint8Array(width * height);
    this.visibility = new Uint8Array(width * height);
    this.rooms = [];
  }
  idx(x, y)      { return y * this.width + x; }
  inBounds(x, y) { return x >= 0 && y >= 0 && x < this.width && y < this.height; }
  getTile(x, y)  { return this.inBounds(x, y) ? this.tiles[this.idx(x, y)] : TILE.WALL; }
  isWalkable(x, y) { return this.inBounds(x, y) && this.tiles[this.idx(x, y)] !== TILE.WALL; }
  isOpaque(x, y)   { return !this.inBounds(x, y) || this.tiles[this.idx(x, y)] === TILE.WALL; }
  getVis(x, y)     { return this.inBounds(x, y) ? this.visibility[this.idx(x, y)] : VIS.UNSEEN; }
  setVisible(x, y) { if (this.inBounds(x, y)) this.visibility[this.idx(x, y)] = VIS.VISIBLE; }
  fadeVisible() {
    for (let i = 0; i < this.visibility.length; i++)
      if (this.visibility[i] === VIS.VISIBLE) this.visibility[i] = VIS.REMEMBERED;
  }
  revealAll() {
    for (let i = 0; i < this.visibility.length; i++)
      if (this.visibility[i] === VIS.UNSEEN) this.visibility[i] = VIS.REMEMBERED;
  }
}

function generateDungeon(depth, rng) {
  const W = MAP_WIDTH, H = MAP_HEIGHT;
  const map = new MapData(W, H);
  const root = new BSPNode(1, 1, W - 2, H - 2);
  root.split(rng, 8, 0, 5);
  root.createRooms(rng, map.tiles, W);
  root.connectRooms(rng, map.tiles, W);
  const rooms = [];
  root.collectRooms(rooms);
  if (rooms.length === 0) {
    const r = new Room(10, 10, 60, 30);
    for (let y = r.y; y < r.y + r.h; y++)
      for (let x = r.x; x < r.x + r.w; x++)
        map.tiles[y * W + x] = TILE.FLOOR;
    rooms.push(r);
  }
  map.rooms = rooms;
  const firstRoom = rooms[0];
  const lastRoom  = rooms[rooms.length - 1];
  map.tiles[firstRoom.cy * W + firstRoom.cx] = TILE.STAIRS_UP;
  map.tiles[lastRoom.cy  * W + lastRoom.cx]  = TILE.STAIRS_DOWN;
  map.startPos  = { x: firstRoom.cx, y: firstRoom.cy };
  map.stairsPos = { x: lastRoom.cx,  y: lastRoom.cy  };
  const config = FLOOR_CONFIG[Math.min(depth, FLOOR_CONFIG.length - 1)];
  map.spawnMonsters = buildMonsterSpawns(rng, rooms, config, depth);
  map.spawnItems    = buildItemSpawns(rng, rooms, config, depth);
  map.spawnTraps    = buildTrapSpawns(rng, rooms, config, map);
  // Boss always spawns in the last room
  if (config.boss) {
    map.bossSpawn = { templateId: config.boss, x: lastRoom.cx, y: lastRoom.cy };
  }
  return map;
}

function buildMonsterSpawns(rng, rooms, config, depth) {
  const spawns = [];
  const count  = randInt(rng, ...config.monsterCount);
  const pool   = config.monsters;
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
  const pool   = buildItemPool(depth);
  const usable = rooms.length > 1 ? rooms.slice(1) : rooms;
  for (let i = 0; i < count && usable.length > 0; i++) {
    const room   = randChoice(rng, usable);
    const pt     = room.randomPoint(rng);
    const itemId = randChoice(rng, pool);
    spawns.push({ templateId: itemId, x: pt.x, y: pt.y });
  }
  return spawns;
}

function buildTrapSpawns(rng, rooms, config, map) {
  const spawns = [];
  if (!config.trapCount) return spawns;
  const count  = randInt(rng, ...config.trapCount);
  const types  = ['spike', 'spike', 'poison'];   // spikes more common
  // Skip the start room (index 0) for traps
  const usable = rooms.length > 1 ? rooms.slice(1) : rooms;
  let attempts = 0;
  while (spawns.length < count && attempts < count * 10) {
    attempts++;
    const room = randChoice(rng, usable);
    const pt   = room.randomPoint(rng);
    if (!map.isWalkable(pt.x, pt.y)) continue;
    if (spawns.some(t => t.x === pt.x && t.y === pt.y)) continue;
    spawns.push({ x: pt.x, y: pt.y, type: randChoice(rng, types) });
  }
  return spawns;
}

function buildItemPool(depth) {
  const pool = [];
  // Potions scale with depth
  pool.push('potion_minor', 'potion_minor', 'potion_minor');
  if (depth >= 2) pool.push('potion_major');
  if (depth >= 3) pool.push('potion_major');
  // Weapons scale with depth
  pool.push('weapon_dagger');
  if (depth >= 2) pool.push('weapon_sword');
  if (depth >= 3) pool.push('weapon_axe');
  // Armor scales with depth
  pool.push('armor_leather');
  if (depth >= 2) pool.push('armor_chain');
  if (depth >= 3) pool.push('armor_plate');
  // Boots on all floors, iron from floor 2
  pool.push('boots_leather');
  if (depth >= 2) pool.push('boots_iron');
  // Helmets on all floors, iron from floor 2
  pool.push('helmet_leather');
  if (depth >= 2) pool.push('helmet_iron');
  // Scrolls on final level
  if (depth >= 3) pool.push('scroll_fireball', 'scroll_mapping');
  return pool;
}

// ─────────────────────────────────────────────────────────────
// fov.js
// ─────────────────────────────────────────────────────────────
const OCTANTS = [
  [ 1,  0,  0, -1],
  [ 0,  1, -1,  0],
  [ 0, -1, -1,  0],
  [-1,  0,  0, -1],
  [-1,  0,  0,  1],
  [ 0, -1,  1,  0],
  [ 0,  1,  1,  0],
  [ 1,  0,  0,  1],
];

function castLight(map, ox, oy, row, startSlope, endSlope, radius, xx, xy, yx, yy) {
  if (startSlope < endSlope) return;
  let nextStart = startSlope;
  let blocked   = false;
  for (let distance = row; distance <= radius && !blocked; distance++) {
    const dy = -distance;
    for (let dx = -distance; dx <= 0; dx++) {
      const wx = ox + dx * xx + dy * xy;
      const wy = oy + dx * yx + dy * yy;
      const lSlope = (dx - 0.5) / (dy + 0.5);
      const rSlope = (dx + 0.5) / (dy - 0.5);
      if (startSlope < rSlope) continue;
      if (endSlope   > lSlope) break;
      if (dx * dx + dy * dy < radius * radius) map.setVisible(wx, wy);
      if (blocked) {
        if (map.isOpaque(wx, wy)) {
          nextStart = rSlope;
        } else {
          blocked    = false;
          startSlope = nextStart;
        }
      } else if (map.isOpaque(wx, wy) && distance < radius) {
        blocked = true;
        castLight(map, ox, oy, distance + 1, startSlope, lSlope, radius, xx, xy, yx, yy);
        nextStart = rSlope;
      }
    }
  }
}

function computeFOV(map, ox, oy, radius) {
  map.fadeVisible();
  map.setVisible(ox, oy);
  for (const [xx, xy, yx, yy] of OCTANTS)
    castLight(map, ox, oy, 1, 1.0, 0.0, radius, xx, xy, yx, yy);
}

// ─────────────────────────────────────────────────────────────
// entities.js
// ─────────────────────────────────────────────────────────────
class Entity {
  constructor(x, y, glyph, color, name) {
    this.x = x; this.y = y;
    this.glyph = glyph; this.color = color; this.name = name;
  }
}

class Actor extends Entity {
  constructor(x, y, glyph, color, name, hp, attack, defense, speed) {
    super(x, y, glyph, color, name);
    this.maxHp   = hp;   this.hp      = hp;
    this.attack  = attack; this.defense = defense;
    this.speed   = speed;  this.energy  = 0;
    this.statuses = [];
  }
  isAlive()    { return this.hp > 0; }
  takeDamage(amount) {
    const dmg = Math.max(1, amount);
    this.hp = Math.max(0, this.hp - dmg);
    return dmg;
  }
  heal(amount) {
    const healed = Math.min(amount, this.maxHp - this.hp);
    this.hp = Math.min(this.maxHp, this.hp + amount);
    return healed;
  }
  getAttack()  { return this.attack; }
  getDefense() { return this.defense; }
  gainEnergy() { this.energy += this.speed; }
  spendEnergy() { this.energy -= 100; }
  tickStatuses() {
    this.statuses = this.statuses.filter(s => { s.duration--; return s.duration > 0; });
  }
  hasStatus(type) { return this.statuses.some(s => s.type === type); }
  addStatus(type, duration) {
    const existing = this.statuses.find(s => s.type === type);
    if (existing) existing.duration = Math.max(existing.duration, duration);
    else          this.statuses.push({ type, duration });
  }
}

class Player extends Actor {
  constructor(x, y) {
    super(x, y, '@', '#ffffff', 'You', 30, 5, 1, 100);
    this.level      = 1;
    this.xp         = 0;
    this.xpToNext   = 100;
    this.gold       = 0;
    this.inventory  = [];
    this.weapon     = null;
    this.armor      = null;
    this.boots      = null;
    this.helmet     = null;
    this.visionRadius = FOV_RADIUS_BASE;
    this.kills      = 0;
    this.turnCount  = 0;
    this.abilities       = [];
    this.abilityCooldowns = {};
    this.floorKills      = 0;
    this.potionsUsed     = 0;
    this.bossKilled      = false;
    this.hpAtFloorStart  = 30;
  }
  tickAbilityCooldowns() {
    for (const id of Object.keys(this.abilityCooldowns)) {
      this.abilityCooldowns[id]--;
      if (this.abilityCooldowns[id] <= 0) delete this.abilityCooldowns[id];
    }
  }
  useAbility(id) {
    if (this.abilityCooldowns[id] > 0) return false;
    const cooldowns = { dash: 8, battle_cry: 12, heal_surge: 15 };
    this.abilityCooldowns[id] = cooldowns[id] ?? 10;
    return true;
  }
  getAttack()  { return this.attack  + (this.weapon?.scaledStats?.attack  ?? this.weapon?.template.stats?.attack  ?? 0) + (this.hasStatus('buffed') ? 3 : 0); }
  getDefense() {
    return this.defense
      + (this.armor?.scaledStats?.defense   ?? this.armor?.template.stats?.defense   ?? 0)
      + (this.boots?.scaledStats?.defense   ?? this.boots?.template.stats?.defense   ?? 0)
      + (this.helmet?.scaledStats?.defense  ?? this.helmet?.template.stats?.defense  ?? 0);
  }
  gainXP(amount) {
    this.xp += amount;
    const messages = [];
    while (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.levelUp();
      messages.push(`You advance to level ${this.level}! Max HP +8, Attack +2.`);
    }
    return messages;
  }
  levelUp() {
    this.level++;
    this.maxHp += 8;
    this.hp = Math.min(this.hp + 8, this.maxHp);
    this.attack += 2;
    this.xpToNext = 100 * this.level;
    // Unlock abilities at levels 3, 5, 7
    if (this.level === 3 && !this.abilities.includes('dash'))        this.abilities.push('dash');
    if (this.level === 5 && !this.abilities.includes('battle_cry'))  this.abilities.push('battle_cry');
    if (this.level === 7 && !this.abilities.includes('heal_surge'))  this.abilities.push('heal_surge');
  }
  addItem(item) {
    if (this.inventory.length >= MAX_INVENTORY) return false;
    this.inventory.push(item);
    return true;
  }
  removeItem(item) {
    const idx = this.inventory.indexOf(item);
    if (idx === -1) return;
    if (this.weapon === item) this.weapon = null;
    if (this.armor  === item) this.armor  = null;
    if (this.boots  === item) this.boots  = null;
    if (this.helmet === item) {
      this.helmet = null;
      if (item.template.stats?.maxHp) { this.maxHp -= item.template.stats.maxHp; this.hp = Math.min(this.hp, this.maxHp); }
    }
    this.inventory.splice(idx, 1);
  }
  equipItem(item) {
    const type = item.template.itemType;
    if (type === 'weapon') {
      if (this.weapon === item) { this.weapon = null; return `You unequip the ${item.name}.`; }
      this.weapon = item; return `You equip the ${item.name}.`;
    }
    if (type === 'armor') {
      if (this.armor === item) { this.armor = null; return `You unequip the ${item.name}.`; }
      this.armor = item; return `You equip the ${item.name}.`;
    }
    if (type === 'boots') {
      if (this.boots === item) { this.boots = null; return `You remove the ${item.name}.`; }
      this.boots = item; return `You put on the ${item.name}.`;
    }
    if (type === 'helmet') {
      const prev = this.helmet;
      if (prev === item) {
        this.helmet = null;
        if (item.template.stats?.maxHp) { this.maxHp -= item.template.stats.maxHp; this.hp = Math.min(this.hp, this.maxHp); }
        return `You remove the ${item.name}.`;
      }
      if (prev?.template.stats?.maxHp) { this.maxHp -= prev.template.stats.maxHp; this.hp = Math.min(this.hp, this.maxHp); }
      this.helmet = item;
      if (item.template.stats?.maxHp) this.maxHp += item.template.stats.maxHp;
      return `You put on the ${item.name}.`;
    }
    return null;
  }
  isEquipped(item) { return this.weapon === item || this.armor === item || this.boots === item || this.helmet === item; }
  inventoryLetter(item) {
    const idx = this.inventory.indexOf(item);
    return idx === -1 ? '?' : String.fromCharCode(97 + idx);
  }
}

class Monster extends Actor {
  constructor(x, y, templateId) {
    const t = MONSTER_TEMPLATES[templateId];
    super(x, y, t.glyph, t.color, t.name, t.hp, t.attack, t.defense, t.speed);
    this.template       = t;
    this.xpValue        = t.xpValue;
    this.aiState        = 'idle';
    this.lastKnownPos   = null;
    this.lostSightTurns = 0;
    this.summonTick     = 0;
  }
  rollLoot(rng) {
    const drops = [];
    for (const entry of this.template.lootTable) {
      if (rng() < entry.chance) {
        const amount = entry.amount ? randInt(rng, ...entry.amount) : 1;
        drops.push({ templateId: entry.id, x: this.x, y: this.y, amount });
      }
    }
    return drops;
  }
}

class Item extends Entity {
  constructor(x, y, templateId, quantity = 1) {
    const t = ITEM_TEMPLATES[templateId];
    super(x, y, t.glyph, t.color, t.name);
    this.template = t;
    this.quantity = quantity;
  }
  get description() { return this.template.description ?? ''; }
}

class Trap {
  constructor(x, y, type) {
    this.x = x; this.y = y;
    this.type = type;    // 'spike' | 'poison'
    this.revealed = false;
    this.armed    = true;
  }
}

function createMonster(templateId, x, y) { return new Monster(x, y, templateId); }
function createItem(templateId, x, y, quantity = 1) { return new Item(x, y, templateId, quantity); }

// ─────────────────────────────────────────────────────────────
// combat.js
// ─────────────────────────────────────────────────────────────
function resolveMelee(attacker, defender, rng) {
  const variance = rng ? randInt(rng, -2, 2) : 0;
  const raw      = attacker.getAttack() + variance - defender.getDefense();
  const damage   = Math.max(1, raw);
  return { attacker, defender, damage };
}

function applyMelee(result) {
  const { attacker, defender, damage } = result;
  defender.takeDamage(damage);
  if (!defender.isAlive()) return `${attacker.name} kills the ${defender.name}!`;
  return `${attacker.name} hits ${defender.name} for ${damage} damage.`;
}

function resolveRanged(attacker, defender, rng) {
  const variance = rng ? randInt(rng, -1, 1) : 0;
  const damage   = Math.max(1, attacker.getAttack() + variance - Math.floor(defender.getDefense() * 0.5));
  return { attacker, defender, damage, ranged: true };
}

function applyRanged(result) {
  const { attacker, defender, damage } = result;
  defender.takeDamage(damage);
  if (!defender.isAlive()) return `${attacker.name} kills the ${defender.name}!`;
  return `${attacker.name} shoots ${defender.name} for ${damage} damage.`;
}

// ─────────────────────────────────────────────────────────────
// items.js
// ─────────────────────────────────────────────────────────────
function applyItem(item, player, gameState) {
  const t = item.template;
  switch (t.itemType) {
    case 'consumable': return applyConsumable(item, player);
    case 'weapon':
    case 'armor':
    case 'boots':
    case 'helmet':     return applyEquipment(item, player);
    case 'scroll':     return applyScroll(item, player, gameState);
    default:           return { message: `You can't use the ${item.name}.`, type: 'none' };
  }
}

function applyConsumable(item, player) {
  const heal   = item.template.stats?.healAmount ?? 0;
  const actual = player.heal(heal);
  player.removeItem(item);
  return { message: `You drink the ${item.name} and recover ${actual} HP.`, type: 'heal' };
}

function applyEquipment(item, player) {
  const message = player.equipItem(item);
  return { message, type: 'equip' };
}

function applyScroll(item, player, gameState) {
  player.removeItem(item);
  if (item.template.id === 'scroll_fireball') {
    const damage  = item.template.stats?.damage ?? 15;
    const targets = gameState.monsters.filter(m =>
      gameState.map.getVis(m.x, m.y) === 2 && m.isAlive()
    );
    targets.forEach(m => m.takeDamage(damage));
    const killed = targets.filter(m => !m.isAlive()).length;
    const msg = targets.length === 0
      ? 'The scroll crumbles to ash. No enemies are visible.'
      : `Flames engulf ${targets.length} enemy${targets.length > 1 ? 's' : ''}! (${damage} dmg each)${killed ? ` ${killed} slain.` : ''}`;
    return { message: msg, type: 'scroll', targets };
  }
  if (item.template.id === 'scroll_mapping') {
    gameState.map.revealAll();
    return { message: 'The scroll reveals the entire floor!', type: 'scroll' };
  }
  return { message: `You read the ${item.name} but nothing happens.`, type: 'scroll' };
}

// ─────────────────────────────────────────────────────────────
// ai.js
// ─────────────────────────────────────────────────────────────
function decideTurn(monster, state) {
  const { map, player, monsters, rng } = state;
  const t = monster.template;

  if (t.regenPerTurn && monster.hp < monster.maxHp)
    monster.hp = Math.min(monster.maxHp, monster.hp + t.regenPerTurn);

  const canSeePlayer = map.getVis(monster.x, monster.y) === VIS.VISIBLE &&
                       chebyshev(monster.x, monster.y, player.x, player.y) <= t.alertRange;

  if (canSeePlayer) {
    monster.aiState        = determineAlertState(monster, t, player);
    monster.lastKnownPos   = { x: player.x, y: player.y };
    monster.lostSightTurns = 0;
  } else if (monster.aiState !== 'idle') {
    monster.lostSightTurns++;
    if (monster.lostSightTurns >= 5 &&
        monster.x === monster.lastKnownPos?.x &&
        monster.y === monster.lastKnownPos?.y)
      monster.aiState = 'idle';
  }

  switch (monster.aiState) {
    case 'alert':   return alertAction(monster, t, state, canSeePlayer);
    case 'fleeing': return fleeAction(monster, state);
    default:        return idleAction(monster, state);
  }
}

function determineAlertState(monster, template, player) {
  if (!template.retreatBelow) return 'alert';
  const hpRatio = monster.hp / monster.maxHp;
  if (monster.aiState === 'fleeing' && hpRatio < 0.5) return 'fleeing';
  if (hpRatio < template.retreatBelow) return 'fleeing';
  return 'alert';
}

function idleAction(monster, state) {
  const { map, monsters, player, rng } = state;
  if (rng() < 0.5) return { type: 'wait' };
  const dirs = shuffledDirs(rng);
  for (const [dx, dy] of dirs) {
    const nx = monster.x + dx;
    const ny = monster.y + dy;
    if (isPassableForMonster(nx, ny, map, monsters, player, monster))
      return { type: 'move', x: nx, y: ny };
  }
  return { type: 'wait' };
}

function alertAction(monster, template, state, canSeePlayer) {
  const { map, monsters, player, rng } = state;
  const dist = chebyshev(monster.x, monster.y, player.x, player.y);

  // Boss special handling
  if (template.isBoss) return bossAction(monster, template, state, canSeePlayer);

  if (dist === 1) return { type: 'attack', target: player };

  // Ranged attack if applicable
  if (template.isRanged && dist > 1 && dist <= (template.rangeMax || 6) && canSeePlayer)
    return { type: 'ranged_attack', target: player };

  if (template.preferDistMin !== undefined)
    return necromancerAction(monster, template, state);

  const target = canSeePlayer ? { x: player.x, y: player.y } : monster.lastKnownPos;
  if (!target) return { type: 'wait' };
  const step = bfsStep(
    monster.x, monster.y, target.x, target.y,
    map.width, map.height,
    (nx, ny) => isPassableForMonster(nx, ny, map, monsters, player, monster)
  );
  if (step) return { type: 'move', x: step.x, y: step.y };
  return { type: 'wait' };
}

function bossAction(monster, template, state, canSeePlayer) {
  const { map, monsters, player, rng } = state;
  const dist = chebyshev(monster.x, monster.y, player.x, player.y);

  // Goblin King: summon + cleave
  if (template.id === 'goblin_king') {
    monster.summonTick = (monster.summonTick || 0) + 1;
    if (monster.summonTick >= template.summonEvery) {
      monster.summonTick = 0;
      const dirs = shuffledDirs(rng);
      for (const [dx, dy] of dirs) {
        const sx = monster.x + dx, sy = monster.y + dy;
        if (isPassableForMonster(sx, sy, map, monsters, player, monster))
          return { type: 'summon', templateId: 'goblin', x: sx, y: sy };
      }
    }
    if (dist === 1) return { type: 'attack', target: player, cleave: true };
  }

  // Orc Warchief: enrage below 50%
  if (template.id === 'orc_warchief') {
    const enraged = monster.hp / monster.maxHp < (template.enrageBelow || 0.5);
    if (dist === 1) return { type: 'attack', target: player, enraged };
  }

  // Lich: ranged + summon skeletons
  if (template.id === 'lich') {
    monster.summonTick = (monster.summonTick || 0) + 1;
    if (monster.summonTick >= template.summonEvery) {
      monster.summonTick = 0;
      const dirs = shuffledDirs(rng);
      for (const [dx, dy] of dirs) {
        const sx = monster.x + dx, sy = monster.y + dy;
        if (isPassableForMonster(sx, sy, map, monsters, player, monster))
          return { type: 'summon', templateId: 'skeleton', x: sx, y: sy };
      }
    }
    if (dist === 1) return { type: 'attack', target: player };
    if (dist <= template.rangeMax && canSeePlayer) return { type: 'ranged_attack', target: player };
    if (dist < template.preferDistMin) return fleeAction(monster, state);
    if (dist > template.preferDistMax) {
      const step = bfsStep(monster.x, monster.y, player.x, player.y,
        map.width, map.height,
        (nx, ny) => isPassableForMonster(nx, ny, map, monsters, player, monster));
      if (step) return { type: 'move', x: step.x, y: step.y };
    }
    return { type: 'wait' };
  }

  // Generic boss fallback
  if (dist === 1) return { type: 'attack', target: player };
  const target = canSeePlayer ? { x: player.x, y: player.y } : monster.lastKnownPos;
  if (!target) return { type: 'wait' };
  const step = bfsStep(monster.x, monster.y, target.x, target.y,
    map.width, map.height,
    (nx, ny) => isPassableForMonster(nx, ny, map, monsters, player, monster));
  if (step) return { type: 'move', x: step.x, y: step.y };
  return { type: 'wait' };
}

function fleeAction(monster, state) {
  const { map, monsters, player, rng } = state;
  if (chebyshev(monster.x, monster.y, player.x, player.y) === 1)
    return { type: 'attack', target: player };
  const gradient = bfsGradient(player.x, player.y, map.width, map.height,
    (nx, ny) => map.isWalkable(nx, ny));
  let bestDist = -1, bestPos = null;
  const dirs = shuffledDirs(rng);
  for (const [dx, dy] of dirs) {
    const nx = monster.x + dx;
    const ny = monster.y + dy;
    if (!isPassableForMonster(nx, ny, map, monsters, player, monster)) continue;
    const d = gradient[ny * map.width + nx];
    if (d > bestDist) { bestDist = d; bestPos = { x: nx, y: ny }; }
  }
  if (bestPos) return { type: 'move', x: bestPos.x, y: bestPos.y };
  return { type: 'wait' };
}

function necromancerAction(monster, template, state) {
  const { map, monsters, player, rng } = state;
  const dist = chebyshev(monster.x, monster.y, player.x, player.y);
  monster.summonTick = (monster.summonTick || 0) + 1;
  if (monster.summonTick >= template.summonEvery) {
    monster.summonTick = 0;
    const dirs = shuffledDirs(rng);
    for (const [dx, dy] of dirs) {
      const sx = monster.x + dx;
      const sy = monster.y + dy;
      if (isPassableForMonster(sx, sy, map, monsters, player, monster))
        return { type: 'summon', templateId: 'rat', x: sx, y: sy };
    }
  }
  if (dist === 1) return { type: 'attack', target: player };
  if (dist < template.preferDistMin) return fleeAction(monster, state);
  if (dist > template.preferDistMax) {
    const step = bfsStep(monster.x, monster.y, player.x, player.y,
      map.width, map.height,
      (nx, ny) => isPassableForMonster(nx, ny, map, monsters, player, monster));
    if (step) return { type: 'move', x: step.x, y: step.y };
  }
  return { type: 'wait' };
}

function isPassableForMonster(x, y, map, monsters, player, self) {
  if (!map.isWalkable(x, y)) return false;
  if (x === player.x && y === player.y) return false;
  return !monsters.some(m => m !== self && m.x === x && m.y === y);
}

const ALL_DIRS = [
  [-1,-1],[ 0,-1],[ 1,-1],
  [-1, 0],        [ 1, 0],
  [-1, 1],[ 0, 1],[ 1, 1],
];

function shuffledDirs(rng) {
  const a = ALL_DIRS.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─────────────────────────────────────────────────────────────
// renderer.js  — tile-based graphics
// ─────────────────────────────────────────────────────────────

// Rounded-rect path helper
function rRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y,     x + w, y + r,     r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x,     y + h, x,     y + h - r, r);
  ctx.lineTo(x,     y + r);
  ctx.arcTo(x,     y,     x + r, y,         r);
  ctx.closePath();
}

// ── Tile painters — Vibrant Forest (top-down RPG style) ────────

function tileFloor(ctx, px, py, ts, bright) {
  ctx.fillStyle = bright ? '#1a160e' : '#0e0b08';
  ctx.fillRect(px, py, ts, ts);
}

function tileWall(ctx, px, py, ts, bright) {
  if (!bright) {
    ctx.fillStyle = '#0e0b08';
    ctx.fillRect(px, py, ts, ts);
    // Dim tree silhouette
    const cx = px + ts * 0.5, cy = py + ts * 0.5;
    ctx.fillStyle = '#1c4a08';
    ctx.beginPath();
    ctx.arc(cx, cy - ts * 0.06, ts * 0.38, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  // Dark floor base so tree canopy stands out
  tileFloor(ctx, px, py, ts, true);
  const cx = px + ts * 0.5;
  const cy = py + ts * 0.5;

  // Brown trunk — peeking out from under canopy at bottom-center
  if (ts >= 11) {
    const tw = Math.max(2, ts * 0.24);
    const th = ts * 0.30;
    ctx.fillStyle = '#7a4a1e';
    rRect(ctx, cx - tw * 0.5, py + ts - th, tw, th, tw * 0.35);
    ctx.fill();
    // Trunk highlight
    ctx.fillStyle = '#9a6030';
    ctx.fillRect(cx - tw * 0.5 + 1, py + ts - th + 2, Math.max(1, Math.floor(tw * 0.32)), th * 0.65);
  }

  const r  = ts * 0.42;
  const cy2 = cy - ts * 0.08;

  // Drop shadow (offset slightly down-right)
  ctx.fillStyle = 'rgba(10,30,5,0.45)';
  ctx.beginPath();
  ctx.arc(cx + r * 0.1, cy2 + r * 0.1, r * 0.94, 0, Math.PI * 2);
  ctx.fill();

  // Outer canopy edge (dark)
  ctx.fillStyle = '#1c5a08';
  ctx.beginPath();
  ctx.arc(cx, cy2, r * 0.93, 0, Math.PI * 2);
  ctx.fill();

  // Main canopy
  ctx.fillStyle = '#2e8010';
  ctx.beginPath();
  ctx.arc(cx, cy2, r * 0.82, 0, Math.PI * 2);
  ctx.fill();

  // Mid highlight blob
  ctx.fillStyle = '#40a818';
  ctx.beginPath();
  ctx.arc(cx - r * 0.16, cy2 - r * 0.14, r * 0.58, 0, Math.PI * 2);
  ctx.fill();

  // Bright highlight (top-left, simulates sunlight)
  ctx.fillStyle = '#58c820';
  ctx.beginPath();
  ctx.arc(cx - r * 0.26, cy2 - r * 0.24, r * 0.32, 0, Math.PI * 2);
  ctx.fill();

  if (ts >= 14) {
    // Tiny specular tip
    ctx.fillStyle = '#78e030';
    ctx.beginPath();
    ctx.arc(cx - r * 0.32, cy2 - r * 0.32, r * 0.14, 0, Math.PI * 2);
    ctx.fill();
  }
}

function tileStairsDown(ctx, px, py, ts, bright) {
  // Dark earthy pit descending deeper into the forest
  tileFloor(ctx, px, py, ts, bright);
  if (!bright) return;
  const cx = px + ts * 0.5, cy = py + ts * 0.5;
  // Dirt rim
  ctx.fillStyle = '#5a3a10';
  ctx.beginPath(); ctx.arc(cx, cy, ts * 0.36, 0, Math.PI * 2); ctx.fill();
  // Rocky edge
  ctx.fillStyle = '#3a2408';
  ctx.beginPath(); ctx.arc(cx, cy, ts * 0.28, 0, Math.PI * 2); ctx.fill();
  // Dark void
  ctx.fillStyle = '#120c04';
  ctx.beginPath(); ctx.arc(cx, cy, ts * 0.20, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#050200';
  ctx.beginPath(); ctx.arc(cx, cy, ts * 0.12, 0, Math.PI * 2); ctx.fill();
  // Root rim
  ctx.strokeStyle = '#7a5020';
  ctx.lineWidth = Math.max(1.5, ts * 0.07);
  ctx.beginPath(); ctx.arc(cx, cy, ts * 0.35, 0, Math.PI * 2); ctx.stroke();
  // Down arrow
  ctx.fillStyle = '#aaee44';
  const aw = ts * 0.10, ah = ts * 0.12;
  ctx.beginPath();
  ctx.moveTo(cx,      cy + ah * 0.9);
  ctx.lineTo(cx - aw, cy - ah * 0.3);
  ctx.lineTo(cx + aw, cy - ah * 0.3);
  ctx.closePath(); ctx.fill();
}

function tileStairsLocked(ctx, px, py, ts, bright) {
  tileFloor(ctx, px, py, ts, bright);
  if (!bright) return;
  const cx = px + ts * 0.5, cy = py + ts * 0.5;
  ctx.fillStyle = '#5a3a10';
  ctx.beginPath(); ctx.arc(cx, cy, ts * 0.34, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#120c04';
  ctx.beginPath(); ctx.arc(cx, cy, ts * 0.22, 0, Math.PI * 2); ctx.fill();
  const r = ts * 0.19;
  ctx.strokeStyle = '#cc2222';
  ctx.lineWidth = Math.max(1.5, ts * 0.1);
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx - r, cy - r); ctx.lineTo(cx + r, cy + r); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + r, cy - r); ctx.lineTo(cx - r, cy + r); ctx.stroke();
}

function tileStairsUp(ctx, px, py, ts, bright) {
  // Sunlit clearing — way back up through the forest
  tileFloor(ctx, px, py, ts, bright);
  if (!bright) return;
  const cx = px + ts * 0.5, cy = py + ts * 0.5;
  // Sunlight pool
  ctx.fillStyle = 'rgba(180, 240, 100, 0.18)';
  ctx.beginPath(); ctx.arc(cx, cy, ts * 0.40, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(200, 255, 120, 0.12)';
  ctx.beginPath(); ctx.arc(cx, cy, ts * 0.28, 0, Math.PI * 2); ctx.fill();
  // Mossy centre
  ctx.fillStyle = '#3aaa14';
  ctx.beginPath(); ctx.arc(cx, cy, ts * 0.18, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#58cc20';
  ctx.beginPath(); ctx.arc(cx, cy, ts * 0.10, 0, Math.PI * 2); ctx.fill();
  // Up arrow
  ctx.fillStyle = '#ccff55';
  const aw = ts * 0.10, ah = ts * 0.12;
  ctx.beginPath();
  ctx.moveTo(cx,      cy - ah * 0.9);
  ctx.lineTo(cx - aw, cy + ah * 0.3);
  ctx.lineTo(cx + aw, cy + ah * 0.3);
  ctx.closePath(); ctx.fill();
}

function drawTileAt(ctx, type, px, py, ts, bright) {
  switch (type) {
    case TILE.WALL:        tileWall(ctx, px, py, ts, bright);       break;
    case TILE.STAIRS_DOWN: tileStairsDown(ctx, px, py, ts, bright); break;
    case TILE.STAIRS_UP:   tileStairsUp(ctx, px, py, ts, bright);   break;
    default:               tileFloor(ctx, px, py, ts, bright);
  }
}

// ── Entity sprites ────────────────────────────────────────────

function spritePlayer(ctx, px, py, ts) {
  tileFloor(ctx, px, py, ts, true);
  const cx = px + ts * 0.5;
  const cy = py + ts * 0.5;

  if (ts < 10) {
    // Tiny fallback: pale face block + dark hair strip
    ctx.fillStyle = '#f0e0c0';
    ctx.fillRect(px + 2, py + 3, ts - 4, ts - 4);
    ctx.fillStyle = '#1a0a22';
    ctx.fillRect(px + 2, py + 1, ts - 4, Math.ceil(ts * 0.35));
    return;
  }

  // Robe / body — dark navy, fills lower portion of tile
  const robeW = ts * 0.62;
  const robeTop = cy - ts * 0.05;
  const robeH = ts * 0.5;
  ctx.fillStyle = '#16162e';
  rRect(ctx, cx - robeW * 0.5, robeTop, robeW, robeH, ts * 0.12);
  ctx.fill();
  // Subtle center stripe on robe
  ctx.fillStyle = '#22224a';
  ctx.fillRect(cx - ts * 0.07, robeTop + ts * 0.06, ts * 0.14, robeH * 0.72);

  // Head — pale cream circle
  const headR = ts * 0.21;
  const headY = cy - ts * 0.2;
  ctx.fillStyle = '#f0e0c0';
  ctx.beginPath();
  ctx.arc(cx, headY, headR, 0, Math.PI * 2);
  ctx.fill();

  // Hair / hood — very dark, covers top half of head with side tufts
  ctx.fillStyle = '#1a0a22';
  ctx.beginPath();
  ctx.arc(cx, headY, headR * 1.08, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx - headR * 0.9, headY - headR * 0.05, headR * 0.34, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + headR * 0.9, headY - headR * 0.05, headR * 0.34, 0, Math.PI * 2);
  ctx.fill();

  // Eyes — small dark dots
  const eyeR = Math.max(1, headR * 0.22);
  const eyeY = headY + headR * 0.12;
  ctx.fillStyle = '#0a0812';
  ctx.beginPath(); ctx.arc(cx - headR * 0.38, eyeY, eyeR, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + headR * 0.38, eyeY, eyeR, 0, Math.PI * 2); ctx.fill();

  // Blush — soft pink circles on outer cheeks
  const blushR = Math.max(1.5, headR * 0.27);
  ctx.fillStyle = 'rgba(255, 110, 150, 0.60)';
  ctx.beginPath(); ctx.arc(cx - headR * 0.68, eyeY + headR * 0.24, blushR, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + headR * 0.68, eyeY + headR * 0.24, blushR, 0, Math.PI * 2); ctx.fill();
}

function spriteTrap(ctx, trap, px, py, ts) {
  tileFloor(ctx, px, py, ts, true);
  const cx = px + ts * 0.5, cy = py + ts * 0.5;
  if (trap.type === 'spike') {
    ctx.fillStyle = '#cc4444';
    // Draw spike triangles
    const n = 4, r = ts * 0.36, ir = ts * 0.12;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const a1 = (i / n) * Math.PI * 2 - Math.PI / 2;
      const a2 = ((i + 0.5) / n) * Math.PI * 2 - Math.PI / 2;
      const a3 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
      if (i === 0) ctx.moveTo(cx + Math.cos(a1) * ir, cy + Math.sin(a1) * ir);
      else ctx.lineTo(cx + Math.cos(a1) * ir, cy + Math.sin(a1) * ir);
      ctx.lineTo(cx + Math.cos(a2) * r, cy + Math.sin(a2) * r);
      ctx.lineTo(cx + Math.cos(a3) * ir, cy + Math.sin(a3) * ir);
    }
    ctx.closePath(); ctx.fill();
  } else {
    // Poison pool: green circle
    ctx.fillStyle = 'rgba(40,180,40,0.55)';
    ctx.beginPath(); ctx.arc(cx, cy, ts * 0.38, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#88ff88';
    ctx.beginPath(); ctx.arc(cx - ts * 0.1, cy - ts * 0.08, ts * 0.1, 0, Math.PI * 2); ctx.fill();
  }
}

function spriteMonster(ctx, id, px, py, ts) {
  tileFloor(ctx, px, py, ts, true);
  const cx = px + ts * 0.5, cy = py + ts * 0.5, r = ts * 0.33;
  if (ts < 12) {
    const c = {
      rat:'#898', goblin:'#4b4', orc:'#363', troll:'#242', necromancer:'#94c',
      goblin_archer:'#6b6', skeleton:'#cca', slime:'#4b4', slime_small:'#8c8',
      dark_elf:'#96c', goblin_king:'#2c2', orc_warchief:'#5a3', lich:'#c4f',
    };
    ctx.fillStyle = c[id] || '#888';
    ctx.fillRect(px + 2, py + 2, ts - 4, ts - 4);
    return;
  }
  switch (id) {
    case 'rat': {
      // Body oval
      ctx.fillStyle = '#9a9090';
      ctx.beginPath();
      ctx.ellipse(cx, cy + r * 0.1, r * 0.66, r * 0.44, 0, 0, Math.PI * 2);
      ctx.fill();
      // Ears
      ctx.fillStyle = '#ccaaaa';
      ctx.beginPath(); ctx.arc(cx - r * 0.28, cy - r * 0.4, r * 0.22, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + r * 0.1,  cy - r * 0.46, r * 0.22, 0, Math.PI * 2); ctx.fill();
      // Tail
      ctx.strokeStyle = '#776666'; ctx.lineWidth = Math.max(1, ts * 0.06); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cx + r * 0.6, cy + r * 0.1); ctx.lineTo(cx + r * 1.1, cy + r * 0.45); ctx.stroke();
      break;
    }
    case 'goblin': {
      ctx.fillStyle = '#44bb44';
      ctx.beginPath();
      ctx.moveTo(cx,        cy - r);
      ctx.lineTo(cx + r * 0.84, cy + r * 0.05);
      ctx.lineTo(cx + r * 0.5,  cy + r * 0.88);
      ctx.lineTo(cx - r * 0.5,  cy + r * 0.88);
      ctx.lineTo(cx - r * 0.84, cy + r * 0.05);
      ctx.closePath(); ctx.fill();
      // Eyes
      ctx.fillStyle = '#ffff55';
      ctx.fillRect(cx - r * 0.34, cy - r * 0.18, r * 0.2, r * 0.2);
      ctx.fillRect(cx + r * 0.14, cy - r * 0.18, r * 0.2, r * 0.2);
      break;
    }
    case 'orc': {
      ctx.fillStyle = '#336633';
      rRect(ctx, cx - r * 0.82, cy - r * 0.78, r * 1.64, r * 1.58, r * 0.22); ctx.fill();
      // Tusks
      ctx.fillStyle = '#eeeebb';
      ctx.fillRect(cx - r * 0.38, cy + r * 0.28, r * 0.2, r * 0.38);
      ctx.fillRect(cx + r * 0.18, cy + r * 0.28, r * 0.2, r * 0.38);
      // Eyes
      ctx.fillStyle = '#ff4422';
      ctx.fillRect(cx - r * 0.36, cy - r * 0.22, r * 0.22, r * 0.2);
      ctx.fillRect(cx + r * 0.14, cy - r * 0.22, r * 0.22, r * 0.2);
      break;
    }
    case 'troll': {
      ctx.fillStyle = '#223322';
      rRect(ctx, cx - r * 0.96, cy - r * 0.88, r * 1.92, r * 1.78, r * 0.3); ctx.fill();
      // Horns
      ctx.fillStyle = '#334433';
      ctx.fillRect(cx - r * 0.58, cy - r * 0.9, r * 0.3, r * 0.34);
      ctx.fillRect(cx + r * 0.28, cy - r * 0.9, r * 0.3, r * 0.34);
      // Red eyes
      ctx.fillStyle = '#ff2222';
      ctx.fillRect(cx - r * 0.38, cy - r * 0.24, r * 0.28, r * 0.22);
      ctx.fillRect(cx + r * 0.1,  cy - r * 0.24, r * 0.28, r * 0.22);
      break;
    }
    case 'necromancer': {
      // Robe
      ctx.fillStyle = '#4411aa';
      ctx.beginPath(); ctx.arc(cx, cy + r * 0.12, r * 0.9, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#8833cc'; ctx.lineWidth = Math.max(1, ts * 0.07); ctx.stroke();
      // Hood peak
      ctx.fillStyle = '#330088';
      ctx.beginPath(); ctx.moveTo(cx, cy - r * 1.12); ctx.lineTo(cx - r * 0.56, cy - r * 0.55); ctx.lineTo(cx + r * 0.56, cy - r * 0.55); ctx.closePath(); ctx.fill();
      // Glowing eyes
      ctx.fillStyle = '#ff44ff';
      ctx.fillRect(cx - r * 0.3,  cy - r * 0.1, r * 0.2, r * 0.18);
      ctx.fillRect(cx + r * 0.1,  cy - r * 0.1, r * 0.2, r * 0.18);
      break;
    }
    case 'goblin_archer': {
      // Like goblin but with a bow mark
      ctx.fillStyle = '#55cc55';
      ctx.beginPath();
      ctx.moveTo(cx, cy - r); ctx.lineTo(cx + r * 0.84, cy + r * 0.05);
      ctx.lineTo(cx + r * 0.5, cy + r * 0.88); ctx.lineTo(cx - r * 0.5, cy + r * 0.88);
      ctx.lineTo(cx - r * 0.84, cy + r * 0.05); ctx.closePath(); ctx.fill();
      // Bow line
      ctx.strokeStyle = '#aa8833'; ctx.lineWidth = Math.max(1, ts * 0.07);
      ctx.beginPath(); ctx.moveTo(cx + r * 0.5, cy - r * 0.5); ctx.lineTo(cx + r * 0.5, cy + r * 0.5); ctx.stroke();
      ctx.strokeStyle = '#ffdd88'; ctx.lineWidth = Math.max(1, ts * 0.04);
      ctx.beginPath(); ctx.moveTo(cx + r * 0.5, cy - r * 0.5); ctx.lineTo(cx + r * 0.5, cy + r * 0.5); ctx.stroke();
      break;
    }
    case 'skeleton': {
      // White/cream body
      ctx.fillStyle = '#ddddbb';
      rRect(ctx, cx - r * 0.65, cy - r * 0.75, r * 1.3, r * 1.5, r * 0.15); ctx.fill();
      // Skull
      ctx.fillStyle = '#eeeecc';
      ctx.beginPath(); ctx.arc(cx, cy - r * 0.52, r * 0.42, 0, Math.PI * 2); ctx.fill();
      // Eye sockets
      ctx.fillStyle = '#222211';
      ctx.fillRect(cx - r * 0.32, cy - r * 0.62, r * 0.22, r * 0.18);
      ctx.fillRect(cx + r * 0.1, cy - r * 0.62, r * 0.22, r * 0.18);
      break;
    }
    case 'slime': {
      ctx.fillStyle = 'rgba(40,200,40,0.8)';
      ctx.beginPath(); ctx.ellipse(cx, cy + r * 0.15, r * 0.85, r * 0.62, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#66ff66'; ctx.lineWidth = Math.max(1, ts * 0.06); ctx.stroke();
      // Eyes
      ctx.fillStyle = '#004400';
      ctx.beginPath(); ctx.arc(cx - r * 0.3, cy - r * 0.05, r * 0.14, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + r * 0.3, cy - r * 0.05, r * 0.14, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'slime_small': {
      ctx.fillStyle = 'rgba(80,220,80,0.75)';
      ctx.beginPath(); ctx.ellipse(cx, cy + r * 0.1, r * 0.6, r * 0.42, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#88ff88'; ctx.lineWidth = Math.max(1, ts * 0.05); ctx.stroke();
      break;
    }
    case 'dark_elf': {
      // Purple/dark body
      ctx.fillStyle = '#7733aa';
      rRect(ctx, cx - r * 0.72, cy - r * 0.7, r * 1.44, r * 1.45, r * 0.2); ctx.fill();
      // Head
      ctx.fillStyle = '#9955cc';
      ctx.beginPath(); ctx.arc(cx, cy - r * 0.48, r * 0.38, 0, Math.PI * 2); ctx.fill();
      // Glowing red eyes
      ctx.fillStyle = '#ff3333';
      ctx.fillRect(cx - r * 0.3, cy - r * 0.56, r * 0.18, r * 0.14);
      ctx.fillRect(cx + r * 0.12, cy - r * 0.56, r * 0.18, r * 0.14);
      break;
    }
    case 'goblin_king': {
      // Large golden-crowned goblin
      ctx.fillStyle = '#22bb22';
      rRect(ctx, cx - r * 0.9, cy - r * 0.65, r * 1.8, r * 1.6, r * 0.25); ctx.fill();
      // Crown
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(cx - r * 0.7, cy - r * 0.72, r * 1.4, r * 0.22);
      ctx.fillRect(cx - r * 0.7, cy - r * 0.98, r * 0.28, r * 0.28);
      ctx.fillRect(cx - r * 0.14, cy - r * 1.04, r * 0.28, r * 0.34);
      ctx.fillRect(cx + r * 0.42, cy - r * 0.98, r * 0.28, r * 0.28);
      // Eyes
      ctx.fillStyle = '#ff4400';
      ctx.fillRect(cx - r * 0.38, cy - r * 0.12, r * 0.26, r * 0.22);
      ctx.fillRect(cx + r * 0.12, cy - r * 0.12, r * 0.26, r * 0.22);
      break;
    }
    case 'orc_warchief': {
      // Large armored orc
      ctx.fillStyle = '#225511';
      rRect(ctx, cx - r, cy - r * 0.9, r * 2, r * 1.9, r * 0.28); ctx.fill();
      // Shoulder pads
      ctx.fillStyle = '#888888';
      rRect(ctx, cx - r * 1.1, cy - r * 0.6, r * 0.5, r * 0.5, r * 0.1); ctx.fill();
      rRect(ctx, cx + r * 0.6, cy - r * 0.6, r * 0.5, r * 0.5, r * 0.1); ctx.fill();
      // Tusks
      ctx.fillStyle = '#eeeebb';
      ctx.fillRect(cx - r * 0.46, cy + r * 0.22, r * 0.22, r * 0.44);
      ctx.fillRect(cx + r * 0.24, cy + r * 0.22, r * 0.22, r * 0.44);
      // Eyes
      ctx.fillStyle = '#ff2200';
      ctx.fillRect(cx - r * 0.42, cy - r * 0.28, r * 0.28, r * 0.24);
      ctx.fillRect(cx + r * 0.14, cy - r * 0.28, r * 0.28, r * 0.24);
      break;
    }
    case 'lich': {
      // Dark robe with purple magic
      ctx.fillStyle = '#220033';
      ctx.beginPath(); ctx.arc(cx, cy + r * 0.1, r * 0.95, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#cc00ff'; ctx.lineWidth = Math.max(1.5, ts * 0.09); ctx.stroke();
      // Skull face
      ctx.fillStyle = '#ddddcc';
      ctx.beginPath(); ctx.arc(cx, cy - r * 0.38, r * 0.46, 0, Math.PI * 2); ctx.fill();
      // Empty sockets
      ctx.fillStyle = '#cc00ff';
      ctx.beginPath(); ctx.arc(cx - r * 0.22, cy - r * 0.42, r * 0.14, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + r * 0.22, cy - r * 0.42, r * 0.14, 0, Math.PI * 2); ctx.fill();
      // Magic glow top
      ctx.strokeStyle = 'rgba(200,0,255,0.5)'; ctx.lineWidth = Math.max(2, ts * 0.12);
      ctx.beginPath(); ctx.arc(cx, cy, r * 1.1, 0, Math.PI * 2); ctx.stroke();
      break;
    }
  }
}

function spriteItem(ctx, id, px, py, ts) {
  tileFloor(ctx, px, py, ts, true);
  const cx = px + ts * 0.5, cy = py + ts * 0.5, r = ts * 0.3;
  if (ts < 12) {
    const c = { gold:'#fc0',potion_minor:'#e33',potion_major:'#f88',
      weapon_dagger:'#cc3',weapon_sword:'#dd4',weapon_axe:'#ee5',
      armor_leather:'#46b',armor_chain:'#68c',armor_plate:'#8ae',
      scroll_fireball:'#4ae',scroll_mapping:'#6cf' };
    ctx.fillStyle = c[id] || '#aaa';
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.8, 0, Math.PI * 2); ctx.fill();
    return;
  }
  if (id === 'gold') {
    // Two overlapping coins
    ctx.fillStyle = '#ccaa00';
    ctx.beginPath(); ctx.arc(cx - r * 0.28, cy + r * 0.2, r * 0.58, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath(); ctx.arc(cx + r * 0.22, cy - r * 0.12, r * 0.58, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffee55';
    ctx.beginPath(); ctx.arc(cx + r * 0.22, cy - r * 0.12, r * 0.3, 0, Math.PI * 2); ctx.fill();
    return;
  }
  if (id.startsWith('potion')) {
    const major = id === 'potion_major';
    const bw = ts * 0.24, bh = ts * 0.38;
    // Neck
    ctx.fillStyle = '#888888';
    ctx.fillRect(cx - bw * 0.22, cy - bh * 0.58, bw * 0.44, bh * 0.25);
    ctx.fillStyle = '#aaaaaa';
    ctx.fillRect(cx - bw * 0.18, cy - bh * 0.7, bw * 0.36, bh * 0.15);
    // Body
    ctx.fillStyle = major ? '#dd4466' : '#cc2233';
    rRect(ctx, cx - bw / 2, cy - bh * 0.3, bw, bh * 0.76, bw * 0.32); ctx.fill();
    // Shine
    ctx.fillStyle = major ? '#ffaacc' : '#ee7788';
    rRect(ctx, cx - bw * 0.2, cy - bh * 0.1, bw * 0.22, bh * 0.3, bw * 0.1); ctx.fill();
    return;
  }
  if (id.startsWith('weapon')) {
    const isAxe = id === 'weapon_axe', isSword = id === 'weapon_sword';
    // Blade
    ctx.strokeStyle = isAxe ? '#ddcc55' : isSword ? '#eedd66' : '#ccbb44';
    ctx.lineWidth = Math.max(2, ts * (isAxe ? 0.14 : isSword ? 0.11 : 0.09));
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(px + ts * 0.22, py + ts * 0.78); ctx.lineTo(px + ts * 0.78, py + ts * 0.22); ctx.stroke();
    // Crossguard
    ctx.strokeStyle = '#aaaaaa'; ctx.lineWidth = Math.max(1.5, ts * 0.09);
    const gx = px + ts * 0.5, gy = py + ts * 0.5, gl = ts * 0.17;
    ctx.beginPath(); ctx.moveTo(gx - gl * 0.7, gy + gl * 0.7); ctx.lineTo(gx + gl * 0.7, gy - gl * 0.7); ctx.stroke();
    if (isAxe) {
      ctx.fillStyle = '#ddcc55';
      ctx.beginPath(); ctx.moveTo(px + ts * 0.72, py + ts * 0.28); ctx.lineTo(px + ts * 0.88, py + ts * 0.18); ctx.lineTo(px + ts * 0.82, py + ts * 0.44); ctx.closePath(); ctx.fill();
    }
    return;
  }
  if (id.startsWith('armor')) {
    const isPlate = id === 'armor_plate', isChain = id === 'armor_chain';
    const sw = ts * 0.33, sh = ts * 0.38;
    ctx.fillStyle = isPlate ? '#8899dd' : isChain ? '#5566bb' : '#3344aa';
    ctx.beginPath();
    ctx.moveTo(cx,        cy + sh);
    ctx.lineTo(cx - sw,   cy - sh * 0.12);
    ctx.lineTo(cx - sw * 0.68, cy - sh);
    ctx.lineTo(cx,        cy - sh * 0.82);
    ctx.lineTo(cx + sw * 0.68, cy - sh);
    ctx.lineTo(cx + sw,   cy - sh * 0.12);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = isPlate ? '#aabbee' : isChain ? '#7788cc' : '#5566bb';
    ctx.lineWidth = Math.max(1, ts * 0.07);
    ctx.beginPath(); ctx.moveTo(cx, cy - sh * 0.65); ctx.lineTo(cx, cy + sh * 0.65); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - sw * 0.5, cy); ctx.lineTo(cx + sw * 0.5, cy); ctx.stroke();
    return;
  }
  if (id.startsWith('scroll')) {
    const isMapping = id === 'scroll_mapping';
    const sw = ts * 0.34, sh = ts * 0.28;
    ctx.fillStyle = isMapping ? '#33bbdd' : '#1199bb';
    ctx.fillRect(cx - sw, cy - sh, sw * 2, sh * 2);
    ctx.fillStyle = isMapping ? '#88ddee' : '#44aacc';
    ctx.fillRect(cx - sw, cy - sh,            sw * 2, sh * 0.28);
    ctx.fillRect(cx - sw, cy + sh * 0.72,     sw * 2, sh * 0.28);
    ctx.fillStyle = isMapping ? '#aaeeff' : '#66bbcc';
    for (let i = 0; i < 3; i++)
      ctx.fillRect(cx - sw * 0.62, cy - sh * 0.28 + i * sh * 0.4, sw * 1.24, Math.max(1, ts * 0.06));
    return;
  }
}

// ── Renderer class ────────────────────────────────────────────
class Renderer {
  constructor(canvas) {
    this.canvas   = canvas;
    this.ctx      = canvas.getContext('2d');
    this.tileSize = 16;
    this.viewW    = 0;
    this.viewH    = 0;
    this.camX     = 0;
    this.camY     = 0;
    this.zoom     = 0;
  }

  computeLayout(mapW, mapH) {
    const wrapper = this.canvas.parentElement;
    const contW   = wrapper.clientWidth;
    const contH   = wrapper.clientHeight;
    const tsByW   = Math.floor(contW / mapW);
    const tsByH   = Math.floor(contH / mapH);
    const baseTs  = Math.max(8, Math.min(tsByW, tsByH));
    this.tileSize = Math.max(8, baseTs + this.zoom * 3);
    this.viewW    = Math.floor(contW / this.tileSize);
    this.viewH    = Math.floor(contH / this.tileSize);
    this.canvas.width  = this.viewW * this.tileSize;
    this.canvas.height = this.viewH * this.tileSize;
  }

  centerCamera(px, py, mapW, mapH) {
    this.camX = clamp(px - Math.floor(this.viewW / 2), 0, Math.max(0, mapW - this.viewW));
    this.camY = clamp(py - Math.floor(this.viewH / 2), 0, Math.max(0, mapH - this.viewH));
  }

  render(state) {
    const { map, player, monsters, items, traps } = state;
    const ctx = this.ctx;
    const ts  = this.tileSize;
    this.centerCamera(player.x, player.y, map.width, map.height);

    ctx.fillStyle = '#0e0b08';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Tiles
    for (let ty = this.camY; ty < this.camY + this.viewH; ty++) {
      for (let tx = this.camX; tx < this.camX + this.viewW; tx++) {
        const vis = map.getVis(tx, ty);
        if (vis === VIS.UNSEEN) continue;
        const px = (tx - this.camX) * ts;
        const py = (ty - this.camY) * ts;
        const tileType = map.getTile(tx, ty);
        if (tileType === TILE.STAIRS_DOWN && !state.gateOpen) {
          tileStairsLocked(ctx, px, py, ts, vis === VIS.VISIBLE);
        } else {
          drawTileAt(ctx, tileType, px, py, ts, vis === VIS.VISIBLE);
        }
      }
    }

    // Revealed traps
    if (traps) {
      for (const trap of traps) {
        if (!trap.revealed) continue;
        if (map.getVis(trap.x, trap.y) !== VIS.VISIBLE) continue;
        if (!this._inView(trap.x, trap.y)) continue;
        spriteTrap(ctx, trap, (trap.x - this.camX) * ts, (trap.y - this.camY) * ts, ts);
      }
    }

    // Items (visible tiles only)
    for (const item of items) {
      if (map.getVis(item.x, item.y) !== VIS.VISIBLE) continue;
      if (!this._inView(item.x, item.y)) continue;
      spriteItem(ctx, item.template.id, (item.x - this.camX) * ts, (item.y - this.camY) * ts, ts);
    }

    // Monsters (visible tiles only)
    for (const monster of monsters) {
      if (!monster.isAlive()) continue;
      if (map.getVis(monster.x, monster.y) !== VIS.VISIBLE) continue;
      if (!this._inView(monster.x, monster.y)) continue;
      spriteMonster(ctx, monster.template.id, (monster.x - this.camX) * ts, (monster.y - this.camY) * ts, ts);
      // Boss HP bar above boss sprite
      if (monster.template.isBoss) {
        const bx = (monster.x - this.camX) * ts;
        const by = (monster.y - this.camY) * ts;
        const barW = ts, barH = Math.max(3, ts * 0.12);
        const ratio = monster.hp / monster.maxHp;
        ctx.fillStyle = '#330000';
        ctx.fillRect(bx, by - barH - 1, barW, barH);
        ctx.fillStyle = ratio > 0.5 ? '#cc3333' : '#ff2200';
        ctx.fillRect(bx, by - barH - 1, barW * ratio, barH);
      }
    }

    // Player (always visible)
    if (this._inView(player.x, player.y))
      spritePlayer(ctx, (player.x - this.camX) * ts, (player.y - this.camY) * ts, ts);
  }

  _inView(tx, ty) {
    return tx >= this.camX && tx < this.camX + this.viewW &&
           ty >= this.camY && ty < this.camY + this.viewH;
  }
}

// ─────────────────────────────────────────────────────────────
// input.js
// ─────────────────────────────────────────────────────────────
const KEY_MAP = {
  ArrowUp:    { type: 'move', dx:  0, dy: -1 },
  ArrowDown:  { type: 'move', dx:  0, dy:  1 },
  ArrowLeft:  { type: 'move', dx: -1, dy:  0 },
  ArrowRight: { type: 'move', dx:  1, dy:  0 },
  w: { type: 'move', dx:  0, dy: -1 }, s: { type: 'move', dx:  0, dy:  1 },
  a: { type: 'move', dx: -1, dy:  0 }, d: { type: 'move', dx:  1, dy:  0 },
  k: { type: 'move', dx:  0, dy: -1 }, j: { type: 'move', dx:  0, dy:  1 },
  h: { type: 'move', dx: -1, dy:  0 }, l: { type: 'move', dx:  1, dy:  0 },
  y: { type: 'move', dx: -1, dy: -1 }, u: { type: 'move', dx:  1, dy: -1 },
  b: { type: 'move', dx: -1, dy:  1 }, n: { type: 'move', dx:  1, dy:  1 },
  Numpad8: { type: 'move', dx:  0, dy: -1 }, Numpad2: { type: 'move', dx:  0, dy:  1 },
  Numpad4: { type: 'move', dx: -1, dy:  0 }, Numpad6: { type: 'move', dx:  1, dy:  0 },
  Numpad7: { type: 'move', dx: -1, dy: -1 }, Numpad9: { type: 'move', dx:  1, dy: -1 },
  Numpad1: { type: 'move', dx: -1, dy:  1 }, Numpad3: { type: 'move', dx:  1, dy:  1 },
  Numpad5: { type: 'wait' },
  ' ':  { type: 'wait' }, '.': { type: 'wait' },
  g:    { type: 'pickUp' }, G: { type: 'pickUp' },
  i:    { type: 'openInventory' }, I: { type: 'openInventory' },
  '>':  { type: 'descend' },
  '1':  { type: 'ability', id: 'dash' },
  '2':  { type: 'ability', id: 'battle_cry' },
  '3':  { type: 'ability', id: 'heal_surge' },
};

class InputHandler {
  constructor(canvas, actionCallback) {
    this.canvas   = canvas;
    this.dispatch = actionCallback;
    this.enabled  = true;
    this._touchStart = null;
    this._onKey        = this._onKey.bind(this);
    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchEnd   = this._onTouchEnd.bind(this);
    document.addEventListener('keydown', this._onKey);
    canvas.addEventListener('touchstart', this._onTouchStart, { passive: true });
    canvas.addEventListener('touchend',   this._onTouchEnd,   { passive: true });
  }

  setEnabled(val) { this.enabled = val; }

  bindDpad(dpadEl) {
    dpadEl.addEventListener('touchstart', e => {
      e.preventDefault();
      const btn = e.target.closest('.dpad-btn');
      if (!btn || !this.enabled) return;
      btn.classList.add('pressed');
      const action = this._dpadAction(btn);
      if (action) this.dispatch(action);
    }, { passive: false });
    dpadEl.addEventListener('touchend', e => {
      e.target.closest('.dpad-btn')?.classList.remove('pressed');
    }, { passive: true });
    dpadEl.addEventListener('mousedown', e => {
      const btn = e.target.closest('.dpad-btn');
      if (!btn || !this.enabled) return;
      const action = this._dpadAction(btn);
      if (action) this.dispatch(action);
    });
  }

  bindMobileActions(el) {
    el.addEventListener('click', e => {
      if (!this.enabled) return;
      const btn = e.target.closest('button');
      if (!btn) return;
      if (btn.id === 'btn-pickup')    this.dispatch({ type: 'pickUp' });
      if (btn.id === 'btn-inventory') this.dispatch({ type: 'openInventory' });
      if (btn.id === 'btn-descend')   this.dispatch({ type: 'descend' });
    });
  }

  _dpadAction(btn) {
    if (btn.dataset.action === 'wait') return { type: 'wait' };
    return { type: 'move', dx: parseInt(btn.dataset.dx ?? '0', 10), dy: parseInt(btn.dataset.dy ?? '0', 10) };
  }

  _onKey(e) {
    if (!this.enabled) return;
    const action = KEY_MAP[e.key] ?? KEY_MAP[e.key.toLowerCase()] ?? KEY_MAP[e.code];
    if (!action) return;
    e.preventDefault();
    this.dispatch(action);
  }

  _onTouchStart(e) {
    if (!this.enabled || e.touches.length === 0) return;
    const t = e.touches[0];
    this._touchStart = { x: t.clientX, y: t.clientY, time: Date.now() };
  }

  _onTouchEnd(e) {
    if (!this.enabled || !this._touchStart) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - this._touchStart.x;
    const dy = t.clientY - this._touchStart.y;
    const elapsed = Date.now() - this._touchStart.time;
    this._touchStart = null;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (elapsed > 500 || dist < 20) return;
    const angle  = Math.atan2(dy, dx) * (180 / Math.PI);
    const a      = ((angle + 360) % 360);
    const sector = Math.round(a / 45) % 8;
    const MAP_DIR = [
      { dx:  1, dy:  0 }, { dx:  1, dy:  1 }, { dx:  0, dy:  1 }, { dx: -1, dy:  1 },
      { dx: -1, dy:  0 }, { dx: -1, dy: -1 }, { dx:  0, dy: -1 }, { dx:  1, dy: -1 },
    ];
    this.dispatch({ type: 'move', ...MAP_DIR[sector] });
  }
}

// ─────────────────────────────────────────────────────────────
// ui.js
// ─────────────────────────────────────────────────────────────
const MAX_LOG_LINES = 80;
const VISIBLE_LINES = 5;

class UI {
  constructor() {
    this.statsEl      = document.getElementById('stats');
    this.equipEl      = document.getElementById('equipment');
    this.logEl        = document.getElementById('message-log');
    this.mobileBarEl  = document.getElementById('stat-bar-mobile');
    this.invDialog    = document.getElementById('inventory-dialog');
    this.invList      = document.getElementById('inventory-list');
    this.sideInvEl    = document.getElementById('side-inventory');
    this.shopEl         = document.getElementById('side-shop');
    this.monsterInfoEl  = document.getElementById('monster-info');
    this.gateBannerEl   = document.getElementById('gate-banner');
    this.goDialog    = document.getElementById('game-over-dialog');
    this.goTitle     = document.getElementById('game-over-title');
    this.goStats     = document.getElementById('game-over-stats');
    this.hsList      = document.getElementById('highscore-list');
    this.fcDialog    = document.getElementById('floor-complete-dialog');
    this._lines       = [];
    this._pendingMsgs = [];
  }

  addMessage(text, type = 'info') { this._pendingMsgs.push({ text, type }); }

  flushMessages() {
    for (const { text, type } of this._pendingMsgs)
      this._lines.push({ text, cssClass: `msg-${type}` });
    this._pendingMsgs = [];
    if (this._lines.length > MAX_LOG_LINES) this._lines = this._lines.slice(-MAX_LOG_LINES);
    this._renderLog();
  }

  _renderLog() {
    const recent = this._lines.slice(-VISIBLE_LINES);
    this.logEl.innerHTML = '<div class="panel-title">Log</div>' + recent.map((l, i) => {
      const age = i < recent.length - 1 ? ' msg-old' : '';
      return `<div class="msg-line ${l.cssClass}${age}">${escHtml(l.text)}</div>`;
    }).join('');
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }

  showGateBanner(depth) {
    if (!this.gateBannerEl) return;
    this.gateBannerEl.innerHTML =
      `<div class="gb-title">★ GATE OPEN — FLOOR ${depth} QUEST COMPLETE ★</div>` +
      `<div class="gb-sub">Descend the stairs to continue</div>`;
    this.gateBannerEl.classList.remove('active');
    // Force reflow so the animation restarts if called again
    void this.gateBannerEl.offsetWidth;
    this.gateBannerEl.classList.add('active');
    // Hide after animation ends (3.4s)
    clearTimeout(this._bannerTimer);
    this._bannerTimer = setTimeout(() => this.gateBannerEl.classList.remove('active'), 3500);
  }

  updateStats(player, state) {
    const hpClass = hpColorClass(player.hp, player.maxHp, 'stat');
    const depth = state?.depth ?? 1;
    const killReq = FLOOR_CONFIG[depth]?.killsRequired ?? 0;
    const killDone = player.floorKills >= killReq;
    const questVal = killReq > 0
      ? `<span class="${killDone ? 'quest-done' : 'quest-todo'}">${Math.min(player.floorKills, killReq)}/${killReq}${killDone ? ' ✓' : ''}</span>`
      : '—';
    let html = [
      statRow('HP',    `<span class="${hpClass}">${player.hp}/${player.maxHp}</span>`),
      statRow('ATK',   player.getAttack()),
      statRow('DEF',   player.getDefense()),
      statRow('Level', player.level),
      statRow('XP',    `${player.xp}/${player.xpToNext}`),
      statRow('Gold',  player.gold),
      statRow('Depth', player.dungeon_depth ?? 1),
      `<div class="stat-row quest-row"><span class="stat-label">Quest</span><span class="stat-val">${questVal}</span></div>`,
    ].join('');

    // Ability bar
    const abilityDefs = [
      { id: 'dash',       key: '1', name: 'Dash',     level: 3 },
      { id: 'battle_cry', key: '2', name: 'Cry',      level: 5 },
      { id: 'heal_surge', key: '3', name: 'Heal',     level: 7 },
    ];
    html += '<div id="ability-bar"><div class="ability-bar-title">Abilities</div><div class="ability-slots">';
    for (const ab of abilityDefs) {
      const unlocked = player.abilities.includes(ab.id);
      const cd = player.abilityCooldowns[ab.id] || 0;
      if (!unlocked) {
        html += `<div class="ability-slot locked">[${ab.key}] Lv${ab.level}</div>`;
      } else if (cd > 0) {
        html += `<div class="ability-slot cooldown">[${ab.key}] ${ab.name} ${cd}</div>`;
      } else {
        html += `<div class="ability-slot ready">[${ab.key}] ${ab.name}</div>`;
      }
    }
    html += '</div></div>';

    // Boss HP bar
    if (state && state.monsters) {
      const boss = state.monsters.find(m => m.isAlive() && m.template.isBoss);
      if (boss) {
        const ratio = (boss.hp / boss.maxHp * 100).toFixed(0);
        html += `<div id="boss-bar-wrap">` +
          `<div id="boss-bar-label">⚠ ${escHtml(boss.name)} ${boss.hp}/${boss.maxHp}</div>` +
          `<div id="boss-bar-track"><div id="boss-bar-fill" style="width:${ratio}%"></div></div>` +
          `</div>`;
      }
    }

    this.statsEl.innerHTML = html;
    const wName = player.weapon  ? player.weapon.name  : '<span style="color:#444">—</span>';
    const aName = player.armor   ? player.armor.name   : '<span style="color:#444">—</span>';
    const bName = player.boots   ? player.boots.name   : '<span style="color:#444">—</span>';
    const hName = player.helmet  ? player.helmet.name  : '<span style="color:#444">—</span>';
    this.equipEl.innerHTML = [
      equipRow('Weapon', wName),
      equipRow('Armor',  aName),
      equipRow('Boots',  bName),
      equipRow('Helmet', hName),
    ].join('');
    this.updateSideInventory(player);
    this.updateShop(player, state);
    this.updateMonsterInfo(state);
    const hpMob = hpColorClass(player.hp, player.maxHp, 'mob');
    this.mobileBarEl.innerHTML =
      `<span class="mob-stat">HP</span><span class="${hpMob}">${player.hp}/${player.maxHp}</span>` +
      `<span class="mob-stat"> LVL</span><span class="mob-val">${player.level}</span>` +
      `<span class="mob-stat"> ATK</span><span class="mob-val">${player.getAttack()}</span>` +
      `<span class="mob-stat"> DEF</span><span class="mob-val">${player.getDefense()}</span>` +
      `<span class="mob-stat"> ¥</span><span class="mob-val">${player.gold}</span>` +
      `<span class="mob-stat"> Fl</span><span class="mob-val">${player.dungeon_depth ?? 1}/3</span>`;
  }

  bindSideInventory(onUse, onDrop) {
    this._sideInvOnUse  = onUse;
    this._sideInvOnDrop = onDrop;
  }

  bindSideShop(onBuy) {
    this._sideShopOnBuy = onBuy;
  }

  updateShop(player, state) {
    if (!this.shopEl) return;
    const depth = state?.depth ?? 1;
    const gold  = player?.gold ?? 0;
    const available = SHOP_CATALOG.filter(e => e.minDepth <= depth);
    this.shopEl.innerHTML = available.map((entry, idx) => {
      const t          = ITEM_TEMPLATES[entry.id];
      const canAfford  = gold >= entry.price;
      const lockClass  = canAfford ? '' : ' ss-cant-afford';
      return `<div class="ss-row${lockClass}" title="${escHtml(t.description)}">` +
        `<span class="ss-glyph" style="color:${t.color}">${escHtml(t.glyph)}</span>` +
        `<span class="ss-name">${escHtml(t.name)}</span>` +
        `<span class="ss-price">${entry.price}g</span>` +
        `<button class="ss-buy-btn" data-idx="${idx}"${canAfford ? '' : ' disabled'}>Buy</button>` +
        `</div>`;
    }).join('') || '<div class="side-inv-empty">No items yet</div>';

    this.shopEl.querySelectorAll('.ss-buy-btn:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => {
        const entry = available[parseInt(btn.dataset.idx, 10)];
        if (this._sideShopOnBuy?.(entry.id, entry.price)) {
          // updateStats will re-render on the next frame via the gold change
        }
      });
    });
  }

  updateMonsterInfo(state) {
    if (!this.monsterInfoEl) return;
    const depth = state?.depth ?? 1;
    const cfg   = FLOOR_CONFIG[depth];
    if (!cfg) { this.monsterInfoEl.innerHTML = ''; return; }

    const lines = cfg.monsters.map(id => {
      const t = MONSTER_TEMPLATES[id];
      if (!t) return '';
      return `<span class="mi-line">` +
        `<span class="mi-glyph" style="color:${t.color}">${escHtml(t.glyph)}</span>` +
        `  ${escHtml(t.name)}  hp:${t.hp}  atk:${t.attack}  def:${t.defense}` +
        `</span>`;
    }).join('');

    let bossLines = '';
    if (cfg.boss) {
      const b = MONSTER_TEMPLATES[cfg.boss];
      if (b) {
        bossLines =
          `<span class="mi-boss-header">&#x26A0; Boss</span>` +
          `<span class="mi-line mi-boss-line">` +
          `<span class="mi-glyph" style="color:${b.color}">${escHtml(b.glyph)}</span>` +
          `  ${escHtml(b.name)}  atk:${b.attack}  def:${b.defense}` +
          `</span>`;
      }
    }

    this.monsterInfoEl.innerHTML = lines + bossLines;
  }

  updateSideInventory(player) {
    if (!this.sideInvEl) return;
    if (player.inventory.length === 0) {
      this.sideInvEl.innerHTML = '<div class="side-inv-empty">Empty</div>';
      return;
    }
    this.sideInvEl.innerHTML = player.inventory.map((item, idx) => {
      const letter   = String.fromCharCode(97 + idx);
      const eqMark   = player.isEquipped(item) ? ' side-inv-equipped' : '';
      const rarCol   = item.rarity ? `style="color:${item.rarity.color}"` : '';
      const isGold   = item.template.itemType === 'gold';
      const equipTypes = ['weapon','armor','boots','helmet'];
      const actionLabel = equipTypes.includes(item.template.itemType)
        ? (player.isEquipped(item) ? 'Unequip' : 'Equip')
        : (isGold ? null : 'Use');
      const actionTag = actionLabel
        ? `<span class="si-action">${actionLabel}</span>`
        : '';
      return `<div class="side-inv-item${eqMark}" data-idx="${idx}">` +
        `<span class="side-inv-key">${letter}</span>` +
        `<span class="side-inv-glyph" ${rarCol}>${escHtml(item.template.glyph)}</span>` +
        `<span class="side-inv-name" ${rarCol}>${escHtml(item.name)}</span>` +
        `${actionTag}` +
        `<button class="si-drop-btn" data-idx="${idx}" title="Drop">×</button>` +
        `</div>`;
    }).join('');

    // Click item row = equip / use
    this.sideInvEl.querySelectorAll('.side-inv-item').forEach(el => {
      el.addEventListener('click', e => {
        if (e.target.classList.contains('si-drop-btn')) return;
        const idx  = parseInt(el.dataset.idx, 10);
        const item = player.inventory[idx];
        if (item && item.template.itemType !== 'gold') this._sideInvOnUse?.(item);
      });
    });

    // × button = drop
    this.sideInvEl.querySelectorAll('.si-drop-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const idx  = parseInt(btn.dataset.idx, 10);
        const item = player.inventory[idx];
        if (item) this._sideInvOnDrop?.(item);
      });
    });
  }

  showInventory(player, onUse) {
    if (player.inventory.length === 0) {
      this.addMessage('Your inventory is empty.', 'info');
      this.flushMessages();
      return;
    }
    this.invList.innerHTML = '';
    player.inventory.forEach((item, idx) => {
      const letter   = String.fromCharCode(97 + idx);
      const equipped = player.isEquipped(item) ? ' equipped' : '';
      const eqTag    = player.isEquipped(item) ? '<span class="inv-equipped-tag">[equipped]</span>' : '';
      const el = document.createElement('div');
      el.className   = `inv-item${equipped}`;
      el.tabIndex    = 0;
      el.dataset.idx = idx;
      const rarityStyle = item.rarity ? ` style="color:${item.rarity.color}"` : '';
      el.innerHTML   =
        `<span class="inv-key">${letter}</span>` +
        `<span class="inv-glyph" style="color:${item.color}">${item.glyph}</span>` +
        `<span class="inv-name"${rarityStyle}>${escHtml(item.name)}${eqTag}</span>` +
        `<span class="inv-desc">${escHtml(item.description)}</span>`;
      el.addEventListener('click', () => { this.invDialog.close(); onUse(item); });
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { this.invDialog.close(); onUse(item); }
      });
      this.invList.appendChild(el);
    });
    if (this._invKeyHandler) {
      this.invDialog.removeEventListener('keydown', this._invKeyHandler);
    }
    this._invKeyHandler = e => {
      if (e.key === 'Escape') { this.invDialog.close(); return; }
      const code = e.key.toLowerCase().charCodeAt(0) - 97;
      if (code >= 0 && code < player.inventory.length) {
        this.invDialog.close();
        onUse(player.inventory[code]);
      }
    };
    this.invDialog.addEventListener('keydown', this._invKeyHandler);
    document.getElementById('close-inventory').onclick = () => this.invDialog.close();
    this.invDialog.showModal();
  }

  showGameOver(stats, isVictory, onRetry, onRestartFloor1) {
    this.goTitle.textContent = isVictory ? '⚔ Victory!' : 'You Died';
    this.goTitle.style.color  = isVictory ? '#6ae86a' : '#cc3333';
    this.goStats.innerHTML = [
      goStatRow('Floor reached', stats.depth),
      goStatRow('Enemies slain', stats.kills),
      goStatRow('Gold collected', stats.gold),
      goStatRow('Level reached', stats.level),
      goStatRow('Turns elapsed', stats.turns),
    ].join('');
    const score = stats.depth * 100 + stats.kills * 10 + Math.floor(stats.gold / 5);
    this._renderHighscores(score, stats, isVictory);

    const retryBtn    = document.getElementById('restart-btn');
    const floor1Btn   = document.getElementById('restart-floor1-btn');

    if (isVictory || stats.depth === 1) {
      // Victory or died on floor 1: only one button needed
      retryBtn.textContent = isVictory ? 'Play Again' : '▶ Play Again';
      floor1Btn.style.display = 'none';
    } else {
      // Died on floor 2 or 3: offer retry same floor or full restart
      retryBtn.textContent = `▶ Retry Floor ${stats.depth}`;
      floor1Btn.style.display = '';
    }

    retryBtn.onclick  = () => { this.goDialog.close(); onRetry(); };
    floor1Btn.onclick = () => { this.goDialog.close(); onRestartFloor1(); };
    this.goDialog.showModal();
  }

  showFloorComplete(depth, stats, newDepth, onBuy, onNext, onRestart) {
    const titleEl    = document.getElementById('fc-title');
    const achieveEl  = document.getElementById('fc-achievements');
    const statsEl    = document.getElementById('fc-stats');
    const badgeRowEl = document.getElementById('fc-badge-row');
    const shopEl     = document.getElementById('fc-shop');
    const nextBtn    = document.getElementById('fc-next-btn');
    const restartBtn = document.getElementById('fc-restart-btn');

    const isFinalFloor = newDepth > MAX_DEPTH;
    titleEl.textContent = isFinalFloor ? '★ Dungeon Conquered!' : `Floor ${depth} Cleared!`;
    nextBtn.textContent = isFinalFloor ? 'Victory ★' : `Floor ${newDepth} ▶`;

    // Badges — quest complete badge always shown first
    const badges = [
      { text: `⚔ Floor ${depth} Quest Complete`, cls: 'badge-quest' },
    ];
    if (stats.bossKilled)                               badges.push({ text: '★ Boss Slain',        cls: 'badge-boss' });
    if (stats.hpPercent >= 0.75)                        badges.push({ text: '❤ Survivor',           cls: 'badge-surv' });
    if (stats.floorKills >= stats.killsRequired * 1.5)  badges.push({ text: '☠ Massacre',           cls: 'badge-boss' });
    if (stats.itemsFound >= 3)                          badges.push({ text: '◆ Treasure Hunter',    cls: 'badge-loot' });
    if (stats.floorTurns <= 80)                         badges.push({ text: '⚡ Speed Clearer',     cls: 'badge-speed' });
    badgeRowEl.innerHTML = badges.map(b => `<span class="fc-badge ${b.cls}">${b.text}</span>`).join('');

    // Reward + next quest block
    const achLines = [`<div class="fc-reward">+20 Max HP — fully restored!</div>`];
    if (stats.bossKilled) achLines.push(`<div>You slew the floor boss!</div>`);
    if (!isFinalFloor) {
      const nextReq = FLOOR_CONFIG[newDepth]?.killsRequired ?? 0;
      const nextBoss = FLOOR_CONFIG[newDepth]?.boss;
      achLines.push(`<div class="fc-next-quest">▶ Floor ${newDepth} Quest: Slay <strong>${nextReq}</strong> enemies to open the gate</div>`);
      if (nextBoss) {
        const bossName = MONSTER_TEMPLATES[nextBoss]?.name ?? nextBoss;
        achLines.push(`<div class="fc-next-quest">⚠ Boss awaits: <strong>${escHtml(bossName)}</strong></div>`);
      }
    }
    achieveEl.innerHTML = achLines.join('');

    // Stats grid
    statsEl.innerHTML = [
      goStatRow('Quest kills',   `${stats.floorKills}/${stats.killsRequired}`),
      goStatRow('Total kills',   stats.kills),
      goStatRow('Gold',          stats.gold),
      goStatRow('Level',         stats.level),
      goStatRow('HP',            `${stats.hp}/${stats.maxHp}`),
      goStatRow('Turns',         stats.floorTurns),
    ].join('');

    // Shop (only between floors, not after the final floor)
    const catalog = SHOP_BY_DEPTH[depth];
    if (!isFinalFloor && catalog) {
      let currentGold = stats.gold;
      const renderShop = () => {
        shopEl.innerHTML =
          `<div class="fc-shop-title">&#x1F6D2; Merchant &mdash; <span id="fc-shop-gold">${currentGold}</span>g</div>` +
          catalog.map((entry, idx) => {
            const t = ITEM_TEMPLATES[entry.id];
            const canAfford = currentGold >= entry.price;
            return `<div class="fc-shop-row">` +
              `<span class="fc-shop-name">${escHtml(t.name)}</span>` +
              `<span class="fc-shop-desc">${escHtml(t.description)}</span>` +
              `<span class="fc-shop-price">${entry.price}g</span>` +
              `<button class="fc-shop-btn" data-idx="${idx}"${canAfford ? '' : ' disabled'}>Buy</button>` +
              `</div>`;
          }).join('');
        shopEl.querySelectorAll('.fc-shop-btn:not([disabled])').forEach(btn => {
          btn.addEventListener('click', () => {
            const entry = catalog[parseInt(btn.dataset.idx, 10)];
            const newGold = onBuy(entry.id, entry.price);
            if (newGold !== false) {
              currentGold = newGold;
              btn.textContent = 'Bought';
              btn.disabled = true;
              document.getElementById('fc-shop-gold').textContent = currentGold;
              shopEl.querySelectorAll('.fc-shop-btn:not([disabled])').forEach(b => {
                const price = catalog[parseInt(b.dataset.idx, 10)].price;
                if (price > currentGold) b.disabled = true;
              });
            }
          });
        });
      };
      renderShop();
    } else {
      shopEl.innerHTML = '';
    }

    nextBtn.onclick    = () => { this.fcDialog.close(); onNext(); };
    restartBtn.onclick = () => { this.fcDialog.close(); onRestart(); };
    this.fcDialog.showModal();
  }

  _renderHighscores(currentScore, stats, isVictory) {
    const key  = 'dc_highscores';
    const raw  = localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];
    list.push({
      score: currentScore, depth: stats.depth, kills: stats.kills,
      gold: stats.gold, level: stats.level, win: isVictory,
      date: new Date().toLocaleDateString(),
    });
    list.sort((a, b) => b.score - a.score);
    const top5 = list.slice(0, 5);
    localStorage.setItem(key, JSON.stringify(top5));
    const currentIdx = top5.findIndex(e => e.score === currentScore && e.date === new Date().toLocaleDateString());
    this.hsList.innerHTML =
      '<div class="hs-title">Best Runs</div>' +
      top5.map((e, i) => {
        const isCurrent = (i === currentIdx) ? ' hs-current' : '';
        const badge = e.win ? '★' : ' ';
        return `<div class="hs-entry${isCurrent}"><span>${badge} #${i + 1} Floor ${e.depth} · Lv${e.level}</span><span>${e.score} pts</span></div>`;
      }).join('');
  }
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function statRow(label, val) {
  return `<div class="stat-row"><span class="stat-label">${label}</span><span class="stat-val">${val}</span></div>`;
}
function equipRow(label, val) {
  return `<div class="equip-row"><span>${label}:</span><span class="equip-name">${val}</span></div>`;
}
function goStatRow(label, val) {
  return `<div class="stat-row"><span class="stat-label">${escHtml(label)}</span><span class="stat-val">${escHtml(String(val))}</span></div>`;
}
function hpColorClass(hp, max, prefix) {
  const ratio = hp / max;
  if (ratio > 0.5) return `${prefix}-hp-high`;
  if (ratio > 0.25) return `${prefix}-hp-med`;
  return `${prefix}-hp-low`;
}

// ─────────────────────────────────────────────────────────────
// game.js
// ─────────────────────────────────────────────────────────────
class Game {
  constructor() {
    const canvas  = document.getElementById('game-canvas');
    this.renderer = new Renderer(canvas);
    this.input    = new InputHandler(canvas, action => this.processTurn(action));
    this.ui       = new UI();

    this.input.bindDpad(document.getElementById('dpad'));
    this.input.bindMobileActions(document.getElementById('mobile-actions'));

    this._resizeObserver = new ResizeObserver(() => this._onResize());
    this._resizeObserver.observe(canvas.parentElement);

    this.state = null;
    this.input.setEnabled(false); // enabled after menu dismissed
  }

  newGame(startDepth = 1) {
    const seed   = Date.now();
    this._seed   = seed;

    // Snapshot gear from the previous run before we overwrite state
    const prevPlayer = (startDepth > 1) ? this.state?.player : null;

    const player = new Player(0, 0);
    player.dungeon_depth = startDepth;
    player.gold = loadBankGold(); // carry persistent bank gold into the run
    if (startDepth > 1) {
      player.maxHp += (startDepth - 1) * 20;
      player.hp = player.maxHp;
      // Restore inventory and equipped gear — only reset on floor 1
      if (prevPlayer) {
        player.inventory = [...prevPlayer.inventory];
        player.weapon    = prevPlayer.weapon  ?? null;
        player.armor     = prevPlayer.armor   ?? null;
        player.boots     = prevPlayer.boots   ?? null;
        player.helmet    = prevPlayer.helmet  ?? null;
      }
    }
    this.state = {
      map: null, player, monsters: [], items: [], traps: [],
      messages: [], depth: startDepth, turn: 0, rng: createRNG(seed),
      gateOpen: false, floorTurnStart: 0,
    };
    this._loadFloor(startDepth, true);
    this.input.setEnabled(true);
    const msg = startDepth > 1
      ? `You return to floor ${startDepth}. Prove yourself!`
      : 'You descend into the dungeon. Good luck!';
    this.ui.addMessage(msg, 'info');
    this.ui.flushMessages();
  }

  _loadFloor(depth, skipHpBonus = false) {
    const { state } = this;
    const { rng, player } = state;
    const map = generateDungeon(depth, rng);
    state.map            = map;
    state.depth          = depth;
    state.monsters       = [];
    state.items          = [];
    state.traps          = [];
    state.gateOpen       = false;
    state.floorTurnStart = state.turn;
    player.dungeon_depth = depth;
    player.x = map.startPos.x;
    player.y = map.startPos.y;
    player.energy = 0;
    // +20 Max HP bonus for each floor descended into
    if (depth > 1 && !skipHpBonus) {
      player.maxHp += 20;
      player.hp     = player.maxHp; // full heal as floor-clear reward
    }
    // Reset floor-tracking stats
    player.floorKills      = 0;
    player.potionsUsed     = 0;
    player.bossKilled      = false;
    player.hpAtFloorStart  = player.hp;
    // Record floor attempt in persistent stats
    const _gs = loadGameStats();
    _gs.floorAttempts[depth] = (_gs.floorAttempts[depth] || 0) + 1;
    saveGameStats(_gs);
    // Vision narrows slightly each level: 8 → 7 → 6
    player.visionRadius = 8 - (depth - 1);
    for (const spawn of map.spawnMonsters) {
      const m = createMonster(spawn.templateId, spawn.x, spawn.y);
      m.rarity = rollRarity(rng, depth);
      // Scale stats by rarity
      const mult = m.rarity.mult;
      m.maxHp    = Math.round(m.maxHp * mult);
      m.hp       = m.maxHp;
      m.attack   = Math.round(m.attack * mult);
      m.defense  = Math.round(m.defense * mult);
      state.monsters.push(m);
    }
    // Spawn boss in last room — HP matches player's current max HP for a fair fight
    if (map.bossSpawn) {
      const boss = createMonster(map.bossSpawn.templateId, map.bossSpawn.x, map.bossSpawn.y);
      boss.isBossInstance = true;
      boss.maxHp = player.maxHp;
      boss.hp    = player.maxHp;
      state.monsters.push(boss);
    }
    for (const spawn of map.spawnItems) {
      const item = createItem(spawn.templateId, spawn.x, spawn.y);
      item.rarity = rollRarity(rng, depth);
      // Scale item stats by rarity mult
      if (item.template.stats && item.rarity.mult !== 1.0) {
        item.scaledStats = {};
        for (const [k, v] of Object.entries(item.template.stats))
          item.scaledStats[k] = Math.round(v * item.rarity.mult);
      }
      state.items.push(item);
    }
    for (const spawn of map.spawnTraps)
      state.traps.push(new Trap(spawn.x, spawn.y, spawn.type));
    computeFOV(map, player.x, player.y, player.visionRadius);
    this._render();
  }

  _onResize() {
    if (!this.state?.map) return;
    this.renderer.computeLayout(this.state.map.width, this.state.map.height);
    this._render();
  }

  processTurn(action) {
    if (!this.state) return;
    const { state } = this;
    if (action.type === 'openInventory') {
      this.ui.showInventory(state.player, item => this.processTurn({ type: 'useItem', item }));
      return;
    }
    const playerActed = this._resolvePlayerAction(action);
    if (!playerActed) return;
    state.turn++;
    state.player.turnCount++;
    if (this._checkWin()) return;
    this._runMonsterTurns();
    this._removeDeadMonsters();
    state.player.tickStatuses();
    state.player.tickAbilityCooldowns();
    state.monsters.forEach(m => m.tickStatuses());
    // Poison damage
    if (state.player.hasStatus('poison')) {
      const dmg = state.player.takeDamage(2);
      this.ui.addMessage(`Poison deals ${dmg} damage!`, 'combat');
    }
    // Poison pool trap ongoing damage
    if (state.traps) {
      for (const trap of state.traps) {
        if (trap.type === 'poison' && trap.revealed && !trap.armed &&
            trap.x === state.player.x && trap.y === state.player.y) {
          const dmg = state.player.takeDamage(3);
          this.ui.addMessage(`The poison pool burns for ${dmg} damage!`, 'combat');
        }
      }
    }
    if (!state.player.isAlive()) { this._triggerGameOver(); return; }
    computeFOV(state.map, state.player.x, state.player.y, state.player.visionRadius);
    this._render();
    this.ui.updateStats(state.player, state);
    this.ui.flushMessages();
  }

  _resolvePlayerAction(action) {
    const { state } = this;
    const { player, map, monsters, items, traps } = state;
    switch (action.type) {
      case 'move': {
        const nx = player.x + action.dx;
        const ny = player.y + action.dy;
        const target = monsters.find(m => m.x === nx && m.y === ny && m.isAlive());
        if (target) {
          // Lich arcane shield absorbs player attacks before damage goes through
          if (target.template.lichShield) {
            if (target.lichShieldCurrent === undefined)
              target.lichShieldCurrent = target.template.lichShield;
            if (target.lichShieldCurrent > 0) {
              target.lichShieldCurrent--;
              this.ui.addMessage(
                target.lichShieldCurrent > 0
                  ? `The Lich's arcane shield absorbs your strike! (${target.lichShieldCurrent} charges left)`
                  : `The Lich's arcane shield shatters!`,
                'combat'
              );
              return true;
            }
          }
          const result = resolveMelee(player, target, state.rng);
          const msg    = applyMelee(result);
          this.ui.addMessage(msg, 'combat');
          if (!target.isAlive()) {
            const xpMsgs = player.gainXP(target.xpValue);
            player.kills++;
            player.floorKills++;
            if (target.isBossInstance || target.template.isBoss) player.bossKilled = true;
            xpMsgs.forEach(m => this.ui.addMessage(m, 'level'));
            this._checkGateOpen();
          }
          return true;
        }
        if (!map.isWalkable(nx, ny)) return false;
        if (monsters.some(m => m.x === nx && m.y === ny)) return false;
        player.x = nx;
        player.y = ny;
        // Auto-descend: stepping onto open stairs triggers floor complete
        if (state.gateOpen && map.getTile(nx, ny) === TILE.STAIRS_DOWN) {
          this.ui.flushMessages();
          if (state.depth >= MAX_DEPTH) {
            this._triggerVictory();
          } else {
            this._triggerFloorComplete(state.depth + 1);
          }
          return true;
        }
        // Check traps
        if (traps) {
          const trap = traps.find(t => t.x === nx && t.y === ny && t.armed);
          if (trap) this._triggerTrap(trap);
        }
        // Auto-pickup everything on the landing tile
        const itemsHere = items.filter(i => i.x === nx && i.y === ny);
        for (const item of itemsHere) {
          if (item.template.itemType === 'gold') {
            player.gold += item.quantity;
            state.items = state.items.filter(i => i !== item);
            this.ui.addMessage(`You pick up ${item.quantity} gold.`, 'loot');
          } else {
            const added = player.addItem(item);
            if (added) {
              state.items = state.items.filter(i => i !== item);
              this.ui.addMessage(`You pick up the ${item.name}.`, 'loot');
            } else {
              this.ui.addMessage(`Inventory full — can't pick up ${item.name}!`, 'info');
            }
          }
        }
        return true;
      }
      case 'wait': return true;
      case 'pickUp': {
        const pile = items.filter(i => i.x === player.x && i.y === player.y);
        if (pile.length === 0) { this.ui.addMessage('Nothing to pick up here.', 'info'); return false; }
        const item = pile[0];
        if (item.template.itemType === 'gold') {
          player.gold += item.quantity;
          state.items = state.items.filter(i => i !== item);
          this.ui.addMessage(`You pick up ${item.quantity} gold.`, 'loot');
        } else {
          const added = player.addItem(item);
          if (added) {
            state.items = state.items.filter(i => i !== item);
            this.ui.addMessage(`You pick up the ${item.name}.`, 'loot');
          } else {
            this.ui.addMessage('Your inventory is full!', 'info');
            return false;
          }
        }
        return true;
      }
      case 'useItem': {
        const { item } = action;
        if (!player.inventory.includes(item)) return false;
        const result = applyItem(item, player, state);
        if (result.message) this.ui.addMessage(result.message, 'loot');
        if (result.type === 'heal') player.potionsUsed++;
        if (result.targets) {
          result.targets.forEach(m => {
            if (!m.isAlive()) {
              const xpMsgs = player.gainXP(m.xpValue);
              player.kills++;
              player.floorKills++;
              if (m.isBossInstance || m.template.isBoss) player.bossKilled = true;
              xpMsgs.forEach(msg => this.ui.addMessage(msg, 'level'));
            }
          });
          this._checkGateOpen();
        }
        return true;
      }
      case 'descend': {
        const { x, y } = map.stairsPos;
        if (player.x !== x || player.y !== y) {
          this.ui.addMessage('You are not standing on the stairs.', 'info');
          return false;
        }
        if (!state.gateOpen) {
          const req = FLOOR_CONFIG[state.depth]?.killsRequired ?? 0;
          const remaining = Math.max(0, req - player.floorKills);
          this.ui.addMessage(`The gate is sealed! Slay ${remaining} more monster${remaining !== 1 ? 's' : ''} to break the seal.`, 'info');
          return false;
        }
        if (state.depth >= MAX_DEPTH) { this._triggerVictory(); return false; }
        const newDepth = state.depth + 1;
        this.ui.addMessage(`Floor ${state.depth} cleared! Prepare for floor ${newDepth}.`, 'info');
        this.ui.flushMessages();
        this._triggerFloorComplete(newDepth);
        return false;
      }
      case 'ability': {
        return this._resolveAbility(action.id);
      }
      case 'dropItem': {
        const { item } = action;
        if (!player.inventory.includes(item)) return false;
        const wasEquipped = player.isEquipped(item);
        player.removeItem(item);
        state.items.push(createItem(item.template.id, player.x, player.y));
        this.ui.addMessage(
          wasEquipped ? `You drop the ${item.name} (unequipped).` : `You drop the ${item.name}.`,
          'loot'
        );
        return true;
      }
      default: return false;
    }
  }

  _resolveAbility(id) {
    const { state } = this;
    const { player, map, monsters } = state;
    if (!player.abilities.includes(id)) {
      this.ui.addMessage(`Ability not yet unlocked.`, 'info');
      return false;
    }
    if (!player.useAbility(id)) {
      const cd = player.abilityCooldowns[id];
      this.ui.addMessage(`${id} is on cooldown (${cd} turns).`, 'info');
      return false;
    }
    switch (id) {
      case 'dash': {
        // Teleport up to 3 tiles in a direction (pick first open)
        const dirs = [[0,-1],[0,1],[-1,0],[1,0]];
        let moved = false;
        for (const [dx, dy] of dirs) {
          for (let dist = 3; dist >= 1; dist--) {
            const nx = player.x + dx * dist;
            const ny = player.y + dy * dist;
            if (map.isWalkable(nx, ny) && !monsters.some(m => m.x===nx && m.y===ny && m.isAlive())) {
              player.x = nx; player.y = ny;
              this.ui.addMessage('You dash forward!', 'info');
              moved = true; break;
            }
          }
          if (moved) break;
        }
        if (!moved) this.ui.addMessage('No room to dash!', 'info');
        return true;
      }
      case 'battle_cry': {
        player.addStatus('buffed', 5);
        this.ui.addMessage('You let out a Battle Cry! +3 ATK for 5 turns.', 'info');
        return true;
      }
      case 'heal_surge': {
        const healAmt = Math.floor(player.maxHp * 0.25);
        const actual  = player.heal(healAmt);
        this.ui.addMessage(`Heal Surge restores ${actual} HP!`, 'loot');
        return true;
      }
    }
    return true;
  }

  _triggerTrap(trap) {
    trap.revealed = true;
    if (!trap.armed) return;
    const { player } = this.state;
    if (trap.type === 'spike') {
      trap.armed = false;
      const bootsId = player.boots?.template.id;
      if (bootsId === 'boots_iron') {
        this.ui.addMessage('Your iron boots protect you from the spike trap!', 'loot');
      } else {
        const dmg = player.takeDamage(bootsId === 'boots_leather' ? 4 : 8);
        this.ui.addMessage(
          bootsId === 'boots_leather'
            ? `Spike trap! Your leather boots soften the blow. -${dmg} HP!`
            : `You trigger a spike trap! -${dmg} HP!`,
          'combat'
        );
      }
    } else if (trap.type === 'poison') {
      // Poison pool stays active; adds poison status
      player.addStatus('poison', 5);
      this.ui.addMessage('You step into a poison pool! Poisoned for 5 turns.', 'combat');
    }
  }

  _triggerFloorComplete(newDepth) {
    this.input.setEnabled(false);
    // Record floor completion in persistent stats
    const _gs = loadGameStats();
    _gs.floorCompletions[this.state.depth] = (_gs.floorCompletions[this.state.depth] || 0) + 1;
    saveGameStats(_gs);
    // Bank the gold earned this floor so it's safe even if they quit mid-shop
    saveBankGold(this.state.player.gold);
    const snap = this._statsSnapshot();
    const onBuy = (itemId, price) => {
      const { player } = this.state;
      if (player.gold < price) return false;
      const item = createItem(itemId, 0, 0);
      if (!player.addItem(item)) return false; // inventory full
      player.gold -= price;
      saveBankGold(player.gold); // save after each purchase
      this.ui.updateStats(player, this.state);
      return player.gold;
    };
    this.ui.showFloorComplete(
      this.state.depth,
      snap,
      newDepth,
      onBuy,
      () => {
        this._loadFloor(newDepth);
        this.ui.updateStats(this.state.player, this.state);
        this.ui.flushMessages();
        this.input.setEnabled(true);
      },
      () => { this.newGame(); }
    );
  }

  _runMonsterTurns() {
    for (const monster of this.state.monsters) {
      if (!monster.isAlive()) continue;
      monster.gainEnergy();
      while (monster.energy >= 100 && monster.isAlive()) {
        const action = decideTurn(monster, this.state);
        this._resolveMonsterAction(monster, action);
        monster.spendEnergy();
      }
    }
  }

  _resolveMonsterAction(monster, action) {
    const { state } = this;
    const { player, map, monsters } = state;
    switch (action.type) {
      case 'move': {
        const { x, y } = action;
        if (!map.isWalkable(x, y)) return;
        if (monsters.some(m => m !== monster && m.x === x && m.y === y)) return;
        if (x === player.x && y === player.y) return;
        monster.x = x; monster.y = y;
        break;
      }
      case 'attack': {
        // Handle boss-specific attacks
        if (action.cleave) {
          // Goblin King cleave: hits player if adjacent (already is)
          const result = resolveMelee(monster, player, state.rng);
          let msg = applyMelee(result);
          this.ui.addMessage(msg + ' (Cleave!)', 'combat');
          if (!player.isAlive()) { this._triggerGameOver(); break; }
          break;
        }
        if (action.enraged) {
          // Orc Warchief enraged: double attack
          for (let i = 0; i < 2; i++) {
            const result = resolveMelee(monster, player, state.rng);
            const msg = applyMelee(result);
            this.ui.addMessage(msg + (i === 0 ? ' (Enraged!)' : ''), 'combat');
            if (!player.isAlive()) { this._triggerGameOver(); return; }
          }
          break;
        }
        const result = resolveMelee(monster, player, state.rng);
        const msg    = applyMelee(result);
        this.ui.addMessage(msg, 'combat');
        if (!player.isAlive()) this._triggerGameOver();
        break;
      }
      case 'ranged_attack': {
        const result = resolveRanged(monster, player, state.rng);
        const msg    = applyRanged(result);
        this.ui.addMessage(msg, 'combat');
        if (!player.isAlive()) this._triggerGameOver();
        break;
      }
      case 'summon': {
        const newMonster = createMonster(action.templateId, action.x, action.y);
        newMonster.aiState = 'alert';
        newMonster.lastKnownPos = { x: player.x, y: player.y };
        state.monsters.push(newMonster);
        this.ui.addMessage(`The ${monster.name} summons a ${newMonster.name}!`, 'combat');
        break;
      }
      case 'wait': break;
    }
  }

  _checkWin() {
    const { player, map } = this.state;
    const { x, y } = map.stairsPos;
    if (player.x === x && player.y === y && this.state.depth >= MAX_DEPTH && this.state.gateOpen) {
      this._triggerVictory();
      return true;
    }
    return false;
  }

  _checkGateOpen() {
    const { state } = this;
    if (state.gateOpen) return;
    const req = FLOOR_CONFIG[state.depth]?.killsRequired ?? 0;
    if (req === 0 || state.player.floorKills >= req) {
      state.gateOpen = true;
      this.ui.showGateBanner(state.depth);
      this.ui.addMessage('★ The gate rumbles open! You may now descend.', 'level');
    }
  }

  _triggerVictory() {
    this.input.setEnabled(false);
    saveBankGold(this.state.player.gold);
    const _gsV = loadGameStats();
    _gsV.victories = (_gsV.victories || 0) + 1;
    saveGameStats(_gsV);
    computeFOV(this.state.map, this.state.player.x, this.state.player.y, this.state.player.visionRadius);
    this._render();
    this.ui.updateStats(this.state.player, this.state);
    this.ui.flushMessages();
    this.ui.showGameOver(this._statsSnapshot(), true, () => this.newGame(), () => this.newGame());
  }

  _triggerGameOver() {
    this.input.setEnabled(false);
    saveBankGold(this.state.player.gold);
    const _gsD = loadGameStats();
    _gsD.floorDeaths[this.state.depth] = (_gsD.floorDeaths[this.state.depth] || 0) + 1;
    saveGameStats(_gsD);
    this._render();
    this.ui.updateStats(this.state.player, this.state);
    this.ui.flushMessages();
    const snap = this._statsSnapshot();
    this.ui.showGameOver(snap, false,
      () => this.newGame(snap.depth),  // retry same floor
      () => this.newGame(1)            // restart from floor 1
    );
  }

  _statsSnapshot() {
    const { player, depth, turn, floorTurnStart } = this.state;
    return {
      depth,
      kills:         player.kills,
      gold:          player.gold,
      level:         player.level,
      turns:         turn,
      hp:            player.hp,
      maxHp:         player.maxHp,
      floorKills:    player.floorKills,
      bossKilled:    player.bossKilled,
      hpPercent:     player.hp / player.maxHp,
      floorTurns:    turn - (floorTurnStart ?? 0),
      itemsFound:    player.inventory.length,
      killsRequired: FLOOR_CONFIG[depth]?.killsRequired ?? 0,
    };
  }

  _removeDeadMonsters() {
    const { state } = this;
    const dead = state.monsters.filter(m => !m.isAlive());
    const toAdd = [];
    for (const m of dead) {
      const drops = m.rollLoot(state.rng);
      for (const drop of drops)
        state.items.push(createItem(drop.templateId, drop.x, drop.y, drop.amount ?? 1));
      // Slime splitting
      if (m.template.splits && !m._hasSplit) {
        const dirs = [[0,-1],[0,1],[-1,0],[1,0],[-1,-1],[1,-1],[-1,1],[1,1]];
        let spawned = 0;
        for (const [dx, dy] of dirs) {
          if (spawned >= 2) break;
          const sx = m.x + dx, sy = m.y + dy;
          if (!state.map.isWalkable(sx, sy)) continue;
          if (state.monsters.some(mo => mo.x===sx && mo.y===sy)) continue;
          if (toAdd.some(mo => mo.x===sx && mo.y===sy)) continue;
          const small = createMonster('slime_small', sx, sy);
          small.aiState = 'alert';
          small.lastKnownPos = { x: state.player.x, y: state.player.y };
          small._hasSplit = true;
          toAdd.push(small);
          spawned++;
        }
        if (spawned > 0)
          this.ui.addMessage(`The ${m.name} splits into smaller slimes!`, 'combat');
      }
    }
    state.monsters = state.monsters.filter(m => m.isAlive());
    state.monsters.push(...toAdd);
  }

  loadFromSave(d) {
    const player   = _deserPlayer(d.player);
    const map      = _deserMap(d.map);
    const monsters = d.monsters.map(_deserMonster);
    const items    = d.items.map(_deserItem);
    const traps    = d.traps.map(t => {
      const trap = new Trap(t.x, t.y, t.type);
      trap.revealed = t.revealed; trap.armed = t.armed;
      return trap;
    });
    this._seed = d.seed;
    this.state = {
      map, player, monsters, items, traps,
      messages: [],
      depth: d.depth, turn: d.turn,
      gateOpen: d.gateOpen, floorTurnStart: d.floorTurnStart,
      rng: createRNG(d.seed ^ d.turn),
    };
    computeFOV(map, player.x, player.y, player.visionRadius);
    this.renderer.computeLayout(map.width, map.height);
    this.renderer.render(this.state);
    this.ui.updateStats(player, this.state);
    this.ui.flushMessages();
    this.input.setEnabled(true);
  }

  _render() {
    if (!this.state?.map) return;
    if (this.renderer.viewW === 0)
      this.renderer.computeLayout(this.state.map.width, this.state.map.height);
    this.renderer.render(this.state);
  }
}

// ─────────────────────────────────────────────────────────────
// Save / Load system
// ─────────────────────────────────────────────────────────────
const SAVE_KEY    = 'dc_save_';
const SAVE_SLOTS  = 3;
const SAVE_VER    = 1;

function _serItem(item) {
  return {
    tid: item.template.id, x: item.x, y: item.y,
    qty: item.quantity,
    rarity:      item.rarity      ? item.rarity.id      : null,
    scaledStats: item.scaledStats ?? null,
  };
}
function _deserItem(d) {
  const item = createItem(d.tid, d.x, d.y, d.qty ?? 1);
  if (d.rarity) {
    item.rarity = Object.values(RARITY).find(r => r.id === d.rarity) ?? RARITY.COMMON;
  }
  if (d.scaledStats) item.scaledStats = d.scaledStats;
  return item;
}

function _serPlayer(p) {
  const invIdx = item => p.inventory.indexOf(item);
  return {
    x: p.x, y: p.y, hp: p.hp, maxHp: p.maxHp,
    attack: p.attack, defense: p.defense, speed: p.speed,
    energy: p.energy, statuses: p.statuses,
    level: p.level, xp: p.xp, xpToNext: p.xpToNext,
    gold: p.gold, kills: p.kills, turnCount: p.turnCount,
    visionRadius: p.visionRadius, abilities: p.abilities,
    abilityCooldowns: p.abilityCooldowns,
    floorKills: p.floorKills, potionsUsed: p.potionsUsed,
    bossKilled: p.bossKilled, hpAtFloorStart: p.hpAtFloorStart,
    inventory: p.inventory.map(_serItem),
    weapon: invIdx(p.weapon), armor:  invIdx(p.armor),
    boots:  invIdx(p.boots),  helmet: invIdx(p.helmet),
  };
}
function _deserPlayer(d) {
  const p = new Player(d.x, d.y);
  Object.assign(p, {
    hp: d.hp, maxHp: d.maxHp, attack: d.attack, defense: d.defense,
    speed: d.speed, energy: d.energy, statuses: d.statuses ?? [],
    level: d.level, xp: d.xp, xpToNext: d.xpToNext, gold: d.gold,
    kills: d.kills, turnCount: d.turnCount, visionRadius: d.visionRadius,
    abilities: d.abilities ?? [], abilityCooldowns: d.abilityCooldowns ?? {},
    floorKills: d.floorKills ?? 0, potionsUsed: d.potionsUsed ?? 0,
    bossKilled: d.bossKilled ?? false, hpAtFloorStart: d.hpAtFloorStart ?? d.hp,
  });
  p.inventory = d.inventory.map(_deserItem);
  p.weapon = d.weapon >= 0 ? p.inventory[d.weapon] : null;
  p.armor  = d.armor  >= 0 ? p.inventory[d.armor]  : null;
  p.boots  = d.boots  >= 0 ? p.inventory[d.boots]  : null;
  p.helmet = d.helmet >= 0 ? p.inventory[d.helmet] : null;
  return p;
}

function _serMonster(m) {
  return {
    tid: m.template.id, x: m.x, y: m.y,
    hp: m.hp, maxHp: m.maxHp, energy: m.energy,
    statuses: m.statuses, aiState: m.aiState,
    lastKnownPos: m.lastKnownPos, lostSightTurns: m.lostSightTurns,
    summonTick: m.summonTick ?? 0,
    lichShieldCurrent: m.lichShieldCurrent,
    isBossInstance: m.isBossInstance ?? false,
  };
}
function _deserMonster(d) {
  const m = createMonster(d.tid, d.x, d.y);
  Object.assign(m, {
    hp: d.hp, maxHp: d.maxHp, energy: d.energy,
    statuses: d.statuses ?? [], aiState: d.aiState ?? 'idle',
    lastKnownPos: d.lastKnownPos ?? null,
    lostSightTurns: d.lostSightTurns ?? 0,
    summonTick: d.summonTick ?? 0,
  });
  if (d.lichShieldCurrent != null) m.lichShieldCurrent = d.lichShieldCurrent;
  if (d.isBossInstance) m.isBossInstance = true;
  return m;
}

function _serMap(map) {
  return {
    w: map.width, h: map.height,
    tiles: Array.from(map.tiles),
    vis:   Array.from(map.visibility),
    startPos: map.startPos, stairsPos: map.stairsPos,
  };
}
function _deserMap(d) {
  const map = new MapData(d.w, d.h);
  map.tiles.set(d.tiles);
  map.visibility.set(d.vis);
  map.startPos  = d.startPos;
  map.stairsPos = d.stairsPos;
  return map;
}

function saveToSlot(slot, state, seed) {
  const data = {
    ver: SAVE_VER, savedAt: Date.now(), seed,
    depth: state.depth, turn: state.turn,
    gateOpen: state.gateOpen, floorTurnStart: state.floorTurnStart,
    player:   _serPlayer(state.player),
    map:      _serMap(state.map),
    monsters: state.monsters.filter(m => m.isAlive()).map(_serMonster),
    items:    state.items.map(_serItem),
    traps:    state.traps.map(t => ({ x: t.x, y: t.y, type: t.type, revealed: t.revealed, armed: t.armed })),
  };
  try { localStorage.setItem(SAVE_KEY + slot, JSON.stringify(data)); return true; }
  catch(e) { return false; }
}

function loadFromSlot(slot) {
  try {
    const raw = localStorage.getItem(SAVE_KEY + slot);
    return raw ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}

function deleteSaveSlot(slot) {
  localStorage.removeItem(SAVE_KEY + slot);
}

function getSaveSlotInfo(slot) {
  const d = loadFromSlot(slot);
  if (!d) return null;
  const date = new Date(d.savedAt);
  const pad  = n => String(n).padStart(2, '0');
  const ts   = `${date.getMonth()+1}/${date.getDate()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  return { depth: d.depth, level: d.player.level, hp: d.player.hp, maxHp: d.player.maxHp, ts };
}

// ─────────────────────────────────────────────────────────────
// Loading screen  +  Start menu
// ─────────────────────────────────────────────────────────────

const LOAD_STEPS = [
  { pct: 18,  label: 'GENERATING DUNGEONS' },
  { pct: 38,  label: 'SPAWNING MONSTERS' },
  { pct: 56,  label: 'PLACING LOOT' },
  { pct: 72,  label: 'COMPUTING FOG OF WAR' },
  { pct: 88,  label: 'LOADING TILE GRAPHICS' },
  { pct: 100, label: 'READY' },
];

function runLoadingScreen(onDone) {
  const screen  = document.getElementById('loading-screen');
  const barFill = document.getElementById('lc-bar-fill');
  const pctEl   = document.getElementById('lc-pct');
  const statusEl = document.getElementById('lc-status');

  let stepIdx = 0;
  function nextStep() {
    if (stepIdx >= LOAD_STEPS.length) {
      setTimeout(() => {
        screen.classList.add('ls-out');
        setTimeout(() => { screen.remove(); onDone(); }, 700);
      }, 400);
      return;
    }
    const { pct, label } = LOAD_STEPS[stepIdx++];
    barFill.style.width = pct + '%';
    pctEl.textContent   = pct + '%';
    statusEl.textContent = label;
    const delay = stepIdx === LOAD_STEPS.length ? 320 : 260 + Math.random() * 200;
    setTimeout(nextStep, delay);
  }
  setTimeout(nextStep, 350);
}

function spawnMenuParticles() {
  const container = document.getElementById('sm-particles');
  const count = 28;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'sm-particle';
    const size   = 2 + Math.random() * 4;
    const left   = 5 + Math.random() * 90;
    const delay  = Math.random() * 12;
    const dur    = 8 + Math.random() * 14;
    p.style.cssText =
      `width:${size}px;height:${size}px;` +
      `left:${left}%;bottom:-10px;` +
      `animation-duration:${dur}s;animation-delay:${delay}s;` +
      `opacity:0;`;
    container.appendChild(p);
  }
}

function showGameMenuDialog(player, state, onBuy, onHome, onResume, onSaveLoad, onRestart) {
  const dlg   = document.getElementById('game-menu-dialog');
  const depth = state?.depth ?? 1;
  let currentGold = player?.gold ?? 0;
  const available = SHOP_CATALOG.filter(e => e.minDepth <= depth);

  // ── Render shop ──────────────────────────────────────────────
  const shopEl = document.getElementById('gmd-shop');
  document.getElementById('gmd-gold-val').textContent = currentGold + 'g';

  const renderShop = () => {
    shopEl.innerHTML = available.map((entry, idx) => {
      const t = ITEM_TEMPLATES[entry.id];
      const canAfford = currentGold >= entry.price;
      return `<div class="ss-row${canAfford ? '' : ' ss-cant-afford'}" title="${escHtml(t.description)}">` +
        `<span class="ss-glyph" style="color:${t.color}">${escHtml(t.glyph)}</span>` +
        `<span class="ss-name">${escHtml(t.name)}</span>` +
        `<span class="ss-price">${entry.price}g</span>` +
        `<button class="ss-buy-btn" data-idx="${idx}"${canAfford ? '' : ' disabled'}>Buy</button>` +
        `</div>`;
    }).join('') || '<div class="side-inv-empty">No items available</div>';

    shopEl.querySelectorAll('.ss-buy-btn:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => {
        const entry = available[parseInt(btn.dataset.idx, 10)];
        const newGold = onBuy(entry.id, entry.price);
        if (newGold !== false) {
          currentGold = newGold;
          btn.textContent = 'Bought';
          btn.disabled = true;
          document.getElementById('gmd-gold-val').textContent = currentGold + 'g';
          shopEl.querySelectorAll('.ss-buy-btn:not([disabled])').forEach(b => {
            const p = available[parseInt(b.dataset.idx, 10)].price;
            if (p > currentGold) b.disabled = true;
          });
          shopEl.querySelectorAll('.ss-row').forEach((row, i) => {
            const p = available[i]?.price ?? 0;
            row.classList.toggle('ss-cant-afford', p > currentGold && !row.querySelector('[disabled]')?.textContent === 'Bought');
          });
        }
      });
    });
  };
  renderShop();

  // ── Render stats ─────────────────────────────────────────────
  const gs   = loadGameStats();
  const bank = loadBankGold();
  document.getElementById('gmd-bank-row').innerHTML =
    `<span>Bank Gold</span><span class="gmd-gold-val">${bank}g</span>`;
  document.getElementById('gmd-stats-body').innerHTML =
    [1, 2, 3].map(f => `<tr>
      <td>Floor ${f}</td>
      <td>${gs.floorAttempts[f]    || 0}</td>
      <td>${gs.floorCompletions[f] || 0}</td>
      <td>${gs.floorDeaths[f]      || 0}</td>
    </tr>`).join('');
  document.getElementById('gmd-victories').textContent = `Victories: ${gs.victories || 0}`;

  // ── Buttons ──────────────────────────────────────────────────
  document.getElementById('gmd-close-btn').onclick  = () => { dlg.close(); onResume(); };
  document.getElementById('gmd-resume-btn').onclick = () => { dlg.close(); onResume(); };
  document.getElementById('gmd-home-btn').onclick   = () => { dlg.close(); onHome(); };
  document.getElementById('btn-saveload').onclick   = () => { dlg.close(); onSaveLoad(); };
  document.getElementById('btn-restart').onclick    = () => { dlg.close(); onRestart(); };

  dlg.showModal();
}

function showStatsDialog(onClose) {
  const dlg  = document.getElementById('stats-dialog');
  const gs   = loadGameStats();
  const bank = loadBankGold();

  document.getElementById('sd-gold-row').innerHTML =
    `<span class="sd-gold-label">Bank Gold</span><span class="sd-gold-val">${bank}g</span>`;

  const tbody = document.getElementById('sd-table-body');
  tbody.innerHTML = [1, 2, 3].map(f => `
    <tr>
      <td>Floor ${f}</td>
      <td>${gs.floorAttempts[f]    || 0}</td>
      <td>${gs.floorCompletions[f] || 0}</td>
      <td>${gs.floorDeaths[f]      || 0}</td>
    </tr>`).join('');

  document.getElementById('sd-victories').textContent =
    `Victories: ${gs.victories || 0}`;

  document.getElementById('sd-close-btn').onclick = () => { dlg.close(); onClose?.(); };
  document.getElementById('sd-exit-btn').onclick  = () => {
    dlg.close();
    if (!window.close()) window.location.href = 'about:blank';
  };
  dlg.showModal();
}

function showStartMenu(onPlay, onLoadSave) {
  const menu        = document.getElementById('start-menu');
  const exitBtn     = document.getElementById('sm-exit-btn');
  const continueBtn = document.getElementById('sm-continue-btn');
  // Reset state for re-entry
  menu.classList.remove('sm-out', 'sm-hidden');
  // Show Continue only when a save exists
  const hasSave = [1,2,3].some(s => localStorage.getItem(SAVE_KEY + s));
  continueBtn.style.display = hasSave ? '' : 'none';
  // Clear old particles
  document.getElementById('sm-particles').innerHTML = '';
  spawnMenuParticles();
  document.getElementById('sm-play').onclick = () => {
    menu.classList.add('sm-out');
    setTimeout(() => { menu.classList.add('sm-hidden'); onPlay(); }, 500);
  };
  continueBtn.onclick = () => {
    if (onLoadSave) onLoadSave();
  };
  document.getElementById('sm-controls-btn').onclick = () => {
    const dlg = document.getElementById('howtoplay-dialog');
    document.getElementById('htp-close-btn').onclick = () => dlg.close();
    dlg.showModal();
  };
  exitBtn.onclick = () => {
    if (!window.close()) window.location.href = 'about:blank';
  };
}

// ─────────────────────────────────────────────────────────────
// Save / Load dialog UI
// ─────────────────────────────────────────────────────────────
function showSaveLoadDialog(game, onLoad) {
  const dlg      = document.getElementById('saveload-dialog');
  const slotsEl  = document.getElementById('sl-slots');

  function refresh() {
    slotsEl.innerHTML = '';
    const canSave = !!game.state;
    for (let s = 1; s <= SAVE_SLOTS; s++) {
      const info = getSaveSlotInfo(s);
      const row  = document.createElement('div');
      row.className = 'sl-slot';

      const label = document.createElement('div');
      label.className = 'sl-slot-label';
      if (info) {
        label.innerHTML =
          `<span class="sl-slot-num">Slot ${s}</span>` +
          `<span class="sl-slot-info">Floor ${info.depth} · Lv.${info.level} · ` +
          `HP ${info.hp}/${info.maxHp}</span>` +
          `<span class="sl-slot-date">${info.ts}</span>`;
      } else {
        label.innerHTML =
          `<span class="sl-slot-num">Slot ${s}</span>` +
          `<span class="sl-slot-empty">— empty —</span>`;
      }

      const btns = document.createElement('div');
      btns.className = 'sl-slot-btns';

      if (canSave) {
        const btnSave = document.createElement('button');
        btnSave.textContent = '💾 Save';
        btnSave.className = 'sl-btn sl-btn-save';
        btnSave.onclick = () => {
          if (info && !confirm(`Overwrite Slot ${s}?`)) return;
          saveToSlot(s, game.state, game._seed);
          refresh();
        };
        btns.appendChild(btnSave);
      }

      if (info) {
        const btnLoad = document.createElement('button');
        btnLoad.textContent = '📂 Load';
        btnLoad.className = 'sl-btn sl-btn-load';
        btnLoad.onclick = () => {
          const data = loadFromSlot(s);
          if (!data) return;
          dlg.close();
          onLoad(data);
        };

        const btnDel = document.createElement('button');
        btnDel.textContent = '🗑';
        btnDel.className = 'sl-btn sl-btn-del';
        btnDel.title = 'Delete save';
        btnDel.onclick = () => {
          if (confirm(`Delete Slot ${s} save?`)) { deleteSaveSlot(s); refresh(); }
        };
        btns.appendChild(btnLoad);
        btns.appendChild(btnDel);
      }

      row.appendChild(label);
      row.appendChild(btns);
      slotsEl.appendChild(row);
    }
  }

  refresh();
  document.getElementById('sl-close-btn').onclick = () => dlg.close();
  dlg.showModal();
}

// ─────────────────────────────────────────────────────────────
// Bootstrap
// ─────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('contextmenu', e => e.preventDefault());

  const game = new Game();

  // ── Game menu (pause / restart / exit) ──────────────
  let paused = false;
  const pauseOverlay = document.getElementById('pause-overlay');

  function setPaused(val) {
    paused = val;
    game.input.setEnabled(!val);
    pauseOverlay.style.display = val ? 'flex' : 'none';
    const icon = val ? '▶ Resume' : '⏸ Pause';
    const iconMob = val ? '▶' : '⏸';
    const btn = document.getElementById('btn-pause');
    const btnMob = document.getElementById('btn-pause-mob');
    if (btn) { btn.textContent = icon; btn.classList.toggle('gm-paused', val); }
    if (btnMob) { btnMob.textContent = iconMob; btnMob.classList.toggle('gm-paused', val); }
  }

  function bindGameMenu() {
    document.getElementById('btn-pause').onclick    = () => setPaused(!paused);
    document.getElementById('btn-pause-mob').onclick = () => setPaused(!paused);

    document.getElementById('btn-restart-mob').onclick = () => { setPaused(false); game.newGame(); };

    document.getElementById('btn-menu').onclick = () => {
      setPaused(true);
      const onBuy = (itemId, price) => {
        if (!game.state) return false;
        const { player } = game.state;
        if (player.gold < price) return false;
        const item = createItem(itemId, 0, 0);
        if (!player.addItem(item)) return false;
        player.gold -= price;
        saveBankGold(player.gold);
        game.ui.updateStats(player, game.state);
        return player.gold;
      };
      showGameMenuDialog(
        game.state?.player,
        game.state,
        onBuy,
        doExitToMenu,
        () => setPaused(false),
        () => {
          showSaveLoadDialog(game, (saveData) => {
            setPaused(false);
            game.loadFromSave(saveData);
          });
        },
        () => { setPaused(false); game.newGame(); }
      );
    };
    document.getElementById('btn-menu-mob').onclick = doExitToMenu;
  }

  function doExitToMenu() {
    setPaused(false);
    game.input.setEnabled(false);
    showStartMenu(
      () => { game.newGame(); },
      () => { showSaveLoadDialog(game, (saveData) => { game.loadFromSave(saveData); }); }
    );
  }

  bindGameMenu();

  // Zoom controls
  function applyZoom(delta) {
    if (!game.state) return;
    game.renderer.zoom = Math.max(-2, Math.min(6, game.renderer.zoom + delta));
    game.renderer.computeLayout(game.state.map.width, game.state.map.height);
    game.renderer.render(game.state);
  }
  document.getElementById('btn-zoom-in').onclick  = () => applyZoom(+1);
  document.getElementById('btn-zoom-out').onclick = () => applyZoom(-1);
  document.addEventListener('keydown', e => {
    if (document.querySelector('dialog[open]')) return;
    if (e.key === '+' || e.key === '=' || e.code === 'NumpadAdd')      applyZoom(+1);
    if (e.key === '-' || e.code === 'NumpadSubtract')                  applyZoom(-1);
    if (e.key === '0' || e.code === 'Numpad0') {
      game.renderer.zoom = 0;
      if (game.state) {
        game.renderer.computeLayout(game.state.map.width, game.state.map.height);
        game.renderer.render(game.state);
      }
    }
  });

  game.ui.bindSideInventory(
    item => game.processTurn({ type: 'useItem',  item }),
    item => game.processTurn({ type: 'dropItem', item })
  );

  game.ui.bindSideShop((itemId, price) => {
    if (!game.state) return false;
    const { player } = game.state;
    if (player.gold < price) return false;
    const item = createItem(itemId, 0, 0);
    if (!player.addItem(item)) { return false; }
    player.gold -= price;
    saveBankGold(player.gold);
    game.ui.updateStats(player, game.state);
    return true;
  });

  runLoadingScreen(() => {
    showStartMenu(
      () => { game.newGame(); },
      () => { showSaveLoadDialog(game, (saveData) => { game.loadFromSave(saveData); }); }
    );
  });
});

})();
