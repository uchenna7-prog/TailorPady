import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'

function brandDoc(uid) {
  return doc(db, 'users', uid, 'tailorProfile', 'brand')
}

function personalDoc(uid) {
  return doc(db, 'users', uid, 'tailorProfile', 'personal')
}

export async function saveBrandDataToFirestore(uid, settings) {
  await setDoc(brandDoc(uid), {
    brandName:          settings.brandName          ?? '',
    brandTagline:       settings.brandTagline       ?? '',
    brandColourId:      settings.brandColourId      ?? 'classic-warm-black',
    brandColour:        settings.brandColour        ?? '#1C1814',
    brandLogo:          settings.brandLogo          ?? null,
    brandPhone:         settings.brandPhone         ?? '',
    brandEmail:         settings.brandEmail         ?? '',
    brandAddress:       settings.brandAddress       ?? '',
    brandWebsite:       settings.brandWebsite       ?? '',
    brandFoundedYear:   settings.brandFoundedYear   ?? '',
    brandSocials:       settings.brandSocials       ?? [],
    brandSignature:     settings.brandSignature     ?? null,
    brandPaymentTerms:  settings.brandPaymentTerms  ?? [],
    accountBank:        settings.accountBank        ?? '',
    accountNumber:      settings.accountNumber      ?? '',
    accountName:        settings.accountName        ?? '',
    updatedAt:          new Date().toISOString(),
  }, { merge: true })
}

export async function getBrandDataFromFirestore(uid) {
  const snap = await getDoc(brandDoc(uid))
  if (!snap.exists()) return {}
  const { updatedAt, ...rest } = snap.data()
  return rest
}

export async function savePersonalInfosToFirestore(uid, settings) {
  await setDoc(personalDoc(uid), {
    personalFullName:   settings.personalFullName   ?? '',
    personalEmail:      settings.personalEmail      ?? '',
    personalPhone:      settings.personalPhone      ?? '',
    personalCity:       settings.personalCity       ?? '',
    personalCountry:    settings.personalCountry    ?? '',
    personalSex:        settings.personalSex        ?? '',
    personalBirthMonth: settings.personalBirthMonth ?? '',
    personalBirthDay:   settings.personalBirthDay   ?? '',
    updatedAt:          new Date().toISOString(),
  }, { merge: true })
}

export async function getPersonalInfosFromFirestore(uid) {
  const snap = await getDoc(personalDoc(uid))
  if (!snap.exists()) return {}
  const { updatedAt, ...rest } = snap.data()
  return rest
}