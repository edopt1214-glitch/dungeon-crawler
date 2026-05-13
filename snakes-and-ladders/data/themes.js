export const THEMES = {
  classic: {
    name: "Classic",
    palette: {
      bgA: "#f4e2b8",
      bgB: "#e8d094",
      grid: "#3a2a14",
      text: "#1a1208",
      snake: "#2e7d32",
      snakeAccent: "#a5d6a7",
      ladder: "#a1887f",
      ladderRail: "#5d4037",
      tokenOutline: "#1a1208",
      powerup: "#ffeb3b",
      powerupGlow: "rgba(255, 235, 59, 0.4)",
    },
    font: '14px "Georgia", serif',
  },
  jungle: {
    name: "Jungle",
    palette: {
      bgA: "#a5d6a7",
      bgB: "#7cb342",
      grid: "#1b5e20",
      text: "#0a3010",
      snake: "#33691e",
      snakeAccent: "#dcedc8",
      ladder: "#8d6e63",
      ladderRail: "#4e342e",
      tokenOutline: "#0a3010",
      powerup: "#ffd54f",
      powerupGlow: "rgba(255, 213, 79, 0.5)",
    },
    font: '14px "Verdana", sans-serif',
  },
  space: {
    name: "Space",
    palette: {
      bgA: "#1a237e",
      bgB: "#0d1442",
      grid: "#7986cb",
      text: "#e8eaf6",
      snake: "#ce93d8",
      snakeAccent: "#f3e5f5",
      ladder: "#80cbc4",
      ladderRail: "#004d40",
      tokenOutline: "#000000",
      powerup: "#ffeb3b",
      powerupGlow: "rgba(255, 235, 59, 0.6)",
    },
    font: '14px "Consolas", monospace',
  },
  candy: {
    name: "Candy",
    palette: {
      bgA: "#fce4ec",
      bgB: "#f8bbd0",
      grid: "#ad1457",
      text: "#560027",
      snake: "#e91e63",
      snakeAccent: "#fce4ec",
      ladder: "#ba68c8",
      ladderRail: "#4a148c",
      tokenOutline: "#560027",
      powerup: "#ffeb3b",
      powerupGlow: "rgba(255, 235, 59, 0.5)",
    },
    font: '14px "Comic Sans MS", cursive',
  },
};

export function getTheme(id) {
  return THEMES[id] || THEMES.classic;
}
