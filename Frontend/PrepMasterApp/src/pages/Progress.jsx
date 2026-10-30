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
import { PROBLEMS } from '../data/problems'
import { formatDate } from '../lib/date'
import { useAppState } from '../state/appContext'
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
  const { stats, interviews } = useAppState()

  return (
    <section className="progress-page">
      <div className="page-container">
        <header className="page-head">
          <div>
            <p className="page-eyebrow">Insights</p>
            <h1 className="page-title">Progress</h1>
            <p className="page-subtitle">
              Track your local prototype activity and marked learning progress.
            </p>
          </div>
        </header>

        <p className="progress-note" role="note">
          <strong>Demo history:</strong> the streak, heatmap and base level
          include deterministic prototype activity. Completed tasks, solved
          problems, lessons and interview sessions below come from your actions
          in this browser.
        </p>

        <div className="progress-top">
          <section
            className="overall-progress-card"
            aria-labelledby="overall-progress-title"
          >
            <div className="card-head">
              <div>
                <h2 className="card-title" id="overall-progress-title">
                  Overall progress
                </h2>
                <p className="card-subtitle">
                  Today&apos;s plan, solved problems and completed lessons
                </p>
              </div>
              <span className="card-chip">{stats.overallPercentage}%</span>
            </div>
            <ProgressBar
              label="Combined completion"
              percentage={stats.overallPercentage}
            />
            <div className="overall-breakdown">
              <span>
                Plan {stats.completedCount}/{stats.totalTasks}
              </span>
              <span>
                Problems {stats.solvedCount}/{PROBLEMS.length}
              </span>
              <span>
                Lessons {stats.lessonsDone}/{stats.totalLessons}
              </span>
            </div>
            <p className="overall-note">
              {stats.overallDone} of {stats.overallTotal} trackable items
              complete. Mark problems solved in Practice and finish lessons in
              Learn to raise this number.
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
              subtitle="recorded locally"
              icon={<CheckCircle />}
            />
          </div>
        </div>

        <div className="progress-grid">
          <section className="topic-performance" aria-labelledby="topics-title">
            <div className="section-head progress-section-head">
              <h2 className="section-title" id="topics-title">
                Topic-wise performance
              </h2>
              <span className="section-count">
                {stats.solvedCount}/{PROBLEMS.length} solved
              </span>
            </div>
            <div className="performance-bars">
              {stats.topicPerformance.map((item, index) => {
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
              Counts update only when you mark a problem solved. They are not
              judged submissions.
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
                    {stats.xpIntoLevel} / 1,000 into this level
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
                XP comes from completed plan tasks, marked problems, lessons and
                finished mock interviews, on top of the prototype baseline.
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
                <span className="section-count">of {PROBLEMS.length}</span>
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
          note="Earlier cells are deterministic demo history. Today’s cell reflects real task completions stored in this browser."
        />

        <section
          className="mock-interview-history"
          aria-labelledby="history-title"
        >
          <div className="section-head progress-section-head">
            <h2 className="section-title" id="history-title">
              Mock interview history
            </h2>
            <span className="section-count">
              {interviews.length} session{interviews.length === 1 ? '' : 's'}
            </span>
          </div>

          {interviews.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="No mock interviews yet"
              description="Finish a 45-minute prototype session and its actual interaction summary will appear here."
            >
              <Link to="/mock-interview" className="btn btn-primary">
                Start a mock interview
              </Link>
            </EmptyState>
          ) : (
            <div className="interview-history-list">
              {interviews.map((interview) => (
                <div key={interview.id} className="interview-item completed">
                  <span className="interview-date">
                    {formatDate(interview.endedAt)}
                  </span>
                  <span
                    className={`interview-difficulty ${interview.difficulty.toLowerCase()}`}
                  >
                    {interview.difficulty === 'All'
                      ? 'Mixed'
                      : interview.difficulty}
                  </span>
                  <span className="interview-topic">
                    {interview.topic === 'All' ? 'Mixed topics' : interview.topic}
                  </span>
                  <span className="interview-duration">
                    {interview.endReason === 'time'
                      ? 'Timer expired'
                      : 'Ended early'}
                  </span>
                  <span className="interview-duration">
                    {interview.answeredCount}/{interview.questionIds.length}{' '}
                    answered
                  </span>
                  <span className="interview-result">
                    {interview.score}% completion
                  </span>
                </div>
              ))}
            </div>
          )}

          <p className="history-note">
            <ClipboardList size={13} aria-hidden="true" />
            Scores measure how many questions you marked answered, not answer
            correctness. Sessions are stored only in this browser.
          </p>
        </section>
      </div>
    </section>
  )
}
