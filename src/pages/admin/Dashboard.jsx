import { BarChart, Bar, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Users, Target, Award, Heart, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { PageHeader } from '../../components/layout/Shell';
import { Badge, Card, Col, Grid, Row, StatCard } from '../../components/ui';
import { PROMOTION, healthColor, teamHealth } from '../../lib/compute';
import { ROLES } from '../../lib/roles';

export default function AdminDashboard() {
  const { state, teamFor, goalsFor, computeRatingFor, eligibilityFor } = useApp();
  const { C } = useTheme();

  const managers = state.users.filter((u) => u.role === ROLES.MANAGER);
  const employees = state.users.filter((u) => u.role === ROLES.EMPLOYEE);
  const pendingAdminApprovals = state.approvals.filter((a) => a.status === 'PENDING' && a.adminOnly).length;
  const pendingPromotions = state.promotions.filter((p) => p.status === 'RECOMMENDED').length;

  const orgAvg = employees.length
    ? employees.reduce((s, e) => s + computeRatingFor(e.id).adjusted, 0) / employees.length
    : 0;

  const teamChart = managers.map((m) => {
    const team = teamFor(m.id);
    const avg = team.length ? team.reduce((s, e) => s + computeRatingFor(e.id).adjusted, 0) / team.length : 0;
    return { team: m.group || m.name.split(' ')[0], rating: Number(avg.toFixed(1)), health: teamHealth(team.flatMap((x) => goalsFor(x.id))) };
  });

  return (
    <>
      <PageHeader title="Organisation Dashboard" subtitle="Cross-team health, pending decisions and promotion pipeline." />

      <Grid columns={5} minWidth={180} style={{ marginBottom: 20 }}>
        <StatCard icon={Users}  label="Total users"          value={state.users.length} color={C.accent} />
        <StatCard icon={Target} label="Active goals"         value={Object.values(state.empGoals).flat().length} color={C.cyan} />
        <StatCard icon={Award}  label="Org avg rating"       value={orgAvg.toFixed(1)} color={C.purple} />
        <StatCard icon={Shield} label="Admin approvals"      value={pendingAdminApprovals} color={pendingAdminApprovals ? C.warning : C.success} />
        <StatCard icon={Heart}  label="Pending promotions"   value={pendingPromotions} color={pendingPromotions ? C.warning : C.success} />
      </Grid>

      <Card hoverable={false} style={{ marginBottom: 20 }}>
        <h3 style={{ color: C.text, fontSize: 16, marginBottom: 14 }}>Team performance</h3>
        <div style={{ height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={teamChart}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
              <XAxis dataKey="team" tick={{ fill: C.textMuted, fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fill: C.textMuted, fontSize: 12 }} />
              <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8 }} />
              <Bar dataKey="rating">
                {teamChart.map((d, i) => <Cell key={i} fill={healthColor(d.health, C)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card hoverable={false}>
        <h3 style={{ color: C.text, fontSize: 16, marginBottom: 14 }}>Promotion pipeline</h3>
        <Col gap={10}>
          {employees.map((e) => {
            const elig = eligibilityFor(e.id);
            const r = computeRatingFor(e.id);
            if (elig.tier === PROMOTION.NOT_ELIGIBLE) return null;
            const color = elig.tier === PROMOTION.ELIGIBLE ? C.success : C.warning;
            return (
              <Row key={e.id} style={{ justifyContent: 'space-between', padding: 10, background: C.surface, borderRadius: 10 }}>
                <Col gap={2}>
                  <div style={{ color: C.text, fontWeight: 600 }}>{e.name}</div>
                  <div style={{ color: C.textMuted, fontSize: 12 }}>{e.title} · rating {r.adjusted.toFixed(1)}</div>
                </Col>
                <Badge color={color} bg={color + '22'}>{elig.tier.replace('_', ' ')}</Badge>
              </Row>
            );
          })}
        </Col>
      </Card>
    </>
  );
}
