import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../api/authService'
import './Auth.css'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const [token, setToken] = useState(params.get('token') || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    try {
      const response = await resetPassword({ token, password, confirmPassword })
      setMessage(response.message)
    } catch (requestError) {
      setError(requestError.message || 'Unable to reset your password.')
    }
  }

  return (
    <div className="auth-page">
      <main className="auth-panel auth-standalone">
        <div className="auth-panel-head">
          <p className="auth-eyebrow">SecureAuth Core</p>
          <h1>Reset password</h1>
          <p>Use the secure token from your recovery email.</p>
        </div>
        <form className="auth-form" onSubmit={submit}>
          <div className="auth-field"><label htmlFor="reset-token">Recovery token</label><input id="reset-token" required value={token} onChange={(event) => setToken(event.target.value)} /></div>
          <div className="auth-field"><label htmlFor="reset-password">New password</label><input id="reset-password" type="password" autoComplete="new-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></div>
          <div className="auth-field"><label htmlFor="reset-confirm">Confirm password</label><input id="reset-confirm" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></div>
          {message && <p className="auth-notice" role="status">{message}</p>}
          {error && <p className="auth-form-error" role="alert">{error}</p>}
          <button className="btn btn-primary auth-submit">Reset password</button>
        </form>
        <p className="auth-switch"><Link to="/login">Back to sign in</Link></p>
      </main>
    </div>
  )
}
