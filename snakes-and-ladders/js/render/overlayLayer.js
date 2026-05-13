import { getTileCenter } from "../state/board.js";
import { getPowerup } from "../../data/powerups.js";

export function drawOverlay(ctx, board, theme) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  ctx.clearRect(0, 0, W, H);

  drawLadders(ctx, board, theme);
  drawSnakes(ctx, board, theme);
  drawPowerupTiles(ctx, board, theme);
}

function drawLadders(ctx, board, theme) {
  const p = theme.palette;
  const railWidth = Math.max(3, board.tileSize * 0.08);

  for (const ladder of board.ladders) {
    const b = getTileCenter(board, ladder.bottomTile);
    const t = getTileCenter(board, ladder.topTile);
    const dx = t.x - b.x;
    const dy = t.y - b.y;
    const len = Math.hypot(dx, dy);
    const nx = -dy / len;
    const ny = dx / len;
    const offset = board.tileSize * 0.18;

    const r1a = { x: b.x + nx * offset, y: b.y + ny * offset };
    const r1b = { x: t.x + nx * offset, y: t.y + ny * offset };
    const r2a = { x: b.x - nx * offset, y: b.y - ny * offset };
    const r2b = { x: t.x - nx * offset, y: t.y - ny * offset };

    ctx.strokeStyle = p.ladderRail;
    ctx.lineWidth = railWidth;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(r1a.x, r1a.y);
    ctx.lineTo(r1b.x, r1b.y);
    ctx.moveTo(r2a.x, r2a.y);
    ctx.lineTo(r2b.x, r2b.y);
    ctx.stroke();

    const rungs = Math.max(3, Math.floor(len / (board.tileSize * 0.4)));
    ctx.strokeStyle = p.ladder;
    ctx.lineWidth = railWidth * 0.6;
    for (let i = 1; i < rungs; i++) {
      const f = i / rungs;
      ctx.beginPath();
      ctx.moveTo(r1a.x + (r1b.x - r1a.x) * f, r1a.y + (r1b.y - r1a.y) * f);
      ctx.lineTo(r2a.x + (r2b.x - r2a.x) * f, r2a.y + (r2b.y - r2a.y) * f);
      ctx.stroke();
    }
  }
}

function drawSnakes(ctx, board, theme) {
  const p = theme.palette;
  const bodyWidth = Math.max(6, board.tileSize * 0.22);

  for (const snake of board.snakes) {
    const head = getTileCenter(board, snake.headTile);
    const tail = getTileCenter(board, snake.tailTile);
    const cp = snake.controlPoints;

    ctx.strokeStyle = p.snake;
    ctx.lineWidth = bodyWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(head.x, head.y);
    ctx.bezierCurveTo(cp[0].x, cp[0].y, cp[1].x, cp[1].y, tail.x, tail.y);
    ctx.stroke();

    ctx.strokeStyle = p.snakeAccent;
    ctx.lineWidth = bodyWidth * 0.35;
    ctx.beginPath();
    ctx.moveTo(head.x, head.y);
    ctx.bezierCurveTo(cp[0].x, cp[0].y, cp[1].x, cp[1].y, tail.x, tail.y);
    ctx.stroke();

    const headR = bodyWidth * 0.9;
    ctx.fillStyle = p.snake;
    ctx.beginPath();
    ctx.arc(head.x, head.y, headR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#fff";
    const eyeR = headR * 0.28;
    const ang = Math.atan2(cp[0].y - head.y, cp[0].x - head.x);
    const ex = Math.cos(ang + Math.PI / 2) * headR * 0.4;
    const ey = Math.sin(ang + Math.PI / 2) * headR * 0.4;
    ctx.beginPath();
    ctx.arc(head.x + ex, head.y + ey, eyeR, 0, Math.PI * 2);
    ctx.arc(head.x - ex, head.y - ey, eyeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(head.x + ex, head.y + ey, eyeR * 0.5, 0, Math.PI * 2);
    ctx.arc(head.x - ex, head.y - ey, eyeR * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPowerupTiles(ctx, board, theme) {
  const p = theme.palette;
  for (const [idx, pid] of board.powerupTiles.entries()) {
    const c = getTileCenter(board, idx);
    const r = board.tileSize * 0.28;

    ctx.shadowColor = p.powerupGlow;
    ctx.shadowBlur = 16;
    ctx.fillStyle = p.powerup;
    ctx.beginPath();
    ctx.arc(c.x, c.y + board.tileSize * 0.22, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const pu = getPowerup(pid);
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${Math.floor(r * 1.2)}px serif`;
    ctx.fillText(pu ? pu.icon : "?", c.x, c.y + board.tileSize * 0.22);
  }
}
