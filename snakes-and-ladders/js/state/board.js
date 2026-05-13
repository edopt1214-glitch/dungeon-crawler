import { CANVAS_SIZE } from "../config.js";

export function createBoard(size) {
  const totalTiles = size * size;
  const tileSize = CANVAS_SIZE / size;
  const tiles = [];

  for (let i = 0; i < totalTiles; i++) {
    const { row, col } = indexToRowCol(i, size);
    const { x, y } = rowColToPixel(row, col, tileSize, size);
    tiles.push({
      index: i,
      row,
      col,
      x,
      y,
      type: "normal",
    });
  }

  return {
    size,
    totalTiles,
    tileSize,
    tiles,
    snakes: [],
    ladders: [],
    powerupTiles: new Map(),
  };
}

export function indexToRowCol(i, size) {
  const row = Math.floor(i / size);
  const localCol = i % size;
  const col = row % 2 === 0 ? localCol : size - 1 - localCol;
  return { row, col };
}

export function rowColToPixel(row, col, tileSize, size) {
  const x = col * tileSize + tileSize / 2;
  const y = (size - 1 - row) * tileSize + tileSize / 2;
  return { x, y };
}

export function getTileCenter(board, index) {
  const tile = board.tiles[index];
  return { x: tile.x, y: tile.y };
}
