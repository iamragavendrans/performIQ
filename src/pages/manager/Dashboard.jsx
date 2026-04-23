import { Users, CheckCircle, Award, AlertCircle, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { PageHeader } from '../../components/layout/Shell';
import { Badge, Card, Col, Grid, ProgressBar, Row, StatCard, Avatar, Button } from '../../components/ui';
import { PROMOTION, healthColor, teamHealth } from '../../lib/compute';
import { ROLES } from '../../lib/roles';

export default function ManagerDashboard() {
  const { user, teamFor, goalsFor, computeRatingFor, eligibilityFor, state, setPage } = useApp();
  const { C } = useTheme();
  const team = teamFor(user.id);
  const pendingApprovals = state.approvals.filter(
    (a) => a.managerId === user.id && a.status === 'PENDING' && !a.adminOnly
  ).length;
  const avgRating = team.length
    ? team.reduce((s, m) => s + computeRatingFor(m.id).adjusted, 0) / team.length
    : 0;
  const eligibleCount = team.filter((m) => {
    const e = eligibilityFor(m.id);
    return e.tier === PROMOTION.ELIGIBLE;
  }).length;

  const isDirector = user.role === ROLES.DIRECTOR;

  return (
    <>
      <PageHeader
        title={isDirector ? 'Director dashboard' : 'Manager dashboard'}
        subtitle={isDirector ? 'Health of your managers and, transitively, their teams.' : 'Your team’s progress this period.'}
      />

      <Grid columns={4} minWidth={220} style={{ marginBottom: 20 }}>
        <StatCard icon={Users} label={isDirector ? 'Managers' : 'Team size'} value={team.length} color={C.accent} />
        <StatCard icon={Award} label="Avg adjusted rating" value={avgRating.toFixed(1)} color={C.purple} />
        <StatCard icon={CheckCircle} label="Pending approvals" value={pendingApprovals} color={pendingApprovals ? C.warning : C.success} />
        <StatCard icon={TrendingUp} label="Promotion-eligible" value={eligibleCount} color={C.cyan} />
      </Grid>

      <Card hoverable={false} style={{ marginBottom: 20 }}>
        <Row style={{ justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ color: C.text, fontSize: 16 }}>Team health</h3>
          <Button variant="ghost" size="sm" onClick={() => setPage('my-team')}>Full view</Button>
        </Row>
        <Col gap={12}>
          {team.map((m) => {
            const goals = goalsFor(m.id);
            const health = teamHealth(goals);
            const r = computeRatingFor(m.id);
            const elig = eligibilityFor(m.id);
            return (
              <Row key={m.id} gap={12} style={{ padding: 10, borderRadius: 10, background: C.surface }}>
                <Avatar name={m.name} color={m.avatar} size={34} />
                <Col gap={2} style={{ flex: 1, minWidth: 0 }}>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <div style={{ color: C.text, fontSize: 14, fontWeight: 600 }}>{m.name}</div>
                    <Row gap={8}>
                      <Badge color={healthColor(health, C)} bg={healthColor(health, C) + '22'}>{health}</Badge>
                      {elig.tier === PROMOTION.ELIGIBLE && <Badge color={C.cyan} bg={C.cyanDim}>Promo-ready</Badge>}
                    </Row>
                  </Row>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <div style={{ color: C.textMuted, fontSize: 12 }}>{m.title || m.role} · {goals.length} goals</div>
                    <div style={{ color: C.textMuted, fontSize: 12 }}>Rating {r.adjusted.toFixed(1)}</div>
                  </Row>
                  <ProgressBar value={r.adjusted} color={healthColor(health, C)} />
                </Col>
              </Row>
            );
          })}
        </Col>
      </Card>

      {pendingApprovals > 0 && (
        <Card hoverable={false} style={{ borderLeft: `3px solid ${C.warning}` }}>
          <Row gap={10}>
            <AlertCircle size={18} color={C.warning} />
            <div style={{ flex: 1 }}>
              <div style={{ color: C.text, fontWeight: 600 }}>{pendingApprovals} pending approval(s)</div>
              <div style={{ color: C.textMuted, fontSize: 12 }}>Weight changes, self-proposed goals, and life events need your review.</div>
            </div>
            <Button size="sm" onClick={() => setPage('approvals')}>Review</Button>
          </Row>
        </Card>
      )}
    </>
  );
}
