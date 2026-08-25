import { useMemo, useState } from 'react'
import { CalendarClock, ChefHat, CheckCircle2, DollarSign, Inbox, Truck } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useOrders } from '../hooks/useOrders'
import { useToast } from '../hooks/useToast'
import { money, formatTimeShort, timeAgo, tsToDate, formatTime } from '../lib/format'
import { setOrderStatus } from '../lib/orderActions'
import StatusBadge from '../components/StatusBadge'
import OrderDrawer from '../components/OrderDrawer'

function StatCard({ icon: Icon, label, value, tone }) {
  const tones = {
    green: 'bg-brand-100 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
    cyan: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400',
    sky: 'bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-xs font-medium text-zinc-500">{label}</p>
        <p className="text-xl font-extrabold">{value}</p>
      </div>
    </div>
  )
}

function OrderCard({ order, newOrderIds, onOpen, onQuickAction, busyId }) {
  const status = (order.status || '').toLowerCase()
  const busy = busyId === order.id
  const isNew = newOrderIds?.includes(order.id) && status === 'pending'
  return (
    <div
      onClick={() => onOpen(order)}
      className={`cursor-pointer rounded-2xl border bg-white p-4 transition hover:shadow-md dark:bg-zinc-900 ${
        isNew ? 'border-brand-400 pulse-new' : 'border-zinc-200 dark:border-zinc-800'
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="font-bold">#{order.order_id || order.id}</p>
        <StatusBadge status={order.status} />
      </div>
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="text-zinc-500">{timeAgo(order.time)} · {order.payment_method}</span>
        <span className="font-extrabold text-brand-600 dark:text-brand-400">{money(order.total)}</span>
      </div>
      {order.is_scheduled && status === 'scheduled' && (
        <p className="mb-3 flex items-center gap-1.5 rounded-lg bg-violet-50 px-2 py-1.5 text-xs font-semibold text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
          <CalendarClock size={14} /> Scheduled for {formatTime(order.scheduled_for)}
        </p>
      )}
      {order.recipient_name && (
        <p className="mb-3 truncate text-sm text-zinc-600 dark:text-zinc-300">{order.recipient_name} — {order.user_address}</p>
      )}
      {status === 'pending' && (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            disabled={busy}
            onClick={() => onQuickAction(order, 'rejected')}
            className="flex-1 rounded-xl border border-red-200 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:hover:bg-red-950/40"
          >
            Reject
          </button>
          <button
            disabled={busy}
            onClick={() => onQuickAction(order, 'accepted')}
            className="flex-[2] rounded-xl bg-brand-600 py-2 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {busy ? 'Working…' : 'Accept'}
          </button>
        </div>
      )}
      {status === 'accepted' && (
        <div onClick={(e) => e.stopPropagation()}>
          <button
            disabled={busy}
            onClick={() => onQuickAction(order, 'preparing')}
            className="w-full rounded-xl bg-cyan-600 py-2 text-xs font-bold text-white hover:bg-cyan-700 disabled:opacity-50"
          >
            {busy ? 'Working…' : 'Start Preparing'}
          </button>
        </div>
      )}
    </div>
  )
}

function Lane({ title, icon: Icon, orders, emptyText, ...cardProps }) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-zinc-500">
        <Icon size={16} /> {title}
        <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          {orders.length}
        </span>
      </h2>
      {orders.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-300 py-6 text-center text-sm text-zinc-400 dark:border-zinc-700">
          {emptyText}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {orders.map((o) => <OrderCard key={o.id} order={o} {...cardProps} />)}
        </div>
      )}
    </section>
  )
}

export default function Dashboard() {
  const { restaurant } = useAuth()
  const { orders, loading, newOrderIds } = useOrders()
  const toast = useToast()
  const [selected, setSelected] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const today = useMemo(() => {
    const start = new Date(); start.setHours(0, 0, 0, 0)
    return orders.filter((o) => (tsToDate(o.time)?.getTime() || 0) >= start.getTime())
  }, [orders])

  const by = (s) => orders.filter((o) => (o.status || '').toLowerCase() === s)
  const pending = by('pending')
  const scheduled = by('scheduled')
  const accepted = by('accepted')
  const preparing = by('preparing')
  const onTheWay = by('on the way')

  const todayRevenue = today
    .filter((o) => !['cancelled', 'rejected'].includes((o.status || '').toLowerCase()))
    .reduce((s, o) => s + (parseFloat(o.total) || 0), 0)
  const todayCompleted = today.filter((o) => (o.status || '').toLowerCase() === 'completed').length

  const quickAction = async (order, status) => {
    setBusyId(order.id)
    try {
      await setOrderStatus(order, status, restaurant?.rest_name)
      toast(
        status === 'accepted' ? `Order #${order.order_id || order.id} accepted` :
        status === 'rejected' ? `Order #${order.order_id || order.id} rejected` :
        `Order #${order.order_id || order.id} is now ${status}`,
        status === 'rejected' ? 'info' : 'success'
      )
    } catch (e) {
      toast(`Failed: ${e.message}`, 'error')
    }
    setBusyId(null)
  }

  // Live drawer data: keep the selected order fresh from the stream
  const selectedLive = selected ? orders.find((o) => o.id === selected.id) || selected : null

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  const cardProps = {
    onOpen: setSelected,
    onQuickAction: quickAction,
    busyId,
    newOrderIds,
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={DollarSign} label="Today's revenue" value={money(todayRevenue)} tone="green" />
        <StatCard icon={Inbox} label="Today's orders" value={today.length} tone="sky" />
        <StatCard icon={ChefHat} label="In kitchen now" value={accepted.length + preparing.length} tone="cyan" />
        <StatCard icon={CheckCircle2} label="Completed today" value={todayCompleted} tone="amber" />
      </div>

      <div className="flex flex-col gap-8">
        <Lane
          title="Needs your attention"
          icon={Inbox}
          orders={pending}
          emptyText="No pending orders — you're all caught up 🎉"
          {...cardProps}
        />
        {scheduled.length > 0 && (
          <Lane title="Scheduled orders" icon={CalendarClock} orders={scheduled} emptyText="" {...cardProps} />
        )}
        <Lane
          title="In the kitchen"
          icon={ChefHat}
          orders={[...accepted, ...preparing]}
          emptyText="Nothing cooking right now"
          {...cardProps}
        />
        {onTheWay.length > 0 && (
          <Lane title="Out for delivery" icon={Truck} orders={onTheWay} emptyText="" {...cardProps} />
        )}
      </div>

      <OrderDrawer order={selectedLive} onClose={() => setSelected(null)} />
    </div>
  )
}
