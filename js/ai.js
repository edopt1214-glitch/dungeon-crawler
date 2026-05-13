import { VIS } from './constants.js';
import { chebyshev, randInt, randChoice, bfsStep, bfsGradient } from './utils.js';

// Returns an action object for the monster to execute.
// Possible actions:
//   { type: 'move', x, y }
//   { type: 'attack', target }
//   { type: 'wait' }
//   { type: 'summon', templateId, x, y }  (Necromancer only)
export function decideTurn(monster, state) {
  const { map, player, monsters, rng } = state;
  const t = monster.template;

  // ── Troll: regen HP every turn ──────────────────────────────────────────────
  if (t.regenPerTurn && monster.hp < monster.maxHp) {
    monster.hp = Math.min(monster.maxHp, monster.hp + t.regenPerTurn);
  }

  // ── Update sight and alert state ────────────────────────────────────────────
  const canSeePlayer = map.getVis(monster.x, monster.y) === VIS.VISIBLE &&
                       chebyshev(monster.x, monster.y, player.x, player.y) <= t.alertRange;

  if (canSeePlayer) {
    monster.aiState        = determineAlertState(monster, t, player);
    monster.lastKnownPos   = { x: player.x, y: player.y };
    monster.lostSightTurns = 0;
  } else if (monster.aiState !== 'idle') {
    monster.lostSightTurns++;
    // Return to idle after 5 unseen turns once we've reached last known position
    if (monster.lostSightTurns >= 5 &&
        monster.x === monster.lastKnownPos?.x &&
        monster.y === monster.lastKnownPos?.y) {
      monster.aiState = 'idle';
    }
  }

  switch (monster.aiState) {
    case 'alert':   return alertAction(monster, t, state, canSeePlayer);
    case 'fleeing': return fleeAction(monster, state);
    default:        return idleAction(monster, state);
  }
}

// ── State determination ───────────────────────────────────────────────────────
function determineAlertState(monster, template, player) {
  if (!template.retreatBelow) return 'alert';
  const hpRatio = monster.hp / monster.maxHp;
  if (monster.aiState === 'fleeing' && hpRatio < 0.5) return 'fleeing';
  if (hpRatio < template.retreatBelow) return 'fleeing';
  return 'alert';
}

// ── Idle: wander randomly ─────────────────────────────────────────────────────
function idleAction(monster, state) {
  const { map, monsters, player, rng } = state;
  if (rng() < 0.5) return { type: 'wait' }; // 50% chance to stand still

  const dirs = shuffledDirs(rng);
  for (const [dx, dy] of dirs) {
    const nx = monster.x + dx;
    const ny = monster.y + dy;
    if (isPassableForMonster(nx, ny, map, monsters, player, monster)) {
      return { type: 'move', x: nx, y: ny };
    }
  }
  return { type: 'wait' };
}

// ── Alert: approach and attack ────────────────────────────────────────────────
function alertAction(monster, template, state, canSeePlayer) {
  const { map, monsters, player, rng } = state;

  // Adjacent to player → attack
  if (chebyshev(monster.x, monster.y, player.x, player.y) === 1) {
    return { type: 'attack', target: player };
  }

  // Necromancer: maintain preferred distance
  if (template.preferDistMin !== undefined) {
    return necromancerAction(monster, template, state);
  }

  const target = canSeePlayer
    ? { x: player.x, y: player.y }
    : monster.lastKnownPos;

  if (!target) return { type: 'wait' };

  const step = bfsStep(
    monster.x, monster.y, target.x, target.y,
    map.width, map.height,
    (nx, ny) => isPassableForMonster(nx, ny, map, monsters, player, monster)
  );

  if (step) return { type: 'move', x: step.x, y: step.y };
  return { type: 'wait' };
}

// ── Flee: move away from player ───────────────────────────────────────────────
function fleeAction(monster, state) {
  const { map, monsters, player, rng } = state;

  // Still attack if adjacent (cornered)
  if (chebyshev(monster.x, monster.y, player.x, player.y) === 1) {
    return { type: 'attack', target: player };
  }

  const gradient = bfsGradient(
    player.x, player.y,
    map.width, map.height,
    (nx, ny) => map.isWalkable(nx, ny)
  );

  // Move to the adjacent tile with the greatest distance from player
  let bestDist = -1;
  let bestPos  = null;

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

// ── Necromancer: keep distance and summon ─────────────────────────────────────
function necromancerAction(monster, template, state) {
  const { map, monsters, player, rng } = state;
  const dist = chebyshev(monster.x, monster.y, player.x, player.y);

  // Summon a rat every N turns when alert
  monster.summonTick = (monster.summonTick || 0) + 1;
  if (monster.summonTick >= template.summonEvery) {
    monster.summonTick = 0;
    const dirs = shuffledDirs(rng);
    for (const [dx, dy] of dirs) {
      const sx = monster.x + dx;
      const sy = monster.y + dy;
      if (isPassableForMonster(sx, sy, map, monsters, player, monster)) {
        return { type: 'summon', templateId: 'rat', x: sx, y: sy };
      }
    }
  }

  if (dist === 1) {
    return { type: 'attack', target: player };
  }

  if (dist < template.preferDistMin) {
    // Too close — flee
    return fleeAction(monster, state);
  }

  if (dist > template.preferDistMax) {
    // Too far — approach
    const step = bfsStep(
      monster.x, monster.y, player.x, player.y,
      map.width, map.height,
      (nx, ny) => isPassableForMonster(nx, ny, map, monsters, player, monster)
    );
    if (step) return { type: 'move', x: step.x, y: step.y };
  }

  return { type: 'wait' };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function isPassableForMonster(x, y, map, monsters, player, self) {
  if (!map.isWalkable(x, y)) return false;
  if (x === player.x && y === player.y) return false; // attack, not walk-through
  return !monsters.some(m => m !== self && m.x === x && m.y === y);
}

const ALL_DIRS = [
  [-1,-1],[ 0,-1],[ 1,-1],
  [-1, 0],        [ 1, 0],
  [-1, 1],[ 0, 1],[ 1, 1],
];

function shuffledDirs(rng) {
  // Fisher-Yates on a copy of ALL_DIRS
  const a = ALL_DIRS.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
