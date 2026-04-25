import { Users, Target, Shield, Calendar, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { PageHeader } from '../../components/layout/Shell';
import { Card, Col, Grid, Row, StatCard } from '../../components/ui';
import { ROLES } from '../../lib/roles';

export default function AdminDashboard() {
  const { state, setPage } = useApp();
  const { C } = useTheme();

  const pendingAdminApprovals = state.approvals.filter((a) => a.status === 'PENDING' && a.adminOnly).length;
  const activeGoals = Object.values(state.empGoals).flat().length;
  const activePeriod = state.periods.find((p) => p.isActive);

  const roleCounts = [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.MANAGER, ROLES.EMPLOYEE].map((role) => ({
    role,
    count: state.users.filter((u) => u.role === role).length,
  }));

  return (
    <>
      <PageHeader
        title="Organisation Dashboard"
        subtitle="Administrative view — org configuration, not performance data. Performance lives on the Director's surface."
      />

      <Grid minWidth={200} style={{ marginBottom: 20 }}>
        <Card onClick={() => setPage('users')}>
          <StatCard icon={Users}    label="Total users"         value={state.users.length}   color={C.accent} />
        </Card>
        <Card onClick={() => setPage('catalog')}>
          <StatCard icon={Target}   label="Goal catalog entries" value={state.goalsCatalog.length} color={C.cyan} />
        </Card>
        <Card onClick={() => setPage('periods')}>
          <StatCard icon={Calendar} label="Active period"        value={activePeriod?.name || '—'} color={C.purple} />
        </Card>
        <Card onClick={() => setPage('groups')}>
          <StatCard icon={Layers}   label="Role groups"          value={state.groups.length}  color={C.warning} />
        </Card>
        <Card onClick={() => setPage('approvals')}>
          <StatCard icon={Shield}   label="Admin approvals"      value={pendingAdminApprovals} color={pendingAdminApprovals ? C.warning : C.success} />
        </Card>
      </Grid>

      <Card hoverable={false}>
        <h3 style={{ color: C.text, fontSize: 16, marginBottom: 14 }}>User distribution</h3>
        <Col gap={8}>
          {roleCounts.map((r) => {
            const max = Math.max(...roleCounts.map((x) => x.count));
            const widthPct = max ? (r.count / max) * 100 : 0;
            return (
              <Row
                key={r.role} gap={12}
                onClick={() => setPage('users', { filter: r.role })}
                style={{
                  fontSize: 13, cursor: 'pointer', padding: '6px 8px',
                  borderRadius: 8, transition: 'background 120ms ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = C.surface; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ minWidth: 100, color: C.textMuted }}>{r.role}</div>
                <div style={{ flex: 1, height: 8, background: C.surface, borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${widthPct}%`, background: C.accent }} />
                </div>
                <div style={{ minWidth: 32, color: C.text, fontWeight: 700, textAlign: 'right' }}>{r.count}</div>
              </Row>
            );
          })}
        </Col>
        <div style={{ marginTop: 14, fontSize: 12, color: C.textMuted }}>
          Only {activeGoals} goal assignments across the org this period.
        </div>
      </Card>
    </>
  );
}
