import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, BookOpenCheck, Flame, ShieldCheck } from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import './Auth.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setFormError('')
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }))
    }
  }

  const validate = () => {
    const next = {}
    const name = form.displayName.trim()
    const email = form.email.trim()

    if (name.length < 2) next.displayName = 'Enter at least 2 characters for your name.'
    else if (name.length > 80) next.displayName = 'Keep your name to 80 characters or fewer.'

    if (!email) next.email = 'Email is required.'
    else if (!EMAIL_PATTERN.test(email)) next.email = 'Enter a valid email address.'

    if (form.password.length < 8) next.password = 'Use at least 8 characters.'
    else if (form.password.length > 72) next.password = 'Use 72 characters or fewer.'
    else if (!PASSWORD_PATTERN.test(form.password)) {
      next.password = 'Include an uppercase letter, a lowercase letter and a number.'
    }

    if (form.confirmPassword !== form.password) {
      next.confirmPassword = 'Passwords do not match.'
    }

    return next
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submittingRef.current) return

    setFormError('')
    const nextErrors = validate()
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      const first = Object.keys(nextErrors)[0]
      document.getElementById(`register-${first}`)?.focus()
      return
    }

    submittingRef.current = true
    setSubmitting(true)
    setErrors({})

    try {
      await register({
        displayName: form.displayName.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      navigate('/dashboard', { replace: true })
    } catch (error) {
      if (error.fieldErrors && Object.keys(error.fieldErrors).length) {
        setErrors(error.fieldErrors)
      }
      setFormError(error.message || 'Registration failed. Please try again.')
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
            <p className="auth-eyebrow">Create your account</p>
            <h2>One place for the work that compounds.</h2>
            <p>
              Register once and your plans, completed tasks, solved questions and
              progress follow your account across refreshes.
            </p>
          </div>
          <ul className="auth-benefits">
            <li><BookOpenCheck size={16} aria-hidden="true" /> Seeded DSA and system-design content</li>
            <li><Flame size={16} aria-hidden="true" /> Server-calculated XP and streaks</li>
            <li><ShieldCheck size={16} aria-hidden="true" /> Password protected with a bearer token session</li>
          </ul>
        </aside>

        <main className="auth-panel">
          <div className="auth-panel-head">
            <p className="auth-eyebrow">Get started</p>
            <h1>Create your account</h1>
            <p>Your email is never shown to other users.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label htmlFor="register-displayName">Display name</label>
              <input
                id="register-displayName"
                type="text"
                autoComplete="name"
                maxLength={80}
                value={form.displayName}
                onChange={(event) => updateField('displayName', event.target.value)}
                aria-invalid={Boolean(errors.displayName)}
                aria-describedby={errors.displayName ? 'register-displayName-error' : undefined}
                placeholder="How should we address you?"
              />
              {errors.displayName && (
                <p className="auth-field-error" id="register-displayName-error" role="alert">{errors.displayName}</p>
              )}
            </div>

            <div className="auth-field">
              <label htmlFor="register-email">Email</label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'register-email-error' : undefined}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="auth-field-error" id="register-email-error" role="alert">{errors.email}</p>
              )}
            </div>

            <div className="auth-field">
              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(event) => updateField('password', event.target.value)}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'register-password-error' : 'register-password-hint'}
                placeholder="At least 8 characters"
              />
              {errors.password ? (
                <p className="auth-field-error" id="register-password-error" role="alert">{errors.password}</p>
              ) : (
                <p className="auth-field-hint" id="register-password-hint">
                  8–72 characters with upper-case, lower-case and numeric characters.
                </p>
              )}
            </div>

            <div className="auth-field">
              <label htmlFor="register-confirmPassword">Confirm password</label>
              <input
                id="register-confirmPassword"
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(event) => updateField('confirmPassword', event.target.value)}
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={errors.confirmPassword ? 'register-confirmPassword-error' : undefined}
                placeholder="Repeat your password"
              />
              {errors.confirmPassword && (
                <p className="auth-field-error" id="register-confirmPassword-error" role="alert">{errors.confirmPassword}</p>
              )}
            </div>

            {formError && <p className="auth-form-error" role="alert">{formError}</p>}

            <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
              {submitting ? 'Creating account…' : 'Create account'}
              {!submitting && <ArrowRight size={16} aria-hidden="true" />}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </main>
      </div>
    </div>
  )
}
