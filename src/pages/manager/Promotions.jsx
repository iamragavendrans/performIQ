import { useState } from 'react';
import { Award, Check, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { PageHeader } from '../../components/layout/Shell';
import { Avatar, Badge, Button, Card, Col, EmptyState, Modal, Row, TextArea } from '../../components/ui';
import { PROMOTION } from '../../lib/compute';
import { formatDate } from '../../lib/format';

export default function ManagerPromotions() {
  const { user, teamFor, eligibilityFor, computeRatingFor, state, actions } = useApp();
  const { C } = useTheme();
  const team = teamFor(user.id);
  const [open, setOpen] = useState(null);

  const existingRec = (employeeId) =>
    state.promotions.find((p) => p.employeeId === employeeId && p.status !== 'REJECTED');

  return (
    <>
      <PageHeader
        title="Promotions"
        subtitle="Recommend team members with sustained high performance for promotion. Admin makes the final call."
      />

      <Col gap={10}>
        {team.length === 0 && <Card><EmptyState icon={Award} title="No team members" /></Card>}
        {team.map((m) => {
          const elig = eligibilityFor(m.id);
          const r = computeRatingFor(m.id);
          const existing = existingRec(m.id);
          const tierColor = elig.tier === PROMOTION.ELIGIBLE ? C.success : elig.tier === PROMOTION.APPROACHING ? C.warning : C.textMuted;
          return (
            <Card key={m.id} hoverable={false} style={{ borderLeft: `3px solid ${tierColor}` }}>
              <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <Row gap={10}>
                  <Avatar name={m.name} color={m.avatar} size={38} />
                  <Col gap={2}>
                    <div style={{ color: C.text, fontWeight: 600 }}>{m.name}</div>
                    <div style={{ color: C.textMuted, fontSize: 12 }}>{m.title} · rating {r.adjusted.toFixed(1)}</div>
                  </Col>
                </Row>
                <Row gap={8}>
                  <Badge color={tierColor} bg={tierColor + '22'}>{elig.tier.replace('_', ' ')}</Badge>
                  {existing && <Badge color={existing.status === 'APPROVED' ? C.success : C.warning} bg={existing.status === 'APPROVED' ? C.successDim : C.warningDim}>{existing.status}</Badge>}
                  {!existing && (
                    <Button
                      size="sm" icon={Award} variant={elig.tier === PROMOTION.ELIGIBLE ? 'success' : 'outline'}
                      disabled={elig.tier === PROMOTION.NOT_ELIGIBLE}
                      onClick={() => setOpen(m)}
                    >
                      Recommend
                    </Button>
                  )}
                </Row>
              </Row>
              <Col gap={4} style={{ marginTop: 10 }}>
                {elig.reasons.map((r, i) => (
                  <Row key={i} gap={8} style={{ fontSize: 12, color: C.textMuted }}>
                    {i === 0 && elig.sustained ? <Check size={12} color={C.success} /> : i === 1 && elig.initiative ? <Check size={12} color={C.success} /> : i === 2 && elig.overdueRatio < 0.2 ? <Check size={12} color={C.success} /> : <Clock size={12} />}
                    {r}
                  </Row>
                ))}
                {existing && (
                  <div style={{ marginTop: 6, padding: 8, background: C.surface, borderRadius: 8, fontSize: 12, color: C.textMuted }}>
                    Recommended on {formatDate(existing.date)} — "{existing.reason}"
                  </div>
                )}
              </Col>
            </Card>
          );
        })}
      </Col>

      <RecommendModal open={!!open} onClose={() => setOpen(null)} member={open} managerId={user.id} actions={actions} />
    </>
  );
}

function RecommendModal({ open, onClose, member, managerId, actions }) {
  const [reason, setReason] = useState('');
  if (!member) return null;
  return (
    <Modal open={open} onClose={onClose} title={`Recommend ${member.name} for promotion`}>
      <TextArea label="Why this person, now?" value={reason} onChange={setReason} rows={4} placeholder="Specific achievements, sustained signal, leadership moments…" />
      <Row style={{ justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="success" disabled={!reason.trim()} onClick={() => { actions.recommendPromotion(member.id, managerId, reason.trim()); onClose(); }}>
          Send to Admin
        </Button>
      </Row>
    </Modal>
  );
}
