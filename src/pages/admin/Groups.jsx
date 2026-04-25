import { useState } from 'react';
import { Plus, Layers, Check, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { PageHeader } from '../../components/layout/Shell';
import { Badge, Button, Card, Col, Input, Modal, Row } from '../../components/ui';

export default function Groups() {
  const { state, actions } = useApp();
  const { C } = useTheme();
  const [addOpen, setAddOpen] = useState(false);
  const [edit, setEdit] = useState(null);

  const toggleGoal = (group, goalId) => {
    const goals = group.goals.includes(goalId) ? group.goals.filter((g) => g !== goalId) : [...group.goals, goalId];
    actions.updateGroup(group.id, { goals });
  };

  return (
    <>
      <PageHeader
        title="Groups"
        subtitle="Role-based goal templates. A new user in a group gets these goals by default."
        actions={<Button icon={Plus} onClick={() => setAddOpen(true)}>Add group</Button>}
      />

      <Col gap={12}>
        {state.groups.map((grp) => (
          <Card key={grp.id} hoverable={false}>
            <Row style={{ justifyContent: 'space-between', marginBottom: 10 }}>
              <Row gap={10}>
                <Layers size={16} color={C.accent} />
                <div style={{ color: C.text, fontWeight: 600 }}>{grp.name}</div>
                <Badge color={C.textMuted} bg={C.surface}>{grp.goals.length} goals</Badge>
              </Row>
              <Button size="sm" variant="outline" onClick={() => setEdit(grp)}>Edit goals</Button>
            </Row>
            <Row gap={6} style={{ flexWrap: 'wrap' }}>
              {grp.goals.map((gId) => {
                const meta = state.goalsCatalog.find((g) => g.id === gId);
                return <Badge key={gId} color={C.accent} bg={C.accentDim}>{meta?.title || gId}</Badge>;
              })}
            </Row>
          </Card>
        ))}
      </Col>

      <AddGroupModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={(g) => { actions.addGroup(g); setAddOpen(false); }} />

      <Modal open={!!edit} onClose={() => setEdit(null)} title={`Edit goals — ${edit?.name || ''}`}>
        <Col gap={6}>
          {state.goalsCatalog.map((c) => {
            const included = edit?.goals.includes(c.id);
            return (
              <Row key={c.id} style={{ justifyContent: 'space-between', padding: 8, background: C.surface, borderRadius: 8 }}>
                <div style={{ fontSize: 13, color: C.text }}>{c.title}</div>
                <Button
                  size="sm" variant={included ? 'success' : 'ghost'}
                  icon={included ? Check : X}
                  onClick={() => toggleGoal(edit, c.id)}
                >{included ? 'Included' : 'Add'}</Button>
              </Row>
            );
          })}
        </Col>
      </Modal>
    </>
  );
}

function AddGroupModal({ open, onClose, onAdd }) {
  const [name, setName] = useState('');
  return (
    <Modal open={open} onClose={onClose} title="Add group">
      <Input label="Group name" value={name} onChange={setName} placeholder="e.g., Data Engineer" />
      <Row style={{ justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button disabled={!name.trim()} onClick={() => onAdd({ name: name.trim(), goals: [] })}>Create</Button>
      </Row>
    </Modal>
  );
}
