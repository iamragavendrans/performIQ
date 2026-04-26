import { useState } from 'react';
import { CheckCircle, X, Percent, Heart, Target, Link as LinkIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { PageHeader } from '../../components/layout/Shell';
import { Badge, Button, Card, Col, EmptyState, Row, Tabs } from '../../components/ui';
import { APPROVAL_TYPES, ROLES } from '../../lib/roles';
import { formatDate, daysBetween } from '../../lib/format';
import { lifeEventImpact } from '../../lib/compute';

const TYPE_ICON = {
  [APPROVAL_TYPES.WEIGHT_CHANGE]: Percent,
  [APPROVAL_TYPES.LIFE_EVENT]: Heart,
  [APPROVAL_TYPES.SELF_PROPOSED_GOAL]: Target,
  [APPROVAL_TYPES.TEAM_LINK]: LinkIcon,
};

const TYPE_LABEL = {
  [APPROVAL_TYPES.WEIGHT_CHANGE]: 'Weight change',
  [APPROVAL_TYPES.LIFE_EVENT]: 'Life event',
  [APPROVAL_TYPES.SELF_PROPOSED_GOAL]: 'Self-proposed goal',
  [APPROVAL_TYPES.TEAM_LINK]: 'Team link',
};

export default function ManagerApprovals() {
  const { user, state, findUser, teamFor, actions, pageParams } = useApp();
  const { C } = useTheme();
  const [tab, setTab] = useState(pageParams?.tab === 'LIFE_EVENTS' ? 'life-events' : 'pending');

  const pending = state.approvals.filter((a) => a.managerId === user.id && a.status === 'PENDING' && !a.adminOnly);
  const recent = state.approvals.filter((a) => a.managerId === user.id && a.status !== 'PENDING').slice(-5);

  // Directors see life events org-wide; managers see only their direct reports' life events.
  const isDirector = user.role === ROLES.DIRECTOR;
  const lifeEventScope = (() => {
    if (isDirector) {
      return Object.entries(state.lifeEvents).flatMap(([uid, evs]) => evs.map((e) => ({ ...e, employeeId: uid })));
    }
    const teamIds = teamFor(user.id).map((u) => u.id);
    return teamIds.flatMap((uid) => (state.lifeEvents[uid] || []).map((e) => ({ ...e, employeeId: uid })));
  })();
  const sortedLifeEvents = [...lifeEventScope].sort((a, b) => new Date(b.start) - new Date(a.start));

  const Card1 = ({ a }) => {
    const emp = findUser(a.employeeId);
    const Icon = TYPE_ICON[a.type] || CheckCircle;
    return (
      <Card hoverable={false}>
        <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <Col gap={6} style={{ flex: 1, minWidth: 260 }}>
            <Row gap={10}>
              <Icon size={16} color={C.accent} />
              <div style={{ color: C.text, fontWeight: 600 }}>{TYPE_LABEL[a.type]}</div>
              <Badge color={C.textMuted} bg={C.surface}>{emp?.name}</Badge>
            </Row>
            <div style={{ color: C.textMuted, fontSize: 13 }}>{a.detail}</div>
            <div style={{ color: C.textSub, fontSize: 11 }}>Submitted {formatDate(a.date)}</div>
          </Col>
          <Row gap={8}>
            <Button size="sm" variant="ghost" icon={X} onClick={() => actions.decideApproval(a.id, false)}>Reject</Button>
            <Button size="sm" variant="success" icon={CheckCircle} onClick={() => actions.decideApproval(a.id, true)}>Approve</Button>
          </Row>
        </Row>
      </Card>
    );
  };

  const statusColor = (s) => s === 'APPROVED' ? C.success : s === 'REJECTED' ? C.danger : C.warning;
  const statusBg    = (s) => s === 'APPROVED' ? C.successDim : s === 'REJECTED' ? C.dangerDim : C.warningDim;

  const LifeEventRow = ({ e }) => {
    const emp = findUser(e.employeeId);
    return (
      <Card hoverable={false} style={{ borderLeft: `3px solid ${statusColor(e.status)}` }}>
        <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <Col gap={4} style={{ flex: 1, minWidth: 260 }}>
            <Row gap={10}>
              <Heart size={16} color={statusColor(e.status)} />
              <div style={{ color: C.text, fontWeight: 600 }}>{e.type}</div>
              <Badge color={C.textMuted} bg={C.surface}>{emp?.name}</Badge>
              <Badge color={statusColor(e.status)} bg={statusBg(e.status)}>{e.status}</Badge>
            </Row>
            <div style={{ color: C.textMuted, fontSize: 12 }}>
              {formatDate(e.start)} → {formatDate(e.end)} · {daysBetween(e.start, e.end)} days · impact ×{lifeEventImpact(e.type, state.lifeEventTypes).toFixed(2)}
            </div>
            {e.desc && <div style={{ color: C.textMuted, fontSize: 13 }}>{e.desc}</div>}
          </Col>
        </Row>
      </Card>
    );
  };

  const approvedCount = sortedLifeEvents.filter((e) => e.status === 'APPROVED').length;
  const pendingLECount = sortedLifeEvents.filter((e) => e.status === 'PENDING').length;
  const rejectedCount = sortedLifeEvents.filter((e) => e.status === 'REJECTED').length;

  return (
    <>
      <PageHeader title="Approvals" subtitle="Review weight changes, self-proposed goals, and life events from your team." />

      <Tabs
        tabs={[
          { id: 'pending', label: `Pending (${pending.length})` },
          { id: 'life-events', label: `Life events (${sortedLifeEvents.length})` },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'pending' && (
        <>
          {pending.length === 0 ? (
            <Card><EmptyState icon={CheckCircle} title="All clear" subtitle="No pending approvals right now." /></Card>
          ) : (
            <Col gap={12}>{pending.map((a) => <Card1 key={a.id} a={a} />)}</Col>
          )}

          {recent.length > 0 && (
            <>
              <h3 style={{ color: C.text, fontSize: 14, fontWeight: 600, margin: '24px 0 10px' }}>Recent decisions</h3>
              <Col gap={8}>
                {recent.map((a) => {
                  const emp = findUser(a.employeeId);
                  return (
                    <Row key={a.id} style={{ justifyContent: 'space-between', padding: 10, background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13 }}>
                      <div style={{ color: C.textMuted }}>{TYPE_LABEL[a.type]} · {emp?.name} · {a.detail}</div>
                      <Badge color={a.status === 'APPROVED' ? C.success : C.danger} bg={a.status === 'APPROVED' ? C.successDim : C.dangerDim}>{a.status}</Badge>
                    </Row>
                  );
                })}
              </Col>
            </>
          )}
        </>
      )}

      {tab === 'life-events' && (
        <>
          <Row gap={8} style={{ marginBottom: 14 }}>
            <Badge color={C.success} bg={C.successDim}>{approvedCount} approved</Badge>
            <Badge color={C.warning} bg={C.warningDim}>{pendingLECount} pending</Badge>
            <Badge color={C.danger} bg={C.dangerDim}>{rejectedCount} rejected</Badge>
          </Row>
          {sortedLifeEvents.length === 0 ? (
            <Card><EmptyState icon={Heart} title="No life events" subtitle={isDirector ? 'No life events recorded across the org.' : 'No life events recorded for your team.'} /></Card>
          ) : (
            <Col gap={10}>{sortedLifeEvents.map((e) => <LifeEventRow key={e.id} e={e} />)}</Col>
          )}
        </>
      )}
    </>
  );
}
