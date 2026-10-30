import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowUpRight, CheckCircle, Filter, Search, X } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import DifficultyBadge from '../components/DifficultyBadge'
import { PROBLEMS, PROBLEM_DIFFICULTIES, PROBLEM_TOPICS } from '../data/problems'
import { useAppState } from '../state/appContext'
import './Practice.css'

const difficulties = ['All', ...PROBLEM_DIFFICULTIES]
const topics = ['All', ...PROBLEM_TOPICS]
const statuses = ['All', 'Solved', 'Unsolved']

export default function PracticePage() {
  const { stats } = useAppState()
  const [searchParams, setSearchParams] = useSearchParams()
  const [difficulty, setDifficulty] = useState('All')
  const [topic, setTopic] = useState('All')
  const [status, setStatus] = useState('All')

  /* The search box is driven by the URL, so the header search can hand
     off a query and typing stays shareable/refresh-safe. */
  const searchQuery = searchParams.get('q') || ''

  const updateSearch = (value) => {
    setSearchParams(value ? { q: value } : {}, { replace: true })
  }

  const filteredProblems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return PROBLEMS.filter((problem) => {
      const isSolved = stats.solvedSet.has(problem.id)
      const matchesDifficulty =
        difficulty === 'All' || problem.difficulty === difficulty
      const matchesTopic = topic === 'All' || problem.topic === topic
      const matchesStatus =
        status === 'All' || (status === 'Solved' ? isSolved : !isSolved)
      const matchesSearch =
        query.length === 0 ||
        problem.title.toLowerCase().includes(query) ||
        problem.topic.toLowerCase().includes(query)

      return (
        matchesDifficulty && matchesTopic && matchesStatus && matchesSearch
      )
    })
  }, [difficulty, searchQuery, stats.solvedSet, status, topic])

  const hasFilters =
    searchQuery.trim() !== '' ||
    difficulty !== 'All' ||
    topic !== 'All' ||
    status !== 'All'

  const clearFilters = () => {
    setDifficulty('All')
    setTopic('All')
    setStatus('All')
    setSearchParams({}, { replace: true })
  }

  return (
    <section className="practice-page">
      <div className="page-container">
        <header className="page-head">
          <div>
            <p className="page-eyebrow">Problem set</p>
            <h1 className="page-title">Practice</h1>
            <p className="page-subtitle">
              Sample problems for frontend practice. Mark problems solved
              yourself — nothing is judged automatically.
            </p>
          </div>
          <p className="practice-count">
            <strong>{filteredProblems.length}</strong> of {PROBLEMS.length}{' '}
            problems
          </p>
        </header>

        <div className="practice-filters">
          <div className="search-field">
            <Search className="filter-icon" size={18} aria-hidden="true" />
            <input
              type="search"
              placeholder="Search problems by title or topic..."
              value={searchQuery}
              onChange={(event) => updateSearch(event.target.value)}
              aria-label="Search problems"
            />
          </div>

          <div className="filter-row">
            <span className="filter-label">
              <Filter size={14} aria-hidden="true" />
              Difficulty
            </span>
            <div
              className="chip-row"
              role="group"
              aria-label="Filter by difficulty"
            >
              {difficulties.map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`filter-chip${difficulty === level ? ' active' : ''}`}
                  onClick={() => setDifficulty(level)}
                  aria-pressed={difficulty === level}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-row">
            <span className="filter-label">Topic</span>
            <div className="chip-row" role="group" aria-label="Filter by topic">
              {topics.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`filter-chip${topic === item ? ' active' : ''}`}
                  onClick={() => setTopic(item)}
                  aria-pressed={topic === item}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-row">
            <span className="filter-label">Status</span>
            <div
              className="chip-row"
              role="group"
              aria-label="Filter by solved status"
            >
              {statuses.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`filter-chip${status === item ? ' active' : ''}`}
                  onClick={() => setStatus(item)}
                  aria-pressed={status === item}
                >
                  {item}
                </button>
              ))}
            </div>
            {hasFilters && (
              <button
                type="button"
                className="clear-filters"
                onClick={clearFilters}
              >
                <X size={14} aria-hidden="true" />
                Clear filters
              </button>
            )}
          </div>
        </div>

        <p className="practice-note" role="note">
          <strong>Sample data:</strong> these problems are static frontend
          content. No code execution or online judge is connected, and the
          solved status is stored only in this browser.
        </p>

        {filteredProblems.length === 0 ? (
          <EmptyState
            title="No problems found"
            description="Try a different search term, difficulty, topic, or status filter."
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={clearFilters}
            >
              Clear all filters
            </button>
          </EmptyState>
        ) : (
          <div className="problem-list">
            {filteredProblems.map((problem) => {
              const isSolved = stats.solvedSet.has(problem.id)

              return (
                <article
                  key={problem.id}
                  className={`problem-card ${isSolved ? 'solved' : 'unsolved'}`}
                >
                  <div className="problem-main">
                    <h2 className="problem-title">
                      <Link
                        to={`/practice/${problem.id}`}
                        className="problem-title-link"
                      >
                        {problem.title}
                        <ArrowUpRight size={14} aria-hidden="true" />
                      </Link>
                    </h2>
                    <div className="problem-meta">
                      <DifficultyBadge difficulty={problem.difficulty} />
                      <span className="problem-topic">{problem.topic}</span>
                    </div>
                    <p className="problem-summary">{problem.summary}</p>
                  </div>

                  <div className="problem-side">
                    <span
                      className={`problem-status ${isSolved ? 'solved' : 'todo'}`}
                    >
                      {isSolved ? (
                        <>
                          <CheckCircle size={14} aria-hidden="true" />
                          Solved
                        </>
                      ) : (
                        'Not solved'
                      )}
                    </span>
                    <Link
                      to={`/practice/${problem.id}`}
                      className="btn btn-secondary problem-open-btn"
                    >
                      Open
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
