export const ACHIEVEMENTS = [
  {
    id: "firstWin",
    name: "First Victory",
    description: "Win your first game.",
    hidden: false,
    check(state, ev) {
      return ev === "win" && state.winner && !state.winner.isAI;
    },
  },
  {
    id: "snakeBitten10",
    name: "Snake Charmer",
    description: "Get bitten by 10 snakes (lifetime).",
    hidden: false,
    check(state, ev) {
      return ev === "snake" && state.persistentStats.totalSnakesHit >= 10;
    },
  },
  {
    id: "noSnakesGame",
    name: "Pristine Path",
    description: "Win a game without being bitten by any snake.",
    hidden: false,
    check(state, ev) {
      if (ev !== "win" || !state.winner || state.winner.isAI) return false;
      return state.winner.stats.snakesHit === 0;
    },
  },
  {
    id: "comeback",
    name: "Comeback Kid",
    description: "Win after being last with under 20 tiles to go.",
    hidden: false,
    check(state, ev) {
      if (ev !== "win" || !state.winner || state.winner.isAI) return false;
      return state.winner._wasLastWhenClose === true;
    },
  },
  {
    id: "shieldSaved5",
    name: "Iron Hide",
    description: "Save yourself from snakes 5 times with shields (lifetime).",
    hidden: false,
    check(state, ev) {
      return ev === "shieldSave" && state.persistentStats.totalShieldsSaved >= 5;
    },
  },
  {
    id: "themeExplorer",
    name: "World Tour",
    description: "Play a game in each theme.",
    hidden: false,
    check(state, ev) {
      if (ev !== "win") return false;
      const themes = state.persistentStats.themesPlayed;
      return themes && themes.size >= 4;
    },
  },
  {
    id: "bigBoard",
    name: "Big Climber",
    description: "Win on a 12x12 board.",
    hidden: false,
    check(state, ev) {
      return ev === "win" && state.winner && !state.winner.isAI && state.board.size === 12;
    },
  },
  {
    id: "ladderLover",
    name: "Sky Walker",
    description: "Climb 5 ladders in a single game.",
    hidden: false,
    check(state, ev) {
      return ev === "ladder" && state.winner === null && state.players.some((p) => p.stats.laddersClimbed >= 5);
    },
  },
];

export function getAchievement(id) {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
