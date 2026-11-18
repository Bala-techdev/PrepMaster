import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Award,
  Check,
  Flame,
  Info,
  Lock,
  RefreshCw,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-react'
import EmptyState from '../components/EmptyState'
import PageState from '../components/PageState'
import ProgressBar from '../components/ProgressBar'
import { getAchievementOverview } from '../api/achievementService'
import { formatDate } from '../lib/date'
import './Achievements.css'

const CRITERIA_LABELS = {
  TASKS_COMPLETED: 'Daily-plan tasks completed',
  STREAK: 'Longest daily streak',
  TOTAL_XP: 'Total XP earned',
  DSA_SOLVED: 'DSA questions solved',
  CODE_SUBMISSIONS: 'Practice submissions',
  MOCK_COMPLETED: 'Mock interviews completed',
  CATEGORIES_EXPLORED: 'Learning categories explored',
  ACTIVE_DAYS: 'Active days recorded',
  MANUAL: 'Manual award',
}

const CODE_ICONS = {
  STREAK_30: Flame,
  DSA_100: Target,
  XP_500: Zap,
  MOCK_FIRST: Trophy,
  MOCK_10: Award,
}

function criteriaLabel(value) {
  return CRITERIA_LABELS[value] || String(value || 'Progress').replaceAll('_', ' ')
}

function formatProgress(item) {
  const progress = Math.max(0, Number(item.progress) || 0)
  const target = Math.max(1, Number(item.target) || 1)
  return `${progress.toLocaleString()} / ${target.toLocaleString()}`
}

function percentFor(item) {
  const target = Math.max(1, Number(item.target) || 1)
  const progress = Math.max(0, Number(item.progress) || 0)
  if (item.earned) return 100
  return Math.min(100, Math.round((progress / target) * 100))
}

export default function Achievements() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadToken, setReloadToken] = useState(0)
  const [filter, setFilter] = useState('ALL')

  const load = useCallback(() => {
    setReloadToken((current) => current + 1)
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    getAchievementOverview()
      .then((overview) => {
        if (active) setData(overview)
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
  }, [reloadToken])

  const achievements = data?.achievements || []
  const earnedCount = Number(data?.earnedCount) || 0
  const totalCount = Number(data?.totalCount) || achievements.length
  const summaryPercentage = totalCount
    ? Math.round((earnedCount / totalCount) * 100)
    : 0

  const filtered = useMemo(() => {
    if (filter === 'EARNED') return achievements.filter((item) => item.earned)
    if (filter === 'LOCKED') return achievements.filter((item) => !item.earned)
    return achievements
  }, [achievements, filter])

  const earned = achievements.filter((item) => item.earned)
  const locked = achievements.filter((item) => !item.earned)

  return (
    <section className="achievements-page">
      <div className="page-container">
        <header className="page-head">
          <div>
            <p className="page-eyebrow">Milestones</p>
            <h1 className="page-title">Achievements</h1>
            <p className="page-subtitle">
              Earned automatically by the backend from your daily-plan,
              practice and interview activity.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={load}
            disabled={loading}
          >
            <RefreshCw size={15} aria-hidden="true" />
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </header>

        <p className="achievements-note" role="note">
          <strong>Backend-awarded:</strong> every achievement has a reusable
          definition and a per-user earned record. Progress and earned badges are
          recalculated on the server — the browser never decides what you have
          unlocked.
        </p>

        {loading ? (
          <PageState
            variant="loading"
            title="Loading achievements"
            description="Fetching your earned and locked milestones."
          />
        ) : error ? (
          <PageState
            variant="error"
            title="Achievements could not be loaded"
            description={error.message}
            onRetry={load}
          />
        ) : achievements.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No achievements available"
            description="Achievement definitions will appear here once the backend seeds them."
          />
        ) : (
          <>
            <section
              className="achievement-summary"
              aria-labelledby="achievement-summary-title"
            >
              <div className="achievement-summary-copy">
                <span className="achievement-summary-icon" aria-hidden="true">
                  <Sparkles size={22} />
                </span>
                <div>
                  <h2
                    className="section-title"
                    id="achievement-summary-title"
                  >
                    {earnedCount} of {totalCount} earned
                  </h2>
                  <p className="achievement-summary-note">
                    {locked.length === 0
                      ? 'Every achievement is unlocked. Excellent work.'
                      : `${locked.length} milestone${locked.length === 1 ? '' : 's'} still in progress.`}
                  </p>
                </div>
              </div>
              <div className="achievement-summary-progress">
                <span className="card-chip">{summaryPercentage}%</span>
                <ProgressBar
                  label="Achievements earned"
                  percentage={summaryPercentage}
                />
              </div>
            </section>

            <div
              className="achievement-filters"
              role="group"
              aria-label="Filter achievements"
            >
              {[
                { value: 'ALL', label: `All (${achievements.length})` },
                { value: 'EARNED', label: `Earned (${earned.length})` },
                { value: 'LOCKED', label: `Locked (${locked.length})` },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`achievement-filter${filter === option.value ? ' active' : ''}`}
                  onClick={() => setFilter(option.value)}
                  aria-pressed={filter === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                icon={filter === 'EARNED' ? Award : Lock}
                title={
                  filter === 'EARNED'
                    ? 'No achievements earned yet'
                    : 'No locked achievements'
                }
                description={
                  filter === 'EARNED'
                    ? 'Complete daily-plan tasks, keep a streak and try a mock interview to unlock your first milestone.'
                    : 'You have earned every achievement currently available.'
                }
              />
            ) : (
              <ul className="achievement-grid">
                {filtered.map((item) => {
                  const Icon = item.earned
                    ? CODE_ICONS[item.code] || Award
                    : Lock
                  const percent = percentFor(item)

                  return (
                    <li
                      key={item.id}
                      className={`achievement-card${item.earned ? ' is-earned' : ' is-locked'}`}
                    >
                      <div className="achievement-card-head">
                        <span
                          className="achievement-icon"
                          aria-hidden="true"
                        >
                          <Icon size={20} />
                        </span>
                        <div className="achievement-title-wrap">
                          <h3 className="achievement-name">{item.name}</h3>
                          <p className="achievement-criteria">
                            {criteriaLabel(item.criteriaType)}
                          </p>
                        </div>
                        <span
                          className={`achievement-state${item.earned ? ' is-earned' : ''}`}
                        >
                          {item.earned ? (
                            <>
                              <Check size={12} aria-hidden="true" />
                              Earned
                            </>
                          ) : (
                            <>
                              <Lock size={12} aria-hidden="true" />
                              Locked
                            </>
                          )}
                        </span>
                      </div>

                      <p className="achievement-description">
                        {item.description}
                      </p>

                      <div className="achievement-progress">
                        <div className="achievement-progress-head">
                          <span>Progress</span>
                          <span>{formatProgress(item)}</span>
                        </div>
                        <ProgressBar
                          label={`${item.name} progress`}
                          percentage={percent}
                          small
                        />
                      </div>

                      <p className="achievement-foot">
                        {item.earned && item.earnedAt
                          ? `Earned ${formatDate(item.earnedAt)}`
                          : item.target > 1
                            ? `${Math.max(0, Number(item.target) - (Number(item.progress) || 0)).toLocaleString()} to go`
                            : 'Complete the milestone to unlock'}
                      </p>
                    </li>
                  )
                })}
              </ul>
            )}
          </>
        )}

        <p className="achievements-footnote">
          <Info size={14} aria-hidden="true" />
          Achievements unlock once and never duplicate. Progress comes from
          stored account activity, so refreshing the page or signing in on
          another device shows the same results.
        </p>
      </div>
    </section>
  )
}
