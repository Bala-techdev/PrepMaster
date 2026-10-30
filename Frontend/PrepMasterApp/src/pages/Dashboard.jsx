import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Calendar,
  Check,
  Clock,
  Target,
  TrendingUp,
  Trophy,
} from 'lucide-react'
import ProgressBar from '../components/ProgressBar'
import LevelCard from '../components/LevelCard'
import ActivityHeatmap from '../components/ActivityHeatmap'
import StreakCard from '../components/StreakCard'
import { useAppData } from '../state/useAppData'
import { useAppState } from '../state/appContext'
import { msUntilMidnight, pad } from '../lib/date'
import './Dashboard.css'

const padValue = (value) => pad(value)

function formatToday() {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

export default function Dashboard() {
  const { profile, tasks, stats, settings } = useAppData()
  const { interviews } = useAppState()
  const [remainingMs, setRemainingMs] = useState(msUntilMidnight)
  const [today, setToday] = useState(formatToday)

  useEffect(() => {
    const tick = () => {
      setRemainingMs(msUntilMidnight())
      const next = formatToday()
      setToday((current) => (current === next ? current : next))
    }

    tick()
    const timer = window.setInterval(tick, 1000)

    return () => window.clearInterval(timer)
  }, [])

  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000))
  const countdown = {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }

  const remainingTasks = Math.max(0, stats.totalTasks - stats.completedCount)
  const displayName = profile?.displayName || 'there'
  const firstName = displayName.split(' ')[0] || displayName

  const quickActions = [
    {
      to: '/mock-interview',
      label: 'Mock interviews',
      value: interviews.length
        ? `${interviews.length} recorded locally`
        : 'Start your first',
      icon: Trophy,
      tone: 'indigo',
    },
    {
      to: '/progress',
      label: 'Current streak',
      value: `${stats.currentStreak} day${stats.currentStreak === 1 ? '' : 's'}`,
      icon: TrendingUp,
      tone: 'green',
    },
    {
      to: '/practice',
      label: 'Problems solved',
      value: `${stats.solvedCount} recorded`,
      icon: Target,
      tone: 'amber',
    },
  ]

  return (
    <section className="dashboard-page">
      <div className="dashboard-container">
        <header className="page-head">
          <div>
            <p className="page-eyebrow">Dashboard</p>
            <h1 className="page-title">Hi, {firstName}!</h1>
            <p className="page-subtitle">
              Discipline today, better opportunities tomorrow.
            </p>
          </div>
          <p className="dash-date">
            <Calendar size={16} aria-hidden="true" />
            {today}
          </p>
        </header>

        <div className="dashboard-grid">
          <section
            className="today-blueprint-card"
            aria-labelledby="blueprint-title"
          >
            <div className="blueprint-top">
              <div>
                <p className="blueprint-eyebrow">Today&apos;s blueprint</p>
                <h2 className="blueprint-title" id="blueprint-title">
                  {stats.totalTasks === 0
                    ? 'No plan for today'
                    : remainingTasks === 0
                      ? 'All tasks complete'
                      : `${remainingTasks} task${remainingTasks === 1 ? '' : 's'} left today`}
                </h2>
                <p className="blueprint-description">
                  {stats.totalTasks === 0
                    ? 'Your daily plan could not be loaded. Retry from the banner above.'
                    : remainingTasks === 0
                      ? 'Every task is done. Revisit any of them from the daily plan.'
                      : 'Finish today’s plan to keep your streak alive.'}
                </p>
              </div>
              <Link to="/daily-plan" className="blueprint-cta">
                Open plan
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>

            <ul className="blueprint-tasks">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className={task.isCompleted ? 'is-done' : ''}
                >
                  <span className="blueprint-task-copy">
                    <span className="blueprint-task-title">{task.title}</span>
                    <span className="blueprint-task-category">
                      {task.category}
                    </span>
                  </span>
                  {task.isCompleted ? (
                    <Check
                      className="blueprint-task-check"
                      size={16}
                      aria-label="Completed"
                    />
                  ) : task.isLocked ? (
                    <span className="blueprint-task-lock">Locked</span>
                  ) : (
                    <span className="blueprint-task-open">Ready</span>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section
            className="daily-progress-card"
            aria-labelledby="daily-progress-title"
          >
            <div className="card-head">
              <div>
                <h2 className="card-title" id="daily-progress-title">
                  Daily completion
                </h2>
                <p className="card-subtitle">
                  {stats.completedCount} of {stats.totalTasks} tasks completed
                </p>
              </div>
              <span className="card-chip">{stats.percentage}%</span>
            </div>
            <ProgressBar
              label="Today's progress"
              percentage={stats.percentage}
            />
            <p className="card-footnote" role="status">
              {stats.totalTasks === 0
                ? 'No daily plan is available yet.'
                : remainingTasks === 0
                  ? 'Plan complete — your activity is recorded for today.'
                  : `${remainingTasks} task${remainingTasks === 1 ? '' : 's'} remaining in today’s plan.`}
            </p>
          </section>

          <section
            className="countdown-card"
            aria-labelledby="countdown-title"
          >
            <div className="card-head">
              <div>
                <h2 className="card-title" id="countdown-title">
                  Time until midnight
                </h2>
                <p className="card-subtitle">
                  Browser-local time · plan timezone {settings.timezone || 'UTC'}
                </p>
              </div>
              <Clock className="card-head-icon" size={18} aria-hidden="true" />
            </div>

            <div className="countdown-timer">
              <div className="countdown-unit">
                <span className="countdown-value">
                  {padValue(countdown.hours)}
                </span>
                <span className="countdown-label">Hours</span>
              </div>
              <div className="countdown-unit">
                <span className="countdown-value">
                  {padValue(countdown.minutes)}
                </span>
                <span className="countdown-label">Minutes</span>
              </div>
              <div className="countdown-unit">
                <span className="countdown-value">
                  {padValue(countdown.seconds)}
                </span>
                <span className="countdown-label">Seconds</span>
              </div>
            </div>
          </section>

          <StreakCard
            days={stats.currentStreak}
            longest={stats.longestStreak}
            className="dashboard-span-4"
          />

          <LevelCard
            level={stats.level}
            progress={stats.levelProgress}
            experience={stats.totalXp}
            className="dashboard-span-4"
          />

          <ActivityHeatmap
            activity={stats.activity}
            days={30}
            className="dashboard-span-4"
            note="Activity is recorded by the backend when you complete a daily-plan task. A day with no completed tasks stays empty."
          />

          <nav className="quick-actions" aria-label="Quick actions">
            {quickActions.map((action) => {
              const Icon = action.icon

              return (
                <Link
                  key={action.to}
                  to={action.to}
                  className="quick-action-card"
                >
                  <span className={`quick-action-icon ${action.tone}`}>
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span className="quick-action-copy">
                    <span className="quick-action-title">{action.label}</span>
                    <span className="quick-action-value">{action.value}</span>
                  </span>
                  <ArrowRight
                    className="quick-action-arrow"
                    size={16}
                    aria-hidden="true"
                  />
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </section>
  )
}
