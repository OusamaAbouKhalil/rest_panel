import { useEffect, useRef, useState } from 'react'
import {
  addDoc, collection, deleteDoc, doc, onSnapshot, setDoc, updateDoc,
} from 'firebase/firestore'
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage'
import { ImagePlus, LoaderCircle, Plus, Trash2, X } from 'lucide-react'
import { db, storage } from '../lib/firebase'
import { useToast } from '../hooks/useToast'
import { money } from '../lib/format'

function MapEditor({ label, hint, entries, setEntries }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label className="text-sm font-semibold">{label}</label>
        <span className="text-xs text-zinc-400">{hint}</span>
      </div>
      <div className="flex flex-col gap-2">
        {entries.map((row, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={row.name}
              onChange={(e) => setEntries(entries.map((r, j) => (j === i ? { ...r, name: e.target.value } : r)))}
              placeholder="Name (e.g. Large)"
              className="min-w-0 flex-[2] rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-800"
            />
            <input
              type="number"
              step="0.01"
              min="0"
              value={row.price}
              onChange={(e) => setEntries(entries.map((r, j) => (j === i ? { ...r, price: e.target.value } : r)))}
              placeholder="+$"
              className="min-w-0 flex-1 rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-800"
            />
            <button
              type="button"
              onClick={() => setEntries(entries.filter((_, j) => j !== i))}
              className="rounded-xl p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setEntries([...entries, { name: '', price: '' }])}
          className="flex items-center gap-1.5 self-start rounded-xl px-2 py-1 text-xs font-bold text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950/40"
        >
          <Plus size={14} /> Add {label.toLowerCase().replace(/s$/, '')}
        </button>
      </div>
    </div>
  )
}

function mapToEntries(m) {
  if (!m || typeof m !== 'object') return []
  return Object.entries(m).map(([name, price]) => ({ name, price: String(price) }))
}

function entriesToMap(entries) {
  const out = {}
  entries.forEach(({ name, price }) => {
    const n = name.trim()
    if (!n) return
    out[n] = parseFloat(price) || 0
  })
  return out
}

export default function ItemEditor({ restId, item, categories, onClose }) {
  const toast = useToast()
  const isNew = !item
  const [name, setName] = useState(item?.item_name || '')
  const [price, setPrice] = useState(item?.item_price != null ? String(item.item_price) : '')
  const [category, setCategory] = useState(item?.item_category || '')
  const [description, setDescription] = useState(item?.item_description || '')
  const [discount, setDiscount] = useState(item?.item_discount != null ? String(item.item_discount) : '0')
  const [available, setAvailable] = useState(item ? item.available !== false : true)
  const [sizes, setSizes] = useState(mapToEntries(item?.sizes))
  const [combos, setCombos] = useState(mapToEntries(item?.combo))
  const [imageUrl, setImageUrl] = useState(item?.item_image || '')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [busy, setBusy] = useState(false)
  const fileInput = useRef(null)

  // Addons live in a subcollection — only for saved items
  const [addons, setAddons] = useState(null)
  const [newAddonName, setNewAddonName] = useState('')
  const [newAddonPrice, setNewAddonPrice] = useState('')

  useEffect(() => {
    if (isNew) return
    const unsub = onSnapshot(
      collection(db, 'restaurants', restId, 'menu_items', item.id, 'addons'),
      (snap) => setAddons(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    )
    return unsub
  }, [restId, item?.id, isNew])

  const pickImage = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setImageFile(f)
    setImagePreview(URL.createObjectURL(f))
  }

  const addAddon = async () => {
    const n = newAddonName.trim()
    if (!n) return
    try {
      await addDoc(collection(db, 'restaurants', restId, 'menu_items', item.id, 'addons'), {
        addon_name: n,
        addon_price: parseFloat(newAddonPrice) || 0,
      })
      setNewAddonName('')
      setNewAddonPrice('')
    } catch (e) {
      toast(`Failed: ${e.message}`, 'error')
    }
  }

  const removeAddon = async (a) => {
    try {
      await deleteDoc(doc(db, 'restaurants', restId, 'menu_items', item.id, 'addons', a.id))
    } catch (e) {
      toast(`Failed: ${e.message}`, 'error')
    }
  }

  const save = async () => {
    if (!name.trim() || !price || !category.trim()) {
      toast('Name, price and category are required', 'error')
      return
    }
    setBusy(true)
    try {
      let finalImage = imageUrl
      if (imageFile) {
        const ext = imageFile.name.split('.').pop() || 'png'
        const ref = storageRef(storage, `images/${Date.now()}.${ext}`)
        const snap = await uploadBytes(ref, imageFile)
        finalImage = await getDownloadURL(snap.ref)
      }
      const data = {
        item_name: name.trim(),
        item_price: parseFloat(price),
        item_category: category.trim(),
        item_description: description.trim(),
        item_discount: parseFloat(discount) || 0,
        available,
        item_image: finalImage,
        sizes: entriesToMap(sizes),
        combo: entriesToMap(combos),
      }
      if (isNew) {
        const docRef = await addDoc(collection(db, 'restaurants', restId, 'menu_items'), data)
        // The customer app reads item_id from the document body
        await setDoc(docRef, { item_id: docRef.id }, { merge: true })
        toast(`"${data.item_name}" added to your menu`)
      } else {
        await updateDoc(doc(db, 'restaurants', restId, 'menu_items', item.id), data)
        toast(`"${data.item_name}" updated`)
      }
      onClose()
    } catch (e) {
      toast(`Failed to save: ${e.message}`, 'error')
      setBusy(false)
    }
  }

  const shownImage = imagePreview || imageUrl

  return (
    <div className="fixed inset-0 z-[85] flex justify-end bg-black/50" onClick={onClose}>
      <div
        className="animate-slide-up flex h-full w-full max-w-lg flex-col bg-zinc-50 shadow-2xl dark:bg-zinc-950"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-bold">{isNew ? 'Add menu item' : `Edit "${item.item_name}"`}</h2>
          <button onClick={onClose} className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex flex-col gap-4">
            {/* Image */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-dashed border-zinc-300 bg-white hover:border-brand-500 dark:border-zinc-700 dark:bg-zinc-900"
              >
                {shownImage ? (
                  <img src={shownImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ImagePlus size={24} className="mx-auto text-zinc-400" />
                )}
              </button>
              <div className="text-sm text-zinc-500">
                <p className="font-semibold text-zinc-700 dark:text-zinc-200">Item photo</p>
                <p>Tap to {shownImage ? 'replace' : 'upload'}. Square photos look best.</p>
              </div>
              <input ref={fileInput} type="file" accept="image/*" onChange={pickImage} className="hidden" />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">Name *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chicken Shawarma Wrap"
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-semibold">Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="9.99"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold">Discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
            </div>

            {parseFloat(discount) > 0 && parseFloat(price) > 0 && (
              <p className="rounded-xl bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
                Customers will pay {money(parseFloat(price) - (parseFloat(price) * parseFloat(discount)) / 100)} instead of {money(parseFloat(price))}
              </p>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-semibold">Category *</label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                list="menu-categories"
                placeholder="e.g. Wraps"
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-zinc-700 dark:bg-zinc-900"
              />
              <datalist id="menu-categories">
                {categories.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Short description shown to customers"
                className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
              <input
                type="checkbox"
                checked={available}
                onChange={(e) => setAvailable(e.target.checked)}
                className="h-4 w-4 accent-brand-600"
              />
              <span className="text-sm font-semibold">Available for ordering</span>
            </label>

            <MapEditor
              label="Sizes"
              hint="extra cost on top of base price, 0 = base"
              entries={sizes}
              setEntries={setSizes}
            />
            <MapEditor
              label="Combos"
              hint="optional combo upgrades with their price"
              entries={combos}
              setEntries={setCombos}
            />

            {/* Addons */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Addons</label>
              {isNew ? (
                <p className="rounded-xl bg-zinc-100 px-3 py-2.5 text-xs text-zinc-500 dark:bg-zinc-800/70">
                  Save the item first, then reopen it to add addons.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {(addons || []).map((a) => (
                    <div key={a.id} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 dark:bg-zinc-900">
                      <span className="flex-1 text-sm font-medium">{a.addon_name}</span>
                      <span className="text-sm text-zinc-500">+{money(a.addon_price)}</span>
                      <button
                        onClick={() => removeAddon(a)}
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      value={newAddonName}
                      onChange={(e) => setNewAddonName(e.target.value)}
                      placeholder="Addon name (e.g. Extra cheese)"
                      className="min-w-0 flex-[2] rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-900"
                    />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newAddonPrice}
                      onChange={(e) => setNewAddonPrice(e.target.value)}
                      placeholder="+$"
                      className="min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-900"
                    />
                    <button
                      onClick={addAddon}
                      className="rounded-xl bg-brand-600 px-3 text-white hover:bg-brand-700"
                      title="Add addon"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 border-t border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-zinc-300 py-3 text-sm font-bold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={busy}
            className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700 disabled:opacity-60"
          >
            {busy && <LoaderCircle size={16} className="animate-spin" />}
            {busy ? 'Saving…' : isNew ? 'Add item' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
