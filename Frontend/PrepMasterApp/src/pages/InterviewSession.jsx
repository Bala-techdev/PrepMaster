import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import {
  ArrowLeft,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code2,
  Info,
  Save,
  ShieldAlert,
  Timer,
  XCircle,
} from 'lucide-react'
import DifficultyBadge from '../components/DifficultyBadge'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import PageState from '../components/PageState'
import {
  cancelInterviewSession,
  completeInterviewSession,
  getInterviewSession,
  recordFocusEvent,
  saveInterviewAnswer,
  updateFocusConsent,
} from '../api/mockInterviewService'
import { formatClock } from '../lib/date'
import { difficultyLabel } from '../lib/format'
import './MockInterview.css'

const LANGUAGE_OPTIONS = [
  { value: 'JAVA', label: 'Java', monaco: 'java' },
  { value: 'PYTHON', label: 'Python', monaco: 'python' },
  { value: 'CPP', label: 'C++', monaco: 'cpp' },
  { value: 'JAVASCRIPT', label: 'JavaScript', monaco: 'javascript' },
  { value: 'SQL', label: 'SQL', monaco: 'sql' },
]

const monacoLanguage = (language) =>
  LANGUAGE_OPTIONS.find((item) => item.value === language)?.monaco || 'plaintext'

const draftIsDirty = (draft, saved) => {
  if (!draft) return false
  if (!saved) return true
  return (
    draft.answerText !== saved.answerText ||
    draft.codeText !== saved.codeText ||
    draft.language !== saved.language
  )
}

export default function InterviewSession() {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  const [session, setSession] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [drafts, setDrafts] = useState({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [remaining, setRemaining] = useState(0)
  const [saveStatus, setSaveStatus] = useState('saved')
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState('')
  const [busy, setBusy] = useState(false)
  const [finishOpen, setFinishOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [consentBusy, setConsentBusy] = useState(false)

  const activeRef = useRef(true)
  const serverOffsetRef = useRef(0)
  const lastSavedRef = useRef({})
  const autoCompleteRef = useRef(false)
  const focusReportRef = useRef(0)
  const pendingSaveRef = useRef(null)

  useEffect(() => {
    activeRef.current = true
    return () => {
      activeRef.current = false
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError(null)

    getInterviewSession(sessionId)
      .then((data) => {
        if (cancelled) return

        setSession(data)
        setRemaining(data.remainingSeconds || 0)
        serverOffsetRef.current = data.serverTime
          ? new Date(data.serverTime).getTime() - Date.now()
          : 0

        const nextDrafts = {}
        const saved = {}
        for (const question of data.questions || []) {
          const answer = question.answer || {}
          nextDrafts[question.id] = {
            answerText: answer.answerText || '',
            codeText: answer.codeText || '',
            language: answer.language || 'JAVA',
            answered: Boolean(answer.answered),
          }
          saved[question.id] = {
            answerText: answer.answerText || '',
            codeText: answer.codeText || '',
            language: answer.language || 'JAVA',
          }
        }
        lastSavedRef.current = saved
        setDrafts(nextDrafts)

        if (data.status === 'COMPLETED' || data.status === 'EXPIRED') {
          navigate(`/mock-interview/results/${sessionId}`, { replace: true })
        }
      })
      .catch((requestError) => {
        if (!cancelled) setLoadError(requestError)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [navigate, sessionId])

  const currentQuestion = session?.questions?.[currentIndex] || null
  const currentDraft = currentQuestion ? drafts[currentQuestion.id] : null
  const sessionOpen = session?.status === 'IN_PROGRESS'

  const answeredCount = useMemo(() => {
    if (!session) return 0
    return session.questions.filter((question) => {
      const draft = drafts[question.id]
      return Boolean(
        draft?.answered ||
          question.answer?.answered ||
          draft?.answerText?.trim() ||
          draft?.codeText?.trim(),
      )
    }).length
  }, [drafts, session])

  const persistAnswer = useCallback(
    async (questionId, draft, answeredOverride) => {
      if (!draft) return null
      setSaving(true)
      setSaveStatus('saving')

      try {
        const updated = await saveInterviewAnswer(sessionId, questionId, {
          answerText: draft.answerText,
          codeText: draft.codeText,
          language: draft.language,
          answered:
            answeredOverride ??
            Boolean(draft.answerText.trim() || draft.codeText.trim()),
        })

        if (!activeRef.current) return updated

        lastSavedRef.current[questionId] = {
          answerText: draft.answerText,
          codeText: draft.codeText,
          language: draft.language,
        }

        setDrafts((current) => ({
          ...current,
          [questionId]: {
            ...current[questionId],
            answered: Boolean(updated.answer?.answered),
          },
        }))
        setSession((current) =>
          current
            ? {
                ...current,
                questions: current.questions.map((question) =>
                  question.id === updated.id ? updated : question,
                ),
              }
            : current,
        )
        setSaveStatus('saved')
        setActionError('')
        return updated
      } catch (requestError) {
        if (activeRef.current) {
          setSaveStatus('error')
          setActionError(
            requestError.message ||
              'This answer could not be saved. Check your connection and retry.',
          )
        }
        return null
      } finally {
        if (activeRef.current) setSaving(false)
      }
    },
    [sessionId],
  )

  const updateDraft = (patch) => {
    if (!currentQuestion) return
    setDrafts((current) => ({
      ...current,
      [currentQuestion.id]: {
        ...current[currentQuestion.id],
        ...patch,
      },
    }))
    setSaveStatus('dirty')
  }

  const queueSave = useCallback(
    (questionId, draft, answeredOverride) => {
      const promise = persistAnswer(questionId, draft, answeredOverride)
      pendingSaveRef.current = promise
      return promise
    },
    [persistAnswer],
  )

  const flushCurrent = useCallback(() => {
    if (!currentQuestion || !currentDraft) return null
    if (draftIsDirty(currentDraft, lastSavedRef.current[currentQuestion.id])) {
      return queueSave(currentQuestion.id, currentDraft)
    }
    return null
  }, [currentDraft, currentQuestion, queueSave])

  const goToQuestion = (index) => {
    if (!session) return
    const next = Math.min(session.questions.length - 1, Math.max(0, index))
    if (next === currentIndex) return
    flushCurrent()
    setCurrentIndex(next)
  }

  /* Debounced autosave for the visible question. */
  useEffect(() => {
    if (!sessionOpen || !currentQuestion || !currentDraft) return undefined
    if (!draftIsDirty(currentDraft, lastSavedRef.current[currentQuestion.id])) {
      return undefined
    }

    const timer = window.setTimeout(() => {
      queueSave(currentQuestion.id, currentDraft)
    }, 1400)

    return () => window.clearTimeout(timer)
  }, [currentDraft, currentQuestion, queueSave, sessionOpen])

  /* Server-timed countdown. When it reaches zero the backend finalizes the
     session as EXPIRED and the result page takes over. */
  useEffect(() => {
    if (!session || session.status !== 'IN_PROGRESS') return undefined

    const expiresAt = new Date(session.expiresAt).getTime()

    const computeRemaining = () => {
      const serverNow = Date.now() + serverOffsetRef.current
      return Math.max(0, Math.floor((expiresAt - serverNow) / 1000))
    }

    setRemaining(computeRemaining())
    const timer = window.setInterval(() => {
      const next = computeRemaining()
      setRemaining(next)

      if (next <= 0 && !autoCompleteRef.current) {
        autoCompleteRef.current = true
        setBusy(true)
        completeInterviewSession(session.id)
          .then(() => {
            if (activeRef.current) {
              navigate(`/mock-interview/results/${session.id}`, {
                replace: true,
              })
            }
          })
          .catch((requestError) => {
            if (activeRef.current) {
              setBusy(false)
              setActionError(
                requestError.message ||
                  'Time is up, but the session could not be finalized. Refresh to retry.',
              )
            }
          })
      }
    }, 1000)

    return () => window.clearInterval(timer)
  }, [navigate, session])

  /* Opt-in focus-loss reporting. Events are throttled so a single tab switch
     cannot flood the backend. */
  useEffect(() => {
    if (
      !session ||
      session.status !== 'IN_PROGRESS' ||
      !session.focusMonitoringConsented
    ) {
      return undefined
    }

    const report = (eventType) => {
      const now = Date.now()
      if (now - focusReportRef.current < 3000) return
      focusReportRef.current = now

      recordFocusEvent(session.id, eventType)
        .then(() => {
          if (activeRef.current) {
            setSession((current) =>
              current
                ? { ...current, focusLossCount: current.focusLossCount + 1 }
                : current,
            )
          }
        })
        .catch(() => {
          /* Focus telemetry is best-effort and must not interrupt the session. */
        })
    }

    const handleBlur = () => report('BLUR')
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') report('VISIBILITY_HIDDEN')
    }

    window.addEventListener('blur', handleBlur)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      window.removeEventListener('blur', handleBlur)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [session])

  const toggleFocusConsent = async (consented) => {
    setConsentBusy(true)
    setActionError('')
    try {
      const updated = await updateFocusConsent(session.id, consented)
      setSession(updated)
    } catch (requestError) {
      setActionError(
        requestError.message || 'Focus monitoring consent could not be updated.',
      )
    } finally {
      setConsentBusy(false)
    }
  }

  const finishSession = async () => {
    if (busy) return
    setFinishOpen(false)
    setBusy(true)
    setActionError('')

    let pending = pendingSaveRef.current
    if (
      currentQuestion &&
      currentDraft &&
      draftIsDirty(currentDraft, lastSavedRef.current[currentQuestion.id])
    ) {
      pending = queueSave(currentQuestion.id, currentDraft)
    }
    if (pending) await pending

    try {
      await completeInterviewSession(session.id)
      navigate(`/mock-interview/results/${session.id}`)
    } catch (requestError) {
      if (requestError.status === 409) {
        navigate(`/mock-interview/results/${session.id}`)
        return
      }
      setBusy(false)
      setActionError(
        requestError.message ||
          'The interview could not be completed. Please try again.',
      )
    }
  }

  const cancelSession = async () => {
    if (busy) return
    setCancelOpen(false)
    setBusy(true)
    setActionError('')

    try {
      await cancelInterviewSession(session.id)
      navigate('/mock-interview', { replace: true })
    } catch (requestError) {
      setBusy(false)
      setActionError(
        requestError.message ||
          'The interview could not be cancelled. Please try again.',
      )
    }
  }

  if (loading) {
    return (
      <section className="mock-interview-page">
        <div className="page-container mock-interview-container">
          <PageState
            variant="loading"
            title="Restoring your interview"
            description="Loading the server session, remaining time and saved answers."
          />
        </div>
      </section>
    )
  }

  if (loadError) {
    return (
      <section className="mock-interview-page">
        <div className="page-container mock-interview-container">
          <PageState
            variant="error"
            title="Interview session could not be loaded"
            description={loadError.message}
            onRetry={() => window.location.reload()}
          />
        </div>
      </section>
    )
  }

  if (!session) {
    return (
      <section className="mock-interview-page">
        <div className="page-container mock-interview-container">
          <EmptyState
            icon={Timer}
            title="Interview session not found"
            description="The session may have been removed or belongs to another account."
          >
            <Link to="/mock-interview" className="btn btn-primary">
              Back to Mock Interview
            </Link>
          </EmptyState>
        </div>
      </section>
    )
  }

  if (session.status === 'CANCELLED') {
    return (
      <section className="mock-interview-page">
        <div className="page-container mock-interview-container">
          <EmptyState
            icon={XCircle}
            title="Interview cancelled"
            description="Cancelled sessions do not produce a result. Start a new session when you are ready."
          >
            <Link to="/mock-interview" className="btn btn-primary">
              Start another interview
            </Link>
            <Link to="/mock-interview/history" className="btn btn-secondary">
              View history
            </Link>
          </EmptyState>
        </div>
      </section>
    )
  }

  const lowTime = remaining <= 300
  const saveLabel =
    saveStatus === 'saving'
      ? 'Saving…'
      : saveStatus === 'dirty'
        ? 'Unsaved changes'
        : saveStatus === 'error'
          ? 'Save failed'
          : 'Saved'
  const answeredCurrent = Boolean(
    currentDraft?.answered ||
      currentDraft?.answerText?.trim() ||
      currentDraft?.codeText?.trim(),
  )

  return (
    <section className="mock-interview-page">
      <div className="page-container mock-interview-container interview-session-container">
        <header className="page-head interview-active-head">
          <div>
            <Link to="/mock-interview" className="back-link">
              <ArrowLeft size={15} aria-hidden="true" />
              Interview setup
            </Link>
            <p className="page-eyebrow">Live session</p>
            <h1 className="page-title">{session.title}</h1>
            <p className="page-subtitle">
              {session.categoryLabel} · {difficultyLabel(session.difficulty)} ·{' '}
              {session.questionCount} questions · Focus monitoring{' '}
              {session.focusMonitoringConsented ? 'on' : 'off'}
            </p>
          </div>

          <div className="session-head-actions">
            <div
              className={`interview-timer${lowTime ? ' is-low' : ''}`}
              role="timer"
              aria-label={`${formatClock(remaining)} remaining`}
            >
              <span className="interview-timer-value">
                {formatClock(remaining)}
              </span>
              <span className="interview-timer-label">
                <Clock size={13} aria-hidden="true" />
                remaining
              </span>
            </div>
            <div className="session-action-row">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setCancelOpen(true)}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setFinishOpen(true)}
                disabled={busy}
              >
                <CheckCircle size={16} aria-hidden="true" />
                Finish interview
              </button>
            </div>
          </div>
        </header>

        {actionError && (
          <p className="session-alert" role="alert">
            {actionError}
          </p>
        )}

        <div className="session-layout">
          <section
            className="session-question-panel"
            aria-labelledby="session-question-title"
          >
            <div className="question-meta">
              <span className="question-counter">
                Question {currentIndex + 1} of {session.questions.length}
              </span>
              <DifficultyBadge
                difficulty={difficultyLabel(currentQuestion?.difficulty)}
              />
              <span className="question-topic">{currentQuestion?.topic}</span>
            </div>

            <h2 className="question-title" id="session-question-title">
              {currentQuestion?.title}
            </h2>
            <p className="session-prompt">{currentQuestion?.prompt}</p>

            {(currentQuestion?.constraints || currentQuestion?.examples) && (
              <div className="session-detail-grid">
                {currentQuestion?.constraints && (
                  <details className="session-detail" open>
                    <summary>Constraints</summary>
                    <p>{currentQuestion.constraints}</p>
                  </details>
                )}
                {currentQuestion?.examples && (
                  <details className="session-detail">
                    <summary>Examples</summary>
                    <pre>{currentQuestion.examples}</pre>
                  </details>
                )}
              </div>
            )}

            {(currentQuestion?.expectedTimeComplexity ||
              currentQuestion?.expectedSpaceComplexity) && (
              <div className="session-complexity">
                {currentQuestion?.expectedTimeComplexity && (
                  <span className="setup-chip">
                    Time: {currentQuestion.expectedTimeComplexity}
                  </span>
                )}
                {currentQuestion?.expectedSpaceComplexity && (
                  <span className="setup-chip">
                    Space: {currentQuestion.expectedSpaceComplexity}
                  </span>
                )}
              </div>
            )}

            <div className="question-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => goToQuestion(currentIndex - 1)}
                disabled={currentIndex === 0}
              >
                <ChevronLeft size={16} aria-hidden="true" />
                Previous
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => goToQuestion(currentIndex + 1)}
                disabled={currentIndex >= session.questions.length - 1}
              >
                Next
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>
          </section>

          <section
            className="session-answer-panel"
            aria-labelledby="session-answer-title"
          >
            <div className="session-answer-head">
              <div>
                <h2 className="section-title" id="session-answer-title">
                  Your answer
                </h2>
                <p className="session-save-state" aria-live="polite">
                  {saveStatus === 'saving' ? (
                    <Save size={13} aria-hidden="true" />
                  ) : saveStatus === 'error' ? (
                    <XCircle size={13} aria-hidden="true" />
                  ) : (
                    <Check size={13} aria-hidden="true" />
                  )}
                  {saveLabel}
                </p>
              </div>
              <button
                type="button"
                className={`btn ${answeredCurrent ? 'btn-soft' : 'btn-primary'} session-answered-btn`}
                onClick={() =>
                  queueSave(currentQuestion.id, currentDraft, true)
                }
                disabled={saving || !sessionOpen}
                aria-pressed={answeredCurrent}
              >
                <Check size={15} aria-hidden="true" />
                {answeredCurrent ? 'Answered' : 'Mark answered'}
              </button>
            </div>

            <label className="session-label" htmlFor="session-notes">
              Approach and notes
            </label>
            <textarea
              id="session-notes"
              className="textarea session-notes"
              rows={5}
              maxLength={10000}
              value={currentDraft?.answerText || ''}
              onChange={(event) =>
                updateDraft({ answerText: event.target.value })
              }
              onBlur={flushCurrent}
              placeholder="Explain your approach, trade-offs and edge cases…"
            />

            <div className="session-editor-head">
              <span className="session-label">
                <Code2 size={14} aria-hidden="true" />
                Code draft
              </span>
              <label className="session-language">
                <span className="visually-hidden">Draft language</span>
                <select
                  className="select"
                  value={currentDraft?.language || 'JAVA'}
                  onChange={(event) =>
                    updateDraft({ language: event.target.value })
                  }
                >
                  {LANGUAGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="session-editor">
              <Editor
                height="min(36vh, 360px)"
                language={monacoLanguage(currentDraft?.language || 'JAVA')}
                theme="vs-dark"
                value={currentDraft?.codeText || ''}
                onChange={(value) => updateDraft({ codeText: value || '' })}
                loading="Loading code editor…"
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  padding: { top: 12 },
                  tabSize: 2,
                }}
              />
            </div>

            <p className="interview-side-note">
              <ShieldAlert size={14} aria-hidden="true" />
              Drafts are stored as plain text with the backend. This editor
              never executes code, and answers are private to your account.
            </p>
          </section>
        </div>

        <div className="session-sidebar-grid">
          <section
            className="session-nav-panel"
            aria-labelledby="session-nav-title"
          >
            <div className="mock-section-head">
              <div>
                <h2 className="setup-title" id="session-nav-title">
                  Questions
                </h2>
                <p className="setup-help">
                  {answeredCount} of {session.questions.length} answered
                </p>
              </div>
              <span className="mock-count">
                {Math.round((answeredCount / session.questions.length) * 100)}%
              </span>
            </div>

            <div className="question-nav-grid">
              {session.questions.map((question, index) => {
                const draft = drafts[question.id]
                const isAnswered = Boolean(
                  draft?.answered ||
                    draft?.answerText?.trim() ||
                    draft?.codeText?.trim(),
                )
                const isCurrent = index === currentIndex

                return (
                  <button
                    key={question.id}
                    type="button"
                    className={`question-nav-btn${isCurrent ? ' is-current' : ''}${isAnswered ? ' is-answered' : ''}`}
                    onClick={() => goToQuestion(index)}
                    aria-current={isCurrent ? 'true' : undefined}
                    aria-label={`Question ${index + 1}${isAnswered ? ', answered' : ', not answered'}`}
                  >
                    {index + 1}
                    {isAnswered && <Check size={11} aria-hidden="true" />}
                  </button>
                )
              })}
            </div>

            <div className="interview-side-progress">
              <span>Time remaining</span>
              <span>{formatClock(remaining)}</span>
            </div>
            <div className="interview-side-progress">
              <span>Focus loss events</span>
              <span>{session.focusLossCount}</span>
            </div>
          </section>

          <section
            className="session-consent-panel"
            aria-labelledby="session-consent-title"
          >
            <h2 className="setup-title" id="session-consent-title">
              Focus monitoring
            </h2>
            <p className="setup-help">
              Optional. When enabled, the backend records tab blur and
              visibility changes for this session. It does not capture screen
              content, keystrokes, camera or microphone input.
            </p>
            <label className="consent-row">
              <input
                type="checkbox"
                checked={Boolean(session.focusMonitoringConsented)}
                disabled={consentBusy || !sessionOpen}
                onChange={(event) => toggleFocusConsent(event.target.checked)}
              />
              <span>
                Record focus-loss events for this session. You can turn this off
                at any time before finishing.
              </span>
            </label>
            <p className="interview-side-note">
              <Info size={14} aria-hidden="true" />
              Enabling monitoring never changes your completion score.
            </p>
          </section>
        </div>

        <p className="interview-disclaimer" role="note">
          <Info size={15} aria-hidden="true" />
          The timer is controlled by server timestamps. Refreshing this page
          restores the same session and keeps your saved answers.
        </p>
      </div>

      <Modal
        open={finishOpen}
        title="Finish this interview?"
        description="The server will stop the timer and generate a result once."
        onClose={() => setFinishOpen(false)}
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setFinishOpen(false)}
            >
              Keep going
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={finishSession}
              disabled={busy}
            >
              Finish and view result
            </button>
          </>
        }
      >
        <p>
          You have answered <strong>{answeredCount}</strong> of{' '}
          <strong>{session.questions.length}</strong> questions.
        </p>
        <p>
          Questions without an answer are not counted as incorrect, but they do
          lower the completion percentage. A finished session cannot be resumed.
        </p>
      </Modal>

      <Modal
        open={cancelOpen}
        title="Cancel this interview?"
        description="Cancelled sessions do not produce a result or achievement progress."
        onClose={() => setCancelOpen(false)}
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCancelOpen(false)}
            >
              Keep going
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={cancelSession}
              disabled={busy}
            >
              Cancel interview
            </button>
          </>
        }
      >
        <p>
          Your saved answers stay stored, but the session status becomes
          cancelled and cannot be completed later.
        </p>
      </Modal>
    </section>
  )
}
