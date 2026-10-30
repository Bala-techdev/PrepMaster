/* Safe localStorage access for prototype data.
   Every failure path falls back to in-memory defaults so a corrupted
   or unavailable storage never breaks the application. */

export function readJSON(key, fallback) {
  if (typeof window === 'undefined') return fallback

  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback

    const parsed = JSON.parse(raw)
    return parsed === null || parsed === undefined ? fallback : parsed
  } catch {
    return fallback
  }
}

export function writeJSON(key, value) {
  if (typeof window === 'undefined') return false

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function readString(key, fallback = '') {
  if (typeof window === 'undefined') return fallback

  try {
    const value = window.localStorage.getItem(key)
    return value === null ? fallback : value
  } catch {
    return fallback
  }
}

export function writeString(key, value) {
  if (typeof window === 'undefined') return false

  try {
    window.localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

export function removeKey(key) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.removeItem(key)
  } catch {
    /* Storage can be disabled; ignore. */
  }
}

export function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}
