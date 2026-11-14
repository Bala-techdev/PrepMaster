import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import ProgressBar from '../components/ProgressBar'
import { useAppData } from '../state/useAppData'
import './LearnDetail.css'

export default function LearnCategory() {
  const { categoryId } = useParams()
  const { categories } = useAppData()
  const category = categories.find((item) => String(item.id) === categoryId)

  if (!category) {
    return (
      <section className="learn-detail-page">
        <div className="page-container">
          <EmptyState
            title="Learning track not found"
            description="This track does not exist in the backend catalog. Return to Learn to choose another track."
          >
            <Link to="/learn" className="btn btn-primary">
              Back to Learn
            </Link>
          </EmptyState>
        </div>
      </section>
    )
  }

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
            <h1 className="page-title">{category.name}</h1>
            <p className="page-subtitle">{category.description}</p>
          </div>
          <div className="category-summary">
            <span className="category-badge progress">{category.level}</span>
            <span className="category-summary-count">
              {category.completedCount}/{category.total} questions solved
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
          Topics, resources and questions come from the backend. A question is
          marked solved only when a daily-plan task containing it is completed.
        </p>

        {category.topics.length === 0 ? (
          <EmptyState
            title="No topics in this track"
            description="The backend has not published any active topics for this category yet."
          />
        ) : (
          <div className="lesson-list">
            {category.topics.map((topic, index) => {
              const isCompleted =
                topic.questionCount > 0 && topic.solvedCount === topic.questionCount

              return (
                <article
                  key={topic.id}
                  className={`lesson-card${isCompleted ? ' is-completed' : ''}`}
                >
                  <span className="lesson-number" aria-hidden="true">
                    {index + 1}
                  </span>
                  <div className="lesson-main">
                    <div className="lesson-title-row">
                      <h2 className="lesson-title">
                        <Link
                          to={`/learn/${category.id}/${topic.id}`}
                          className="lesson-title-link"
                        >
                          {topic.name}
                        </Link>
                      </h2>
                      {isCompleted && (
                        <span className="lesson-done-badge">
                          <CheckCircle size={12} aria-hidden="true" />
                          All questions solved
                        </span>
                      )}
                    </div>
                    <p className="lesson-description">{topic.description}</p>
                    <div className="lesson-meta">
                      <span>
                        {topic.questionCount} question
                        {topic.questionCount === 1 ? '' : 's'}
                      </span>
                      <span>{topic.solvedCount} solved</span>
                      <span>{topic.categoryName}</span>
                    </div>
                  </div>
                  <Link
                    to={`/learn/${category.id}/${topic.id}`}
                    className="btn btn-secondary lesson-open-btn"
                  >
                    {topic.solvedCount > 0 ? 'Review topic' : 'Open topic'}
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
