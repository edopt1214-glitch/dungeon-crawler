import { randInt } from './utils.js';

// Pure combat functions — read actors, return result objects.
// Mutations (HP reduction, etc.) are applied by the caller.

// Resolve a melee attack: attacker hits defender.
// rng is optional; if omitted uses a fixed roll of 0.
export function resolveMelee(attacker, defender, rng) {
  const variance = rng ? randInt(rng, -2, 2) : 0;
  const raw      = attacker.getAttack() + variance - defender.getDefense();
  const damage   = Math.max(1, raw);

  return { attacker, defender, damage };
}

// Apply the result of resolveMelee — deducts HP, returns message string
export function applyMelee(result) {
  const { attacker, defender, damage } = result;
  defender.takeDamage(damage);

  const attackerName = attacker.name;
  const defenderName = defender.name;

  if (!defender.isAlive()) {
    return `${attackerName} kills the ${defenderName}!`;
  }
  return `${attackerName} hits ${defenderName} for ${damage} damage.`;
}
