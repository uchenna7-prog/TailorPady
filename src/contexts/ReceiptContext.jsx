import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useAuth }           from './AuthContext'
import { useProfileSettings } from './ProfileSettingsContext'
import { useCustomers }       from './CustomerContext'
import { subscribeToReceipts } from '../services/receiptService'

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
      customerName:  customerMap.get(receipt.customerId)?.name  ?? 'Unknown',
      customerPhone: customerMap.get(receipt.customerId)?.phone ?? null,
    }))
  }, [allReceipts, customers])

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
      template:    profileSettings.receiptTemplate,
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