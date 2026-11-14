import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../api/authService'
import './Auth.css'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await forgotPassword(email.trim())
      setMessage(response.message)
    } catch (requestError) {
      setError(requestError.message || 'Unable to request a password reset.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <main className="auth-panel auth-standalone">
        <div className="auth-panel-head">
          <p className="auth-eyebrow">SecureAuth Core</p>
          <h1>Forgot your password?</h1>
          <p>Enter your account email and we will send recovery instructions.</p>
        </div>
        <form className="auth-form" onSubmit={submit} noValidate>
          <div className="auth-field">
            <label htmlFor="forgot-email">Email</label>
            <input id="forgot-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          {message && <p className="auth-notice" role="status">{message}</p>}
          {error && <p className="auth-form-error" role="alert">{error}</p>}
          <button className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Sending…' : 'Send recovery email'}
          </button>
        </form>
        <p className="auth-switch"><Link to="/login">Back to sign in</Link></p>
      </main>
    </div>
  )
}
