import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle,
  Code,
  Flag,
  Folder,
  Lock,
  Star,
} from 'lucide-react'
import ProgressBar from '../components/ProgressBar'
import { useAppState } from '../state/appContext'
import './Learn.css'

const iconMap = {
  Folder,
  Code,
  Flag,
  Star,
}

const badgeTone = {
  Completed: 'complete',
  'In Progress': 'progress',
  Starting: 'starting',
}

export default function LearnPage() {
  const { categories, stats } = useAppState()

  const completionBadges = [
    {
      id: 'first-task',
      title: 'First task completed',
      earned: stats.tasksCompleted > 0,
    },
    {
      id: 'problem-solver',
      title: 'Problem marked solved',
      earned: stats.solvedCount > 0,
    },
    {
      id: 'lesson-learner',
      title: 'Lesson completed',
      earned: stats.lessonsDone > 0,
    },
    {
      id: 'week-streak',
      title: 'Seven-day streak',
      earned: stats.currentStreak >= 7,
    },
    {
      id: 'mock-complete',
      title: 'Mock interview completed',
      earned: stats.interviewCount > 0,
    },
  ]

  const earnedBadges = completionBadges.filter((badge) => badge.earned).length

  return (
    <section className="learn-page">
      <div className="page-container">
        <header className="page-head">
          <div>
            <p className="page-eyebrow">Curriculum</p>
            <h1 className="page-title">Learn</h1>
            <p className="page-subtitle">
              Master the concepts you need to succeed, one focused lesson at a
              time.
            </p>
          </div>
          <p className="section-count">
            <strong>{stats.lessonsDone}</strong> of {stats.totalLessons} lessons
            completed
          </p>
        </header>

        <section className="learn-section" aria-labelledby="tracks-title">
          <div className="section-head">
            <h2 className="section-title" id="tracks-title">
              Learning tracks
            </h2>
            <span className="section-count">
              {categories.length} tracks
            </span>
          </div>

          <div className="learning-categories">
            {categories.map((category) => {
              const CategoryIcon = iconMap[category.icon] || Folder

              return (
                <article key={category.id} className="learning-category-card">
                  <div className="category-top">
                    <span
                      className="category-icon"
                      style={{ color: category.color }}
                      aria-hidden="true"
                    >
                      <CategoryIcon size={20} />
                    </span>
                    <span
                      className={`category-badge ${badgeTone[category.badge] || 'starting'}`}
                    >
                      {category.badge}
                    </span>
                  </div>

                  <h3 className="category-title">
                    <Link
                      to={`/learn/${category.id}`}
                      className="category-title-link"
                    >
                      {category.title}
                    </Link>
                  </h3>
                  <p className="category-description">
                    {category.description}
                  </p>

                  <div className="category-meta">
                    <span>{category.level}</span>
                    <span>
                      {category.completedCount}/{category.total} lessons
                    </span>
                  </div>

                  <div className="category-progress">
                    <ProgressBar
                      label="Track progress"
                      percentage={category.progress}
                      small
                    />
                  </div>

                  <Link
                    to={`/learn/${category.id}`}
                    className="category-action"
                  >
                    {category.completedCount > 0 ? 'Continue track' : 'Open track'}
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </article>
              )
            })}
          </div>
        </section>

        <section className="completion-badges" aria-labelledby="badges-title">
          <div className="section-head">
            <h2 className="section-title" id="badges-title">
              Earned badges
            </h2>
            <span className="section-count">
              {earnedBadges} of {completionBadges.length} earned
            </span>
          </div>

          <div className="badges-grid">
            {completionBadges.map((badge) => (
              <div
                key={badge.id}
                className={`badge-card ${badge.earned ? 'earned' : 'pending'}`}
              >
                <span className="badge-icon" aria-hidden="true">
                  <Star size={17} />
                </span>
                <span className="badge-title">{badge.title}</span>
                <span className="badge-state" aria-hidden="true">
                  {badge.earned ? (
                    <CheckCircle size={16} />
                  ) : (
                    <Lock size={15} />
                  )}
                </span>
                <span className="visually-hidden">
                  {badge.earned ? 'Earned' : 'Not earned yet'}
                </span>
              </div>
            ))}
          </div>

          <p className="learn-note">
            Badges are derived from completed tasks, marked problems, finished
            lessons and mock interviews in this browser. Lesson content is
            sample material.
          </p>
        </section>
      </div>
    </section>
  )
}
