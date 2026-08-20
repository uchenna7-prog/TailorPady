const SESSION_KEY = 'tp_session_id'

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function getSessionId() {
  try {
    let id = sessionStorage.getItem(SESSION_KEY)
    if (!id) {
      id = generateId()
      sessionStorage.setItem(SESSION_KEY, id)
    }
    return id
  } catch {
    return generateId()
  }
}
