import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { verifyEmail } from '../api/authService'
import './Auth.css'

export default function VerifyEmail() {
  const [params] = useSearchParams()
  const [token, setToken] = useState(params.get('token') || '')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    try {
      const response = await verifyEmail(token)
      setMessage(response.message)
    } catch (requestError) {
      setError(requestError.message || 'Verification failed or the token expired.')
    }
  }

  return (
    <div className="auth-page">
      <main className="auth-panel auth-standalone">
        <div className="auth-panel-head"><p className="auth-eyebrow">SecureAuth Core</p><h1>Verify your email</h1><p>Paste the verification token from your email.</p></div>
        <form className="auth-form" onSubmit={submit}>
          <div className="auth-field"><label htmlFor="verification-token">Verification token</label><input id="verification-token" required value={token} onChange={(event) => setToken(event.target.value)} /></div>
          {message && <p className="auth-notice" role="status">{message}</p>}
          {error && <p className="auth-form-error" role="alert">{error}</p>}
          <button className="btn btn-primary auth-submit">Verify email</button>
        </form>
        <p className="auth-switch"><Link to="/login">Back to sign in</Link></p>
      </main>
    </div>
  )
}
