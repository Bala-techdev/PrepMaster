import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  Info,
  Play,
  Plus,
  ShieldAlert,
  Timer,
  Trophy,
  Zap,
} from 'lucide-react'
import DifficultyBadge from '../components/DifficultyBadge'
import EmptyState from '../components/EmptyState'
import PageState from '../components/PageState'
import {
  createInterviewTemplate,
  getActiveInterviewSession,
  getInterviewCategories,
  getInterviewDifficulties,
  getInterviewPerformance,
  getInterviewTemplates,
  startInterviewSession,
} from '../api/mockInterviewService'
import { formatClock } from '../lib/date'
import { difficultyLabel, formatMinutes } from '../lib/format'
import './MockInterview.css'

const TITLE_MIN = 5
const TITLE_MAX = 160
const DEFAULT_DURATION = 45

const emptyForm = {
  title: '',
  category: 'DATA_STRUCTURES_AND_ALGORITHMS',
  difficulty: 'MEDIUM',
  durationMinutes: DEFAULT_DURATION,
}

function validateTemplate(form) {
  const errors = {}
  const title = form.title.trim()
  const duration = Number(form.durationMinutes)

  if (title.length < TITLE_MIN || title.length > TITLE_MAX) {
    errors.title = `Use a title between ${TITLE_MIN} and ${TITLE_MAX} characters.`
  }
  if (!form.category) errors.category = 'Choose an interview category.'
  if (!form.difficulty) errors.difficulty = 'Choose a difficulty.'
  if (!Number.isInteger(duration) || duration < 5 || duration > 180) {
    errors.durationMinutes = 'Choose a duration between 5 and 180 minutes.'
  }

  return errors
}

export default function MockInterviewPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [difficulties, setDifficulties] = useState([])
  const [templates, setTemplates] = useState([])
  const [activeSession, setActiveSession] = useState(null)
  const [performance, setPerformance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [focusConsent, setFocusConsent] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')
  const [creating, setCreating] = useState(false)
  const [startingId, setStartingId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [categoryOptions, difficultyOptions, templateRows, active, stats] =
        await Promise.all([
          getInterviewCategories(),
          getInterviewDifficulties(),
          getInterviewTemplates(),
          getActiveInterviewSession(),
          getInterviewPerformance(),
        ])

      setCategories(categoryOptions || [])
      setDifficulties(difficultyOptions || [])
      setTemplates(templateRows || [])
      setActiveSession(active || null)
      setPerformance(stats || null)
    } catch (loadError) {
      setError(loadError)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const categoryById = useMemo(
    () => new Map(categories.map((item) => [item.code, item])),
    [categories],
  )

  const startSession = useCallback(
    async (template) => {
      if (activeSession) {
        navigate(`/mock-interview/sessions/${activeSession.id}`)
        return
      }

      setActionError('')
      setNotice('')
      setStartingId(template.id)

      try {
        const session = await startInterviewSession({
          templateId: template.id,
          focusMonitoringConsent: focusConsent,
        })
        navigate(`/mock-interview/sessions/${session.id}`)
      } catch (startError) {
        setActionError(
          startError.message ||
            'The interview session could not be started. Please try again.',
        )
        if (startError.status === 409) {
          load().catch(() => {})
        }
      } finally {
        setStartingId(null)
      }
    },
    [activeSession, focusConsent, load, navigate],
  )

  const updateForm = (patch) => {
    setForm((current) => ({ ...current, ...patch }))
    setNotice('')
    setActionError('')
  }

  const createTemplate = async (event, startAfterCreate = false) => {
    event.preventDefault()
    if (creating) return

    const nextErrors = validateTemplate(form)
    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors)
      setActionError('')
      return
    }

    setCreating(true)
    setFieldErrors({})
    setActionError('')
    setNotice('')

    try {
      const template = await createInterviewTemplate({
        title: form.title.trim(),
        description: `${categoryById.get(form.category)?.label || form.category} · ${difficultyLabel(form.difficulty)} · ${formatMinutes(Number(form.durationMinutes))}`,
        category: form.category,
        difficulty: form.difficulty,
        durationMinutes: Number(form.durationMinutes),
      })

      setTemplates((current) => [template, ...current])
      setForm((current) => ({ ...current, title: '' }))

      if (startAfterCreate) {
        await startSession(template)
      } else {
        setNotice('Template saved. Choose Start when you are ready.')
      }
    } catch (requestError) {
      if (
        requestError.fieldErrors &&
        Object.keys(requestError.fieldErrors).length
      ) {
        setFieldErrors(requestError.fieldErrors)
      }
      setActionError(
        requestError.message ||
          'The interview template could not be saved. Please try again.',
      )
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <section className="mock-interview-page">
        <div className="page-container mock-interview-container">
          <PageState
            variant="loading"
            title="Loading interview practice"
            description="Fetching templates, categories and your latest results."
          />
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mock-interview-page">
        <div className="page-container mock-interview-container">
          <PageState
            variant="error"
            title="Interview practice could not be loaded"
            description={error.message}
            onRetry={load}
          />
        </div>
      </section>
    )
  }

  return (
    <section className="mock-interview-page">
      <div className="page-container mock-interview-container">
        <header className="page-head">
          <div>
            <p className="page-eyebrow">Interview practice</p>
            <h1 className="page-title">Mock Interview</h1>
            <p className="page-subtitle">
              Run a timed, account-backed interview session. Categories, timing
              and scoring are calculated by the backend.
            </p>
          </div>
          <div className="mock-head-actions">
            <Link to="/mock-interview/history" className="btn btn-secondary">
              <Trophy size={16} aria-hidden="true" />
              Interview history
            </Link>
          </div>
        </header>

        {activeSession && (
          <section
            className="active-session-banner"
            aria-labelledby="active-session-title"
          >
            <span className="active-session-icon" aria-hidden="true">
              <Timer size={20} />
            </span>
            <div className="active-session-copy">
              <p className="page-eyebrow">Session in progress</p>
              <h2 id="active-session-title">{activeSession.title}</h2>
              <p>
                {activeSession.categoryLabel} ·{' '}
                {difficultyLabel(activeSession.difficulty)} ·{' '}
                {activeSession.questionCount} questions ·{' '}
                {formatClock(activeSession.remainingSeconds || 0)} remaining
              </p>
            </div>
            <Link
              to={`/mock-interview/sessions/${activeSession.id}`}
              className="btn btn-primary"
            >
              Resume session
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </section>
        )}

        <div className="mock-setup-grid">
          <section
            className="interview-setup"
            aria-labelledby="create-template-title"
          >
            <div className="mock-section-head">
              <div>
                <h2 className="setup-title" id="create-template-title">
                  Create an interview template
                </h2>
                <p className="setup-help">
                  Templates save your category, difficulty and duration so you
                  can start again quickly. Each session gets five questions.
                </p>
              </div>
              <span className="setup-icon-wrap" aria-hidden="true">
                <Plus size={18} />
              </span>
            </div>

            <form
              className="template-form"
              onSubmit={(event) => createTemplate(event, false)}
              noValidate
            >
              <div className="composer-field">
                <label htmlFor="template-title">Template title</label>
                <input
                  id="template-title"
                  type="text"
                  className="input"
                  placeholder="e.g. Java backend warm-up"
                  value={form.title}
                  maxLength={TITLE_MAX}
                  onChange={(event) => {
                    updateForm({ title: event.target.value })
                    setFieldErrors((current) => ({
                      ...current,
                      title: undefined,
                    }))
                  }}
                  aria-invalid={Boolean(fieldErrors.title)}
                  aria-describedby={
                    fieldErrors.title ? 'template-title-error' : undefined
                  }
                />
                {fieldErrors.title && (
                  <p
                    className="field-error"
                    id="template-title-error"
                    role="alert"
                  >
                    {fieldErrors.title}
                  </p>
                )}
              </div>

              <div className="template-field-grid">
                <div className="composer-field">
                  <label htmlFor="template-category">Category</label>
                  <select
                    id="template-category"
                    className="select"
                    value={form.category}
                    onChange={(event) =>
                      updateForm({ category: event.target.value })
                    }
                    aria-invalid={Boolean(fieldErrors.category)}
                  >
                    {categories.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.category && (
                    <p className="field-error" role="alert">
                      {fieldErrors.category}
                    </p>
                  )}
                </div>

                <div className="composer-field">
                  <label htmlFor="template-difficulty">Difficulty</label>
                  <select
                    id="template-difficulty"
                    className="select"
                    value={form.difficulty}
                    onChange={(event) =>
                      updateForm({ difficulty: event.target.value })
                    }
                    aria-invalid={Boolean(fieldErrors.difficulty)}
                  >
                    {difficulties.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.difficulty && (
                    <p className="field-error" role="alert">
                      {fieldErrors.difficulty}
                    </p>
                  )}
                </div>

                <div className="composer-field">
                  <label htmlFor="template-duration">Duration (minutes)</label>
                  <input
                    id="template-duration"
                    type="number"
                    className="input"
                    min={5}
                    max={180}
                    step={5}
                    value={form.durationMinutes}
                    onChange={(event) =>
                      updateForm({ durationMinutes: event.target.value })
                    }
                    aria-invalid={Boolean(fieldErrors.durationMinutes)}
                  />
                  {fieldErrors.durationMinutes && (
                    <p className="field-error" role="alert">
                      {fieldErrors.durationMinutes}
                    </p>
                  )}
                  <span className="field-hint">
                    Default 45 minutes. Range 5–180.
                  </span>
                </div>
              </div>

              <label className="consent-row">
                <input
                  type="checkbox"
                  checked={focusConsent}
                  onChange={(event) => setFocusConsent(event.target.checked)}
                />
                <span>
                  Allow focus-loss monitoring for this session. Optional — when
                  enabled, the page records tab blur events on the server. No
                  camera, microphone or screen content is captured.
                </span>
              </label>

              {actionError && (
                <p className="field-error" role="alert">
                  {actionError}
                </p>
              )}
              {notice && (
                <p className="composer-feedback" role="status">
                  <CheckCircle size={15} aria-hidden="true" />
                  {notice}
                </p>
              )}

              <div className="template-form-actions">
                <button
                  type="submit"
                  className="btn btn-secondary"
                  disabled={creating || Boolean(activeSession)}
                >
                  <Calendar size={16} aria-hidden="true" />
                  {creating ? 'Saving…' : 'Save template'}
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={(event) => createTemplate(event, true)}
                  disabled={creating || Boolean(activeSession)}
                >
                  <Play size={16} aria-hidden="true" />
                  {creating ? 'Starting…' : 'Save & start'}
                </button>
              </div>
              {activeSession && (
                <p className="field-hint">
                  Finish or cancel your active session before starting another.
                </p>
              )}
            </form>
          </section>

          <section className="template-panel" aria-labelledby="templates-title">
            <div className="mock-section-head">
              <div>
                <h2 className="setup-title" id="templates-title">
                  Your templates
                </h2>
                <p className="setup-help">
                  Start a session from a saved template. The server assigns the
                  questions and timestamps.
                </p>
              </div>
              <span className="mock-count">{templates.length}</span>
            </div>

            {templates.length === 0 ? (
              <EmptyState
                icon={Zap}
                title="No templates yet"
                description="Create your first template to start a timed interview session."
              />
            ) : (
              <ul className="template-list">
                {templates.map((template) => (
                  <li className="template-card" key={template.id}>
                    <div className="template-main">
                      <h3 className="template-title">{template.title}</h3>
                      {template.description && (
                        <p className="template-description">
                          {template.description}
                        </p>
                      )}
                      <div className="template-badges">
                        <span className="setup-chip">
                          {template.categoryLabel}
                        </span>
                        <DifficultyBadge
                          difficulty={difficultyLabel(template.difficulty)}
                        />
                        <span className="setup-chip">
                          <Timer size={12} aria-hidden="true" />
                          {formatMinutes(template.durationMinutes)}
                        </span>
                        <span className="setup-chip">5 questions</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary template-start"
                      onClick={() => startSession(template)}
                      disabled={
                        Boolean(activeSession) || startingId === template.id
                      }
                    >
                      <Play size={15} aria-hidden="true" />
                      {startingId === template.id ? 'Starting…' : 'Start'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {performance && (
          <section
            className="mock-performance"
            aria-labelledby="performance-title"
          >
            <div className="mock-section-head">
              <div>
                <h2 className="setup-title" id="performance-title">
                  Interview performance
                </h2>
                <p className="setup-help">
                  Calculated from your completed and expired backend sessions.
                </p>
              </div>
              <Clock className="mock-section-icon" size={18} aria-hidden="true" />
            </div>
            <div className="mock-performance-grid">
              <div className="summary-stat">
                <span className="summary-stat-label">Total sessions</span>
                <span className="summary-stat-value">
                  {performance.totalSessions}
                </span>
                <span className="summary-stat-note">
                  {performance.completedSessions} completed ·{' '}
                  {performance.expiredSessions} expired
                </span>
              </div>
              <div className="summary-stat">
                <span className="summary-stat-label">Avg. completion</span>
                <span className="summary-stat-value">
                  {Math.round(performance.averageCompletionPercentage || 0)}%
                </span>
                <span className="summary-stat-note">
                  answered questions ÷ assigned
                </span>
              </div>
              <div className="summary-stat">
                <span className="summary-stat-label">Focus losses</span>
                <span className="summary-stat-value">
                  {performance.totalFocusLossEvents}
                </span>
                <span className="summary-stat-note">
                  recorded only with consent
                </span>
              </div>
            </div>
          </section>
        )}

        <section className="interview-rules" aria-labelledby="rules-title">
          <h2 className="rules-title" id="rules-title">
            How the session works
          </h2>
          <ul className="rules-list">
            <li>
              The timer starts on the server when you press Start. Refreshing
              the page restores the same session and remaining time.
            </li>
            <li>
              Each session contains five questions from the PrepMaster question
              catalog. Text notes and code drafts are saved as you work.
            </li>
            <li>
              The score is a completion percentage based on how many questions
              you answered. It is not an automatic correctness judgement.
            </li>
            <li>
              Focus monitoring is opt-in per session and only records tab blur
              or visibility changes. It never captures screen content.
            </li>
            <li>
              Code drafts are stored as text and are never executed by the
              platform.
            </li>
          </ul>
        </section>

        <p className="interview-disclaimer" role="note">
          <ShieldAlert size={15} aria-hidden="true" />
          Sessions are private to your account. Other users cannot read your
          interview answers, and results never expose private profile data.
        </p>

        <p className="mock-setup-note">
          <Info size={14} aria-hidden="true" />
          Tip: complete a few daily-plan tasks and interview sessions to unlock
          achievements and climb the leaderboard.
        </p>
      </div>
    </section>
  )
}
