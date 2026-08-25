import { useEffect, useRef, useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage'
import { ImagePlus, LoaderCircle } from 'lucide-react'
import { db, storage } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

function ImageField({ label, hint, url, preview, onPick, wide }) {
  const input = useRef(null)
  const shown = preview || url
  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold">{label}</p>
      <button
        type="button"
        onClick={() => input.current?.click()}
        className={`relative overflow-hidden rounded-2xl border-2 border-dashed border-zinc-300 bg-white hover:border-brand-500 dark:border-zinc-700 dark:bg-zinc-900 ${
          wide ? 'h-32 w-full' : 'h-28 w-28'
        }`}
      >
        {shown ? (
          <img src={shown} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full flex-col items-center justify-center gap-1 text-zinc-400">
            <ImagePlus size={22} />
            <span className="text-xs">Upload</span>
          </span>
        )}
      </button>
      <p className="mt-1 text-xs text-zinc-400">{hint}</p>
      <input ref={input} type="file" accept="image/*" onChange={onPick} className="hidden" />
    </div>
  )
}

export default function Settings() {
  const { restaurant, restId, user } = useAuth()
  const toast = useToast()
  const [name, setName] = useState('')
  const [isClosed, setIsClosed] = useState(false)
  const [mainFile, setMainFile] = useState(null)
  const [bgFile, setBgFile] = useState(null)
  const [mainPreview, setMainPreview] = useState(null)
  const [bgPreview, setBgPreview] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!restaurant) return
    setName(restaurant.rest_name || '')
    setIsClosed(restaurant.isClosed === true)
  }, [restaurant?.id])

  const pick = (setFile, setPreview) => (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const upload = async (file) => {
    const ext = file.name.split('.').pop() || 'png'
    const ref = storageRef(storage, `images/${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`)
    const snap = await uploadBytes(ref, file)
    return getDownloadURL(snap.ref)
  }

  const save = async () => {
    if (!name.trim()) {
      toast('Restaurant name cannot be empty', 'error')
      return
    }
    setBusy(true)
    try {
      const updates = {
        rest_name: name.trim(),
        isClosed,
      }
      if (mainFile) updates.main_image = await upload(mainFile)
      if (bgFile) updates.bg_image = await upload(bgFile)
      await updateDoc(doc(db, 'restaurants', restId), updates)
      setMainFile(null)
      setBgFile(null)
      toast('Restaurant details updated')
    } catch (e) {
      toast(`Failed to save: ${e.message}`, 'error')
    }
    setBusy(false)
  }

  if (!restaurant) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-5 text-xl font-extrabold">Settings</h1>

      <div className="flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <label className="mb-1.5 block text-sm font-semibold">Restaurant name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-zinc-700 dark:bg-zinc-800"
          />
        </div>

        <div className="flex flex-wrap gap-5">
          <ImageField
            label="Logo"
            hint="Shown next to your name in the app"
            url={restaurant.main_image}
            preview={mainPreview}
            onPick={pick(setMainFile, setMainPreview)}
          />
          <div className="flex-1 min-w-[200px]">
            <ImageField
              label="Cover photo"
              hint="Banner at the top of your restaurant page"
              url={restaurant.bg_image}
              preview={bgPreview}
              onPick={pick(setBgFile, setBgPreview)}
              wide
            />
          </div>
        </div>

        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-zinc-200 px-4 py-3.5 dark:border-zinc-700">
          <div>
            <p className="text-sm font-semibold">Temporarily closed</p>
            <p className="text-xs text-zinc-500">Customers won't be able to place new orders while closed</p>
          </div>
          <button
            type="button"
            onClick={() => setIsClosed((v) => !v)}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
              isClosed ? 'bg-red-500' : 'bg-zinc-300 dark:bg-zinc-700'
            }`}
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
                isClosed ? 'left-[22px]' : 'left-0.5'
              }`}
            />
          </button>
        </label>

        <button
          onClick={save}
          disabled={busy}
          className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700 disabled:opacity-60"
        >
          {busy && <LoaderCircle size={16} className="animate-spin" />}
          {busy ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      <div className="mt-5 rounded-2xl border border-zinc-200 bg-white p-5 text-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-3 font-bold">Account</h2>
        <div className="flex justify-between py-1.5">
          <span className="text-zinc-500">Signed in as</span>
          <span className="font-medium">{user?.email}</span>
        </div>
        <div className="flex justify-between py-1.5">
          <span className="text-zinc-500">Restaurant ID</span>
          <span className="font-mono text-xs">{restId}</span>
        </div>
      </div>
    </div>
  )
}
