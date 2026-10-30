import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import ProgressBar from '../components/ProgressBar'
import { useAppState } from '../state/appContext'
import './LearnDetail.css'

export default function LearnCategory() {
  const { categoryId } = useParams()
  const { categories, completedLessons } = useAppState()
  const category = categories.find((item) => item.id === categoryId)

  if (!category) {
    return (
      <section className="learn-detail-page">
        <div className="page-container">
          <EmptyState
            title="Learning track not found"
            description="This track does not exist. Return to Learn to choose one of the four available tracks."
          >
            <Link to="/learn" className="btn btn-primary">
              Back to Learn
            </Link>
          </EmptyState>
        </div>
      </section>
    )
  }

  const completed = new Set(completedLessons)

  return (
    <section className="learn-detail-page">
      <div className="page-container learn-detail-container">
        <Link to="/learn" className="back-link">
          <ArrowLeft size={15} aria-hidden="true" />
          Back to Learn
        </Link>

        <header className="page-head">
          <div>
            <p className="page-eyebrow">Learning track</p>
            <h1 className="page-title">{category.title}</h1>
            <p className="page-subtitle">{category.description}</p>
          </div>
          <div className="category-summary">
            <span className="category-badge progress">{category.level}</span>
            <span className="category-summary-count">
              {category.completedCount}/{category.total} lessons
            </span>
            <ProgressBar
              label="Track progress"
              percentage={category.progress}
              small
            />
          </div>
        </header>

        <p className="learn-detail-note" role="note">
          <BookOpen size={15} aria-hidden="true" />
          Sample lesson content. Completion is stored only in this browser; no
          account or backend is connected.
        </p>

        <div className="lesson-list">
          {category.lessons.map((lesson, index) => {
            const isCompleted = completed.has(lesson.id)

            return (
              <article
                key={lesson.id}
                className={`lesson-card${isCompleted ? ' is-completed' : ''}`}
              >
                <span className="lesson-number" aria-hidden="true">
                  {index + 1}
                </span>
                <div className="lesson-main">
                  <div className="lesson-title-row">
                    <h2 className="lesson-title">
                      <Link
                        to={`/learn/${category.id}/${lesson.id}`}
                        className="lesson-title-link"
                      >
                        {lesson.title}
                      </Link>
                    </h2>
                    {isCompleted && (
                      <span className="lesson-done-badge">
                        <CheckCircle size={12} aria-hidden="true" />
                        Completed
                      </span>
                    )}
                  </div>
                  <p className="lesson-description">{lesson.description}</p>
                  <div className="lesson-meta">
                    <span>{lesson.level}</span>
                    <span>{lesson.duration}</span>
                    <span>{lesson.topic}</span>
                  </div>
                </div>
                <Link
                  to={`/learn/${category.id}/${lesson.id}`}
                  className="btn btn-secondary lesson-open-btn"
                >
                  {isCompleted ? 'Review' : 'Open lesson'}
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
