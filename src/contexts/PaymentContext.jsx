import {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useState,
} from 'react'
import { useAuth } from './AuthContext'
import { subscribeToPayments } from '../services/paymentService'
import { useCustomers } from './CustomerContext'

const PaymentContext = createContext(null)

export function PaymentProvider({ children }) {

  const { user } = useAuth()
  const { customers } = useCustomers()  
  const [allPayments, setAllPayments] = useState([])

  useEffect(() => {
    if (!user) {
      setAllPayments([])
      return
    }
    return subscribeToPayments(user.uid, setAllPayments)
  }, [user])

  const enrichedPayments = useMemo(() => {
  
    const customerMap = new Map(
      customers.map(c => [c.id, c])
    )
  
    return allPayments.map(order => ({
      ...order,
      customerName: customerMap.get(order.customerId)?.name ?? 'Unknown',
      customerPhone: customerMap.get(order.customerId)?.phone ?? null,
    
    }))
  }, [allPayments, customers])

  return (
    <PaymentContext.Provider value={{ allPayments: enrichedPayments }}>
      {children}
    </PaymentContext.Provider>
  )
}

export function usePayments() {
  return useContext(PaymentContext)
}