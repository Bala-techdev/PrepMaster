import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Calendar,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  Info,
  ShieldAlert,
  Timer,
  Trophy,
  Zap,
} from 'lucide-react'
import DifficultyBadge from '../components/DifficultyBadge'
import Modal from '../components/Modal'
import { useAppData } from '../state/useAppData'
import {
  getInterviewTemplates as listMockInterviews,
  createInterviewTemplate as createMockInterview,
  startInterviewSession as startMockInterviewSession,
  completeInterviewSession as completeMockInterviewSession,
  cancelInterviewSession as cancelMockInterviewSession,
} from '../api/mockInterviewService'
import { formatClock } from '../lib/date'
import { useAuth } from '../auth/useAuth'
import './MockInterview.css'

export default function MockInterviewPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { getMockInterviews, getSession, saveInterview, getInterviewHistory } = useAppData()

  const [difficulty, setDifficulty] = useState('All')
  const [topic, setTopic] = useState('All')
  const [session, setSession] = useState(null)
  const [summary, setSummary] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [interviews, setInterviews] = useState([])

  const plannedQuestions = useMemo(
    () => session?.questions ? session.questions : [],
    [session]
  )

  /* ---------- Load mock interviews from backend ---------- */
  useEffect(() => {
    if (!user) return
    ;(async () => {
      setLoadingSessions(true)
      try {
        const data = await listMockInterviews()
        setInterviews(data || [])
      } catch (e) {
        // ignore - falls back to empty list
      } finally {
        setLoadingSessions(false)
      }
    })()
  }, [user])

  /* ---------- Load active session from backend if present ---------- */
  useEffect(() => {
    if (!user || !session?.id) return
    ;(async () => {
      try {
        const result = await getSession(user.id, session.id)
        if (result) setSession(result)
      } catch (e) {
        // keep local state if backend fetch fails
      }
    })()
  }, [user, session?.id])

  /* ---------- Load interview history from backend ---------- */
  useEffect(() => {
    if (!user) return
    ;(async () => {
      try {
        const history = await getInterviewHistory(user.id)
        // merge with local; backend takes priority by id
        setSummary(null) // signal no summary initially
      } catch (e) {
        // ignore
      }
    })()
  }, [user])

  /* ---------- Timer: server-generated expiry ---------- */
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!session?.endTime) return
    const timer = setInterval(() => {
      setNow(Date.now())
      if (Date.now() >= session.endTime) {
        clearInterval(timer)
        ;(async () => {
          await completeMockInterviewSession(session.id)
          setSession(null)
          setSummary({
            id: session.id,
            topic: session.topic,
            difficulty: session.difficulty,
            durationMinutes: session.durationMinutes,
            startedAt: session.startedAt,
            endedAt: new Date().toISOString(),
            endReason: 'time',
            questionIds: session.questionIds,
            answers: session.answers,
            answeredCount: session.answers ? Object.keys(session.answers).length : 0,
            score: session.answers ? Math.round(
              (Object.keys(session.answers).length / session.questionIds.length) * 100
            ) : 0,
            elapsedSeconds: Math.floor((new Date().getTime() - new Date(session.startedAt).getTime()) / 1000),
          })
        })()
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [session, user])

  /* ---------- Session CRUD helpers (backend) ---------- */
  const loadSession = useCallback(async (sessionId) => {
    if (!user) return null
    try {
      const result = await getSession(user.id, sessionId)
      return result
    } catch (e) {
      return null
    }
  }, [user])

  const endSession = useCallback(
    async (reason) => {
      if (!session || !session.id) return
      setConfirmOpen(false)
      try {
        await completeMockInterviewSession(session.id)
        setSession(null)
        setSummary({
          id: session.id,
          topic: session.topic,
          difficulty: session.difficulty,
          durationMinutes: session.durationMinutes,
          startedAt: session.startedAt,
          endedAt: new Date().toISOString(),
          endReason: reason,
          questionIds: session.questionIds,
          answers: session.answers,
          answeredCount: session.answers ? Object.keys(session.answers).length : 0,
          score: session.answers ? Math.round(
            (Object.keys(session.answers).length / session.questionIds.length) * 100
          ) : 0,
          elapsedSeconds: Math.floor((new Date().getTime() - new Date(session.startedAt).getTime()) / 1000),
        })
      } catch (e) {
        // keep UI in current state on failure
      }
    },
    [session, user]
  )

  const cancelSession = useCallback(async (sessionId) => {
    if (!user) return
    try {
      await cancelMockInterviewSession(sessionId)
    } catch (e) {
      // ignore
    }
  }, [user])

  /* ---------- Start a new session ---------- */
  const startSession = useCallback(async () => {
    if (!user) return
    setCreating(true)
    try {
      // 1) Persist a MockInterview config on the backend
      const mi = await createMockInterview({
        title: `Mock Interview – ${topic === 'All' ? 'Mixed' : topic} – ${difficulty === 'All' ? 'Mixed' : difficulty}`,
        description: `Category: ${topic === 'All' ? 'Mixed topics' : topic}; Difficulty: ${difficulty === 'All' ? 'Mixed difficulty' : difficulty}`,
        category: topic === 'All' ? 'TECHNICAL_FUNDAMENTALS' : topic.toUpperCase().replace(/\s+/g, '_'),
        difficulty: difficulty.toUpperCase(),
        durationMinutes: 45,
      })
      // 2) Start a session on the backend
      const payload = {
        mockInterviewId: mi.id,
        userId: user.id,
      }
      const newSession = await startMockInterviewSession(payload)
      setSession(newSession)
      setNow(new Date().getTime())
      setCreating(false)
    } catch (e) {
      setCreating(false)
    }
  }, [user, topic, difficulty])

  const goToQuestion = (index) => {
    setSession((previous) => {
      if (!previous) return previous
      const nextIndex = Math.min(
        previous.questions.length - 1,
        Math.max(0, index),
      )
      return { ...previous, currentIndex: nextIndex }
    })
  }

  const toggleAnswered = (questionId) => {
    setSession((previous) => {
      if (!previous) return previous
      return {
        ...previous,
        answers: {
          ...previous.answers,
          [questionId]: !previous.answers[questionId],
        },
      }
    })
  }

  const answeredCount = session
    ? session.answers ? Object.keys(session.answers).length : 0
    : 0

  const currentQuestion = session?.questions[session.currentIndex]

  const topicLabel =
    session?.topic || topic || 'All topics'
  const difficultyLabel =
    session?.difficulty || difficulty || 'All difficulties'

  /* ---------- If we have a summary from backend, display it ---------- */
  if (summary) {
    const timeUsed = formatClock(summary.elapsedSeconds)
    const unanswered = (summary.questionIds || []).length - summary.answeredCount

    return (
      <section className="mock-interview-page">
        <div className="page-container mock-interview-container">
          <section
            className="interview-summary"
            aria-labelledby="summary-title"
          >
            <div className="summary-hero">
              <span className="summary-icon" aria-hidden="true">
                <Trophy size={24} />
              </span>
              <div>
                <p className="page-eyebrow">Session complete</p>
                <h1 className="page-title" id="summary-title">
                  Interview summary
                </h1>
                <p className="page-subtitle">
                  {summary.topic === 'All' ? 'Mixed topics' : summary.topic} ·{' '}
                  {summary.difficulty === 'All'
                    ? 'Mixed difficulty'
                    : summary.difficulty}{' '}
                  · {summary.endReason === 'time' ? 'Timer expired' : 'Ended by you'}
                </p>
              </div>
            </div>

            <div className="summary-grid">
              <div className="summary-stat">
                <span className="summary-stat-label">Completion score</span>
                <span className="summary-stat-value">{summary.score}%</span>
                <span className="summary-stat-note">
                  {summary.answeredCount} of {summary.questionIds?.length || summary.questions.length} marked answered
                </span>
              </div>
              <div className="summary-stat">
                <span className="summary-stat-label">Time used</span>
                <span className="summary-stat-value">{timeUsed}</span>
                <span className="summary-stat-note">
                  of {summary.durationMinutes}:00
                </span>
              </div>
              <div className="summary-stat">
                <span className="summary-stat-label">Unanswered</span>
                <span className="summary-stat-value">{unanswered}</span>
                <span className="summary-stat-note">
                  not counted as incorrect
                </span>
              </div>
            </div>

            <p className="summary-disclaimer" role="note">
              <Info size={15} aria-hidden="true" />
              This score reflects only how many questions you marked as answered
              during the session. It is a completion measure, not an automatic
              correctness judgement. No anti-cheat monitoring is performed.
            </p>

            <h2 className="section-title">Questions covered</h2>
            <div className="summary-questions">
              {(summary.questions || []).map((question, index) => {
                const wasAnswered = Boolean(summary.answers && summary.answers[question.id])

                return (
                  <div className="summary-question" key={question.id}>
                    <span
                      className={`summary-question-number${wasAnswered ? ' is-answered' : ''}`}
                    >
                      {wasAnswered ? (<Check size={13} aria-hidden="true" />) : index + 1}
                    </span>
                    <div>
                      <p className="summary-question-title">{question.prompt}</p>
                      <p className="summary-question-meta">
                        {question.topic} · {question.difficulty} · {question.focus}
                      </p>
                    </div>
                    <span className="summary-question-state">
                      {wasAnswered ? 'Answered' : 'Not marked'}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="summary-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setSummary(null)}
              >
                Start another session
              </button>
              <Link to="/mock-interview" className="btn btn-secondary">
                View progress history
              </Link>
            </div>
          </section>
        </div>
      </section>
    )
  }

  /* ---------- Full UI when there is an active session ---------- */
  if (session) {
    const remainingSeconds = session.endTime
      ? Math.max(0, Math.ceil((session.endTime - now) / 1000))
      : 0

    return (
      <section className="mock-interview-page">
        <div className="page-container mock-interview-container">
          <header className="page-head interview-active-head">
            <div>
              <p className="page-eyebrow">Live session</p>
              <h1 className="page-title">Mock Interview</h1>
              <p className="page-subtitle">
                {topic === 'All' ? 'Mixed topics' : topicLabel} ·{' '}
                {difficulty === 'All' ? 'Mixed difficulty' : difficultyLabel} ·{' '}
                {session.questions.length} questions
              </p>
            </div>

            <div
              className="interview-timer"
              role="timer"
              aria-label={`${formatClock(remainingSeconds)} remaining`}
            >
              <span className="interview-timer-value">
                {formatClock(remainingSeconds)}
              </span>
              <span className="interview-timer-label">
                <Clock size={13} aria-hidden="true" />
                remaining
              </span>
            </div>
          </header>

          <div className="interview-layout">
            <section
              className="question-panel"
              aria-labelledby="current-question-title"
            >
              <div className="question-meta">
                <span className="question-counter">
                  Question {session.currentIndex + 1} of{' '}
                  {session.questions.length}
                </span>
                <DifficultyBadge difficulty={currentQuestion?.difficulty} />
                <span className="question-topic">{currentQuestion?.topic}</span>
              </div>

              <h2 className="question-title" id="current-question-title">
                {currentQuestion?.prompt}
              </h2>

              <p className="question-focus">
                <Info size={14} aria-hidden="true" />
                Focus: {currentQuestion?.focus || ''}
              </p>

              <div className="question-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => goToQuestion(session.currentIndex - 1)}
                  disabled={session.currentIndex === 0}
                >
                  <ChevronLeft size={16} aria-hidden="true" />
                  Previous
                </button>
                <button
                  type="button"
                  className={`btn ${
                    session.answers[currentQuestion.id]
                      ? 'btn-soft'
                      : 'btn-primary'
                  }`}
                  onClick={() => toggleAnswered(currentQuestion.id)}
                  aria-pressed={Boolean(session.answers[currentQuestion.id])}
                >
                  <Check size={16} aria-hidden="true" />
                  {session.answers[currentQuestion.id]
                    ? 'Answered'
                    : 'Mark as answered'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => goToQuestion(session.currentIndex + 1)}
                  disabled={
                    session.currentIndex === session.questions.length - 1
                  }
                >
                  Next
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              </div>
            </section>

            <aside
              className="question-side"
              aria-labelledby="question-nav-title"
            >
              <h2 className="section-title" id="question-nav-title">
                Questions
              </h2>

              <div className="question-nav-grid">
                {session.questions.map((question, index) => {
                  const isCurrent = index === session.currentIndex
                  const isAnswered = Boolean(session.answers && session.answers[question.id])

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
                      {isAnswered && (
                        <Check size={11} aria-hidden="true" />
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="interview-side-progress">
                <span>
                  {answeredCount} of {session.questions.length} marked answered
                </span>
                <span aria-hidden="true">
                  {Math.round(
                    (answeredCount / session.questions.length) * 100,
                  )}
                  %
                </span>
              </div>

              <button
                type="button"
                className="btn btn-secondary end-interview-btn"
                onClick={() => setConfirmOpen(true)}
              >
                End interview
              </button>

              <p className="interview-side-note">
                <ShieldAlert size={14} aria-hidden="true" />
                This is a backend-backed session. Answers and timing are saved
                to your account. Refreshing or navigating away will preserve the
                session state. The timer is governed by server timestamps.
              </p>
            </aside>
          </div>
        </div>

        <Modal
          open={confirmOpen}
          title="End this interview?"
          description="The timer stops immediately and the session is submitted once."
          onClose={() => setConfirmOpen(false)}
          footer={
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setConfirmOpen(false)}
              >
                Keep going
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => endSession('manual')}
              >
                End and view summary
              </button>
            </>
          }
        >
          <p>
            You have marked <strong>{answeredCount}</strong> of{' '}
            <strong>{session.questions.length}</strong> questions as answered.
          </p>
          <p>
            Questions you do not mark will not be treated as wrong, but they
            will not contribute to the completion score. An ended session cannot
            be submitted a second time.
          </p>
        </Modal>
      </section>
    )
  }

  /* ---------- Startup page (no active session) ---------- */
  return (
    <section className="mock-interview-page">
      <div className="page-container mock-interview-container">
        <header className="page-head">
          <div>
            <p className="page-eyebrow">Interview practice</p>
            <h1 className="page-title">Mock Interview</h1>
            <p className="page-subtitle">
              Prepare for your real technical interview with a fixed 45-minute
              session.
            </p>
          </div>
        </header>

        <section className="interview-setup" aria-labelledby="setup-title">
          <h2 className="setup-title" id="setup-title">
            Session setup
          </h2>

          <div className="setup-grid">
            <div className="setup-item">
              <span className="setup-icon-wrap" aria-hidden="true">
                <Zap size={18} />
              </span>
              <span className="setup-label" id="duration-label">
                Duration
              </span>
              <div className="duration-row">
                <span className="setup-value">45 min</span>
                <span className="setup-fixed">Fixed</span>
              </div>
            </div>

            <div className="setup-item">
              <span className="setup-icon-wrap" aria-hidden="true">
                <Calendar size={18} />
              </span>
              <label className="setup-label" htmlFor="interview-difficulty">
                Difficulty
              </label>
              <select
                id="interview-difficulty"
                className="select"
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value)}
              >
                <option value="All">All difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div className="setup-item">
              <span className="setup-icon-wrap" aria-hidden="true">
                <Flag size={18} />
              </span>
              <label className="setup-label" htmlFor="interview-topic">
                Topic
              </label>
              <select
                id="interview-topic"
                className="select"
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
              >
                <option value="All">All topics</option>
                <option value="DSA">Data Structures & Algorithms</option>
                <option value="Java OOP">Java OOP</option>
                <option value="System Design">System Design</option>
              </select>
            </div>
          </div>

          <div className="setup-footer">
            <p className="setup-summary">
              <span className="setup-chip">
                <Timer size={13} aria-hidden="true" />
                {SESSION_DURATION_MINUTES} min
              </span>
              <span className="setup-chip">
                {plannedQuestions.length} questions
              </span>
              <span className="setup-chip">
                {difficulty === 'All' ? 'All difficulties' : difficulty}
              </span>
              <span className="setup-chip">
                {topic === 'All' ? 'All topics' : topic}
              </span>
            </p>
            <button
              type="button"
              className="btn btn-primary start-interview-btn"
              onClick={startSession}
              disabled={creating}
            >
              Start mock interview
            </button>
          </div>
        </section>

        <section className="interview-rules" aria-labelledby="rules-title">
          <h2 className="rules-title" id="rules-title">
            Interview instructions
          </h2>
          <ul className="rules-list">
            <li>
              The session lasts a fixed 45 minutes. The countdown starts only
              after you press Start.
            </li>
            <li>
              You will see {SESSION_QUESTION_COUNT} prompts. Move between them
              freely and mark a question answered once you have talked it
              through.
            </li>
            <li>
              The scorecard counts only the questions you marked answered. It is
              a completion measure, not an automatic correctness judgement.
            </li>
            <li>
              This session is backed by your account. Answers and timing are
              saved server-side. Refreshing or navigating away will preserve
              the session state.
            </li>
            <li>
              No camera, microphone, recording or anti-cheat monitoring is
              performed. It cannot verify how you prepare.
            </li>
          </ul>
        </section>

        <p className="interview-disclaimer" role="note">
          <CheckCircle size={15} aria-hidden="true" />
          Sessions you finish appear in your interview history. No account,
          backend or external service receives them during the session.
        </p>
      </div>
    </section>
  )
}