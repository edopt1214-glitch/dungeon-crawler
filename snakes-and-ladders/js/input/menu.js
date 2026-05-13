import { PLAYER_COLORS, PLAYER_AVATARS, AI_DIFFICULTIES, MIN_PLAYERS, MAX_PLAYERS } from "../config.js";
import { loadProfiles, saveProfiles } from "../persistence/storage.js";

const SHAPES = ["circle", "square", "triangle", "star"];

export function showMenu(overlayEl, defaults, onStart) {
  const slotConfig = overlayEl.querySelector("#slotConfig");
  const sizeSel = overlayEl.querySelector("#menuSize");
  const themeSel = overlayEl.querySelector("#menuTheme");
  const startBtn = overlayEl.querySelector("#startGameBtn");

  sizeSel.value = String(defaults.boardSize || 10);
  themeSel.value = defaults.theme || "classic";

  const profiles = loadProfiles();
  const slots = [];
  for (let i = 0; i < MAX_PLAYERS; i++) {
    const profile = profiles[i] || {};
    slots.push({
      enabled: i < (defaults.playerCount || 2),
      name: profile.name || `Player ${i + 1}`,
      isAI: defaults.aiSlots ? defaults.aiSlots[i] : false,
      aiDifficulty: "medium",
      color: profile.color || PLAYER_COLORS[i],
      shape: profile.shape || SHAPES[i % SHAPES.length],
      avatar: profile.avatar || PLAYER_AVATARS[i],
    });
  }

  function render() {
    slotConfig.innerHTML = slots.map((s, i) => `
      <div class="slot-row" data-i="${i}">
        <label><input type="checkbox" data-field="enabled" ${s.enabled ? "checked" : ""}/> P${i + 1}</label>
        <input type="text" data-field="name" value="${escapeAttr(s.name)}" placeholder="Name" ${s.enabled ? "" : "disabled"}/>
        <select data-field="kind" ${s.enabled ? "" : "disabled"}>
          <option value="human" ${!s.isAI ? "selected" : ""}>Human</option>
          ${AI_DIFFICULTIES.map((d) => `<option value="ai:${d}" ${s.isAI && s.aiDifficulty === d ? "selected" : ""}>AI - ${d}</option>`).join("")}
        </select>
        <div class="color-swatch" data-field="color" title="Color: ${s.color}" style="background:${s.color}"></div>
        <select data-field="shape" ${s.enabled ? "" : "disabled"}>
          ${SHAPES.map((sh) => `<option value="${sh}" ${s.shape === sh ? "selected" : ""}>${sh}</option>`).join("")}
        </select>
      </div>
    `).join("");

    slotConfig.querySelectorAll(".slot-row").forEach((row) => {
      const i = parseInt(row.dataset.i, 10);
      row.querySelector('[data-field="enabled"]').addEventListener("change", (e) => {
        slots[i].enabled = e.target.checked;
        const enabledCount = slots.filter((s) => s.enabled).length;
        if (enabledCount < MIN_PLAYERS) {
          slots[i].enabled = true;
          e.target.checked = true;
          return;
        }
        render();
      });
      row.querySelector('[data-field="name"]').addEventListener("input", (e) => { slots[i].name = e.target.value; });
      row.querySelector('[data-field="kind"]').addEventListener("change", (e) => {
        const v = e.target.value;
        if (v === "human") { slots[i].isAI = false; slots[i].aiDifficulty = null; }
        else { slots[i].isAI = true; slots[i].aiDifficulty = v.split(":")[1]; }
      });
      row.querySelector('[data-field="color"]').addEventListener("click", () => {
        const idx = PLAYER_COLORS.indexOf(slots[i].color);
        slots[i].color = PLAYER_COLORS[(idx + 1) % PLAYER_COLORS.length];
        render();
      });
      row.querySelector('[data-field="shape"]').addEventListener("change", (e) => { slots[i].shape = e.target.value; });
    });
  }

  function onStartClick() {
    const active = slots.filter((s) => s.enabled);
    if (active.length < MIN_PLAYERS) return;

    saveProfiles(active.map((s) => ({ name: s.name, color: s.color, shape: s.shape, avatar: s.avatar })));

    onStart({
      boardSize: parseInt(sizeSel.value, 10),
      theme: themeSel.value,
      playerConfigs: active.map((s) => ({
        name: s.name,
        isAI: s.isAI,
        aiDifficulty: s.aiDifficulty,
        color: s.color,
        shape: s.shape,
        avatar: s.avatar,
      })),
    });
  }

  startBtn.onclick = onStartClick;
  render();
  overlayEl.classList.remove("hidden");
}

export function hideMenu(overlayEl) {
  overlayEl.classList.add("hidden");
}

function escapeAttr(s) {
  return String(s).replace(/"/g, "&quot;");
}
