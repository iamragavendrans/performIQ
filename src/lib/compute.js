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

// Per-type impact weights. Types with a heavier real-life toll weigh more.
// These are baked-in defaults; admins can override per-type via the
// Admin → Life Events config page (state.lifeEventTypes).
export const LIFE_EVENT_IMPACT = {
  'Bereavement':         1.50,
  'Medical Leave':       1.20,
  'Personal Emergency':  1.00,
  'Parental Leave':      1.00,
  'Sabbatical':          0.50,
};

// When a `types` array (from state.lifeEventTypes) is provided, use it as the
// source of truth so admin-configured values take effect immediately.
export const lifeEventImpact = (type, types) => {
  if (Array.isArray(types)) {
    const match = types.find((t) => t.name === type);
    if (match) return match.impact;
  }
  return LIFE_EVENT_IMPACT[type] ?? 1.00;
};

export const lifeEventScore = (ev, types) => {
  const days = daysBetween(ev.start, ev.end);
  const impact = lifeEventImpact(ev.type, types);
  return { days, impact, weightedDays: days * impact };
};

// Life-event adjustment: +0.3% per weighted day (days × impact), capped at 10%.
export const computeRating = (goals, lifeEvents = [], types) => {
  if (!goals || goals.length === 0) return { raw: 0, adjusted: 0, isAdjusted: false, factor: 1, approvedDays: 0, weightedDays: 0, upliftPoints: 0 };
  const totalWeight = goals.reduce((s, g) => s + (g.weight || 0), 0) || 1;
  const raw = goals.reduce((s, g) => s + (g.completion || 0) * (g.weight || 0), 0) / totalWeight;
  const approved = (lifeEvents || []).filter((e) => e.status === 'APPROVED');
  const approvedDays = approved.reduce((s, e) => s + daysBetween(e.start, e.end), 0);
  const weightedDays = approved.reduce((s, e) => s + lifeEventScore(e, types).weightedDays, 0);
  const factor = Math.min(1.10, 1 + weightedDays * 0.003);
  const adjusted = Math.min(100, raw * factor);
  return {
    raw, adjusted, isAdjusted: factor > 1, factor,
    approvedDays, weightedDays,
    upliftPoints: Math.max(0, adjusted - raw),
  };
};

export const teamHealth = (goals) => {
  if (!goals.length) return 'GREEN';
  const avg = goals.reduce((s, g) => s + (g.completion || 0), 0) / goals.length;
  const hasOff = goals.some((g) => goalStatus(g.completion) === GOAL_STATUS.OFF_TRACK);
  const hasWarn = goals.some((g) => goalStatus(g.completion) === GOAL_STATUS.NEEDS_ATTENTION);
  if (hasOff || avg < 60) return 'Critical';
  if (hasWarn || avg < 75) return 'At Risk';
  return 'Healthy';
};

export const healthColor = (h, C) =>
  h === 'Critical' ? C.danger : h === 'At Risk' ? C.warning : C.success;

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

  // Composite readiness 0-100: outcomes (sustained rating) weigh most,
  // initiative and reliability fill the rest. The individual components are
  // not exposed on dashboards to limit gaming — only shown to managers in the
  // recommendation modal.
  const ratingPart =
    sustained ? 50 :
    recent.some((r) => (r.adjusted || 0) >= target) ? 25 :
    recent.length ? Math.max(0, (recent[0].adjusted - (target - 25)) * 1.0) : 0;
  const initiativePart = initiative ? 25 : Math.min(25, selfProposedApprovedCount * 10);
  const reliabilityPart = overdueRatio < 0.2 ? 25 : overdueRatio < 0.4 ? 12 : 0;
  const score = Math.max(0, Math.min(100, Math.round(ratingPart + initiativePart + reliabilityPart)));

  let tier;
  if (score >= 85 && sustained && initiative) tier = PROMOTION.ELIGIBLE;
  else if (score >= 55) tier = PROMOTION.APPROACHING;
  else tier = PROMOTION.NOT_ELIGIBLE;

  return {
    tier,
    score,
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

export const nextRole = (progression, title) => {
  if (!title) return null;
  return progression?.[title] ?? null;
};
