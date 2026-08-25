export function money(v) {
  const n = typeof v === 'number' ? v : parseFloat(v)
  if (isNaN(n)) return '$0.00'
  return `$${n.toFixed(2)}`
}

export function tsToDate(ts) {
  if (!ts) return null
  if (typeof ts.toDate === 'function') return ts.toDate()
  if (ts instanceof Date) return ts
  return null
}

export function formatTime(ts) {
  const d = tsToDate(ts)
  if (!d) return '—'
  return d.toLocaleString('en-GB', {
    day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit',
  })
}

export function formatTimeShort(ts) {
  const d = tsToDate(ts)
  if (!d) return '—'
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  if (sameDay) return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

export function timeAgo(ts) {
  const d = tsToDate(ts)
  if (!d) return ''
  const s = Math.floor((Date.now() - d.getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

// Cart items store addons/combo as array OR the literal string "No addons selected."
export function optionList(v) {
  if (Array.isArray(v)) return v
  if (typeof v === 'string' && v && !v.startsWith('No ')) return [v]
  return []
}

export const STATUS_ORDER = ['pending', 'scheduled', 'accepted', 'preparing', 'on the way', 'completed', 'cancelled', 'rejected']

export function statusColor(status) {
  switch ((status || '').toLowerCase()) {
    case 'pending': return 'amber'
    case 'scheduled': return 'violet'
    case 'accepted': return 'sky'
    case 'preparing': return 'cyan'
    case 'on the way': return 'teal'
    case 'completed': return 'green'
    case 'cancelled': return 'red'
    case 'rejected': return 'rose'
    default: return 'zinc'
  }
}
