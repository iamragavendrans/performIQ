import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { PageHeader } from '../../components/layout/Shell';
import { Avatar, Badge, Card, Col, Row } from '../../components/ui';
import { nextRole } from '../../lib/compute';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { INITIAL_LADDERS, INITIAL_PROGRESSION } from '../../data/seed';

export default function OrgHierarchy() {
  const { state } = useApp();
  const { C } = useTheme();
  // Defensive: older persisted state may not have ladders/progression.
  const ladders = state.ladders && state.ladders.length ? state.ladders : INITIAL_LADDERS;
  const progression = state.progression || INITIAL_PROGRESSION;

  // Map every current title → users holding it, so we can annotate the ladder.
  const usersByTitle = state.users.reduce((acc, u) => {
    if (!u.title) return acc;
    acc[u.title] = acc[u.title] || [];
    acc[u.title].push(u);
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        title="Org Hierarchy"
        subtitle="Role progression across the org. When a promotion is filed, this is the ladder it references."
      />

      <Col gap={16}>
        {ladders.map((ladder, idx) => (
          <Card key={idx} hoverable={false}>
            <Row style={{ justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ color: C.text, fontSize: 16 }}>{ladder.group} ladder</h3>
              <Badge color={C.accent} bg={C.accentDim}>{ladder.roles.length} rungs</Badge>
            </Row>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'stretch' }}>
              {ladder.roles.map((role, i) => {
                const holders = usersByTitle[role] || [];
                const isTop = i === ladder.roles.length - 1;
                return (
                  <Row key={role} gap={8} style={{ alignItems: 'stretch' }}>
                    <div style={{
                      background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
                      padding: '10px 14px', minWidth: 160,
                    }}>
                      <div style={{ color: C.text, fontWeight: 600, fontSize: 13 }}>{role}</div>
                      <div style={{ color: C.textMuted, fontSize: 11, marginTop: 4 }}>
                        {holders.length} holder{holders.length === 1 ? '' : 's'}
                      </div>
                      {holders.length > 0 && (
                        <Row gap={4} style={{ marginTop: 8, flexWrap: 'wrap' }}>
                          {holders.slice(0, 4).map((h) => (
                            <Avatar key={h.id} name={h.name} color={h.avatar} size={22} />
                          ))}
                          {holders.length > 4 && (
                            <span style={{ color: C.textMuted, fontSize: 11, alignSelf: 'center' }}>+{holders.length - 4}</span>
                          )}
                        </Row>
                      )}
                    </div>
                    {!isTop && <div style={{ alignSelf: 'center' }}><ChevronRight size={16} color={C.textSub} /></div>}
                  </Row>
                );
              })}
            </div>
          </Card>
        ))}
      </Col>

      <Card hoverable={false} style={{ marginTop: 16 }}>
        <h3 style={{ color: C.text, fontSize: 16, marginBottom: 14 }}>Active promotion targets</h3>
        <Col gap={8}>
          {state.promotions.length === 0 && <div style={{ color: C.textMuted, fontSize: 13 }}>No promotions in flight.</div>}
          {state.promotions.map((p) => {
            const emp = state.users.find((u) => u.id === p.employeeId);
            const target = p.targetTitle || nextRole(progression, emp?.title);
            return (
              <Row key={p.id} gap={10} style={{ padding: 10, background: C.surface, borderRadius: 10, fontSize: 13 }}>
                <Avatar name={emp?.name} color={emp?.avatar} size={26} />
                <Col gap={2} style={{ flex: 1 }}>
                  <Row gap={8} style={{ alignItems: 'center' }}>
                    <div style={{ color: C.text, fontWeight: 600 }}>{emp?.name}</div>
                    <span style={{ color: C.textSub, fontSize: 11 }}>{emp?.title}</span>
                    <ArrowRight size={12} color={C.accent} />
                    <span style={{ color: C.accent, fontWeight: 600 }}>{target || '—'}</span>
                  </Row>
                </Col>
                <Badge
                  color={p.status === 'APPROVED' ? C.success : p.status === 'REJECTED' ? C.danger : C.warning}
                  bg={p.status === 'APPROVED' ? C.successDim : p.status === 'REJECTED' ? C.dangerDim : C.warningDim}
                >{p.status}</Badge>
              </Row>
            );
          })}
        </Col>
      </Card>
    </>
  );
}
