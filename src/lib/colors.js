// Stable 10-colour palette used for per-goal identity. The same goal gets the
// same colour everywhere (radar, list, charts), so the eye can track it
// across the app without re-reading labels.
export const GOAL_PALETTE = [
  '#5b8def', '#22c55e', '#f59e0b', '#a855f7', '#06b6d4',
  '#ec4899', '#84cc16', '#eab308', '#14b8a6', '#f97316',
];

// Deterministic id → colour map so colours stay consistent between renders.
// Uses a simple character-sum hash (not for security, just for stability).
const hashIndex = (id, len) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % len;
};

export const colorForGoal = (goalId) => GOAL_PALETTE[hashIndex(String(goalId || 'x'), GOAL_PALETTE.length)];

// Build a stable map for a specific list so we can guarantee distinct colours
// even when hash collisions would otherwise reuse a shade.
export const buildGoalColorMap = (goals) => {
  const map = {};
  const used = new Set();
  goals.forEach((g) => {
    let c = colorForGoal(g.id);
    if (used.has(c)) {
      // Find the first unused palette colour.
      c = GOAL_PALETTE.find((p) => !used.has(p)) || c;
    }
    used.add(c);
    map[g.id] = c;
  });
  return map;
};
