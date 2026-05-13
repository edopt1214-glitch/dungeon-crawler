// Item effect functions.
// Each returns { message, type } where type is one of:
//   'heal' | 'equip' | 'scroll' | 'gold'
// The game controller applies side-effects; effects only compute results.

export function applyItem(item, player, gameState) {
  const t = item.template;

  switch (t.itemType) {
    case 'consumable': return applyConsumable(item, player);
    case 'weapon':
    case 'armor':      return applyEquipment(item, player);
    case 'scroll':     return applyScroll(item, player, gameState);
    default:           return { message: `You can't use the ${item.name}.`, type: 'none' };
  }
}

function applyConsumable(item, player) {
  const heal = item.template.stats?.healAmount ?? 0;
  const actual = player.heal(heal);
  player.removeItem(item);
  return {
    message: `You drink the ${item.name} and recover ${actual} HP.`,
    type: 'heal',
  };
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
