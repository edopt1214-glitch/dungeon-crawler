export const TILE = { WALL: 0, FLOOR: 1, STAIRS_DOWN: 2, STAIRS_UP: 3 };

export const VIS = { UNSEEN: 0, REMEMBERED: 1, VISIBLE: 2 };

export const COLORS = {
  WALL_FG: '#4a4a4a', WALL_BG: '#0d0d0d',
  FLOOR_FG: '#2a2a2a', FLOOR_BG: '#141414',
  STAIRS_DOWN_FG: '#ffff44', STAIRS_UP_FG: '#ffaa44',
  PLAYER: '#ffffff',
  RAT: '#888888', GOBLIN: '#55aa55', ORC: '#448844',
  TROLL: '#336633', NECROMANCER: '#bb44bb',
  POTION: '#ff5555', POTION_MAJOR: '#ff9999',
  WEAPON: '#bbbb55', WEAPON_SWORD: '#cccc66', WEAPON_AXE: '#dddd88',
  ARMOR: '#5555bb', ARMOR_CHAIN: '#7777cc', ARMOR_PLATE: '#9999dd',
  SCROLL: '#55aaff', SCROLL_MAPPING: '#aaddff',
  GOLD: '#ffaa00',
};

export const MONSTER_TEMPLATES = {
  rat: {
    id: 'rat', name: 'Rat', glyph: 'r', color: COLORS.RAT,
    hp: 5, attack: 2, defense: 0, speed: 100, xpValue: 10, alertRange: 4,
    lootTable: [{ id: 'gold', chance: 0.10, amount: [1, 3] }],
  },
  goblin: {
    id: 'goblin', name: 'Goblin', glyph: 'g', color: COLORS.GOBLIN,
    hp: 12, attack: 4, defense: 1, speed: 100, xpValue: 25, alertRange: 6,
    retreatBelow: 0.3,
    lootTable: [
      { id: 'gold', chance: 0.25, amount: [2, 8] },
      { id: 'potion_minor', chance: 0.10 },
    ],
  },
  orc: {
    id: 'orc', name: 'Orc', glyph: 'o', color: COLORS.ORC,
    hp: 25, attack: 7, defense: 3, speed: 100, xpValue: 50, alertRange: 5,
    lootTable: [
      { id: 'gold', chance: 0.40, amount: [5, 15] },
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
      { id: 'gold', chance: 0.60, amount: [10, 25] },
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
      { id: 'gold', chance: 0.80, amount: [15, 40] },
      { id: 'scroll_fireball', chance: 0.30 },
      { id: 'scroll_mapping', chance: 0.20 },
      { id: 'potion_major', chance: 0.25 },
    ],
  },
};

export const ITEM_TEMPLATES = {
  gold:            { id: 'gold',            name: 'Gold',                    glyph: '$', color: COLORS.GOLD,          itemType: 'gold',        stackable: true,  description: 'Shiny coins.' },
  potion_minor:    { id: 'potion_minor',    name: 'Healing Potion',          glyph: '!', color: COLORS.POTION,        itemType: 'consumable',  stackable: true,  stats: { healAmount: 15 }, description: 'Restores 15 HP.' },
  potion_major:    { id: 'potion_major',    name: 'Greater Healing Potion',  glyph: '!', color: COLORS.POTION_MAJOR,  itemType: 'consumable',  stackable: true,  stats: { healAmount: 30 }, description: 'Restores 30 HP.' },
  weapon_dagger:   { id: 'weapon_dagger',   name: 'Dagger',                  glyph: '/', color: COLORS.WEAPON,        itemType: 'weapon',      stats: { attack: 3 },   description: '+3 attack.' },
  weapon_sword:    { id: 'weapon_sword',    name: 'Sword',                   glyph: '/', color: COLORS.WEAPON_SWORD,  itemType: 'weapon',      stats: { attack: 6 },   description: '+6 attack.' },
  weapon_axe:      { id: 'weapon_axe',      name: 'Battle Axe',              glyph: '/', color: COLORS.WEAPON_AXE,   itemType: 'weapon',      stats: { attack: 10 },  description: '+10 attack.' },
  armor_leather:   { id: 'armor_leather',   name: 'Leather Armor',           glyph: '[', color: COLORS.ARMOR,         itemType: 'armor',       stats: { defense: 2 },  description: '+2 defense.' },
  armor_chain:     { id: 'armor_chain',     name: 'Chain Mail',              glyph: '[', color: COLORS.ARMOR_CHAIN,   itemType: 'armor',       stats: { defense: 4 },  description: '+4 defense.' },
  armor_plate:     { id: 'armor_plate',     name: 'Plate Armor',             glyph: '[', color: COLORS.ARMOR_PLATE,   itemType: 'armor',       stats: { defense: 7 },  description: '+7 defense.' },
  scroll_fireball: { id: 'scroll_fireball', name: 'Scroll of Fireball',      glyph: '?', color: COLORS.SCROLL,        itemType: 'scroll',      stats: { damage: 15 },  description: 'Deals 15 damage to all visible enemies.' },
  scroll_mapping:  { id: 'scroll_mapping',  name: 'Scroll of Mapping',       glyph: '?', color: COLORS.SCROLL_MAPPING,itemType: 'scroll',                              description: 'Reveals the entire floor.' },
};

// Per-floor spawning config (1-indexed; index 0 unused)
export const FLOOR_CONFIG = [
  null,
  { monsters: ['rat', 'goblin'],               monsterCount: [5, 7],  itemCount: [3, 5] }, // Level 1 – intro
  { monsters: ['goblin', 'orc'],               monsterCount: [6, 9],  itemCount: [3, 6] }, // Level 2 – mid
  { monsters: ['orc', 'troll', 'necromancer'], monsterCount: [7, 10], itemCount: [4, 7] }, // Level 3 – final
];

export const MAP_WIDTH  = 80;
export const MAP_HEIGHT = 50;
export const MAX_DEPTH  = 3;
export const MAX_INVENTORY = 26;
export const FOV_RADIUS_BASE = 8;
