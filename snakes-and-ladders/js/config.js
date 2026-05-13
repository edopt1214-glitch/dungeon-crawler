export const CANVAS_SIZE = 640;

export const DEFAULT_BOARD_SIZE = 10;
export const MIN_BOARD_SIZE = 8;
export const MAX_BOARD_SIZE = 12;

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 4;

export const HOP_DURATION_MS = 150;
export const HOP_HEIGHT_PX = 14;
export const SLIDE_DURATION_MS = 700;
export const CLIMB_DURATION_MS = 800;
export const DICE_ROLL_DURATION_MS = 600;
export const TOAST_DURATION_MS = 1800;

export const SNAKE_DENSITY = 0.8;
export const LADDER_DENSITY = 0.8;
export const POWERUP_TILE_RATIO = 0.5;

export const MAX_HELD_POWERUPS = 3;

export const PLAYER_COLORS = [
  "#ff6b6b",
  "#4dabf7",
  "#51cf66",
  "#fcc419",
  "#cc5de8",
  "#ff922b",
  "#22b8cf",
  "#f06595",
];

export const PLAYER_AVATARS = ["\u{1F600}", "\u{1F916}", "\u{1F436}", "\u{1F431}", "\u{1F981}", "\u{1F438}", "\u{1F47D}", "\u{1F985}"];

export const AI_DIFFICULTIES = ["easy", "medium", "hard"];

export const AI_PARAMS = {
  easy: { randomPowerupChance: 0.25 },
  medium: { snakeLookahead: 6, freezeProximity: 10, doubleRollHalf: 0.5 },
  hard: { shieldEVThreshold: 1.5, monteCarloTrials: 100 },
};

export const EXACT_FINISH = true;
