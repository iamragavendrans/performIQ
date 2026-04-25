import { useTheme } from '../../hooks/useTheme';

// Weighted polar goals chart.
// - Each goal occupies an arc on a 360° circle, angle ∝ weight.
// - Arc radius ∝ completion (capped at 100% = outer ring).
// - Colour = the goal's stable per-goal identity colour (via colorMap).
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

      {/* Filled wedges */}
      {slices.map((s, i) => (
        <path
          key={`arc-${i}`}
          d={arcPath(cx, cy, s.r, s.start, s.end)}
          fill={s.color}
          fillOpacity="0.78"
          stroke={s.color}
          strokeWidth="1"
        />
      ))}

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
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.45)' }}
          >{Math.round(s.g.completion)}%</text>
        );
      })}
    </svg>
  );
}
