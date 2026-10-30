import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowUpRight, CheckCircle, Filter, Search, X } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import DifficultyBadge from '../components/DifficultyBadge'
import PageState from '../components/PageState'
import { getQuestions } from '../api/learningService'
import { useAppData } from '../state/useAppData'
import { difficultyLabel } from '../lib/format'
import './Practice.css'

const difficulties = ['All', 'Easy', 'Medium', 'Hard']
const statuses = ['All', 'Solved', 'Unsolved']
const PAGE_SIZE = 9
const FETCH_SIZE = 200

async function fetchFilteredQuestions({ difficulty, topicId, search, signal }) {
  const params = {
    difficulty: difficulty === 'All' ? undefined : difficulty.toUpperCase(),
    topicId: topicId === 'All' ? undefined : topicId,
    search: search || undefined,
  }

  const first = await getQuestions({ ...params, page: 0, size: FETCH_SIZE }, { signal })
  const content = [...(first.content || [])]
  const totalPages = Math.min(Number(first.totalPages) || 1, 20)

  for (let page = 1; page < totalPages; page += 1) {
    const next = await getQuestions({ ...params, page, size: FETCH_SIZE }, { signal })
    content.push(...(next.content || []))
  }

  return content
}

export default function PracticePage() {
  const { stats, topics } = useAppData()
  const [searchParams, setSearchParams] = useSearchParams()
  const [difficulty, setDifficulty] = useState('All')
  const [topic, setTopic] = useState('All')
  const [status, setStatus] = useState('All')
  const [page, setPage] = useState(0)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  /* The search box is driven by the URL, so the header search can hand
     off a query and typing stays shareable/refresh-safe. */
  const searchQuery = searchParams.get('q') || ''
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim())
    }, 250)

    return () => window.clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    let active = true
    const controller = new AbortController()

    setLoading(true)
    setError(null)

    fetchFilteredQuestions({
      difficulty,
      topicId: topic,
      search: debouncedSearch,
      signal: controller.signal,
    })
      .then((content) => {
        if (!active) return
        setResults(content)
      })
      .catch((requestError) => {
        if (!active) return
        setError(requestError)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [debouncedSearch, difficulty, reloadKey, topic])

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch, difficulty, status, topic])

  const visibleProblems = useMemo(() => {
    const solvedIds = stats.solvedSet
    return results.filter((question) => {
      if (status === 'All') return true
      const isSolved = solvedIds.has(question.id)
      return status === 'Solved' ? isSolved : !isSolved
    })
  }, [results, stats.solvedSet, status])

  const totalPages = Math.max(1, Math.ceil(visibleProblems.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages - 1)
  const pageProblems = visibleProblems.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE,
  )

  const updateSearch = (value) => {
    setSearchParams(value ? { q: value } : {}, { replace: true })
  }

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

  const retry = () => setReloadKey((key) => key + 1)

  return (
    <section className="practice-page">
      <div className="page-container">
        <header className="page-head">
          <div>
            <p className="page-eyebrow">Problem set</p>
            <h1 className="page-title">Practice</h1>
            <p className="page-subtitle">
              Search the learning catalog and open a question&apos;s full prompt.
              Solved status comes from completed daily-plan tasks.
            </p>
          </div>
          <p className="practice-count">
            <strong>{visibleProblems.length}</strong> of {results.length}{' '}
            matching questions
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
              <button
                type="button"
                className={`filter-chip${topic === 'All' ? ' active' : ''}`}
                onClick={() => setTopic('All')}
                aria-pressed={topic === 'All'}
              >
                All
              </button>
              {topics.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`filter-chip${topic === String(item.id) ? ' active' : ''}`}
                  onClick={() => setTopic(String(item.id))}
                  aria-pressed={topic === String(item.id)}
                >
                  {item.name}
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
          <strong>Recorded progress:</strong> questions and filters are loaded
          from the backend learning catalog. A question is marked solved only
          when a daily-plan task containing it is completed — there is no
          separate judge or manual solved toggle.
        </p>

        {error ? (
          <PageState
            variant="error"
            title="Questions could not be loaded"
            description={error.message}
            onRetry={retry}
          />
        ) : loading ? (
          <p className="practice-loading" role="status">
            Loading questions from the backend…
          </p>
        ) : visibleProblems.length === 0 ? (
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
          <>
            <div className="problem-list">
              {pageProblems.map((problem) => {
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
                        <DifficultyBadge
                          difficulty={difficultyLabel(problem.difficulty)}
                        />
                        <span className="problem-topic">{problem.topicName}</span>
                      </div>
                      <p className="problem-summary">{problem.description}</p>
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

            {totalPages > 1 && (
              <nav className="practice-pagination" aria-label="Problem pages">
                <button
                  type="button"
                  className="btn btn-secondary pagination-btn"
                  onClick={() => setPage((value) => Math.max(0, value - 1))}
                  disabled={currentPage === 0}
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary pagination-btn"
                  onClick={() =>
                    setPage((value) => Math.min(totalPages - 1, value + 1))
                  }
                  disabled={currentPage === totalPages - 1}
                >
                  Next
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </section>
  )
}
