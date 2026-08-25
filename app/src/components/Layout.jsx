import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { doc, updateDoc } from 'firebase/firestore'
import {
  LayoutDashboard, ReceiptText, UtensilsCrossed, BarChart3, Settings as SettingsIcon,
  LogOut, Moon, Sun, Volume2, VolumeX, Store,
} from 'lucide-react'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import { useOrders } from '../hooks/useOrders'
import { useNewOrderAlerts } from '../hooks/useNewOrderAlerts'
import { useToast } from '../hooks/useToast'
import ConfirmDialog from './ConfirmDialog'

const NAV = [
  { to: '/', label: 'Live Orders', icon: LayoutDashboard },
  { to: '/orders', label: 'History', icon: ReceiptText },
  { to: '/menu', label: 'Menu', icon: UtensilsCrossed },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

function useTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('rp-theme', next ? 'dark' : 'light')
  }
  return { dark, toggle }
}

export default function Layout() {
  const { restaurant, restId, logout } = useAuth()
  const { orders } = useOrders()
  const { soundEnabled, toggleSound } = useNewOrderAlerts()
  const { dark, toggle: toggleTheme } = useTheme()
  const toast = useToast()
  const [confirmLogout, setConfirmLogout] = useState(false)

  const pendingCount = orders.filter((o) => (o.status || '').toLowerCase() === 'pending').length
  const isClosed = restaurant?.isClosed === true

  const toggleOpen = async () => {
    try {
      await updateDoc(doc(db, 'restaurants', restId), { isClosed: !isClosed })
      toast(!isClosed ? 'Restaurant is now closed to new orders' : 'Restaurant is now open', 'info')
    } catch (e) {
      toast(`Could not update: ${e.message}`, 'error')
    }
  }

  const navItem = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-brand-600 text-white shadow-sm'
        : 'text-zinc-600 hover:bg-zinc-200/70 dark:text-zinc-300 dark:hover:bg-zinc-800'
    }`

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6 flex items-center gap-3 px-1">
          {restaurant?.main_image ? (
            <img src={restaurant.main_image} alt="" className="h-10 w-10 rounded-xl object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Store size={20} />
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{restaurant?.rest_name || 'Restaurant'}</p>
            <p className="text-xs text-zinc-500">SwiftGo Panel</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className={navItem}>
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {to === '/' && pendingCount > 0 && (
                <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
                  {pendingCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-1">
          <button
            onClick={() => setConfirmLogout(true)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 hover:bg-red-50 hover:text-red-600 dark:text-zinc-300 dark:hover:bg-red-950/40 dark:hover:text-red-400"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex items-center gap-2 border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 md:hidden">
            {restaurant?.main_image ? (
              <img src={restaurant.main_image} alt="" className="h-8 w-8 rounded-lg object-cover" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                <Store size={16} />
              </div>
            )}
            <p className="max-w-[40vw] truncate text-sm font-bold">{restaurant?.rest_name || ''}</p>
          </div>

          {/* Open / closed switch */}
          <button
            onClick={toggleOpen}
            className={`ml-auto flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
              isClosed
                ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                : 'bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300'
            }`}
            title="Toggle whether customers can order right now"
          >
            <span className={`h-2 w-2 rounded-full ${isClosed ? 'bg-red-500' : 'bg-brand-500 pulse-new'}`} />
            {isClosed ? 'Closed' : 'Open'}
          </button>

          <button
            onClick={toggleSound}
            className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title={soundEnabled ? 'Mute new-order sound' : 'Enable new-order sound'}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button
            onClick={toggleTheme}
            className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="Toggle theme"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setConfirmLogout(true)}
            className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 md:hidden dark:hover:bg-zinc-800"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-4 py-5 pb-24 md:px-6 md:pb-6">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-zinc-200 bg-white/95 backdrop-blur md:hidden dark:border-zinc-800 dark:bg-zinc-900/95">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium ${
                  isActive ? 'text-brand-600 dark:text-brand-400' : 'text-zinc-500'
                }`
              }
            >
              <Icon size={20} />
              {label}
              {to === '/' && pendingCount > 0 && (
                <span className="absolute right-1/2 top-1 translate-x-4 rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white">
                  {pendingCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <ConfirmDialog
        open={confirmLogout}
        title="Logout"
        message="Are you sure you want to log out?"
        confirmLabel="Logout"
        danger
        onCancel={() => setConfirmLogout(false)}
        onConfirm={() => { setConfirmLogout(false); logout() }}
      />
    </div>
  )
}
