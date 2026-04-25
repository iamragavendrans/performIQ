import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { MessageCircle, Sparkles, Send } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { PageHeader } from '../../components/layout/Shell';
import { Avatar, Badge, Button, Card, Col, Modal, ProgressBar, Row, Select, TextArea } from '../../components/ui';
import { goalStatus, healthColor, statusColor, teamHealth } from '../../lib/compute';
import { suggestManagerFeedback } from '../../lib/feedback';
import { formatDate } from '../../lib/format';

const SORTS = {
  NAME_ASC:   { label: 'Name (A→Z)',     cmp: (a, b) => a.m.name.localeCompare(b.m.name) },
  RATING_DESC:{ label: 'Rating (high→low)', cmp: (a, b) => b.rating - a.rating },
  RATING_ASC: { label: 'Rating (low→high)', cmp: (a, b) => a.rating - b.rating },
};

export default function ManagerReports() {
  const { user, teamFor, goalsFor, computeRatingFor, state, pageParams, actions } = useApp();
  const { C } = useTheme();
  const team = teamFor(user.id);
  const [focus, setFocus] = useState(pageParams?.focus || 'ALL');
  const [sortKey, setSortKey] = useState('RATING_DESC');
  const [feedbackTarget, setFeedbackTarget] = useState(null);

  const member = focus === 'ALL' ? null : team.find((m) => m.id === focus);

  const rows = team
    .map((m) => ({
      m,
      rating: Number(computeRatingFor(m.id).adjusted.toFixed(1)),
      health: teamHealth(goalsFor(m.id)),
    }))
    .sort(SORTS[sortKey].cmp);

  const teamChartData = rows.map((x) => ({ id: x.m.id, name: x.m.name.split(' ')[0], fullName: x.m.name, rating: x.rating, health: x.health }));

  // Clicking the bar for the already-focused member clears the filter; clicking
  // any other member switches the focus.
  const toggleFocus = (id) => setFocus((cur) => (cur === id ? 'ALL' : id));

  return (
    <>
      <PageHeader
        title="Team Report"
        subtitle="Drill down into team performance. Ratings are adjusted (empathy-aware)."
      />

      <Card hoverable={false} style={{ marginBottom: 16 }}>
        <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <h3 style={{ color: C.text, fontSize: 16 }}>Team rating distribution</h3>
          <Row gap={8}>
            <Select
              value={sortKey}
              onChange={setSortKey}
              options={Object.entries(SORTS).map(([k, v]) => ({ value: k, label: `Sort: ${v.label}` }))}
              style={{ minWidth: 180, marginBottom: 0 }}
            />
            <Select
              value={focus}
              onChange={setFocus}
              options={[{ value: 'ALL', label: 'All members' }, ...rows.map(({ m }) => ({ value: m.id, label: m.name }))]}
              style={{ minWidth: 220, marginBottom: 0 }}
            />
          </Row>
        </Row>
        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 8 }}>
          Tip: click any bar to drill into that member. Click again to clear.
        </div>
        <div style={{ height: 300, marginTop: 8 }}>
          <ResponsiveContainer>
            <BarChart data={teamChartData} margin={{ top: 28, right: 16, left: 0, bottom: 10 }}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: C.text, fontSize: 12, fontWeight: 600 }} />
              <YAxis domain={[0, 100]} tick={{ fill: C.textMuted, fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13 }}
                labelStyle={{ color: C.text, fontWeight: 700 }}
                itemStyle={{ color: C.text }}
                cursor={{ fill: C.accentDim }}
                formatter={(val, _name, ctx) => [`${val}`, ctx?.payload?.fullName || 'Rating']}
              />
              <Bar
                dataKey="rating"
                cursor="pointer"
                onClick={(d) => d?.id && toggleFocus(d.id)}
              >
                {teamChartData.map((d, i) => {
                  const isFocused = focus === d.id;
                  const dim = focus !== 'ALL' && !isFocused;
                  return (
                    <Cell
                      key={i}
                      fill={healthColor(d.health, C)}
                      fillOpacity={dim ? 0.25 : 1}
                      stroke={isFocused ? C.text : 'none'}
                      strokeWidth={isFocused ? 2 : 0}
                    />
                  );
                })}
                <LabelList
                  dataKey="rating"
                  position="top"
                  fill={C.text}
                  style={{ fontSize: 12, fontWeight: 700 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {member ? (
        <>
          <Row style={{ marginBottom: 12, justifyContent: 'space-between' }}>
            <Button size="sm" variant="ghost" onClick={() => setFocus('ALL')}>&larr; Back to all members</Button>
            <Button size="sm" icon={MessageCircle} onClick={() => setFeedbackTarget(member)}>Give feedback</Button>
          </Row>
          <MemberDetail member={member} goals={goalsFor(member.id)} rating={computeRatingFor(member.id)} C={C} state={state} />
        </>
      ) : (
        <Col gap={10}>
          {rows.map(({ m, rating, health }) => (
            <Card key={m.id} onClick={() => setFocus(m.id)}>
              <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <Row gap={10}>
                  <Avatar name={m.name} color={m.avatar} size={34} />
                  <Col gap={2}>
                    <div style={{ color: C.text, fontWeight: 600 }}>{m.name}</div>
                    <div style={{ color: C.textMuted, fontSize: 12 }}>{m.title}</div>
                  </Col>
                </Row>
                <Row gap={14}>
                  <Col gap={2} style={{ alignItems: 'flex-end' }}>
                    <div style={{ color: C.textMuted, fontSize: 11 }}>Adjusted rating</div>
                    <div style={{ color: C.text, fontWeight: 700, fontSize: 16 }}>{rating.toFixed(1)}</div>
                  </Col>
                  <Badge color={healthColor(health, C)} bg={healthColor(health, C) + '22'}>{health}</Badge>
                  <Button
                    size="sm" variant="outline" icon={MessageCircle}
                    onClick={(e) => { e.stopPropagation(); setFeedbackTarget(m); }}
                  >Feedback</Button>
                </Row>
              </Row>
            </Card>
          ))}
        </Col>
      )}

      <FeedbackModal
        target={feedbackTarget}
        onClose={() => setFeedbackTarget(null)}
        goals={feedbackTarget ? goalsFor(feedbackTarget.id) : []}
        recent={(state.feedback || []).filter((f) => f.toId === feedbackTarget?.id && f.fromId === user.id).slice(-3)}
        fromId={user.id}
        actions={actions}
        C={C}
      />
    </>
  );
}

function FeedbackModal({ target, onClose, goals, recent, fromId, actions, C }) {
  const open = !!target;
  const [goalId, setGoalId] = useState('');
  const [text, setText] = useState('');

  if (!target) return null;

  const selectedGoal = goals.find((g) => g.id === goalId);
  const suggestion = selectedGoal
    ? suggestManagerFeedback(selectedGoal)
    : 'Zoom out: what&rsquo;s going well this period, and where do you want to push them next? Give one specific ask.';

  const useSuggestion = () => setText(typeof suggestion === 'string' ? suggestion : '');

  const send = () => {
    actions.sendFeedback(fromId, target.id, goalId || null, text.trim());
    setText(''); setGoalId(''); onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={`Feedback for ${target.name}`} width={620}>
      <p style={{ fontSize: 12, color: C.textSub, marginBottom: 12 }}>
        Actionable feedback beats generic praise. Reference a specific goal, quote the observation, and end with a clear ask.
      </p>

      <Select
        label="About which goal?"
        value={goalId}
        onChange={setGoalId}
        options={[
          { value: '', label: 'General feedback (not tied to a goal)' },
          ...goals.filter((g) => !g.selfProposed || g.proposalStatus === 'APPROVED')
            .map((g) => ({ value: g.id, label: `${g.title} — ${g.completion}%` })),
        ]}
      />

      <div style={{
        padding: 10, background: C.surface, borderRadius: 8, marginBottom: 10,
        border: `1px dashed ${C.border}`,
      }}>
        <Row style={{ justifyContent: 'space-between', marginBottom: 6 }}>
          <Row gap={6} style={{ color: C.accent, fontSize: 11, fontWeight: 700 }}>
            <Sparkles size={12} /> SUGGESTED DRAFT
          </Row>
          <Button size="sm" variant="ghost" onClick={useSuggestion}>Use this</Button>
        </Row>
        <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.55 }}>{suggestion}</div>
      </div>

      <TextArea
        label="Your feedback"
        value={text}
        onChange={setText}
        rows={5}
        placeholder="Be specific: what you observed, why it matters, and what to do next."
      />

      {recent.length > 0 && (
        <Col gap={6} style={{ marginTop: 14 }}>
          <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600 }}>RECENT FROM YOU</div>
          {recent.map((r) => (
            <div key={r.id} style={{ padding: 8, background: C.surface, borderRadius: 8, fontSize: 12, color: C.textMuted }}>
              <div style={{ color: C.textSub, fontSize: 11, marginBottom: 2 }}>{formatDate(r.createdAt)}</div>
              {r.text}
            </div>
          ))}
        </Col>
      )}

      <Row style={{ justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="success" icon={Send} disabled={!text.trim()} onClick={send}>Send feedback</Button>
      </Row>
    </Modal>
  );
}

function MemberDetail({ member, goals, rating, C, state }) {
  const history = state.ratingHistory[member.id] || [];
  return (
    <>
      <Card hoverable={false} style={{ marginBottom: 12 }}>
        <Row gap={14} style={{ marginBottom: 12 }}>
          <Avatar name={member.name} color={member.avatar} size={48} />
          <Col gap={2}>
            <div style={{ color: C.text, fontWeight: 700, fontSize: 18 }}>{member.name}</div>
            <div style={{ color: C.textMuted, fontSize: 13 }}>{member.title} · {member.email}</div>
          </Col>
        </Row>
        <Row gap={20} style={{ flexWrap: 'wrap' }}>
          <Col gap={2}><div style={{ color: C.textMuted, fontSize: 11 }}>Raw</div><div style={{ color: C.text, fontSize: 17, fontWeight: 700 }}>{rating.raw.toFixed(1)}</div></Col>
          <Col gap={2}><div style={{ color: C.textMuted, fontSize: 11 }}>Adjusted</div><div style={{ color: C.cyan, fontSize: 17, fontWeight: 700 }}>{rating.adjusted.toFixed(1)}</div></Col>
          <Col gap={2}><div style={{ color: C.textMuted, fontSize: 11 }}>Factor</div><div style={{ color: C.text, fontSize: 17, fontWeight: 700 }}>×{rating.factor.toFixed(3)}</div></Col>
          <Col gap={2}><div style={{ color: C.textMuted, fontSize: 11 }}>Goals</div><div style={{ color: C.text, fontSize: 17, fontWeight: 700 }}>{goals.length}</div></Col>
        </Row>
      </Card>

      <Card hoverable={false} style={{ marginBottom: 12 }}>
        <h3 style={{ color: C.text, fontSize: 15, marginBottom: 10 }}>Goal breakdown</h3>
        <Col gap={10}>
          {goals.map((g) => (
            <div key={g.id}>
              <Row style={{ justifyContent: 'space-between' }}>
                <div style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{g.title}</div>
                <div style={{ color: C.textMuted, fontSize: 12 }}>{g.completion}% · weight {g.weight}%</div>
              </Row>
              <ProgressBar value={g.completion} color={statusColor(goalStatus(g.completion), C)} />
            </div>
          ))}
        </Col>
      </Card>

      <Card hoverable={false}>
        <h3 style={{ color: C.text, fontSize: 15, marginBottom: 10 }}>History</h3>
        <Col gap={6}>
          {history.map((h) => (
            <Row key={h.periodId} style={{ justifyContent: 'space-between', fontSize: 13 }}>
              <div style={{ color: C.textMuted }}>{state.periods.find((p) => p.id === h.periodId)?.name || h.periodId}</div>
              <div style={{ color: C.text, fontWeight: 600 }}>{h.adjusted.toFixed(1)}</div>
            </Row>
          ))}
        </Col>
      </Card>
    </>
  );
}
