import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  Clock,
  Code2,
  EyeOff,
  Info,
  RotateCcw,
  ShieldCheck,
  Timer,
  Trophy,
  XCircle,
} from 'lucide-react'
import DifficultyBadge from '../components/DifficultyBadge'
import PageState from '../components/PageState'
import { getInterviewResult } from '../api/mockInterviewService'
import { formatClock, formatDate } from '../lib/date'
import { difficultyLabel } from '../lib/format'
import './MockInterview.css'

function formatDuration(seconds) {
  const safe = Math.max(0, Math.floor(Number(seconds) || 0))
  if (safe < 3600) return formatClock(safe)
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  return `${hours}h ${minutes}m`
}

function statusLabel(status) {
  if (status === 'COMPLETED') return 'Completed'
  if (status === 'EXPIRED') return 'Timer expired'
  if (status === 'CANCELLED') return 'Cancelled'
  return 'In progress'
}

export default function InterviewResult() {
  const { sessionId } = useParams()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    getInterviewResult(sessionId)
      .then((data) => active && setResult(data))
      .catch((requestError) => active && setError(requestError))
      .finally(() => active && setLoading(false))

    return () => {
      active = false
    }
  }, [sessionId])

  if (loading) {
    return (
      <section className="mock-interview-page">
        <div className="page-container mock-interview-container">
          <PageState
            variant="loading"
            title="Loading interview result"
            description="Fetching your server-generated completion summary."
          />
        </div>
      </section>
    )
  }

  if (error || !result) {
    const cancelled = error?.message?.toLowerCase().includes('cancelled')
    const inProgress = error?.message?.toLowerCase().includes('in progress')

    return (
      <section className="mock-interview-page">
        <div className="page-container mock-interview-container">
          <PageState
            variant="error"
            title={
              cancelled
                ? 'This interview was cancelled'
                : inProgress
                  ? 'This interview is still in progress'
                  : 'Interview result unavailable'
            }
            description={
              cancelled
                ? 'Cancelled sessions do not generate a result or achievement progress.'
                : inProgress
                  ? 'Open the live session to continue answering questions.'
                  : error?.message || 'The result could not be loaded.'
            }
          >
            <div className="result-error-actions">
              {inProgress ? (
                <Link
                  to={`/mock-interview/sessions/${sessionId}`}
                  className="btn btn-primary"
                >
                  Resume session
                </Link>
              ) : (
                <Link to="/mock-interview" className="btn btn-primary">
                  Start a new interview
                </Link>
              )}
              <Link to="/mock-interview/history" className="btn btn-secondary">
                View history
              </Link>
            </div>
          </PageState>
        </div>
      </section>
    )
  }

  const completion = Math.round(Number(result.completionPercentage) || 0)
  const measured = formatDuration(result.measuredTimeSeconds)
  const estimated = formatDuration(result.estimatedTimeSeconds)
  const measuredDelta =
    Number(result.measuredTimeSeconds) - Number(result.estimatedTimeSeconds)

  return (
    <section className="mock-interview-page">
      <div className="page-container mock-interview-container">
        <Link to="/mock-interview/history" className="back-link">
          <ArrowLeft size={15} aria-hidden="true" />
          Interview history
        </Link>

        <section className="interview-summary" aria-labelledby="result-title">
          <div className="summary-hero">
            <span className="summary-icon" aria-hidden="true">
              {result.status === 'EXPIRED' ? (
                <Clock size={24} />
              ) : (
                <Trophy size={24} />
              )}
            </span>
            <div className="result-hero-copy">
              <div className="result-status-row">
                <span className="page-eyebrow">Session result</span>
                <span
                  className={`result-status ${result.status === 'EXPIRED' ? 'is-expired' : 'is-completed'}`}
                >
                  {result.status === 'EXPIRED' ? (
                    <Clock size={12} aria-hidden="true" />
                  ) : (
                    <Check size={12} aria-hidden="true" />
                  )}
                  {statusLabel(result.status)}
                </span>
              </div>
              <h1 className="page-title" id="result-title">
                {completion}% completion
              </h1>
              <p className="page-subtitle">
                {result.categoryLabel} · {difficultyLabel(result.difficulty)} ·{' '}
                {result.questionsAssigned} questions
              </p>
            </div>
          </div>

          <div className="summary-grid result-summary-grid">
            <div className="summary-stat">
              <span className="summary-stat-label">Questions answered</span>
              <span className="summary-stat-value">
                {result.questionsAnswered}/{result.questionsAssigned}
              </span>
              <span className="summary-stat-note">
                answered questions ÷ assigned
              </span>
            </div>
            <div className="summary-stat">
              <span className="summary-stat-label">Measured time</span>
              <span className="summary-stat-value">{measured}</span>
              <span className="summary-stat-note">server-observed session time</span>
            </div>
            <div className="summary-stat">
              <span className="summary-stat-label">Estimated time</span>
              <span className="summary-stat-value">{estimated}</span>
              <span className="summary-stat-note">
                difficulty-weighted estimate
              </span>
            </div>
            <div className="summary-stat">
              <span className="summary-stat-label">Focus losses</span>
              <span className="summary-stat-value">
                {result.focusLossCount}
              </span>
              <span className="summary-stat-note">
                {result.focusLossCount > 0
                  ? 'recorded with your consent'
                  : 'no consented events recorded'}
              </span>
            </div>
          </div>

          <p className="summary-disclaimer" role="note">
            <Info size={15} aria-hidden="true" />
            Completion measures how many assigned questions you answered — it is
            not an automatic correctness score. Measured time is observed by the
            server; estimated time is a difficulty-weighted guide, not a target.
            {measuredDelta > 60
              ? ` You took about ${formatDuration(measuredDelta)} longer than the estimate.`
              : measuredDelta < -60
                ? ` You finished about ${formatDuration(Math.abs(measuredDelta))} faster than the estimate.`
                : ''}
          </p>

          {result.overallFeedback && (
            <div className="result-feedback">
              <h2 className="section-title">Feedback</h2>
              <p>{result.overallFeedback}</p>
            </div>
          )}

          <div className="result-meta-row">
            <span className="discussion-meta-item">
              <Timer size={13} aria-hidden="true" />
              Started {formatDate(result.startedAt)}
            </span>
            {result.completedAt && (
              <span className="discussion-meta-item">
                <Clock size={13} aria-hidden="true" />
                Finished {formatDate(result.completedAt)}
              </span>
            )}
            <span className="discussion-meta-item">
              <ShieldCheck size={13} aria-hidden="true" />
              Private to your account
            </span>
          </div>

          <h2 className="section-title">Questions covered</h2>
          <div className="summary-questions">
            {(result.questions || []).map((question, index) => {
              const answer = question.answer
              const answered = Boolean(answer?.answered)

              return (
                <article className="result-question" key={question.id}>
                  <div className="result-question-head">
                    <span
                      className={`summary-question-number${answered ? ' is-answered' : ''}`}
                    >
                      {answered ? (
                        <Check size={13} aria-hidden="true" />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <div>
                      <h3 className="summary-question-title">
                        {question.title}
                      </h3>
                      <p className="summary-question-meta">
                        {question.topic} ·{' '}
                        {difficultyLabel(question.difficulty)}
                      </p>
                    </div>
                    <span className="summary-question-state">
                      {answered ? 'Answered' : 'No answer'}
                    </span>
                  </div>

                  {answer?.answerText && (
                    <div className="result-answer">
                      <span className="result-answer-label">Notes</span>
                      <p>{answer.answerText}</p>
                    </div>
                  )}

                  {answer?.codeText && (
                    <div className="result-answer">
                      <span className="result-answer-label">
                        <Code2 size={13} aria-hidden="true" />
                        {answer.language || 'Code'} draft
                      </span>
                      <pre className="result-code">{answer.codeText}</pre>
                    </div>
                  )}

                  {!answer?.answerText && !answer?.codeText && (
                    <p className="result-no-answer">
                      <XCircle size={13} aria-hidden="true" />
                      No text or code was saved for this question.
                    </p>
                  )}
                </article>
              )
            })}
          </div>

          <div className="summary-actions">
            <Link to="/mock-interview" className="btn btn-primary">
              <RotateCcw size={16} aria-hidden="true" />
              Start another interview
            </Link>
            <Link to="/mock-interview/history" className="btn btn-secondary">
              View all results
            </Link>
          </div>
        </section>

        <p className="mock-setup-note">
          <EyeOff size={14} aria-hidden="true" />
          Results never trigger code execution and are only visible to your
          account.
        </p>
      </div>
    </section>
  )
}
