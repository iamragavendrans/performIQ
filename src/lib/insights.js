import { daysLeft } from './format';

// Rating → human-readable band. Used on the Rating Forecast card.
export const ratingBand = (adjusted) => {
  if (adjusted >= 90) return 'Exceeds Expectations';
  if (adjusted >= 75) return 'Meets Expectations';
  if (adjusted >= 60) return 'Needs Improvement';
  return 'Below Expectations';
};

export const bandTone = (band, C) => {
  if (band === 'Exceeds Expectations') return C.success;
  if (band === 'Meets Expectations')   return C.cyan;
  if (band === 'Needs Improvement')    return C.warning;
  return C.danger;
};

// Pace: average pct-points a goal has been gaining per day in its update log.
// Falls back to 0 when we don't have two data points in the last ~60 days.
const goalPace = (goal) => {
  const updates = [...(goal.updates || [])].sort((a, b) => new Date(a.date) - new Date(b.date));
  if (updates.length < 2) return 0;
  const first = updates[0];
  const last = updates[updates.length - 1];
  const spanDays = Math.max(1, (new Date(last.date) - new Date(first.date)) / 86400000);
  const delta = (last.pct || 0) - (first.pct || 0);
  return Math.max(0, delta / spanDays);
};

// Forecast end-of-period adjusted rating by projecting each goal's completion
// to its due date using its own pace, then computing the weighted average.
export const computeForecast = (goals) => {
  if (!goals.length) return { adjusted: 0, band: '—', driver: null };
  const projected = goals.map((g) => {
    const pace = goalPace(g);
    const dLeft = Math.max(0, daysLeft(g.dueDate));
    const projectedCompletion = Math.min(100, (g.completion || 0) + pace * dLeft);
    return { g, projectedCompletion, contribution: projectedCompletion * (g.weight || 0) / 100 };
  });
  const totalW = goals.reduce((s, g) => s + (g.weight || 0), 0) || 1;
  const adjusted = projected.reduce((s, p) => s + (p.projectedCompletion * (p.g.weight || 0)), 0) / totalW;
  const driver = [...projected].sort((a, b) => b.contribution - a.contribution)[0];
  return {
    adjusted,
    band: ratingBand(adjusted),
    driver: driver ? {
      title: driver.g.title,
      weight: driver.g.weight,
      completion: driver.g.completion,
      contribution: driver.contribution,
    } : null,
  };
};

// Momentum: total pct-points gained across all goals in the last `days` days.
// Returns a direction + a short human phrase.
export const computeMomentum = (goals, days = 14) => {
  const cutoff = Date.now() - days * 86400000;
  let total = 0;
  let goalsMoved = 0;
  goals.forEach((g) => {
    const sorted = [...(g.updates || [])].sort((a, b) => new Date(a.date) - new Date(b.date));
    // Completion now minus completion as-of cutoff.
    const before = sorted.filter((u) => new Date(u.date).getTime() < cutoff).pop();
    const now = sorted[sorted.length - 1];
    if (!now || !before) return;
    const d = (now.pct || 0) - (before.pct || 0);
    if (d !== 0) goalsMoved += 1;
    total += d;
  });
  const rounded = Math.round(total);
  const direction = rounded >= 2 ? 'up' : rounded <= -2 ? 'down' : 'flat';
  const phrase =
    direction === 'up'   ? `+${rounded} pts vs ${days} days ago` :
    direction === 'down' ? `${rounded} pts vs ${days} days ago` :
                           'Steady — no big swings';
  return { points: rounded, direction, goalsMoved, phrase };
};

// Risks: goals likely to miss their due date given current pace.
export const computeRisks = (goals) => {
  return goals
    .filter((g) => g.completion < 100)
    .map((g) => {
      const d = daysLeft(g.dueDate);
      if (d < 0) return { goal: g, severity: 'high', message: `Overdue by ${Math.abs(d)} day${Math.abs(d) === 1 ? '' : 's'}` };
      if (d <= 7 && g.completion < 75) return { goal: g, severity: 'high', message: `At ${g.completion}% with ${d} day${d === 1 ? '' : 's'} left` };
      const pace = goalPace(g);
      const needed = (100 - (g.completion || 0)) / Math.max(1, d);
      if (d <= 30 && pace < needed * 0.6) {
        return { goal: g, severity: 'med', message: `Pace ${pace.toFixed(1)}/day is slower than the ${needed.toFixed(1)}/day you need` };
      }
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => (a.severity === 'high' ? -1 : 1) - (b.severity === 'high' ? -1 : 1));
};

// Alignment: how much my in-progress focus overlaps my manager's top goals.
// Rough-and-fair heuristic: count manager's high-weight (≥ 20%) goals that I
// also hold and am making real progress on (weight ≥ 15%).
export const computeAlignment = (myGoals, managerGoals) => {
  if (!managerGoals || !managerGoals.length) {
    return { score: null, gaps: [], covered: 0, total: 0 };
  }
  const managerPriorities = managerGoals
    .filter((g) => (g.weight || 0) >= 20 && !g.selfProposed)
    .map((g) => ({ id: g.goalId, title: g.title }));
  const myActiveIds = new Set(
    myGoals.filter((g) => (g.weight || 0) >= 15 && !g.selfProposed).map((g) => g.goalId)
  );
  const covered = managerPriorities.filter((m) => myActiveIds.has(m.id));
  const score = managerPriorities.length
    ? Math.round((covered.length / managerPriorities.length) * 100)
    : 100;
  const gaps = managerPriorities.filter((m) => !myActiveIds.has(m.id)).map((m) => m.title);
  return { score, gaps, covered: covered.length, total: managerPriorities.length };
};

// Next best actions: highest-leverage in-progress goals with a specific,
// data-driven recommendation + estimated rating impact if pushed to 100%.
export const nextBestActions = (goals, max = 3) => {
  return [...goals]
    .filter((g) => g.completion < 100 && (!g.selfProposed || g.proposalStatus === 'APPROVED'))
    .map((g) => {
      const leverage = ((g.weight || 0) * (100 - (g.completion || 0))) / 100;
      // If pushed to 100%, rating gains (100 - completion) × (weight / 100).
      const ratingGainIfDone = ((100 - (g.completion || 0)) * (g.weight || 0)) / 100;
      const pace = goalPace(g);
      let recommendation;
      if (g.completion >= 80) {
        recommendation = 'Close it out — document the approach and ship the last mile.';
      } else if (pace > 0.5 && daysLeft(g.dueDate) > 7) {
        recommendation = 'You&rsquo;re building pace. Protect the weekly block and keep shipping.';
      } else if (pace < 0.2) {
        recommendation = 'Momentum has stalled. Pick one concrete sub-task and commit a deadline this week.';
      } else {
        recommendation = 'Make one meaningful push this week — ~5 pct points gets you closer to on-track.';
      }
      return { goal: g, leverage, ratingGainIfDone, recommendation };
    })
    .sort((a, b) => b.leverage - a.leverage)
    .slice(0, max);
};

// Promotion delta: which specific next action would move the readiness score?
// The composite is sustained rating (50) + initiative (25) + reliability (25).
// We can suggest the cheapest lever given the current gap.
export const promotionHowToImprove = (eligibility) => {
  const tips = [];
  if (!eligibility.sustained) tips.push('Sustain a rating ≥ 85 for two periods in a row.');
  if (!eligibility.initiative) tips.push('Get at least one self-proposed goal approved — it signals stretch.');
  if (eligibility.overdueRatio >= 0.2) tips.push('Reduce overdue goals below 20% of your active list.');
  return tips;
};
