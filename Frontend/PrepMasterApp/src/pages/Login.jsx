import { useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, BookOpenCheck, Flame, ShieldCheck } from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import './Auth.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function safeRedirect(value) {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')
    ? value
    : '/dashboard'
}

export default function Login() {
  const { login, notice, clearNotice } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)

  const target = safeRedirect(location.state?.from)

  const validate = () => {
    const next = {}
    const cleanEmail = email.trim()

    if (!cleanEmail) next.email = 'Email is required.'
    else if (!EMAIL_PATTERN.test(cleanEmail)) next.email = 'Enter a valid email address.'
    if (!password) next.password = 'Password is required.'

    return next
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submittingRef.current) return

    setFormError('')
    const nextErrors = validate()
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      document.getElementById(nextErrors.email ? 'login-email' : 'login-password')?.focus()
      return
    }

    submittingRef.current = true
    setSubmitting(true)
    setErrors({})
    clearNotice()

    try {
      await login({ email: email.trim(), password })
      navigate(target, { replace: true })
    } catch (error) {
      if (error.fieldErrors && Object.keys(error.fieldErrors).length) {
        setErrors(error.fieldErrors)
      }
      setFormError(error.message || 'Sign in failed. Please try again.')
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <aside className="auth-aside" aria-label="PrepMaster">
          <div className="auth-brand">
            <span className="auth-brand-mark" aria-hidden="true">P</span>
            <span className="auth-brand-name">PrepMaster</span>
          </div>
          <div className="auth-aside-copy">
            <p className="auth-eyebrow">Your preparation workspace</p>
            <h2>Practice deliberately. Track it honestly.</h2>
            <p>
              Daily plans, DSA practice, learning tracks and progress are stored
              in your account, not in this browser.
            </p>
          </div>
          <ul className="auth-benefits">
            <li><BookOpenCheck size={16} aria-hidden="true" /> Backend-generated daily plans</li>
            <li><Flame size={16} aria-hidden="true" /> XP, levels and streaks calculated by the server</li>
            <li><ShieldCheck size={16} aria-hidden="true" /> JWT-protected account data</li>
          </ul>
        </aside>

        <main className="auth-panel">
          <div className="auth-panel-head">
            <p className="auth-eyebrow">Welcome back</p>
            <h1>Sign in to PrepMaster</h1>
            <p>Use the account you registered with.</p>
          </div>

          {notice && (
            <p className="auth-notice" role="status">{notice}</p>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setFormError('')
                  if (errors.email) setErrors((current) => ({ ...current, email: undefined }))
                }}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'login-email-error' : undefined}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="auth-field-error" id="login-email-error" role="alert">{errors.email}</p>
              )}
            </div>

            <div className="auth-field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setFormError('')
                  if (errors.password) setErrors((current) => ({ ...current, password: undefined }))
                }}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'login-password-error' : undefined}
                placeholder="Your password"
              />
              {errors.password && (
                <p className="auth-field-error" id="login-password-error" role="alert">{errors.password}</p>
              )}
            </div>

            {formError && (
              <p className="auth-form-error" role="alert">{formError}</p>
            )}

            <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
              {!submitting && <ArrowRight size={16} aria-hidden="true" />}
            </button>
          </form>

          <p className="auth-switch">
            New to PrepMaster? <Link to="/register">Create an account</Link>
          </p>
        </main>
      </div>
    </div>
  )
}
