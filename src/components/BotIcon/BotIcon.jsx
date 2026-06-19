export function BotIcon({ size = 18, color = "currentColor" , backgroundColor = "var(--bg)" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="11" width="16" height="10" rx="4" fill={color} />
      <rect x="7" y="14.5" width="2.5" height="2.5" rx="0.6" fill={backgroundColor} />
      <rect x="14.5" y="14.5" width="2.5" height="2.5" rx="0.6" fill={backgroundColor} />
      <path d="M9.5 18.5h5" stroke={backgroundColor} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 11V8" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="6.5" r="1.8" fill={color} />
      <line x1="4" y1="15" x2="2" y2="15" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="20" y1="15" x2="22" y2="15" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}