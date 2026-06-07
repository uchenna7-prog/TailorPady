import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore'
import { db } from '../firebase'

function settingsDoc(uid) {
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
  brandServiceArea:    '',
}

export async function savePortfolioSettings(uid, settings) {
  await setDoc(settingsDoc(uid), {
    ...settings,
    updatedAt: new Date().toISOString(),
  }, { merge: true })
}

export function subscribeToPortfolioSettings(uid, callback, onError) {
  return onSnapshot(
    settingsDoc(uid),
    snap => callback(snap.exists() ? { ...DEFAULTS, ...snap.data() } : { ...DEFAULTS }),
    err => { console.error('[portfolioSettingsService]', err); onError?.(err) }
  )
}

export async function getPortfolioSettings(uid) {
  const snap = await getDoc(settingsDoc(uid))
  if (!snap.exists()) return { ...DEFAULTS }
  return { ...DEFAULTS, ...snap.data() }
}