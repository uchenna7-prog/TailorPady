import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useAuth }           from './AuthContext'
import { useProfileSettings } from './ProfileSettingsContext'
import { subscribeToInvoices } from '../services/invoiceService'
import { useCustomers } from './CustomerContext'

const InvoiceContext = createContext(null)

export function InvoiceProvider({ children }) {
  const { user }            = useAuth()
  const { profileSettings } = useProfileSettings()
  const { customers } = useCustomers()

  const [allInvoices, setAllInvoices]       = useState([])
  const [currentInvoice, setCurrentInvoice] = useState(null)

  useEffect(() => {
    if (!user) {
      setAllInvoices([])
      return
    }
    return subscribeToInvoices(user.uid, setAllInvoices)
  }, [user])

  const enrichedInvoices = useMemo(() => {

  const customerMap = new Map(
    customers.map(c => [c.id, c])
  )

  return allInvoices.map(order => ({
    ...order,
    customerName: customerMap.get(order.customerId)?.name ?? 'Unknown',
    customerPhone: customerMap.get(order.customerId)?.phone ?? null,
  
  }))
  }, [allInvoices, customers])


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
      allInvoices : enrichedInvoices,
      currentInvoice,
      setCurrentInvoice,
      template: profileSettings.invoiceTemplate,
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