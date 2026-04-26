import { useEffect, useRef, useState } from 'react';
import { Heart, Plus, Pencil, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { PageHeader } from '../../components/layout/Shell';
import { Badge, Button, Card, Col, ConfirmDialog, EmptyState, Input, Modal, Row } from '../../components/ui';

export default function LifeEventConfig() {
  const { state, actions } = useApp();
  const { C } = useTheme();
  const types = state.lifeEventTypes || [];
  const [editing, setEditing] = useState(null); // { id?, name, impact } | null
  const [confirmRemove, setConfirmRemove] = useState(null);

  const inUseCount = (typeName) =>
    Object.values(state.lifeEvents || {}).flat().filter((e) => e.type === typeName).length;

  return (
    <>
      <PageHeader
        title="Life Events"
        subtitle="Configure the life event types and their per-day impact multipliers used in empathy-aware rating uplifts."
        actions={<Button icon={Plus} onClick={() => setEditing({ name: '', impact: 1.00 })}>Add type</Button>}
      />

      <Card hoverable={false} style={{ marginBottom: 16 }}>
        <Row gap={10}>
          <Heart size={16} color={C.cyan} />
          <div style={{ color: C.textMuted, fontSize: 13, lineHeight: 1.5 }}>
            <b style={{ color: C.text }}>How this works:</b> Approved life events boost an employee&apos;s adjusted rating
            by 0.3 points per <i>weighted day</i> (days × impact), capped at +10 points. Higher impact values give
            more weight per day. Existing events keep their original type name; renaming a type only affects new events.
          </div>
        </Row>
      </Card>

      {types.length === 0 ? (
        <Card>
          <EmptyState
            icon={Heart}
            title="No life event types configured"
            subtitle="Add at least one type so employees can record life events."
            action={<Button icon={Plus} onClick={() => setEditing({ name: '', impact: 1.00 })}>Add type</Button>}
          />
        </Card>
      ) : (
        <Col gap={8}>
          {types.map((t) => {
            const usage = inUseCount(t.name);
            return (
              <Card key={t.id} hoverable={false}>
                <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <Row gap={10}>
                    <Heart size={16} color={C.cyan} />
                    <Col gap={2}>
                      <div style={{ color: C.text, fontWeight: 600 }}>{t.name}</div>
                      <div style={{ color: C.textMuted, fontSize: 12 }}>
                        Per-day impact ×{Number(t.impact).toFixed(2)}
                        {usage > 0 && <> · in use by {usage} event{usage === 1 ? '' : 's'}</>}
                      </div>
                    </Col>
                  </Row>
                  <Row gap={6}>
                    <Badge color={C.cyan} bg={C.cyanDim}>×{Number(t.impact).toFixed(2)}</Badge>
                    <Button size="sm" variant="ghost" icon={Pencil} onClick={() => setEditing(t)}>Edit</Button>
                    <Button size="sm" variant="ghost" icon={Trash2} onClick={() => setConfirmRemove(t)}>Remove</Button>
                  </Row>
                </Row>
              </Card>
            );
          })}
        </Col>
      )}

      <EditModal
        editing={editing}
        existing={types}
        onClose={() => setEditing(null)}
        onSave={(payload) => {
          if (editing?.id) actions.updateLifeEventType(editing.id, payload);
          else actions.addLifeEventType(payload);
          setEditing(null);
        }}
      />

      <ConfirmDialog
        open={!!confirmRemove}
        onClose={() => setConfirmRemove(null)}
        onConfirm={() => { if (confirmRemove) actions.removeLifeEventType(confirmRemove.id); }}
        title="Remove life event type?"
        message={confirmRemove
          ? `Remove "${confirmRemove.name}"? Existing recorded events will keep their type label but new events can no longer use it.`
          : ''}
        confirmText="Remove"
        variant="danger"
      />
    </>
  );
}

function EditModal({ editing, existing, onClose, onSave }) {
  const [name, setName] = useState('');
  const [impact, setImpact] = useState(1.00);

  // Sync local form state with the row being edited each time the modal opens.
  const last = useRef(null);
  useEffect(() => {
    if (editing && last.current !== editing) {
      setName(editing.name || '');
      setImpact(editing.impact ?? 1.00);
      last.current = editing;
    }
    if (!editing) last.current = null;
  }, [editing]);

  const trimmed = name.trim();
  const duplicate = existing.some((t) => t.name.toLowerCase() === trimmed.toLowerCase() && t.id !== editing?.id);
  const valid = trimmed && !duplicate && impact >= 0 && impact <= 5;

  return (
    <Modal open={!!editing} onClose={onClose} title={editing?.id ? 'Edit life event type' : 'Add life event type'}>
      <Input label="Type name" value={name} onChange={setName} placeholder="e.g. Caregiving Leave" />
      <Input
        label="Per-day impact multiplier (0.00 - 5.00)"
        type="number"
        value={impact}
        onChange={(v) => setImpact(Math.max(0, Math.min(5, Number(v) || 0)))}
      />
      {duplicate && (
        <div style={{ color: '#ef4444', fontSize: 12, marginTop: -8, marginBottom: 10 }}>
          A type with this name already exists.
        </div>
      )}
      <Row style={{ justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button disabled={!valid} onClick={() => onSave({ name: trimmed, impact: Number(impact) })}>
          {editing?.id ? 'Save' : 'Add'}
        </Button>
      </Row>
    </Modal>
  );
}
