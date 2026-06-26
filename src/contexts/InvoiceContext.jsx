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
  addInvoice          as addInvoiceToDb,
  updateInvoice       as updateInvoiceInDb,
  updateInvoiceStatus as updateInvoiceStatusInDb,
  deleteInvoice       as deleteInvoiceFromDb,
} from '../services/invoiceService'

const InvoiceContext = createContext(null)

export function InvoiceProvider({ children }) {
  const { user }            = useAuth()
  const { profileSettings } = useProfileSettings()
  const { customers }       = useCustomers()

  const [allInvoices,    setAllInvoices]    = useState([])
  const [currentInvoice, setCurrentInvoice] = useState(null)

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
      customerName:    customerMap.get(invoice.customerId)?.name    ?? 'Unknown',
      customerPhone:   customerMap.get(invoice.customerId)?.phone   ?? null,
      customerAddress: customerMap.get(invoice.customerId)?.address ?? null,
    }))
  }, [allInvoices, customers])

  const addInvoice = useCallback(async (data) => {
    if (!user) return
    const customerId = data.customerId
    if (!customerId) return
    await addInvoiceToDb(user.uid, customerId, data)
  }, [user])

  const updateInvoiceStatus = useCallback(async (invoiceId, status) => {
    if (!user) return
    await updateInvoiceStatusInDb(user.uid, String(invoiceId), status)
  }, [user])

  const updateInvoiceTemplate = useCallback(async (invoiceId, templateId) => {
    if (!user) return
    await updateInvoiceInDb(user.uid, String(invoiceId), { template: templateId })
  }, [user])

  const updateInvoiceColour = useCallback(async (invoiceId, colourId, colour) => {
    if (!user) return
    await updateInvoiceInDb(user.uid, String(invoiceId), {
      'brandSnapshot.colourId': colourId,
      'brandSnapshot.colour':   colour,
    })
  }, [user])

  const deleteInvoice = useCallback(async (invoiceId) => {
    if (!user) return
    await deleteInvoiceFromDb(user.uid, String(invoiceId))
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
      updateInvoiceStatus,
      updateInvoiceTemplate,
      updateInvoiceColour,
      deleteInvoice,
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