import { Award, Heart, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { useCountUp } from '../../hooks/useCountUp';
import { PageHeader } from '../../components/layout/Shell';
import { Badge, Card, Col, Grid, InfoTooltip, ProgressBar, Row } from '../../components/ui';
import { PROMOTION, statusColor, goalStatus, lifeEventImpact, lifeEventScore } from '../../lib/compute';
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

      <Grid minWidth={220} style={{ marginBottom: 20 }}>
        <RatingStat
          icon={Award} label="Raw rating" value={r.raw.toFixed(1)} color={C.accent}
          tooltip={
            <>
              <b>Raw rating.</b> Weighted average of goal completion (completion% × weight%) summed across your goals and divided by total weight.
              {' '}No empathy uplift applied.
            </>
          }
        />
        <AdjustedStat raw={r.raw} adjusted={r.adjusted} weightedDays={r.weightedDays} approvedDays={r.approvedDays} upliftPoints={r.upliftPoints} C={C} />
        <RatingStat
          icon={TrendingUp}
          label="Empathy uplift"
          value={r.upliftPoints > 0.05 ? `+${r.upliftPoints.toFixed(1)} pts` : 'None'}
          color={r.upliftPoints > 0.05 ? C.success : C.textMuted}
          tooltip={
            <>
              <b>Empathy uplift.</b> How many rating points approved life events added.
              {' '}We convert approved days into a small, transparent bonus — 0.3 pts per weighted day
              (days × event impact), capped so it never exceeds a 10% lift.
              {' '}Only approved events count, and managers cannot change the math.
            </>
          }
        />
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
                {approvedLE.map((e) => {
                  const s = lifeEventScore(e);
                  return (
                    <Row key={e.id} style={{ justifyContent: 'space-between', fontSize: 13 }}>
                      <div>
                        <div style={{ color: C.text, fontWeight: 600 }}>{e.type}</div>
                        <div style={{ color: C.textMuted, fontSize: 11 }}>
                          {formatDate(e.start)} → {formatDate(e.end)} · {s.days} days × impact {lifeEventImpact(e.type).toFixed(2)} = {s.weightedDays.toFixed(1)} weighted
                        </div>
                      </div>
                      <Badge color={C.cyan} bg={C.cyanDim}>+{(s.weightedDays * 0.3).toFixed(1)} pts</Badge>
                    </Row>
                  );
                })}
                <div style={{ marginTop: 6, padding: 10, background: C.surface, borderRadius: 8, fontSize: 12, color: C.textMuted }}>
                  Plain English: {r.approvedDays} days of approved life events, weighted by severity, converted to
                  a <b style={{ color: C.cyan }}>+{r.upliftPoints.toFixed(1)} point</b> bonus on your rating. The bonus is capped so it can never
                  exceed 10%.
                </div>
              </Col>
            )}
        </Card>

        <Card hoverable={false}>
          <h3 style={{ color: C.text, fontSize: 16, marginBottom: 14 }}>Rating history</h3>
          <Col gap={8}>
            <Row style={{ justifyContent: 'space-between', fontSize: 13, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>
              <div style={{ color: C.text }}>{state.periods.find((p) => p.isActive)?.name} (current)</div>
              <Row gap={12}>
                <div style={{ color: C.textMuted }}>Raw {r.raw.toFixed(1)}</div>
                <div style={{ color: C.cyan, fontWeight: 700 }}>Adjusted {r.adjusted.toFixed(1)}</div>
              </Row>
            </Row>
            {[...history]
              .sort((a, b) => new Date(b.endDate) - new Date(a.endDate))
              .map((h) => {
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
          </Col>
        </Card>

        <Card hoverable={false} style={{ borderLeft: `3px solid ${eligibilityColor}` }}>
          <Row style={{ justifyContent: 'space-between', marginBottom: 10 }}>
            <h3 style={{ color: C.text, fontSize: 16 }}>Promotion readiness</h3>
            <Badge color={eligibilityColor} bg={eligibilityColor + '22'}>{eligibility.tier.replace('_', ' ')}</Badge>
          </Row>
          <Col gap={8}>
            <Row style={{ justifyContent: 'space-between', fontSize: 12, color: C.textMuted }}>
              <span>Composite readiness</span>
              <span style={{ color: eligibilityColor, fontWeight: 700 }}>{eligibility.score}/100</span>
            </Row>
            <div style={{ height: 12, background: C.surface, borderRadius: 999, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${eligibility.score}%`,
                background: `linear-gradient(90deg, ${eligibilityColor}, ${eligibilityColor}cc)`,
                transition: 'width 600ms ease',
              }} />
            </div>
            <div style={{ fontSize: 11, color: C.textSub, marginTop: 4 }}>
              A single composite signal — the underlying parameters are intentionally not itemised, to keep focus on doing the work, not optimising the metric.
            </div>
          </Col>
          {myPromotion && (
            <div style={{ marginTop: 14, padding: 10, background: C.surface, borderRadius: 8, fontSize: 12, color: C.textMuted }}>
              Your manager has recommended you for promotion on {formatDate(myPromotion.date)}.
              {myPromotion.targetTitle && <> Target role: <b style={{ color: C.accent }}>{myPromotion.targetTitle}</b>.</>}
              {' '}Status: <b style={{ color: myPromotion.status === 'APPROVED' ? C.success : C.warning }}>{myPromotion.status}</b>
            </div>
          )}
        </Card>
      </Grid>
    </>
  );
}

function RatingStat({ icon: Icon, label, value, color, tooltip }) {
  return (
    <Card hoverable={false}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ background: color + '22', padding: 10, borderRadius: 10 }}>
          {Icon && <Icon size={20} color={color} />}
        </div>
        <InfoTooltip>{tooltip}</InfoTooltip>
      </Row>
      <div style={{ fontSize: 13, color: '#9aa7bd', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
    </Card>
  );
}

function AdjustedStat({ raw, adjusted, weightedDays, approvedDays, upliftPoints, C }) {
  const animated = useCountUp(adjusted, { from: raw, duration: 1200, decimals: 1 });
  const delta = upliftPoints ?? (adjusted - raw);
  return (
    <Card hoverable={false} style={{ borderLeft: `3px solid ${C.cyan}` }}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ background: C.cyanDim, padding: 10, borderRadius: 10 }}>
          <Heart size={20} color={C.cyan} />
        </div>
        <InfoTooltip>
          <b>Adjusted rating.</b> Your raw rating plus a small empathy bonus for approved life events.
          {' '}Different event types carry different impact (e.g. bereavement weighs more than sabbatical),
          and the bonus is capped so it can never exceed a 10% lift. Managers can&rsquo;t change the math.
        </InfoTooltip>
      </Row>
      <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 4 }}>Adjusted rating</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: C.text }}>{animated.toFixed(1)}</div>
      <div style={{ marginTop: 8, fontSize: 11, color: C.textMuted, lineHeight: 1.5 }}>
        <span>Raw {raw.toFixed(1)}</span>
        <span style={{ color: C.cyan, margin: '0 6px' }}>→</span>
        <span style={{ color: C.text, fontWeight: 600 }}>{adjusted.toFixed(1)}</span>
      </div>
      {delta > 0.05 ? (
        <div style={{ marginTop: 6, fontSize: 11, color: C.success, lineHeight: 1.5 }}>
          +{delta.toFixed(1)} points thanks to {approvedDays} day{approvedDays === 1 ? '' : 's'} of approved life events
          {weightedDays && weightedDays !== approvedDays ? <> ({weightedDays.toFixed(1)} weighted)</> : null}.
        </div>
      ) : (
        <div style={{ marginTop: 6, fontSize: 11, color: C.textSub, lineHeight: 1.5 }}>
          No empathy uplift this period.
        </div>
      )}
    </Card>
  );
}
