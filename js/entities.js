import { MONSTER_TEMPLATES, ITEM_TEMPLATES, MAX_INVENTORY, FOV_RADIUS_BASE } from './constants.js';
import { randInt } from './utils.js';

// ── Entity ────────────────────────────────────────────────────────────────────
export class Entity {
  constructor(x, y, glyph, color, name) {
    this.x = x; this.y = y;
    this.glyph = glyph;
    this.color = color;
    this.name  = name;
  }
}

// ── Actor (anything that takes turns) ─────────────────────────────────────────
export class Actor extends Entity {
  constructor(x, y, glyph, color, name, hp, attack, defense, speed) {
    super(x, y, glyph, color, name);
    this.maxHp   = hp;
    this.hp      = hp;
    this.attack  = attack;
    this.defense = defense;
    this.speed   = speed;
    this.energy  = 0; // accumulates; act when >= 100
    this.statuses = []; // [{type, duration}]
  }

  isAlive() { return this.hp > 0; }

  // Returns actual damage taken
  takeDamage(amount) {
    const dmg = Math.max(1, amount);
    this.hp   = Math.max(0, this.hp - dmg);
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
    this.statuses = this.statuses.filter(s => {
      s.duration--;
      return s.duration > 0;
    });
  }

  hasStatus(type) { return this.statuses.some(s => s.type === type); }

  addStatus(type, duration) {
    const existing = this.statuses.find(s => s.type === type);
    if (existing) { existing.duration = Math.max(existing.duration, duration); }
    else          { this.statuses.push({ type, duration }); }
  }
}

// ── Player ────────────────────────────────────────────────────────────────────
export class Player extends Actor {
  constructor(x, y) {
    super(x, y, '@', '#ffffff', 'You', 30, 5, 1, 100);
    this.level      = 1;
    this.xp         = 0;
    this.xpToNext   = 100;
    this.gold       = 0;
    this.inventory  = []; // Item instances
    this.weapon     = null; // equipped Item or null
    this.armor      = null; // equipped Item or null
    this.visionRadius = FOV_RADIUS_BASE;
    this.kills      = 0;
    this.turnCount  = 0;
  }

  getAttack() {
    return this.attack + (this.weapon?.template.stats?.attack ?? 0);
  }

  getDefense() {
    return this.defense + (this.armor?.template.stats?.defense ?? 0);
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
    this.hp     = Math.min(this.hp + 8, this.maxHp);
    this.attack += 2;
    this.xpToNext = 100 * this.level;
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
    this.inventory.splice(idx, 1);
  }

  // Toggle equip; returns a message string
  equipItem(item) {
    const type = item.template.itemType;
    if (type === 'weapon') {
      if (this.weapon === item) {
        this.weapon = null;
        return `You unequip the ${item.name}.`;
      }
      this.weapon = item;
      return `You equip the ${item.name}.`;
    }
    if (type === 'armor') {
      if (this.armor === item) {
        this.armor = null;
        return `You unequip the ${item.name}.`;
      }
      this.armor = item;
      return `You equip the ${item.name}.`;
    }
    return null;
  }

  isEquipped(item) { return this.weapon === item || this.armor === item; }

  inventoryLetter(item) {
    const idx = this.inventory.indexOf(item);
    return idx === -1 ? '?' : String.fromCharCode(97 + idx);
  }
}

// ── Monster ───────────────────────────────────────────────────────────────────
export class Monster extends Actor {
  constructor(x, y, templateId) {
    const t = MONSTER_TEMPLATES[templateId];
    super(x, y, t.glyph, t.color, t.name, t.hp, t.attack, t.defense, t.speed);
    this.template = t;
    this.aiState        = 'idle';
    this.lastKnownPos   = null;
    this.lostSightTurns = 0;
    this.summonTick     = 0; // for Necromancer
  }

  // Roll loot and return array of {templateId, x, y}
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

// ── Item ──────────────────────────────────────────────────────────────────────
export class Item extends Entity {
  constructor(x, y, templateId, quantity = 1) {
    const t = ITEM_TEMPLATES[templateId];
    super(x, y, t.glyph, t.color, t.name);
    this.template = t;
    this.quantity = quantity;
  }

  get description() { return this.template.description ?? ''; }
}

// ── Factory helpers ───────────────────────────────────────────────────────────
export function createMonster(templateId, x, y) {
  return new Monster(x, y, templateId);
}

export function createItem(templateId, x, y, quantity = 1) {
  return new Item(x, y, templateId, quantity);
}
