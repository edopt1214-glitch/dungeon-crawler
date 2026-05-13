export function drawBoard(ctx, board, theme) {
  const { tileSize, size } = board;
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const p = theme.palette;

  ctx.clearRect(0, 0, W, H);

  for (const tile of board.tiles) {
    const x = tile.col * tileSize;
    const y = (size - 1 - tile.row) * tileSize;

    const isEven = (tile.row + tile.col) % 2 === 0;
    ctx.fillStyle = isEven ? p.bgA : p.bgB;
    ctx.fillRect(x, y, tileSize, tileSize);

    ctx.strokeStyle = p.grid;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, tileSize, tileSize);

    ctx.fillStyle = p.text;
    ctx.font = theme.font || `${Math.floor(tileSize * 0.18)}px sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(String(tile.index + 1), x + 4, y + 4);
  }

  ctx.strokeStyle = p.grid;
  ctx.lineWidth = 3;
  ctx.strokeRect(1.5, 1.5, W - 3, H - 3);
}
