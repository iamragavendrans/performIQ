import { useMemo, useState } from 'react';
import { Plus, Upload, FileText, Percent, Edit, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { PageHeader } from '../../components/layout/Shell';
import { Badge, Button, Card, Col, Input, Modal, ProgressBar, Row, Select, Tabs, TextArea } from '../../components/ui';
import GoalsRadar from '../../components/ui/GoalsRadar';
import { GOAL_STATUS, goalStatus } from '../../lib/compute';
import { formatDate, daysLeft } from '../../lib/format';
import { buildGoalColorMap } from '../../lib/colors';

const TABS = [
  { id: 'ALL', label: 'All' },
  { id: GOAL_STATUS.OFF_TRACK, label: 'Off track' },
  { id: GOAL_STATUS.NEEDS_ATTENTION, label: 'Needs attention' },
  { id: GOAL_STATUS.ON_TRACK, label: 'On track' },
  { id: GOAL_STATUS.COMPLETED, label: 'Completed' },
];

const SORTS = {
  DUE_ASC:    { label: 'Due date (soonest first)', cmp: (a, b) => new Date(a.dueDate) - new Date(b.dueDate) },
  WEIGHT_DESC:{ label: 'Weight (high → low)',      cmp: (a, b) => (b.weight || 0) - (a.weight || 0) },
  RISK_FIRST: { label: 'Risk (at-risk first)',     cmp: (a, b) => {
    // Off-track goals first; then by days-left ascending.
    const risk = (g) => (g.status === GOAL_STATUS.OFF_TRACK ? 0 : g.status === GOAL_STATUS.NEEDS_ATTENTION ? 1 : g.status === GOAL_STATUS.ON_TRACK ? 2 : 3);
    const d = risk(a) - risk(b);
    if (d !== 0) return d;
    return daysLeft(a.dueDate) - daysLeft(b.dueDate);
  } },
};

export default function MyGoals() {
  const { user, goalsFor, state, actions, pageParams } = useApp();
  const { C } = useTheme();
  const [statusFilter, setStatusFilter] = useState(pageParams?.filter || 'ALL');
  const [sortKey, setSortKey] = useState('RISK_FIRST');

  const allGoals = useMemo(() => goalsFor(user.id), [goalsFor, user.id]);
  const colorMap = useMemo(() => buildGoalColorMap(allGoals), [allGoals]);

  const goals = useMemo(() => {
    const filtered = statusFilter === 'ALL' ? allGoals : allGoals.filter((g) => g.status === statusFilter);
    return [...filtered].sort(SORTS[sortKey].cmp);
  }, [allGoals, statusFilter, sortKey]);

  const [updateOpen, setUpdateOpen] = useState(null);
  const [weightOpen, setWeightOpen] = useState(null);
  const [proposeOpen, setProposeOpen] = useState(false);

  const counts = useMemo(() => {
    const c = { ALL: allGoals.length };
    Object.values(GOAL_STATUS).forEach((s) => { c[s] = allGoals.filter((g) => g.status === s).length; });
    return c;
  }, [allGoals]);

  return (
    <>
      <PageHeader
        title="My Goals"
        subtitle="Weights are static — completion is not. Manager approval is required to change a weight."
        actions={<Button icon={Plus} onClick={() => setProposeOpen(true)}>Self-propose goal</Button>}
      />

      <GoalsAtAGlance goals={allGoals} colorMap={colorMap} C={C} />

      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 320 }}>
          <Tabs
            tabs={TABS.map((t) => ({ id: t.id, label: `${t.label}${counts[t.id] != null ? ` (${counts[t.id]})` : ''}` }))}
            active={statusFilter}
            onChange={setStatusFilter}
          />
        </div>
        <Select
          value={sortKey}
          onChange={setSortKey}
          options={Object.entries(SORTS).map(([k, v]) => ({ value: k, label: `Sort: ${v.label}` }))}
          style={{ minWidth: 220, marginBottom: 0 }}
        />
      </Row>

      <Col gap={12}>
        {goals.length === 0 && <Card>No goals in this view.</Card>}
        {goals.map((g) => (
          <GoalCard
            key={g.id} goal={g} color={colorMap[g.id]} C={C}
            onUpdate={() => setUpdateOpen(g)}
            onWeight={() => setWeightOpen(g)}
          />
        ))}
      </Col>

      <UpdateModal open={!!updateOpen} onClose={() => setUpdateOpen(null)} goal={updateOpen} userId={user.id} actions={actions} />
      <WeightModal open={!!weightOpen} onClose={() => setWeightOpen(null)} goal={weightOpen} userId={user.id} actions={actions} />
      <ProposeModal open={proposeOpen} onClose={() => setProposeOpen(false)} userId={user.id} catalog={state.goalsCatalog} actions={actions} />
    </>
  );
}

function UpdateModal({ open, onClose, goal, userId, actions }) {
  const [raw, setRaw] = useState('');
  const [note, setNote] = useState('');
  const [file, setFile] = useState('');
  if (!goal) return null;

  const n = Number(raw === '' ? goal?.completion ?? 0 : raw);
  const error =
    raw !== '' && (Number.isNaN(n) ? 'Enter a number between 0 and 100.' :
                   n > 100 ? 'Progress cannot exceed 100%.' :
                   n < 0 ? 'Progress cannot be negative.' :
                   null);
  const pct = Math.max(0, Math.min(100, Number.isNaN(n) ? (goal?.completion ?? 0) : n));

  return (
    <Modal open={open} onClose={onClose} title={`Update progress — ${goal.title}`}>
      <Input
        label="New completion %"
        type="number"
        value={raw === '' ? goal?.completion ?? 0 : raw}
        onChange={setRaw}
      />
      {error && (
        <div style={{ color: '#ef4444', fontSize: 12, marginTop: -8, marginBottom: 10 }}>{error}</div>
      )}
      <TextArea label="What changed?" value={note} onChange={setNote} placeholder="Shipped milestone X, reviewed with team…" />
      <Input label="Attach a file (name)" value={file} onChange={setFile} placeholder="design-review.pdf" />
      <Row style={{ justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button
          icon={goalStatus(pct) === GOAL_STATUS.COMPLETED ? CheckCircle : Upload}
          disabled={!!error}
          onClick={() => {
            actions.addGoalUpdate(userId, goal.id, pct, note);
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
        Describe a goal you&rsquo;re already working on. Your manager will review and approve; once approved it will contribute to your rating.
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

// Marimekko-style chart: column width ∝ goal weight, filled height ∝ completion.
// Bigger-weighted goals take up more visual real estate, so "where should I
// focus?" becomes obvious at a glance.
function GoalsAtAGlance({ goals, colorMap, C }) {
  if (!goals.length) return null;
  const eligible = goals.filter((g) => !g.selfProposed || g.proposalStatus === 'APPROVED');
  if (!eligible.length) return null;

  return (
    <Card hoverable={false} style={{ marginBottom: 16 }}>
      <Row style={{ justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ color: C.text, fontSize: 15, fontWeight: 700 }}>Goals at a glance</div>
          <div style={{ color: C.textMuted, fontSize: 12 }}>
            Arc angle = weight · radius = completion (capped at 100%)
          </div>
        </div>
      </Row>

      <Row gap={20} style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: '0 0 auto' }}>
          <GoalsRadar goals={eligible} colorMap={colorMap} size={300} />
        </div>
        <Col gap={10} style={{ flex: 1, minWidth: 220 }}>
          {eligible.map((g) => (
            <Row key={g.id} gap={10} style={{ alignItems: 'center' }}>
              <span style={{
                width: 12, height: 12, borderRadius: 3,
                background: colorMap[g.id], flexShrink: 0,
              }} />
              <Col gap={2} style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  color: C.text, fontSize: 13, fontWeight: 600,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{g.title}</div>
                <div style={{ color: C.textMuted, fontSize: 11 }}>
                  Weight {g.weight}% · {g.completion}% complete
                </div>
              </Col>
            </Row>
          ))}
        </Col>
      </Row>
    </Card>
  );
}

// 3-row goal card:
//   Top:    goal id chip + title + emphasized due-date pill
//   Middle: weight chip + dominant progress bar + completion %
//   Bottom: "Last updated …" preview + Edit weight + Update buttons (collapsible
//           updates log expands inline)
function GoalCard({ goal, color, C, onUpdate, onWeight }) {
  const pendingProposal = goal.selfProposed && goal.proposalStatus === 'PENDING';
  const rejectedProposal = goal.selfProposed && goal.proposalStatus === 'REJECTED';
  const dLeft = daysLeft(goal.dueDate);
  const dueColor = dLeft < 0 ? C.danger : dLeft <= 7 ? C.warning : C.textMuted;
  const dueLabel = dLeft < 0
    ? `${Math.abs(dLeft)}d overdue`
    : dLeft === 0 ? 'Due today'
    : `${dLeft}d left`;

  const updates = [...(goal.updates || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
  const lastUpdate = updates[0];
  const lastUpdateAgo = lastUpdate
    ? Math.max(0, Math.floor((Date.now() - new Date(lastUpdate.date).getTime()) / 86400000))
    : null;

  // Short, stable goal id chip — first 6 chars of catalog id, or 'SELF' if proposed.
  const idChip = goal.selfProposed ? 'SELF' : (goal.goalId || '').replace(/^g_/, '').slice(0, 6).toUpperCase();

  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 14,
      padding: '14px 18px',
      borderLeft: `4px solid ${color}`,
    }}>
      {/* Row 1: title / id / due date */}
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
        <Row gap={10} style={{ flex: 1, minWidth: 240 }}>
          <span style={{
            background: color + '22', color, fontSize: 10, fontWeight: 800, letterSpacing: 0.6,
            padding: '4px 8px', borderRadius: 6, flexShrink: 0,
          }}>{idChip}</span>
          <Col gap={2} style={{ minWidth: 0 }}>
            <div style={{ color: C.text, fontSize: 15, fontWeight: 700 }}>{goal.title}</div>
            <Row gap={8} style={{ flexWrap: 'wrap' }}>
              {goal.selfProposed && (
                <Badge
                  color={pendingProposal ? C.warning : rejectedProposal ? C.danger : C.purple}
                  bg={pendingProposal ? C.warningDim : rejectedProposal ? C.dangerDim : C.purpleDim}
                >
                  {pendingProposal ? 'Awaiting approval' : rejectedProposal ? 'Rejected' : 'Self-proposed'}
                </Badge>
              )}
            </Row>
          </Col>
        </Row>
        <span style={{
          padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700,
          color: dueColor, background: dueColor + '22',
        }}>{dueLabel} · {formatDate(goal.dueDate)}</span>
      </Row>

      {/* Row 2: progress is the headline visual */}
      <Row gap={12} style={{ marginBottom: 12, alignItems: 'center' }}>
        <span style={{
          fontSize: 11, fontWeight: 700, color: C.purple, background: C.purpleDim,
          padding: '4px 10px', borderRadius: 999, flexShrink: 0,
        }}>w {goal.weight}%</span>
        <div style={{ flex: 1 }}>
          <ProgressBar value={goal.completion} color={color} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: C.text, minWidth: 56, textAlign: 'right' }}>
          {goal.completion}%
        </div>
      </Row>

      {/* Row 3: footer — last update preview + actions, collapsed details */}
      <Row style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <Col gap={2} style={{ flex: 1, minWidth: 200 }}>
          {lastUpdate ? (
            <details>
              <summary style={{ color: C.textMuted, fontSize: 12, cursor: 'pointer', listStyle: 'none' }}>
                Last updated {lastUpdateAgo === 0 ? 'today' : `${lastUpdateAgo} day${lastUpdateAgo === 1 ? '' : 's'} ago`} · {goal.updates.length} update{goal.updates.length === 1 ? '' : 's'}
                {goal.files.length > 0 && ` · ${goal.files.length} file${goal.files.length === 1 ? '' : 's'}`}
              </summary>
              <Col gap={6} style={{ marginTop: 8, paddingLeft: 8, borderLeft: `2px solid ${C.border}` }}>
                {updates.map((u, i) => (
                  <Row key={i} gap={10} style={{ fontSize: 12, color: C.textMuted, alignItems: 'flex-start' }}>
                    <span style={{ minWidth: 76 }}>{formatDate(u.date)}</span>
                    <span style={{ color: C.text, fontWeight: 700, minWidth: 36 }}>{u.pct}%</span>
                    <span style={{ flex: 1 }}>{u.note}</span>
                  </Row>
                ))}
                {goal.files.length > 0 && (
                  <Row gap={6} style={{ marginTop: 6, flexWrap: 'wrap' }}>
                    {goal.files.map((f, i) => (
                      <Badge key={i} color={C.cyan} bg={C.cyanDim}><FileText size={11} />{f.name}</Badge>
                    ))}
                  </Row>
                )}
              </Col>
            </details>
          ) : (
            <div style={{ color: C.textSub, fontSize: 12 }}>No updates yet — log progress to start the trail.</div>
          )}
        </Col>
        <Row gap={6}>
          <Button size="sm" variant="ghost" icon={Percent} onClick={onWeight} disabled={pendingProposal}>Edit weight</Button>
          <Button size="sm" icon={Edit} onClick={onUpdate} disabled={pendingProposal}>Update progress</Button>
        </Row>
      </Row>
    </div>
  );
}
