import { currentPlayer } from "../state/gameState.js";
import { getPowerup } from "../../data/powerups.js";
import { ACHIEVEMENTS } from "../../data/achievements.js";
import { play } from "../audio/sound.js";

export function createHUD(getState, els, callbacks) {
  function renderPlayers(state) {
    const html = state.players.map((p, i) => {
      const active = i === state.currentPlayerIndex;
      return `
        <div class="player-card ${active ? "active" : ""}">
          <div class="player-token" style="background:${p.color};color:#fff">
            ${p.avatar}
          </div>
          <div class="player-info">
            <div class="player-name">${escapeHtml(p.name)}${p.isAI ? ` <small>(${p.aiDifficulty})</small>` : ""}</div>
            <div class="player-stats">Tile ${p.tile + 1} | Rolls ${p.stats.rolls}${p.effects.shield ? " | \u{1F6E1}" : ""}${p.effects.frozen ? " | ❄" : ""}</div>
          </div>
        </div>`;
    }).join("");
    els.playersPanel.innerHTML = html;
  }

  function renderLog(state) {
    const items = state.log.slice(-15).map((l) => `<li>${escapeHtml(l)}</li>`).join("");
    els.logList.innerHTML = items;
    els.logList.scrollTop = els.logList.scrollHeight;
  }

  function renderDie(state) {
    els.dieFace.textContent = state.dice.value || "-";
    if (state.dice.rolling) els.dieFace.classList.add("rolling");
    else els.dieFace.classList.remove("rolling");
    const p = currentPlayer(state);
    const canRoll = state.turnPhase === "IDLE" && p && !p.isAI && !state.winner;
    els.rollBtn.disabled = !canRoll;
  }

  function renderPowerups(state) {
    const p = currentPlayer(state);
    if (!p) { els.powerupList.innerHTML = ""; return; }
    const isHuman = !p.isAI;
    const html = p.powerups.map((id, idx) => {
      const pu = getPowerup(id);
      const disabled = !isHuman || state.turnPhase !== "IDLE" || state.winner;
      return `<button class="powerup-btn" data-idx="${idx}" ${disabled ? "disabled" : ""} title="${escapeHtml(pu.description)}">
                <div class="icon">${pu.icon}</div>
                <div>${escapeHtml(pu.name)}</div>
              </button>`;
    }).join("");
    els.powerupList.innerHTML = html || `<div style="color:var(--text-dim);font-size:11px;grid-column:span 3">No power-ups</div>`;
    els.powerupList.querySelectorAll(".powerup-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.idx, 10);
        callbacks.onActivatePowerup(idx);
      });
    });
  }

  function renderAchievements(state) {
    els.achievementsList.innerHTML = ACHIEVEMENTS.map((a) => {
      const unlocked = state.achievementsUnlocked.has(a.id);
      return `<div class="achievement ${unlocked ? "unlocked" : ""}" title="${escapeHtml(a.description)}">${escapeHtml(a.name)}</div>`;
    }).join("");
  }

  function renderAll() {
    const state = getState();
    if (!state) return;
    renderPlayers(state);
    renderLog(state);
    renderDie(state);
    renderPowerups(state);
    renderAchievements(state);
  }

  els.rollBtn.addEventListener("click", () => {
    play("click");
    callbacks.onRoll();
  });

  setInterval(renderAll, 100);
  renderAll();

  return { renderAll };
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
