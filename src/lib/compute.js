import { daysBetween } from './format';

export const GOAL_STATUS = {
  COMPLETED: 'COMPLETED',
  ON_TRACK: 'ON_TRACK',
  NEEDS_ATTENTION: 'NEEDS_ATTENTION',
  OFF_TRACK: 'OFF_TRACK',
};

export const goalStatus = (completion) => {
  if (completion >= 100) return GOAL_STATUS.COMPLETED;
  if (completion >= 75) return GOAL_STATUS.ON_TRACK;
  if (completion >= 50) return GOAL_STATUS.NEEDS_ATTENTION;
  return GOAL_STATUS.OFF_TRACK;
};

export const statusColor = (status, C) => ({
  [GOAL_STATUS.COMPLETED]: C.success,
  [GOAL_STATUS.ON_TRACK]: C.accent,
  [GOAL_STATUS.NEEDS_ATTENTION]: C.warning,
  [GOAL_STATUS.OFF_TRACK]: C.danger,
}[status] || C.textMuted);

export const statusBg = (status, C) => ({
  [GOAL_STATUS.COMPLETED]: C.successDim,
  [GOAL_STATUS.ON_TRACK]: C.accentDim,
  [GOAL_STATUS.NEEDS_ATTENTION]: C.warningDim,
  [GOAL_STATUS.OFF_TRACK]: C.dangerDim,
}[status] || C.surface);

export const statusOrder = (status) => ({
  [GOAL_STATUS.OFF_TRACK]: 0,
  [GOAL_STATUS.NEEDS_ATTENTION]: 1,
  [GOAL_STATUS.ON_TRACK]: 2,
  [GOAL_STATUS.COMPLETED]: 3,
}[status] ?? 4);

// Life-event adjustment: +0.3% per approved day, capped at 10% uplift.
export const computeRating = (goals, lifeEvents = []) => {
  if (!goals || goals.length === 0) return { raw: 0, adjusted: 0, isAdjusted: false, factor: 1 };
  const totalWeight = goals.reduce((s, g) => s + (g.weight || 0), 0) || 1;
  const raw = goals.reduce((s, g) => s + (g.completion || 0) * (g.weight || 0), 0) / totalWeight;
  const approvedDays = (lifeEvents || [])
    .filter((e) => e.status === 'APPROVED')
    .reduce((s, e) => s + daysBetween(e.start, e.end), 0);
  const factor = Math.min(1.10, 1 + approvedDays * 0.003);
  const adjusted = Math.min(100, raw * factor);
  return { raw, adjusted, isAdjusted: factor > 1, factor, approvedDays };
};

export const teamHealth = (goals) => {
  if (!goals.length) return 'GREEN';
  const avg = goals.reduce((s, g) => s + (g.completion || 0), 0) / goals.length;
  const hasOff = goals.some((g) => goalStatus(g.completion) === GOAL_STATUS.OFF_TRACK);
  const hasWarn = goals.some((g) => goalStatus(g.completion) === GOAL_STATUS.NEEDS_ATTENTION);
  if (hasOff || avg < 60) return 'RED';
  if (hasWarn || avg < 75) return 'YELLOW';
  return 'GREEN';
};

export const healthColor = (h, C) =>
  h === 'RED' ? C.danger : h === 'YELLOW' ? C.warning : C.success;

// Promotion eligibility tiers: NOT_ELIGIBLE | APPROACHING | ELIGIBLE
// Signals: (1) sustained over-target adjusted rating in last 2 periods,
// (2) initiative via approved self-proposed goals in the last ~6 months,
// (3) overdue ratio in current goals.
export const PROMOTION = {
  NOT_ELIGIBLE: 'NOT_ELIGIBLE',
  APPROACHING: 'APPROACHING',
  ELIGIBLE: 'ELIGIBLE',
  RECOMMENDED: 'RECOMMENDED',
  APPROVED: 'APPROVED',
};

export const computePromotionEligibility = ({
  history = [],
  selfProposedApprovedCount = 0,
  currentGoals = [],
  target = 85,
}) => {
  const recent = [...history]
    .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())
    .slice(0, 2);
  const sustained = recent.length >= 2 && recent.every((r) => (r.adjusted || 0) >= target);
  const overdueRatio = currentGoals.length
    ? currentGoals.filter((g) => g.overdue).length / currentGoals.length
    : 0;
  const initiative = selfProposedApprovedCount >= 1;

  const score =
    (sustained ? 2 : recent.some((r) => (r.adjusted || 0) >= target) ? 1 : 0) +
    (initiative ? 1 : 0) +
    (overdueRatio < 0.2 ? 1 : 0);

  let tier;
  if (sustained && initiative && overdueRatio < 0.2) tier = PROMOTION.ELIGIBLE;
  else if (score >= 2) tier = PROMOTION.APPROACHING;
  else tier = PROMOTION.NOT_ELIGIBLE;

  return {
    tier,
    sustained,
    initiative,
    overdueRatio,
    recentAdjusted: recent.map((r) => r.adjusted),
    reasons: [
      sustained ? `Rating ≥ ${target} for last ${recent.length} periods` : `Rating below ${target} in recent periods`,
      initiative ? `${selfProposedApprovedCount} self-proposed goal(s) approved` : 'No approved self-proposed goals yet',
      overdueRatio < 0.2 ? 'Low overdue ratio' : 'Too many overdue goals',
    ],
  };
};
