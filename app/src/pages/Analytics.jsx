import { useEffect, useMemo, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DollarSign, Receipt, TrendingUp } from 'lucide-react'
import { db } from '../lib/firebase'
import { useOrders } from '../hooks/useOrders'
import { money, tsToDate, STATUS_ORDER } from '../lib/format'
import StatusBadge from '../components/StatusBadge'

const RANGES = [
  { key: 7, label: '7 days' },
  { key: 14, label: '14 days' },
  { key: 30, label: '30 days' },
  { key: 90, label: '90 days' },
]

const BRAND = '#16a34a'

// Cache items lookups across page visits (session-lived)
const itemsCache = new Map()

function Tile({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-1 flex items-center gap-2 text-xs font-medium text-zinc-500">
        <Icon size={14} /> {label}
      </div>
      <p className="text-2xl font-extrabold">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-zinc-400">{sub}</p>}
    </div>
  )
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
      <p className="font-bold">{label}</p>
      <p className="text-zinc-500">
        Revenue <span className="font-bold text-zinc-900 dark:text-zinc-100">{money(payload[0]?.value)}</span>
      </p>
      <p className="text-zinc-500">
        Orders <span className="font-bold text-zinc-900 dark:text-zinc-100">{payload[0]?.payload?.count}</span>
      </p>
    </div>
  )
}

export default function Analytics() {
  const { orders } = useOrders()
  const [days, setDays] = useState(14)
  const [topItems, setTopItems] = useState(null)

  const rangeOrders = useMemo(() => {
    const start = new Date()
    start.setDate(start.getDate() - days)
    start.setHours(0, 0, 0, 0)
    return orders.filter((o) => (tsToDate(o.time)?.getTime() || 0) >= start.getTime())
  }, [orders, days])

  const soldOrders = useMemo(
    () => rangeOrders.filter((o) => !['cancelled', 'rejected'].includes((o.status || '').toLowerCase())),
    [rangeOrders]
  )

  const revenue = soldOrders.reduce((s, o) => s + (parseFloat(o.total) || 0), 0)
  const avg = soldOrders.length ? revenue / soldOrders.length : 0

  // Revenue per day series
  const series = useMemo(() => {
    const buckets = new Map()
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
      buckets.set(key, { day: key, revenue: 0, count: 0 })
    }
    soldOrders.forEach((o) => {
      const d = tsToDate(o.time)
      if (!d) return
      const key = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
      const b = buckets.get(key)
      if (b) {
        b.revenue += parseFloat(o.total) || 0
        b.count += 1
      }
    })
    return [...buckets.values()].map((b) => ({ ...b, revenue: Math.round(b.revenue * 100) / 100 }))
  }, [soldOrders, days])

  const statusCounts = useMemo(() => {
    const counts = {}
    rangeOrders.forEach((o) => {
      const s = (o.status || 'unknown').toLowerCase()
      counts[s] = (counts[s] || 0) + 1
    })
    return STATUS_ORDER.filter((s) => counts[s]).map((s) => ({ status: s, count: counts[s] }))
  }, [rangeOrders])
  const maxStatus = Math.max(1, ...statusCounts.map((s) => s.count))

  // Top items: read items subcollections of the most recent orders (capped to limit reads)
  useEffect(() => {
    let cancelled = false
    async function load() {
      setTopItems(null)
      const sample = soldOrders.slice(0, 40)
      const tally = new Map()
      for (const o of sample) {
        let items = itemsCache.get(o.id)
        if (!items) {
          try {
            const snap = await getDocs(collection(db, 'orders', o.id, 'items'))
            items = snap.docs.map((d) => d.data())
            itemsCache.set(o.id, items)
          } catch {
            items = []
          }
        }
        if (cancelled) return
        items.forEach((it) => {
          if (!it.item_name) return
          const cur = tally.get(it.item_name) || { name: it.item_name, qty: 0, revenue: 0 }
          cur.qty += parseInt(it.quantity) || 1
          cur.revenue += parseFloat(it.total) || 0
          tally.set(it.item_name, cur)
        })
      }
      if (!cancelled) {
        setTopItems([...tally.values()].sort((a, b) => b.qty - a.qty).slice(0, 8))
      }
    }
    load()
    return () => { cancelled = true }
  }, [soldOrders])

  const maxItemQty = Math.max(1, ...(topItems || []).map((t) => t.qty))

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-extrabold">Analytics</h1>
        <div className="ml-auto flex gap-2">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setDays(r.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                days === r.key
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Tile icon={DollarSign} label={`Revenue · last ${days} days`} value={money(revenue)} sub="excludes cancelled & rejected" />
        <Tile icon={Receipt} label="Orders" value={soldOrders.length} sub={`${rangeOrders.length} total incl. cancelled/rejected`} />
        <Tile icon={TrendingUp} label="Average order" value={money(avg)} />
      </div>

      {/* Revenue over time */}
      <section className="mb-5 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-sm font-bold text-zinc-500">Daily revenue</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BRAND} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={BRAND} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeDasharray="0" />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'currentColor' }}
                className="text-zinc-400"
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={44}
                tick={{ fontSize: 11, fill: 'currentColor' }}
                className="text-zinc-400"
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: BRAND, strokeOpacity: 0.3 }} />
              <Area type="monotone" dataKey="revenue" stroke={BRAND} strokeWidth={2} fill="url(#rev)" dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Status breakdown */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-sm font-bold text-zinc-500">Orders by status</h2>
          {statusCounts.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-400">No orders in this period</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {statusCounts.map(({ status, count }) => (
                <div key={status} className="flex items-center gap-3">
                  <div className="w-24 shrink-0"><StatusBadge status={status} /></div>
                  <div className="h-4 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-brand-500/80"
                      style={{ width: `${(count / maxStatus) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm font-bold">{count}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Top items */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-1 text-sm font-bold text-zinc-500">Top sellers</h2>
          <p className="mb-4 text-xs text-zinc-400">Based on your {Math.min(soldOrders.length, 40)} most recent orders</p>
          {topItems === null ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
            </div>
          ) : topItems.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-400">No item data yet</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {topItems.map((t) => (
                <div key={t.name} className="flex items-center gap-3">
                  <span className="w-36 shrink-0 truncate text-sm font-medium" title={t.name}>{t.name}</span>
                  <div className="h-4 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-brand-500/80"
                      style={{ width: `${(t.qty / maxItemQty) * 100}%` }}
                    />
                  </div>
                  <span className="w-14 shrink-0 text-right text-xs text-zinc-500">×{t.qty}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
