import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { login as loginRequest, register as registerRequest } from '../api/authService'
import { SESSION_EXPIRED_EVENT } from '../api/client'
import { getMe } from '../api/userService'
import {
  clearSession,
  getAccessToken,
  getSessionExpiry,
  saveSession,
} from '../api/tokenStorage'
import { AuthContext } from './useAuth'

const EXPIRED_MESSAGE = 'Your session has expired. Please sign in again.'

export function AuthProvider({ children }) {
  const [status, setStatus] = useState('loading')
  const [user, setUser] = useState(null)
  const [notice, setNotice] = useState('')
  const expiryTimer = useRef(null)

  const clearExpiryTimer = useCallback(() => {
    if (expiryTimer.current) {
      window.clearTimeout(expiryTimer.current)
      expiryTimer.current = null
    }
  }, [])

  const expireSession = useCallback(
    (message = EXPIRED_MESSAGE) => {
      clearExpiryTimer()
      clearSession()
      setUser(null)
      setStatus('anonymous')
      setNotice(message)
    },
    [clearExpiryTimer],
  )

  const scheduleExpiry = useCallback(
    (expiresAt) => {
      clearExpiryTimer()
      const timestamp = Date.parse(expiresAt)
      if (!Number.isFinite(timestamp)) return

      const delay = timestamp - Date.now()
      if (delay <= 0) {
        expireSession()
        return
      }

      expiryTimer.current = window.setTimeout(() => {
        expireSession()
      }, delay)
    },
    [clearExpiryTimer, expireSession],
  )

  /* Restore a session from storage on first load. The token is validated with
     /users/me before any protected route is allowed to render. */
  useEffect(() => {
    let active = true
    const storedExpiry = getSessionExpiry()
    const token = getAccessToken()

    if (!token) {
      if (storedExpiry && Date.parse(storedExpiry) <= Date.now()) {
        setNotice(EXPIRED_MESSAGE)
      }
      setStatus('anonymous')
      return undefined
    }

    if (Date.parse(storedExpiry) <= Date.now()) {
      expireSession()
      return undefined
    }

    getMe()
      .then((account) => {
        if (!active) return
        setUser(account)
        setStatus('authenticated')
        scheduleExpiry(storedExpiry)
      })
      .catch((error) => {
        if (!active) return

        if (error.status === 401) {
          expireSession()
          return
        }

        /* The token may still be valid; keep the session and let the data
           layer show a retryable connection error instead of forcing the user
           through a login that cannot succeed while the API is unreachable. */
        setUser(null)
        setStatus('authenticated')
        setNotice('Your account could not be refreshed. Check the API connection and retry.')
        scheduleExpiry(storedExpiry)
      })

    return () => {
      active = false
    }
  }, [expireSession, scheduleExpiry])

  /* A 401 from any Axios call clears the session centrally. */
  useEffect(() => {
    const handleExpired = (event) => {
      expireSession(event.detail?.message || EXPIRED_MESSAGE)
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired)
  }, [expireSession])

  useEffect(() => () => clearExpiryTimer(), [clearExpiryTimer])

  const establishSession = useCallback(
    async (response) => {
      saveSession(response.accessToken, response.expiresAt)
      scheduleExpiry(response.expiresAt)
      setUser(response.user)
      setStatus('authenticated')
      setNotice('')

      try {
        const account = await getMe()
        setUser(account)
        return account
      } catch (error) {
        if (error.status === 401) {
          expireSession()
          throw error
        }
        /* The login itself succeeded; the data provider will retry /users/me. */
        return response.user
      }
    },
    [expireSession, scheduleExpiry],
  )

  const login = useCallback(
    async (credentials) => {
      const response = await loginRequest(credentials)
      return establishSession(response)
    },
    [establishSession],
  )

  const register = useCallback(
    async (payload) => {
      const response = await registerRequest(payload)
      return establishSession(response)
    },
    [establishSession],
  )

  const logout = useCallback(() => {
    clearExpiryTimer()
    clearSession()
    setUser(null)
    setStatus('anonymous')
    setNotice('')
  }, [clearExpiryTimer])

  const clearNotice = useCallback(() => setNotice(''), [])

  const value = useMemo(
    () => ({
      status,
      user,
      notice,
      isAuthenticated: status === 'authenticated',
      login,
      register,
      logout,
      clearNotice,
    }),
    [clearNotice, login, logout, notice, register, status, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
