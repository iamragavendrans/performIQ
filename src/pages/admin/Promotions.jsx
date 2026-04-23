import { Award, CheckCircle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { PageHeader } from '../../components/layout/Shell';
import { Avatar, Badge, Button, Card, Col, EmptyState, Row } from '../../components/ui';
import { PROMOTION } from '../../lib/compute';
import { formatDate } from '../../lib/format';

export default function AdminPromotions() {
  const { state, findUser, computeRatingFor, eligibilityFor, actions } = useApp();
  const { C } = useTheme();

  const pending = state.promotions.filter((p) => p.status === 'RECOMMENDED');
  const decided = state.promotions.filter((p) => p.status === 'APPROVED' || p.status === 'REJECTED');

  return (
    <>
      <PageHeader title="Promotions" subtitle="Manager-recommended promotions awaiting your review." />

      {pending.length === 0
        ? <Card><EmptyState icon={Award} title="No promotions pending" /></Card>
        : <Col gap={12}>
            {pending.map((p) => {
              const emp = findUser(p.employeeId);
              const mgr = findUser(p.recommendedBy);
              const r = computeRatingFor(p.employeeId);
              const elig = eligibilityFor(p.employeeId);
              const color = elig.tier === PROMOTION.ELIGIBLE ? C.success : C.warning;
              return (
                <Card key={p.id} hoverable={false} style={{ borderLeft: `3px solid ${color}` }}>
                  <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <Row gap={10} style={{ flex: 1, minWidth: 260 }}>
                      <Avatar name={emp?.name} color={emp?.avatar} size={40} />
                      <Col gap={2}>
                        <div style={{ color: C.text, fontWeight: 600 }}>{emp?.name}</div>
                        <div style={{ color: C.textMuted, fontSize: 12 }}>{emp?.title} · rating {r.adjusted.toFixed(1)}</div>
                        <div style={{ color: C.textSub, fontSize: 11 }}>Recommended by {mgr?.name} · {formatDate(p.date)}</div>
                      </Col>
                    </Row>
                    <Row gap={8}>
                      <Badge color={color} bg={color + '22'}>{elig.tier.replace('_', ' ')}</Badge>
                      <Button size="sm" variant="ghost" icon={X} onClick={() => actions.decidePromotion(p.id, false)}>Reject</Button>
                      <Button size="sm" variant="success" icon={CheckCircle} onClick={() => actions.decidePromotion(p.id, true)}>Approve</Button>
                    </Row>
                  </Row>
                  <div style={{ marginTop: 10, padding: 10, background: C.surface, borderRadius: 8, fontSize: 13, color: C.textMuted }}>
                    &ldquo;{p.reason}&rdquo;
                  </div>
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
