export function MIcon({ name, size = '1.1rem', color }) {
  return (
    <span
      className="mi"
      style={{ fontSize: size, color: color || 'inherit', lineHeight: 1, display: 'flex', alignItems: 'center' }}
    >
      {name}
    </span>
  )
}