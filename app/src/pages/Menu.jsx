import { useEffect, useMemo, useState } from 'react'
import { collection, deleteDoc, doc, onSnapshot, updateDoc, writeBatch } from 'firebase/firestore'
import { BadgePercent, ImageOff, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { money } from '../lib/format'
import ItemEditor from '../components/ItemEditor'
import ConfirmDialog from '../components/ConfirmDialog'

function discountedPrice(item) {
  const price = parseFloat(item.item_price) || 0
  const disc = parseFloat(item.item_discount) || 0
  return disc > 0 ? price - (price * disc) / 100 : price
}

export default function Menu() {
  const { restId } = useAuth()
  const toast = useToast()
  const [items, setItems] = useState(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [editing, setEditing] = useState(null) // item object, or 'new'
  const [deleting, setDeleting] = useState(null)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkValue, setBulkValue] = useState('')

  useEffect(() => {
    if (!restId) return
    const unsub = onSnapshot(collection(db, 'restaurants', restId, 'menu_items'), (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [restId])

  const categories = useMemo(() => {
    const set = new Set((items || []).map((i) => i.item_category).filter(Boolean))
    return [...set].sort()
  }, [items])

  const filtered = useMemo(() => {
    let list = items || []
    if (category !== 'all') list = list.filter((i) => i.item_category === category)
    const q = search.trim().toLowerCase()
    if (q) list = list.filter((i) => (i.item_name || '').toLowerCase().includes(q))
    return [...list].sort((a, b) => (a.item_name || '').localeCompare(b.item_name || ''))
  }, [items, category, search])

  const grouped = useMemo(() => {
    const map = new Map()
    filtered.forEach((i) => {
      const c = i.item_category || 'Uncategorized'
      if (!map.has(c)) map.set(c, [])
      map.get(c).push(i)
    })
    return [...map.entries()]
  }, [filtered])

  const toggleAvailable = async (item) => {
    try {
      await updateDoc(doc(db, 'restaurants', restId, 'menu_items', item.id), {
        available: !(item.available !== false),
      })
    } catch (e) {
      toast(`Failed: ${e.message}`, 'error')
    }
  }

  const applyBulkDiscount = async () => {
    const value = parseFloat(bulkValue)
    if (isNaN(value) || value < 0 || value > 100) {
      toast('Enter a discount between 0 and 100', 'error')
      return
    }
    try {
      // Batched writes instead of the old one-update-per-doc loop
      const all = items || []
      for (let i = 0; i < all.length; i += 400) {
        const batch = writeBatch(db)
        all.slice(i, i + 400).forEach((it) => {
          batch.update(doc(db, 'restaurants', restId, 'menu_items', it.id), { item_discount: value })
        })
        await batch.commit()
      }
      toast(value === 0 ? 'Discounts removed from all items' : `${value}% discount applied to all ${all.length} items`)
      setBulkOpen(false)
      setBulkValue('')
    } catch (e) {
      toast(`Failed: ${e.message}`, 'error')
    }
  }

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, 'restaurants', restId, 'menu_items', deleting.id))
      toast(`"${deleting.item_name}" deleted`, 'info')
    } catch (e) {
      toast(`Failed: ${e.message}`, 'error')
    }
    setDeleting(null)
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-extrabold">Menu</h1>
        {items && (
          <span className="text-sm text-zinc-500">{items.length} items · {categories.length} categories</span>
        )}
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setBulkOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <BadgePercent size={16} /> Bulk discount
          </button>
          <button
            onClick={() => setEditing('new')}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-3 py-2 text-sm font-bold text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700"
          >
            <Plus size={16} /> Add item
          </button>
        </div>
      </div>

      {/* Search + categories */}
      <div className="mb-4 flex flex-col gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items…"
            className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize transition ${
                category === c
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
              }`}
            >
              {c === 'all' ? 'All' : c}
            </button>
          ))}
        </div>
      </div>

      {items === null ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        </div>
      ) : grouped.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-300 py-14 text-center text-sm text-zinc-400 dark:border-zinc-700">
          {items.length === 0 ? 'Your menu is empty — add your first item!' : 'No items match your search.'}
        </p>
      ) : (
        <div className="flex flex-col gap-7">
          {grouped.map(([cat, list]) => (
            <section key={cat}>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-500">{cat}</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((item) => {
                  const available = item.available !== false
                  const disc = parseFloat(item.item_discount) || 0
                  return (
                    <div
                      key={item.id}
                      className={`flex gap-3 rounded-2xl border border-zinc-200 bg-white p-3 transition dark:border-zinc-800 dark:bg-zinc-900 ${
                        available ? '' : 'opacity-60'
                      }`}
                    >
                      {item.item_image ? (
                        <img src={item.item_image} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                      ) : (
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
                          <ImageOff size={22} />
                        </div>
                      )}
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate font-bold">{item.item_name}</p>
                          {disc > 0 && (
                            <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600 dark:bg-red-950/60 dark:text-red-400">
                              −{disc}%
                            </span>
                          )}
                        </div>
                        <p className="text-sm">
                          <span className="font-extrabold text-brand-600 dark:text-brand-400">{money(discountedPrice(item))}</span>
                          {disc > 0 && (
                            <span className="ml-1.5 text-xs text-zinc-400 line-through">{money(item.item_price)}</span>
                          )}
                        </p>
                        <div className="mt-auto flex items-center gap-1 pt-2">
                          {/* Availability switch */}
                          <button
                            onClick={() => toggleAvailable(item)}
                            className={`relative h-6 w-11 rounded-full transition-colors ${
                              available ? 'bg-brand-500' : 'bg-zinc-300 dark:bg-zinc-700'
                            }`}
                            title={available ? 'Mark unavailable' : 'Mark available'}
                          >
                            <span
                              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                                available ? 'left-[22px]' : 'left-0.5'
                              }`}
                            />
                          </button>
                          <span className="text-xs font-medium text-zinc-500">
                            {available ? 'Available' : 'Sold out'}
                          </span>
                          <button
                            onClick={() => setEditing(item)}
                            className="ml-auto rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-brand-600 dark:hover:bg-zinc-800"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setDeleting(item)}
                            className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {editing && (
        <ItemEditor
          restId={restId}
          item={editing === 'new' ? null : editing}
          categories={categories}
          onClose={() => setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        title="Delete item?"
        message={`"${deleting?.item_name}" will be permanently removed from your menu.`}
        confirmLabel="Delete"
        danger
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />

      {/* Bulk discount dialog */}
      {bulkOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4" onClick={() => setBulkOpen(false)}>
          <div
            className="animate-slide-up w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-1 text-lg font-bold">Bulk discount</h3>
            <p className="mb-4 text-sm text-zinc-500">
              Applies to every item on your menu. Set 0 to remove all discounts.
            </p>
            <div className="relative mb-5">
              <input
                type="number"
                min="0"
                max="100"
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                placeholder="e.g. 15"
                className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 pr-10 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-zinc-700 dark:bg-zinc-800"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">%</span>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setBulkOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={applyBulkDiscount}
                className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700"
              >
                Apply to all items
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
