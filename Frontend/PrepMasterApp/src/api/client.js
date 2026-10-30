import axios from 'axios'
import { clearSession, getAccessToken } from './tokenStorage'

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

export const SESSION_EXPIRED_EVENT = 'prem:session-expired'

export class ApiError extends Error {
  constructor(message, { status = 0, title = '', fieldErrors = {}, isNetworkError = false } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.title = title
    this.fieldErrors = fieldErrors
    this.isNetworkError = isNetworkError
  }
}

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { Accept: 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = normalizeApiError(error)
    const url = error.config?.url || ''
    const isAuthAttempt =
      url.includes('/auth/login') || url.includes('/auth/register')

    if (normalized.status === 401 && !isAuthAttempt) {
      clearSession()
      window.dispatchEvent(
        new CustomEvent(SESSION_EXPIRED_EVENT, {
          detail: {
            message: 'Your session has expired. Please sign in again.',
          },
        }),
      )
    }

    return Promise.reject(normalized)
  },
)

export function normalizeApiError(error) {
  if (error instanceof ApiError) return error

  if (!error.response) {
    const isTimeout = error.code === 'ECONNABORTED'
    return new ApiError(
      isTimeout
        ? 'The server took too long to respond. Please try again.'
        : 'Cannot reach the PrepMaster API. Check that the backend is running.',
      { isNetworkError: true },
    )
  }

  const { status, data } = error.response
  const detail = data?.detail
  const title = data?.title || ''
  const fieldErrors = data?.errors && typeof data.errors === 'object' ? data.errors : {}

  let message = detail || title
  if (!message) {
    if (status === 401) message = 'Invalid email or password.'
    else if (status === 403) message = 'You do not have permission to perform this action.'
    else if (status === 404) message = 'The requested resource was not found.'
    else if (status >= 500) message = 'The server could not complete the request. Please try again.'
    else message = `The request failed (HTTP ${status}).`
  }
  if (status === 403 && !detail) {
    message = 'You do not have permission to perform this action.'
  }

  return new ApiError(message, { status, title, fieldErrors })
}

export default client
