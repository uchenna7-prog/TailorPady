import { DEFAULT_COUNTRY } from "./datas"

export function buildPhoneNumber(localNumber, dialCode) {
  const digits = localNumber.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('0')) return `${dialCode} ${digits.slice(1)}`
  if (digits.length === 10) return `${dialCode} ${digits}`
  return null
}

export function getPhoneHint(localNumber) {
    const digits = localNumber.replace(/\D/g, '')
    if (!digits) return null
    if (digits.length === 11 && digits.startsWith('0')) return { 
        ok: true, 
        msg: 'Leading 0 will be removed when saving' 
    }
    if (digits.length === 10) return { 
        ok: true,  
        msg: 'Valid' 
    }
    if (digits.length > 11) return { 
        ok: false, 
        msg: 'Too many digits' 
    }
    if (digits.length === 11 && !digits.startsWith('0')) return { 
        ok: false, 
        msg: '11-digit numbers must start with 0' 
    }
    return { 
        ok: false, 
        msg: `${10 - digits.length} more digit${10 - digits.length !== 1 ? 's' : ''} needed` 
    }
}

export function getOrSetJoinDate() {
  
  const key  = 'TailorPady_joined'
  const existing = localStorage.getItem(key)
  if (existing) return existing
  const today = new Date().toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
})
  localStorage.setItem(key, today)
  return today
}




export function parseStoredPhone(stored) {
  if (!stored) return { local: '', country: DEFAULT_COUNTRY }
  const match = stored.match(/^(\+\d+)\s+(.+)$/)
  if (match) {
    return { local: '0' + match[2].replace(/\D/g, ''), country: { ...DEFAULT_COUNTRY, dial_code: match[1] } }
  }
  return { local: stored, country: DEFAULT_COUNTRY }
}


export function loadPersonalInfo(authUser) {
  try {
    const raw    = localStorage.getItem(PERSONAL_KEY)
    const stored = raw ? JSON.parse(raw) : {}
    return {
      fullName:   stored.fullName   || authUser?.displayName || '',
      email:      stored.email      || authUser?.email       || '',
      phone:      stored.phone      || '',
      city:       stored.city       || '',
      country:    stored.country    || '',
      sex:        stored.sex        || '',
      birthMonth: stored.birthMonth || '',
      birthDay:   stored.birthDay   || '',
    }
  } catch {
    return {
      fullName: authUser?.displayName || '', email: authUser?.email || '',
      phone: '', city: '', country: '', sex: '', birthMonth: '', birthDay: '',
    }
  }
}

export function savePersonalInfoLocally(data) {
  try { 
    localStorage.setItem(PROFILE_SETTINGS_STORAGE_KEY, JSON.stringify({...profileSettings,...data})) 
  } 
  catch {
  
  }
}
