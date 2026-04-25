import { useMemo, useState } from 'react';
import { Plus, ArrowUp, ChevronDown, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { PageHeader } from '../../components/layout/Shell';
import { Avatar, Button, Card, Col, Input, Modal, ProgressBar, Row, Select } from '../../components/ui';
import { goalStatus, statusColor } from '../../lib/compute';
import { ROLES } from '../../lib/roles';

export default function MyTeam() {
  const { user, teamFor, goalsFor, state, actions, computeRatingFor } = useApp();
  const { C } = useTheme();
  const team = teamFor(user.id);
  const [assignOpen, setAssignOpen] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [promoteOpen, setPromoteOpen] = useState(false);
  // Goals are collapsed per spec to reduce cognitive load — click the member
  // header row to toggle. Using a Set so multiple members can be opened.
  const [openMembers, setOpenMembers] = useState(() => new Set());
  const toggleMember = (id) => setOpenMembers((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const isDirector = user.role === ROLES.DIRECTOR;

  // For each member, if they themselves have reports, the avg adjusted rating of their reports.
  const teamAvgFor = (memberId) => {
    const reports = state.users.filter((u) => u.managerId === memberId);
    if (!reports.length) return null;
    return reports.reduce((s, r) => s + computeRatingFor(r.id).adjusted, 0) / reports.length;
  };

  // Deduplicated list of all goal catalog entries active across the team.
  const activeGoalIds = useMemo(() => {
    const s = new Set();
    team.forEach((m) => goalsFor(m.id).forEach((g) => !g.selfProposed && s.add(g.goalId)));
    return [...s];
  }, [team, goalsFor]);

  const heatmapCell = (memberId, goalId) => {
    const g = goalsFor(memberId).find((x) => x.goalId === goalId && !x.selfProposed);
    if (!g) return null;
    return g.completion;
  };

  return (
    <>
      <PageHeader
        title={isDirector ? 'My Managers' : 'My Team'}
        subtitle={isDirector
          ? 'Each manager and the rolled-up rating of the team they lead — you are accountable for both.'
          : 'Deduplicated goal × member heatmap. Numbers show completion %.'}
        actions={
          <Row gap={8}>
            {isDirector && (
              <Button variant="outline" icon={ArrowUp} onClick={() => setPromoteOpen(true)}>Promote IC to manager</Button>
            )}
            <Button icon={Plus} onClick={() => setAddOpen(true)}>
              {isDirector ? 'Add manager' : 'Add member'}
            </Button>
          </Row>
        }
      />

      <Card hoverable={false} style={{ marginBottom: 20, overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 12, minWidth: 560 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 8, color: C.textMuted, borderBottom: `1px solid ${C.border}` }}>Member</th>
              {activeGoalIds.map((gId) => {
                const meta = state.goalsCatalog.find((g) => g.id === gId);
                return (
                  <th key={gId} style={{ padding: 8, color: C.textMuted, borderBottom: `1px solid ${C.border}`, textAlign: 'center', minWidth: 90 }}>
                    {meta?.title?.split(' ').slice(0, 3).join(' ') || gId}
                  </th>
                );
              })}
              {isDirector && (
                <th style={{ padding: 8, color: C.textMuted, borderBottom: `1px solid ${C.border}`, textAlign: 'center', minWidth: 110, borderLeft: `1px solid ${C.border}` }}>
                  Team avg
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {team.map((m) => {
              const teamAvg = teamAvgFor(m.id);
              return (
                <tr key={m.id}>
                  <td style={{ padding: 8, borderBottom: `1px solid ${C.border}` }}>
                    <Row gap={8}>
                      <Avatar name={m.name} color={m.avatar} size={28} />
                      <Col gap={0}>
                        <div style={{ color: C.text, fontWeight: 600 }}>{m.name}</div>
                        <div style={{ color: C.textSub, fontSize: 11 }}>{m.title}</div>
                      </Col>
                    </Row>
                  </td>
                  {activeGoalIds.map((gId) => {
                    const v = heatmapCell(m.id, gId);
                    const color = v == null ? 'transparent' : statusColor(goalStatus(v), C) + '33';
                    const textColor = v == null ? C.textSub : statusColor(goalStatus(v), C);
                    return (
                      <td key={gId} style={{
                        padding: 8, borderBottom: `1px solid ${C.border}`, textAlign: 'center',
                        background: color, color: textColor, fontWeight: 700,
                      }}>
                        {v == null ? '—' : `${v}%`}
                      </td>
                    );
                  })}
                  {isDirector && (
                    <td style={{
                      padding: 8, borderBottom: `1px solid ${C.border}`, textAlign: 'center',
                      background: teamAvg == null ? 'transparent' : statusColor(goalStatus(teamAvg), C) + '33',
                      color: teamAvg == null ? C.textSub : statusColor(goalStatus(teamAvg), C),
                      fontWeight: 700, borderLeft: `1px solid ${C.border}`,
                    }}>
                      {teamAvg == null ? '—' : `${teamAvg.toFixed(1)}`}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Col gap={12}>
        {team.map((m) => {
          const mGoals = goalsFor(m.id);
          const open = openMembers.has(m.id);
          const Chevron = open ? ChevronDown : ChevronRight;
          return (
            <Card key={m.id} hoverable={false}>
              <Row
                style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, cursor: 'pointer' }}
                onClick={() => toggleMember(m.id)}
              >
                <Row gap={10}>
                  <Chevron size={16} color={C.textMuted} />
                  <Avatar name={m.name} color={m.avatar} size={38} />
                  <Col gap={2}>
                    <div style={{ color: C.text, fontWeight: 600 }}>{m.name}</div>
                    <div style={{ color: C.textMuted, fontSize: 12 }}>
                      {m.title} · {m.email} · {mGoals.length} goal{mGoals.length === 1 ? '' : 's'}
                    </div>
                  </Col>
                </Row>
                <Button
                  size="sm" icon={Plus}
                  onClick={(e) => { e.stopPropagation(); setAssignOpen(m); }}
                >Assign goal</Button>
              </Row>
              {open && (
                <Col gap={8} style={{ marginTop: 12 }}>
                  {mGoals.map((g) => {
                    const tone = statusColor(goalStatus(g.completion), C);
                    const contribution = ((g.completion || 0) * (g.weight || 0)) / 100;
                    return (
                      <div
                        key={g.id}
                        title={`${g.title}\nCompletion: ${g.completion}%\nWeight: ${g.weight || 0}%\nContribution to rating: ${contribution.toFixed(1)} pts`}
                      >
                        <Row style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                          <div style={{
                            color: C.text, fontSize: 12, fontWeight: 600, minWidth: 0,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                          }}>{g.title}</div>
                          <div style={{ color: C.textMuted, fontSize: 11, marginLeft: 10, flexShrink: 0 }}>
                            w {g.weight || 0}% · {g.completion}%
                          </div>
                        </Row>
                        <ProgressBar value={g.completion} color={tone} />
                      </div>
                    );
                  })}
                  {mGoals.length === 0 && (
                    <div style={{ color: C.textSub, fontSize: 12 }}>No goals assigned yet.</div>
                  )}
                </Col>
              )}
            </Card>
          );
        })}
      </Col>

      <AssignModal open={!!assignOpen} onClose={() => setAssignOpen(null)} member={assignOpen} catalog={state.goalsCatalog} actions={actions} />
      <AddMemberModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        managerId={user.id}
        requestedBy={user.role}
        targetRole={isDirector ? ROLES.MANAGER : ROLES.EMPLOYEE}
        groups={state.groups}
        actions={actions}
      />
      {isDirector && (
        <PromoteICModal
          open={promoteOpen}
          onClose={() => setPromoteOpen(false)}
          directorId={user.id}
          state={state}
          actions={actions}
          requestedBy={user.role}
        />
      )}
    </>
  );
}

function AddMemberModal({ open, onClose, managerId, requestedBy, targetRole, groups, actions }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [group, setGroup] = useState(groups[0]?.name || '');
  const emailOk = email.includes('@');
  return (
    <Modal open={open} onClose={onClose} title={targetRole === ROLES.MANAGER ? 'Add manager' : 'Add team member'}>
      <p style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
        This person will be added with <b>pending</b> status. Admin approval is required before the account goes live — this protects the audit trail.
      </p>
      <Input label="Full name" value={name} onChange={setName} />
      <Input label="Email" type="email" value={email} onChange={setEmail} />
      <Input label="Title" value={title} onChange={setTitle} placeholder={targetRole === ROLES.MANAGER ? 'e.g. Backend Manager' : 'e.g. Backend Dev II'} />
      <Select label="Group / team" value={group} onChange={setGroup} options={groups.map((g) => ({ value: g.name, label: g.name }))} />
      <Row style={{ justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button
          disabled={!name || !emailOk || !title}
          onClick={() => {
            actions.addUser({
              name, email, title, role: targetRole, managerId,
              group, dept: 'Engineering', avatar: '#5b8def',
            }, requestedBy);
            onClose();
          }}
        >Submit for admin approval</Button>
      </Row>
    </Modal>
  );
}

function PromoteICModal({ open, onClose, directorId, state, actions, requestedBy }) {
  // Everyone transitively under the director — i.e. reports of the director's managers.
  const managers = state.users.filter((u) => u.managerId === directorId);
  const ics = state.users.filter((u) =>
    u.role === ROLES.EMPLOYEE && managers.some((m) => m.id === u.managerId)
  );
  const [employeeId, setEmployeeId] = useState('');
  const [newTitle, setNewTitle] = useState('');

  return (
    <Modal open={open} onClose={onClose} title="Promote IC to manager">
      <p style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
        This becomes a role change (IC → Manager) under your direct line.
        Admin approval is required; on approve the selected person will start
        receiving manager-tier goals.
      </p>
      <Select
        label="Employee"
        value={employeeId}
        onChange={(v) => {
          setEmployeeId(v);
          const u = ics.find((x) => x.id === v);
          if (u && !newTitle) {
            // Reasonable default next step from their group ladder.
            const base = (u.group || '').split(' ').slice(0, 1).join(' ');
            setNewTitle(`${base || 'Team'} Manager`.trim());
          }
        }}
        options={[{ value: '', label: `Select from ${ics.length} IC(s)` },
          ...ics.map((u) => ({ value: u.id, label: `${u.name} — ${u.title}` }))]}
      />
      <Input label="New manager title" value={newTitle} onChange={setNewTitle} placeholder="e.g. Backend Manager" />
      <Row style={{ justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button
          disabled={!employeeId || !newTitle.trim()}
          onClick={() => {
            actions.promoteToManager(employeeId, newTitle.trim(), directorId, requestedBy);
            onClose();
          }}
        >Submit for admin approval</Button>
      </Row>
    </Modal>
  );
}

function AssignModal({ open, onClose, member, catalog, actions }) {
  const [goalId, setGoalId] = useState(catalog[0]?.id || '');
  const [weight, setWeight] = useState(20);
  const [dueDate, setDueDate] = useState('');
  if (!member) return null;
  return (
    <Modal open={open} onClose={onClose} title={`Assign a goal to ${member.name}`}>
      <Select label="Goal" value={goalId} onChange={setGoalId} options={catalog.map((g) => ({ value: g.id, label: g.title }))} />
      <Row gap={10}>
        <div style={{ flex: 1 }}><Input label="Weight %" type="number" value={weight} onChange={(v) => setWeight(Math.max(0, Math.min(100, Number(v) || 0)))} /></div>
        <div style={{ flex: 1 }}><Input label="Due date" type="date" value={dueDate} onChange={setDueDate} /></div>
      </Row>
      <Row style={{ justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button disabled={!goalId || !dueDate} onClick={() => { actions.assignGoal(member.id, goalId, Number(weight), dueDate); onClose(); }}>Assign</Button>
      </Row>
    </Modal>
  );
}
