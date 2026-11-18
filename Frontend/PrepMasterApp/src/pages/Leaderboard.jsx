import { useEffect, useState } from 'react'
import {
  Activity,
  CalendarDays,
  Flame,
  Info,
  Medal,
  Trophy,
  Users,
  Zap,
} from 'lucide-react'
import EmptyState from '../components/EmptyState'
import PageState from '../components/PageState'
import Pagination from '../components/Pagination'
import { getLeaderboard } from '../api/leaderboardService'
import { formatDate } from '../lib/date'
import './Leaderboard.css'

const PAGE_SIZE = 10

const PERIODS = [
  { value: 'WEEKLY', label: 'This week' },
  { value: 'MONTHLY', label: 'This month' },
  { value: 'ALL_TIME', label: 'All time' },
]

const METRICS = [
  { value: 'XP', label: 'XP', icon: Zap },
  { value: 'ACTIVITY', label: 'Activity', icon: Activity },
  { value: 'STREAK', label: 'Streak', icon: Flame },
]

function metricValue(entry, metric) {
  if (metric === 'ACTIVITY') {
    return `${Number(entry.value).toLocaleString()} task${Number(entry.value) === 1 ? '' : 's'}`
  }
  if (metric === 'STREAK') {
    return `${Number(entry.value).toLocaleString()} day${Number(entry.value) === 1 ? '' : 's'}`
  }
  return `${Number(entry.value).toLocaleString()} XP`
}

function displayName(entry) {
  return entry.displayName || entry.username || 'PrepMaster learner'
}

function rankClass(rank) {
  if (rank === 1) return 'is-first'
  if (rank === 2) return 'is-second'
  if (rank === 3) return 'is-third'
  return ''
}

export default function Leaderboard() {
  const [period, setPeriod] = useState('WEEKLY')
  const [metric, setMetric] = useState('XP')
  const [page, setPage] = useState(0)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    getLeaderboard({ period, metric, page, size: PAGE_SIZE })
      .then((board) => {
        if (active) setData(board)
      })
      .catch((requestError) => {
        if (active) {
          setData(null)
          setError(requestError)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [metric, page, period, reloadToken])

  const entries = data?.content || []
  const totalElements = Number(data?.totalElements) || 0
  const totalPages = Number(data?.totalPages) || 0

  const choosePeriod = (value) => {
    setPeriod(value)
    setPage(0)
  }

  const chooseMetric = (value) => {
    setMetric(value)
    setPage(0)
  }

  return (
    <section className="leaderboard-page">
      <div className="page-container">
        <header className="page-head">
          <div>
            <p className="page-eyebrow">Rankings</p>
            <h1 className="page-title">Leaderboard</h1>
            <p className="page-subtitle">
              Server-calculated XP, activity and streak rankings across
              PrepMaster learners.
            </p>
          </div>
          <span className="community-count">
            <Users size={13} aria-hidden="true" /> {totalElements} learner
            {totalElements === 1 ? '' : 's'}
          </span>
        </header>

        <p className="leaderboard-note" role="note">
          <strong>How rankings work:</strong> the backend computes every value
          from stored activity for the selected period. Ties are broken
          deterministically by metric value, then XP, completed tasks, username
          and user id. The browser never sends XP or rank.
        </p>

        <div className="leaderboard-toolbar">
          <div
            className="leaderboard-tabs"
            role="group"
            aria-label="Leaderboard period"
          >
            {PERIODS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`leaderboard-tab${period === option.value ? ' active' : ''}`}
                onClick={() => choosePeriod(option.value)}
                aria-pressed={period === option.value}
              >
                <CalendarDays size={14} aria-hidden="true" />
                {option.label}
              </button>
            ))}
          </div>

          <div
            className="leaderboard-tabs"
            role="group"
            aria-label="Leaderboard metric"
          >
            {METRICS.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.value}
                  type="button"
                  className={`leaderboard-tab${metric === option.value ? ' active' : ''}`}
                  onClick={() => chooseMetric(option.value)}
                  aria-pressed={metric === option.value}
                >
                  <Icon size={14} aria-hidden="true" />
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        {data?.from && data?.to && (
          <p className="leaderboard-range">
            <CalendarDays size={13} aria-hidden="true" />
            {formatDate(data.from)} – {formatDate(data.to)}
            <span>· {PERIODS.find((item) => item.value === period)?.label}</span>
          </p>
        )}

        {loading ? (
          <PageState
            variant="loading"
            title="Calculating rankings"
            description="The backend is aggregating XP, tasks and streaks for this period."
          />
        ) : error ? (
          <PageState
            variant="error"
            title="Leaderboard could not be loaded"
            description={error.message}
            onRetry={() => setReloadToken((current) => current + 1)}
          />
        ) : entries.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No ranked learners yet"
            description="Complete daily-plan tasks or interview sessions to appear on the board."
          />
        ) : (
          <div className="leaderboard-card">
            <div className="leaderboard-table-wrap">
              <table className="leaderboard-table">
                <caption className="visually-hidden">
                  Leaderboard ranked by {metric.toLowerCase()} for the selected
                  period
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Rank</th>
                    <th scope="col">Learner</th>
                    <th scope="col" className="leaderboard-number">
                      {metric === 'XP'
                        ? 'XP'
                        : metric === 'ACTIVITY'
                          ? 'Tasks'
                          : 'Streak'}
                    </th>
                    <th scope="col" className="leaderboard-number">
                      XP
                    </th>
                    <th scope="col" className="leaderboard-number">
                      Tasks
                    </th>
                    <th scope="col" className="leaderboard-number">
                      Streak
                    </th>
                    <th scope="col" className="leaderboard-number">
                      Level
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => {
                    const initial = displayName(entry).charAt(0).toUpperCase()

                    return (
                      <tr
                        key={entry.userId}
                        className={`leaderboard-row${entry.currentUser ? ' is-current' : ''}`}
                      >
                        <td>
                          <span
                            className={`leaderboard-rank ${rankClass(entry.rank)}`}
                          >
                            {entry.rank <= 3 ? (
                              <Medal size={15} aria-hidden="true" />
                            ) : null}
                            {entry.rank}
                          </span>
                        </td>
                        <td>
                          <span className="leaderboard-user">
                            {entry.avatarUrl ? (
                              <img
                                src={entry.avatarUrl}
                                alt=""
                                className="leaderboard-avatar"
                                width={32}
                                height={32}
                              />
                            ) : (
                              <span
                                className="leaderboard-avatar leaderboard-avatar-fallback"
                                aria-hidden="true"
                              >
                                {initial}
                              </span>
                            )}
                            <span className="leaderboard-user-copy">
                              <span className="leaderboard-name">
                                {displayName(entry)}
                                {entry.currentUser ? ' (you)' : ''}
                              </span>
                              <span className="leaderboard-username">
                                @{entry.username}
                              </span>
                            </span>
                          </span>
                        </td>
                        <td className="leaderboard-number leaderboard-metric">
                          {metricValue(entry, metric)}
                        </td>
                        <td className="leaderboard-number">
                          {Number(entry.xp).toLocaleString()}
                        </td>
                        <td className="leaderboard-number">
                          {Number(entry.completedTasks).toLocaleString()}
                        </td>
                        <td className="leaderboard-number">
                          {entry.currentStreak}d
                        </td>
                        <td className="leaderboard-number">
                          Lv {entry.level}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              page={Number(data?.page) || 0}
              totalPages={totalPages}
              onChange={setPage}
              disabled={loading}
              label="Leaderboard pagination"
            />
          </div>
        )}

        <p className="leaderboard-footnote">
          <Info size={14} aria-hidden="true" />
          Weekly and monthly boards use rolling windows (7 and 30 days). The
          all-time board includes all recorded activity. Private data such as
          email addresses is never included.
        </p>
      </div>
    </section>
  )
}
