import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { PageHeader } from '../../components/layout/Shell';
import { Avatar, Badge, Button, Card, Col, ProgressBar, Row, Select } from '../../components/ui';
import { goalStatus, healthColor, statusColor, teamHealth } from '../../lib/compute';

const SORTS = {
  NAME_ASC:   { label: 'Name (A→Z)',     cmp: (a, b) => a.m.name.localeCompare(b.m.name) },
  RATING_DESC:{ label: 'Rating (high→low)', cmp: (a, b) => b.rating - a.rating },
  RATING_ASC: { label: 'Rating (low→high)', cmp: (a, b) => a.rating - b.rating },
};

export default function ManagerReports() {
  const { user, teamFor, goalsFor, computeRatingFor, state, pageParams } = useApp();
  const { C } = useTheme();
  const team = teamFor(user.id);
  const [focus, setFocus] = useState(pageParams?.focus || 'ALL');
  const [sortKey, setSortKey] = useState('RATING_DESC');

  const member = focus === 'ALL' ? null : team.find((m) => m.id === focus);

  const rows = team
    .map((m) => ({
      m,
      rating: Number(computeRatingFor(m.id).adjusted.toFixed(1)),
      health: teamHealth(goalsFor(m.id)),
    }))
    .sort(SORTS[sortKey].cmp);

  const teamChartData = rows.map((x) => ({ name: x.m.name.split(' ')[0], rating: x.rating, health: x.health }));

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
        <div style={{ height: 280, marginTop: 16 }}>
          <ResponsiveContainer>
            <BarChart data={teamChartData}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: C.textMuted, fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fill: C.textMuted, fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13 }}
                labelStyle={{ color: C.text, fontWeight: 700 }}
                itemStyle={{ color: C.text }}
                cursor={{ fill: C.accentDim }}
              />
              <Bar dataKey="rating">
                {teamChartData.map((d, i) => (
                  <Cell key={i} fill={healthColor(d.health, C)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {member ? (
        <>
          <Row style={{ marginBottom: 12 }}>
            <Button size="sm" variant="ghost" onClick={() => setFocus('ALL')}>&larr; Back to all members</Button>
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
                </Row>
              </Row>
            </Card>
          ))}
        </Col>
      )}
    </>
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
