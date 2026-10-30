const TOKEN_KEY = 'prem-access-token'
const EXPIRES_AT_KEY = 'prem-access-token-expires-at'

/*
 * The backend issues a short-lived bearer token in the response body and does
 * not support an HttpOnly cookie session. The token is therefore persisted in
 * localStorage so a refresh keeps the user signed in.
 *
 * Trade-off: localStorage is readable by JavaScript, so any XSS on this origin
 * could steal the token. A production deployment should move the token to an
 * HttpOnly, Secure, SameSite cookie issued by the backend. The token is kept
 * short-lived (15 minutes by default) and cleared on a 401.
 */
export function saveSession(accessToken, expiresAt) {
  try {
    window.localStorage.setItem(TOKEN_KEY, accessToken)
    if (expiresAt) {
      window.localStorage.setItem(EXPIRES_AT_KEY, String(expiresAt))
    } else {
      window.localStorage.removeItem(EXPIRES_AT_KEY)
    }
    return true
  } catch {
    return false
  }
}

export function getAccessToken() {
  if (typeof window === 'undefined') return null

  try {
    const token = window.localStorage.getItem(TOKEN_KEY)
    if (!token) return null

    const expiresAt = window.localStorage.getItem(EXPIRES_AT_KEY)
    if (expiresAt && Date.parse(expiresAt) <= Date.now()) {
      clearSession()
      return null
    }

    return token
  } catch {
    return null
  }
}

export function getSessionExpiry() {
  if (typeof window === 'undefined') return null

  try {
    return window.localStorage.getItem(EXPIRES_AT_KEY)
  } catch {
    return null
  }
}

export function clearSession() {
  try {
    window.localStorage.removeItem(TOKEN_KEY)
    window.localStorage.removeItem(EXPIRES_AT_KEY)
  } catch {
    /* Storage can be unavailable; the in-memory state is still cleared. */
  }
}
