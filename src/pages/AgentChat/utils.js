export function getGreeting() {
  const hour = new Date().getHours()
  if (hour >= 5  && hour < 12) return 'Good morning'
  if (hour >= 12 && hour < 17) return 'Good afternoon'
  if (hour >= 17 && hour < 21) return 'Good evening'
  return 'Good night'
}

export function getGreetingEmoji() {
  const hour = new Date().getHours()
  if (hour >= 5  && hour < 12) return '☀️'
  if (hour >= 12 && hour < 17) return '👋'
  if (hour >= 17 && hour < 21) return '🌙'
  return '😴'
}


export function haptic(type = 'light') {
  if (!navigator.vibrate) return
  if (type === 'light')  navigator.vibrate(10)
  if (type === 'medium') navigator.vibrate(20)
}

export function getDisplayName(user) {
  const fullName = user?.displayName?.trim()
  if (fullName) {
    const parts = fullName.split(/\s+/)
    return parts.length >= 1 ? parts[0] : 'there'
  }
  return 'there'
}

export function getBriefSubtext(subtexts) {
  const day = new Date().getDay()
  const dayMatch = subtexts.find(s => s.day === day)
  if (dayMatch) return dayMatch.text

  const pool = subtexts.filter(s => s.day === undefined)
  return pool[Math.floor(Math.random() * pool.length)]?.text || ''
}