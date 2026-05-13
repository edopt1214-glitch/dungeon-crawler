export function drawPieces(ctx, state, theme) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  ctx.clearRect(0, 0, W, H);

  const board = state.board;
  const tileSize = board.tileSize;
  const r = tileSize * 0.22;

  const tileGroups = new Map();
  for (const p of state.players) {
    const k = p.tile;
    if (!tileGroups.has(k)) tileGroups.set(k, []);
    tileGroups.get(k).push(p);
  }

  for (const p of state.players) {
    const group = tileGroups.get(p.tile) || [p];
    const groupIdx = group.indexOf(p);
    const offset = computeFanOffset(groupIdx, group.length, r);

    const x = p.renderPos.x + offset.x;
    const y = p.renderPos.y + offset.y;

    ctx.fillStyle = p.color;
    ctx.strokeStyle = theme.palette.tokenOutline;
    ctx.lineWidth = 2;

    drawShape(ctx, p.shape, x, y, r);

    if (p.effects.shield) {
      ctx.strokeStyle = "#66e0ff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, r + 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (p.effects.frozen > 0) {
      ctx.fillStyle = "rgba(150, 220, 255, 0.5)";
      ctx.beginPath();
      ctx.arc(x, y, r + 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.font = `${Math.floor(r * 1.0)}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(p.avatar, x, y + 1);
  }
}

function computeFanOffset(idx, total, r) {
  if (total <= 1) return { x: 0, y: 0 };
  const angle = (Math.PI * 2 * idx) / total;
  const dist = r * 0.7;
  return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
}

function drawShape(ctx, shape, x, y, r) {
  ctx.beginPath();
  switch (shape) {
    case "square":
      ctx.rect(x - r, y - r, r * 2, r * 2);
      break;
    case "triangle":
      ctx.moveTo(x, y - r);
      ctx.lineTo(x + r, y + r * 0.8);
      ctx.lineTo(x - r, y + r * 0.8);
      ctx.closePath();
      break;
    case "star": {
      const spikes = 5;
      const outer = r;
      const inner = r * 0.45;
      let rot = -Math.PI / 2;
      const step = Math.PI / spikes;
      ctx.moveTo(x + Math.cos(rot) * outer, y + Math.sin(rot) * outer);
      for (let i = 0; i < spikes; i++) {
        rot += step;
        ctx.lineTo(x + Math.cos(rot) * inner, y + Math.sin(rot) * inner);
        rot += step;
        ctx.lineTo(x + Math.cos(rot) * outer, y + Math.sin(rot) * outer);
      }
      ctx.closePath();
      break;
    }
    default:
      ctx.arc(x, y, r, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.stroke();
}

export function drawToast(toastEl, state) {
  if (state.toast && state.toast.ttl > 0) {
    toastEl.textContent = state.toast.text;
    toastEl.classList.add("show");
  } else {
    toastEl.classList.remove("show");
  }
}
