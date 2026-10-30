import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
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
import {
  buildSessionQuestions,
  INTERVIEW_DIFFICULTIES,
  INTERVIEW_TOPICS,
  SESSION_DURATION_MINUTES,
  SESSION_QUESTION_COUNT,
} from '../data/interviewQuestions'
import { formatClock } from '../lib/date'
import { useAppState } from '../state/appContext'
import './MockInterview.css'

export default function MockInterviewPage() {
  const { saveInterview } = useAppState()
  const [difficulty, setDifficulty] = useState('All')
  const [topic, setTopic] = useState('All')
  const [session, setSession] = useState(null)
  const [summary, setSummary] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const sessionRef = useRef(null)

  const plannedQuestions = useMemo(
    () => buildSessionQuestions({ difficulty, topic }),
    [difficulty, topic],
  )

  useEffect(() => {
    sessionRef.current = session
  }, [session])

  const activeSessionId = session ? session.id : null

  useEffect(() => {
    if (!activeSessionId) return undefined

    const timer = window.setInterval(() => setNow(Date.now()), 1000)

    return () => window.clearInterval(timer)
  }, [activeSessionId])

  /* Warn on refresh/close. Internal navigation discards the local
     session, and unmounting clears the interval above. */
  useEffect(() => {
    if (!activeSessionId) return undefined

    const onBeforeUnload = (event) => {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [activeSessionId])

  const endSession = useCallback(
    (reason) => {
      const current = sessionRef.current
      if (!current || current.status !== 'active') return

      /* Clear the ref immediately so a timeout and a confirmation
         click can never submit the same session twice. */
      sessionRef.current = null
      setSession(null)
      setConfirmOpen(false)

      const endedAt = new Date()
      const startedAt = new Date(current.startedAt)
      const answeredCount = current.questions.filter(
        (question) => current.answers[question.id],
      ).length
      const score = Math.round(
        (answeredCount / current.questions.length) * 100,
      )
      const elapsedSeconds = Math.max(
        0,
        Math.min(
          current.durationMinutes * 60,
          Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000),
        ),
      )

      const record = {
        id: current.id,
        difficulty: current.difficulty,
        topic: current.topic,
        durationMinutes: current.durationMinutes,
        startedAt: current.startedAt,
        endedAt: endedAt.toISOString(),
        endReason: reason,
        questionIds: current.questions.map((question) => question.id),
        answers: current.answers,
        answeredCount,
        score,
        elapsedSeconds,
      }

      saveInterview(record)
      setSummary({ ...record, questions: current.questions })
    },
    [saveInterview],
  )

  const remainingSeconds = session
    ? Math.max(0, Math.ceil((session.endsAt - now) / 1000))
    : 0

  useEffect(() => {
    if (session && remainingSeconds === 0) {
      endSession('time')
    }
  }, [endSession, remainingSeconds, session])

  const startSession = () => {
    const startedAt = new Date()
    const questions = buildSessionQuestions({ difficulty, topic })
    const nextSession = {
      id: `interview-${startedAt.getTime()}-${Math.random()
        .toString(36)
        .slice(2, 7)}`,
      difficulty,
      topic,
      durationMinutes: SESSION_DURATION_MINUTES,
      startedAt: startedAt.toISOString(),
      endsAt: startedAt.getTime() + SESSION_DURATION_MINUTES * 60 * 1000,
      questions,
      currentIndex: 0,
      answers: {},
      status: 'active',
    }

    sessionRef.current = nextSession
    setSession(nextSession)
    setSummary(null)
    setConfirmOpen(false)
    setNow(startedAt.getTime())
  }

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
    ? session.questions.filter((question) => session.answers[question.id])
        .length
    : 0

  const topicLabel =
    INTERVIEW_TOPICS.find((option) => option.value === topic)?.label || topic
  const difficultyLabel =
    INTERVIEW_DIFFICULTIES.find((option) => option.value === difficulty)
      ?.label || difficulty

  if (session) {
    const currentQuestion = session.questions[session.currentIndex]

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
                <DifficultyBadge difficulty={currentQuestion.difficulty} />
                <span className="question-topic">{currentQuestion.topic}</span>
              </div>

              <h2 className="question-title" id="current-question-title">
                {currentQuestion.prompt}
              </h2>

              <p className="question-focus">
                <Info size={14} aria-hidden="true" />
                Focus: {currentQuestion.focus}
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
                  const isAnswered = Boolean(session.answers[question.id])

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
                This is a frontend prototype. Refreshing or navigating away
                discards the active session; the timer interval is cleaned up
                on unmount. No anti-cheat monitoring is performed.
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
            Questions you did not mark will not be treated as wrong, but they
            will not contribute to the completion score. An ended session cannot
            be submitted a second time.
          </p>
        </Modal>
      </section>
    )
  }

  if (summary) {
    const timeUsed = formatClock(summary.elapsedSeconds)
    const unanswered = summary.questions.length - summary.answeredCount

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
                  {summary.answeredCount} of {summary.questions.length} marked
                  answered
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
              This score reflects only how many questions you marked as
              answered during the session. Nothing is graded automatically, and
              no visibility or anti-cheat monitoring is performed.
            </p>

            <h2 className="section-title">Questions covered</h2>
            <div className="summary-questions">
              {summary.questions.map((question, index) => {
                const wasAnswered = Boolean(summary.answers[question.id])

                return (
                  <div className="summary-question" key={question.id}>
                    <span
                      className={`summary-question-number${wasAnswered ? ' is-answered' : ''}`}
                    >
                      {wasAnswered ? (
                        <Check size={13} aria-hidden="true" />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <div>
                      <p className="summary-question-title">{question.prompt}</p>
                      <p className="summary-question-meta">
                        {question.topic} · {question.difficulty} ·{' '}
                        {question.focus}
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
              <Link to="/progress" className="btn btn-secondary">
                View progress history
              </Link>
            </div>
          </section>
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
                {INTERVIEW_DIFFICULTIES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
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
                {INTERVIEW_TOPICS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
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
              Refreshing or navigating away from this page discards the active
              session. Only completed sessions are stored, in this browser.
            </li>
            <li>
              This prototype has no camera, microphone, recording or anti-cheat
              monitoring. It cannot verify how you prepare.
            </li>
          </ul>
        </section>

        <p className="interview-disclaimer" role="note">
          <CheckCircle size={15} aria-hidden="true" />
          Sessions you finish appear in Progress and are saved locally. No
          account, backend or external service receives them.
        </p>
      </div>
    </section>
  )
}
