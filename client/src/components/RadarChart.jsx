const COLORS = {
  book: '#D4A843', film: '#E0547A', game: '#3ABFA3',
  default: '#C9A84C'
};

function polar(cx, cy, r, angleDeg) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

export default function RadarChart({ tags, queryProfile, titleProfile, titleType, size = 260, label }) {
  if (!tags || tags.length < 3) return null;
  const cx = size / 2, cy = size / 2, maxR = size * 0.36, n = tags.length;

  const axes = tags.map((tag, i) => {
    const angle = (360 / n) * i;
    const outer = polar(cx, cy, maxR, angle);
    const labelPt = polar(cx, cy, maxR + 22, angle);
    return { tag, angle, outer, labelPt };
  });

  const makePoints = (profile) => axes.map(({ tag, angle }) => {
    const val = profile?.[tag] ?? 0;
    const r = maxR * val;
    const p = polar(cx, cy, r, angle);
    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(' ');

  // grid circles
  const grids = [0.25, 0.5, 0.75, 1].map(frac => {
    const pts = axes.map(({ angle }) => {
      const p = polar(cx, cy, maxR * frac, angle);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }).join(' ');
    return <polygon key={frac} points={pts} fill="none" stroke="var(--border)" strokeWidth="1" />;
  });

  const color = COLORS[titleType] || COLORS.default;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ overflow: 'visible' }}>
      {grids}
      {axes.map(({ outer, cx: acx, angle }, i) => (
        <line key={i} x1={cx} y1={cy} x2={outer.x.toFixed(1)} y2={outer.y.toFixed(1)}
          stroke="var(--border)" strokeWidth="1" />
      ))}
      {queryProfile && (
        <polygon points={makePoints(queryProfile)}
          fill="rgba(201,168,76,0.18)" stroke="var(--accent)" strokeWidth="1.5"
          strokeLinejoin="round" />
      )}
      {titleProfile && (
        <polygon points={makePoints(titleProfile)}
          fill={`${color}22`} stroke={color} strokeWidth="2"
          strokeLinejoin="round" />
      )}
      {axes.map(({ tag, labelPt }, i) => {
        const anchor = labelPt.x < cx - 4 ? 'end' : labelPt.x > cx + 4 ? 'start' : 'middle';
        return (
          <text key={i} x={labelPt.x.toFixed(1)} y={labelPt.y.toFixed(1)}
            textAnchor={anchor} dominantBaseline="middle"
            fontSize="9" fill="var(--text3)" fontFamily="var(--font-ui)" fontWeight="600">
            {tag.length > 12 ? tag.slice(0, 11) + '…' : tag}
          </text>
        );
      })}
      {label && (
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
          fontSize="9" fill="var(--text2)" fontFamily="var(--font-ui)" fontWeight="700">
          {label}
        </text>
      )}
    </svg>
  );
}
