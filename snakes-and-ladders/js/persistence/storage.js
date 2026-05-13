const PREFIX = "snl.v1.";

function safeGet(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (e) {
    // ignore
  }
}

export function loadSettings() {
  return safeGet("settings") || { soundOn: true, sfxVolume: 0.7, animSpeed: 1.0, theme: "classic" };
}

export function saveSettings(s) {
  safeSet("settings", s);
}

export function loadAchievements() {
  const data = safeGet("achievements");
  if (!data) {
    return {
      unlocked: [],
      stats: { gamesPlayed: 0, totalWins: 0, totalSnakesHit: 0, totalShieldsSaved: 0, themesPlayed: [] },
    };
  }
  if (!data.stats) data.stats = { gamesPlayed: 0, totalWins: 0, totalSnakesHit: 0, totalShieldsSaved: 0, themesPlayed: [] };
  if (!Array.isArray(data.stats.themesPlayed)) data.stats.themesPlayed = [];
  return data;
}

export function saveAchievements(data) {
  safeSet("achievements", data);
}

export function loadProfiles() {
  return safeGet("profiles") || [];
}

export function saveProfiles(p) {
  safeSet("profiles", p);
}

export function clearAll() {
  for (const k of ["settings", "achievements", "profiles", "lastGame"]) {
    try { localStorage.removeItem(PREFIX + k); } catch (e) {}
  }
}
