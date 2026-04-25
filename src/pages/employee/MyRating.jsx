import { Award, Heart, TrendingUp, TrendingDown, Minus, Star } from 'lucide-react';
import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { useCountUp } from '../../hooks/useCountUp';
import { PageHeader } from '../../components/layout/Shell';
import { Badge, Card, Col, Grid, InfoTooltip, ProgressBar, Row } from '../../components/ui';
import { PROMOTION, lifeEventImpact, lifeEventScore } from '../../lib/compute';
import { promotionHowToImprove } from '../../lib/insights';
import { buildGoalColorMap } from '../../lib/colors';
import { formatDate } from '../../lib/format';

export default function MyRating() {
  const { user, goalsFor, computeRatingFor, eligibilityFor, state } = useApp();
  const { C } = useTheme();
  const goals = goalsFor(user.id).filter((g) => !g.selfProposed || g.proposalStatus === 'APPROVED');
  const r = computeRatingFor(user.id);
  const eligibility = eligibilityFor(user.id);
  const historyRaw = state.ratingHistory[user.id];
  const approvedLE = (state.lifeEvents[user.id] || []).filter((e) => e.status === 'APPROVED');

  const colorMap = useMemo(() => buildGoalColorMap(goals), [goals]);

  // Goals enriched with their rating contribution (completion% × weight%) and
  // sorted high → low, so the top contributor is always at the head of the list.
  const contributions = useMemo(() => {
    return goals
      .map((g) => ({ g, contribution: ((g.completion || 0) * (g.weight || 0)) / 100 }))
      .sort((a, b) => b.contribution - a.contribution);
  }, [goals]);
  const topContributor = contributions[0];

  // History sorted desc and indexed for trend arrows (each row shows delta vs prev period).
  const historyDesc = useMemo(
    () => [...(historyRaw || [])].sort((a, b) => new Date(b.endDate) - new Date(a.endDate)),
    [historyRaw]
  );

  const eligibilityColor = eligibility.tier === PROMOTION.ELIGIBLE ? C.success : eligibility.tier === PROMOTION.APPROACHING ? C.warning : C.textMuted;
  const howTo = promotionHowToImprove(eligibility);
  const lastPeriod = historyDesc[0];
  const trendVsLast = lastPeriod ? r.adjusted - lastPeriod.adjusted : null;

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
          {topContributor && (
            <div style={{
              padding: 12, marginBottom: 14, borderRadius: 10,
              background: (colorMap[topContributor.g.id] || C.accent) + '14',
              border: `1px solid ${(colorMap[topContributor.g.id] || C.accent) + '55'}`,
            }}>
              <Row gap={10} style={{ alignItems: 'center' }}>
                <Star size={16} color={colorMap[topContributor.g.id] || C.accent} />
                <Col gap={2} style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: C.textSub, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>
                    LARGEST IMPACT
                  </div>
                  <div style={{ color: C.text, fontSize: 13, fontWeight: 700 }}>
                    {topContributor.g.title}
                  </div>
                  <div style={{ color: C.textMuted, fontSize: 12 }}>
                    Contributes <b style={{ color: colorMap[topContributor.g.id] || C.accent }}>{topContributor.contribution.toFixed(1)}</b> points to your raw rating today
                    ({topContributor.g.completion}% × {topContributor.g.weight}%).
                  </div>
                </Col>
              </Row>
            </div>
          )}
          <Col gap={12}>
            {contributions.map(({ g, contribution }) => {
              const color = colorMap[g.id] || C.accent;
              return (
                <div key={g.id}>
                  <Row style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                    <Row gap={8}>
                      <span style={{ width: 10, height: 10, borderRadius: 2, background: color, marginTop: 4, flexShrink: 0 }} />
                      <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{g.title}</div>
                    </Row>
                    <div style={{ fontSize: 12, color: C.textMuted }}>
                      {g.completion}% × {g.weight}% = <b style={{ color }}>{contribution.toFixed(1)}</b>
                    </div>
                  </Row>
                  <ProgressBar value={g.completion} color={color} />
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
          <Col gap={10}>
            <Row style={{ justifyContent: 'space-between', alignItems: 'center', fontSize: 13, paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
              <div style={{ color: C.text }}>
                {state.periods.find((p) => p.isActive)?.name} <span style={{ color: C.textSub, fontSize: 11 }}>(current)</span>
              </div>
              <Row gap={12} style={{ alignItems: 'center' }}>
                <div style={{ color: C.textMuted, fontSize: 12 }}>Raw {r.raw.toFixed(1)}</div>
                <div style={{ color: C.cyan, fontWeight: 700 }}>Adjusted {r.adjusted.toFixed(1)}</div>
                {trendVsLast !== null && <TrendChip delta={trendVsLast} C={C} />}
              </Row>
            </Row>
            {historyDesc.map((h, i) => {
              const period = state.periods.find((p) => p.id === h.periodId);
              const prev = historyDesc[i + 1];
              const delta = prev ? h.adjusted - prev.adjusted : null;
              return (
                <Row key={h.periodId} style={{ justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                  <div style={{ color: C.text }}>{period?.name || h.periodId}</div>
                  <Row gap={12} style={{ alignItems: 'center' }}>
                    <div style={{ color: C.textMuted, fontSize: 12 }}>Raw {h.raw.toFixed(1)}</div>
                    <div style={{ color: C.cyan, fontWeight: 600 }}>Adjusted {h.adjusted.toFixed(1)}</div>
                    {delta !== null && <TrendChip delta={delta} C={C} />}
                  </Row>
                </Row>
              );
            })}
            {historyDesc.length === 0 && (
              <div style={{ color: C.textSub, fontSize: 12 }}>No closed periods yet — once a period closes you&rsquo;ll see your trend here.</div>
            )}
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
          </Col>
          {howTo.length > 0 ? (
            <div style={{ marginTop: 14, padding: 12, background: C.surface, borderRadius: 10 }}>
              <div style={{ color: C.text, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                {eligibility.tier === PROMOTION.ELIGIBLE ? 'To stay ready' : 'To reach &ldquo;Ready&rdquo;'}
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, color: C.textMuted, fontSize: 12, lineHeight: 1.6 }}>
                {howTo.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          ) : (
            <div style={{ marginTop: 14, padding: 12, background: C.successDim, borderRadius: 10, color: C.text, fontSize: 12 }}>
              You&rsquo;re hitting every readiness signal. Hold the line.
            </div>
          )}
          {myPromotion && (
            <div style={{ marginTop: 10, padding: 10, background: C.surface, borderRadius: 8, fontSize: 12, color: C.textMuted }}>
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

function TrendChip({ delta, C }) {
  if (delta === null || delta === undefined) return null;
  const dir = delta > 0.05 ? 'up' : delta < -0.05 ? 'down' : 'flat';
  const color = dir === 'up' ? C.success : dir === 'down' ? C.danger : C.textSub;
  const Icon = dir === 'up' ? TrendingUp : dir === 'down' ? TrendingDown : Minus;
  const label = dir === 'flat' ? 'flat' : `${delta > 0 ? '+' : ''}${delta.toFixed(1)}`;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 999,
      background: color + '22', color, fontSize: 11, fontWeight: 700,
    }}>
      <Icon size={11} />
      {label}
    </span>
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
