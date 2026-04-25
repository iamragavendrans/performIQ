import { useState } from 'react';
import { useTheme } from '../../hooks/useTheme';

// Weighted polar goals chart.
// - Each goal occupies an arc on a 360° circle, angle ∝ weight.
// - Arc radius ∝ completion (capped at 100% = outer ring).
// - Colour = the goal's stable per-goal identity colour (via colorMap).
// - On hover: a small tooltip surfaces goal name, completion %, weight, and
//   contribution to rating (no status pills baked into the chart itself).
//
// The caller supplies `colorMap` keyed by goal.id — keep the same map across
// the app so the eye can track a goal between views.
const polar = (cx, cy, r, angleDeg) => {
  const a = (angleDeg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
};

const arcPath = (cx, cy, r, startDeg, endDeg) => {
  if (r <= 0) return '';
  const { x: x1, y: y1 } = polar(cx, cy, r, startDeg);
  const { x: x2, y: y2 } = polar(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
};

export default function GoalsRadar({ goals, size = 280, colorMap = {} }) {
  const { C } = useTheme();
  const [hover, setHover] = useState(null);
  if (!goals?.length) return null;
  const total = goals.reduce((s, g) => s + (g.weight || 0), 0) || 1;
  const padding = 12;
  const maxR = size / 2 - padding;
  const cx = size / 2;
  const cy = size / 2;

  let cursor = 0;
  const slices = goals.map((g) => {
    const sweep = ((g.weight || 0) / total) * 360;
    const slice = {
      g,
      start: cursor,
      end: cursor + sweep,
      mid: cursor + sweep / 2,
      sweep,
      r: (Math.min(100, g.completion || 0) / 100) * maxR,
      color: colorMap[g.id] || C.accent,
    };
    cursor += sweep;
    return slice;
  });

  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ display: 'block' }}>
        {/* Reference rings (25 / 50 / 75 / 100) */}
        {rings.map((frac, i) => (
          <circle
            key={i} cx={cx} cy={cy} r={maxR * frac}
            fill="none" stroke={C.border}
            strokeDasharray={frac === 1 ? '0' : '2 3'}
            strokeWidth={frac === 1 ? 1 : 0.7}
          />
        ))}
        {rings.map((frac, i) => (
          <text
            key={`t-${i}`} x={cx + 3} y={cy - maxR * frac - 2}
            fill={C.textSub} fontSize="9"
          >{Math.round(frac * 100)}</text>
        ))}

        {/* Slice separators */}
        {slices.map((s, i) => {
          const { x, y } = polar(cx, cy, maxR, s.start);
          return <line key={`sep-${i}`} x1={cx} y1={cy} x2={x} y2={y} stroke={C.border} strokeWidth="0.6" />;
        })}

        {/* Filled wedges (interactive) */}
        {slices.map((s, i) => {
          const isHover = hover?.id === s.g.id;
          return (
            <path
              key={`arc-${i}`}
              d={arcPath(cx, cy, s.r, s.start, s.end)}
              fill={s.color}
              fillOpacity={isHover ? 0.95 : 0.78}
              stroke={s.color}
              strokeWidth={isHover ? 2 : 1}
              style={{ cursor: 'pointer', transition: 'fill-opacity 120ms ease, stroke-width 120ms ease' }}
              onMouseEnter={() => setHover(s.g)}
              onMouseLeave={() => setHover((h) => (h?.id === s.g.id ? null : h))}
            />
          );
        })}

        {/* Hover ring outline highlights the active wedge across full radius */}
        {hover && (() => {
          const s = slices.find((x) => x.g.id === hover.id);
          if (!s) return null;
          const { x: xa, y: ya } = polar(cx, cy, maxR, s.start);
          const { x: xb, y: yb } = polar(cx, cy, maxR, s.end);
          const large = s.sweep > 180 ? 1 : 0;
          return (
            <path
              d={`M ${cx} ${cy} L ${xa} ${ya} A ${maxR} ${maxR} 0 ${large} 1 ${xb} ${yb} Z`}
              fill="none" stroke={s.color} strokeWidth="1.2" strokeDasharray="3 3"
              pointerEvents="none"
            />
          );
        })()}

        {/* Inline completion % inside each wedge, if the wedge is wide + tall enough */}
        {slices.map((s, i) => {
          if (s.sweep < 20 || s.r < 28) return null;
          const labelR = Math.max(18, s.r * 0.6);
          const { x, y } = polar(cx, cy, labelR, s.mid);
          return (
            <text
              key={`pct-${i}`}
              x={x} y={y}
              fill="#fff" fontSize="11" fontWeight="800"
              textAnchor="middle" dominantBaseline="middle"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.45)', pointerEvents: 'none' }}
            >{Math.round(s.g.completion)}%</text>
          );
        })}
      </svg>

      {hover && (() => {
        const weight = hover.weight || 0;
        const completion = hover.completion || 0;
        const contribution = (completion * weight) / 100;
        return (
          <div
            role="tooltip"
            style={{
              position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
              background: C.card, color: C.text, border: `1px solid ${C.border}`,
              borderRadius: 10, padding: '10px 12px', minWidth: 220, maxWidth: 280,
              fontSize: 12, lineHeight: 1.4,
              boxShadow: '0 8px 24px rgba(0,0,0,0.25)', pointerEvents: 'none', zIndex: 5,
            }}
          >
            <div style={{ fontWeight: 700, color: C.text, marginBottom: 6 }}>{hover.title}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: C.textMuted }}>
              <span>Completion</span><span style={{ color: C.text, fontWeight: 600 }}>{completion}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: C.textMuted }}>
              <span>Weight</span><span style={{ color: C.text, fontWeight: 600 }}>{weight}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: C.textMuted }}>
              <span>Contribution to rating</span>
              <span style={{ color: C.text, fontWeight: 600 }}>{contribution.toFixed(1)} pts</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
