import { useMemo } from 'react';
import {
  Award, TrendingUp, TrendingDown, Activity, AlertCircle,
  Zap, Users, Minus, ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { PageHeader } from '../../components/layout/Shell';
import { Avatar, Button, Col, Grid, ProgressBar, Row } from '../../components/ui';
import InsightCard from '../../components/ui/InsightCard';
import GoalsRadar from '../../components/ui/GoalsRadar';
import { healthColor, PROMOTION, teamHealth } from '../../lib/compute';
import { buildGoalColorMap } from '../../lib/colors';
import {
  bandTone, computeTeamForecast, computeTeamGoalsAggregate,
  computeTeamHealthDistribution, computeTeamMomentum, computeTeamRisks,
  teamNextBestActions,
} from '../../lib/insights';
import { ROLES } from '../../lib/roles';

export default function ManagerDashboard() {
  const { user, teamFor, goalsFor, computeRatingFor, eligibilityFor, state, setPage } = useApp();
  const { C } = useTheme();
  const team = teamFor(user.id);
  const isDirector = user.role === ROLES.DIRECTOR;

  const pendingApprovals = state.approvals.filter(
    (a) => a.managerId === user.id && a.status === 'PENDING' && !a.adminOnly
  ).length;
  const eligibleCount = team.filter((m) => eligibilityFor(m.id).tier === PROMOTION.ELIGIBLE).length;

  // Predictive layer — forecasts, momentum, risks, next best actions, health
  // distribution. Same shapes as the employee dashboard, only scope differs.
  const forecast   = useMemo(() => computeTeamForecast(team, goalsFor),                 [team, goalsFor]);
  const momentum   = useMemo(() => computeTeamMomentum(team, goalsFor),                 [team, goalsFor]);
  const risks      = useMemo(() => computeTeamRisks(team, goalsFor),                    [team, goalsFor]);
  const actions    = useMemo(() => teamNextBestActions(team, goalsFor),                 [team, goalsFor]);
  const teamGoals  = useMemo(() => computeTeamGoalsAggregate(team, goalsFor),           [team, goalsFor]);
  const distrib    = useMemo(() => computeTeamHealthDistribution(team, goalsFor, teamHealth), [team, goalsFor]);
  const colorMap   = useMemo(() => buildGoalColorMap(teamGoals),                        [teamGoals]);

  const MomentumIcon = momentum.direction === 'up' ? TrendingUp : momentum.direction === 'down' ? TrendingDown : Minus;
  const momentumTone = momentum.direction === 'up' ? C.success : momentum.direction === 'down' ? C.danger : C.textMuted;
  const riskTone = risks.length && risks[0].severity === 'high' ? C.danger : risks.length ? C.warning : C.success;

  const healthTone = distrib.critical > 0 ? C.danger : distrib.atRisk > 0 ? C.warning : C.success;
  const healthPrimary = distrib.total === 0
    ? '—'
    : `${distrib.healthy}/${distrib.total}`;

  const period = state.periods.find((p) => p.isActive);

  return (
    <>
      <PageHeader
        title={isDirector ? 'Director dashboard' : 'Manager dashboard'}
        subtitle={isDirector
          ? `Health of your managers and, transitively, their teams — ${period?.name || 'this period'}.`
          : `Your team’s ${period?.name || 'current period'} — trajectory, risks and next moves.`}
      />

      {/* Row 1: 5 insight cards (mirrors employee dashboard) */}
      <Grid minWidth={260} style={{ marginBottom: 24 }}>
        <InsightCard
          label="Team Rating Forecast"
          icon={Award}
          tone={bandTone(forecast.band, C)}
          primary={forecast.band}
          secondary={`Projected ${forecast.adjusted.toFixed(1)} avg by period end`}
          detail={forecast.driver
            ? `Biggest lever: ${forecast.driver.memberName} (${forecast.driver.adjusted.toFixed(1)} forecast${forecast.driver.goalTitle ? ` · ${forecast.driver.goalTitle}` : ''})`
            : 'Add team goal updates to get a trajectory.'}
          action={<Button size="sm" variant="outline" onClick={() => setPage('reports')}>See breakdown</Button>}
        />

        <InsightCard
          label="Next Best Action"
          icon={Zap}
          tone={C.accent}
          primary={actions[0]
            ? (actions[0].member.name.split(' ')[0] + ' · ' + (actions[0].goal.title.length > 18 ? actions[0].goal.title.slice(0, 16) + '…' : actions[0].goal.title))
            : 'Nothing pressing'}
          secondary={actions[0]
            ? `+${actions[0].ratingGainIfDone.toFixed(1)} rating points if completed`
            : 'All team goals are closed or at 100%.'}
          detail={actions[0]?.recommendation.replace('&rsquo;', '’')}
          action={<Button size="sm" variant="outline" onClick={() => setPage('my-team')}>Open team</Button>}
        />

        <InsightCard
          label="Team Momentum"
          icon={MomentumIcon}
          tone={momentumTone}
          primary={momentum.points > 0 ? `+${momentum.points} pts` : `${momentum.points} pts`}
          secondary={momentum.phrase}
          detail={momentum.topMover && momentum.topMover.momentum.points !== 0
            ? `Top mover: ${momentum.topMover.member.name} (${momentum.topMover.momentum.points >= 0 ? '+' : ''}${momentum.topMover.momentum.points} pts)`
            : 'No goal moved meaningfully in the last 14 days — nudge the team for updates.'}
        />

        <InsightCard
          label="Risk Alerts"
          icon={AlertCircle}
          tone={riskTone}
          primary={risks.length === 0 ? 'None' : `${risks.length} risk${risks.length === 1 ? '' : 's'}`}
          secondary={risks.length === 0
            ? 'Every team goal is on a trajectory to land.'
            : `Most urgent: ${risks[0].member.name} · ${risks[0].goal.title}`}
          detail={risks[0]?.message}
          action={risks.length > 0
            ? <Button size="sm" variant="outline" onClick={() => setPage('reports', { focus: risks[0].member.id })}>Open at-risk</Button>
            : null}
        />

        <InsightCard
          label="Team Health"
          icon={Users}
          tone={healthTone}
          primary={healthPrimary}
          secondary={distrib.total === 0
            ? 'No direct reports yet.'
            : `${distrib.healthy} healthy · ${distrib.atRisk} at risk · ${distrib.critical} critical`}
          detail={distrib.critical > 0
            ? `${distrib.critical} member${distrib.critical === 1 ? '' : 's'} need immediate attention.`
            : distrib.atRisk > 0
              ? `${distrib.atRisk} member${distrib.atRisk === 1 ? '' : 's'} drifting — schedule 1:1s.`
              : 'Whole team is tracking. Hold the line.'}
          action={<Button size="sm" variant="outline" onClick={() => setPage('my-team')}>Full view</Button>}
        />
      </Grid>

      {/* Row 2: Team next best actions list + Promotion-ready cohort */}
      <Grid minWidth={360} style={{ marginBottom: 24 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <Row style={{ justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ color: C.text, fontSize: 15 }}>What will move team rating most</h3>
            <Button variant="ghost" size="sm" onClick={() => setPage('reports')}>See analysis</Button>
          </Row>
          {actions.length === 0 && (
            <div style={{ color: C.textMuted, fontSize: 13 }}>Every active team goal is at 100% — great work.</div>
          )}
          <Col gap={12}>
            {actions.map((a, i) => (
              <div key={a.member.id + a.goal.id} style={{ paddingLeft: 30, position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0,
                  width: 22, height: 22, borderRadius: 11,
                  background: i === 0 ? C.accent : C.surface,
                  color: i === 0 ? '#fff' : C.textMuted,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800,
                }}>{i + 1}</div>
                <Row style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ color: C.text, fontSize: 13, fontWeight: 600, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {a.member.name} · {a.goal.title}
                  </div>
                  <div style={{ color: C.success, fontSize: 12, fontWeight: 700, flexShrink: 0, marginLeft: 10 }}>
                    +{a.ratingGainIfDone.toFixed(1)} pts
                  </div>
                </Row>
                <div style={{ color: C.textMuted, fontSize: 12 }}>{a.recommendation.replace('&rsquo;', '’')}</div>
              </div>
            ))}
          </Col>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <Row style={{ justifyContent: 'space-between', marginBottom: 10 }}>
            <h3 style={{ color: C.text, fontSize: 15 }}>Promotion-ready</h3>
            <Button variant="ghost" size="sm" onClick={() => setPage('promotions', { filter: 'ELIGIBLE' })}>Open promotions</Button>
          </Row>
          <Col gap={8}>
            <Row style={{ justifyContent: 'space-between', fontSize: 12, color: C.textMuted }}>
              <span>Eligible cohort</span>
              <span style={{ color: C.cyan, fontWeight: 700 }}>{eligibleCount}/{team.length || 0}</span>
            </Row>
            <ProgressBar value={team.length ? (eligibleCount / team.length) * 100 : 0} color={C.cyan} />
          </Col>
          <div style={{ marginTop: 14 }}>
            {pendingApprovals > 0 ? (
              <div style={{ padding: 12, background: C.warningDim, borderRadius: 10 }}>
                <div style={{ color: C.text, fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                  {pendingApprovals} pending approval{pendingApprovals === 1 ? '' : 's'}
                </div>
                <div style={{ color: C.textMuted, fontSize: 12, marginBottom: 10 }}>
                  Weight changes, self-proposed goals, and life events need your review.
                </div>
                <Button size="sm" variant="outline" onClick={() => setPage('approvals')}>Review now</Button>
              </div>
            ) : (
              <div style={{ padding: 12, background: C.successDim, borderRadius: 10, color: C.text, fontSize: 12 }}>
                Approvals queue is clear.
              </div>
            )}
          </div>
        </div>
      </Grid>

      {/* Row 3: Team goal portfolio (radar) + Team health list */}
      <Grid minWidth={360} style={{ marginBottom: 16 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <Row style={{ justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ color: C.text, fontSize: 15 }}>Team goal portfolio</h3>
            <Button variant="ghost" size="sm" onClick={() => setPage('goals-mgmt')}>Manage goals</Button>
          </Row>
          {teamGoals.length === 0 ? (
            <div style={{ color: C.textMuted, fontSize: 13 }}>No team goals yet.</div>
          ) : (
            <Row gap={20} style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ flex: '0 0 auto' }}>
                <GoalsRadar goals={teamGoals} colorMap={colorMap} size={260} />
              </div>
              <Col gap={8} style={{ flex: 1, minWidth: 200 }}>
                {teamGoals.slice(0, 6).map((g) => (
                  <Row key={g.id} gap={10} style={{ alignItems: 'center' }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: colorMap[g.id], flexShrink: 0 }} />
                    <Col gap={2} style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        color: C.text, fontSize: 12, fontWeight: 600,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{g.title}</div>
                      <div style={{ color: C.textMuted, fontSize: 11 }}>
                        Weight {g.weight}% · {g.completion}% complete · {g.count} member{g.count === 1 ? '' : 's'}
                      </div>
                    </Col>
                  </Row>
                ))}
              </Col>
            </Row>
          )}
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <Row style={{ justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ color: C.text, fontSize: 15 }}>Team by member</h3>
            <Button variant="ghost" size="sm" onClick={() => setPage('my-team')}>Full view</Button>
          </Row>
          {team.length === 0 ? (
            <div style={{ color: C.textMuted, fontSize: 13 }}>No direct reports yet.</div>
          ) : (
            <Col gap={12}>
              {team.map((m) => {
                const goals = goalsFor(m.id);
                const health = teamHealth(goals);
                const r = computeRatingFor(m.id);
                const elig = eligibilityFor(m.id);
                const tone = healthColor(health, C);
                return (
                  <div
                    key={m.id}
                    onClick={() => setPage('reports', { focus: m.id })}
                    style={{ cursor: 'pointer' }}
                  >
                    <Row gap={10} style={{ marginBottom: 6 }}>
                      <Avatar name={m.name} color={m.avatar} size={32} />
                      <Col gap={1} style={{ flex: 1, minWidth: 0 }}>
                        <Row style={{ justifyContent: 'space-between' }}>
                          <div style={{ color: C.text, fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
                          <div style={{ color: tone, fontSize: 11, fontWeight: 700 }}>{health}</div>
                        </Row>
                        <Row style={{ justifyContent: 'space-between' }}>
                          <div style={{ color: C.textMuted, fontSize: 11 }}>{m.title || m.role} · {goals.length} goals</div>
                          <div style={{ color: C.textMuted, fontSize: 11 }}>
                            {elig.tier === PROMOTION.ELIGIBLE ? 'Promo-ready · ' : ''}Rating {r.adjusted.toFixed(1)}
                          </div>
                        </Row>
                      </Col>
                    </Row>
                    <ProgressBar value={r.adjusted} color={tone} />
                  </div>
                );
              })}
            </Col>
          )}
        </div>
      </Grid>

      {/* Empathy uplift signal — applies when any direct report has approved life events */}
      {(() => {
        const totalUplift = team.reduce((s, m) => s + (computeRatingFor(m.id).upliftPoints || 0), 0);
        if (totalUplift <= 0.05) return null;
        const recipients = team.filter((m) => computeRatingFor(m.id).upliftPoints > 0.05).length;
        return (
          <div style={{
            background: C.card, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.cyan}`,
            borderRadius: 14, padding: '14px 18px', marginTop: 8,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <Activity size={18} color={C.cyan} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>
                Empathy uplift active — {recipients} member{recipients === 1 ? '' : 's'}
              </div>
              <div style={{ color: C.textMuted, fontSize: 12, marginTop: 2 }}>
                Approved life events have lifted team-wide adjusted ratings by +{totalUplift.toFixed(1)} pts cumulatively
                <ArrowRight size={10} style={{ display: 'inline', margin: '0 4px' }} />
                visible per-member in Reports.
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setPage('reports')}>Open reports</Button>
          </div>
        );
      })()}
    </>
  );
}
