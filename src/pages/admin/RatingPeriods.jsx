import { useState } from 'react';
import { Plus, Calendar, ToggleLeft, ToggleRight, Edit } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { PageHeader } from '../../components/layout/Shell';
import { Badge, Button, Card, Col, Input, Modal, Row } from '../../components/ui';
import { formatDate } from '../../lib/format';

export default function RatingPeriods() {
  const { state, actions } = useApp();
  const { C } = useTheme();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(null);

  return (
    <>
      <PageHeader
        title="Rating Periods"
        subtitle="Toggle the active period; ratings apply to the active period. Periods cannot be deleted."
        actions={<Button icon={Plus} onClick={() => setAddOpen(true)}>Add period</Button>}
      />

      <Col gap={10}>
        {state.periods.map((p) => (
          <Card key={p.id} hoverable={false} style={{ borderLeft: `3px solid ${p.isActive ? C.success : C.border}` }}>
            <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <Row gap={10}>
                <Calendar size={16} color={C.accent} />
                <Col gap={2}>
                  <div style={{ color: C.text, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ color: C.textMuted, fontSize: 12 }}>{formatDate(p.start)} → {formatDate(p.end)}</div>
                </Col>
              </Row>
              <Row gap={8}>
                {p.isActive && <Badge color={C.success} bg={C.successDim}>Active</Badge>}
                <Button
                  size="sm" variant="ghost"
                  icon={p.isActive ? ToggleRight : ToggleLeft}
                  onClick={() => actions.updatePeriod(p.id, { isActive: !p.isActive })}
                >{p.isActive ? 'Deactivate' : 'Set active'}</Button>
                <Button size="sm" variant="outline" icon={Edit} onClick={() => setEditOpen(p)}>Edit</Button>
              </Row>
            </Row>
          </Card>
        ))}
      </Col>

      <PeriodModal open={addOpen} onClose={() => setAddOpen(false)} onSubmit={(p) => { actions.addPeriod(p); setAddOpen(false); }} />
      <PeriodModal open={!!editOpen} onClose={() => setEditOpen(null)} period={editOpen} onSubmit={(p) => { actions.updatePeriod(editOpen.id, p); setEditOpen(null); }} />
    </>
  );
}

function PeriodModal({ open, onClose, period, onSubmit }) {
  const [name, setName] = useState(period?.name || '');
  const [start, setStart] = useState(period?.start || '');
  const [end, setEnd] = useState(period?.end || '');
  return (
    <Modal open={open} onClose={onClose} title={period ? 'Edit period' : 'Add period'}>
      <Input label="Name" value={name} onChange={setName} placeholder="H2 2026" />
      <Row gap={10}>
        <div style={{ flex: 1 }}><Input label="Start" type="date" value={start} onChange={setStart} /></div>
        <div style={{ flex: 1 }}><Input label="End" type="date" value={end} onChange={setEnd} /></div>
      </Row>
      <Row style={{ justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button disabled={!name || !start || !end} onClick={() => onSubmit({ name, start, end, isActive: period?.isActive || false })}>Save</Button>
      </Row>
    </Modal>
  );
}
