import { ROLES, APPROVAL_TYPES, APPROVAL_STATUS } from '../lib/roles';
import { genId } from '../lib/ids';

const today = () => new Date().toISOString().slice(0, 10);
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };
const daysAhead = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

// ------------ Users ---------------------------------------------------------
const ADMIN = {
  id: 'u_admin',
  name: 'Priya Sharma',
  email: 'priya@performiq.io',
  role: ROLES.ADMIN,
  managerId: null,
  avatar: '#a855f7',
  dept: 'People Ops',
  group: null,
  title: 'HR Admin',
};

const DIRECTOR = {
  id: 'u_director',
  name: 'Rajesh Kumar',
  email: 'rajesh@performiq.io',
  role: ROLES.DIRECTOR,
  managerId: null,
  avatar: '#06b6d4',
  dept: 'Engineering',
  group: 'Director',
  title: 'Director of Engineering',
};

const MANAGERS = [
  { id: 'u_mgr_qa', name: 'Arjun Patel', email: 'arjun@performiq.io', managerId: DIRECTOR.id, dept: 'Engineering', group: 'QA Engineer', title: 'QA Manager', avatar: '#5b8def' },
  { id: 'u_mgr_be', name: 'Divya Menon', email: 'divya@performiq.io', managerId: DIRECTOR.id, dept: 'Engineering', group: 'Backend Developer', title: 'Backend Manager', avatar: '#22c55e' },
  { id: 'u_mgr_fe', name: 'Kiran Rao',   email: 'kiran@performiq.io', managerId: DIRECTOR.id, dept: 'Engineering', group: 'Frontend Developer', title: 'Frontend Manager', avatar: '#f59e0b' },
].map((m) => ({ ...m, role: ROLES.MANAGER }));

const employees = (mgrId, group, dept, people) =>
  people.map((p, i) => ({
    id: p.id, name: p.name, email: p.email, role: ROLES.EMPLOYEE,
    managerId: mgrId, dept, group, title: p.title, avatar: ['#5b8def','#22c55e','#f59e0b','#a855f7','#06b6d4'][i % 5],
  }));

const QA_TEAM = employees('u_mgr_qa', 'QA Engineer', 'Engineering', [
  { id: 'u_qa_1', name: 'Aarav Iyer',     email: 'aarav@performiq.io',   title: 'QA Engineer II' },
  { id: 'u_qa_2', name: 'Neha Desai',     email: 'neha@performiq.io',    title: 'Senior QA Engineer' },
  { id: 'u_qa_3', name: 'Vikram Singh',   email: 'vikram@performiq.io',  title: 'QA Engineer I' },
  { id: 'u_qa_4', name: 'Sneha Reddy',    email: 'sneha@performiq.io',   title: 'QA Automation Engineer' },
  { id: 'u_qa_5', name: 'Rohan Joshi',    email: 'rohan@performiq.io',   title: 'QA Engineer II' },
]);

const BE_TEAM = employees('u_mgr_be', 'Backend Developer', 'Engineering', [
  { id: 'u_be_1', name: 'Anjali Nair',    email: 'anjali@performiq.io',  title: 'Senior Backend Dev' },
  { id: 'u_be_2', name: 'Karthik Varma',  email: 'karthik@performiq.io', title: 'Backend Dev II' },
  { id: 'u_be_3', name: 'Ishaan Gupta',   email: 'ishaan@performiq.io',  title: 'Backend Dev I' },
  { id: 'u_be_4', name: 'Meera Pillai',   email: 'meera@performiq.io',   title: 'Backend Dev II' },
  { id: 'u_be_5', name: 'Dev Malhotra',   email: 'dev@performiq.io',     title: 'Senior Backend Dev' },
]);

const FE_TEAM = employees('u_mgr_fe', 'Frontend Developer', 'Engineering', [
  { id: 'u_fe_1', name: 'Riya Kapoor',    email: 'riya@performiq.io',    title: 'Senior Frontend Dev' },
  { id: 'u_fe_2', name: 'Aditya Bhat',    email: 'aditya@performiq.io',  title: 'Frontend Dev II' },
  { id: 'u_fe_3', name: 'Pooja Shah',     email: 'pooja@performiq.io',   title: 'Frontend Dev I' },
  { id: 'u_fe_4', name: 'Siddharth Roy',  email: 'siddharth@performiq.io', title: 'Frontend Dev II' },
  { id: 'u_fe_5', name: 'Kavya Menon',    email: 'kavya@performiq.io',   title: 'Senior Frontend Dev' },
]);

export const INITIAL_USERS = [ADMIN, DIRECTOR, ...MANAGERS, ...QA_TEAM, ...BE_TEAM, ...FE_TEAM];

export const INITIAL_PASSWORDS = Object.fromEntries(
  INITIAL_USERS.map((u) => [u.email, 'Demo1234!'])
);

// ------------ Periods -------------------------------------------------------
export const INITIAL_PERIODS = [
  { id: 'p_h1_2025', name: 'H1 2025', start: '2025-01-01', end: '2025-06-30', isActive: false },
  { id: 'p_h2_2025', name: 'H2 2025', start: '2025-07-01', end: '2025-12-31', isActive: false },
  { id: 'p_h1_2026', name: 'H1 2026', start: '2026-01-01', end: '2026-06-30', isActive: true  },
];

export const ACTIVE_PERIOD_ID = 'p_h1_2026';

// ------------ Goal catalog --------------------------------------------------
export const INITIAL_GOALS_CATALOG = [
  { id: 'g_test_coverage',   title: 'Increase test coverage to 85%',             category: 'Quality',       defaultWeight: 25 },
  { id: 'g_bug_escape',      title: 'Reduce bug escape rate below 3%',           category: 'Quality',       defaultWeight: 20 },
  { id: 'g_automation',      title: 'Automate 50 regression test cases',         category: 'QA',            defaultWeight: 20 },
  { id: 'g_api_latency',     title: 'Reduce P95 API latency by 30%',             category: 'Performance',   defaultWeight: 25 },
  { id: 'g_feature_ship',    title: 'Ship 3 major features on time',             category: 'Delivery',      defaultWeight: 25 },
  { id: 'g_tech_debt',       title: 'Close 15 tech-debt tickets',                category: 'Engineering',   defaultWeight: 15 },
  { id: 'g_ui_accessibility',title: 'Raise accessibility score to AA on 5 flows',category: 'Frontend',      defaultWeight: 20 },
  { id: 'g_design_system',   title: 'Contribute 10 reusable components',         category: 'Frontend',      defaultWeight: 15 },
  { id: 'g_mentoring',       title: 'Mentor 2 junior engineers',                 category: 'Team',          defaultWeight: 10 },
  { id: 'g_certification',   title: 'Earn 1 relevant certification',             category: 'Certification', defaultWeight: 10 },
  { id: 'g_oncall_quality',  title: 'Zero P0 incidents on-call',                 category: 'Reliability',   defaultWeight: 15 },
  { id: 'g_code_review',     title: 'Review 50 PRs with substantive feedback',   category: 'Team',          defaultWeight: 10 },
];

// ------------ Groups (role → default goals) ---------------------------------
export const INITIAL_GROUPS = [
  { id: 'grp_qa', name: 'QA Engineer',         goals: ['g_test_coverage','g_bug_escape','g_automation','g_mentoring','g_certification'] },
  { id: 'grp_be', name: 'Backend Developer',   goals: ['g_api_latency','g_feature_ship','g_tech_debt','g_oncall_quality','g_code_review'] },
  { id: 'grp_fe', name: 'Frontend Developer',  goals: ['g_feature_ship','g_ui_accessibility','g_design_system','g_code_review','g_mentoring'] },
];

// ------------ Goal generation helpers ---------------------------------------
const makeGoal = (goalId, completion, weight, dueOffset, periodId = ACTIVE_PERIOD_ID, extra = {}) => ({
  id: genId('eg'),
  goalId,
  completion,
  weight,
  dueDate: daysAhead(dueOffset),
  updates: [],
  files: [],
  periodId,
  selfProposed: false,
  ...extra,
});

const seedUpdates = (completion) => {
  if (completion === 0) return [];
  const step = Math.max(1, Math.floor(completion / 3));
  return [
    { pct: step,     date: daysAgo(60), note: 'Initial progress after kickoff.' },
    { pct: step * 2, date: daysAgo(30), note: 'Mid-period check-in.' },
    ...(completion >= step * 3 ? [{ pct: completion, date: daysAgo(5), note: 'Latest status update.' }] : []),
  ];
};

const goalSetFor = (group) => {
  const grp = INITIAL_GROUPS.find((g) => g.name === group);
  return grp ? grp.goals : [];
};

// Profile tuned by persona archetype: 'star','steady','struggling','self-starter','returning'
const PROFILES = {
  star:        [82, 90, 95, 75, 88],
  steady:      [70, 65, 78, 72, 68],
  struggling:  [40, 55, 35, 50, 45],
  selfStarter: [80, 85, 70, 90, 78],
  returning:   [55, 60, 50, 45, 58],
};

const archetypeFor = (userId) => ({
  u_qa_1: 'steady', u_qa_2: 'star',       u_qa_3: 'struggling', u_qa_4: 'selfStarter', u_qa_5: 'steady',
  u_be_1: 'star',   u_be_2: 'steady',     u_be_3: 'struggling', u_be_4: 'selfStarter', u_be_5: 'steady',
  u_fe_1: 'star',   u_fe_2: 'selfStarter',u_fe_3: 'returning',  u_fe_4: 'steady',      u_fe_5: 'struggling',
  u_mgr_qa: 'steady', u_mgr_be: 'star', u_mgr_fe: 'steady',
  u_director: 'star',
}[userId] || 'steady');

const buildEmpGoals = (userId, group) => {
  const goalIds = goalSetFor(group).slice(0, 5);
  const profile = PROFILES[archetypeFor(userId)];
  return goalIds.map((gId, i) => {
    const completion = profile[i % profile.length];
    const goalMeta = INITIAL_GOALS_CATALOG.find((g) => g.id === gId);
    const g = makeGoal(gId, completion, goalMeta?.defaultWeight ?? 20, 60 + i * 5);
    g.updates = seedUpdates(completion);
    return g;
  });
};

export const INITIAL_EMP_GOALS = (() => {
  const all = {};
  [...QA_TEAM, ...BE_TEAM, ...FE_TEAM, ...MANAGERS, DIRECTOR].forEach((u) => {
    all[u.id] = buildEmpGoals(u.id, u.group);
  });
  // A few self-proposed goals (employee initiative) — some approved, some pending.
  all.u_qa_4.push({
    ...makeGoal('g_automation', 60, 10, 90),
    selfProposed: true, proposalStatus: APPROVAL_STATUS.APPROVED,
    customTitle: 'Build shared QA automation harness',
    proposedOn: daysAgo(80),
  });
  all.u_be_4.push({
    ...makeGoal('g_tech_debt', 40, 10, 75),
    selfProposed: true, proposalStatus: APPROVAL_STATUS.APPROVED,
    customTitle: 'Refactor legacy payment gateway integration',
    proposedOn: daysAgo(70),
  });
  all.u_fe_2.push({
    ...makeGoal('g_design_system', 30, 10, 110),
    selfProposed: true, proposalStatus: APPROVAL_STATUS.PENDING,
    customTitle: 'Add dark-mode tokens to design system',
    proposedOn: daysAgo(5),
  });
  all.u_qa_2.push({
    ...makeGoal('g_mentoring', 50, 10, 120),
    selfProposed: true, proposalStatus: APPROVAL_STATUS.APPROVED,
    customTitle: 'Run weekly QA office hours for juniors',
    proposedOn: daysAgo(55),
  });
  return all;
})();

// ------------ Life events ---------------------------------------------------
export const INITIAL_LIFE_EVENTS = {
  u_qa_3: [{ id: genId('le'), type: 'Medical Leave', desc: 'Recovery from surgery', start: daysAgo(45), end: daysAgo(20), status: APPROVAL_STATUS.APPROVED, reviewedBy: 'u_mgr_qa' }],
  u_be_3: [{ id: genId('le'), type: 'Personal Emergency', desc: 'Family emergency', start: daysAgo(15), end: daysAgo(5), status: APPROVAL_STATUS.PENDING }],
  u_fe_3: [{ id: genId('le'), type: 'Sabbatical', desc: 'Extended caregiving leave', start: daysAgo(180), end: daysAgo(90), status: APPROVAL_STATUS.APPROVED, reviewedBy: 'u_mgr_fe' }],
  u_fe_5: [{ id: genId('le'), type: 'Bereavement', desc: 'Loss in the family', start: daysAgo(30), end: daysAgo(25), status: APPROVAL_STATUS.APPROVED, reviewedBy: 'u_mgr_fe' }],
};

// ------------ Rating history (closed periods) -------------------------------
// Tuned so that "stars" sustain >= 85 across H1_2025 and H2_2025 → eligible for promotion.
const HISTORY_BY_ARCH = {
  star:        [{ periodId: 'p_h1_2025', raw: 88, adjusted: 89, endDate: '2025-06-30' }, { periodId: 'p_h2_2025', raw: 91, adjusted: 92, endDate: '2025-12-31' }],
  steady:      [{ periodId: 'p_h1_2025', raw: 74, adjusted: 75, endDate: '2025-06-30' }, { periodId: 'p_h2_2025', raw: 77, adjusted: 78, endDate: '2025-12-31' }],
  struggling:  [{ periodId: 'p_h1_2025', raw: 55, adjusted: 57, endDate: '2025-06-30' }, { periodId: 'p_h2_2025', raw: 61, adjusted: 63, endDate: '2025-12-31' }],
  selfStarter: [{ periodId: 'p_h1_2025', raw: 82, adjusted: 83, endDate: '2025-06-30' }, { periodId: 'p_h2_2025', raw: 86, adjusted: 87, endDate: '2025-12-31' }],
  returning:   [{ periodId: 'p_h1_2025', raw: 48, adjusted: 62, endDate: '2025-06-30' }, { periodId: 'p_h2_2025', raw: 68, adjusted: 72, endDate: '2025-12-31' }],
};

export const INITIAL_RATING_HISTORY = (() => {
  const h = {};
  [...QA_TEAM, ...BE_TEAM, ...FE_TEAM, ...MANAGERS, DIRECTOR].forEach((u) => {
    h[u.id] = HISTORY_BY_ARCH[archetypeFor(u.id)].map((r) => ({ ...r }));
  });
  return h;
})();

// ------------ Approvals queue ----------------------------------------------
export const INITIAL_APPROVALS = [
  { id: genId('appr'), type: APPROVAL_TYPES.WEIGHT_CHANGE, employeeId: 'u_qa_1', managerId: 'u_mgr_qa', status: APPROVAL_STATUS.PENDING, date: daysAgo(3), detail: 'Shift 5% weight from Automation to Mentoring' },
  { id: genId('appr'), type: APPROVAL_TYPES.LIFE_EVENT,    employeeId: 'u_be_3', managerId: 'u_mgr_be', status: APPROVAL_STATUS.PENDING, date: daysAgo(2), detail: 'Personal Emergency — 10 days' },
  { id: genId('appr'), type: APPROVAL_TYPES.SELF_PROPOSED_GOAL, employeeId: 'u_fe_2', managerId: 'u_mgr_fe', status: APPROVAL_STATUS.PENDING, date: daysAgo(5), detail: 'Add dark-mode tokens to design system' },
  { id: genId('appr'), type: APPROVAL_TYPES.TEAM_LINK,    employeeId: 'u_qa_3', managerId: 'u_mgr_qa', status: APPROVAL_STATUS.PENDING, adminOnly: true, date: daysAgo(1), detail: 'Move Vikram to Backend team' },
];

// ------------ Promotions ----------------------------------------------------
// Seed one active promotion recommendation that the director can approve/reject.
export const INITIAL_PROMOTIONS = [
  { id: genId('promo'), employeeId: 'u_be_1', recommendedBy: 'u_mgr_be', status: 'RECOMMENDED', reason: 'Sustained >90 rating; led payment refactor.', date: daysAgo(4) },
];

// ------------ Role progression ladder ---------------------------------------
// Each group ladders IC roles; managers and director have their own chain.
// `progression[title]` → next title, or null if top of ladder.
export const INITIAL_LADDERS = [
  { group: 'QA Engineer',        roles: ['QA Engineer I', 'QA Engineer II', 'Senior QA Engineer', 'Staff QA Engineer', 'QA Lead'] },
  { group: 'Backend Developer',  roles: ['Backend Dev I', 'Backend Dev II', 'Senior Backend Dev', 'Staff Backend Dev', 'Backend Lead'] },
  { group: 'Frontend Developer', roles: ['Frontend Dev I', 'Frontend Dev II', 'Senior Frontend Dev', 'Staff Frontend Dev', 'Frontend Lead'] },
  { group: 'Management',         roles: ['QA Lead', 'QA Manager', 'Senior QA Manager', 'Director of Engineering'] },
  { group: 'Management',         roles: ['Backend Lead', 'Backend Manager', 'Senior Backend Manager', 'Director of Engineering'] },
  { group: 'Management',         roles: ['Frontend Lead', 'Frontend Manager', 'Senior Frontend Manager', 'Director of Engineering'] },
  { group: 'Leadership',         roles: ['Director of Engineering', 'VP Engineering', 'CTO'] },
];

const buildProgression = () => {
  const map = {};
  INITIAL_LADDERS.forEach((l) => {
    for (let i = 0; i < l.roles.length - 1; i++) {
      // Don't clobber a more-specific mapping with a generic one.
      if (!map[l.roles[i]]) map[l.roles[i]] = l.roles[i + 1];
    }
    if (!map[l.roles.at(-1)]) map[l.roles.at(-1)] = null;
  });
  // Aliases for titles used in seed that aren't strictly on the main ladder.
  map['QA Automation Engineer'] = 'Senior QA Engineer';
  return map;
};

export const INITIAL_PROGRESSION = buildProgression();

// ------------ Full initial state --------------------------------------------
export const buildInitialState = () => ({
  users: INITIAL_USERS,
  passwords: INITIAL_PASSWORDS,
  goalsCatalog: INITIAL_GOALS_CATALOG,
  empGoals: INITIAL_EMP_GOALS,
  lifeEvents: INITIAL_LIFE_EVENTS,
  periods: INITIAL_PERIODS,
  groups: INITIAL_GROUPS,
  approvals: INITIAL_APPROVALS,
  ratingHistory: INITIAL_RATING_HISTORY,
  promotions: INITIAL_PROMOTIONS,
  ladders: INITIAL_LADDERS,
  progression: INITIAL_PROGRESSION,
  meta: { seededAt: today() },
});
