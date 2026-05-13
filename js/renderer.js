import { TILE, VIS, COLORS } from './constants.js';
import { clamp, dimColor } from './utils.js';

// Glyph and color for each tile type
const TILE_GLYPH = {
  [TILE.WALL]:        { glyph: '#', fg: COLORS.WALL_FG,        bg: COLORS.WALL_BG },
  [TILE.FLOOR]:       { glyph: '.', fg: COLORS.FLOOR_FG,       bg: COLORS.FLOOR_BG },
  [TILE.STAIRS_DOWN]: { glyph: '>', fg: COLORS.STAIRS_DOWN_FG, bg: COLORS.FLOOR_BG },
  [TILE.STAIRS_UP]:   { glyph: '<', fg: COLORS.STAIRS_UP_FG,   bg: COLORS.FLOOR_BG },
};

const DIM = 0.28; // brightness factor for remembered tiles

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.tileSize    = 16;
    this.viewW = 0; // viewport width in tiles
    this.viewH = 0; // viewport height in tiles
    this.camX  = 0; // camera top-left in map tiles
    this.camY  = 0;
  }

  // Compute tile size and canvas dimensions to fill the wrapper without overflow.
  computeLayout(mapW, mapH) {
    const wrapper = this.canvas.parentElement;
    const contW   = wrapper.clientWidth;
    const contH   = wrapper.clientHeight;

    // Target: show up to mapW × mapH tiles, but size tiles to fill container
    const tsByW = Math.floor(contW / mapW);
    const tsByH = Math.floor(contH / mapH);
    this.tileSize = Math.max(8, Math.min(tsByW, tsByH));

    // Viewport: how many whole tiles fit in the container
    this.viewW = Math.floor(contW / this.tileSize);
    this.viewH = Math.floor(contH / this.tileSize);

    // Canvas pixel size = exact multiple of tileSize — no sub-pixel gap or overflow
    this.canvas.width  = this.viewW * this.tileSize;
    this.canvas.height = this.viewH * this.tileSize;

    this.ctx.font         = `${this.tileSize}px monospace`;
    this.ctx.textBaseline = 'top';
  }

  // Center the camera on (px, py), clamped to map edges
  centerCamera(px, py, mapW, mapH) {
    this.camX = clamp(px - Math.floor(this.viewW / 2), 0, Math.max(0, mapW - this.viewW));
    this.camY = clamp(py - Math.floor(this.viewH / 2), 0, Math.max(0, mapH - this.viewH));
  }

  // Full scene render
  render(state) {
    const { map, player, monsters, items } = state;
    const ctx  = this.ctx;
    const ts   = this.tileSize;

    this.centerCamera(player.x, player.y, map.width, map.height);

    // Clear to black
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render tiles
    for (let ty = this.camY; ty < this.camY + this.viewH; ty++) {
      for (let tx = this.camX; tx < this.camX + this.viewW; tx++) {
        const vis = map.getVis(tx, ty);
        if (vis === VIS.UNSEEN) continue;

        const tile  = TILE_GLYPH[map.getTile(tx, ty)] ?? TILE_GLYPH[TILE.FLOOR];
        const px    = (tx - this.camX) * ts;
        const py    = (ty - this.camY) * ts;

        if (vis === VIS.VISIBLE) {
          ctx.fillStyle = tile.bg;
          ctx.fillRect(px, py, ts, ts);
          ctx.fillStyle = tile.fg;
          ctx.fillText(tile.glyph, px, py);
        } else {
          // REMEMBERED — dim, no entities
          ctx.fillStyle = dimColor(tile.bg, DIM * 1.5);
          ctx.fillRect(px, py, ts, ts);
          ctx.fillStyle = dimColor(tile.fg, DIM);
          ctx.fillText(tile.glyph, px, py);
        }
      }
    }

    // Render items (only on VISIBLE tiles)
    for (const item of items) {
      if (map.getVis(item.x, item.y) !== VIS.VISIBLE) continue;
      this.drawGlyph(item.x, item.y, item.glyph, item.color, COLORS.FLOOR_BG);
    }

    // Render monsters (only on VISIBLE tiles)
    for (const monster of monsters) {
      if (!monster.isAlive()) continue;
      if (map.getVis(monster.x, monster.y) !== VIS.VISIBLE) continue;
      this.drawGlyph(monster.x, monster.y, monster.glyph, monster.color, COLORS.FLOOR_BG);
    }

    // Render player (always visible)
    this.drawGlyph(player.x, player.y, player.glyph, player.color, COLORS.FLOOR_BG);
  }

  drawGlyph(tx, ty, glyph, fg, bg) {
    if (tx < this.camX || tx >= this.camX + this.viewW) return;
    if (ty < this.camY || ty >= this.camY + this.viewH) return;
    const px = (tx - this.camX) * this.tileSize;
    const py = (ty - this.camY) * this.tileSize;
    this.ctx.fillStyle = bg;
    this.ctx.fillRect(px, py, this.tileSize, this.tileSize);
    this.ctx.fillStyle = fg;
    this.ctx.fillText(glyph, px, py);
  }
}
