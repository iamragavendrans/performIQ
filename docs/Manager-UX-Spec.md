# Manager Experience — UX Specification

## 1. System Framing

- One unified performance system, two perspectives: **Self** (employee) and **Team** (manager).
- Manager view inherits all employee components, terminology, and interaction patterns.
- Only differentiator: **data scope** — individual vs. team-aggregated.

---

## 2. Design System Alignment

### 2.1 Card Structure (Universal)

- **Title** — with subtle border/accent
- **Primary metric** — dominant, single focal value
- **Supporting context** — trend, comparison, or breakdown
- **Optional action** — single CTA when applicable

### 2.2 UI Rules

- No nested cards.
- Spacing replaces heavy borders.
- Default to collapsed states; expand on intent.
- Progress bars replace status pills.
- Tooltip on hover for deeper insight.
- Title border/accent applied uniformly.
- Light and dark mode: equal legibility, consistent color meaning, strong contrast.

---

## 3. Manager Sections (Mirror of Employee Spec)

Each section below has a 1:1 employee equivalent. Structure, naming, and logic are identical; scope shifts from self to team.

### 3.1 Team Rating Forecast

- **Primary metric:** Predicted team rating distribution (cycle-end).
- **Supporting context:** Delta vs. last cycle, confidence band.
- **Why:** Drivers behind forecast (goal completion, momentum, risk count).
- **Recommended action:** Calibration review, 1:1 prompts on at-risk reports.
- **Tooltip:** Per-segment breakdown (Exceeds / Meets / Below).

### 3.2 Team Momentum

- **Primary metric:** Aggregate momentum index.
- **Supporting context:** Trend line (4-cycle), top movers (up/down).
- **Why:** Goal velocity, check-in cadence, feedback frequency.
- **Recommended action:** Recognize top movers, intervene with decliners.

### 3.3 Team Risk Alerts

- **Primary metric:** Count of at-risk reports.
- **Supporting context:** Severity tiers, change vs. last week.
- **Why:** Stalled goals, missed check-ins, declining ratings, low engagement.
- **Recommended action:** Inline “Schedule 1:1” / “Review goals” per report.
- **Tooltip:** Risk reasoning per individual.

### 3.4 Team Next Best Actions

- **Primary metric:** Prioritized action queue.
- **Supporting context:** Affected report, urgency, expected impact.
- **Why:** Linked signal (risk, momentum, goal state).
- **Recommended action:** One-tap execute (schedule, nudge, review).

### 3.5 Team Goals Overview

- **Primary metric:** Aggregate goal completion %.
- **Supporting context:** On-track / at-risk / off-track split (progress bars, not pills).
- **Why:** Weight-adjusted contribution to team rating.
- **Recommended action:** Drill into off-track goals, reassign or rescope.

### 3.6 Team Radar Chart

- Same structure as employee radar.
- **Hover tooltip:**
  - Goal name
  - Completion %
  - Weight
  - Contribution to rating
- Status labels removed from chart surface.
- Scope toggle: team-aggregate ↔ per-report.

### 3.7 Team Feedback Pulse

- **Primary metric:** Feedback volume + sentiment trend.
- **Supporting context:** Given vs. received ratio across team.
- **Why:** Recognition gaps, stale relationships.
- **Recommended action:** Prompt feedback for under-recognized reports.

### 3.8 Team Check-in Health

- **Primary metric:** Check-in completion rate.
- **Supporting context:** Overdue count, avg. cadence.
- **Why:** Cadence breakdown per report.
- **Recommended action:** Bulk nudge, reschedule overdue.

---

## 4. Predictive Layer (Applied Across All Sections)

- **Forecasts:** Rating, goal completion, momentum trajectory.
- **Risk signals:** Stalled goals, missed check-ins, sentiment decline, rating drift.
- **Momentum/trend:** Directional indicator on every primary metric.
- Every insight surfaces **why** + **recommended action**.

---

## 5. Interaction Patterns

- **Hover** → tooltip with deeper insight (radar, charts, metrics).
- **Click** → drill from team aggregate → individual report → goal-level.
- **Inline actions** → execute from card without navigation.
- **Collapsed by default** → expand on demand to reduce cognitive load.

---

## 6. Consistency Checklist

- [ ] Every employee component has a manager equivalent.
- [ ] Naming matches employee spec (prefixed with “Team” where scope differs).
- [ ] Card structure uniform across both views.
- [ ] Title border/accent applied to all cards.
- [ ] Tooltips present on all data-dense visualizations.
- [ ] Progress bars used in place of status pills.
- [ ] Radar chart status labels removed; tooltip carries detail.
- [ ] Light and dark mode verified for contrast and color consistency.
- [ ] Every insight paired with “why” and “recommended action.”
