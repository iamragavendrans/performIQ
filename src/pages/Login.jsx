import { useState } from 'react';
import { Briefcase, Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../hooks/useTheme';
import { Button, Input } from '../components/ui';
import { ROLES } from '../lib/roles';

const DEMO_EMAILS = [
  { email: 'priya@performiq.io',    label: 'Admin' },
  { email: 'rajesh@performiq.io',   label: 'Director' },
  { email: 'arjun@performiq.io',    label: 'Manager (QA)' },
  { email: 'divya@performiq.io',    label: 'Manager (Backend)' },
  { email: 'aarav@performiq.io',    label: 'Employee (QA)' },
  { email: 'riya@performiq.io',     label: 'Employee (Frontend)' },
];

export default function Login() {
  const { login, state } = useApp();
  const { C, isDark, toggle } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Demo1234!');
  const [error, setError] = useState('');

  const roleChip = (e) => {
    const u = state.users.find((x) => x.email === e);
    return u ? u.role : '';
  };

  const submit = (ev) => {
    ev.preventDefault();
    if (!login(email, password)) setError('Invalid credentials. Try a demo account; password is Demo1234!');
  };

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: 420, background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Briefcase size={24} color={C.accent} />
            <div style={{ fontSize: 20, fontWeight: 800 }}>PerformIQ</div>
          </div>
          <button onClick={toggle} style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.textMuted, padding: 7, borderRadius: 8, cursor: 'pointer' }}>
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

        <div style={{ color: C.textMuted, fontSize: 13, marginBottom: 18 }}>
          Data-driven performance management with empathy-adjusted ratings.
        </div>

        <form onSubmit={submit}>
          <Input label="Email" value={email} onChange={setEmail} type="email" placeholder="you@performiq.io" required />
          <Input label="Password" value={password} onChange={setPassword} type="password" required />
          {error && <div style={{ color: C.danger, fontSize: 12, marginBottom: 10 }}>{error}</div>}
          <Button type="submit" style={{ width: '100%', justifyContent: 'center' }}>Sign in</Button>
        </form>

        <div style={{ marginTop: 22, paddingTop: 18, borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 10 }}>Quick demo accounts</div>
          <div style={{ display: 'grid', gap: 6 }}>
            {DEMO_EMAILS.map((d) => (
              <button
                key={d.email}
                type="button"
                onClick={() => { setEmail(d.email); setPassword('Demo1234!'); }}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                  background: C.surface, border: `1px solid ${C.border}`, color: C.text, fontSize: 12,
                }}
              >
                <span>{d.email}</span>
                <span style={{ color: roleChip(d.email) === ROLES.ADMIN ? C.purple : roleChip(d.email) === ROLES.DIRECTOR ? C.cyan : roleChip(d.email) === ROLES.MANAGER ? C.accent : C.textMuted, fontSize: 11, fontWeight: 700 }}>
                  {d.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
