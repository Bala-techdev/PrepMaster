import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Lightbulb,
  Terminal,
} from 'lucide-react'
import EmptyState from '../components/EmptyState'
import { getCategoryById, getLessonById } from '../data/lessons'
import { useAppState } from '../state/appContext'
import './LearnDetail.css'

export default function LessonDetail() {
  const { categoryId, lessonId } = useParams()
  const { completedLessons, toggleLessonCompleted } = useAppState()
  const [feedback, setFeedback] = useState(null)

  const category = getCategoryById(categoryId)
  const lesson = getLessonById(categoryId, lessonId)

  if (!category || !lesson) {
    return (
      <section className="learn-detail-page">
        <div className="page-container">
          <EmptyState
            title="Lesson not found"
            description="This lesson does not exist in the prototype curriculum. Return to the track or the Learn page."
          >
            <Link to="/learn" className="btn btn-primary">
              Back to Learn
            </Link>
          </EmptyState>
        </div>
      </section>
    )
  }

  const lessonIndex = category.lessons.findIndex(
    (item) => item.id === lesson.id,
  )
  const previousLesson = category.lessons[lessonIndex - 1]
  const nextLesson = category.lessons[lessonIndex + 1]
  const isCompleted = completedLessons.includes(lesson.id)

  const handleToggle = () => {
    toggleLessonCompleted(lesson.id)
    setFeedback({
      id: lesson.id,
      message: isCompleted
        ? 'Lesson marked as not completed.'
        : 'Lesson completed. Your track progress and XP have been updated.',
    })
  }

  return (
    <section className="learn-detail-page">
      <div className="page-container learn-detail-container">
        <Link to={`/learn/${category.id}`} className="back-link">
          <ArrowLeft size={15} aria-hidden="true" />
          Back to {category.title}
        </Link>

        <header className="page-head lesson-detail-head">
          <div>
            <p className="page-eyebrow">{category.title}</p>
            <h1 className="page-title">{lesson.title}</h1>
            <div className="lesson-detail-meta">
              <span className="lesson-meta-chip">{lesson.level}</span>
              <span className="lesson-meta-chip">{lesson.duration}</span>
              <span className="lesson-meta-chip">{lesson.topic}</span>
              {isCompleted && (
                <span className="lesson-done-badge">
                  <CheckCircle size={12} aria-hidden="true" />
                  Completed
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            className={`btn ${isCompleted ? 'btn-secondary' : 'btn-primary'}`}
            onClick={handleToggle}
          >
            <CheckCircle size={16} aria-hidden="true" />
            {isCompleted ? 'Mark as not completed' : 'Mark lesson complete'}
          </button>
        </header>

        <p className="lesson-feedback" role="status">
          {feedback?.id === lesson.id ? feedback.message : ''}
        </p>

        <p className="learn-detail-note" role="note">
          Sample explanation and reference code. This prototype does not run or
          verify the snippets.
        </p>

        <article className="lesson-content-card">
          <h2 className="section-title">Explanation</h2>
          {lesson.explanation.map((paragraph) => (
            <p className="lesson-paragraph" key={paragraph}>
              {paragraph}
            </p>
          ))}
        </article>

        <article className="lesson-content-card">
          <h2 className="section-title">Key points</h2>
          <ul className="lesson-key-points">
            {lesson.keyPoints.map((point) => (
              <li key={point}>
                <CheckCircle size={15} aria-hidden="true" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="lesson-content-card">
          <h2 className="section-title">
            <Terminal size={16} aria-hidden="true" />
            Example ({lesson.code.language})
          </h2>
          <pre className="code-block">
            <code>{lesson.code.snippet}</code>
          </pre>
        </article>

        {lesson.tip && (
          <p className="lesson-tip" role="note">
            <Lightbulb size={16} aria-hidden="true" />
            <span>
              <strong>Tip:</strong> {lesson.tip}
            </span>
          </p>
        )}

        <div className="lesson-detail-actions">
          {lesson.practiceId && (
            <Link
              to={`/practice/${lesson.practiceId}`}
              className="btn btn-primary"
            >
              Practice this concept
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          )}
          <Link to={`/learn/${category.id}`} className="btn btn-secondary">
            Back to track
          </Link>
        </div>

        <nav className="lesson-nav" aria-label="Lesson navigation">
          {previousLesson ? (
            <Link
              to={`/learn/${category.id}/${previousLesson.id}`}
              className="lesson-nav-link"
            >
              <span className="lesson-nav-label">Previous</span>
              <span className="lesson-nav-title">
                <ArrowLeft size={14} aria-hidden="true" />
                {previousLesson.title}
              </span>
            </Link>
          ) : (
            <span />
          )}

          {nextLesson ? (
            <Link
              to={`/learn/${category.id}/${nextLesson.id}`}
              className="lesson-nav-link is-next"
            >
              <span className="lesson-nav-label">Next</span>
              <span className="lesson-nav-title">
                {nextLesson.title}
                <ArrowRight size={14} aria-hidden="true" />
              </span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </section>
  )
}
