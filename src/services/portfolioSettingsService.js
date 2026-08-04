import { doc, setDoc, getDoc, getDocFromServer, onSnapshot } from 'firebase/firestore'

function settingsDoc(db, uid) {
  return doc(db, 'users', uid, 'portfolioSettings', 'main')
}

export const DEFAULTS = {
  heroBgImage:         null,
  footerBgImage:       null,
  brandStyleStatement: '',
  brandAbout:          '',
  brandYearFounded:    '',
  brandMilestones:     [{ number: '', label: '' }, { number: '', label: '' }],
  brandLocation:       '',
  brandAvailability:   'open',
  brandAvailableUntil: { month: null, year: null },
  brandBusinessHours:  { startDay: null, endDay: null, openMinutes: null, closeMinutes: null },
  brandTurnaround:     '1 weeks',
  brandServiceArea:    [],
  brandBookingNote:    '',
  brandProcessSteps:   [{ title: '', description: '' }],
  brandFaqs:           [{ question: '', answer: '' }],
  brandFooterText:     '',
  portfolioTemplate:   'template1',
}

const OBSOLETE_FIELDS = ['heroAvatarImage', 'footerLogoImage', 'brandMilestone', 'brandSignatureStyle']

export async function savePortfolioSettings(db, uid, settings) {
  await setDoc(settingsDoc(db, uid), {
    ...settings,
    updatedAt: new Date().toISOString(),
  }, { merge: true })
}

export async function pruneObsoletePortfolioFields(db, uid) {
  const clearPatch = {}
  OBSOLETE_FIELDS.forEach(field => { clearPatch[field] = deleteField() })
  await setDoc(settingsDoc(db, uid), clearPatch, { merge: true })
}

export function subscribeToPortfolioSettings(db, uid, callback, onError) {
  return onSnapshot(
    settingsDoc(db, uid),
    { includeMetadataChanges: true },
    snap => {
      if (snap.metadata.hasPendingWrites || !snap.metadata.fromCache) {
        callback(snap.exists() ? { ...DEFAULTS, ...snap.data() } : { ...DEFAULTS })
      }
    },
    err => { onError?.(err) }
  )
}

export async function getPortfolioSettings(db, uid) {
  const snap = await getDoc(settingsDoc(db, uid))
  if (!snap.exists()) return { ...DEFAULTS }
  return { ...DEFAULTS, ...snap.data() }
}

export async function getPortfolioSettingsFromServer(db, uid) {
  const snap = await getDocFromServer(settingsDoc(db, uid))
  if (!snap.exists()) return { ...DEFAULTS }
  return { ...DEFAULTS, ...snap.data() }
}
