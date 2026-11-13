const TOKEN_KEY = 'prem-access-token'
const EXPIRES_AT_KEY = 'prem-access-token-expires-at'
const REFRESH_TOKEN_KEY = 'prem-refresh-token'
const REFRESH_EXPIRES_AT_KEY = 'prem-refresh-token-expires-at'

/*
 * The backend issues a short-lived bearer token plus a rotated refresh token.
 * Both are persisted for compatibility with the existing browser-session
 * architecture; production deployments should move them to secure cookies.
 *
 * Trade-off: localStorage is readable by JavaScript, so any XSS on this origin
 * could steal the token. A production deployment should move the token to an
 * HttpOnly, Secure, SameSite cookie issued by the backend. The token is kept
 * short-lived (15 minutes by default) and cleared on a 401.
 */
export function saveSession(accessToken, expiresAt, refreshToken, refreshExpiresAt) {
  try {
    window.localStorage.setItem(TOKEN_KEY, accessToken)
    if (expiresAt) {
      window.localStorage.setItem(EXPIRES_AT_KEY, String(expiresAt))
    } else {
      window.localStorage.removeItem(EXPIRES_AT_KEY)
    }
    if (refreshToken) window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    if (refreshExpiresAt) window.localStorage.setItem(REFRESH_EXPIRES_AT_KEY, String(refreshExpiresAt))
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

export function getRefreshToken() {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(REFRESH_TOKEN_KEY)
  } catch {
    return null
  }
}

export function clearSession() {
  try {
    window.localStorage.removeItem(TOKEN_KEY)
    window.localStorage.removeItem(EXPIRES_AT_KEY)
    window.localStorage.removeItem(REFRESH_TOKEN_KEY)
    window.localStorage.removeItem(REFRESH_EXPIRES_AT_KEY)
  } catch {
    /* Storage can be unavailable; the in-memory state is still cleared. */
  }
}
