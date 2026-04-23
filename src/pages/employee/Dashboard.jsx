import { Target, Award, Heart, TrendingUp, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { PageHeader } from '../../components/layout/Shell';
import { Card, Grid, ProgressBar, StatCard, Badge, Row, Col, Button } from '../../components/ui';
import { GOAL_STATUS, PROMOTION, statusBg, statusColor } from '../../lib/compute';
import { formatDate } from '../../lib/format';

export default function EmployeeDashboard() {
  const { user, goalsFor, computeRatingFor, eligibilityFor, state, setPage } = useApp();
  const { C } = useTheme();
  const goals = goalsFor(user.id);
  const activeGoals = goals.filter((g) => !g.selfProposed || g.proposalStatus === 'APPROVED');
  const rating = computeRatingFor(user.id);
  const eligibility = eligibilityFor(user.id);
  const lifeEvents = state.lifeEvents[user.id] || [];
  const upcoming = [...activeGoals]
    .filter((g) => g.status !== GOAL_STATUS.COMPLETED)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3);

  const eligibilityColor = eligibility.tier === PROMOTION.ELIGIBLE ? C.success : eligibility.tier === PROMOTION.APPROACHING ? C.warning : C.textMuted;

  return (
    <>
      <PageHeader title={`Welcome back, ${user.name.split(' ')[0]}`} subtitle={`Your ${state.periods.find((p) => p.isActive)?.name} progress at a glance`} />
      <Grid minWidth={220} style={{ marginBottom: 24 }}>
        <Card onClick={() => setPage('my-goals')}>
          <StatCard icon={Target} label="Active goals" value={activeGoals.length} color={C.accent} />
        </Card>
        <Card onClick={() => setPage('my-goals', { filter: 'COMPLETED' })}>
          <StatCard icon={CheckCircle} label="Completed" value={activeGoals.filter((g) => g.status === GOAL_STATUS.COMPLETED).length} color={C.success} />
        </Card>
        <Card onClick={() => setPage('my-rating')}>
          <StatCard icon={Award} label="Current rating" value={`${rating.adjusted.toFixed(1)}`} color={C.purple} />
        </Card>
        <Card onClick={() => setPage('life-events', { filter: 'APPROVED' })}>
          <StatCard icon={Heart} label="Approved life events" value={lifeEvents.filter((e) => e.status === 'APPROVED').length} color={C.cyan} />
        </Card>
      </Grid>

      <Grid columns={2} minWidth={320}>
        <Card hoverable={false}>
          <Row style={{ justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ color: C.text, fontSize: 16 }}>Upcoming goals</h3>
            <Button variant="ghost" size="sm" onClick={() => setPage('my-goals')}>View all</Button>
          </Row>
          {upcoming.length === 0 && <div style={{ color: C.textMuted, fontSize: 13 }}>No upcoming goals.</div>}
          <Col gap={14}>
            {upcoming.map((g) => (
              <div key={g.id}>
                <Row style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{g.title}</div>
                  <Badge color={statusColor(g.status, C)} bg={statusBg(g.status, C)}>{g.status.replace('_', ' ')}</Badge>
                </Row>
                <ProgressBar value={g.completion} color={statusColor(g.status, C)} />
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>Due {formatDate(g.dueDate)} · {g.completion}%</div>
              </div>
            ))}
          </Col>
        </Card>

        <Card hoverable={false}>
          <Row style={{ justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ color: C.text, fontSize: 16 }}>Promotion readiness</h3>
            <Badge color={eligibilityColor} bg={eligibilityColor + '22'}>{eligibility.tier.replace('_', ' ')}</Badge>
          </Row>
          <Col gap={10}>
            {eligibility.reasons.map((r, i) => (
              <Row key={i} gap={8}>
                {(i === 0 && eligibility.sustained) || (i === 1 && eligibility.initiative) || (i === 2 && eligibility.overdueRatio < 0.2)
                  ? <CheckCircle size={14} color={C.success} />
                  : <AlertCircle size={14} color={C.warning} />}
                <div style={{ fontSize: 13, color: C.textMuted }}>{r}</div>
              </Row>
            ))}
          </Col>
          <div style={{ marginTop: 14, padding: 12, background: C.surface, borderRadius: 10, fontSize: 12, color: C.textMuted }}>
            Tip: self-propose a stretch goal to signal initiative. Your manager will review it.
            <div style={{ marginTop: 8 }}>
              <Button size="sm" variant="outline" icon={Plus} onClick={() => setPage('my-goals')}>Self-propose a goal</Button>
            </div>
          </div>
        </Card>
      </Grid>

      <Card hoverable={false} style={{ marginTop: 24 }}>
        <Row style={{ justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ color: C.text, fontSize: 16 }}>Life events</h3>
          <Button variant="ghost" size="sm" onClick={() => setPage('life-events')}>Manage</Button>
        </Row>
        {lifeEvents.length === 0
          ? <div style={{ color: C.textMuted, fontSize: 13 }}>None on record.</div>
          : <Col gap={8}>{lifeEvents.map((e) => (
              <Row key={e.id} style={{ justifyContent: 'space-between' }}>
                <div style={{ fontSize: 13, color: C.text }}>{e.type} — {e.desc}</div>
                <Badge color={e.status === 'APPROVED' ? C.success : C.warning} bg={e.status === 'APPROVED' ? C.successDim : C.warningDim}>{e.status}</Badge>
              </Row>
            ))}</Col>}
      </Card>

      {rating.isAdjusted && (
        <Card hoverable={false} style={{ marginTop: 16, borderLeft: `3px solid ${C.cyan}` }}>
          <Row gap={10}>
            <TrendingUp size={18} color={C.cyan} />
            <div>
              <div style={{ fontSize: 14, color: C.text, fontWeight: 600 }}>Empathy uplift applied</div>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>
                {rating.approvedDays} approved life-event days · factor ×{rating.factor.toFixed(3)}. Raw {rating.raw.toFixed(1)} → Adjusted {rating.adjusted.toFixed(1)}.
              </div>
            </div>
          </Row>
        </Card>
      )}
    </>
  );
}
