import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useAuth }            from './AuthContext'
import { useProfileSettings } from './ProfileSettingsContext'
import { useCustomers }       from './CustomerContext'
import {
  subscribeToReceipts,
  addReceipt    as addReceiptToDb,
  updateReceipt as updateReceiptInDb,
  deleteReceipt as deleteReceiptFromDb,
} from '../services/receiptService'

const ReceiptContext = createContext(null)

export function ReceiptProvider({ children }) {
  const { user }            = useAuth()
  const { profileSettings } = useProfileSettings()
  const { customers }       = useCustomers()

  const [allReceipts, setAllReceipts] = useState([])

  useEffect(() => {
    if (!user) {
      setAllReceipts([])
      return
    }
    return subscribeToReceipts(user.uid, setAllReceipts)
  }, [user])

  const enrichedReceipts = useMemo(() => {
    const customerMap = new Map(customers.map(c => [c.id, c]))
    return allReceipts.map(receipt => ({
      ...receipt,
      customerName:    customerMap.get(receipt.customerId)?.name    ?? 'Unknown',
      customerPhone:   customerMap.get(receipt.customerId)?.phone   ?? null,
      customerAddress: customerMap.get(receipt.customerId)?.address ?? null,
    }))
  }, [allReceipts, customers])

  const addReceipt = useCallback(async (data) => {
    if (!user) return
    const customerId = data.customerId
    if (!customerId) return
    await addReceiptToDb(user.uid, customerId, data)
  }, [user])

  const updateReceiptTemplate = useCallback(async (receiptId, templateId) => {
    if (!user) return
    await updateReceiptInDb(user.uid, String(receiptId), { template: templateId })
  }, [user])

  const updateReceiptColour = useCallback(async (receiptId, colourId, colour) => {
    if (!user) return
    await updateReceiptInDb(user.uid, String(receiptId), {
      'brandSnapshot.colourId': colourId,
      'brandSnapshot.colour':   colour,
    })
  }, [user])

  const deleteReceipt = useCallback(async (receiptId) => {
    if (!user) return
    await deleteReceiptFromDb(user.uid, String(receiptId))
  }, [user])

  const brandInfos = {
    name:    profileSettings.brandName,
    logo:    profileSettings.brandLogo,
    colour:  profileSettings.brandColour,
    phone:   profileSettings.brandPhone,
    email:   profileSettings.brandEmail,
    address: profileSettings.brandAddress,
    website: profileSettings.brandWebsite,
    tagline: profileSettings.brandTagline,
  }

  return (
    <ReceiptContext.Provider value={{
      allReceipts: enrichedReceipts,
      addReceipt,
      updateReceiptTemplate,
      updateReceiptColour,
      deleteReceipt,
      template:   profileSettings.receiptTemplate,
      brandInfos,
    }}>
      {children}
    </ReceiptContext.Provider>
  )
}

export function useReceipt() {
  return useContext(ReceiptContext)
}

export function useReceipts() {
  return useContext(ReceiptContext)
}