import { Award, CheckCircle, X, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { PageHeader } from '../../components/layout/Shell';
import { Avatar, Badge, Button, Card, Col, EmptyState, Row } from '../../components/ui';
import { PROMOTION, nextRole } from '../../lib/compute';
import { formatDate } from '../../lib/format';

function ReasonBlock({ reason, C }) {
  if (!reason) return null;
  const lines = reason.split('\n').map((l) => l.trim()).filter(Boolean);
  const bullets = lines.filter((l) => l.startsWith('- '));
  if (bullets.length >= 2) {
    return (
      <div style={{ marginTop: 10, padding: 10, background: C.surface, borderRadius: 8 }}>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: C.text, lineHeight: 1.6 }}>
          {bullets.map((b, i) => {
            const [label, ...rest] = b.slice(2).split(':');
            const text = rest.join(':').trim();
            return (
              <li key={i}>
                <span style={{ color: C.accent, fontWeight: 700 }}>{label}:</span> {text}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
  return (
    <div style={{ marginTop: 10, padding: 10, background: C.surface, borderRadius: 8, fontSize: 13, color: C.textMuted }}>
      &ldquo;{reason}&rdquo;
    </div>
  );
}

export default function AdminPromotions() {
  const { state, findUser, computeRatingFor, eligibilityFor, actions } = useApp();
  const { C } = useTheme();

  const pending = state.promotions.filter((p) => p.status === 'RECOMMENDED');
  const decided = state.promotions.filter((p) => p.status === 'APPROVED' || p.status === 'REJECTED');

  return (
    <>
      <PageHeader
        title="Promotions"
        subtitle="Manager-recommended promotions awaiting your approval. You see a composite readiness score and target role — not the underlying parameters."
      />

      {pending.length === 0
        ? <Card><EmptyState icon={Award} title="No promotions pending" /></Card>
        : <Col gap={12}>
            {pending.map((p) => {
              const emp = findUser(p.employeeId);
              const mgr = findUser(p.recommendedBy);
              const r = computeRatingFor(p.employeeId);
              const elig = eligibilityFor(p.employeeId);
              const color = elig.tier === PROMOTION.ELIGIBLE ? C.success : elig.tier === PROMOTION.APPROACHING ? C.warning : C.textMuted;
              const target = p.targetTitle || nextRole(state.progression || {}, emp?.title);
              return (
                <Card key={p.id} hoverable={false} style={{ borderLeft: `3px solid ${color}` }}>
                  <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <Row gap={10} style={{ flex: 1, minWidth: 260 }}>
                      <Avatar name={emp?.name} color={emp?.avatar} size={40} />
                      <Col gap={2}>
                        <div style={{ color: C.text, fontWeight: 600 }}>{emp?.name}</div>
                        <div style={{ color: C.textMuted, fontSize: 12 }}>Rating {r.adjusted.toFixed(1)} · recommended by {mgr?.name} · {formatDate(p.date)}</div>
                        <Row gap={8} style={{ marginTop: 6, alignItems: 'center' }}>
                          <span style={{ color: C.textMuted, fontSize: 12 }}>{emp?.title}</span>
                          <ArrowRight size={12} color={C.accent} />
                          <span style={{ color: C.accent, fontSize: 12, fontWeight: 700 }}>{target || '— no next step defined —'}</span>
                        </Row>
                      </Col>
                    </Row>
                    <Row gap={8}>
                      <Button size="sm" variant="ghost" icon={X} onClick={() => actions.decidePromotion(p.id, false)}>Reject</Button>
                      <Button size="sm" variant="success" icon={CheckCircle} onClick={() => actions.decidePromotion(p.id, true)}>Approve</Button>
                    </Row>
                  </Row>

                  <Col gap={6} style={{ marginTop: 14 }}>
                    <Row style={{ justifyContent: 'space-between', fontSize: 11, color: C.textMuted }}>
                      <span>Readiness</span>
                      <span style={{ color, fontWeight: 700 }}>{elig.score}/100 · {elig.tier.replace('_', ' ')}</span>
                    </Row>
                    <div style={{ height: 10, background: C.surface, borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${elig.score}%`,
                        background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                        transition: 'width 500ms ease',
                      }} />
                    </div>
                  </Col>

                  <ReasonBlock reason={p.reason} C={C} />
                </Card>
              );
            })}
          </Col>}

      {decided.length > 0 && (
        <>
          <h3 style={{ color: C.text, fontSize: 14, fontWeight: 600, margin: '24px 0 10px' }}>Decisions</h3>
          <Col gap={8}>
            {decided.map((p) => {
              const emp = findUser(p.employeeId);
              return (
                <Row key={p.id} style={{ justifyContent: 'space-between', padding: 10, background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13 }}>
                  <div style={{ color: C.textMuted }}>{emp?.name} · &ldquo;{p.reason}&rdquo;</div>
                  <Badge color={p.status === 'APPROVED' ? C.success : C.danger} bg={p.status === 'APPROVED' ? C.successDim : C.dangerDim}>{p.status}</Badge>
                </Row>
              );
            })}
          </Col>
        </>
      )}
    </>
  );
}
