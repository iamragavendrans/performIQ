import { useState } from 'react';
import { Plus, Calendar, Check, X, MessageCircle, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { PageHeader } from '../../components/layout/Shell';
import { Avatar, Badge, Button, Card, Col, EmptyState, Input, Modal, Row, Select, TextArea } from '../../components/ui';
import { ROLES } from '../../lib/roles';
import { formatDate } from '../../lib/format';

// Shared across employee / manager / director surfaces. Shows inbox-style
// pending requests first, then upcoming accepted meetings, then history.
export default function OneOnOnes() {
  const { user, state, actions, findUser } = useApp();
  const { C } = useTheme();
  const [requestOpen, setRequestOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(null);

  const all = (state.oneOnOnes || [])
    .filter((o) => o.initiatorId === user.id || o.withUserId === user.id);

  const pendingForMe    = all.filter((o) => o.withUserId === user.id && o.status === 'PENDING');
  const pendingFromMe   = all.filter((o) => o.initiatorId === user.id && o.status === 'PENDING');
  const upcoming        = all.filter((o) => o.status === 'ACCEPTED');
  const history         = all.filter((o) => ['DONE', 'DECLINED', 'CANCELLED'].includes(o.status));

  // Possible counterparts — direct manager + direct reports.
  const manager = findUser(user.managerId);
  const reports = state.users.filter((u) => u.managerId === user.id && u.status !== 'INACTIVE');
  const counterparts = [
    ...(manager ? [{ u: manager, rel: user.role === ROLES.DIRECTOR ? '' : 'Your manager' }] : []),
    ...reports.map((r) => ({ u: r, rel: 'Direct report' })),
  ];

  const statusColor = (s) => ({
    PENDING: C.warning, ACCEPTED: C.success, DONE: C.cyan,
    DECLINED: C.danger, CANCELLED: C.textMuted,
  }[s] || C.textMuted);
  const statusBg = (s) => ({
    PENDING: C.warningDim, ACCEPTED: C.successDim, DONE: C.cyanDim,
    DECLINED: C.dangerDim, CANCELLED: C.surface,
  }[s] || C.surface);

  const Item = ({ o }) => {
    const isInitiator = o.initiatorId === user.id;
    const other = findUser(isInitiator ? o.withUserId : o.initiatorId);
    const canRespond = !isInitiator && o.status === 'PENDING';
    const canComplete = isInitiator && o.status === 'ACCEPTED';
    return (
      <Card hoverable={false} style={{ borderLeft: `3px solid ${statusColor(o.status)}` }}>
        <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <Row gap={10} style={{ flex: 1, minWidth: 260 }}>
            <Avatar name={other?.name} color={other?.avatar} size={34} />
            <Col gap={2}>
              <Row gap={8} style={{ alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ color: C.text, fontWeight: 600 }}>
                  {isInitiator ? `To ${other?.name}` : `From ${other?.name}`}
                </div>
                <Badge color={statusColor(o.status)} bg={statusBg(o.status)}>{o.status}</Badge>
              </Row>
              <div style={{ color: C.text, fontSize: 13 }}>{o.topic}</div>
              <Row gap={8} style={{ fontSize: 11, color: C.textMuted }}>
                <Calendar size={11} /> Proposed {formatDate(o.proposedDate)}
                {o.note && <><span>·</span><span>{o.note}</span></>}
              </Row>
            </Col>
          </Row>
          <Row gap={8}>
            {canRespond && (
              <>
                <Button size="sm" variant="ghost" icon={X} onClick={() => actions.respondOneOnOne(o.id, false)}>Decline</Button>
                <Button size="sm" variant="success" icon={Check} onClick={() => actions.respondOneOnOne(o.id, true)}>Accept</Button>
              </>
            )}
            {canComplete && (
              <Button size="sm" icon={MessageCircle} onClick={() => setLogOpen(o)}>Log outcome</Button>
            )}
            {isInitiator && o.status === 'PENDING' && (
              <Button size="sm" variant="ghost" onClick={() => actions.cancelOneOnOne(o.id)}>Cancel</Button>
            )}
          </Row>
        </Row>
        {o.status === 'DONE' && o.notes && (
          <div style={{ marginTop: 10, padding: 10, background: C.surface, borderRadius: 8, fontSize: 12, color: C.textMuted }}>
            <b style={{ color: C.text }}>Outcome:</b> {o.notes}
          </div>
        )}
      </Card>
    );
  };

  const Section = ({ title, items, empty }) => (
    <div>
      <Row gap={8} style={{ marginBottom: 10 }}>
        <h3 style={{ color: C.text, fontSize: 15 }}>{title}</h3>
        <Badge color={C.textMuted} bg={C.surface}>{items.length}</Badge>
      </Row>
      {items.length === 0
        ? <Card hoverable={false}><div style={{ color: C.textMuted, fontSize: 13 }}>{empty}</div></Card>
        : <Col gap={8}>{items.map((o) => <Item key={o.id} o={o} />)}</Col>}
    </div>
  );

  return (
    <>
      <PageHeader
        title="One-on-Ones"
        subtitle="Use 1:1s to discuss goals, blockers, growth and any feedback that doesn&rsquo;t belong in writing."
        actions={
          <Button icon={Plus} disabled={counterparts.length === 0} onClick={() => setRequestOpen(true)}>
            Request 1:1
          </Button>
        }
      />

      {counterparts.length === 0 && (
        <Card><EmptyState icon={Clock} title="No one to meet with" subtitle="You don&rsquo;t have a manager or direct reports in-system yet — your admin can wire that up." /></Card>
      )}

      <Col gap={20}>
        {pendingForMe.length > 0 && <Section title="Needs your response" items={pendingForMe} empty="" />}
        <Section
          title="Awaiting response"
          items={pendingFromMe}
          empty="No requests you've sent are pending."
        />
        <Section
          title="Upcoming"
          empty={(
            <div>
              <div style={{ marginBottom: 8 }}>No confirmed 1:1s on the calendar yet. Request one to align with your {user.role === ROLES.DIRECTOR || user.role === ROLES.MANAGER ? 'reports or your manager' : 'manager'}.</div>
            </div>
          )}
          items={upcoming}
        />
        {history.length > 0 && <Section title="History" items={history} empty="" />}
      </Col>

      <RequestModal
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        counterparts={counterparts}
        userId={user.id}
        actions={actions}
      />
      <LogModal
        open={!!logOpen}
        onClose={() => setLogOpen(null)}
        oneOnOne={logOpen}
        actions={actions}
      />
    </>
  );
}

const SUGGESTED_TOPICS = [
  'Rebalance goal weights',
  'Discuss promotion readiness',
  'Unblock a goal',
  'Career growth conversation',
  'Feedback on recent work',
  'Workload check-in',
];

function RequestModal({ open, onClose, counterparts, userId, actions }) {
  const [withUserId, setWithUserId] = useState(counterparts[0]?.u.id || '');
  const [topic, setTopic] = useState('');
  const [proposedDate, setProposedDate] = useState('');
  const [note, setNote] = useState('');
  return (
    <Modal open={open} onClose={onClose} title="Request a 1:1" width={580}>
      <Select
        label="With"
        value={withUserId}
        onChange={setWithUserId}
        options={counterparts.map(({ u, rel }) => ({ value: u.id, label: `${u.name}${rel ? ' — ' + rel : ''}` }))}
      />

      <div style={{ marginBottom: 4, fontSize: 12, color: '#9aa7bd' }}>Suggested topics</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {SUGGESTED_TOPICS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTopic(t)}
            style={{
              padding: '5px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
              cursor: 'pointer',
              background: topic === t ? '#5b8def' : 'transparent',
              color: topic === t ? '#fff' : '#9aa7bd',
              border: `1px solid ${topic === t ? '#5b8def' : 'rgba(255,255,255,0.12)'}`,
            }}
          >{t}</button>
        ))}
      </div>

      <Input label="Topic" value={topic} onChange={setTopic} placeholder="What do you want to discuss?" />
      <Input label="Proposed date" type="date" value={proposedDate} onChange={setProposedDate} />
      <TextArea label="Context (optional)" value={note} onChange={setNote} rows={3} placeholder="Anything you want them to read before the meeting." />
      <Row style={{ justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button
          disabled={!withUserId || !topic || !proposedDate}
          onClick={() => { actions.requestOneOnOne(userId, withUserId, topic, proposedDate, note); onClose(); }}
        >Send request</Button>
      </Row>
    </Modal>
  );
}

function LogModal({ open, onClose, oneOnOne, actions }) {
  const [notes, setNotes] = useState('');
  if (!oneOnOne) return null;
  return (
    <Modal open={open} onClose={onClose} title={`Log outcome — ${oneOnOne.topic}`}>
      <TextArea label="What was decided / discussed?" value={notes} onChange={setNotes} rows={5} />
      <Row style={{ justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button disabled={!notes.trim()} onClick={() => { actions.completeOneOnOne(oneOnOne.id, notes.trim()); onClose(); }}>Save</Button>
      </Row>
    </Modal>
  );
}
