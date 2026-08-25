import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useOrders } from '../hooks/useOrders'
import { money, formatTime, tsToDate, STATUS_ORDER } from '../lib/format'
import StatusBadge from '../components/StatusBadge'
import OrderDrawer from '../components/OrderDrawer'

const PAGE_SIZE = 25

const RANGES = [
  { key: 'all', label: 'All time' },
  { key: 'today', label: 'Today' },
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
]

export default function Orders() {
  const { orders, loading } = useOrders()
  const [statusFilter, setStatusFilter] = useState('all')
  const [range, setRange] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => {
    let list = orders
    if (statusFilter !== 'all') {
      list = list.filter((o) => (o.status || '').toLowerCase() === statusFilter)
    }
    if (range !== 'all') {
      const start = new Date()
      if (range === 'today') start.setHours(0, 0, 0, 0)
      if (range === '7d') start.setDate(start.getDate() - 7)
      if (range === '30d') start.setDate(start.getDate() - 30)
      list = list.filter((o) => (tsToDate(o.time)?.getTime() || 0) >= start.getTime())
    }
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (o) =>
          (o.order_id || o.id).toLowerCase().includes(q) ||
          (o.recipient_name || '').toLowerCase().includes(q) ||
          (o.user_address || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [orders, statusFilter, range, search])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const pageItems = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

  const totalValue = filtered
    .filter((o) => !['cancelled', 'rejected'].includes((o.status || '').toLowerCase()))
    .reduce((s, o) => s + (parseFloat(o.total) || 0), 0)

  const selectedLive = selected ? orders.find((o) => o.id === selected.id) || selected : null

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-extrabold">Order History</h1>
        <span className="ml-auto rounded-full bg-brand-100 px-3 py-1 text-sm font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
          {filtered.length} orders · {money(totalValue)}
        </span>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            placeholder="Search by order #, customer name or address…"
            className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {['all', ...STATUS_ORDER].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(0) }}
              className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize transition ${
                statusFilter === s
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
              }`}
            >
              {s}
            </button>
          ))}
          <span className="mx-1 hidden h-5 w-px bg-zinc-300 sm:block dark:bg-zinc-700" />
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => { setRange(r.key); setPage(0) }}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                range === r.key
                  ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900'
                  : 'bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table (desktop) / cards (mobile) */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        </div>
      ) : pageItems.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-300 py-14 text-center text-sm text-zinc-400 dark:border-zinc-700">
          No orders match these filters.
        </p>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-zinc-200 md:block dark:border-zinc-800">
            <table className="w-full bg-white text-sm dark:bg-zinc-900">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs font-bold uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => setSelected(o)}
                    className="cursor-pointer border-b border-zinc-100 last:border-0 hover:bg-brand-50/60 dark:border-zinc-800/60 dark:hover:bg-zinc-800/60"
                  >
                    <td className="px-4 py-3 font-bold">#{o.order_id || o.id}</td>
                    <td className="px-4 py-3 text-zinc-500">{formatTime(o.time)}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3">{o.payment_method || '—'}</td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-zinc-500">
                      {o.recipient_name || o.user_address || '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold">{money(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 md:hidden">
            {pageItems.map((o) => (
              <div
                key={o.id}
                onClick={() => setSelected(o)}
                className="cursor-pointer rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="mb-1 flex items-center justify-between">
                  <p className="font-bold">#{o.order_id || o.id}</p>
                  <StatusBadge status={o.status} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">{formatTime(o.time)} · {o.payment_method}</span>
                  <span className="font-extrabold">{money(o.total)}</span>
                </div>
              </div>
            ))}
          </div>

          {pageCount > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                disabled={safePage === 0}
                onClick={() => setPage(safePage - 1)}
                className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-zinc-600 disabled:opacity-40 dark:bg-zinc-900 dark:text-zinc-300"
              >
                Previous
              </button>
              <span className="text-sm text-zinc-500">Page {safePage + 1} of {pageCount}</span>
              <button
                disabled={safePage >= pageCount - 1}
                onClick={() => setPage(safePage + 1)}
                className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-zinc-600 disabled:opacity-40 dark:bg-zinc-900 dark:text-zinc-300"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <OrderDrawer order={selectedLive} onClose={() => setSelected(null)} />
    </div>
  )
}
