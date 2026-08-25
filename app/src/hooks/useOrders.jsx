import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from './useAuth'
import { tsToDate } from '../lib/format'

const OrdersContext = createContext(null)

// One realtime subscription for the whole app (dashboard, history, analytics)
export function OrdersProvider({ children }) {
  const { restId } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [newOrderIds, setNewOrderIds] = useState([])
  const knownIds = useRef(null) // null = first snapshot not yet processed
  const listeners = useRef([])

  useEffect(() => {
    if (!restId) return
    knownIds.current = null
    setLoading(true)
    const q = query(collection(db, 'orders'), where('restaurant_id', '==', restId))
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      docs.sort((a, b) => (tsToDate(b.time)?.getTime() || 0) - (tsToDate(a.time)?.getTime() || 0))
      setOrders(docs)
      setLoading(false)

      if (knownIds.current === null) {
        // First snapshot: seed known set, never alert for existing orders
        knownIds.current = new Set(docs.map((d) => d.id))
        return
      }
      const fresh = docs.filter(
        (d) => !knownIds.current.has(d.id) && (d.status || '').toLowerCase() === 'pending'
      )
      docs.forEach((d) => knownIds.current.add(d.id))
      if (fresh.length > 0) {
        setNewOrderIds(fresh.map((d) => d.id))
        listeners.current.forEach((fn) => fn(fresh))
      }
    }, (err) => {
      console.error('orders subscription error', err)
      setLoading(false)
    })
    return unsub
  }, [restId])

  const onNewOrders = (fn) => {
    listeners.current.push(fn)
    return () => {
      listeners.current = listeners.current.filter((f) => f !== fn)
    }
  }

  const value = useMemo(
    () => ({ orders, loading, newOrderIds, onNewOrders }),
    [orders, loading, newOrderIds]
  )
  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
}

export function useOrders() {
  return useContext(OrdersContext)
}
