import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle,
  Circle,
  Lightbulb,
  ListChecks,
  Terminal,
} from 'lucide-react'
import DifficultyBadge from '../components/DifficultyBadge'
import EmptyState from '../components/EmptyState'
import { getProblemById } from '../data/problems'
import { useAppState } from '../state/appContext'
import './ProblemDetail.css'

export default function ProblemDetail() {
  const { problemId } = useParams()
  const { stats, toggleProblemSolved } = useAppState()
  const [feedback, setFeedback] = useState(null)
  const problem = getProblemById(problemId)

  if (!problem) {
    return (
      <section className="problem-detail-page">
        <div className="page-container">
          <EmptyState
            title="Problem not found"
            description="This sample problem does not exist. Return to the practice list to choose another one."
          >
            <Link to="/practice" className="btn btn-primary">
              Back to Practice
            </Link>
          </EmptyState>
        </div>
      </section>
    )
  }

  const isSolved = stats.solvedSet.has(problem.id)

  const handleToggle = () => {
    toggleProblemSolved(problem.id)
    setFeedback({
      id: problem.id,
      message: isSolved
        ? 'Removed from your solved list.'
        : 'Marked as solved. Your progress and XP have been updated.',
    })
  }

  return (
    <section className="problem-detail-page">
      <div className="page-container problem-detail-container">
        <Link to="/practice" className="back-link">
          <ArrowLeft size={15} aria-hidden="true" />
          Back to Practice
        </Link>

        <header className="page-head problem-detail-head">
          <div>
            <p className="page-eyebrow">
              Practice · {problem.topic}
            </p>
            <h1 className="page-title">{problem.title}</h1>
            <div className="problem-detail-meta">
              <DifficultyBadge difficulty={problem.difficulty} />
              <span
                className={`problem-status ${isSolved ? 'solved' : 'todo'}`}
              >
                {isSolved ? (
                  <>
                    <CheckCircle size={14} aria-hidden="true" />
                    Marked solved
                  </>
                ) : (
                  <>
                    <Circle size={12} aria-hidden="true" />
                    Not solved
                  </>
                )}
              </span>
            </div>
          </div>

          <button
            type="button"
            className={`btn ${isSolved ? 'btn-secondary' : 'btn-primary'}`}
            onClick={handleToggle}
          >
            {isSolved ? 'Mark as unsolved' : 'Mark as solved'}
          </button>
        </header>

        <p className="problem-detail-status" role="status">
          {feedback?.id === problem.id ? feedback.message : ''}
        </p>

        <p className="practice-note" role="note">
          <strong>Sample problem:</strong> this page shows a static prompt and
          reference material only. There is no code runner, automatic judge or
          verified submission in this prototype.
        </p>

        <section className="problem-detail-card" aria-labelledby="prompt-title">
          <h2 className="section-title" id="prompt-title">
            Problem statement
          </h2>
          <p className="problem-description">{problem.description}</p>

          <div className="problem-examples">
            {problem.examples.map((example, index) => (
              <div className="problem-example" key={index}>
                <p className="problem-example-label">Example {index + 1}</p>
                <dl>
                  <div>
                    <dt>Input</dt>
                    <dd>
                      <code>{example.input}</code>
                    </dd>
                  </div>
                  <div>
                    <dt>Output</dt>
                    <dd>
                      <code>{example.output}</code>
                    </dd>
                  </div>
                  {example.explanation && (
                    <div>
                      <dt>Why</dt>
                      <dd>{example.explanation}</dd>
                    </div>
                  )}
                </dl>
              </div>
            ))}
          </div>
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
            <ul className="detail-list">
              {problem.constraints.map((constraint) => (
                <li key={constraint}>{constraint}</li>
              ))}
            </ul>
          </section>

          <section className="problem-detail-card" aria-labelledby="approach-title">
            <h2 className="section-title" id="approach-title">
              <Lightbulb size={16} aria-hidden="true" />
              Approach
            </h2>
            <p className="problem-description">{problem.approach}</p>
            <p className="complexity-line">
              <strong>Complexity:</strong> {problem.complexity}
            </p>
          </section>
        </div>

        <section className="problem-detail-card" aria-labelledby="hints-title">
          <h2 className="section-title" id="hints-title">
            Hints
          </h2>
          <div className="hint-list">
            {problem.hints.map((hint, index) => (
              <details className="hint-item" key={hint}>
                <summary>Hint {index + 1}</summary>
                <p>{hint}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="problem-detail-card" aria-labelledby="code-title">
          <h2 className="section-title" id="code-title">
            <Terminal size={16} aria-hidden="true" />
            Reference code
          </h2>
          <pre className="code-block">
            <code>{problem.starterCode}</code>
          </pre>
          <p className="code-note">
            Reference material copied into the prototype. It is not executed or
            scored.
          </p>
        </section>
      </div>
    </section>
  )
}
