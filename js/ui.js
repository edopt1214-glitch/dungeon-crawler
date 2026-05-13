// UI: stats panel, message log, inventory dialog, game-over dialog
// All DOM manipulation is isolated here.

const MAX_LOG_LINES = 80;
const VISIBLE_LINES = 5;

export class UI {
  constructor() {
    this.statsEl     = document.getElementById('stats');
    this.equipEl     = document.getElementById('equipment');
    this.logEl       = document.getElementById('message-log');
    this.mobileBarEl = document.getElementById('stat-bar-mobile');
    this.invDialog   = document.getElementById('inventory-dialog');
    this.invList     = document.getElementById('inventory-list');
    this.goDialog    = document.getElementById('game-over-dialog');
    this.goTitle     = document.getElementById('game-over-title');
    this.goStats     = document.getElementById('game-over-stats');
    this.hsList      = document.getElementById('highscore-list');
    this.startDialog = document.getElementById('start-dialog');

    this._lines      = []; // { text, cssClass }
    this._pendingMsgs = []; // accumulated during a turn, flushed at end
  }

  // ── Message log ──────────────────────────────────────────────────────────────

  addMessage(text, type = 'info') {
    // type: 'combat' | 'loot' | 'level' | 'death' | 'info'
    this._pendingMsgs.push({ text, type });
  }

  flushMessages() {
    for (const { text, type } of this._pendingMsgs) {
      this._lines.push({ text, cssClass: `msg-${type}` });
    }
    this._pendingMsgs = [];

    if (this._lines.length > MAX_LOG_LINES) {
      this._lines = this._lines.slice(-MAX_LOG_LINES);
    }
    this._renderLog();
  }

  _renderLog() {
    const recent = this._lines.slice(-VISIBLE_LINES);
    this.logEl.innerHTML = recent.map((l, i) => {
      const age = i < recent.length - 1 ? ' msg-old' : '';
      return `<div class="msg-line ${l.cssClass}${age}">${escHtml(l.text)}</div>`;
    }).join('');
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }

  // ── Stats panel (sidebar, desktop) ───────────────────────────────────────────

  updateStats(player) {
    const hpClass = hpColorClass(player.hp, player.maxHp, 'stat');
    this.statsEl.innerHTML = [
      statRow('HP',    `<span class="${hpClass}">${player.hp}/${player.maxHp}</span>`),
      statRow('ATK',   player.getAttack()),
      statRow('DEF',   player.getDefense()),
      statRow('Level', player.level),
      statRow('XP',    `${player.xp}/${player.xpToNext}`),
      statRow('Gold',  player.gold),
      statRow('Depth', player.dungeon_depth ?? 1),
    ].join('');

    const wName = player.weapon ? player.weapon.name : '<span style="color:#444">—</span>';
    const aName = player.armor  ? player.armor.name  : '<span style="color:#444">—</span>';
    this.equipEl.innerHTML = [
      equipRow('Weapon', wName),
      equipRow('Armor',  aName),
    ].join('');

    // Mobile compact bar
    const hpMob = hpColorClass(player.hp, player.maxHp, 'mob');
    this.mobileBarEl.innerHTML =
      `<span class="mob-stat">HP</span><span class="${hpMob}">${player.hp}/${player.maxHp}</span>` +
      `<span class="mob-stat"> LVL</span><span class="mob-val">${player.level}</span>` +
      `<span class="mob-stat"> ATK</span><span class="mob-val">${player.getAttack()}</span>` +
      `<span class="mob-stat"> DEF</span><span class="mob-val">${player.getDefense()}</span>` +
      `<span class="mob-stat"> ¥</span><span class="mob-val">${player.gold}</span>` +
      `<span class="mob-stat"> Fl</span><span class="mob-val">${player.dungeon_depth ?? 1}</span>`;
  }

  // ── Inventory dialog ─────────────────────────────────────────────────────────

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
      el.className  = `inv-item${equipped}`;
      el.tabIndex   = 0;
      el.dataset.idx = idx;
      el.innerHTML   =
        `<span class="inv-key">${letter}</span>` +
        `<span class="inv-glyph" style="color:${item.color}">${item.glyph}</span>` +
        `<span class="inv-name">${escHtml(item.name)}${eqTag}</span>` +
        `<span class="inv-desc">${escHtml(item.description)}</span>`;

      el.addEventListener('click', () => { this.invDialog.close(); onUse(item); });
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { this.invDialog.close(); onUse(item); }
      });

      this.invList.appendChild(el);
    });

    // Keyboard shortcut handler while dialog is open
    this._invKeyHandler = e => {
      if (e.key === 'Escape') { this.invDialog.close(); return; }
      const code  = e.key.charCodeAt(0) - 97;
      if (code >= 0 && code < player.inventory.length) {
        this.invDialog.close();
        onUse(player.inventory[code]);
      }
    };
    this.invDialog.addEventListener('keydown', this._invKeyHandler, { once: true });

    document.getElementById('close-inventory').onclick = () => this.invDialog.close();
    this.invDialog.showModal();
  }

  // ── Start dialog ─────────────────────────────────────────────────────────────

  showStart(onStart) {
    document.getElementById('start-btn').onclick = () => {
      this.startDialog.close();
      onStart();
    };
    this.startDialog.showModal();
  }

  // ── Game over dialog ──────────────────────────────────────────────────────────

  showGameOver(stats, isVictory, onRestart) {
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

    document.getElementById('restart-btn').onclick = () => {
      this.goDialog.close();
      onRestart();
    };
    this.goDialog.showModal();
  }

  _renderHighscores(currentScore, stats, isVictory) {
    const key  = 'dc_highscores';
    const raw  = localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];

    list.push({
      score: currentScore,
      depth: stats.depth,
      kills: stats.kills,
      gold:  stats.gold,
      level: stats.level,
      win:   isVictory,
      date:  new Date().toLocaleDateString(),
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
        return `<div class="hs-entry${isCurrent}">` +
          `<span>${badge} #${i + 1} Floor ${e.depth} · Lv${e.level}</span>` +
          `<span>${e.score} pts</span>` +
          `</div>`;
      }).join('');
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
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
