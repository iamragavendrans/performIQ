import { CheckCircle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { PageHeader } from '../../components/layout/Shell';
import { Badge, Button, Card, Col, EmptyState, Row } from '../../components/ui';
import { formatDate } from '../../lib/format';

export default function AdminApprovals() {
  const { state, findUser, actions } = useApp();
  const { C } = useTheme();
  const pending = state.approvals.filter((a) => a.status === 'PENDING' && a.adminOnly);
  const recent  = state.approvals.filter((a) => a.adminOnly && a.status !== 'PENDING').slice(-5);

  return (
    <>
      <PageHeader title="Admin Approvals" subtitle="Cross-team changes that require admin sign-off (team linking, etc.)." />

      {pending.length === 0
        ? <Card><EmptyState icon={CheckCircle} title="Nothing pending" /></Card>
        : <Col gap={10}>
            {pending.map((a) => {
              const emp = findUser(a.employeeId);
              const mgr = findUser(a.managerId);
              return (
                <Card key={a.id} hoverable={false}>
                  <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <Col gap={4}>
                      <div style={{ color: C.text, fontWeight: 600 }}>{a.type.replace('_', ' ')}</div>
                      <div style={{ color: C.textMuted, fontSize: 13 }}>{a.detail}</div>
                      <div style={{ color: C.textSub, fontSize: 11 }}>{emp?.name} · requested by {mgr?.name} · {formatDate(a.date)}</div>
                    </Col>
                    <Row gap={8}>
                      <Button size="sm" variant="ghost" icon={X} onClick={() => actions.decideApproval(a.id, false)}>Reject</Button>
                      <Button size="sm" variant="success" icon={CheckCircle} onClick={() => actions.decideApproval(a.id, true)}>Approve</Button>
                    </Row>
                  </Row>
                </Card>
              );
            })}
          </Col>}

      {recent.length > 0 && (
        <>
          <h3 style={{ color: C.text, fontSize: 14, fontWeight: 600, margin: '24px 0 10px' }}>Recent decisions</h3>
          <Col gap={8}>
            {recent.map((a) => (
              <Row key={a.id} style={{ justifyContent: 'space-between', padding: 10, background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13 }}>
                <div style={{ color: C.textMuted }}>{a.type} · {a.detail}</div>
                <Badge color={a.status === 'APPROVED' ? C.success : C.danger} bg={a.status === 'APPROVED' ? C.successDim : C.dangerDim}>{a.status}</Badge>
              </Row>
            ))}
          </Col>
        </>
      )}
    </>
  );
}
