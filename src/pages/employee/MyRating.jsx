import { Award, Heart, Info, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { PageHeader } from '../../components/layout/Shell';
import { Badge, Card, Col, Grid, ProgressBar, Row, StatCard } from '../../components/ui';
import { PROMOTION, statusColor, goalStatus } from '../../lib/compute';
import { formatDate } from '../../lib/format';

export default function MyRating() {
  const { user, goalsFor, computeRatingFor, eligibilityFor, state } = useApp();
  const { C } = useTheme();
  const goals = goalsFor(user.id).filter((g) => !g.selfProposed || g.proposalStatus === 'APPROVED');
  const r = computeRatingFor(user.id);
  const eligibility = eligibilityFor(user.id);
  const history = state.ratingHistory[user.id] || [];
  const approvedLE = (state.lifeEvents[user.id] || []).filter((e) => e.status === 'APPROVED');

  const eligibilityColor = eligibility.tier === PROMOTION.ELIGIBLE ? C.success : eligibility.tier === PROMOTION.APPROACHING ? C.warning : C.textMuted;

  const myPromotion = state.promotions.find((p) => p.employeeId === user.id && (p.status === 'RECOMMENDED' || p.status === 'APPROVED'));

  return (
    <>
      <PageHeader
        title="My Rating"
        subtitle="Data-driven and transparent. Your manager cannot edit these numbers — they are derived from goals and approved life events."
      />

      <Grid columns={3} minWidth={220} style={{ marginBottom: 20 }}>
        <StatCard icon={Award} label="Raw rating"      value={r.raw.toFixed(1)}      color={C.accent} />
        <StatCard icon={Heart} label="Adjusted rating" value={r.adjusted.toFixed(1)} color={C.cyan} />
        <StatCard icon={TrendingUp} label="Uplift factor" value={`×${r.factor.toFixed(3)}`} color={C.success} />
      </Grid>

      <Grid columns={2} minWidth={320}>
        <Card hoverable={false}>
          <h3 style={{ color: C.text, fontSize: 16, marginBottom: 14 }}>How each goal contributes</h3>
          {goals.length === 0 && <div style={{ color: C.textMuted, fontSize: 13 }}>No goals yet.</div>}
          <Col gap={12}>
            {goals.map((g) => {
              const contribution = (g.completion * g.weight) / 100;
              return (
                <div key={g.id}>
                  <Row style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{g.title}</div>
                    <div style={{ fontSize: 12, color: C.textMuted }}>
                      {g.completion}% × {g.weight}% = <b style={{ color: statusColor(goalStatus(g.completion), C) }}>{contribution.toFixed(1)}</b>
                    </div>
                  </Row>
                  <ProgressBar value={g.completion} color={statusColor(goalStatus(g.completion), C)} />
                </div>
              );
            })}
          </Col>
        </Card>

        <Card hoverable={false}>
          <h3 style={{ color: C.text, fontSize: 16, marginBottom: 14 }}>Life event impact</h3>
          {approvedLE.length === 0
            ? <div style={{ color: C.textMuted, fontSize: 13 }}>No approved life events this period — no adjustment applied.</div>
            : (
              <Col gap={10}>
                {approvedLE.map((e) => (
                  <Row key={e.id} style={{ justifyContent: 'space-between', fontSize: 13 }}>
                    <div>
                      <div style={{ color: C.text, fontWeight: 600 }}>{e.type}</div>
                      <div style={{ color: C.textMuted, fontSize: 11 }}>{formatDate(e.start)} → {formatDate(e.end)}</div>
                    </div>
                    <Badge color={C.cyan} bg={C.cyanDim}>Approved</Badge>
                  </Row>
                ))}
                <div style={{ marginTop: 6, padding: 10, background: C.surface, borderRadius: 8, fontSize: 12, color: C.textMuted }}>
                  Uplift: {r.approvedDays} days × 0.3% = cap ×{r.factor.toFixed(3)} (max ×1.100)
                </div>
              </Col>
            )}
        </Card>

        <Card hoverable={false}>
          <h3 style={{ color: C.text, fontSize: 16, marginBottom: 14 }}>Rating history</h3>
          <Col gap={8}>
            {history.map((h) => {
              const period = state.periods.find((p) => p.id === h.periodId);
              return (
                <Row key={h.periodId} style={{ justifyContent: 'space-between', fontSize: 13 }}>
                  <div style={{ color: C.text }}>{period?.name || h.periodId}</div>
                  <Row gap={12}>
                    <div style={{ color: C.textMuted }}>Raw {h.raw.toFixed(1)}</div>
                    <div style={{ color: C.cyan, fontWeight: 600 }}>Adjusted {h.adjusted.toFixed(1)}</div>
                  </Row>
                </Row>
              );
            })}
            <Row style={{ justifyContent: 'space-between', fontSize: 13, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
              <div style={{ color: C.text }}>{state.periods.find((p) => p.isActive)?.name} (current)</div>
              <Row gap={12}>
                <div style={{ color: C.textMuted }}>Raw {r.raw.toFixed(1)}</div>
                <div style={{ color: C.cyan, fontWeight: 700 }}>Adjusted {r.adjusted.toFixed(1)}</div>
              </Row>
            </Row>
          </Col>
        </Card>

        <Card hoverable={false} style={{ borderLeft: `3px solid ${eligibilityColor}` }}>
          <Row style={{ justifyContent: 'space-between', marginBottom: 10 }}>
            <h3 style={{ color: C.text, fontSize: 16 }}>Promotion signal</h3>
            <Badge color={eligibilityColor} bg={eligibilityColor + '22'}>{eligibility.tier.replace('_', ' ')}</Badge>
          </Row>
          <Col gap={8}>
            {eligibility.reasons.map((r, i) => (
              <Row key={i} gap={8} style={{ fontSize: 13, color: C.textMuted }}>
                <Info size={13} color={C.textMuted} /> {r}
              </Row>
            ))}
          </Col>
          {myPromotion && (
            <div style={{ marginTop: 14, padding: 10, background: C.surface, borderRadius: 8, fontSize: 12, color: C.textMuted }}>
              Your manager has recommended you for promotion on {formatDate(myPromotion.date)}. Status: <b style={{ color: myPromotion.status === 'APPROVED' ? C.success : C.warning }}>{myPromotion.status}</b>
            </div>
          )}
        </Card>
      </Grid>
    </>
  );
}
