import { ACHIEVEMENTS } from "../../data/achievements.js";
import { logEvent, setToast } from "../state/gameState.js";
import { loadAchievements, saveAchievements } from "../persistence/storage.js";

export function checkAchievements(state, evName) {
  const stats = state.persistentStats;
  if (evName === "snake") stats.totalSnakesHit++;
  if (evName === "shieldSave") stats.totalShieldsSaved++;
  if (evName === "win") {
    stats.gamesPlayed++;
    if (state.winner && !state.winner.isAI) stats.totalWins++;
    if (!stats.themesPlayed) stats.themesPlayed = new Set();
    if (!(stats.themesPlayed instanceof Set)) stats.themesPlayed = new Set(stats.themesPlayed);
    stats.themesPlayed.add(state.theme);
  }

  const newlyUnlocked = [];
  for (const ach of ACHIEVEMENTS) {
    if (state.achievementsUnlocked.has(ach.id)) continue;
    try {
      if (ach.check(state, evName)) {
        state.achievementsUnlocked.add(ach.id);
        newlyUnlocked.push(ach);
        logEvent(state, `Achievement unlocked: ${ach.name}`);
        setToast(state, `\u{1F3C6} ${ach.name}!`);
      }
    } catch (e) {}
  }

  persistAchievements(state);
  return newlyUnlocked;
}

export function persistAchievements(state) {
  const themesArr = state.persistentStats.themesPlayed instanceof Set
    ? Array.from(state.persistentStats.themesPlayed)
    : (state.persistentStats.themesPlayed || []);
  saveAchievements({
    unlocked: Array.from(state.achievementsUnlocked),
    stats: {
      gamesPlayed: state.persistentStats.gamesPlayed,
      totalWins: state.persistentStats.totalWins,
      totalSnakesHit: state.persistentStats.totalSnakesHit,
      totalShieldsSaved: state.persistentStats.totalShieldsSaved,
      themesPlayed: themesArr,
    },
  });
}

export function loadPersistentStats() {
  const data = loadAchievements();
  return {
    unlocked: new Set(data.unlocked),
    stats: {
      gamesPlayed: data.stats.gamesPlayed || 0,
      totalWins: data.stats.totalWins || 0,
      totalSnakesHit: data.stats.totalSnakesHit || 0,
      totalShieldsSaved: data.stats.totalShieldsSaved || 0,
      themesPlayed: new Set(data.stats.themesPlayed || []),
    },
  };
}
