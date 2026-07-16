function getDonutColor(percentage) {
  if (percentage >= 80) return '#22c55e'
  if (percentage >= 50) return '#fb923c'
  return '#ef4444'
}

export function RevenueDonut({ percentage }) {
  const r      = 36
  const cx     = 44
  const cy     = 44
  const circ   = 2 * Math.PI * r
  const filled = Math.min(Math.max(percentage, 0), 100)
  const dash   = (filled / 100) * circ
  const color  = getDonutColor(filled)

  return (
    <svg width="88" height="88" viewBox="0 0 88 88">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth="8" />
      {filled > 0 && (
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(0.4,0,0.2,1), stroke 0.4s ease' }}
        />
      )}
      <text
        x="50%" y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={filled > 0 ? color : 'var(--text3)'}
        fontSize="15"
        fontWeight="800"
        style={{ transition: 'fill 0.4s ease' }}
      >
        {percentage}%
      </text>
    </svg>
  )
}