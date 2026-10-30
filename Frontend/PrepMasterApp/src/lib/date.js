/* Local-time date helpers. Local keys are used everywhere so a task
   completed at 11:59 pm belongs to that calendar day, not UTC. */

export function pad(value) {
  return String(value).padStart(2, '0')
}

export function dateKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function todayKey() {
  return dateKey(new Date())
}

export function keyToDate(key) {
  const [year, month, day] = String(key).split('-').map(Number)
  if (!year || !month || !day) return new Date()
  return new Date(year, month - 1, day)
}

export function addDays(date, amount) {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

export function addDaysToKey(key, amount) {
  return dateKey(addDays(keyToDate(key), amount))
}

export function msUntilMidnight(now = new Date()) {
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  return Math.max(0, midnight.getTime() - now.getTime())
}

/* Oldest key first, ending with today (or the supplied end date). */
export function buildDateRange(days, endDate = new Date()) {
  const range = []

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    range.push(dateKey(addDays(endDate, -offset)))
  }

  return range
}

export function formatDate(value) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatRelativeTime(value) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  const diff = Date.now() - date.getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) return 'just now'
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`
  if (diff < day) return `${Math.floor(diff / hour)}h ago`
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`

  return formatDate(date)
}

export function formatClock(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${pad(minutes)}:${pad(seconds)}`
}

/* Current streak counts consecutive active days ending today or
   yesterday. The longest streak is the longest run in the log. */
export function computeStreaks(activity, today = todayKey()) {
  const active = new Set(
    Object.entries(activity || {})
      .filter(([, count]) => Number(count) > 0)
      .map(([key]) => key),
  )

  let current = 0
  let cursor = active.has(today) ? today : addDaysToKey(today, -1)

  while (active.has(cursor)) {
    current += 1
    cursor = addDaysToKey(cursor, -1)
  }

  let longest = 0
  let run = 0
  let previous = null

  for (const key of [...active].sort()) {
    run = previous && addDaysToKey(previous, 1) === key ? run + 1 : 1
    longest = Math.max(longest, run)
    previous = key
  }

  return { current, longest }
}

export function isValidDateKey(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}
