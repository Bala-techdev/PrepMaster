import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle,
  Circle,
  ExternalLink,
  Gauge,
  ListChecks,
  Tag,
} from 'lucide-react'
import DifficultyBadge from '../components/DifficultyBadge'
import EmptyState from '../components/EmptyState'
import PageState from '../components/PageState'
import { getQuestion } from '../api/learningService'
import { useAppData } from '../state/useAppData'
import { difficultyLabel } from '../lib/format'
import { formatDate } from '../lib/date'
import './ProblemDetail.css'

function splitLines(value) {
  return String(value || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

export default function ProblemDetail() {
  const { problemId } = useParams()
  const { stats, solvedQuestions } = useAppData()
  const [question, setQuestion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    const controller = new AbortController()

    setLoading(true)
    setError(null)
    setQuestion(null)

    getQuestion(problemId, { signal: controller.signal })
      .then((data) => {
        if (active) setQuestion(data)
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
  }, [problemId, reloadKey])

  if (loading) {
    return (
      <section className="problem-detail-page">
        <div className="page-container">
          <PageState
            variant="loading"
            title="Loading problem"
            description="Fetching the question from the backend learning catalog."
          />
        </div>
      </section>
    )
  }

  if (error?.status === 404) {
    return (
      <section className="problem-detail-page">
        <div className="page-container">
          <EmptyState
            title="Problem not found"
            description="This question does not exist in the backend catalog. Return to the practice list to choose another one."
          >
            <Link to="/practice" className="btn btn-primary">
              Back to Practice
            </Link>
          </EmptyState>
        </div>
      </section>
    )
  }

  if (error || !question) {
    return (
      <section className="problem-detail-page">
        <div className="page-container">
          <PageState
            variant="error"
            title="Problem could not be loaded"
            description={error?.message || 'The backend returned no question data.'}
            onRetry={() => setReloadKey((key) => key + 1)}
          />
        </div>
      </section>
    )
  }

  const isSolved = stats.solvedSet.has(question.id)
  const solvedEntry = solvedQuestions.find(
    (item) => item.questionId === question.id,
  )
  const constraints = splitLines(question.constraints)
  const examples = splitLines(question.examples)

  return (
    <section className="problem-detail-page">
      <div className="page-container problem-detail-container">
        <Link to="/practice" className="back-link">
          <ArrowLeft size={15} aria-hidden="true" />
          Back to Practice
        </Link>

        <header className="page-head problem-detail-head">
          <div>
            <p className="page-eyebrow">Practice · {question.topicName}</p>
            <h1 className="page-title">{question.title}</h1>
            <div className="problem-detail-meta">
              <DifficultyBadge difficulty={difficultyLabel(question.difficulty)} />
              <span
                className={`problem-status ${isSolved ? 'solved' : 'todo'}`}
              >
                {isSolved ? (
                  <>
                    <CheckCircle size={14} aria-hidden="true" />
                    Recorded solved
                  </>
                ) : (
                  <>
                    <Circle size={12} aria-hidden="true" />
                    Not solved yet
                  </>
                )}
              </span>
            </div>
          </div>

          {question.practiceUrl && (
            <a
              href={question.practiceUrl}
              className="btn btn-primary"
              target="_blank"
              rel="noreferrer"
            >
              Open practice site
              <ExternalLink size={15} aria-hidden="true" />
            </a>
          )}
        </header>

        {isSolved && (
          <p className="problem-detail-status" role="status">
            {solvedEntry
              ? `Completed on ${formatDate(solvedEntry.completedAt)} as part of a daily-plan task.`
              : 'Completed as part of a daily-plan task.'}
          </p>
        )}

        <p className="practice-note" role="note">
          <strong>Recorded progress:</strong> this prompt is stored in the
          backend catalog. Solved status is recorded only when a daily-plan task
          containing this question is completed; there is no separate judge or
          manual toggle.
        </p>

        <section className="problem-detail-card" aria-labelledby="prompt-title">
          <h2 className="section-title" id="prompt-title">
            Problem statement
          </h2>
          <p className="problem-description problem-preline">
            {question.description}
          </p>

          {examples.length > 0 && (
            <div className="problem-examples">
              <div className="problem-example">
                <p className="problem-example-label">Examples</p>
                <p className="problem-example-text">{examples.join('\n')}</p>
              </div>
            </div>
          )}
        </section>

        <div className="problem-detail-grid">
          <section
            className="problem-detail-card"
            aria-labelledby="constraints-title"
          >
            <h2 className="section-title" id="constraints-title">
              <ListChecks size={16} aria-hidden="true" />
              Constraints
            </h2>
            {constraints.length > 0 ? (
              <ul className="detail-list">
                {constraints.map((constraint) => (
                  <li key={constraint}>{constraint}</li>
                ))}
              </ul>
            ) : (
              <p className="problem-description">No constraints provided.</p>
            )}
          </section>

          <section className="problem-detail-card" aria-labelledby="complexity-title">
            <h2 className="section-title" id="complexity-title">
              <Gauge size={16} aria-hidden="true" />
              Expected complexity
            </h2>
            <p className="problem-description">
              <strong>Time:</strong>{' '}
              {question.expectedTimeComplexity || 'Not specified'}
            </p>
            <p className="problem-description">
              <strong>Space:</strong>{' '}
              {question.expectedSpaceComplexity || 'Not specified'}
            </p>
          </section>
        </div>

        <section className="problem-detail-card" aria-labelledby="tags-title">
          <h2 className="section-title" id="tags-title">
            <Tag size={16} aria-hidden="true" />
            Tags
          </h2>
          {question.tags?.length ? (
            <ul className="problem-tags">
              {question.tags.map((tag) => (
                <li key={tag.id}>{tag.name}</li>
              ))}
            </ul>
          ) : (
            <p className="problem-description">
              No tags are attached to this question in the backend yet.
            </p>
          )}
        </section>
      </div>
    </section>
  )
}
