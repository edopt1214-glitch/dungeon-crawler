import { MAX_DEPTH, VIS } from './constants.js';
import { createRNG, randInt } from './utils.js';
import { generateDungeon } from './dungeon.js';
import { computeFOV }      from './fov.js';
import { Player, createMonster, createItem } from './entities.js';
import { resolveMelee, applyMelee } from './combat.js';
import { applyItem } from './items.js';
import { decideTurn } from './ai.js';
import { Renderer }   from './renderer.js';
import { InputHandler } from './input.js';
import { UI }          from './ui.js';

class Game {
  constructor() {
    const canvas  = document.getElementById('game-canvas');
    this.renderer = new Renderer(canvas);
    this.input    = new InputHandler(canvas, action => this.processTurn(action));
    this.ui       = new UI();

    this.input.bindDpad(document.getElementById('dpad'));
    this.input.bindMobileActions(document.getElementById('mobile-actions'));

    // ResizeObserver: recompute layout and re-render on any size change
    this._resizeObserver = new ResizeObserver(() => this._onResize());
    this._resizeObserver.observe(canvas.parentElement);

    this.state = null;

    this.ui.showStart(() => this.newGame());
  }

  // ── Game initialisation ───────────────────────────────────────────────────

  newGame() {
    const seed = Date.now();
    this._seed = seed;

    const player    = new Player(0, 0);
    player.dungeon_depth = 1;

    this.state = {
      map:      null,
      player,
      monsters: [],
      items:    [],
      messages: [],
      depth:    1,
      turn:     0,
      rng:      createRNG(seed),
    };

    this._loadFloor(1);
    this.input.setEnabled(true);
    this.ui.addMessage('You descend into the dungeon. Good luck!', 'info');
    this.ui.flushMessages();
  }

  _loadFloor(depth) {
    const { state } = this;
    const { rng, player } = state;

    const map = generateDungeon(depth, rng);
    state.map      = map;
    state.depth    = depth;
    state.monsters = [];
    state.items    = [];

    player.dungeon_depth = depth;
    player.x = map.startPos.x;
    player.y = map.startPos.y;
    player.energy = 0;

    // Vision narrows slightly each level: 8 → 7 → 6
    player.visionRadius = 8 - (depth - 1);

    // Instantiate monsters from spawn descriptors
    for (const spawn of map.spawnMonsters) {
      state.monsters.push(createMonster(spawn.templateId, spawn.x, spawn.y));
    }

    // Instantiate items from spawn descriptors
    for (const spawn of map.spawnItems) {
      state.items.push(createItem(spawn.templateId, spawn.x, spawn.y));
    }

    computeFOV(map, player.x, player.y, player.visionRadius);
    this._render();
  }

  // ── Resize handling ───────────────────────────────────────────────────────

  _onResize() {
    if (!this.state?.map) return;
    this.renderer.computeLayout(this.state.map.width, this.state.map.height);
    this._render();
  }

  // ── Turn processing ───────────────────────────────────────────────────────

  processTurn(action) {
    if (!this.state) return;
    const { state } = this;

    // Special non-turn actions
    if (action.type === 'openInventory') {
      this.ui.showInventory(state.player, item => {
        this.processTurn({ type: 'useItem', item });
      });
      return;
    }

    // Resolve player action; if invalid (e.g. wall bump) return early without
    // consuming a turn
    const playerActed = this._resolvePlayerAction(action);
    if (!playerActed) return;

    state.turn++;
    state.player.turnCount++;

    // Win check: stepped onto stairs-down at max depth
    if (this._checkWin()) return;

    // Enemy turns
    this._runMonsterTurns();

    // Cleanup
    this._removeDeadMonsters();

    // Status effects tick
    state.player.tickStatuses();
    state.monsters.forEach(m => m.tickStatuses());

    // Check player death (from poison etc.)
    if (!state.player.isAlive()) { this._triggerGameOver(); return; }

    // Recompute FOV and render
    computeFOV(state.map, state.player.x, state.player.y, state.player.visionRadius);
    this._render();

    // Update UI
    this.ui.updateStats(state.player);
    this.ui.flushMessages();
  }

  // ── Player action resolution ──────────────────────────────────────────────

  _resolvePlayerAction(action) {
    const { state } = this;
    const { player, map, monsters, items } = state;

    switch (action.type) {
      case 'move': {
        const nx = player.x + action.dx;
        const ny = player.y + action.dy;

        // Bump into monster → attack
        const target = monsters.find(m => m.x === nx && m.y === ny && m.isAlive());
        if (target) {
          const result = resolveMelee(player, target, state.rng);
          const msg    = applyMelee(result);
          this.ui.addMessage(msg, 'combat');

          if (!target.isAlive()) {
            const xpMsgs = player.gainXP(target.xpValue);
            player.kills++;
            xpMsgs.forEach(m => this.ui.addMessage(m, 'level'));
          }
          return true;
        }

        // Wall — do nothing, no turn consumed
        if (!map.isWalkable(nx, ny)) return false;

        // Occupied by another monster — blocked, no turn consumed
        if (monsters.some(m => m.x === nx && m.y === ny)) return false;

        player.x = nx;
        player.y = ny;

        // Auto-notify about items on tile
        const itemsHere = items.filter(i => i.x === nx && i.y === ny);
        if (itemsHere.length > 0) {
          const names = itemsHere.map(i => i.name).join(', ');
          this.ui.addMessage(`You see ${names} here.`, 'loot');
        }
        return true;
      }

      case 'wait':
        return true;

      case 'pickUp': {
        const pile = items.filter(i => i.x === player.x && i.y === player.y);
        if (pile.length === 0) {
          this.ui.addMessage('Nothing to pick up here.', 'info');
          return false;
        }
        const item = pile[0]; // pick up top item
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

        // Clean up scroll kills
        if (result.targets) {
          result.targets.forEach(m => {
            if (!m.isAlive()) {
              const xpMsgs = player.gainXP(m.xpValue);
              player.kills++;
              xpMsgs.forEach(msg => this.ui.addMessage(msg, 'level'));
            }
          });
        }
        return true;
      }

      case 'descend': {
        const { x, y } = map.stairsPos;
        if (player.x !== x || player.y !== y) {
          this.ui.addMessage('You are not standing on the stairs.', 'info');
          return false;
        }
        if (state.depth >= MAX_DEPTH) {
          this._triggerVictory();
          return false;
        }
        const newDepth = state.depth + 1;
        this.ui.addMessage(`You descend to floor ${newDepth}.`, 'info');
        this.ui.flushMessages();
        this._loadFloor(newDepth);
        this.ui.updateStats(state.player);
        this.ui.flushMessages();
        return false; // floor load handles its own render
      }

      default:
        return false;
    }
  }

  // ── Monster turns ─────────────────────────────────────────────────────────

  _runMonsterTurns() {
    const { state } = this;

    for (const monster of state.monsters) {
      if (!monster.isAlive()) continue;

      monster.gainEnergy();

      while (monster.energy >= 100 && monster.isAlive()) {
        const action = decideTurn(monster, state);
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
        if (x === player.x && y === player.y) return; // should have been an attack
        monster.x = x;
        monster.y = y;
        break;
      }
      case 'attack': {
        const result = resolveMelee(monster, player, state.rng);
        const msg    = applyMelee(result);
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
      case 'wait':
        break;
    }
  }

  // ── Win / Lose ────────────────────────────────────────────────────────────

  _checkWin() {
    const { state } = this;
    const { player, map } = state;
    const { x, y } = map.stairsPos;
    if (player.x === x && player.y === y && state.depth >= MAX_DEPTH) {
      this._triggerVictory();
      return true;
    }
    return false;
  }

  _triggerVictory() {
    this.input.setEnabled(false);
    computeFOV(this.state.map, this.state.player.x, this.state.player.y, this.state.player.visionRadius);
    this._render();
    this.ui.updateStats(this.state.player);
    this.ui.flushMessages();
    this.ui.showGameOver(this._statsSnapshot(), true, () => this.newGame());
  }

  _triggerGameOver() {
    this.input.setEnabled(false);
    this._render();
    this.ui.updateStats(this.state.player);
    this.ui.flushMessages();
    this.ui.showGameOver(this._statsSnapshot(), false, () => this.newGame());
  }

  _statsSnapshot() {
    const { player, depth, turn } = this.state;
    return {
      depth:  depth,
      kills:  player.kills,
      gold:   player.gold,
      level:  player.level,
      turns:  turn,
    };
  }

  // ── Dead monster cleanup ──────────────────────────────────────────────────

  _removeDeadMonsters() {
    const { state } = this;
    const dead = state.monsters.filter(m => !m.isAlive());

    for (const m of dead) {
      const drops = m.rollLoot(state.rng);
      for (const drop of drops) {
        state.items.push(createItem(drop.templateId, drop.x, drop.y, drop.amount ?? 1));
      }
    }

    state.monsters = state.monsters.filter(m => m.isAlive());
  }

  // ── Render ────────────────────────────────────────────────────────────────

  _render() {
    if (!this.state?.map) return;
    // Ensure layout is computed (handles first call before ResizeObserver fires)
    if (this.renderer.viewW === 0) {
      this.renderer.computeLayout(this.state.map.width, this.state.map.height);
    }
    this.renderer.render(this.state);
  }
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // Prevent context menu on long-press (mobile)
  document.addEventListener('contextmenu', e => e.preventDefault());
  new Game();
});
