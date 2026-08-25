import { statusColor } from '../lib/format'

const COLOR_CLASSES = {
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
  violet: 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-400',
  sky: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400',
  cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-400',
  teal: 'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400',
  green: 'bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300',
  red: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400',
  rose: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400',
  zinc: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
}

export default function StatusBadge({ status }) {
  const c = COLOR_CLASSES[statusColor(status)]
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold capitalize ${c}`}>
      {status || 'unknown'}
    </span>
  )
}
