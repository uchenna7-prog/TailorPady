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
  subscribeToInvoices,
  addInvoice as addInvoiceToDb,
} from '../services/invoiceService'

const InvoiceContext = createContext(null)

export function InvoiceProvider({ children }) {
  const { user }            = useAuth()
  const { profileSettings } = useProfileSettings()
  const { customers }       = useCustomers()

  const [allInvoices,     setAllInvoices]     = useState([])
  const [currentInvoice,  setCurrentInvoice]  = useState(null)

  useEffect(() => {
    if (!user) {
      setAllInvoices([])
      return
    }
    return subscribeToInvoices(user.uid, setAllInvoices)
  }, [user])

  const enrichedInvoices = useMemo(() => {
    const customerMap = new Map(customers.map(c => [c.id, c]))
    return allInvoices.map(invoice => ({
      ...invoice,
      customerName:  customerMap.get(invoice.customerId)?.name  ?? 'Unknown',
      customerPhone: customerMap.get(invoice.customerId)?.phone ?? null,
    }))
  }, [allInvoices, customers])

  const addInvoice = useCallback(async (data) => {
    if (!user) return
    const customerId = data.customerId
    if (!customerId) return
    await addInvoiceToDb(user.uid, customerId, data)
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
    <InvoiceContext.Provider value={{
      allInvoices: enrichedInvoices,
      currentInvoice,
      setCurrentInvoice,
      addInvoice,
      template:  profileSettings.invoiceTemplate,
      brandInfos,
    }}>
      {children}
    </InvoiceContext.Provider>
  )
}

export function useInvoice() {
  return useContext(InvoiceContext)
}

export function useInvoices() {
  return useContext(InvoiceContext)
}