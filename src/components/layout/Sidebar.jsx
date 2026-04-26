import { Target, Users, BarChart2, Home, LogOut, Sun, Moon, Heart, FileText,
  Shield, Briefcase, Calendar, Layers, CheckCircle, Award, TrendingUp, MessageCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { ROLES, hasEmployeeSurface } from '../../lib/roles';
import { Avatar } from '../ui';

const EMPLOYEE_MENU = [
  { id: 'dashboard',  label: 'Dashboard',   icon: Home },
  { id: 'my-goals',   label: 'My Goals',    icon: Target },
  { id: 'ai-feedback',label: 'AI Feedback', icon: TrendingUp },
  { id: 'my-rating',  label: 'My Rating',   icon: Award },
  { id: 'life-events',label: 'Life Events', icon: Heart },
  { id: 'one-on-ones',label: '1:1s',        icon: MessageCircle },
];

const MANAGER_MENU = [
  { id: 'dashboard',  label: 'Dashboard',     icon: Home },
  { id: 'my-team',    label: 'My Team',       icon: Users },
  { id: 'goals-mgmt', label: 'Goal Mgmt',     icon: Target },
  { id: 'approvals',  label: 'Approvals',     icon: CheckCircle },
  { id: 'one-on-ones',label: '1:1s',          icon: MessageCircle },
  { id: 'reports',    label: 'Team Report',   icon: BarChart2 },
  { id: 'promotions', label: 'Promotions',    icon: Award },
];

// Director oversees the org: gets manager-like team view plus promotion approvals and org report.
const DIRECTOR_MENU = [
  { id: 'dashboard',  label: 'Dashboard',     icon: Home },
  { id: 'my-team',    label: 'My Managers',   icon: Users },
  { id: 'goals-mgmt', label: 'Goal Mgmt',     icon: Target },
  { id: 'feedback',   label: 'Team Feedback', icon: TrendingUp },
  { id: 'approvals',  label: 'Approvals',     icon: CheckCircle },
  { id: 'one-on-ones',label: '1:1s',          icon: MessageCircle },
  { id: 'promotions', label: 'Promotions',    icon: Award },
  { id: 'reports',    label: 'Org Report',    icon: FileText },
];

const ADMIN_MENU = [
  { id: 'dashboard',  label: 'Org Dashboard', icon: Home },
  { id: 'users',      label: 'User Mgmt',     icon: Users },
  { id: 'catalog',    label: 'Goal Catalog',  icon: Target },
  { id: 'periods',    label: 'Rating Periods',icon: Calendar },
  { id: 'groups',     label: 'Groups',        icon: Layers },
  { id: 'life-events',label: 'Life Events',   icon: Heart },
  { id: 'hierarchy',  label: 'Org Hierarchy', icon: Layers },
  { id: 'approvals',  label: 'Approvals',     icon: Shield },
];

export default function Sidebar() {
  const { user, page, setPage, logout, managerMode, setManagerMode } = useApp();
  const { C, isDark, toggle } = useTheme();
  if (!user) return null;

  const isManager = user.role === ROLES.MANAGER || user.role === ROLES.DIRECTOR;
  const menu =
    user.role === ROLES.ADMIN ? ADMIN_MENU :
    user.role === ROLES.DIRECTOR && managerMode ? DIRECTOR_MENU :
    isManager && managerMode ? MANAGER_MENU :
    EMPLOYEE_MENU;

  return (
    <div style={{
      width: 240, background: C.sidebar, borderRight: `1px solid ${C.border}`,
      height: '100vh', position: 'fixed', left: 0, top: 0,
      display: 'flex', flexDirection: 'column', padding: '20px 0',
    }}>
      <div style={{ padding: '0 20px 20px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Briefcase size={22} color={C.accent} />
          <div style={{ fontSize: 17, fontWeight: 800, color: C.text }}>PerformIQ</div>
        </div>
        <div style={{ fontSize: 11, color: C.textSub, letterSpacing: 0.6 }}>{user.dept?.toUpperCase() || 'DEMO'}</div>
      </div>

      <div style={{ padding: 16, borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 10, alignItems: 'center' }}>
        <Avatar name={user.name} color={user.avatar} size={36} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
          <div style={{ fontSize: 11, color: C.textMuted }}>{user.title || user.role}</div>
        </div>
      </div>

      {/* Only line-managers get a dual surface. Directors have no IC goals —
          their surface is already geared to leadership. */}
      {user.role === ROLES.MANAGER && hasEmployeeSurface(user.role) && (
        <div style={{ padding: '10px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 6 }}>
          <button
            onClick={() => { setManagerMode(true); setPage('dashboard'); }}
            style={{
              flex: 1, padding: '7px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', background: managerMode ? C.accent : 'transparent',
              color: managerMode ? '#fff' : C.textMuted, border: `1px solid ${managerMode ? C.accent : C.border}`,
            }}
          >{user.role === ROLES.DIRECTOR ? 'Director view' : 'Manager view'}</button>
          <button
            onClick={() => { setManagerMode(false); setPage('dashboard'); }}
            style={{
              flex: 1, padding: '7px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', background: !managerMode ? C.accent : 'transparent',
              color: !managerMode ? '#fff' : C.textMuted, border: `1px solid ${!managerMode ? C.accent : C.border}`,
            }}
          >My view</button>
        </div>
      )}

      <nav style={{ flex: 1, padding: '14px 12px', overflowY: 'auto' }}>
        {menu.map((m) => {
          const Icon = m.icon;
          const active = page === m.id;
          return (
            <button
              key={m.id} onClick={() => setPage(m.id)}
              style={{
                width: '100%', padding: '10px 12px', marginBottom: 4, borderRadius: 9,
                display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                background: active ? C.accentDim : 'transparent',
                color: active ? C.accent : C.textMuted,
                border: 'none', fontSize: 13, fontWeight: 600, textAlign: 'left',
                transition: 'background 160ms ease',
              }}
            >
              <Icon size={16} />
              {m.label}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: 12, borderTop: `1px solid ${C.border}`, display: 'flex', gap: 8 }}>
        <button
          onClick={toggle}
          title="Toggle theme"
          style={{
            flex: 1, padding: 9, background: 'transparent', border: `1px solid ${C.border}`,
            borderRadius: 8, color: C.textMuted, cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <button
          onClick={logout}
          style={{
            flex: 2, padding: 9, background: 'transparent', border: `1px solid ${C.border}`,
            borderRadius: 8, color: C.textMuted, cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13,
          }}
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </div>
  );
}
