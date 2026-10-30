import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Circle,
  ExternalLink,
  Link2,
} from 'lucide-react'
import EmptyState from '../components/EmptyState'
import PageState from '../components/PageState'
import { getResources } from '../api/learningService'
import { useAppData } from '../state/useAppData'
import { difficultyLabel } from '../lib/format'
import './LearnDetail.css'

export default function TopicDetail() {
  const { categoryId, topicId } = useParams()
  const { categoryById, topicViews, stats } = useAppData()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  const category = categoryById.get(Number(categoryId))
  const topic = topicViews.get(Number(topicId))
  const belongsToCategory = topic && category && topic.categoryId === category.id

  useEffect(() => {
    if (!belongsToCategory) {
      setLoading(false)
      return undefined
    }

    let active = true
    const controller = new AbortController()

    setLoading(true)
    setError(null)

    getResources(topic.id, { signal: controller.signal })
      .then((data) => {
        if (active) setResources(data || [])
      })
      .catch((requestError) => {
        if (active) setError(requestError)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [belongsToCategory, reloadKey, topic])

  if (!belongsToCategory) {
    return (
      <section className="learn-detail-page">
        <div className="page-container">
          <EmptyState
            title="Topic not found"
            description="This topic does not exist in the backend catalog. Return to Learn to choose another topic."
          >
            <Link to="/learn" className="btn btn-primary">
              Back to Learn
            </Link>
          </EmptyState>
        </div>
      </section>
    )
  }

  const topicIndex = category.topics.findIndex((item) => item.id === topic.id)
  const previousTopic = category.topics[topicIndex - 1]
  const nextTopic = category.topics[topicIndex + 1]

  return (
    <section className="learn-detail-page">
      <div className="page-container learn-detail-container">
        <Link to={`/learn/${category.id}`} className="back-link">
          <ArrowLeft size={15} aria-hidden="true" />
          Back to {category.name}
        </Link>

        <header className="page-head lesson-detail-head">
          <div>
            <p className="page-eyebrow">{category.name}</p>
            <h1 className="page-title">{topic.name}</h1>
            <div className="lesson-detail-meta">
              <span className="lesson-meta-chip">
                {topic.questionCount} question
                {topic.questionCount === 1 ? '' : 's'}
              </span>
              <span className="lesson-meta-chip">{topic.solvedCount} solved</span>
              <span className="lesson-meta-chip">
                {resources.length} resource{resources.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>
        </header>

        <p className="learn-detail-note" role="note">
          <BookOpen size={15} aria-hidden="true" />
          This topic is reference material. Reading a resource or opening a
          question does not mark it complete; solved status is recorded only by
          completing a daily-plan task.
        </p>

        <article className="lesson-content-card">
          <h2 className="section-title">Topic overview</h2>
          <p className="lesson-paragraph">{topic.description}</p>
        </article>

        <article className="lesson-content-card" aria-labelledby="resources-title">
          <h2 className="section-title" id="resources-title">
            <Link2 size={16} aria-hidden="true" />
            Reference resources
          </h2>

          {loading ? (
            <PageState
              variant="loading"
              title="Loading resources"
              description="Fetching this topic's resources from the backend."
            />
          ) : error ? (
            <PageState
              variant="error"
              title="Resources could not be loaded"
              description={error.message}
              onRetry={() => setReloadKey((key) => key + 1)}
            />
          ) : resources.length === 0 ? (
            <p className="lesson-paragraph">
              The backend has not published any resources for this topic yet.
            </p>
          ) : (
            <ul className="topic-resources">
              {resources.map((resource) => (
                <li key={resource.id} className="resource-card">
                  <div className="resource-copy">
                    <h3 className="resource-title">{resource.title}</h3>
                    <p className="resource-description">
                      {resource.description}
                    </p>
                  </div>
                  {resource.resourceUrl && (
                    <a
                      href={resource.resourceUrl}
                      className="btn btn-secondary resource-link"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open resource
                      <ExternalLink size={14} aria-hidden="true" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="lesson-content-card" aria-labelledby="questions-title">
          <h2 className="section-title" id="questions-title">
            Practice questions
          </h2>

          {topic.questions.length === 0 ? (
            <p className="lesson-paragraph">
              The backend has not published any questions for this topic yet.
            </p>
          ) : (
            <ul className="topic-question-list">
              {topic.questions.map((question) => {
                const isSolved = stats.solvedSet.has(question.id)

                return (
                  <li key={question.id} className="topic-question">
                    <div className="topic-question-main">
                      <Link
                        to={`/practice/${question.id}`}
                        className="topic-question-title"
                      >
                        {question.title}
                      </Link>
                      <span className="topic-question-meta">
                        {difficultyLabel(question.difficulty)}
                      </span>
                    </div>
                    <span
                      className={`problem-status ${isSolved ? 'solved' : 'todo'}`}
                    >
                      {isSolved ? (
                        <>
                          <CheckCircle size={14} aria-hidden="true" />
                          Solved
                        </>
                      ) : (
                        <>
                          <Circle size={12} aria-hidden="true" />
                          Not solved
                        </>
                      )}
                    </span>
                    <Link
                      to={`/practice/${question.id}`}
                      className="btn btn-secondary lesson-open-btn"
                    >
                      Open
                      <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </article>

        <div className="lesson-detail-actions">
          <Link to={`/practice?q=${encodeURIComponent(topic.name)}`} className="btn btn-primary">
            Practice this topic
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
          <Link to={`/learn/${category.id}`} className="btn btn-secondary">
            Back to track
          </Link>
        </div>

        <nav className="lesson-nav" aria-label="Topic navigation">
          {previousTopic ? (
            <Link
              to={`/learn/${category.id}/${previousTopic.id}`}
              className="lesson-nav-link"
            >
              <span className="lesson-nav-label">Previous</span>
              <span className="lesson-nav-title">
                <ArrowLeft size={14} aria-hidden="true" />
                {previousTopic.name}
              </span>
            </Link>
          ) : (
            <span />
          )}

          {nextTopic ? (
            <Link
              to={`/learn/${category.id}/${nextTopic.id}`}
              className="lesson-nav-link is-next"
            >
              <span className="lesson-nav-label">Next</span>
              <span className="lesson-nav-title">
                {nextTopic.name}
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
