import { useMemo } from 'react';
import { Target } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { PageHeader } from '../../components/layout/Shell';
import { Card, Col, EmptyState, Row, Badge } from '../../components/ui';
import { goalStatus, statusBg, statusColor } from '../../lib/compute';

export default function ManagerGoalMgmt() {
  const { user, teamFor, goalsFor, state } = useApp();
  const { C } = useTheme();
  const team = teamFor(user.id);

  // Dedupe: show each goalId once with the list of assignees + avg completion.
  const rows = useMemo(() => {
    const map = new Map();
    team.forEach((m) => {
      goalsFor(m.id).forEach((g) => {
        const key = g.selfProposed ? `self_${g.id}` : g.goalId;
        const rec = map.get(key) || {
          key, title: g.title, selfProposed: g.selfProposed, proposalStatus: g.proposalStatus,
          members: [], completions: [],
        };
        rec.members.push({ id: m.id, name: m.name, completion: g.completion });
        rec.completions.push(g.completion);
        map.set(key, rec);
      });
    });
    return [...map.values()].sort((a, b) => b.members.length - a.members.length);
  }, [team, goalsFor]);

  return (
    <>
      <PageHeader title="Goal Management" subtitle="Deduplicated view of every goal active on your team." />
      {rows.length === 0 ? (
        <Card><EmptyState icon={Target} title="No active goals" subtitle="Assign goals from My Team." /></Card>
      ) : (
        <Col gap={12}>
          {rows.map((r) => {
            const avg = r.completions.reduce((s, v) => s + v, 0) / r.completions.length;
            const status = goalStatus(avg);
            return (
              <Card key={r.key} hoverable={false} style={{ borderLeft: `3px solid ${statusColor(status, C)}` }}>
                <Row style={{ justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ color: C.text, fontWeight: 600, fontSize: 15 }}>{r.title}</div>
                  <Row gap={8}>
                    {r.selfProposed && <Badge color={C.purple} bg={C.purpleDim}>Self-proposed · {r.proposalStatus}</Badge>}
                    <Badge color={statusColor(status, C)} bg={statusBg(status, C)}>Avg {avg.toFixed(0)}%</Badge>
                    <Badge color={C.textMuted} bg={C.surface}>{r.members.length} member(s)</Badge>
                  </Row>
                </Row>
                <Row gap={6} style={{ flexWrap: 'wrap' }}>
                  {r.members.map((m) => (
                    <Badge key={m.id} color={C.textMuted} bg={C.surface}>
                      {m.name} · {m.completion}%
                    </Badge>
                  ))}
                </Row>
              </Card>
            );
          })}
        </Col>
      )}

      <Card hoverable={false} style={{ marginTop: 20 }}>
        <div style={{ color: C.text, fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Role defaults</div>
        <Col gap={6}>
          {state.groups.map((g) => (
            <Row key={g.id} gap={8} style={{ fontSize: 13, color: C.textMuted }}>
              <Badge color={C.accent} bg={C.accentDim}>{g.name}</Badge>
              <div>{g.goals.length} default goals</div>
            </Row>
          ))}
        </Col>
      </Card>
    </>
  );
}
