import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react'
import { useAuth } from './AuthContext'
import { useUsage } from './UsageContext'
import {
  subscribeToOrders,
  addOrder          as addOrderToDb,
  updateOrder       as updateOrderInDb,
  updateOrderStatus as updateOrderStatusInDb,
  updateOrderStage  as updateOrderStageInDb,
  deleteOrder       as deleteOrderFromDb,
} from '../services/orderService'
import { useCustomers } from './CustomerContext'
const OrdersContext = createContext(null)
function makeTempOrderId() {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`
}
export function OrdersProvider({ children }) {
  const { user } = useAuth()
  const { hasReachedLimit, recordUsage } = useUsage()
  const [allOrders, setAllOrders] = useState([])
  const { customers } = useCustomers()
  useEffect(() => {
    if (!user) {
      setAllOrders([])
      return
    }
    return subscribeToOrders(user.uid, setAllOrders)
  }, [user])
const enrichedOrders = useMemo(() => {
  const customerMap = new Map(
    customers.map(c => [c.id, c])
  )
  return allOrders.map(order => ({
    ...order,
    customerName: customerMap.get(order.customerId)?.name ?? 'Unknown',
    customerPhone: customerMap.get(order.customerId)?.phone ?? null,
  }))
  }, [allOrders, customers])
  const addOrder = useCallback(async (customerId, data) => {
    if (!user) return null
    if (hasReachedLimit('ordersPerMonth', 'ordersPerMonth')) {
      const limitError = new Error('ORDER_LIMIT_REACHED')
      limitError.code = 'limit-reached'
      throw limitError
    }
    const { id: _, ...orderData } = data
    const nextOrderNumber = allOrders.reduce((max, o) => Math.max(max, o.orderNumber || 0), 0) + 1
    const tempId = makeTempOrderId()
    setAllOrders(prev => [
      { id: tempId, clientId: tempId, customerId, orderNumber: nextOrderNumber, status: orderData.status ?? 'pending', createdAt: new Date(), ...orderData },
      ...prev,
    ])
    addOrderToDb(user.uid, customerId, { ...orderData, orderNumber: nextOrderNumber, clientId: tempId }).catch(() => {})
    recordUsage('ordersPerMonth').catch(() => {})
    return tempId
  }, [user, allOrders, hasReachedLimit, recordUsage])
  const updateOrder = useCallback(async (customerId, orderId, data) => {
    if (!user) return
    return updateOrderInDb(user.uid, orderId, data)
  }, [user])
  const updateOrderStatus = useCallback(async (customerId, orderId, status) => {
    if (!user) return
    return updateOrderStatusInDb(user.uid, orderId, status)
  }, [user])
  const updateOrderStage = useCallback(async (customerId, orderId, stage) => {
    if (!user) return
    return updateOrderStageInDb(user.uid, orderId, stage)
  }, [user])
  const deleteOrder = useCallback(async (customerId, orderId) => {
    if (!user) return
    return deleteOrderFromDb(user.uid, orderId)
  }, [user])
  return (
    <OrdersContext.Provider value={{
      allOrders: enrichedOrders,
      addOrder,
      updateOrder,
      updateOrderStatus,
      updateOrderStage,
      deleteOrder,
    }}>
      {children}
    </OrdersContext.Provider>
  )
}
export function useOrders() {
  const ctx = useContext(OrdersContext)
  return ctx
}
