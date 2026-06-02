import { auth } from '../firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  updateProfile,
  verifyBeforeUpdateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  linkWithPopup,
  unlink,
} from 'firebase/auth'

export const signup = async (email, password, displayName) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(credential.user, { displayName })
  return credential
}

export const login = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password)
}

export const loginWithGoogle = () => {
  const provider = new GoogleAuthProvider()
  return signInWithRedirect(auth, provider)
}

export const getGoogleRedirectResult = () => {
  return getRedirectResult(auth)
}

export const logout = () => {
  return signOut(auth)
}

export const resetPassword = (email) => {
  return sendPasswordResetEmail(auth, email)
}

export const reauth = (user, currentPassword) => {
  const credential = EmailAuthProvider.credential(user.email, currentPassword)
  return reauthenticateWithCredential(user, credential)
}

export const changePassword = async (user, currentPassword, newPassword) => {
  await reauth(user, currentPassword)
  return updatePassword(user, newPassword)
}

export const changeEmail = async (user, currentPassword, newEmail) => {
  await reauth(user, currentPassword)
  return verifyBeforeUpdateEmail(user, newEmail)
}

export const linkGoogle = (user) => {
  const provider = new GoogleAuthProvider()
  return linkWithPopup(user, provider)
}

export const unlinkProvider = (user, providerId) => {
  return unlink(user, providerId)
}