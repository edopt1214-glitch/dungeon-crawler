import { drawBoard } from "./boardLayer.js";
import { drawOverlay } from "./overlayLayer.js";
import { drawPieces, drawToast } from "./pieceLayer.js";
import { updateTweens } from "./tween.js";
import { getTheme } from "../../data/themes.js";
import { CANVAS_SIZE } from "../config.js";

export function createRenderer(getState, els) {
  const boardCtx = els.boardCanvas.getContext("2d");
  const overlayCtx = els.overlayCanvas.getContext("2d");
  const piecesCtx = els.piecesCanvas.getContext("2d");

  for (const c of [els.boardCanvas, els.overlayCanvas, els.piecesCanvas]) {
    c.width = CANVAS_SIZE;
    c.height = CANVAS_SIZE;
  }

  let dirtyBoard = true;
  let dirtyOverlay = true;
  let lastTs = performance.now();

  function markBoardDirty() { dirtyBoard = true; }
  function markOverlayDirty() { dirtyOverlay = true; }

  function frame(ts) {
    const dt = Math.min(64, ts - lastTs);
    lastTs = ts;
    const state = getState();
    if (!state) {
      requestAnimationFrame(frame);
      return;
    }

    updateTweens(state.tweens, dt);

    if (state.toast && state.toast.ttl > 0) {
      state.toast.ttl -= dt;
      if (state.toast.ttl <= 0) state.toast = null;
    }

    if (state.eventFlag && state.eventFlag.type === "earthquake") {
      dirtyOverlay = true;
      state.eventFlag = null;
    }

    const theme = getTheme(state.theme);

    if (dirtyBoard) {
      drawBoard(boardCtx, state.board, theme);
      dirtyBoard = false;
      dirtyOverlay = true;
    }
    if (dirtyOverlay) {
      drawOverlay(overlayCtx, state.board, theme);
      dirtyOverlay = false;
    }

    drawPieces(piecesCtx, state, theme);
    drawToast(els.toast, state);

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);

  return { markBoardDirty, markOverlayDirty };
}
