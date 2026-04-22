import { useTheme } from '../../hooks/useTheme';
import Sidebar from './Sidebar';

export default function Shell({ children }) {
  const { C } = useTheme();
  return (
    <div style={{ display: 'flex', background: C.bg, minHeight: '100vh', color: C.text }}>
      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: '28px 32px', width: 'calc(100% - 240px)' }}>
        {children}
      </main>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  const { C } = useTheme();
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
      <div>
        <h1 style={{ color: C.text, fontSize: 24, fontWeight: 700 }}>{title}</h1>
        {subtitle && <div style={{ color: C.textMuted, fontSize: 13, marginTop: 4 }}>{subtitle}</div>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 10 }}>{actions}</div>}
    </div>
  );
}
