import { useState } from 'react';
import { Plus, Heart, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { PageHeader } from '../../components/layout/Shell';
import { Badge, Button, Card, Col, EmptyState, Input, Modal, Row, Select, TextArea } from '../../components/ui';
import { formatDate, daysBetween } from '../../lib/format';

const TYPES = ['Medical Leave', 'Personal Emergency', 'Bereavement', 'Sabbatical', 'Parental Leave'];

export default function LifeEvents() {
  const { user, state, actions } = useApp();
  const { C } = useTheme();
  const events = state.lifeEvents[user.id] || [];
  const [open, setOpen] = useState(false);

  const statusColor = (s) => s === 'APPROVED' ? C.success : s === 'REJECTED' ? C.danger : C.warning;
  const statusBg    = (s) => s === 'APPROVED' ? C.successDim : s === 'REJECTED' ? C.dangerDim : C.warningDim;

  return (
    <>
      <PageHeader
        title="Life Events"
        subtitle="Record significant life events. Approved events apply an ethical +0.3%/day uplift (capped at ×1.10) to your rating."
        actions={<Button icon={Plus} onClick={() => setOpen(true)}>Record event</Button>}
      />

      {events.length === 0
        ? <Card><EmptyState icon={Heart} title="No life events recorded" subtitle="Nothing to show — submit one if relevant." action={<Button icon={Plus} onClick={() => setOpen(true)}>Record event</Button>} /></Card>
        : (
          <Col gap={10}>
            {events.map((e) => (
              <Card key={e.id} hoverable={false} style={{ borderLeft: `3px solid ${statusColor(e.status)}` }}>
                <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <Col gap={4}>
                    <Row gap={10}>
                      <div style={{ fontSize: 15, color: C.text, fontWeight: 600 }}>{e.type}</div>
                      <Badge color={statusColor(e.status)} bg={statusBg(e.status)}>{e.status}</Badge>
                    </Row>
                    <div style={{ color: C.textMuted, fontSize: 12 }}>
                      {formatDate(e.start)} → {formatDate(e.end)} · {daysBetween(e.start, e.end)} days
                    </div>
                    <div style={{ color: C.textMuted, fontSize: 13 }}>{e.desc}</div>
                  </Col>
                  {e.status === 'PENDING' && (
                    <Button
                      size="sm" variant="ghost" icon={Trash2}
                      onClick={() => actions.setLifeEvents(user.id, events.filter((x) => x.id !== e.id))}
                    >Withdraw</Button>
                  )}
                </Row>
              </Card>
            ))}
          </Col>
        )}

      <RecordModal open={open} onClose={() => setOpen(false)} onSubmit={(ev) => { actions.addLifeEvent(user.id, ev); setOpen(false); }} />
    </>
  );
}

function RecordModal({ open, onClose, onSubmit }) {
  const [type, setType] = useState(TYPES[0]);
  const [desc, setDesc] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  return (
    <Modal open={open} onClose={onClose} title="Record a life event">
      <Select label="Type" value={type} onChange={setType} options={TYPES.map((t) => ({ value: t, label: t }))} />
      <TextArea label="Description" value={desc} onChange={setDesc} placeholder="Brief context, shared only with your manager." />
      <Row gap={10}>
        <div style={{ flex: 1 }}><Input label="Start date" type="date" value={start} onChange={setStart} /></div>
        <div style={{ flex: 1 }}><Input label="End date" type="date" value={end} onChange={setEnd} /></div>
      </Row>
      <Row style={{ justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button disabled={!type || !desc || !start || !end} onClick={() => onSubmit({ type, desc, start, end })}>Submit for approval</Button>
      </Row>
    </Modal>
  );
}
