import { useTheme } from '../../hooks/useTheme';

// Single-purpose dashboard card with a clear header / primary metric /
// supporting context / optional action pattern. No nested cards, no boxed
// header chrome — the label "breaks" the card's top border.
export default function InsightCard({
  label,
  icon: Icon,
  tone,
  primary,
  secondary,
  detail,
  footer,
  onClick,
  action,
  children,
  minHeight = 150,
}) {
  const { C } = useTheme();
  const accent = tone || C.accent;
  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        padding: '22px 20px 18px',
        minHeight,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 160ms ease, border-color 160ms ease',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}
      onMouseEnter={(e) => { if (onClick) { e.currentTarget.style.borderColor = accent; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
      onMouseLeave={(e) => { if (onClick) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(0)'; } }}
    >
      {/* Border-breaking header */}
      <div style={{
        position: 'absolute', top: -9, left: 16,
        background: C.card, padding: '0 8px',
        color: accent, fontSize: 10, fontWeight: 700, letterSpacing: 1,
        textTransform: 'uppercase',
      }}>{label}</div>

      {/* Primary: big number/text + icon */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginTop: 6 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ color: C.text, fontSize: 26, fontWeight: 800, lineHeight: 1.15 }}>
            {primary}
          </div>
          {secondary && (
            <div style={{ color: C.textMuted, fontSize: 13, marginTop: 4 }}>{secondary}</div>
          )}
        </div>
        {Icon && (
          <div style={{ background: accent + '22', padding: 10, borderRadius: 10, flexShrink: 0 }}>
            <Icon size={18} color={accent} />
          </div>
        )}
      </div>

      {detail && (
        <div style={{ color: C.textSub, fontSize: 12, lineHeight: 1.5 }}>{detail}</div>
      )}

      {children}

      {action && (
        <div style={{ marginTop: 'auto', paddingTop: 10 }}>{action}</div>
      )}
      {footer && (
        <div style={{ marginTop: 'auto', paddingTop: 10, color: C.textSub, fontSize: 11 }}>{footer}</div>
      )}
    </div>
  );
}
