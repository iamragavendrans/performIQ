import { Brain, TrendingUp, Target, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { PageHeader } from '../../components/layout/Shell';
import { Badge, Card, Col, Grid, ProgressBar, Row } from '../../components/ui';
import { GOAL_STATUS, statusBg, statusColor } from '../../lib/compute';

export default function AIFeedback() {
  const { user, goalsFor, findUser } = useApp();
  const { C } = useTheme();
  const goals = goalsFor(user.id).filter((g) => !g.selfProposed || g.proposalStatus === 'APPROVED');
  const manager = findUser(user.managerId);

  // Focus ranking: weight × (100 - completion)  → biggest-leverage goals first.
  const focus = [...goals].sort((a, b) => (b.weight * (100 - b.completion)) - (a.weight * (100 - a.completion))).slice(0, 3);

  // Indirect feedback from approval trail + life events
  const strengths = goals.filter((g) => g.status === GOAL_STATUS.COMPLETED || g.completion >= 85);
  const risks = goals.filter((g) => g.status === GOAL_STATUS.OFF_TRACK || g.overdue);

  return (
    <>
      <PageHeader title="AI Feedback" subtitle="Focus areas, blended with indirect feedback from your manager's guidance." />

      <Grid columns={2} minWidth={320} style={{ marginBottom: 20 }}>
        <Card hoverable={false}>
          <Row gap={8} style={{ marginBottom: 12 }}>
            <Brain size={18} color={C.accent} />
            <h3 style={{ color: C.text, fontSize: 16 }}>Top focus areas</h3>
          </Row>
          <p style={{ color: C.textMuted, fontSize: 12, marginBottom: 16 }}>
            Ranked by weight × remaining completion. Working these moves your rating the most.
          </p>
          <Col gap={14}>
            {focus.map((g) => (
              <div key={g.id}>
                <Row style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{g.title}</div>
                  <Badge color={statusColor(g.status, C)} bg={statusBg(g.status, C)}>Weight {g.weight}%</Badge>
                </Row>
                <ProgressBar value={g.completion} color={statusColor(g.status, C)} />
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{g.completion}% done · leverage score {(g.weight * (100 - g.completion)) / 100 | 0}</div>
              </div>
            ))}
          </Col>
        </Card>

        <Card hoverable={false}>
          <Row gap={8} style={{ marginBottom: 12 }}>
            <TrendingUp size={18} color={C.cyan} />
            <h3 style={{ color: C.text, fontSize: 16 }}>Indirect manager signals</h3>
          </Row>
          <Col gap={12}>
            <div style={{ padding: 12, background: C.surface, borderRadius: 10, fontSize: 13, color: C.textMuted }}>
              <div style={{ color: C.text, fontWeight: 600, marginBottom: 4 }}>{manager ? manager.name : 'Your manager'}</div>
              Weight distribution reflects {manager?.name?.split(' ')[0] || 'your manager'}&rsquo;s priorities. The highest-weight goals signal what they consider most important this period.
            </div>
            {goals.filter((g) => g.weight >= 20).map((g) => (
              <Row key={g.id} gap={8} style={{ fontSize: 12, color: C.textMuted }}>
                <Target size={12} color={C.accent} /> High priority · <span style={{ color: C.text, fontWeight: 600 }}>{g.title}</span>
              </Row>
            ))}
          </Col>
        </Card>
      </Grid>

      <Grid columns={2} minWidth={320}>
        <Card hoverable={false}>
          <h3 style={{ color: C.success, fontSize: 15, marginBottom: 12 }}>Strengths</h3>
          {strengths.length === 0 && <div style={{ color: C.textMuted, fontSize: 13 }}>Not yet — push a goal above 85% to unlock.</div>}
          <Col gap={8}>
            {strengths.map((g) => (
              <Row key={g.id} gap={8} style={{ fontSize: 13, color: C.text }}>
                <TrendingUp size={14} color={C.success} /> {g.title} ({g.completion}%)
              </Row>
            ))}
          </Col>
        </Card>
        <Card hoverable={false}>
          <h3 style={{ color: C.danger, fontSize: 15, marginBottom: 12 }}>Risks</h3>
          {risks.length === 0 && <div style={{ color: C.textMuted, fontSize: 13 }}>Nothing off-track. Keep momentum.</div>}
          <Col gap={8}>
            {risks.map((g) => (
              <Row key={g.id} gap={8} style={{ fontSize: 13, color: C.text }}>
                <AlertCircle size={14} color={C.danger} /> {g.title} — {g.overdue ? 'overdue' : `${g.completion}%`}
              </Row>
            ))}
          </Col>
        </Card>
      </Grid>
    </>
  );
}
