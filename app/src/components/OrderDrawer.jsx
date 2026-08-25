import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import {
  X, MapPin, CreditCard, Clock, User, Building2, Hash, Ticket, Zap, CalendarClock, LoaderCircle,
} from 'lucide-react'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { money, formatTime, optionList } from '../lib/format'
import { setOrderStatus } from '../lib/orderActions'
import StatusBadge from './StatusBadge'
import ConfirmDialog from './ConfirmDialog'

function InfoRow({ icon: Icon, label, value }) {
  if (value === undefined || value === null || value === '') return null
  return (
    <div className="flex items-start gap-3 py-1.5">
      <Icon size={16} className="mt-0.5 shrink-0 text-zinc-400" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="break-words text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

export default function OrderDrawer({ order, onClose }) {
  const { restaurant } = useAuth()
  const toast = useToast()
  const [items, setItems] = useState(null)
  const [busy, setBusy] = useState(false)
  const [confirmReject, setConfirmReject] = useState(false)

  useEffect(() => {
    if (!order) return
    setItems(null)
    const unsub = onSnapshot(collection(db, 'orders', order.id, 'items'), (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [order?.id])

  if (!order) return null

  const status = (order.status || '').toLowerCase()

  const changeStatus = async (next) => {
    setBusy(true)
    try {
      await setOrderStatus(order, next, restaurant?.rest_name)
      toast(
        next === 'accepted' ? 'Order accepted — customer notified' :
        next === 'rejected' ? 'Order rejected' :
        `Order marked as ${next}`,
        next === 'rejected' ? 'info' : 'success'
      )
    } catch (e) {
      toast(`Failed: ${e.message}`, 'error')
    }
    setBusy(false)
  }

  const itemsTotal = (items || []).reduce((s, it) => s + (parseFloat(it.total) || 0), 0)

  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-black/50" onClick={onClose}>
      <div
        className="animate-slide-up flex h-full w-full max-w-lg flex-col bg-zinc-50 shadow-2xl dark:bg-zinc-950"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold">Order #{order.order_id || order.id}</p>
            <p className="text-xs text-zinc-500">{formatTime(order.time)}</p>
          </div>
          <StatusBadge status={order.status} />
          <button onClick={onClose} className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {/* Customer & delivery */}
          <section className="mb-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-2 text-sm font-bold text-zinc-500">Delivery</h3>
            <InfoRow icon={User} label="Recipient" value={order.recipient_name} />
            <InfoRow icon={MapPin} label="Address" value={order.user_address} />
            <InfoRow
              icon={Building2}
              label="Floor / Unit"
              value={[order.floor_num, order.unit_num].filter(Boolean).join(' / ') || null}
            />
            <InfoRow icon={CreditCard} label="Payment" value={order.payment_method} />
            {order.is_scheduled && (
              <InfoRow icon={CalendarClock} label="Scheduled for" value={formatTime(order.scheduled_for)} />
            )}
            {order.priority_delivery && <InfoRow icon={Zap} label="Priority" value="Priority delivery order" />}
            {order.promo_code && (
              <InfoRow icon={Ticket} label="Promo code" value={`${order.promo_code} (−${money(order.promo_code_discount)})`} />
            )}
          </section>

          {/* Items */}
          <section className="mb-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-3 text-sm font-bold text-zinc-500">Items</h3>
            {items === null ? (
              <div className="flex justify-center py-6">
                <LoaderCircle className="animate-spin text-brand-500" />
              </div>
            ) : items.length === 0 ? (
              <p className="py-4 text-center text-sm text-zinc-500">No items found</p>
            ) : (
              <div className="flex flex-col gap-3">
                {items.map((it) => {
                  const addons = optionList(it.addons)
                  const combos = optionList(it.combo)
                  const size = typeof it.size === 'string' && !it.size.startsWith('No ') ? it.size : null
                  const prefs = typeof it.prefernces === 'string' && !it.prefernces.startsWith('No ') ? it.prefernces : null
                  const instructions =
                    typeof it.instructions === 'string' && !it.instructions.startsWith('No instructions')
                      ? it.instructions : null
                  return (
                    <div key={it.id} className="flex gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
                      {it.item_image && (
                        <img src={it.item_image} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="font-semibold">
                            {it.item_name}
                            <span className="ml-1.5 text-sm font-bold text-brand-600 dark:text-brand-400">×{it.quantity}</span>
                          </p>
                          <p className="shrink-0 text-sm font-bold">{money(it.total)}</p>
                        </div>
                        {size && <p className="text-xs text-zinc-500">Size: <span className="font-medium text-zinc-700 dark:text-zinc-300">{size}</span></p>}
                        {addons.length > 0 && (
                          <p className="text-xs text-zinc-500">Addons: <span className="font-medium text-zinc-700 dark:text-zinc-300">{addons.join(', ')}</span></p>
                        )}
                        {combos.length > 0 && (
                          <p className="text-xs text-zinc-500">Combo: <span className="font-medium text-zinc-700 dark:text-zinc-300">{combos.join(', ')}</span></p>
                        )}
                        {prefs && <p className="text-xs text-zinc-500">Preferences: <span className="font-medium text-zinc-700 dark:text-zinc-300">{prefs}</span></p>}
                        {instructions && (
                          <p className="mt-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                            “{instructions}”
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Totals */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-2 text-sm font-bold text-zinc-500">Summary</h3>
            <div className="flex justify-between py-1 text-sm">
              <span className="text-zinc-500">Items subtotal</span>
              <span className="font-medium">{money(itemsTotal)}</span>
            </div>
            <div className="flex justify-between py-1 text-sm">
              <span className="text-zinc-500">Delivery fee (customer pays)</span>
              <span className="font-medium">{money(order.delivery_fee)}</span>
            </div>
            {order.service_fee > 0 && (
              <div className="flex justify-between py-1 text-sm">
                <span className="text-zinc-500">Service fee</span>
                <span className="font-medium">{money(order.service_fee)}</span>
              </div>
            )}
            <div className="mt-2 flex justify-between border-t border-zinc-200 pt-2 dark:border-zinc-700">
              <span className="font-bold">Order total</span>
              <span className="text-lg font-extrabold text-brand-600 dark:text-brand-400">{money(order.total)}</span>
            </div>
          </section>
        </div>

        {/* Action bar */}
        {(status === 'pending' || status === 'accepted') && (
          <div className="flex gap-3 border-t border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            {status === 'pending' && (
              <>
                <button
                  disabled={busy}
                  onClick={() => setConfirmReject(true)}
                  className="flex-1 rounded-xl border-2 border-red-200 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:hover:bg-red-950/40"
                >
                  Reject
                </button>
                <button
                  disabled={busy}
                  onClick={() => changeStatus('accepted')}
                  className="flex-[2] rounded-xl bg-brand-600 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700 disabled:opacity-50"
                >
                  {busy ? 'Working…' : 'Accept Order'}
                </button>
              </>
            )}
            {status === 'accepted' && (
              <button
                disabled={busy}
                onClick={() => changeStatus('preparing')}
                className="flex-1 rounded-xl bg-cyan-600 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-600/25 transition hover:bg-cyan-700 disabled:opacity-50"
              >
                {busy ? 'Working…' : 'Start Preparing'}
              </button>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmReject}
        title="Reject order?"
        message="The customer will be notified that you can't take this order. This can't be undone."
        confirmLabel="Reject order"
        danger
        onCancel={() => setConfirmReject(false)}
        onConfirm={() => { setConfirmReject(false); changeStatus('rejected') }}
      />
    </div>
  )
}
