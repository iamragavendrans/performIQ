import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { PageHeader } from '../../components/layout/Shell';
import { Avatar, Badge, Button, Card, Col, Input, Modal, Row, Select } from '../../components/ui';
import { goalStatus, statusColor } from '../../lib/compute';
import { ROLES } from '../../lib/roles';

export default function MyTeam() {
  const { user, teamFor, goalsFor, state, actions, computeRatingFor } = useApp();
  const { C } = useTheme();
  const team = teamFor(user.id);
  const [assignOpen, setAssignOpen] = useState(null);
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
          return (
            <Card key={m.id} hoverable={false}>
              <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <Row gap={10}>
                  <Avatar name={m.name} color={m.avatar} size={38} />
                  <Col gap={2}>
                    <div style={{ color: C.text, fontWeight: 600 }}>{m.name}</div>
                    <div style={{ color: C.textMuted, fontSize: 12 }}>{m.title} · {m.email}</div>
                  </Col>
                </Row>
                <Button size="sm" icon={Plus} onClick={() => setAssignOpen(m)}>Assign goal</Button>
              </Row>
              <Row gap={6} style={{ marginTop: 10, flexWrap: 'wrap' }}>
                {mGoals.map((g) => (
                  <Badge key={g.id} color={statusColor(goalStatus(g.completion), C)} bg={statusColor(goalStatus(g.completion), C) + '22'}>
                    {g.title.split(' ').slice(0, 4).join(' ')}…  {g.completion}%
                  </Badge>
                ))}
              </Row>
            </Card>
          );
        })}
      </Col>

      <AssignModal open={!!assignOpen} onClose={() => setAssignOpen(null)} member={assignOpen} catalog={state.goalsCatalog} actions={actions} />
    </>
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
