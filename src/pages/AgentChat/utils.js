export function getGreeting(name) {
  const h = new Date().getHours()
  const salutation = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  return `${salutation}${name ? `, ${name}` : ''}! 👋`
}

export function haptic(type = 'light') {
  if (!navigator.vibrate) return
  if (type === 'light')  navigator.vibrate(10)
  if (type === 'medium') navigator.vibrate(20)
}
