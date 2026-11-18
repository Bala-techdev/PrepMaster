import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  CheckCircle,
  Circle,
  ClipboardList,
  Star,
  TrendingUp,
  Trophy,
  X,
} from 'lucide-react'
import ProgressBar from '../components/ProgressBar'
import StatCard from '../components/StatCard'
import ActivityHeatmap from '../components/ActivityHeatmap'
import EmptyState from '../components/EmptyState'
import { useAppData } from '../state/useAppData'
import {
  getInterviewHistory,
  getInterviewPerformance,
} from '../api/mockInterviewService'
import { formatDate } from '../lib/date'
import { difficultyLabel } from '../lib/format'
import './Progress.css'

const topicColors = [
  'var(--prem-blue)',
  'var(--prem-purple)',
  'var(--prem-amber)',
  'var(--prem-red)',
  'var(--prem-indigo)',
  'var(--prem-green)',
]

export default function ProgressPage() {
  const { stats, topicPerformance } = useAppData()
  const overallPercentage = Math.round((Number(stats.completionRate) || 0) * 100)
  const [interviewStats, setInterviewStats] = useState(null)
  const [interviewHistory, setInterviewHistory] = useState([])
  const [interviewLoading, setInterviewLoading] = useState(true)
  const [interviewError, setInterviewError] = useState(null)

  useEffect(() => {
    let active = true
    setInterviewLoading(true)
    setInterviewError(null)

    Promise.all([
      getInterviewPerformance(),
      getInterviewHistory({ page: 0, size: 5 }),
    ])
      .then(([performance, history]) => {
        if (!active) return
        setInterviewStats(performance)
        setInterviewHistory(history?.content || [])
      })
      .catch((requestError) => {
        if (active) setInterviewError(requestError)
      })
      .finally(() => {
        if (active) setInterviewLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <section className="progress-page">
      <div className="page-container">
        <header className="page-head">
          <div>
            <p className="page-eyebrow">Insights</p>
            <h1 className="page-title">Progress</h1>
            <p className="page-subtitle">
              XP, levels, streaks and solved questions recorded by the backend.
            </p>
          </div>
        </header>

        <p className="progress-note" role="note">
          <strong>Account-backed history:</strong> plan completion, XP, level,
          streak, solved-question values and mock-interview results are
          calculated by the backend from your stored activity.
        </p>

        <div className="progress-top">
          <section
            className="overall-progress-card"
            aria-labelledby="overall-progress-title"
          >
            <div className="card-head">
              <div>
                <h2 className="card-title" id="overall-progress-title">
                  Overall plan completion
                </h2>
                <p className="card-subtitle">
                  All daily-plan tasks recorded for your account
                </p>
              </div>
              <span className="card-chip">{overallPercentage}%</span>
            </div>
            <ProgressBar
              label="Plan completion"
              percentage={overallPercentage}
            />
            <div className="overall-breakdown">
              <span>
                Plan {stats.tasksCompleted}/{stats.totalPlanTasks}
              </span>
              <span>
                Problems {stats.solvedCount}/{stats.totalQuestions}
              </span>
              <span>{stats.totalXp.toLocaleString()} XP</span>
            </div>
            <p className="overall-note">
              {stats.tasksCompleted} of {stats.totalPlanTasks} generated plan
              tasks have been completed. Complete tasks in the Daily Plan to
              raise this number.
            </p>
          </section>

          <div className="streak-cards">
            <StatCard
              title="Current streak"
              value={stats.currentStreak}
              subtitle="days in a row"
              icon={<Calendar />}
            />
            <StatCard
              title="Longest streak"
              value={stats.longestStreak}
              subtitle="personal best"
              icon={<TrendingUp />}
            />
            <StatCard
              title="Completed tasks"
              value={stats.tasksCompleted}
              subtitle="recorded by the backend"
              icon={<CheckCircle />}
            />
          </div>
        </div>

        <div className="progress-grid">
          <section className="topic-performance" aria-labelledby="topics-title">
            <div className="section-head progress-section-head">
              <h2 className="section-title" id="topics-title">
                Category performance
              </h2>
              <span className="section-count">
                {stats.solvedCount}/{stats.totalQuestions} solved
              </span>
            </div>
            <div className="performance-bars">
              {topicPerformance.map((item, index) => {
                const percent = item.total
                  ? Math.round((item.solved / item.total) * 100)
                  : 0
                const color = topicColors[index % topicColors.length]

                return (
                  <div key={item.topic} className="performance-bar">
                    <div className="performance-head">
                      <span className="performance-topic">{item.topic}</span>
                      <span className="performance-percentage">
                        {item.solved}/{item.total}
                        <span className="performance-percent-value">
                          {percent}%
                        </span>
                      </span>
                    </div>
                    <div
                      className="performance-track"
                      role="progressbar"
                      aria-valuenow={percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${item.topic} progress`}
                    >
                      <div
                        className="performance-bar-fill"
                        style={{ width: `${percent}%`, background: color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="performance-note">
              Counts update when a daily-plan task containing a question is
              completed. They are not judged submissions.
            </p>
          </section>

          <div className="progress-side">
            <section
              className="level-progression"
              aria-labelledby="level-title"
            >
              <h2 className="section-title" id="level-title">
                Level progression
              </h2>
              <div className="level-progress-grid">
                <div>
                  <p className="level-progress-value">Level {stats.level}</p>
                  <p className="level-progress-note">
                    {stats.totalXp.toLocaleString()} XP total ·{' '}
                    {stats.xpIntoLevel.toLocaleString()} /{' '}
                    {stats.levelSpan.toLocaleString()} into this level
                  </p>
                </div>
                <span className="level-progress-percent">
                  {stats.levelProgress}%
                </span>
              </div>
              <ProgressBar
                label={`Progress to level ${stats.level + 1}`}
                percentage={stats.levelProgress}
                small
              />
              <p className="performance-note">
                XP comes from completed daily-plan tasks and is stored by the
                backend. The frontend only displays the resulting level.
              </p>
            </section>

            <section
              className="problems-statistics"
              aria-labelledby="solved-title"
            >
              <div className="section-head progress-section-head">
                <h2 className="section-title" id="solved-title">
                  Problems solved
                </h2>
                <span className="section-count">of {stats.totalQuestions}</span>
              </div>
              <div className="statistics-grid">
                <div className="stat-item">
                  <Star className="stat-item-icon" aria-hidden="true" />
                  <div>
                    <div className="stat-item-value">{stats.solvedCount}</div>
                    <div className="stat-item-label">Total solved</div>
                  </div>
                </div>
                <div className="stat-item">
                  <TrendingUp className="stat-item-icon" aria-hidden="true" />
                  <div>
                    <div className="stat-item-value">
                      {stats.solvedByDifficulty.Easy}
                    </div>
                    <div className="stat-item-label">
                      Easy · {stats.difficultyTotals.Easy} available
                    </div>
                  </div>
                </div>
                <div className="stat-item">
                  <Circle className="stat-item-icon" aria-hidden="true" />
                  <div>
                    <div className="stat-item-value">
                      {stats.solvedByDifficulty.Medium}
                    </div>
                    <div className="stat-item-label">
                      Medium · {stats.difficultyTotals.Medium} available
                    </div>
                  </div>
                </div>
                <div className="stat-item">
                  <X className="stat-item-icon" aria-hidden="true" />
                  <div>
                    <div className="stat-item-value">
                      {stats.solvedByDifficulty.Hard}
                    </div>
                    <div className="stat-item-label">
                      Hard · {stats.difficultyTotals.Hard} available
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <ActivityHeatmap
          activity={stats.activity}
          days={30}
          className="progress-heatmap"
          note="Activity is recorded by the backend when you complete a daily-plan task. Days without a completed task stay empty."
        />

        <section
          className="mock-interview-history"
          aria-labelledby="history-title"
        >
          <div className="section-head progress-section-head">
            <div>
              <h2 className="section-title" id="history-title">
                Mock interview history
              </h2>
              {interviewStats && (
                <p className="performance-note">
                  {interviewStats.completedSessions} completed ·{' '}
                  {interviewStats.expiredSessions} expired ·{' '}
                  {Math.round(interviewStats.averageCompletionPercentage || 0)}%
                  average completion
                </p>
              )}
            </div>
            <Link
              to="/mock-interview/history"
              className="btn btn-secondary history-view-all"
            >
              View all
            </Link>
          </div>

          {interviewLoading ? (
            <p className="performance-note" role="status">
              Loading interview activity…
            </p>
          ) : interviewError ? (
            <p className="field-error" role="alert">
              {interviewError.message}{' '}
              <Link to="/mock-interview/history">Open interview history</Link>
            </p>
          ) : interviewHistory.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="No mock interviews yet"
              description="Start a timed session and its completion summary will appear here."
            >
              <Link to="/mock-interview" className="btn btn-primary">
                Start a mock interview
              </Link>
            </EmptyState>
          ) : (
            <div className="interview-history-list">
              {interviewHistory.map((interview) => {
                const status =
                  interview.status === 'COMPLETED'
                    ? 'Completed'
                    : interview.status === 'EXPIRED'
                      ? 'Timer expired'
                      : interview.status === 'CANCELLED'
                        ? 'Cancelled'
                        : 'In progress'
                const score =
                  interview.score === null || interview.score === undefined
                    ? '—'
                    : `${Math.round(Number(interview.score))}%`

                return (
                  <div key={interview.id} className="interview-item">
                    <span className="interview-date">
                      {formatDate(interview.startedAt)}
                    </span>
                    <span
                      className={`interview-difficulty ${String(interview.difficulty).toLowerCase()}`}
                    >
                      {difficultyLabel(interview.difficulty)}
                    </span>
                    <span className="interview-topic">
                      {interview.categoryLabel}
                    </span>
                    <span className="interview-duration">{status}</span>
                    <span className="interview-duration">
                      {interview.questionsAnswered}/{interview.questionCount}{' '}
                      answered
                    </span>
                    <span className="interview-result">{score}</span>
                  </div>
                )
              })}
            </div>
          )}

          <p className="history-note">
            <ClipboardList size={13} aria-hidden="true" />
            Scores measure how many assigned questions you answered, not answer
            correctness. Results are stored by the backend and count toward
            achievement progress.
          </p>
        </section>
      </div>
    </section>
  )
}
