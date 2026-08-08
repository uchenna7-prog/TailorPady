import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useUsage } from '../contexts/UsageContext'
import { deleteFromCloudinary } from '../services/cloudinaryService'

import {
  subscribeToMeasurements,
  addMeasurement      as addMeasurementToDb,
  updateMeasurement   as updateMeasurementInDb,
  deleteMeasurement   as deleteMeasurementFromDb,
} from '../services/measurementService'

import {
  subscribeToCustomerOrders,
  addOrder          as addOrderToDb,
  updateOrderStatus as updateOrderStatusInDb,
  deleteOrder       as deleteOrderFromDb,
} from '../services/orderService'

import {
  subscribeToCustomerInvoices,
  addInvoice          as addInvoiceToDb,
  updateInvoice        as updateInvoiceInDb,
  updateInvoiceStatus as updateInvoiceStatusInDb,
  deleteInvoice       as deleteInvoiceFromDb,
} from '../services/invoiceService'

import {
  subscribeToCustomerPayments,
  createPayment as fsCreatePayment,
  updatePayment as fsUpdatePayment,
  deletePayment as fsDeletePayment,
} from '../services/paymentService'

import {
  subscribeToCustomerReceipts,
  addReceipt    as fsAddReceipt,
  updateReceipt as fsUpdateReceipt,
  deleteReceipt as fsDeleteReceipt,
} from '../services/receiptService'


function makeTempId() {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`
}


export function useCustomerData(customerId) {
  const { user } = useAuth()
  const { hasReachedLimit, recordUsage } = useUsage()

  const [measurements, setMeasurements] = useState([])
  const [orders,       setOrders]       = useState([])
  const [invoices,     setInvoices]     = useState([])
  const [payments,     setPayments]     = useState([])
  const [receipts,     setReceipts]     = useState([])

  const [measurementsLoading, setMeasurementsLoading] = useState(true)
  const [ordersLoading,       setOrdersLoading]       = useState(true)
  const [invoicesLoading,     setInvoicesLoading]     = useState(true)
  const [paymentsLoading,     setPaymentsLoading]     = useState(true)
  const [receiptsLoading,     setReceiptsLoading]     = useState(true)

  useEffect(() => {
    if (!user || !customerId) {
      setMeasurements([])
      setOrders([])
      setInvoices([])
      setPayments([])
      setReceipts([])
      setMeasurementsLoading(false)
      setOrdersLoading(false)
      setInvoicesLoading(false)
      setPaymentsLoading(false)
      setReceiptsLoading(false)
      return
    }

    setMeasurementsLoading(true)
    setOrdersLoading(true)
    setInvoicesLoading(true)
    setPaymentsLoading(true)
    setReceiptsLoading(true)

    const unsubMeasurements = subscribeToMeasurements(
      user.uid, customerId,
      (data) => { setMeasurements(data); setMeasurementsLoading(false) },
      ()     => { setMeasurementsLoading(false) }
    )

    const unsubOrders = subscribeToCustomerOrders(
      user.uid, customerId,
      (data) => { setOrders(data); setOrdersLoading(false) },
      ()     => { setOrdersLoading(false) }
    )

    const unsubInvoices = subscribeToCustomerInvoices(
      user.uid, customerId,
      (data) => { setInvoices(data); setInvoicesLoading(false) },
      ()     => { setInvoicesLoading(false) }
    )

    const unsubPayments = subscribeToCustomerPayments(
      user.uid, customerId,
      (data) => { setPayments(data); setPaymentsLoading(false) },
      ()     => { setPaymentsLoading(false) }
    )

    const unsubReceipts = subscribeToCustomerReceipts(
      user.uid, customerId,
      (data) => { setReceipts(data); setReceiptsLoading(false) },
      ()     => { setReceiptsLoading(false) }
    )

    return () => {
      unsubMeasurements()
      unsubOrders()
      unsubInvoices()
      unsubPayments()
      unsubReceipts()
    }
  }, [user, customerId])


  const addMeasurementOptimistic = useCallback((measurement) => {
    setMeasurements(prev => [measurement, ...prev])
  }, [])

  const saveMeasurement = useCallback(async (entry) => {
    if (!user || !customerId) return null
    if (hasReachedLimit('measurementsPerMonth', 'measurementsPerMonth')) {
      const limitError = new Error('MEASUREMENT_LIMIT_REACHED')
      limitError.code = 'limit-reached'
      throw limitError
    }
    const { id: _, ...data } = entry
    const tempId = makeTempId()
    addMeasurementOptimistic({ id: tempId, clientId: tempId, ...data })
    addMeasurementToDb(user.uid, customerId, { ...data, clientId: tempId }).catch(() => {})
    recordUsage('measurementsPerMonth').catch(() => {})
    return tempId
  }, [user, customerId, addMeasurementOptimistic, hasReachedLimit, recordUsage])

  const updateMeasurement = useCallback(async (measurementId, data) => {
    if (!user || !customerId) return
    await updateMeasurementInDb(user.uid, customerId, String(measurementId), data)
  }, [user, customerId])

  const deleteMeasurement = useCallback(async (measurement) => {
    if (!user || !customerId) return

    const id        = typeof measurement === 'object' ? measurement.id : measurement
    const publicIds = typeof measurement === 'object' ? (measurement.imgPublicIds || []) : []

    await Promise.all(
      publicIds.map(publicId => deleteFromCloudinary(publicId).catch(() => {}))
    )

    await deleteMeasurementFromDb(user.uid, customerId, String(id))
  }, [user, customerId])


  const saveOrder = useCallback(async (order) => {
    if (!user || !customerId) return
    const { id: _, ...data } = order
    return addOrderToDb(user.uid, customerId, data)
  }, [user, customerId])

  const updateOrderStatus = useCallback(async (id, status) => {
    if (!user) return
    await updateOrderStatusInDb(user.uid, String(id), status)
  }, [user])

  const deleteOrder = useCallback(async (id) => {
    if (!user) return
    await deleteOrderFromDb(user.uid, String(id))
  }, [user])


  const addInvoiceOptimistic = useCallback((invoice) => {
    setInvoices(prev => [invoice, ...prev])
  }, [])

  const saveInvoice = useCallback(async (invoice) => {
    if (!user || !customerId) return
    await addInvoiceToDb(user.uid, customerId, invoice)
  }, [user, customerId])

  const updateInvoiceStatus = useCallback(async (id, status) => {
    if (!user) return
    await updateInvoiceStatusInDb(user.uid, String(id), status)
  }, [user])

  const updateInvoiceTemplate = useCallback(async (id, templateId) => {
    if (!user) return
    await updateInvoiceInDb(user.uid, String(id), { template: templateId })
  }, [user])

  const updateInvoiceColour = useCallback(async (id, colourId, colour) => {
    if (!user) return
    await updateInvoiceInDb(user.uid, String(id), {
      'brandSnapshot.colourId': colourId,
      'brandSnapshot.colour':   colour,
    })
  }, [user])

  const deleteInvoice = useCallback(async (id) => {
    if (!user) return
    await deleteInvoiceFromDb(user.uid, String(id))
  }, [user])


  const addPaymentOptimistic = useCallback((payment) => {
    setPayments(prev => [payment, ...prev])
  }, [])

  const savePayment = useCallback(async (data) => {
    if (!user || !customerId) return null
    const tempId = makeTempId()
    addPaymentOptimistic({ id: tempId, clientId: tempId, customerId, ...data })
    fsCreatePayment(user.uid, customerId, { ...data, clientId: tempId }).catch(() => {})
    return tempId
  }, [user, customerId, addPaymentOptimistic])

  const updatePayment = useCallback(async (paymentId, data) => {
    if (!user) return
    await fsUpdatePayment(user.uid, paymentId, data)
  }, [user])

  const deletePayment = useCallback(async (paymentId) => {
    if (!user) return
    await fsDeletePayment(user.uid, paymentId)
  }, [user])


  const addReceiptOptimistic = useCallback((receipt) => {
    setReceipts(prev => [receipt, ...prev])
  }, [])

  const saveReceipt = useCallback(async (data) => {
    if (!user || !customerId) return
    return fsAddReceipt(user.uid, customerId, data)
  }, [user, customerId])

  const updateReceiptTemplate = useCallback(async (id, templateId) => {
    if (!user) return
    await fsUpdateReceipt(user.uid, String(id), { template: templateId })
  }, [user])

  const updateReceiptColour = useCallback(async (id, colourId, colour) => {
    if (!user) return
    await fsUpdateReceipt(user.uid, String(id), {
      'brandSnapshot.colourId': colourId,
      'brandSnapshot.colour':   colour,
    })
  }, [user])

  const deleteReceipt = useCallback(async (receiptId) => {
    if (!user || !customerId) return
    await fsDeleteReceipt(user.uid, receiptId)
  }, [user, customerId])


  return {
    measurements,  measurementsLoading,
    orders,        ordersLoading,
    invoices,      invoicesLoading,
    payments,      paymentsLoading,
    receipts,      receiptsLoading,

    addMeasurementOptimistic,
    saveMeasurement,
    updateMeasurement,
    deleteMeasurement,

    saveOrder,
    updateOrderStatus,
    deleteOrder,

    addInvoiceOptimistic,
    saveInvoice,
    updateInvoiceStatus,
    updateInvoiceTemplate,
    updateInvoiceColour,
    deleteInvoice,

    addPaymentOptimistic,
    savePayment,
    updatePayment,
    deletePayment,

    addReceiptOptimistic,
    saveReceipt,
    updateReceiptTemplate,
    updateReceiptColour,
    deleteReceipt,
  }
}
