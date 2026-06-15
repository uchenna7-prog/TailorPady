import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore'

function settingsDoc(db, uid) {
  return doc(db, 'users', uid, 'portfolioSettings', 'main')
}

const DEFAULTS = {
  heroBgImage:         null,
  heroAvatarImage:     null,
  footerBgImage:       null,
  footerLogoImage:     null,
  brandMilestone:      '',
  brandSignatureStyle: '',
  brandStyleStatement: '',
  brandAvailability:   'open',
  brandAvailableUntil: '',
  brandTurnaround:     '1 weeks',
  brandServiceArea:    [],
  brandBookingNote:    '',
  portfolioTemplate:   'template2',
}

export async function savePortfolioSettings(db, uid, settings) {
  await setDoc(settingsDoc(db, uid), {
    ...settings,
    updatedAt: new Date().toISOString(),
  }, { merge: true })
}

export function subscribeToPortfolioSettings(db, uid, callback, onError) {
  return onSnapshot(
    settingsDoc(db, uid),
    snap => callback(snap.exists() ? { ...DEFAULTS, ...snap.data() } : { ...DEFAULTS }),
    err => { onError?.(err) }
  )
}

export async function getPortfolioSettings(db, uid) {
  const snap = await getDoc(settingsDoc(db, uid))
  if (!snap.exists()) return { ...DEFAULTS }
  return { ...DEFAULTS, ...snap.data() }
}