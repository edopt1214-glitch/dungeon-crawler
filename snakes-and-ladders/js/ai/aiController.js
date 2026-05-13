import { decideEasy } from "./easy.js";
import { decideMedium } from "./medium.js";
import { decideHard } from "./hard.js";

export function decideAction(state, player) {
  switch (player.aiDifficulty) {
    case "hard": return decideHard(state, player);
    case "medium": return decideMedium(state, player);
    case "easy":
    default:
      return decideEasy(state, player);
  }
}
