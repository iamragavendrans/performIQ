import { useEffect, useMemo, useState } from 'react';
import {
  Brain, TrendingUp, TrendingDown, Target, AlertCircle, RefreshCw, Check,
  Compass, Star, Activity, ArrowRight, Minus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { PageHeader } from '../../components/layout/Shell';
import { Card, Col, Grid, Row, Button } from '../../components/ui';
import { GOAL_STATUS } from '../../lib/compute';
import { buildGoalColorMap } from '../../lib/colors';
import {
  bandTone, computeAlignment, computeForecast, computeMomentum, computeRisks,
  nextBestActions, ratingBand,
} from '../../lib/insights';
import { daysLeft } from '../../lib/format';

const STEPS = [
  { label: 'Reading your goal updates log…',              at: 0 },
  { label: 'Weighting goals by leverage and remaining %…', at: 320 },
  { label: 'Cross-checking your manager&rsquo;s priorities…',  at: 640 },
  { label: 'Forecasting trajectory and ranking moves…',    at: 960 },
];
const REVEAL_AT = 1250;

export default function AIFeedback() {
  const { user, goalsFor, findUser, state, setPage, computeRatingFor } = useApp();
  const { C } = useTheme();
  const goals = useMemo(
    () => goalsFor(user.id).filter((g) => !g.selfProposed || g.proposalStatus === 'APPROVED'),
    [goalsFor, user.id]
  );
  const rating = computeRatingFor(user.id);
  const currentBand = ratingBand(rating.adjusted);
  const colorMap = useMemo(() => buildGoalColorMap(goals), [goals]);
  const manager = findUser(user.managerId);
  const managerGoals = user.managerId ? goalsFor(user.managerId) : [];
  const receivedFeedback = (state.feedback || [])
    .filter((f) => f.toId === user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const [brewing, setBrewing] = useState(true);
  const [stepIdx, setStepIdx] = useState(0);
  const [runKey, setRunKey] = useState(0);

  useEffect(() => {
    setBrewing(true); setStepIdx(0);
    const timers = STEPS.map((s, i) => setTimeout(() => setStepIdx(i + 1), s.at + 220));
    const reveal = setTimeout(() => setBrewing(false), REVEAL_AT);
    return () => { timers.forEach(clearTimeout); clearTimeout(reveal); };
  }, [runKey, user.id]);

  // Derived insights ---------------------------------------------------------
  const actions   = nextBestActions(goals, 3);
  const alignment = computeAlignment(goals, managerGoals);
  const forecast  = computeForecast(goals);
  const momentum  = computeMomentum(goals);
  const risks     = computeRisks(goals);

  // Strengths: completed or ≥85% — show the *contribution* (impact) not just %.
  const strengths = goals
    .filter((g) => g.status === GOAL_STATUS.COMPLETED || g.completion >= 85)
    .map((g) => ({ g, contribution: ((g.completion || 0) * (g.weight || 0)) / 100 }))
    .sort((a, b) => b.contribution - a.contribution);

  // Focus shift: highest weight + low remaining (mostly already done) is a
  // candidate for trimming — that weight could move to a more impactful goal.
  const candidate = goals
    .filter((g) => g.weight >= 20 && g.completion >= 80)
    .sort((a, b) => b.weight - a.weight)[0];
  const targetForShift = goals
    .filter((g) => g.completion < 70 && g !== candidate)
    .sort((a, b) => (b.weight * (100 - b.completion)) - (a.weight * (100 - a.completion)))[0];

  // Trajectory phrase: compare current adjusted vs forecast — describe the
  // *gap* between today and the projection so "Projected 100" can't be read
  // as the current state.
  const projGain = forecast.adjusted - rating.adjusted;
  const trajPhrase =
    forecast.adjusted >= 90 && projGain >= 5
      ? `If you keep this pace, you'll lift your rating from ${rating.adjusted.toFixed(1)} today to ${forecast.adjusted.toFixed(1)} — Exceeds Expectations.`
    : forecast.adjusted >= 90
      ? 'Holding above the Exceeds Expectations line — keep shipping.'
    : forecast.adjusted >= 75 && projGain >= 5
      ? `Projected to climb from ${rating.adjusted.toFixed(1)} to ${forecast.adjusted.toFixed(1)} — Meets Expectations.`
    : forecast.adjusted >= 75
      ? 'Holding the Meets Expectations line — protect the weekly cadence.'
    : forecast.adjusted >= 60
      ? `Behind expected pace — projecting ${forecast.adjusted.toFixed(1)} vs the 75 needed to meet.`
    : 'Significantly off pace — pick one goal and rebuild momentum this week.';

  return (
    <>
      <PageHeader
        title="AI Feedback"
        subtitle="Predictive insights derived live from your goals, updates and your manager&rsquo;s priorities."
        actions={
          <Button icon={RefreshCw} variant="outline" disabled={brewing} onClick={() => setRunKey((k) => k + 1)}>
            Re-run analysis
          </Button>
        }
      />

      {brewing ? <BrewingPanel C={C} stepIdx={stepIdx} /> : (
        <div style={{ animation: 'fadeIn 260ms ease' }}>
          {/* Trajectory summary banner */}
          <Card hoverable={false} style={{ marginBottom: 20, borderLeft: `4px solid ${bandTone(forecast.band, C)}` }}>
            <Row gap={14} style={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ background: bandTone(forecast.band, C) + '22', padding: 10, borderRadius: 10 }}>
                <Activity size={20} color={bandTone(forecast.band, C)} />
              </div>
              <Col gap={4} style={{ flex: 1, minWidth: 260 }}>
                <div style={{ color: C.textSub, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>
                  TRAJECTORY SUMMARY
                </div>
                <Row gap={10} style={{ flexWrap: 'wrap', alignItems: 'baseline' }}>
                  <span style={{ color: C.text, fontSize: 15, fontWeight: 700 }}>
                    Currently {rating.adjusted.toFixed(1)}
                  </span>
                  <span style={{ color: bandTone(currentBand, C), fontSize: 11, fontWeight: 700 }}>
                    {currentBand}
                  </span>
                  <span style={{ color: C.textSub, fontSize: 12 }}>→</span>
                  <span style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>
                    Projected {forecast.adjusted.toFixed(1)} by period end
                  </span>
                  <span style={{ color: bandTone(forecast.band, C), fontSize: 11, fontWeight: 700 }}>
                    {forecast.band}
                  </span>
                </Row>
                <div style={{ color: C.textMuted, fontSize: 12 }}>{trajPhrase}</div>
              </Col>
              <MomentumPill momentum={momentum} C={C} />
            </Row>
          </Card>

          {/* Top focus areas (with priority labels + impact) + Manager alignment */}
          <Grid minWidth={320} style={{ marginBottom: 20 }}>
            <Card hoverable={false}>
              <Row gap={8} style={{ marginBottom: 4 }}>
                <Brain size={18} color={C.accent} />
                <h3 style={{ color: C.text, fontSize: 16 }}>What will move your rating most</h3>
              </Row>
              <p style={{ color: C.textMuted, fontSize: 12, marginBottom: 14 }}>
                Each item below shows the rating points you&rsquo;d gain if you closed that goal at 100%.
              </p>
              <Col gap={14}>
                {actions.length === 0 && (
                  <div style={{ color: C.textMuted, fontSize: 13 }}>
                    Every goal is at 100% — nothing to optimise. Consider self-proposing a stretch goal.
                  </div>
                )}
                {actions.map((a, i) => {
                  const color = colorMap[a.goal.id] || C.accent;
                  const priority =
                    i === 0 ? '#1 Highest impact' :
                    i === 1 ? '#2 Secondary focus' :
                              '#3 Worth a push';
                  return (
                    <div key={a.goal.id} style={{
                      borderLeft: `3px solid ${color}`,
                      paddingLeft: 12,
                    }}>
                      <Row style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{
                          color, fontSize: 10, fontWeight: 800, letterSpacing: 0.6,
                        }}>{priority}</span>
                        <span style={{ color: C.success, fontSize: 12, fontWeight: 700 }}>
                          +{a.ratingGainIfDone.toFixed(1)} pts if closed
                        </span>
                      </Row>
                      <div style={{ color: C.text, fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                        {a.goal.title}
                      </div>
                      <div style={{ color: C.textMuted, fontSize: 12 }}>
                        {a.goal.completion}% done · {a.goal.weight}% weight · {Math.max(0, daysLeft(a.goal.dueDate))} days left
                      </div>
                      <div style={{
                        marginTop: 8, color: C.text, fontSize: 12, lineHeight: 1.55,
                        background: C.surface, padding: '8px 10px', borderRadius: 8,
                      }}>
                        {a.recommendation.replace(/&rsquo;/g, '’')}
                      </div>
                    </div>
                  );
                })}
              </Col>
            </Card>

            <Card hoverable={false}>
              <Row gap={8} style={{ marginBottom: 12 }}>
                <Compass size={18} color={C.cyan} />
                <h3 style={{ color: C.text, fontSize: 16 }}>Manager alignment</h3>
              </Row>
              {alignment.score === null ? (
                <div style={{ color: C.textMuted, fontSize: 13 }}>
                  Your manager doesn&rsquo;t have goals on file yet — alignment will show once they do.
                </div>
              ) : (
                <Col gap={12}>
                  <div style={{
                    padding: 12, background: C.surface, borderRadius: 10,
                    border: `1px solid ${C.border}`,
                  }}>
                    <div style={{ color: C.text, fontSize: 22, fontWeight: 800 }}>
                      {alignment.score}%
                    </div>
                    <div style={{ color: C.textMuted, fontSize: 12, marginTop: 2 }}>
                      You&rsquo;re focusing on <b style={{ color: C.text }}>{alignment.covered} of {alignment.total}</b> of {manager?.name?.split(' ')[0] || 'your manager'}&rsquo;s top priorities.
                    </div>
                  </div>
                  {alignment.gaps.length > 0 && (
                    <div>
                      <div style={{ color: C.warning, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>
                        MISSING FOCUS
                      </div>
                      <Col gap={6}>
                        {alignment.gaps.slice(0, 3).map((g, i) => (
                          <Row key={i} gap={8} style={{ fontSize: 12, color: C.textMuted }}>
                            <Target size={12} color={C.warning} /> {g}
                          </Row>
                        ))}
                      </Col>
                    </div>
                  )}
                </Col>
              )}

              {/* Manager-written feedback inbox */}
              {receivedFeedback.length > 0 && (
                <Col gap={10} style={{ marginTop: 18 }}>
                  <div style={{ color: C.textSub, fontSize: 11, fontWeight: 700, letterSpacing: 0.6 }}>
                    DIRECT FEEDBACK
                  </div>
                  {receivedFeedback.slice(0, 3).map((f) => {
                    const from = findUser(f.fromId);
                    const goal = goals.find((g) => g.id === f.goalId);
                    return (
                      <div key={f.id} style={{
                        padding: 10, background: C.surface, borderRadius: 10,
                        borderLeft: `3px solid ${C.cyan}`,
                      }}>
                        <Row style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                          <div style={{ color: C.text, fontSize: 12, fontWeight: 700 }}>{from?.name}</div>
                          <div style={{ color: C.textSub, fontSize: 11 }}>
                            {new Date(f.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </div>
                        </Row>
                        {goal && (
                          <div style={{ color: C.accent, fontSize: 11, marginBottom: 4 }}>On: {goal.title}</div>
                        )}
                        <div style={{ color: C.text, fontSize: 12, lineHeight: 1.55 }}>{f.text}</div>
                      </div>
                    );
                  })}
                </Col>
              )}
            </Card>
          </Grid>

          {/* Strengths (with impact) + Predictive risks */}
          <Grid minWidth={320} style={{ marginBottom: 20 }}>
            <Card hoverable={false}>
              <Row gap={8} style={{ marginBottom: 12 }}>
                <Star size={16} color={C.success} />
                <h3 style={{ color: C.success, fontSize: 15 }}>Strengths</h3>
              </Row>
              {strengths.length === 0 ? (
                <div style={{ color: C.textMuted, fontSize: 13 }}>
                  Nothing yet — push a goal above 85% and it&rsquo;ll show up here with its rating impact.
                </div>
              ) : (
                <Col gap={10}>
                  {strengths.map(({ g, contribution }) => {
                    const color = colorMap[g.id] || C.success;
                    return (
                      <div key={g.id} style={{
                        padding: '10px 12px', background: C.surface, borderRadius: 8,
                        borderLeft: `3px solid ${color}`,
                      }}>
                        <Row style={{ justifyContent: 'space-between', marginBottom: 2 }}>
                          <div style={{ color: C.text, fontSize: 13, fontWeight: 700 }}>{g.title}</div>
                          <div style={{ color: C.success, fontSize: 12, fontWeight: 700 }}>
                            +{contribution.toFixed(1)} pts
                          </div>
                        </Row>
                        <div style={{ color: C.textMuted, fontSize: 11 }}>
                          {g.completion}% complete on a {g.weight}% weight — this is a load-bearing win.
                        </div>
                      </div>
                    );
                  })}
                </Col>
              )}
            </Card>

            <Card hoverable={false}>
              <Row gap={8} style={{ marginBottom: 12 }}>
                <AlertCircle size={16} color={C.danger} />
                <h3 style={{ color: C.danger, fontSize: 15 }}>Predictive risks</h3>
              </Row>
              {risks.length === 0 ? (
                <div style={{ color: C.textMuted, fontSize: 13, lineHeight: 1.5 }}>
                  No immediate risks. Maintain your current pace to stay on track —
                  if any goal&rsquo;s pace drops below the line needed to land, you&rsquo;ll see it here.
                </div>
              ) : (
                <Col gap={10}>
                  {risks.slice(0, 4).map((r) => {
                    const color = colorMap[r.goal.id] || (r.severity === 'high' ? C.danger : C.warning);
                    return (
                      <div key={r.goal.id} style={{
                        padding: '10px 12px', background: C.surface, borderRadius: 8,
                        borderLeft: `3px solid ${color}`,
                      }}>
                        <Row style={{ justifyContent: 'space-between', marginBottom: 2 }}>
                          <div style={{ color: C.text, fontSize: 13, fontWeight: 700 }}>{r.goal.title}</div>
                          <div style={{
                            color: r.severity === 'high' ? C.danger : C.warning,
                            fontSize: 11, fontWeight: 700,
                          }}>
                            {r.severity === 'high' ? 'HIGH RISK' : 'WATCH'}
                          </div>
                        </Row>
                        <div style={{ color: C.textMuted, fontSize: 12 }}>{r.message}</div>
                      </div>
                    );
                  })}
                </Col>
              )}
            </Card>
          </Grid>

          {/* Focus shift suggestion */}
          {candidate && targetForShift && (
            <Card hoverable={false} style={{ borderLeft: `3px solid ${C.purple}` }}>
              <Row gap={12} style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ background: C.purpleDim, padding: 10, borderRadius: 10, flexShrink: 0 }}>
                  <ArrowRight size={18} color={C.purple} />
                </div>
                <Col gap={6} style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ color: C.textSub, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>
                    FOCUS SHIFT SUGGESTION
                  </div>
                  <div style={{ color: C.text, fontSize: 14, fontWeight: 700 }}>
                    Trim weight on &ldquo;{candidate.title}&rdquo; ({candidate.weight}%, {candidate.completion}% done)
                  </div>
                  <div style={{ color: C.textMuted, fontSize: 12, lineHeight: 1.55 }}>
                    It&rsquo;s mostly delivered. Shifting ~5% of its weight to &ldquo;{targetForShift.title}&rdquo;
                    ({targetForShift.completion}% done, {targetForShift.weight}% weight) would give your rating
                    a meaningful push — manager approval needed.
                  </div>
                </Col>
                <Button size="sm" variant="outline" onClick={() => setPage('my-goals')}>
                  Open My Goals
                </Button>
              </Row>
            </Card>
          )}
        </div>
      )}
    </>
  );
}

function MomentumPill({ momentum, C }) {
  const Icon = momentum.direction === 'up' ? TrendingUp
             : momentum.direction === 'down' ? TrendingDown
             : Minus;
  const color = momentum.direction === 'up' ? C.success
              : momentum.direction === 'down' ? C.danger
              : C.textSub;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 12px', borderRadius: 999,
      background: color + '22', color, fontSize: 12, fontWeight: 700,
      flexShrink: 0,
    }}>
      <Icon size={13} /> {momentum.phrase}
    </span>
  );
}

function BrewingPanel({ C, stepIdx }) {
  return (
    <div style={{ animation: 'fadeIn 180ms ease' }}>
      <Card hoverable={false} style={{ marginBottom: 20 }}>
        <Row gap={12} style={{ marginBottom: 14 }}>
          <div style={{ background: C.accentDim, padding: 12, borderRadius: 12 }}>
            <Brain size={22} color={C.accent} className="perfiq-brewing-step" />
          </div>
          <Col gap={4}>
            <div style={{ color: C.text, fontWeight: 700 }}>Analysing your performance profile</div>
            <div style={{ color: C.textMuted, fontSize: 12 }}>No model calls; signals are derived live from your goals and approvals.</div>
          </Col>
        </Row>
        <Col gap={10}>
          {STEPS.map((s, i) => {
            const done = i < stepIdx;
            const active = i === stepIdx;
            return (
              <Row key={i} gap={10} style={{ fontSize: 13, color: done ? C.text : active ? C.accent : C.textSub }}>
                <div style={{
                  width: 18, height: 18, borderRadius: 9, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: done ? C.success : active ? C.accentDim : C.surface,
                  border: `1px solid ${done ? C.success : active ? C.accent : C.border}`,
                }}>
                  {done
                    ? <Check size={11} color="#fff" />
                    : active
                      ? <div style={{ width: 6, height: 6, borderRadius: 3, background: C.accent, animation: 'pulseSoft 0.9s ease-in-out infinite' }} />
                      : null}
                </div>
                <span className={active ? 'perfiq-brewing-step' : ''}>{s.label.replace(/&rsquo;/g, '’')}</span>
              </Row>
            );
          })}
        </Col>
      </Card>

      <Grid minWidth={320} style={{ marginBottom: 20 }}>
        {[0, 1].map((i) => (
          <Card key={i} hoverable={false}>
            <div className="perfiq-skeleton" style={{ height: 16, width: '50%', marginBottom: 14 }} />
            <div className="perfiq-skeleton" style={{ height: 10, width: '90%', marginBottom: 8 }} />
            <div className="perfiq-skeleton" style={{ height: 10, width: '70%', marginBottom: 8 }} />
            <div className="perfiq-skeleton" style={{ height: 10, width: '85%' }} />
          </Card>
        ))}
      </Grid>
      <Grid minWidth={320}>
        {[0, 1].map((i) => (
          <Card key={i} hoverable={false}>
            <div className="perfiq-skeleton" style={{ height: 14, width: '35%', marginBottom: 12 }} />
            <div className="perfiq-skeleton" style={{ height: 10, width: '80%', marginBottom: 8 }} />
            <div className="perfiq-skeleton" style={{ height: 10, width: '60%' }} />
          </Card>
        ))}
      </Grid>
    </div>
  );
}
