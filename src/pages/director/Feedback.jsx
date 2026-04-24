import { useEffect, useState } from 'react';
import { Brain, TrendingUp, AlertCircle, Award, Users, RefreshCw, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { PageHeader } from '../../components/layout/Shell';
import { Avatar, Badge, Button, Card, Col, Grid, Row } from '../../components/ui';
import { PROMOTION, healthColor, teamHealth } from '../../lib/compute';
import { ROLES } from '../../lib/roles';

const STEPS = [
  { label: 'Reading each manager’s team rating trend…', at: 0 },
  { label: 'Checking approval queues for bottlenecks…',     at: 320 },
  { label: 'Finding promotion-ready ICs across the org…',    at: 640 },
  { label: 'Drafting leadership priorities…',                at: 960 },
];
const REVEAL_AT = 1250;

export default function DirectorFeedback() {
  const { user, teamFor, goalsFor, computeRatingFor, eligibilityFor, state, setPage } = useApp();
  const { C } = useTheme();
  const managers = teamFor(user.id);

  const [brewing, setBrewing] = useState(true);
  const [stepIdx, setStepIdx] = useState(0);
  const [runKey, setRunKey] = useState(0);

  useEffect(() => {
    setBrewing(true); setStepIdx(0);
    const timers = STEPS.map((s, i) => setTimeout(() => setStepIdx(i + 1), s.at + 220));
    const reveal = setTimeout(() => setBrewing(false), REVEAL_AT);
    return () => { timers.forEach(clearTimeout); clearTimeout(reveal); };
  }, [runKey]);

  // Derived leadership insights -----------------------------------------------
  const managerCards = managers.map((m) => {
    const team = teamFor(m.id);
    const health = teamHealth(team.flatMap((x) => goalsFor(x.id)));
    const avg = team.length ? team.reduce((s, e) => s + computeRatingFor(e.id).adjusted, 0) / team.length : 0;
    const pending = state.approvals.filter((a) => a.managerId === m.id && a.status === 'PENDING' && !a.adminOnly).length;
    const promoReady = team.filter((e) => eligibilityFor(e.id).tier === PROMOTION.ELIGIBLE).length;
    return { m, team, health, avg, pending, promoReady };
  });

  const bottleneckedManagers = managerCards.filter((x) => x.pending >= 3);
  const atRiskManagers = managerCards.filter((x) => x.health !== 'Healthy');
  const promoPipeline = state.users
    .filter((u) => u.role === ROLES.EMPLOYEE && eligibilityFor(u.id).tier === PROMOTION.ELIGIBLE)
    .map((u) => ({ u, r: computeRatingFor(u.id) }))
    .sort((a, b) => b.r.adjusted - a.r.adjusted);

  return (
    <>
      <PageHeader
        title="Team Feedback"
        subtitle="Signals across your managers and, transitively, their teams. Directors do not have IC goals — your feedback is about leadership outcomes."
        actions={
          <Button icon={RefreshCw} variant="outline" disabled={brewing} onClick={() => setRunKey((k) => k + 1)}>
            Re-run analysis
          </Button>
        }
      />

      {brewing ? <BrewingPanel C={C} stepIdx={stepIdx} /> : (
        <div style={{ animation: 'fadeIn 260ms ease' }}>
          <Grid minWidth={320} style={{ marginBottom: 20 }}>
            <Card hoverable={false}>
              <Row gap={8} style={{ marginBottom: 12 }}>
                <Users size={18} color={C.accent} />
                <h3 style={{ color: C.text, fontSize: 16 }}>Where to spend your time</h3>
              </Row>
              {atRiskManagers.length === 0 && bottleneckedManagers.length === 0 && (
                <div style={{ color: C.textMuted, fontSize: 13 }}>All managers green and unblocked. Focus on pipeline and growth.</div>
              )}
              <Col gap={10}>
                {atRiskManagers.map((x) => (
                  <Row
                    key={'risk_' + x.m.id} gap={10}
                    onClick={() => setPage('reports', { focus: x.m.id })}
                    style={{ padding: 10, background: C.surface, borderRadius: 10, cursor: 'pointer' }}
                  >
                    <AlertCircle size={16} color={healthColor(x.health, C)} />
                    <Col gap={2} style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>
                        {x.m.name}&rsquo;s team health is <b style={{ color: healthColor(x.health, C) }}>{x.health}</b>
                      </div>
                      <div style={{ fontSize: 11, color: C.textMuted }}>
                        {x.team.length} reports · avg rating {x.avg.toFixed(1)} — drop in today to help triage.
                      </div>
                    </Col>
                  </Row>
                ))}
                {bottleneckedManagers.map((x) => (
                  <Row
                    key={'block_' + x.m.id} gap={10}
                    onClick={() => setPage('approvals')}
                    style={{ padding: 10, background: C.surface, borderRadius: 10, cursor: 'pointer' }}
                  >
                    <AlertCircle size={16} color={C.warning} />
                    <Col gap={2} style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>
                        {x.m.name} has {x.pending} approvals piling up
                      </div>
                      <div style={{ fontSize: 11, color: C.textMuted }}>
                        Unblock weight changes and self-proposed goals — stale queues stall teams.
                      </div>
                    </Col>
                  </Row>
                ))}
              </Col>
            </Card>

            <Card hoverable={false}>
              <Row gap={8} style={{ marginBottom: 12 }}>
                <TrendingUp size={18} color={C.cyan} />
                <h3 style={{ color: C.text, fontSize: 16 }}>Manager snapshot</h3>
              </Row>
              <Col gap={8}>
                {managerCards.map((x) => (
                  <Row
                    key={x.m.id} gap={10}
                    onClick={() => setPage('reports', { focus: x.m.id })}
                    style={{ padding: 10, background: C.surface, borderRadius: 10, cursor: 'pointer' }}
                  >
                    <Avatar name={x.m.name} color={x.m.avatar} size={30} />
                    <Col gap={2} style={{ flex: 1 }}>
                      <Row style={{ justifyContent: 'space-between' }}>
                        <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{x.m.name}</div>
                        <Row gap={6}>
                          <Badge color={healthColor(x.health, C)} bg={healthColor(x.health, C) + '22'}>{x.health}</Badge>
                          {x.promoReady > 0 && <Badge color={C.cyan} bg={C.cyanDim}>{x.promoReady} promo-ready</Badge>}
                        </Row>
                      </Row>
                      <div style={{ fontSize: 11, color: C.textMuted }}>
                        {x.team.length} reports · avg {x.avg.toFixed(1)} · {x.pending} pending approvals
                      </div>
                    </Col>
                  </Row>
                ))}
              </Col>
            </Card>
          </Grid>

          <Card hoverable={false}>
            <Row gap={8} style={{ marginBottom: 12 }}>
              <Award size={18} color={C.success} />
              <h3 style={{ color: C.text, fontSize: 16 }}>Promotion pipeline across the org</h3>
            </Row>
            {promoPipeline.length === 0
              ? <div style={{ color: C.textMuted, fontSize: 13 }}>Nobody meets the bar yet this period.</div>
              : (
                <Col gap={8}>
                  {promoPipeline.slice(0, 6).map(({ u, r }) => (
                    <Row
                      key={u.id} gap={10}
                      onClick={() => setPage('promotions', { filter: 'ELIGIBLE' })}
                      style={{ padding: 10, background: C.surface, borderRadius: 10, cursor: 'pointer' }}
                    >
                      <Avatar name={u.name} color={u.avatar} size={28} />
                      <Col gap={2} style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: C.textMuted }}>{u.title} · rating {r.adjusted.toFixed(1)}</div>
                      </Col>
                      <Badge color={C.success} bg={C.successDim}>ELIGIBLE</Badge>
                    </Row>
                  ))}
                </Col>
              )}
          </Card>
        </div>
      )}
    </>
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
            <div style={{ color: C.text, fontWeight: 700 }}>Compiling leadership view</div>
            <div style={{ color: C.textMuted, fontSize: 12 }}>Signals from each manager&rsquo;s team, the approval queue, and the promotion pipeline.</div>
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
                <span className={active ? 'perfiq-brewing-step' : ''}>{s.label}</span>
              </Row>
            );
          })}
        </Col>
      </Card>
      <Grid minWidth={320}>
        {[0, 1, 2].map((i) => (
          <Card key={i} hoverable={false}>
            <div className="perfiq-skeleton" style={{ height: 14, width: '45%', marginBottom: 12 }} />
            <div className="perfiq-skeleton" style={{ height: 10, width: '80%', marginBottom: 8 }} />
            <div className="perfiq-skeleton" style={{ height: 10, width: '60%' }} />
          </Card>
        ))}
      </Grid>
    </div>
  );
}
