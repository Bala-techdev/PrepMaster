import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Focus,
  Play,
  Timer,
  Trophy,
  XCircle,
} from 'lucide-react'
import EmptyState from '../components/EmptyState'
import PageState from '../components/PageState'
import Pagination from '../components/Pagination'
import {
  getInterviewHistory,
  getInterviewPerformance,
} from '../api/mockInterviewService'
import { formatDate } from '../lib/date'
import { difficultyLabel, formatMinutes } from '../lib/format'
import './MockInterview.css'

const PAGE_SIZE = 8

function statusView(status) {
  if (status === 'COMPLETED') {
    return { label: 'Completed', tone: 'is-completed' }
  }
  if (status === 'EXPIRED') {
    return { label: 'Timer expired', tone: 'is-expired' }
  }
  if (status === 'CANCELLED') {
    return { label: 'Cancelled', tone: 'is-cancelled' }
  }
  return { label: 'In progress', tone: 'is-progress' }
}

export default function MockInterviewHistory() {
  const [data, setData] = useState(null)
  const [performance, setPerformance] = useState(null)
  const [page, setPage] = useState(0)
  const [reloadToken, setReloadToken] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    Promise.all([
      getInterviewHistory({ page, size: PAGE_SIZE }),
      getInterviewPerformance(),
    ])
      .then(([history, stats]) => {
        if (!active) return
        setData(history)
        setPerformance(stats)
      })
      .catch((requestError) => {
        if (active) setError(requestError)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [page, reloadToken])

  const content = data?.content || []
  const totalElements = Number(data?.totalElements) || 0
  const totalPages = Number(data?.totalPages) || 0

  return (
    <section className="mock-interview-page">
      <div className="page-container mock-interview-container">
        <Link to="/mock-interview" className="back-link">
          <ArrowLeft size={15} aria-hidden="true" />
          Mock interview setup
        </Link>

        <header className="page-head">
          <div>
            <p className="page-eyebrow">Mock interviews</p>
            <h1 className="page-title">Interview history</h1>
            <p className="page-subtitle">
              Every backend-backed session, with completion metrics and focus
              monitoring recorded only when you opted in.
            </p>
          </div>
          <Link to="/mock-interview" className="btn btn-primary">
            <Play size={16} aria-hidden="true" />
            New interview
          </Link>
        </header>

        {performance && (
          <section
            className="mock-performance mock-history-summary"
            aria-label="Interview performance summary"
          >
            <div className="mock-performance-grid">
              <div className="summary-stat">
                <span className="summary-stat-label">Total sessions</span>
                <span className="summary-stat-value">
                  {performance.totalSessions}
                </span>
                <span className="summary-stat-note">
                  {performance.inProgressSessions} in progress
                </span>
              </div>
              <div className="summary-stat">
                <span className="summary-stat-label">Completed</span>
                <span className="summary-stat-value">
                  {performance.completedSessions}
                </span>
                <span className="summary-stat-note">
                  {performance.expiredSessions} expired ·{' '}
                  {performance.cancelledSessions} cancelled
                </span>
              </div>
              <div className="summary-stat">
                <span className="summary-stat-label">Avg. completion</span>
                <span className="summary-stat-value">
                  {Math.round(performance.averageCompletionPercentage || 0)}%
                </span>
                <span className="summary-stat-note">
                  {formatMinutes(
                    Math.round((performance.averageMeasuredTimeSeconds || 0) / 60),
                  )}{' '}
                  average measured time
                </span>
              </div>
              <div className="summary-stat">
                <span className="summary-stat-label">Focus losses</span>
                <span className="summary-stat-value">
                  {performance.totalFocusLossEvents}
                </span>
                <span className="summary-stat-note">consented events only</span>
              </div>
            </div>
          </section>
        )}

        {loading ? (
          <PageState
            variant="loading"
            title="Loading interview history"
            description="Fetching your sessions and performance summary."
          />
        ) : error ? (
          <PageState
            variant="error"
            title="Interview history could not be loaded"
            description={error.message}
            onRetry={() => setReloadToken((current) => current + 1)}
          />
        ) : content.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No mock interviews yet"
            description="Start a timed session from a template. Results and completion metrics will appear here."
          >
            <Link to="/mock-interview" className="btn btn-primary">
              Start your first interview
            </Link>
          </EmptyState>
        ) : (
          <>
            <div className="mock-section-head history-list-head">
              <div>
                <h2 className="setup-title">Sessions</h2>
                <p className="setup-help">
                  {totalElements} session{totalElements === 1 ? '' : 's'} on
                  record
                </p>
              </div>
              <span className="mock-count">
                Page {Number(data?.page || 0) + 1}
              </span>
            </div>

            <ul className="history-list">
              {content.map((item) => {
                const status = statusView(item.status)
                const score =
                  item.score === null || item.score === undefined
                    ? null
                    : Math.round(Number(item.score))

                return (
                  <li className="history-item" key={item.id}>
                    <div className="history-main">
                      <div className="history-top">
                        <span className="discussion-category">
                          {item.categoryLabel}
                        </span>
                        <span className={`history-status ${status.tone}`}>
                          {item.status === 'COMPLETED' ? (
                            <CheckCircle size={12} aria-hidden="true" />
                          ) : item.status === 'CANCELLED' ? (
                            <XCircle size={12} aria-hidden="true" />
                          ) : (
                            <Clock size={12} aria-hidden="true" />
                          )}
                          {status.label}
                        </span>
                      </div>
                      <p className="history-meta">
                        {difficultyLabel(item.difficulty)} ·{' '}
                        {formatMinutes(item.durationMinutes)} · started{' '}
                        {formatDate(item.startedAt)}
                        {item.completedAt
                          ? ` · finished ${formatDate(item.completedAt)}`
                          : ''}
                      </p>
                    </div>

                    <div className="history-stats">
                      <span className="discussion-meta-item">
                        <Focus size={13} aria-hidden="true" />
                        {item.questionsAnswered}/{item.questionCount} answered
                      </span>
                      <span className="history-score">
                        {score === null ? '—' : `${score}%`}
                      </span>
                    </div>

                    <div className="history-action">
                      {item.status === 'IN_PROGRESS' ? (
                        <Link
                          to={`/mock-interview/sessions/${item.id}`}
                          className="btn btn-primary"
                        >
                          Resume
                        </Link>
                      ) : item.status === 'CANCELLED' ? (
                        <span className="history-no-result">No result</span>
                      ) : (
                        <Link
                          to={`/mock-interview/results/${item.id}`}
                          className="btn btn-secondary"
                        >
                          <Timer size={15} aria-hidden="true" />
                          View result
                        </Link>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>

            <Pagination
              page={Number(data?.page) || 0}
              totalPages={totalPages}
              onChange={setPage}
              disabled={loading}
              label="Interview history pagination"
            />
          </>
        )}

        <p className="mock-setup-note">
          <Trophy size={14} aria-hidden="true" />
          Completion is answered questions ÷ assigned questions. It does not
          judge correctness, and cancelled sessions do not generate results.
        </p>
      </div>
    </section>
  )
}
