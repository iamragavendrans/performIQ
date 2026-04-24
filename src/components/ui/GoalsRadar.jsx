import { useTheme } from '../../hooks/useTheme';
import { goalStatus, statusColor } from '../../lib/compute';

// Weighted-polar "goals" chart.
// - Each goal occupies an arc on a 360° circle, proportional to its weight.
//   weight 25% of total → 90° of the circle.
// - The arc's radius is proportional to completion (0–100% → 0–maxR).
// - Colour = status colour (on-track / at-risk / …).
//
// This lets the eye read two things at once: "how big is this goal in my life?"
// (area), and "how far have I pushed it?" (radius).
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

export default function GoalsRadar({ goals, size = 260, maxLabel = 3 }) {
  const { C } = useTheme();
  if (!goals?.length) return null;
  const total = goals.reduce((s, g) => s + (g.weight || 0), 0) || 1;
  const padding = 8;
  const maxR = size / 2 - padding - 18; // reserve room for labels
  const cx = size / 2;
  const cy = size / 2;

  // Build slice metadata with cumulative start angles.
  let cursor = 0;
  const slices = goals.map((g) => {
    const sweep = (g.weight / total) * 360;
    const slice = {
      g,
      start: cursor,
      end: cursor + sweep,
      mid: cursor + sweep / 2,
      r: (Math.min(100, g.completion || 0) / 100) * maxR,
      color: statusColor(goalStatus(g.completion || 0), C),
    };
    cursor += sweep;
    return slice;
  });

  // Reference rings at 25/50/75/100.
  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ display: 'block' }}>
      {/* Background rings */}
      {rings.map((frac, i) => (
        <circle
          key={i} cx={cx} cy={cy} r={maxR * frac}
          fill="none" stroke={C.border}
          strokeDasharray={frac === 1 ? '0' : '2 3'}
          strokeWidth={frac === 1 ? 1 : 0.8}
        />
      ))}
      {/* Ring labels (top, subtle) */}
      {rings.map((frac, i) => (
        <text
          key={`l-${i}`} x={cx + 2} y={cy - maxR * frac - 2}
          fill={C.textSub} fontSize="9"
        >{Math.round(frac * 100)}</text>
      ))}

      {/* Slice separators — full-radius spokes */}
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
          fillOpacity="0.75"
          stroke={s.color}
          strokeWidth="1"
        />
      ))}

      {/* Outer labels */}
      {slices.map((s, i) => {
        const labelR = maxR + 12;
        const { x, y } = polar(cx, cy, labelR, s.mid);
        const isRight = Math.cos((s.mid - 90) * Math.PI / 180) >= 0;
        const short = (s.g.title || '').split(' ').slice(0, maxLabel).join(' ');
        return (
          <g key={`t-${i}`}>
            <text
              x={x} y={y}
              fill={C.textMuted} fontSize="10"
              textAnchor={isRight ? 'start' : 'end'}
              dominantBaseline="middle"
            >{short}</text>
            <text
              x={x} y={y + 12}
              fill={s.color} fontSize="10" fontWeight="700"
              textAnchor={isRight ? 'start' : 'end'}
              dominantBaseline="middle"
            >{Math.round(s.g.completion)}% · w{s.g.weight}</text>
          </g>
        );
      })}
    </svg>
  );
}
