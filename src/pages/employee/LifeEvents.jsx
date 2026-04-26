import { useState } from 'react';
import { Plus, Heart, Trash2, EyeOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { PageHeader } from '../../components/layout/Shell';
import { Badge, Button, Card, Col, EmptyState, Input, Modal, Row, Select, TextArea } from '../../components/ui';
import { formatDate, daysBetween } from '../../lib/format';
import { lifeEventImpact, lifeEventScore } from '../../lib/compute';

const FILTERS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];

export default function LifeEvents() {
  const { user, state, actions, pageParams } = useApp();
  const { C } = useTheme();
  const types = state.lifeEventTypes || [];
  const allEvents = state.lifeEvents[user.id] || [];
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState(pageParams?.filter || 'ALL');
  const events = filter === 'ALL' ? allEvents : allEvents.filter((e) => e.status === filter);

  const statusColor = (s) => s === 'APPROVED' ? C.success : s === 'REJECTED' ? C.danger : C.warning;
  const statusBg    = (s) => s === 'APPROVED' ? C.successDim : s === 'REJECTED' ? C.dangerDim : C.warningDim;

  return (
    <>
      <PageHeader
        title="Life Events"
        subtitle="Record significant life events that affected your work. Approved events become a small empathy-aware uplift on your rating."
        actions={<Button icon={Plus} onClick={() => setOpen(true)}>Record event</Button>}
      />

      <Row gap={8} style={{
        marginBottom: 16, padding: '10px 12px', borderRadius: 10,
        background: C.surface, border: `1px solid ${C.border}`, alignItems: 'center',
      }}>
        <EyeOff size={14} color={C.textMuted} />
        <div style={{ color: C.textMuted, fontSize: 12, lineHeight: 1.5 }}>
          <b style={{ color: C.text }}>Visibility:</b> only you and your direct manager (and admin, for audit) can see life events. They are never shown to peers or the team.
        </div>
      </Row>

      <Row gap={6} style={{ marginBottom: 14, flexWrap: 'wrap' }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
              cursor: 'pointer',
              background: filter === f ? C.accent : 'transparent',
              color: filter === f ? '#fff' : C.textMuted,
              border: `1px solid ${filter === f ? C.accent : C.border}`,
            }}
          >{f}</button>
        ))}
      </Row>

      {events.length === 0
        ? <Card><EmptyState
            icon={Heart}
            title={filter === 'ALL' ? 'No life events recorded' : 'Nothing matching this filter'}
            subtitle={filter === 'ALL'
              ? 'Add one if something outside work impacted your performance this cycle. Only your manager will see it.'
              : 'Try a different filter or submit a new event.'}
            action={<Button icon={Plus} onClick={() => setOpen(true)}>Record event</Button>}
          /></Card>
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
                      · impact ×{lifeEventImpact(e.type, types).toFixed(2)}
                    </div>
                    <div style={{ color: C.textMuted, fontSize: 13 }}>{e.desc}</div>
                    {e.status === 'APPROVED' && (
                      <div style={{ color: C.cyan, fontSize: 12, marginTop: 4 }}>
                        Contributes {lifeEventScore(e, types).weightedDays.toFixed(1)} weighted days
                        ({daysBetween(e.start, e.end)} × {lifeEventImpact(e.type, types).toFixed(2)}) to your empathy uplift.
                      </div>
                    )}
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

      <RecordModal open={open} onClose={() => setOpen(false)} types={types} onSubmit={(ev) => { actions.addLifeEvent(user.id, ev); setOpen(false); }} />
    </>
  );
}

function RecordModal({ open, onClose, onSubmit, types }) {
  const typeNames = types.map((t) => t.name);
  const [type, setType] = useState(typeNames[0] || '');
  const [desc, setDesc] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  // Live preview of estimated uplift while the user fills the form. Same math
  // as computeRating: 0.3 pts per (days × type impact), capped at 10.
  const days = (start && end) ? Math.max(0, daysBetween(start, end)) : 0;
  const impact = lifeEventImpact(type, types);
  const weighted = days * impact;
  const upliftPts = Math.min(10, weighted * 0.3);
  const datesValid = !start || !end || new Date(end) >= new Date(start);

  return (
    <Modal open={open} onClose={onClose} title="Record a life event">
      <Select label="Type" value={type} onChange={setType} options={typeNames.map((t) => ({ value: t, label: `${t} (impact ×${lifeEventImpact(t, types).toFixed(2)})` }))} />
      <TextArea label="Description" value={desc} onChange={setDesc} placeholder="Brief context, shared only with your manager." />
      <Row gap={10}>
        <div style={{ flex: 1 }}><Input label="Start date" type="date" value={start} onChange={setStart} /></div>
        <div style={{ flex: 1 }}><Input label="End date" type="date" value={end} onChange={setEnd} /></div>
      </Row>
      {!datesValid && (
        <div style={{ color: '#ef4444', fontSize: 12, marginTop: -8, marginBottom: 10 }}>
          End date must be on or after start date.
        </div>
      )}
      <div style={{
        padding: 12, background: 'rgba(6,182,212,0.10)', border: '1px solid rgba(6,182,212,0.35)',
        borderRadius: 10, marginBottom: 12, fontSize: 12, lineHeight: 1.55,
      }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Estimated uplift if approved</div>
        {days > 0 ? (
          <>
            {days} days × type impact {impact.toFixed(2)} = {weighted.toFixed(1)} weighted days
            <br />
            ≈ <b>+{upliftPts.toFixed(1)} points</b> on your rating
            {weighted * 0.3 > 10 && <> (capped at +10 — cap reached)</>}.
          </>
        ) : (
          <>Pick start and end dates to see the estimate. The bonus is 0.3 points per weighted day, capped at +10.</>
        )}
      </div>
      <Row style={{ justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button
          disabled={!type || !desc || !start || !end || !datesValid}
          onClick={() => onSubmit({ type, desc, start, end })}
        >Submit for approval</Button>
      </Row>
    </Modal>
  );
}
