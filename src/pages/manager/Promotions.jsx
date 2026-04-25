import { useState } from 'react';
import { Award, ArrowRight, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { PageHeader } from '../../components/layout/Shell';
import { Avatar, Badge, Button, Card, Col, EmptyState, Modal, Row, TextArea } from '../../components/ui';
import { PROMOTION, nextRole } from '../../lib/compute';
import { formatDate } from '../../lib/format';

const TIER_FILTERS = {
  ALL:         { label: 'All',          match: () => true },
  ELIGIBLE:    { label: 'Eligible',     match: (t) => t === PROMOTION.ELIGIBLE },
  APPROACHING: { label: 'Approaching',  match: (t) => t === PROMOTION.APPROACHING },
  NOT_ELIGIBLE:{ label: 'Not eligible', match: (t) => t === PROMOTION.NOT_ELIGIBLE },
};

export default function ManagerPromotions() {
  const { user, teamFor, eligibilityFor, computeRatingFor, state, actions, pageParams } = useApp();
  const { C } = useTheme();
  const team = teamFor(user.id);
  const [open, setOpen] = useState(null);
  const [tierFilter, setTierFilter] = useState(pageParams?.filter || 'ALL');

  const existingRec = (employeeId) =>
    state.promotions.find((p) => p.employeeId === employeeId && p.status !== 'REJECTED');

  return (
    <>
      <PageHeader
        title="Promotions"
        subtitle="Recommend team members with sustained high performance. Your director makes the final call."
      />

      <Row gap={6} style={{ marginBottom: 14, flexWrap: 'wrap' }}>
        {Object.entries(TIER_FILTERS).map(([key, f]) => (
          <button
            key={key}
            onClick={() => setTierFilter(key)}
            style={{
              padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
              cursor: 'pointer',
              background: tierFilter === key ? C.accent : 'transparent',
              color: tierFilter === key ? '#fff' : C.textMuted,
              border: `1px solid ${tierFilter === key ? C.accent : C.border}`,
            }}
          >{f.label}{tierFilter === key && ' ×'}</button>
        ))}
        {tierFilter !== 'ALL' && (
          <Button size="sm" variant="ghost" icon={X} onClick={() => setTierFilter('ALL')}>Clear filter</Button>
        )}
      </Row>

      <Col gap={10}>
        {team.length === 0 && <Card><EmptyState icon={Award} title="No team members" /></Card>}
        {[...team]
          .map((m) => ({ m, elig: eligibilityFor(m.id), r: computeRatingFor(m.id) }))
          .filter(({ elig }) => TIER_FILTERS[tierFilter].match(elig.tier))
          .sort((a, b) => {
            const tierRank = { [PROMOTION.ELIGIBLE]: 0, [PROMOTION.APPROACHING]: 1, [PROMOTION.NOT_ELIGIBLE]: 2 };
            const ta = tierRank[a.elig.tier] ?? 3;
            const tb = tierRank[b.elig.tier] ?? 3;
            if (ta !== tb) return ta - tb;
            return b.r.adjusted - a.r.adjusted;
          })
          .map(({ m, elig, r }) => {
            const existing = existingRec(m.id);
            const tierColor = elig.tier === PROMOTION.ELIGIBLE ? C.success : elig.tier === PROMOTION.APPROACHING ? C.warning : C.textMuted;
            const target = nextRole(state.progression || {}, m.title);
            return (
              <Card key={m.id} hoverable={false} style={{ borderLeft: `3px solid ${tierColor}` }}>
                <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <Row gap={10}>
                    <Avatar name={m.name} color={m.avatar} size={38} />
                    <Col gap={2}>
                      <div style={{ color: C.text, fontWeight: 600 }}>{m.name}</div>
                      <div style={{ color: C.textMuted, fontSize: 12 }}>
                        {m.title} · rating {r.adjusted.toFixed(1)}
                        {target && <> · next: <span style={{ color: C.accent, fontWeight: 600 }}>{target}</span></>}
                      </div>
                    </Col>
                  </Row>
                  <Row gap={8}>
                    <Badge color={tierColor} bg={tierColor + '22'}>{elig.tier.replace('_', ' ')}</Badge>
                    {existing && <Badge color={existing.status === 'APPROVED' ? C.success : C.warning} bg={existing.status === 'APPROVED' ? C.successDim : C.warningDim}>{existing.status}</Badge>}
                    {!existing && (
                      <Button
                        size="sm" icon={Award} variant={elig.tier === PROMOTION.ELIGIBLE ? 'success' : 'outline'}
                        disabled={elig.tier === PROMOTION.NOT_ELIGIBLE || !target}
                        onClick={() => setOpen({ m, target, elig })}
                      >
                        Recommend
                      </Button>
                    )}
                  </Row>
                </Row>
                <Col gap={6} style={{ marginTop: 14 }}>
                  <Row style={{ justifyContent: 'space-between', fontSize: 11, color: C.textMuted }}>
                    <span>Readiness</span>
                    <span style={{ color: tierColor, fontWeight: 700 }}>{elig.score}/100</span>
                  </Row>
                  <div style={{ height: 10, background: C.surface, borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${elig.score}%`,
                      background: `linear-gradient(90deg, ${tierColor}, ${tierColor}cc)`,
                      transition: 'width 500ms ease',
                    }} />
                  </div>
                </Col>
                {existing && (
                  <div style={{ marginTop: 10, padding: 8, background: C.surface, borderRadius: 8, fontSize: 12, color: C.textMuted }}>
                    Recommended on {formatDate(existing.date)} — &ldquo;{existing.reason}&rdquo;
                  </div>
                )}
              </Card>
            );
          })}
      </Col>

      <RecommendModal open={!!open} onClose={() => setOpen(null)} payload={open} managerId={user.id} actions={actions} C={C} />
    </>
  );
}

function RecommendModal({ open, onClose, payload, managerId, actions, C }) {
  const [achievements, setAchievements] = useState('');
  const [impact, setImpact] = useState('');
  const [growth, setGrowth] = useState('');
  if (!payload) return null;
  const { m, target, elig } = payload;

  const canSubmit = achievements.trim() && impact.trim() && growth.trim() && target;
  const buildReason = () =>
    [
      `- Achievements: ${achievements.trim()}`,
      `- Impact: ${impact.trim()}`,
      `- Growth: ${growth.trim()}`,
    ].join('\n');

  return (
    <Modal open={open} onClose={onClose} title={`Recommend ${m.name} for promotion`} width={600}>
      <div style={{ padding: 12, background: C.surface, borderRadius: 10, marginBottom: 14, fontSize: 13 }}>
        <Row gap={10} style={{ alignItems: 'center' }}>
          <div style={{ color: C.textMuted }}>{m.title}</div>
          <ArrowRight size={14} color={C.accent} />
          <div style={{ color: C.accent, fontWeight: 700 }}>{target || '— no next step defined —'}</div>
        </Row>
      </div>
      <Col gap={6} style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}>Readiness signals (not shown to the employee)</div>
        {elig.reasons.map((r, i) => {
          const ok = (i === 0 && elig.sustained) || (i === 1 && elig.initiative) || (i === 2 && elig.overdueRatio < 0.2);
          return (
            <Row key={i} gap={8} style={{ fontSize: 12, color: C.textMuted }}>
              {ok ? <CheckCircle size={13} color={C.success} /> : <AlertCircle size={13} color={C.warning} />}
              {r}
            </Row>
          );
        })}
      </Col>
      <div style={{ fontSize: 12, color: C.textSub, marginBottom: 10 }}>
        Give the director specific, verifiable bullets — generic praise doesn&rsquo;t travel.
      </div>
      <TextArea label="Achievements — what did they actually deliver?" value={achievements} onChange={setAchievements} rows={3} placeholder="e.g. Shipped payments v2 4 weeks ahead of commit; reduced P95 latency by 42%." />
      <TextArea label="Impact — why it matters to the business / team" value={impact} onChange={setImpact} rows={3} placeholder="e.g. Unblocked revenue from 3 enterprise customers; halved on-call load for the team." />
      <TextArea label="Growth — what they&rsquo;ve stretched into that justifies the next level" value={growth} onChange={setGrowth} rows={3} placeholder="e.g. Led a cross-team RFC; mentored two juniors end-to-end on the refactor." />
      <Row style={{ justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="success" disabled={!canSubmit} onClick={() => { actions.recommendPromotion(m.id, managerId, buildReason(), target); onClose(); }}>
          Send to Director
        </Button>
      </Row>
    </Modal>
  );
}
