import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveSession } from '../api/tokenStorage'

export default function OAuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const values = new URLSearchParams(window.location.hash.slice(1))
    const accessToken = values.get('accessToken')
    const refreshToken = values.get('refreshToken')
    const expiresAt = values.get('expiresAt')
    if (accessToken && refreshToken) {
      saveSession(accessToken, expiresAt, refreshToken)
      window.location.replace('/dashboard')
      return
    }
    navigate('/login', { replace: true, state: { message: 'Google sign-in could not be completed.' } })
  }, [navigate])

  return <div className="session-loader">Completing Google sign-in…</div>
}
