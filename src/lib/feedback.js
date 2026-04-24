// Rule-based "AI" feedback. We don't call a model — these templates map
// (goal category + current status) to concrete next-step suggestions the
// employee can actually do this week.
import { GOAL_STATUS } from './compute';

const ACTIONS_BY_CATEGORY = {
  Quality: {
    [GOAL_STATUS.OFF_TRACK]:        'Block two focus hours tomorrow and write the first test case for the largest untested module.',
    [GOAL_STATUS.NEEDS_ATTENTION]:  'Pair with a teammate this week to cover one flaky test path — small wins compound.',
    [GOAL_STATUS.ON_TRACK]:         'Keep the cadence; document the approach so the rest of the team can reproduce it.',
    [GOAL_STATUS.COMPLETED]:        'Write a short post-mortem and harvest reusable patterns for others.',
  },
  QA: {
    [GOAL_STATUS.OFF_TRACK]:        'Pick the three highest-traffic flows and automate them first — biggest risk reduction per hour.',
    [GOAL_STATUS.NEEDS_ATTENTION]:  'Time-box one hour tomorrow to convert a manual test into an automated one.',
    [GOAL_STATUS.ON_TRACK]:         'Share your automation template with the team to unblock others.',
    [GOAL_STATUS.COMPLETED]:        'Stretch goal: propose a shared regression harness for the org.',
  },
  Performance: {
    [GOAL_STATUS.OFF_TRACK]:        'Start with one flame graph of the slowest endpoint; the Pareto optimisation will reveal itself.',
    [GOAL_STATUS.NEEDS_ATTENTION]:  'Draft a short RFC this week on the next-biggest latency lever.',
    [GOAL_STATUS.ON_TRACK]:         'Lock in your gains with a P95 regression alert before moving on.',
    [GOAL_STATUS.COMPLETED]:        'Consider mentoring one teammate on profiling workflows.',
  },
  Delivery: {
    [GOAL_STATUS.OFF_TRACK]:        'Re-scope: what’s the smallest shippable slice this sprint? Ship that, then iterate.',
    [GOAL_STATUS.NEEDS_ATTENTION]:  'Flag risks in your next 1:1 with your manager — delivery confidence gets better with early signal.',
    [GOAL_STATUS.ON_TRACK]:         'Add a single dashboard KPI so stakeholders see progress without asking.',
    [GOAL_STATUS.COMPLETED]:        'Write a 5-line retro: what worked, what you’d change next time.',
  },
  Engineering: {
    [GOAL_STATUS.OFF_TRACK]:        'Slot two hours into your calendar next Friday for tech-debt — it won’t happen without protecting the time.',
    [GOAL_STATUS.NEEDS_ATTENTION]:  'Pick one high-traffic module and cut scope: fix one class of issue, not all.',
    [GOAL_STATUS.ON_TRACK]:         'Document the pattern so others can copy it without asking.',
    [GOAL_STATUS.COMPLETED]:        'Propose a team-wide tech-debt SLO so progress survives a calm period.',
  },
  Frontend: {
    [GOAL_STATUS.OFF_TRACK]:        'Run axe/Lighthouse on one flow tomorrow; fix the top two findings before end of week.',
    [GOAL_STATUS.NEEDS_ATTENTION]:  'Draft 1 reusable primitive per week until your contribution target is met.',
    [GOAL_STATUS.ON_TRACK]:         'Teach the pattern in a 15-minute design-system huddle.',
    [GOAL_STATUS.COMPLETED]:        'Great — champion adoption with a migration doc for the older components.',
  },
  Reliability: {
    [GOAL_STATUS.OFF_TRACK]:        'Review last month’s incidents; pick one mitigation you can ship this week.',
    [GOAL_STATUS.NEEDS_ATTENTION]:  'Write (or update) the runbook for the service that paged you most recently.',
    [GOAL_STATUS.ON_TRACK]:         'Run a game-day — calm systems are best tested before they break.',
    [GOAL_STATUS.COMPLETED]:        'Codify your reliability practices into a checklist others can use.',
  },
  Team: {
    [GOAL_STATUS.OFF_TRACK]:        'Schedule your next mentoring slot right now — protected time compounds.',
    [GOAL_STATUS.NEEDS_ATTENTION]:  'Pick one focused PR to review in depth this week and leave substantive comments.',
    [GOAL_STATUS.ON_TRACK]:         'Share a short note on what you’ve learned from mentoring so far.',
    [GOAL_STATUS.COMPLETED]:        'Offer to be a sponsor (not just a mentor) for your next mentee.',
  },
  Certification: {
    [GOAL_STATUS.OFF_TRACK]:        'Book the exam date now — deadlines do the work accountability alone won’t.',
    [GOAL_STATUS.NEEDS_ATTENTION]:  'Carve out a weekly 2-hour study slot and protect it.',
    [GOAL_STATUS.ON_TRACK]:         'Do one full practice test before exam week to catch blind spots.',
    [GOAL_STATUS.COMPLETED]:        'Share the study path with the next person planning to certify.',
  },
  Leadership: {
    [GOAL_STATUS.OFF_TRACK]:        'Drop in on the team with the most at-risk goals this week — your time is the signal.',
    [GOAL_STATUS.NEEDS_ATTENTION]:  'Review your 1:1 cadence — the missing conversations are usually where the drift started.',
    [GOAL_STATUS.ON_TRACK]:         'Keep the rhythm; note the patterns that are working and share with the other managers.',
    [GOAL_STATUS.COMPLETED]:        'Codify what worked into a one-page leadership playbook for the org.',
  },
  People: {
    [GOAL_STATUS.OFF_TRACK]:        'Reinstate weekly 1:1s with any report you’ve skipped this month.',
    [GOAL_STATUS.NEEDS_ATTENTION]:  'Ask each report to bring one growth topic to the next 1:1.',
    [GOAL_STATUS.ON_TRACK]:         'Write a short growth-plan template so it’s consistent across reports.',
    [GOAL_STATUS.COMPLETED]:        'Review exit interviews from the last year to spot systemic patterns.',
  },
  Hiring: {
    [GOAL_STATUS.OFF_TRACK]:        'Ask talent to escalate the oldest open role — get the bottleneck visible.',
    [GOAL_STATUS.NEEDS_ATTENTION]:  'Take two interview slots this week so pipelines don’t stall on your calendar.',
    [GOAL_STATUS.ON_TRACK]:         'Refine the top-of-funnel message — small clarity gains unlock big pipelines.',
    [GOAL_STATUS.COMPLETED]:        'Write the first 30/60/90 for the role you just closed.',
  },
  Outcome: {
    [GOAL_STATUS.OFF_TRACK]:        'Convene an outcomes review this week; identify the single biggest blocker and name an owner.',
    [GOAL_STATUS.NEEDS_ATTENTION]:  'Tighten the weekly check-in loop — outcomes drift when the review cadence slips.',
    [GOAL_STATUS.ON_TRACK]:         'Lock in the signal: set a lagging metric and share it weekly with peers.',
    [GOAL_STATUS.COMPLETED]:        'Share the playbook — org outcomes compound when others can copy what worked.',
  },
  Efficiency: {
    [GOAL_STATUS.OFF_TRACK]:        'Ask finance for the top-3 cost lines this week; small prompts often trigger big cleanups.',
    [GOAL_STATUS.NEEDS_ATTENTION]:  'Name one engineer as a budget steward for the quarter.',
    [GOAL_STATUS.ON_TRACK]:         'Run a monthly cost-review meeting so drift is caught early.',
    [GOAL_STATUS.COMPLETED]:        'Codify the savings pattern into a one-pager others can reuse.',
  },
  Culture: {
    [GOAL_STATUS.OFF_TRACK]:        'Read the last pulse survey with your directs and publicly commit to one response.',
    [GOAL_STATUS.NEEDS_ATTENTION]:  'Run a 15-minute listening round in your next team meeting.',
    [GOAL_STATUS.ON_TRACK]:         'Acknowledge the work that’s lifting engagement — people repeat what gets noticed.',
    [GOAL_STATUS.COMPLETED]:        'Share what moved the needle with peer leaders so the org compounds.',
  },
};

const FALLBACK = {
  [GOAL_STATUS.OFF_TRACK]:       'Pick the smallest next step that moves this above 50% and ship it this week.',
  [GOAL_STATUS.NEEDS_ATTENTION]: 'Block 90 minutes this week for focused progress; name the deliverable upfront.',
  [GOAL_STATUS.ON_TRACK]:        'Hold the line — document the approach so the next push is cheaper.',
  [GOAL_STATUS.COMPLETED]:       'Capture the lessons in writing; share them so the pattern compounds.',
};

export const suggestAction = (goal) => {
  const cat = goal.category || (goal.customCategory || '');
  const status = goal.status;
  return ACTIONS_BY_CATEGORY[cat]?.[status] ?? FALLBACK[status] ?? 'Keep going — small, regular progress beats heroics.';
};

// Suggested manager feedback snippets for an employee's goal, used in the
// manager composer to keep feedback concrete rather than generic.
export const suggestManagerFeedback = (goal) => {
  const title = goal.title || 'this goal';
  const pct = Math.round(goal.completion || 0);
  const status = goal.status;
  if (status === GOAL_STATUS.OFF_TRACK) {
    return `On "${title}": we’re at ${pct}% with the clock ticking. Let’s pick the smallest shippable slice today and re-scope the rest — I can help unblock.`;
  }
  if (status === GOAL_STATUS.NEEDS_ATTENTION) {
    return `On "${title}": steady progress at ${pct}%. What’s the one thing you’d change about how you’re working on it to get to on-track?`;
  }
  if (status === GOAL_STATUS.ON_TRACK) {
    return `On "${title}": ${pct}% — well sequenced. Document the approach so the next person doing this can copy the pattern.`;
  }
  if (status === GOAL_STATUS.COMPLETED) {
    return `On "${title}": closed at ${pct}% — strong work. Note one thing you’d do differently next time, and share the lesson.`;
  }
  return `On "${title}": let’s review the plan in our next 1:1 and align on what "done" looks like.`;
};
