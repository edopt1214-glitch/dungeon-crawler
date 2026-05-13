import { PLAYER_COLORS, PLAYER_AVATARS } from "../config.js";

export function createPlayer(id, opts = {}) {
  return {
    id,
    name: opts.name || (opts.isAI ? `AI ${id + 1}` : `Player ${id + 1}`),
    isAI: !!opts.isAI,
    aiDifficulty: opts.aiDifficulty || null,
    color: opts.color || PLAYER_COLORS[id % PLAYER_COLORS.length],
    shape: opts.shape || ["circle", "square", "triangle", "star"][id % 4],
    avatar: opts.avatar || PLAYER_AVATARS[id % PLAYER_AVATARS.length],
    tile: 0,
    renderPos: { x: 0, y: 0 },
    powerups: [],
    effects: {
      shield: false,
      frozen: 0,
      doubleRollPending: false,
      miniJumpPending: false,
    },
    stats: {
      rolls: 0,
      snakesHit: 0,
      laddersClimbed: 0,
      powerupsUsed: 0,
      shieldsSaved: 0,
    },
  };
}
