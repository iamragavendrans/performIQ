import {
  Award, TrendingUp, TrendingDown, Plus, Activity,
  AlertCircle, Zap, Compass, Minus, ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { PageHeader } from '../../components/layout/Shell';
import { Button, Col, Grid, ProgressBar, Row } from '../../components/ui';
import InsightCard from '../../components/ui/InsightCard';
import { GOAL_STATUS, PROMOTION, statusColor } from '../../lib/compute';
import { formatDate, daysLeft } from '../../lib/format';
import {
  bandTone, computeAlignment, computeForecast, computeMomentum,
  computeRisks, nextBestActions, promotionHowToImprove,
} from '../../lib/insights';

export default function EmployeeDashboard() {
  const { user, goalsFor, computeRatingFor, eligibilityFor, state, setPage } = useApp();
  const { C } = useTheme();
  const goals = goalsFor(user.id);
  const activeGoals = goals.filter((g) => !g.selfProposed || g.proposalStatus === 'APPROVED');
  const rating = computeRatingFor(user.id);
  const eligibility = eligibilityFor(user.id);
  const lifeEvents = state.lifeEvents[user.id] || [];
  const managerGoals = user.managerId ? goalsFor(user.managerId) : [];

  const forecast  = computeForecast(activeGoals);
  const momentum  = computeMomentum(activeGoals);
  const risks     = computeRisks(activeGoals);
  const alignment = computeAlignment(activeGoals, managerGoals);
  const actions   = nextBestActions(activeGoals);
  const howTo     = promotionHowToImprove(eligibility);

  const eligibilityColor = eligibility.tier === PROMOTION.ELIGIBLE ? C.success : eligibility.tier === PROMOTION.APPROACHING ? C.warning : C.textMuted;
  const period = state.periods.find((p) => p.isActive);

  // Urgency-sorted upcoming goals: by daysLeft asc, completion asc.
  const upcoming = [...activeGoals]
    .filter((g) => g.status !== GOAL_STATUS.COMPLETED)
    .map((g) => ({ ...g, dLeft: daysLeft(g.dueDate) }))
    .sort((a, b) => a.dLeft - b.dLeft || a.completion - b.completion)
    .slice(0, 4);

  const MomentumIcon = momentum.direction === 'up' ? TrendingUp : momentum.direction === 'down' ? TrendingDown : Minus;
  const momentumTone = momentum.direction === 'up' ? C.success : momentum.direction === 'down' ? C.danger : C.textMuted;
  const riskTone = risks.length && risks[0].severity === 'high' ? C.danger : risks.length ? C.warning : C.success;

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user.name.split(' ')[0]}`}
        subtitle={`Your ${period?.name} — data-driven view of trajectory, risks and next moves.`}
      />

      {/* Row 1: 5 insight cards */}
      <Grid minWidth={260} style={{ marginBottom: 24 }}>
        <InsightCard
          label="Rating Forecast"
          icon={Award}
          tone={bandTone(forecast.band, C)}
          primary={forecast.band}
          secondary={`Projected ${forecast.adjusted.toFixed(1)} by period end`}
          detail={forecast.driver
            ? `Primary driver: ${forecast.driver.title} (${forecast.driver.weight}% weight, ${forecast.driver.completion}% complete)`
            : 'Add at least one goal update to get a trajectory.'}
          action={<Button size="sm" variant="outline" onClick={() => setPage('my-rating')}>See breakdown</Button>}
        />

        <InsightCard
          label="Next Best Action"
          icon={Zap}
          tone={C.accent}
          primary={actions[0] ? (actions[0].goal.title.length > 28 ? actions[0].goal.title.slice(0, 26) + '…' : actions[0].goal.title) : 'Nothing pressing'}
          secondary={actions[0] ? `+${actions[0].ratingGainIfDone.toFixed(1)} rating points if completed` : 'All goals are closed or at 100%.'}
          detail={actions[0]?.recommendation.replace('&rsquo;', '’')}
          action={<Button size="sm" variant="outline" onClick={() => setPage('my-goals')}>Go to goals</Button>}
        />

        <InsightCard
          label="Momentum"
          icon={MomentumIcon}
          tone={momentumTone}
          primary={momentum.points > 0 ? `+${momentum.points} pts` : `${momentum.points} pts`}
          secondary={momentum.phrase}
          detail={momentum.goalsMoved > 0
            ? `${momentum.goalsMoved} goal${momentum.goalsMoved === 1 ? '' : 's'} moved in the last 14 days.`
            : 'No updates logged in the last 14 days — log progress to refresh the signal.'}
        />

        <InsightCard
          label="Risk Alerts"
          icon={AlertCircle}
          tone={riskTone}
          primary={risks.length === 0 ? 'None' : `${risks.length} risk${risks.length === 1 ? '' : 's'}`}
          secondary={risks.length === 0 ? 'Everything on a trajectory to land.' : (risks[0] ? `Most urgent: ${risks[0].goal.title}` : '')}
          detail={risks[0]?.message}
          action={risks.length > 0
            ? <Button size="sm" variant="outline" onClick={() => setPage('my-goals', { filter: GOAL_STATUS.OFF_TRACK })}>Open at-risk</Button>
            : null}
        />

        <InsightCard
          label="Manager Alignment"
          icon={Compass}
          tone={alignment.score === null ? C.textMuted : alignment.score >= 80 ? C.success : alignment.score >= 50 ? C.warning : C.danger}
          primary={alignment.score === null ? '—' : `${alignment.score}%`}
          secondary={alignment.score === null
            ? 'No manager goals on file.'
            : `${alignment.covered} of ${alignment.total} top priorities covered`}
          detail={alignment.gaps.length > 0
            ? `Gap: ${alignment.gaps[0]}${alignment.gaps.length > 1 ? ` and ${alignment.gaps.length - 1} more` : ''}`
            : 'You&rsquo;re tracking the things your manager weighs highest.'}
        />
      </Grid>

      {/* Row 2: Next Best Actions (list) + Promotion Readiness */}
      <Grid minWidth={360} style={{ marginBottom: 24 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <Row style={{ justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ color: C.text, fontSize: 15 }}>What will move your rating most</h3>
            <Button variant="ghost" size="sm" onClick={() => setPage('ai-feedback')}>See analysis</Button>
          </Row>
          {actions.length === 0 && <div style={{ color: C.textMuted, fontSize: 13 }}>Every active goal is at 100% — great work.</div>}
          <Col gap={12}>
            {actions.map((a, i) => (
              <div key={a.goal.id} style={{ paddingLeft: 30, position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0,
                  width: 22, height: 22, borderRadius: 11,
                  background: i === 0 ? C.accent : C.surface,
                  color: i === 0 ? '#fff' : C.textMuted,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800,
                }}>{i + 1}</div>
                <Row style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{a.goal.title}</div>
                  <div style={{ color: C.success, fontSize: 12, fontWeight: 700 }}>+{a.ratingGainIfDone.toFixed(1)} pts</div>
                </Row>
                <div style={{ color: C.textMuted, fontSize: 12 }}>{a.recommendation.replace('&rsquo;', '’')}</div>
              </div>
            ))}
          </Col>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <Row style={{ justifyContent: 'space-between', marginBottom: 10 }}>
            <h3 style={{ color: C.text, fontSize: 15 }}>Promotion readiness</h3>
            <span style={{
              padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
              color: eligibilityColor, background: eligibilityColor + '22',
            }}>{eligibility.tier.replace('_', ' ')}</span>
          </Row>
          <Col gap={8}>
            <Row style={{ justifyContent: 'space-between', fontSize: 12, color: C.textMuted }}>
              <span>Composite readiness</span>
              <span style={{ color: eligibilityColor, fontWeight: 700 }}>{eligibility.score}/100</span>
            </Row>
            <div style={{ height: 10, background: C.surface, borderRadius: 999, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${eligibility.score}%`,
                background: `linear-gradient(90deg, ${eligibilityColor}, ${eligibilityColor}cc)`,
                transition: 'width 600ms ease',
              }} />
            </div>
          </Col>
          {howTo.length > 0 ? (
            <div style={{ marginTop: 14, padding: 12, background: C.surface, borderRadius: 10 }}>
              <div style={{ color: C.text, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>How to improve</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: C.textMuted, fontSize: 12, lineHeight: 1.6 }}>
                {howTo.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
              <div style={{ marginTop: 10 }}>
                <Button
                  size="sm" variant="outline" icon={Plus}
                  onClick={() => setPage('my-goals')}
                >
                  {eligibility.initiative ? 'Open My Goals' : 'Self-propose a stretch goal'}
                </Button>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 14, padding: 12, background: C.successDim, borderRadius: 10, color: C.text, fontSize: 12 }}>
              You&rsquo;re hitting every readiness signal. Hold the line.
            </div>
          )}
        </div>
      </Grid>

      {/* Row 3: Upcoming goals (urgency-sorted) + Life events */}
      <Grid minWidth={360} style={{ marginBottom: 16 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <Row style={{ justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ color: C.text, fontSize: 15 }}>Upcoming by urgency</h3>
            <Button variant="ghost" size="sm" onClick={() => setPage('my-goals')}>View all</Button>
          </Row>
          {upcoming.length === 0 && (
            <div style={{ color: C.textMuted, fontSize: 13 }}>Everything in the current period is closed.</div>
          )}
          <Col gap={14}>
            {upcoming.map((g) => {
              const urgent = g.dLeft < 0 || (g.dLeft <= 7 && g.completion < 75);
              const dueColor = urgent ? C.danger : g.dLeft <= 14 ? C.warning : C.textMuted;
              return (
                <div key={g.id}>
                  <Row style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ fontSize: 13, color: C.text, fontWeight: 600, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.title}</div>
                    <div style={{ fontSize: 11, color: dueColor, fontWeight: 700, flexShrink: 0, marginLeft: 10 }}>
                      {g.dLeft < 0 ? `${Math.abs(g.dLeft)}d overdue` : g.dLeft === 0 ? 'Due today' : `${g.dLeft}d left`}
                    </div>
                  </Row>
                  <ProgressBar value={g.completion} color={statusColor(g.status, C)} />
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>
                    {g.completion}% · Due {formatDate(g.dueDate)}
                  </div>
                </div>
              );
            })}
          </Col>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <Row style={{ justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ color: C.text, fontSize: 15 }}>Life events</h3>
            <Button variant="ghost" size="sm" onClick={() => setPage('life-events')}>Manage</Button>
          </Row>
          {lifeEvents.length === 0 ? (
            <div style={{ padding: 14, background: C.surface, borderRadius: 10, color: C.textMuted, fontSize: 13, lineHeight: 1.5 }}>
              No life events recorded. Add one if something outside work impacted this cycle — approved events become a small empathy-aware uplift on your rating.
              <div style={{ marginTop: 10 }}>
                <Button size="sm" variant="outline" icon={Plus} onClick={() => setPage('life-events')}>Record event</Button>
              </div>
            </div>
          ) : (
            <Col gap={8}>
              {lifeEvents.slice(0, 3).map((e) => (
                <Row key={e.id} style={{ justifyContent: 'space-between', fontSize: 13 }}>
                  <div style={{ color: C.text }}>{e.type} — <span style={{ color: C.textMuted }}>{e.desc}</span></div>
                  <span style={{
                    padding: '3px 10px', borderRadius: 999, fontSize: 10, fontWeight: 700,
                    color: e.status === 'APPROVED' ? C.success : C.warning,
                    background: e.status === 'APPROVED' ? C.successDim : C.warningDim,
                  }}>{e.status}</span>
                </Row>
              ))}
            </Col>
          )}
        </div>
      </Grid>

      {rating.upliftPoints > 0.05 && (
        <div style={{
          background: C.card, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.cyan}`,
          borderRadius: 14, padding: '14px 18px', marginTop: 8,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <Activity size={18} color={C.cyan} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>
              Empathy uplift applied — +{rating.upliftPoints.toFixed(1)} points
            </div>
            <div style={{ color: C.textMuted, fontSize: 12, marginTop: 2 }}>
              Raw {rating.raw.toFixed(1)} <ArrowRight size={10} style={{ display: 'inline', margin: '0 4px' }} /> Adjusted {rating.adjusted.toFixed(1)} from {rating.approvedDays} approved life-event days.
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setPage('my-rating')}>Explain</Button>
        </div>
      )}
    </>
  );
}
