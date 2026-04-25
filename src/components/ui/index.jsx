import { useEffect, useState } from 'react';
import { Info, X } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export function InfoTooltip({ children, width = 240 }) {
  const { C } = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <span
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      tabIndex={0}
      style={{ position: 'relative', display: 'inline-flex', cursor: 'help', outline: 'none' }}
    >
      <Info size={13} color={C.textMuted} />
      {open && (
        <span
          role="tooltip"
          style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 50,
            background: C.card, color: C.text, border: `1px solid ${C.border}`,
            borderRadius: 10, padding: 10, fontSize: 12, lineHeight: 1.45, width,
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)', textAlign: 'left',
            animation: 'fadeIn 120ms ease', fontWeight: 400,
          }}
        >{children}</span>
      )}
    </span>
  );
}

export function Badge({ children, color, bg }) {
  const { C } = useTheme();
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
      color: color || C.textMuted, background: bg || C.surface,
    }}>{children}</span>
  );
}

export function Card({ children, onClick, style, hoverable = true }) {
  const { C } = useTheme();
  return (
    <div
      onClick={onClick}
      style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 14,
        padding: 20, cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 160ms ease, border-color 160ms ease',
        ...style,
      }}
      onMouseEnter={(e) => { if (hoverable && onClick) { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
      onMouseLeave={(e) => { if (hoverable && onClick) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(0)'; } }}
    >
      {children}
    </div>
  );
}

// Section card — same chrome as Card, but with the InsightCard-style label
// that breaks the top border. Use this whenever a card has a title so the
// title accent is consistent across the app (employee + manager surfaces).
export function SectionCard({ label, tone, action, children, style, padding = 20 }) {
  const { C } = useTheme();
  const accent = tone || C.accent;
  return (
    <div style={{
      position: 'relative',
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 14,
      padding, ...style,
    }}>
      <div style={{
        position: 'absolute', top: -9, left: 16,
        background: C.card, padding: '0 8px',
        color: accent, fontSize: 10, fontWeight: 700, letterSpacing: 1,
        textTransform: 'uppercase',
      }}>{label}</div>
      {action && (
        <div style={{ position: 'absolute', top: 14, right: 16 }}>{action}</div>
      )}
      <div style={{ marginTop: action ? 10 : 4 }}>{children}</div>
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, trend, color }) {
  const { C } = useTheme();
  return (
    <Card hoverable={false}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ background: (color || C.accent) + '22', padding: 10, borderRadius: 10 }}>
          {Icon && <Icon size={20} color={color || C.accent} />}
        </div>
        {typeof trend === 'number' && (
          <div style={{ fontSize: 12, color: trend >= 0 ? C.success : C.danger, fontWeight: 600 }}>
            {trend >= 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: C.text }}>{value}</div>
    </Card>
  );
}

export function ProgressBar({ value, color }) {
  const { C } = useTheme();
  const v = Math.max(0, Math.min(100, value || 0));
  return (
    <div style={{ background: C.surface, height: 8, borderRadius: 999, overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${v}%`,
        background: `linear-gradient(90deg, ${color || C.accent}, ${(color || C.accent)}dd)`,
        transition: 'width 300ms ease',
      }} />
    </div>
  );
}

export function Button({ children, onClick, variant = 'primary', size = 'md', disabled, type = 'button', style, icon: Icon }) {
  const { C } = useTheme();
  const sizes = {
    sm: { padding: '6px 12px', fontSize: 13 },
    md: { padding: '9px 16px', fontSize: 14 },
    lg: { padding: '12px 20px', fontSize: 15 },
  };
  const variants = {
    primary: { background: C.accent, color: '#fff', border: `1px solid ${C.accent}` },
    success: { background: C.success, color: '#fff', border: `1px solid ${C.success}` },
    danger:  { background: C.danger,  color: '#fff', border: `1px solid ${C.danger}` },
    warning: { background: C.warning, color: '#fff', border: `1px solid ${C.warning}` },
    ghost:   { background: 'transparent', color: C.text, border: `1px solid ${C.border}` },
    outline: { background: 'transparent', color: C.accent, border: `1px solid ${C.accent}` },
  };
  return (
    <button
      type={type} onClick={onClick} disabled={disabled}
      style={{
        ...sizes[size], ...variants[variant], borderRadius: 9, fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1, display: 'inline-flex', alignItems: 'center',
        gap: 6, transition: 'all 160ms ease', ...style,
      }}
    >
      {Icon && <Icon size={14} />}
      {children}
    </button>
  );
}

export function Modal({ open, onClose, title, children, width = 560 }) {
  const { C } = useTheme();
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, animation: 'fadeIn 160ms ease',
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 14,
        padding: 24, width, maxWidth: '92vw', maxHeight: '85vh', overflow: 'auto',
      }}>
        {title && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ color: C.text, fontSize: 18 }}>{title}</h3>
            <X size={18} color={C.textMuted} style={{ cursor: 'pointer' }} onClick={onClose} />
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function Input({ label, value, onChange, type = 'text', placeholder, required, style }) {
  const { C } = useTheme();
  return (
    <label style={{ display: 'block', marginBottom: 12 }}>
      {label && <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>{label}</div>}
      <input
        type={type} value={value ?? ''} onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder} required={required}
        style={{
          width: '100%', padding: '9px 12px', background: C.surface,
          color: C.text, border: `1px solid ${C.border}`, borderRadius: 8,
          fontSize: 14, outline: 'none', ...style,
        }}
      />
    </label>
  );
}

export function Select({ label, value, onChange, options, style }) {
  const { C } = useTheme();
  return (
    <label style={{ display: 'block', marginBottom: 12 }}>
      {label && <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>{label}</div>}
      <select
        value={value ?? ''} onChange={(e) => onChange?.(e.target.value)}
        style={{
          width: '100%', padding: '9px 12px', background: C.surface,
          color: C.text, border: `1px solid ${C.border}`, borderRadius: 8,
          fontSize: 14, outline: 'none', ...style,
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

export function TextArea({ label, value, onChange, rows = 3, placeholder }) {
  const { C } = useTheme();
  return (
    <label style={{ display: 'block', marginBottom: 12 }}>
      {label && <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>{label}</div>}
      <textarea
        value={value ?? ''} onChange={(e) => onChange?.(e.target.value)}
        rows={rows} placeholder={placeholder}
        style={{
          width: '100%', padding: '9px 12px', background: C.surface,
          color: C.text, border: `1px solid ${C.border}`, borderRadius: 8,
          fontSize: 14, outline: 'none', resize: 'vertical',
          fontFamily: 'inherit',
        }}
      />
    </label>
  );
}

export function Tabs({ tabs, active, onChange }) {
  const { C } = useTheme();
  return (
    <div style={{ borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 4, marginBottom: 20 }}>
      {tabs.map((t) => (
        <button
          key={t.id} onClick={() => onChange(t.id)}
          style={{
            padding: '10px 16px', background: 'transparent', border: 'none',
            color: active === t.id ? C.accent : C.textMuted, cursor: 'pointer',
            fontSize: 14, fontWeight: 600, borderBottom: `2px solid ${active === t.id ? C.accent : 'transparent'}`,
            marginBottom: -1,
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, subtitle, action }) {
  const { C } = useTheme();
  return (
    <div style={{ textAlign: 'center', padding: '48px 20px' }}>
      {Icon && <Icon size={44} color={C.textSub} style={{ marginBottom: 12 }} />}
      <div style={{ color: C.text, fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{title}</div>
      {subtitle && <div style={{ color: C.textMuted, fontSize: 13, marginBottom: 16 }}>{subtitle}</div>}
      {action}
    </div>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmText = 'Confirm', variant = 'primary' }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width={420}>
      <p style={{ marginBottom: 20, lineHeight: 1.6 }}>{message}</p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant={variant} onClick={() => { onConfirm?.(); onClose?.(); }}>{confirmText}</Button>
      </div>
    </Modal>
  );
}

export function Toast({ toast }) {
  const { C } = useTheme();
  if (!toast) return null;
  const color = toast.type === 'error' ? C.danger : toast.type === 'warning' ? C.warning : C.success;
  return (
    <div style={{
      position: 'fixed', top: 24, right: 24, zIndex: 1100,
      background: C.card, color: C.text, border: `1px solid ${color}`,
      borderLeft: `4px solid ${color}`, padding: '12px 16px', borderRadius: 10,
      animation: 'slideIn 200ms ease', minWidth: 240, fontSize: 14,
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    }}>{toast.msg}</div>
  );
}

export function Row({ children, gap = 12, style }) {
  return <div style={{ display: 'flex', gap, alignItems: 'center', ...style }}>{children}</div>;
}

export function Col({ children, gap = 12, style }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap, ...style }}>{children}</div>;
}

export function Grid({ children, gap = 16, minWidth = 240, style }) {
  return (
    <div style={{
      display: 'grid', gap,
      gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}px, 1fr))`,
      ...style,
    }}>{children}</div>
  );
}

export function Avatar({ name, color, size = 36 }) {
  const initials = (name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: size / 3, background: color || '#5b8def',
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.38, flexShrink: 0,
    }}>{initials}</div>
  );
}
