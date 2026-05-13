// Keyboard and touch input → unified action objects
// All action objects share a `type` field; payloads vary by type.

const KEY_MAP = {
  // Movement (8 directions)
  ArrowUp:    { type: 'move', dx:  0, dy: -1 },
  ArrowDown:  { type: 'move', dx:  0, dy:  1 },
  ArrowLeft:  { type: 'move', dx: -1, dy:  0 },
  ArrowRight: { type: 'move', dx:  1, dy:  0 },
  w: { type: 'move', dx:  0, dy: -1 },
  s: { type: 'move', dx:  0, dy:  1 },
  a: { type: 'move', dx: -1, dy:  0 },
  d: { type: 'move', dx:  1, dy:  0 },
  k: { type: 'move', dx:  0, dy: -1 }, // vim
  j: { type: 'move', dx:  0, dy:  1 },
  h: { type: 'move', dx: -1, dy:  0 },
  l: { type: 'move', dx:  1, dy:  0 },
  y: { type: 'move', dx: -1, dy: -1 }, // vim diagonals
  u: { type: 'move', dx:  1, dy: -1 },
  b: { type: 'move', dx: -1, dy:  1 },
  n: { type: 'move', dx:  1, dy:  1 },
  // Numpad
  Numpad8: { type: 'move', dx:  0, dy: -1 },
  Numpad2: { type: 'move', dx:  0, dy:  1 },
  Numpad4: { type: 'move', dx: -1, dy:  0 },
  Numpad6: { type: 'move', dx:  1, dy:  0 },
  Numpad7: { type: 'move', dx: -1, dy: -1 },
  Numpad9: { type: 'move', dx:  1, dy: -1 },
  Numpad1: { type: 'move', dx: -1, dy:  1 },
  Numpad3: { type: 'move', dx:  1, dy:  1 },
  Numpad5: { type: 'wait' },
  // Actions
  ' ':         { type: 'wait' },
  '.':         { type: 'wait' },
  g:           { type: 'pickUp' },
  G:           { type: 'pickUp' },
  i:           { type: 'openInventory' },
  I:           { type: 'openInventory' },
  '>':         { type: 'descend' },
};

export class InputHandler {
  constructor(canvas, actionCallback) {
    this.canvas   = canvas;
    this.dispatch = actionCallback;
    this.enabled  = true;

    this._onKey    = this._onKey.bind(this);
    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchEnd   = this._onTouchEnd.bind(this);

    this._touchStart = null;

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

    // Mouse fallback for testing on desktop
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
      const id = btn.id;
      if (id === 'btn-pickup')   this.dispatch({ type: 'pickUp' });
      if (id === 'btn-inventory') this.dispatch({ type: 'openInventory' });
      if (id === 'btn-descend')  this.dispatch({ type: 'descend' });
    });
  }

  _dpadAction(btn) {
    if (btn.dataset.action === 'wait') return { type: 'wait' };
    const dx = parseInt(btn.dataset.dx ?? '0', 10);
    const dy = parseInt(btn.dataset.dy ?? '0', 10);
    return { type: 'move', dx, dy };
  }

  _onKey(e) {
    if (!this.enabled) return;
    // Inventory item use: press a letter while inventory is open is handled by ui.js
    const action = KEY_MAP[e.key] ?? KEY_MAP[e.code];
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
    if (elapsed > 500 || dist < 20) return; // too slow or too short

    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    const action = angleToAction(angle);
    if (action) this.dispatch(action);
  }

  destroy() {
    document.removeEventListener('keydown', this._onKey);
    this.canvas.removeEventListener('touchstart', this._onTouchStart);
    this.canvas.removeEventListener('touchend',   this._onTouchEnd);
  }
}

// Convert swipe angle (degrees, -180..180) to a move action using 8-way snap
function angleToAction(angle) {
  // Normalise to 0..360
  const a = ((angle + 360) % 360);
  // 8 sectors of 45°, centred on the 8 compass directions
  const sector = Math.round(a / 45) % 8;
  const MAP = [
    { dx:  1, dy:  0 }, // 0°  E
    { dx:  1, dy:  1 }, // 45° SE
    { dx:  0, dy:  1 }, // 90° S
    { dx: -1, dy:  1 }, // 135° SW
    { dx: -1, dy:  0 }, // 180° W
    { dx: -1, dy: -1 }, // 225° NW
    { dx:  0, dy: -1 }, // 270° N
    { dx:  1, dy: -1 }, // 315° NE
  ];
  return { type: 'move', ...MAP[sector] };
}
