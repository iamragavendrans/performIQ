import { useEffect, useState } from 'react';
import { Brain, TrendingUp, Target, AlertCircle, RefreshCw, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { PageHeader } from '../../components/layout/Shell';
import { Badge, Button, Card, Col, Grid, ProgressBar, Row } from '../../components/ui';
import { GOAL_STATUS, statusBg, statusColor } from '../../lib/compute';

// Each "step" is the text shown while the analyser pretends to work. Timing is
// spaced so the last step finishes just before we reveal the real cards.
const STEPS = [
  { label: 'Reading your goal updates log…',             at: 0 },
  { label: 'Weighing each goal by priority…',            at: 320 },
  { label: 'Merging indirect signals from your manager…', at: 640 },
  { label: 'Compiling focus areas and risks…',           at: 960 },
];
const REVEAL_AT = 1250;

export default function AIFeedback() {
  const { user, goalsFor, findUser } = useApp();
  const { C } = useTheme();
  const goals = goalsFor(user.id).filter((g) => !g.selfProposed || g.proposalStatus === 'APPROVED');
  const manager = findUser(user.managerId);

  const [brewing, setBrewing] = useState(true);
  const [stepIdx, setStepIdx] = useState(0);
  const [runKey, setRunKey] = useState(0);

  useEffect(() => {
    setBrewing(true); setStepIdx(0);
    const timers = STEPS.map((s, i) =>
      setTimeout(() => setStepIdx(i + 1), s.at + 220)
    );
    const reveal = setTimeout(() => setBrewing(false), REVEAL_AT);
    return () => { timers.forEach(clearTimeout); clearTimeout(reveal); };
  }, [runKey, user.id]);

  const focus = [...goals].sort((a, b) => (b.weight * (100 - b.completion)) - (a.weight * (100 - a.completion))).slice(0, 3);
  const strengths = goals.filter((g) => g.status === GOAL_STATUS.COMPLETED || g.completion >= 85);
  const risks = goals.filter((g) => g.status === GOAL_STATUS.OFF_TRACK || g.overdue);

  return (
    <>
      <PageHeader
        title="AI Feedback"
        subtitle="Focus areas, blended with indirect feedback from your manager's guidance."
        actions={
          <Button icon={RefreshCw} variant="outline" disabled={brewing} onClick={() => setRunKey((k) => k + 1)}>
            Re-run analysis
          </Button>
        }
      />

      {brewing ? <BrewingPanel C={C} stepIdx={stepIdx} /> : (
        <div style={{ animation: 'fadeIn 260ms ease' }}>
          <Grid minWidth={320} style={{ marginBottom: 20 }}>
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
                    <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>
                      {g.completion}% done · leverage score {(g.weight * (100 - g.completion)) / 100 | 0}
                    </div>
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

          <Grid minWidth={320}>
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
        </div>
      )}
    </>
  );
}

function BrewingPanel({ C, stepIdx }) {
  return (
    <div style={{ animation: 'fadeIn 180ms ease' }}>
      <Card hoverable={false} style={{ marginBottom: 20 }}>
        <Row gap={12} style={{ marginBottom: 14 }}>
          <div style={{ background: C.accentDim, padding: 12, borderRadius: 12 }}>
            <Brain size={22} color={C.accent} className="perfiq-brewing-step" />
          </div>
          <Col gap={4}>
            <div style={{ color: C.text, fontWeight: 700 }}>Analysing your performance profile</div>
            <div style={{ color: C.textMuted, fontSize: 12 }}>No model calls; signals are derived live from your goals and approvals.</div>
          </Col>
        </Row>
        <Col gap={10}>
          {STEPS.map((s, i) => {
            const done = i < stepIdx;
            const active = i === stepIdx;
            return (
              <Row key={i} gap={10} style={{ fontSize: 13, color: done ? C.text : active ? C.accent : C.textSub }}>
                <div style={{
                  width: 18, height: 18, borderRadius: 9, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: done ? C.success : active ? C.accentDim : C.surface,
                  border: `1px solid ${done ? C.success : active ? C.accent : C.border}`,
                }}>
                  {done
                    ? <Check size={11} color="#fff" />
                    : active
                      ? <div style={{ width: 6, height: 6, borderRadius: 3, background: C.accent, animation: 'pulseSoft 0.9s ease-in-out infinite' }} />
                      : null}
                </div>
                <span className={active ? 'perfiq-brewing-step' : ''}>{s.label}</span>
              </Row>
            );
          })}
        </Col>
      </Card>

      <Grid minWidth={320} style={{ marginBottom: 20 }}>
        {[0, 1].map((i) => (
          <Card key={i} hoverable={false}>
            <div className="perfiq-skeleton" style={{ height: 16, width: '50%', marginBottom: 14 }} />
            <div className="perfiq-skeleton" style={{ height: 10, width: '90%', marginBottom: 8 }} />
            <div className="perfiq-skeleton" style={{ height: 10, width: '70%', marginBottom: 8 }} />
            <div className="perfiq-skeleton" style={{ height: 10, width: '85%' }} />
          </Card>
        ))}
      </Grid>
      <Grid minWidth={320}>
        {[0, 1].map((i) => (
          <Card key={i} hoverable={false}>
            <div className="perfiq-skeleton" style={{ height: 14, width: '35%', marginBottom: 12 }} />
            <div className="perfiq-skeleton" style={{ height: 10, width: '80%', marginBottom: 8 }} />
            <div className="perfiq-skeleton" style={{ height: 10, width: '60%' }} />
          </Card>
        ))}
      </Grid>
    </div>
  );
}
