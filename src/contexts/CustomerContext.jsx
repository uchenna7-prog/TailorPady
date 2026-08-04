import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo
} from 'react'
import { useAuth } from './AuthContext'
import {
  subscribeToCustomers,
  addCustomer              as addCustomerToDb,
  updateCustomer           as updateCustomerInDb,
  deleteCustomer           as deleteCustomerFromDb,
  deleteCustomerAndAllData as deleteCustomerAndAllDataFromDb,
} from '../services/customerService'

const CustomerContext = createContext(null)

function makeTempId() {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function CustomerProvider({ children }) {
  const { user } = useAuth()
  const [customers, setCustomers] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    if (!user) {
      setCustomers([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const unsubscribe = subscribeToCustomers(
      user.uid,
      (customers) => { setCustomers(customers); setLoading(false) },
      (err)       => { setError(err.message);   setLoading(false) }
    )
    return unsubscribe
  }, [user])

  const addCustomer = useCallback(async (customer) => {
    if (!user) return null
    const { id, ...data } = customer
    const tempId = makeTempId()

    setCustomers(prev => [
      { id: tempId, clientId: tempId, ...data },
      ...prev,
    ])

    addCustomerToDb(user.uid, { ...data, clientId: tempId }).catch(err => {
      setError(err.message)
    })

    return tempId
  }, [user])

  const updateCustomer = useCallback(async (id, updates) => {
    if (!user) return
    try {
      await updateCustomerInDb(user.uid, String(id), updates)
    } catch (err) {
      setError(err.message)
    }
  }, [user])

  const deleteCustomer = useCallback(async (id) => {
    if (!user) return
    try {
      await deleteCustomerFromDb(user.uid, String(id))
    } catch (err) {
      setError(err.message)
    }
  }, [user])

  const deleteCustomerAndAllData = useCallback(async (id) => {
    if (!user) return
    await deleteCustomerAndAllDataFromDb(user.uid, String(id))
  }, [user])

  const getCustomer = useCallback((id) => {
    return customers.find(c => String(c.id) === String(id)) ?? null
  }, [customers])

  const value = useMemo(() => ({
    customers,
    loading,
    error,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    deleteCustomerAndAllData,
    getCustomer,
  }), [customers, loading, error, addCustomer, updateCustomer, deleteCustomer, deleteCustomerAndAllData, getCustomer])

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  )
}

export function useCustomers() {
  return useContext(CustomerContext)
}
