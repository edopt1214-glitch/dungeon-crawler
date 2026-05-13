import { getPowerup } from "../../data/powerups.js";

export function showPicker(overlayEl, opts) {
  const titleEl = overlayEl.querySelector("#pickerTitle");
  const subEl = overlayEl.querySelector("#pickerSubtitle");
  const optsEl = overlayEl.querySelector("#pickerOptions");
  const cancelBtn = overlayEl.querySelector("#pickerCancelBtn");

  titleEl.textContent = opts.title || "Pick a target";
  subEl.textContent = opts.subtitle || "";
  optsEl.innerHTML = "";

  return new Promise((resolve) => {
    function cleanup() {
      overlayEl.classList.add("hidden");
      optsEl.innerHTML = "";
    }

    opts.options.forEach((o) => {
      const btn = document.createElement("button");
      btn.textContent = o.label;
      btn.title = o.title || "";
      btn.addEventListener("click", () => {
        cleanup();
        resolve(o.value);
      });
      optsEl.appendChild(btn);
    });

    cancelBtn.onclick = () => { cleanup(); resolve(null); };
    overlayEl.classList.remove("hidden");
  });
}

export function pickTileForTeleport(overlayEl, state, player) {
  const pu = getPowerup("teleport");
  const range = pu.range || 20;
  const options = [];
  for (let t = player.tile + 1; t <= Math.min(state.board.totalTiles - 1, player.tile + range); t++) {
    if (state.board.tiles[t].type === "snake-head") continue;
    options.push({ value: t, label: String(t + 1), title: `Tile ${t + 1}` });
  }
  return showPicker(overlayEl, {
    title: "Teleport",
    subtitle: `Choose a tile within ${range} of your position (snake heads excluded)`,
    options,
  });
}

export function pickOpponent(overlayEl, state, player, action) {
  const options = state.players
    .filter((p) => p.id !== player.id)
    .map((p) => ({ value: p.id, label: p.name, title: `Tile ${p.tile + 1}` }));
  return showPicker(overlayEl, {
    title: action,
    subtitle: "Choose an opponent",
    options,
  });
}
