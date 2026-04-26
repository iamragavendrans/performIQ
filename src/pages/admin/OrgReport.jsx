import { useMemo, useState } from 'react';
import { BarChart, Bar, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie } from 'recharts';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { PageHeader } from '../../components/layout/Shell';
import { Avatar, Badge, Card, Col, Grid, Row, Select, StatCard } from '../../components/ui';
import { PROMOTION, healthColor, teamHealth } from '../../lib/compute';
import { ROLES } from '../../lib/roles';
import { Users, Award, Heart, TrendingUp, ChevronDown, ChevronRight } from 'lucide-react';

export default function OrgReport() {
  const { state, teamFor, goalsFor, computeRatingFor, eligibilityFor, setPage } = useApp();
  const { C } = useTheme();
  const managers = state.users.filter((u) => u.role === ROLES.MANAGER);
  const [focus, setFocus] = useState('ALL');
  const [expanded, setExpanded] = useState({});

  const teamData = managers.map((m) => {
    const team = teamFor(m.id);
    const avg = team.length ? team.reduce((s, e) => s + computeRatingFor(e.id).adjusted, 0) / team.length : 0;
    const eligible = team.filter((e) => eligibilityFor(e.id).tier === PROMOTION.ELIGIBLE).length;
    return { id: m.id, name: m.group, managerName: m.name, members: team, rating: Number(avg.toFixed(1)), eligible, health: teamHealth(team.flatMap((x) => goalsFor(x.id))) };
  });

  const filteredTeams = focus === 'ALL' ? teamData : teamData.filter((t) => t.id === focus);

  // Promotion eligibility now mirrors the team filter so the pie chart updates
  // alongside the team-ratings selector.
  const eligibilityDist = useMemo(() => {
    const employeesInScope = focus === 'ALL'
      ? state.users.filter((u) => u.role === ROLES.EMPLOYEE)
      : state.users.filter((u) => u.role === ROLES.EMPLOYEE && u.managerId === focus);
    return [PROMOTION.ELIGIBLE, PROMOTION.APPROACHING, PROMOTION.NOT_ELIGIBLE].map((tier) => ({
      name: tier.replace('_', ' '),
      value: employeesInScope.filter((u) => eligibilityFor(u.id).tier === tier).length,
      color: tier === PROMOTION.ELIGIBLE ? C.success : tier === PROMOTION.APPROACHING ? C.warning : C.textMuted,
    }));
  }, [focus, state.users, eligibilityFor, C]);

  const approvedLifeEvents = Object.values(state.lifeEvents).flat().filter((e) => e.status === 'APPROVED').length;

  return (
    <>
      <PageHeader title="Organisation Report" subtitle="Org-wide view with drill-down by team." />

      <Grid minWidth={200} style={{ marginBottom: 20 }}>
        <Card onClick={() => setPage('my-team')}>
          <StatCard icon={Users} label="Users" value={state.users.length} color={C.accent} />
        </Card>
        <Card onClick={() => setPage('reports')}>
          <StatCard icon={Award} label="Avg adjusted rating" value={teamData.length ? (teamData.reduce((s, t) => s + t.rating, 0) / teamData.length).toFixed(1) : '—'} color={C.purple} />
        </Card>
        <Card onClick={() => setPage('approvals', { tab: 'LIFE_EVENTS' })}>
          <StatCard icon={Heart} label="Approved life events" value={approvedLifeEvents} color={C.cyan} />
        </Card>
        <Card onClick={() => setPage('promotions', { filter: 'RECOMMENDED' })}>
          <StatCard icon={TrendingUp} label="Promotion-eligible" value={state.users.filter((u) => u.role === ROLES.EMPLOYEE && eligibilityFor(u.id).tier === PROMOTION.ELIGIBLE).length} color={C.success} />
        </Card>
      </Grid>

      <Grid columns={2} minWidth={360} style={{ marginBottom: 20 }}>
        <Card hoverable={false}>
          <Row style={{ justifyContent: 'space-between', marginBottom: 10 }}>
            <h3 style={{ color: C.text, fontSize: 16 }}>Team ratings</h3>
            <Select
              value={focus}
              onChange={setFocus}
              options={[{ value: 'ALL', label: 'All teams' }, ...teamData.map((t) => ({ value: t.id, label: t.name }))]}
              style={{ minWidth: 200, marginBottom: 0 }}
            />
          </Row>
          <div style={{ height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={filteredTeams}>
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
                  {filteredTeams.map((d, i) => <Cell key={i} fill={healthColor(d.health, C)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card hoverable={false}>
          <Row style={{ justifyContent: 'space-between', marginBottom: 10 }}>
            <h3 style={{ color: C.text, fontSize: 16 }}>Promotion eligibility</h3>
            <div style={{ color: C.textMuted, fontSize: 12 }}>
              {focus === 'ALL' ? 'All teams' : teamData.find((t) => t.id === focus)?.name}
            </div>
          </Row>
          <div style={{ height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={eligibilityDist} dataKey="value" nameKey="name" outerRadius={90} label>
                  {eligibilityDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Legend />
                <Tooltip
                  contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13 }}
                  labelStyle={{ color: C.text, fontWeight: 700 }}
                  itemStyle={{ color: C.text }}
                  cursor={{ fill: C.accentDim }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Grid>

      <Card hoverable={false}>
        <h3 style={{ color: C.text, fontSize: 16, marginBottom: 14 }}>Team drill-down</h3>
        <Col gap={10}>
          {filteredTeams.map((t) => {
            const isOpen = !!expanded[t.id];
            return (
              <div key={t.id} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}` }}>
                <Row
                  onClick={() => setExpanded((s) => ({ ...s, [t.id]: !s[t.id] }))}
                  style={{ justifyContent: 'space-between', padding: 12, cursor: 'pointer' }}
                >
                  <Row gap={8}>
                    {isOpen ? <ChevronDown size={16} color={C.textMuted} /> : <ChevronRight size={16} color={C.textMuted} />}
                    <Col gap={2}>
                      <div style={{ color: C.text, fontWeight: 600 }}>{t.name}</div>
                      <div style={{ color: C.textMuted, fontSize: 12 }}>Manager: {t.managerName} · {t.members.length} members</div>
                    </Col>
                  </Row>
                  <Row gap={8}>
                    <Badge color={healthColor(t.health, C)} bg={healthColor(t.health, C) + '22'}>{t.health}</Badge>
                    <Badge color={C.textMuted} bg={C.card}>Avg {t.rating}</Badge>
                    <Badge color={C.cyan} bg={C.cyanDim}>{t.eligible} promo-ready</Badge>
                  </Row>
                </Row>
                {isOpen && (
                  <div style={{ borderTop: `1px solid ${C.border}`, padding: 12 }}>
                    {t.members.length === 0 ? (
                      <div style={{ color: C.textMuted, fontSize: 13 }}>No active members on this team.</div>
                    ) : (
                      <Col gap={8}>
                        {t.members.map((emp) => {
                          const rating = computeRatingFor(emp.id);
                          const elig = eligibilityFor(emp.id);
                          const goals = goalsFor(emp.id);
                          const avgCompletion = goals.length
                            ? Math.round(goals.reduce((s, g) => s + (g.completion || 0), 0) / goals.length)
                            : 0;
                          const overdue = goals.filter((g) => g.overdue).length;
                          const tierColor =
                            elig.tier === PROMOTION.ELIGIBLE ? C.success
                            : elig.tier === PROMOTION.APPROACHING ? C.warning
                            : C.textMuted;
                          const tierBg =
                            elig.tier === PROMOTION.ELIGIBLE ? C.successDim
                            : elig.tier === PROMOTION.APPROACHING ? C.warningDim
                            : C.card;
                          return (
                            <Row
                              key={emp.id}
                              style={{ justifyContent: 'space-between', padding: 10, background: C.card, borderRadius: 8, border: `1px solid ${C.border}` }}
                            >
                              <Row gap={10}>
                                <Avatar name={emp.name} color={emp.avatar} size={32} />
                                <Col gap={2}>
                                  <div style={{ color: C.text, fontWeight: 600, fontSize: 13 }}>{emp.name}</div>
                                  <div style={{ color: C.textMuted, fontSize: 11 }}>{emp.title || emp.role} · {goals.length} goals · {avgCompletion}% avg</div>
                                </Col>
                              </Row>
                              <Row gap={6}>
                                {overdue > 0 && (
                                  <Badge color={C.danger} bg={C.dangerDim}>{overdue} overdue</Badge>
                                )}
                                <Badge color={C.textMuted} bg={C.surface}>Rating {rating.adjusted.toFixed(1)}</Badge>
                                <Badge color={tierColor} bg={tierBg}>{elig.tier.replace('_', ' ')}</Badge>
                              </Row>
                            </Row>
                          );
                        })}
                      </Col>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </Col>
      </Card>
    </>
  );
}
