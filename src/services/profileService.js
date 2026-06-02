import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '../firebase'
import { DEFAULT_COLOUR_ID } from '../config/brandPalette'


function brandDocRef(uid) {
  return doc(db, 'users', uid, 'publicProfile', 'brand')
}


function personalInfoDocRef(uid) {
  return doc(db, 'users', uid, 'personalProfile', 'brand')
}


export async function saveBrandDataToFirestore(uid, profileSettings) {

  if (!uid) return

  await setDoc(brandDocRef(uid), {

    brandName: profileSettings.brandName  || '',
    brandTagline: profileSettings.brandTagline || '',
    brandColourId: profileSettings.brandColourId  || DEFAULT_COLOUR_ID,
    brandColour: profileSettings.brandColour || '#1C1814',
    brandLogo: profileSettings.brandLogo || null,

    brandMilestone: profileSettings.brandMilestone || '',
    brandSignatureStyle: profileSettings.brandSignatureStyle || '',

    brandPaymentTerms: profileSettings.brandPaymentTerms || [],
    brandSignature: profileSettings.brandSignature  || null,

    brandPhone: profileSettings.brandPhone || '',
    brandEmail: profileSettings.brandEmail || '',
    brandAddress: profileSettings.brandAddress || '',
    brandWebsite: profileSettings.brandWebsite || "",
 
    brandFoundedYear: profileSettings?.brandFoundedYear || '',
    brandAvailability: profileSettings.brandAvailability || 'open',
    brandAvailableUntil: profileSettings.brandAvailableUntil || '',
    brandTurnaround: profileSettings.brandTurnaround || '',
    brandServiceArea: profileSettings.brandServiceArea || '',
    brandStyleStatement: profileSettings.brandStyleStatement || '',
    
    
    brandSocials: profileSettings.brandSocials || [],
    

    accountBank:  profileSettings.accountBank || '',
    accountNumber: profileSettings.accountNumber || '',
    accountName: profileSettings.accountName || '',

    updatedAt: serverTimestamp(),



  })
}


export async function getBrandDataFromFirestore(uid) {

  if (!uid) return null
  const snapshot= await getDoc(brandDocRef(uid))
  return snapshot.exists() ? snapshot.data() : null
}



export async function savePersonalInfosToFirestore(uid, profileSettings) {

  if (!uid) return

  await setDoc(personalInfoDocRef(uid), {

    personalFullName: profileSettings.personalFullName || '',
    personalEmail: profileSettings.personalEmail || '',
    personalPhone: profileSettings.personalPhone || '',
    personalCity: profileSettings.personalCity || '',
    personalCountry: profileSettings.personalCountry || '',
    personalSex: profileSettings.personalSex || '',
    personalBirthMonth: profileSettings.personalBirthMonth || '',
    personalBirthDay: profileSettings.personalBirthDay || '',

    updatedAt: serverTimestamp(),

  }, { merge: true })
}


export async function getPersonalInfosFromFirestore(uid) {
  if (!uid) return null
  try {

    const snapshot = await getDoc(personalInfoDocRef(uid))
    if (snapshot.exists()) return snapshot.data()
    return null
  } catch (err) {

    return null
  }
}
