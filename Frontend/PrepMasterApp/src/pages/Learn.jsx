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
import { useAppData } from '../state/useAppData'
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
  const { categories, achievements, stats } = useAppData()
  const earnedBadges = achievements.filter((badge) => badge.earned).length

  return (
    <section className="learn-page">
      <div className="page-container">
        <header className="page-head">
          <div>
            <p className="page-eyebrow">Curriculum</p>
            <h1 className="page-title">Learn</h1>
            <p className="page-subtitle">
              Work through backend topics, open the reference material, then
              practise the linked questions.
            </p>
          </div>
          <p className="section-count">
            <strong>{stats.solvedCount}</strong> of {stats.totalQuestions}{' '}
            questions solved
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
                      {category.completedCount}/{category.total} questions solved
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
              {earnedBadges} of {achievements.length} earned
            </span>
          </div>

          <div className="badges-grid">
            {achievements.map((badge) => (
              <div
                key={badge.id}
                className={`badge-card ${badge.earned ? 'earned' : 'pending'}`}
                title={badge.description}
              >
                <span className="badge-icon" aria-hidden="true">
                  <Star size={17} />
                </span>
                <span className="badge-title">{badge.name}</span>
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
            Badges are derived from backend-recorded tasks, XP and activity
            days. Standalone lesson completion is not supported because the
            backend stores questions and resources rather than lessons.
          </p>
        </section>
      </div>
    </section>
  )
}
