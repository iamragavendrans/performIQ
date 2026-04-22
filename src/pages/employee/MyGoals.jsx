import { useMemo, useState } from 'react';
import { Plus, Upload, FileText, Percent, Edit, AlertCircle, CheckCircle, Clock, Target } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { PageHeader } from '../../components/layout/Shell';
import { Badge, Button, Card, Col, Input, Modal, ProgressBar, Row, Select, TextArea } from '../../components/ui';
import { GOAL_STATUS, goalStatus, statusBg, statusColor, statusOrder } from '../../lib/compute';
import { formatDate } from '../../lib/format';

const STATUS_ICONS = {
  [GOAL_STATUS.COMPLETED]: CheckCircle,
  [GOAL_STATUS.ON_TRACK]: Target,
  [GOAL_STATUS.NEEDS_ATTENTION]: AlertCircle,
  [GOAL_STATUS.OFF_TRACK]: AlertCircle,
};

export default function MyGoals() {
  const { user, goalsFor, state, actions } = useApp();
  const { C } = useTheme();
  const goals = useMemo(
    () => [...goalsFor(user.id)].sort((a, b) => statusOrder(a.status) - statusOrder(b.status)),
    [goalsFor, user.id]
  );
  const [updateOpen, setUpdateOpen] = useState(null);
  const [weightOpen, setWeightOpen] = useState(null);
  const [proposeOpen, setProposeOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="My Goals"
        subtitle="Ordered by status (needs attention first). Weight changes require manager approval."
        actions={<Button icon={Plus} onClick={() => setProposeOpen(true)}>Self-propose goal</Button>}
      />

      <Col gap={14}>
        {goals.length === 0 && <Card>No goals yet. Self-propose one to get started.</Card>}
        {goals.map((g) => {
          const Icon = STATUS_ICONS[g.status] || Target;
          const pendingProposal = g.selfProposed && g.proposalStatus === 'PENDING';
          const rejectedProposal = g.selfProposed && g.proposalStatus === 'REJECTED';
          return (
            <Card key={g.id} hoverable={false} style={{ borderLeft: `3px solid ${statusColor(g.status, C)}` }}>
              <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, flexWrap: 'wrap', gap: 10 }}>
                <Col gap={4} style={{ flex: 1, minWidth: 240 }}>
                  <Row gap={8}>
                    <Icon size={16} color={statusColor(g.status, C)} />
                    <div style={{ color: C.text, fontSize: 15, fontWeight: 600 }}>{g.title}</div>
                    {g.selfProposed && (
                      <Badge
                        color={pendingProposal ? C.warning : rejectedProposal ? C.danger : C.purple}
                        bg={pendingProposal ? C.warningDim : rejectedProposal ? C.dangerDim : C.purpleDim}
                      >
                        {pendingProposal ? 'Awaiting approval' : rejectedProposal ? 'Rejected' : 'Self-proposed'}
                      </Badge>
                    )}
                    {g.overdue && <Badge color={C.danger} bg={C.dangerDim}>Overdue</Badge>}
                  </Row>
                  <div style={{ color: C.textMuted, fontSize: 12 }}>
                    Weight {g.weight}% · Due {formatDate(g.dueDate)} · {g.updates.length} updates · {g.files.length} files
                  </div>
                </Col>
                <Row gap={8}>
                  <Button size="sm" variant="outline" icon={Percent} onClick={() => setWeightOpen(g)} disabled={pendingProposal}>Weight</Button>
                  <Button size="sm" icon={Edit} onClick={() => setUpdateOpen(g)} disabled={pendingProposal}>Update</Button>
                </Row>
              </Row>

              <Row gap={12} style={{ marginBottom: 8 }}>
                <div style={{ flex: 1 }}><ProgressBar value={g.completion} color={statusColor(g.status, C)} /></div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, minWidth: 52, textAlign: 'right' }}>{g.completion}%</div>
              </Row>

              {g.updates.length > 0 && (
                <details>
                  <summary style={{ color: C.textMuted, fontSize: 12, cursor: 'pointer', padding: '4px 0' }}>
                    Updates log ({g.updates.length})
                  </summary>
                  <Col gap={6} style={{ marginTop: 8, paddingLeft: 8, borderLeft: `2px solid ${C.border}` }}>
                    {[...g.updates].reverse().map((u, i) => (
                      <Row key={i} gap={10} style={{ fontSize: 12, color: C.textMuted }}>
                        <Clock size={12} /><span>{formatDate(u.date)}</span>
                        <span style={{ color: C.text, fontWeight: 600 }}>{u.pct}%</span>
                        <span>{u.note}</span>
                      </Row>
                    ))}
                  </Col>
                </details>
              )}

              {g.files.length > 0 && (
                <Row gap={6} style={{ marginTop: 10, flexWrap: 'wrap' }}>
                  {g.files.map((f, i) => (
                    <Badge key={i} color={C.cyan} bg={C.cyanDim}><FileText size={11} />{f.name}</Badge>
                  ))}
                </Row>
              )}
            </Card>
          );
        })}
      </Col>

      <UpdateModal open={!!updateOpen} onClose={() => setUpdateOpen(null)} goal={updateOpen} userId={user.id} actions={actions} />
      <WeightModal open={!!weightOpen} onClose={() => setWeightOpen(null)} goal={weightOpen} userId={user.id} actions={actions} />
      <ProposeModal open={proposeOpen} onClose={() => setProposeOpen(false)} userId={user.id} catalog={state.goalsCatalog} actions={actions} />
    </>
  );
}

function UpdateModal({ open, onClose, goal, userId, actions }) {
  const [pct, setPct] = useState(goal?.completion ?? 0);
  const [note, setNote] = useState('');
  const [file, setFile] = useState('');
  if (!goal) return null;
  return (
    <Modal open={open} onClose={onClose} title={`Update progress — ${goal.title}`}>
      <Input label="New completion %" type="number" value={pct} onChange={(v) => setPct(Math.max(0, Math.min(100, Number(v) || 0)))} />
      <TextArea label="What changed?" value={note} onChange={setNote} placeholder="Shipped milestone X, reviewed with team…" />
      <Input label="Attach a file (name)" value={file} onChange={setFile} placeholder="design-review.pdf" />
      <Row style={{ justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button
          icon={goalStatus(pct) === GOAL_STATUS.COMPLETED ? CheckCircle : Upload}
          onClick={() => {
            actions.addGoalUpdate(userId, goal.id, Number(pct), note);
            if (file.trim()) actions.addGoalFile(userId, goal.id, { name: file.trim(), uploadedOn: new Date().toISOString().slice(0, 10) });
            onClose();
          }}
        >Save update</Button>
      </Row>
    </Modal>
  );
}

function WeightModal({ open, onClose, goal, userId, actions }) {
  const [newWeight, setNewWeight] = useState(goal?.weight ?? 20);
  const [reason, setReason] = useState('');
  if (!goal) return null;
  return (
    <Modal open={open} onClose={onClose} title="Request weight change">
      <p style={{ fontSize: 13, color: '#888', marginBottom: 14 }}>Changes to goal weight require manager approval before they affect your rating.</p>
      <Input label="Current weight" value={`${goal.weight}%`} onChange={() => {}} />
      <Input label="Proposed weight" type="number" value={newWeight} onChange={(v) => setNewWeight(Math.max(0, Math.min(100, Number(v) || 0)))} />
      <TextArea label="Reason" value={reason} onChange={setReason} placeholder="Shift focus because…" />
      <Row style={{ justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => { actions.requestWeightChange(userId, goal.id, Number(newWeight), reason); onClose(); }}
          disabled={Number(newWeight) === goal.weight}
        >Request</Button>
      </Row>
    </Modal>
  );
}

function ProposeModal({ open, onClose, userId, catalog, actions }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [weight, setWeight] = useState(10);
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');
  const categoryOptions = [{ value: '', label: 'Select category' }, ...[...new Set(catalog.map((c) => c.category))].map((c) => ({ value: c, label: c }))];
  return (
    <Modal open={open} onClose={onClose} title="Self-propose a goal">
      <p style={{ fontSize: 13, color: '#888', marginBottom: 14 }}>
        Describe a goal you're already working on. Your manager will review and approve; once approved it will contribute to your rating.
      </p>
      <Input label="Goal title" value={title} onChange={setTitle} placeholder="e.g., Add dark-mode tokens to design system" />
      <Select label="Category" value={category} onChange={setCategory} options={categoryOptions} />
      <Input label="Proposed weight (%)" type="number" value={weight} onChange={(v) => setWeight(Math.max(0, Math.min(50, Number(v) || 0)))} />
      <Input label="Target due date" type="date" value={dueDate} onChange={setDueDate} />
      <TextArea label="Notes for your manager" value={note} onChange={setNote} placeholder="Context and expected impact…" />
      <Row style={{ justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button
          disabled={!title.trim() || !category || !dueDate}
          onClick={() => { actions.proposeSelfGoal(userId, { title: title.trim(), category, weight, dueDate, note }); onClose(); }}
        >Send for approval</Button>
      </Row>
    </Modal>
  );
}
