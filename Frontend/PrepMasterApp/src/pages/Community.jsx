import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUp,
  CheckCircle,
  Filter,
  MessageSquare,
  Search,
  Users,
  X,
} from 'lucide-react'
import EmptyState from '../components/EmptyState'
import { DISCUSSION_TOPICS } from '../data/discussions'
import { formatRelativeTime } from '../lib/date'
import { useAppState } from '../state/appContext'
import './Community.css'

const TITLE_MIN = 5
const TITLE_MAX = 120
const BODY_MIN = 10
const BODY_MAX = 600

export default function CommunityPage() {
  const { community, addDiscussion, toggleVote } = useAppState()
  const [searchQuery, setSearchQuery] = useState('')
  const [topic, setTopic] = useState('All')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('General')
  const [errors, setErrors] = useState({})
  const [feedback, setFeedback] = useState('')

  const filteredDiscussions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return community.discussions.filter((discussion) => {
      const matchesTopic = topic === 'All' || discussion.category === topic
      const matchesSearch =
        query.length === 0 ||
        discussion.title.toLowerCase().includes(query) ||
        discussion.body.toLowerCase().includes(query) ||
        discussion.category.toLowerCase().includes(query)

      return matchesTopic && matchesSearch
    })
  }, [community.discussions, searchQuery, topic])

  const hasFilters = searchQuery.trim() !== '' || topic !== 'All'

  const clearFilters = () => {
    setSearchQuery('')
    setTopic('All')
  }

  const validate = () => {
    const nextErrors = {}
    const cleanTitle = title.trim()
    const cleanBody = body.trim()

    if (cleanTitle.length < TITLE_MIN) {
      nextErrors.title = `Give the discussion a title of at least ${TITLE_MIN} characters.`
    } else if (cleanTitle.length > TITLE_MAX) {
      nextErrors.title = `Keep the title under ${TITLE_MAX} characters.`
    }

    if (cleanBody.length < BODY_MIN) {
      nextErrors.body = `Add a little more detail (at least ${BODY_MIN} characters).`
    } else if (cleanBody.length > BODY_MAX) {
      nextErrors.body = `Keep the post under ${BODY_MAX} characters.`
    }

    return nextErrors
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setFeedback('')
    const nextErrors = validate()

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    const result = addDiscussion({
      title: title.trim(),
      body: body.trim(),
      category,
    })

    if (!result.ok) {
      setErrors({
        form: 'The discussion could not be saved. Check the fields and try again.',
      })
      return
    }

    setErrors({})
    setTitle('')
    setBody('')
    setCategory('General')
    setFeedback(
      'Discussion posted in this browser. It is local demo data and is not visible to other users.',
    )
  }

  return (
    <section className="community-page">
      <div className="page-container">
        <header className="page-head">
          <div>
            <p className="page-eyebrow">Community</p>
            <h1 className="page-title">Community</h1>
            <p className="page-subtitle">
              Share study notes and questions in this local prototype.
            </p>
          </div>
          <span className="community-count">
            {filteredDiscussions.length} discussion
            {filteredDiscussions.length === 1 ? '' : 's'}
          </span>
        </header>

        <p className="community-note" role="note">
          <strong>Local demo:</strong> seeded discussions and anything you post
          stay in this browser. They are not uploaded and are not visible to
          other users.
        </p>

        <form className="discussion-composer" onSubmit={handleSubmit} noValidate>
          <h2 className="composer-label" id="composer-title">
            Start a discussion
          </h2>

          <div className="composer-field">
            <label htmlFor="discussion-title">Title</label>
            <input
              type="text"
              id="discussion-title"
              className="input"
              placeholder="What do you want to discuss?"
              value={title}
              maxLength={TITLE_MAX}
              onChange={(event) => {
                setTitle(event.target.value)
                setFeedback('')
                if (errors.title) setErrors((current) => ({ ...current, title: undefined }))
              }}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'discussion-title-error' : undefined}
            />
            {errors.title && (
              <p className="field-error" id="discussion-title-error" role="alert">
                {errors.title}
              </p>
            )}
          </div>

          <div className="composer-field">
            <label htmlFor="discussion-category">Topic</label>
            <select
              id="discussion-category"
              className="select"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {DISCUSSION_TOPICS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="composer-field">
            <label htmlFor="discussion-input">Details</label>
            <textarea
              id="discussion-input"
              className="textarea"
              placeholder="Ask a question or share a study tip..."
              value={body}
              onChange={(event) => {
                setBody(event.target.value)
                setFeedback('')
                if (errors.body) setErrors((current) => ({ ...current, body: undefined }))
              }}
              maxLength={BODY_MAX}
              rows={4}
              aria-invalid={Boolean(errors.body)}
              aria-describedby={errors.body ? 'discussion-body-error' : undefined}
            />
            {errors.body && (
              <p className="field-error" id="discussion-body-error" role="alert">
                {errors.body}
              </p>
            )}
          </div>

          <div className="composer-footer">
            <span className="composer-count">
              {body.length}/{BODY_MAX} characters
            </span>
            <button type="submit" className="btn btn-primary">
              Post discussion
            </button>
          </div>

          {errors.form && (
            <p className="field-error" role="alert">
              {errors.form}
            </p>
          )}
          {feedback && (
            <p className="composer-feedback" role="status">
              <CheckCircle size={15} aria-hidden="true" />
              {feedback}
            </p>
          )}
        </form>

        <div className="community-toolbar">
          <div className="search-field">
            <Search className="filter-icon" size={18} aria-hidden="true" />
            <input
              type="search"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              aria-label="Search discussions"
            />
          </div>

          <div className="filter-row">
            <span className="filter-label">
              <Filter size={14} aria-hidden="true" />
              Topic
            </span>
            <div className="chip-row" role="group" aria-label="Filter discussions by topic">
              <button
                type="button"
                className={`filter-chip${topic === 'All' ? ' active' : ''}`}
                onClick={() => setTopic('All')}
                aria-pressed={topic === 'All'}
              >
                All
              </button>
              {DISCUSSION_TOPICS.map((item) => (
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
            {hasFilters && (
              <button type="button" className="clear-filters" onClick={clearFilters}>
                <X size={14} aria-hidden="true" />
                Clear filters
              </button>
            )}
          </div>
        </div>

        {filteredDiscussions.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No discussions found"
            description="Try a different search term or topic, or start a new local discussion above."
          >
            <button type="button" className="btn btn-secondary" onClick={clearFilters}>
              Clear filters
            </button>
          </EmptyState>
        ) : (
          <div className="discussions">
            {filteredDiscussions.map((discussion) => {
              const hasVoted = community.votedIds.includes(discussion.id)

              return (
                <article key={discussion.id} className="discussion-card">
                  <div className="discussion-header">
                    <span className="discussion-category">
                      {discussion.category}
                    </span>
                    <span className="discussion-time">
                      {formatRelativeTime(discussion.createdAt)}
                    </span>
                  </div>

                  <h2 className="discussion-title">
                    <Link
                      to={`/community/${discussion.id}`}
                      className="discussion-title-link"
                    >
                      {discussion.title}
                    </Link>
                  </h2>

                  <p className="discussion-excerpt">{discussion.body}</p>

                  <div className="discussion-footer">
                    <div className="discussion-meta">
                      <span className="discussion-meta-item">
                        <Users size={13} aria-hidden="true" />
                        {discussion.author}
                        {discussion.isDemo ? ' · demo' : ''}
                      </span>
                      <span className="discussion-meta-item">
                        <MessageSquare size={13} aria-hidden="true" />
                        {discussion.replies.length} repl
                        {discussion.replies.length === 1 ? 'y' : 'ies'}
                      </span>
                    </div>

                    <button
                      type="button"
                      className={`discussion-upvote${hasVoted ? ' active' : ''}`}
                      onClick={() => toggleVote(discussion.id)}
                      aria-pressed={hasVoted}
                      aria-label={`${hasVoted ? 'Remove upvote from' : 'Upvote'} ${discussion.title}`}
                    >
                      <ArrowUp size={13} aria-hidden="true" />
                      {discussion.upvotes}
                    </button>
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
