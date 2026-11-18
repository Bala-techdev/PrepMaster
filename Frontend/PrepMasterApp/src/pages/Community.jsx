import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUp,
  CheckCircle,
  Filter,
  MessageSquare,
  Search,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import EmptyState from '../components/EmptyState'
import PageState from '../components/PageState'
import Pagination from '../components/Pagination'
import {
  createCommunityPost,
  getCommunityActivity,
  getCommunityPosts,
  getCommunityTopics,
  toggleCommunityLike,
} from '../api/communityService'
import { formatRelativeTime } from '../lib/date'
import './Community.css'

const PAGE_SIZE = 9
const TITLE_MIN = 5
const TITLE_MAX = 160
const BODY_MIN = 10
const BODY_MAX = 4000

const emptyForm = { title: '', body: '', topic: 'DSA' }

function authorName(author) {
  return author?.displayName || author?.username || 'PrepMaster learner'
}

function validatePost(form) {
  const errors = {}
  const title = form.title.trim()
  const body = form.body.trim()

  if (title.length < TITLE_MIN) {
    errors.title = `Give the discussion a title of at least ${TITLE_MIN} characters.`
  } else if (title.length > TITLE_MAX) {
    errors.title = `Keep the title under ${TITLE_MAX} characters.`
  }

  if (body.length < BODY_MIN) {
    errors.body = `Add a little more detail (at least ${BODY_MIN} characters).`
  } else if (body.length > BODY_MAX) {
    errors.body = `Keep the post under ${BODY_MAX} characters.`
  }

  if (!form.topic) {
    errors.topic = 'Choose a topic.'
  }

  return errors
}

export default function CommunityPage() {
  const [topics, setTopics] = useState([])
  const [topicsError, setTopicsError] = useState('')
  const [posts, setPosts] = useState([])
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    totalPages: 0,
    totalElements: 0,
  })
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [topic, setTopic] = useState('All')
  const [sort, setSort] = useState('recent')
  const [reloadToken, setReloadToken] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState('')
  const [activity, setActivity] = useState([])
  const [activityError, setActivityError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [creating, setCreating] = useState(false)
  const [notice, setNotice] = useState('')
  const [likingId, setLikingId] = useState(null)

  useEffect(() => {
    let active = true

    getCommunityTopics()
      .then((data) => {
        if (!active) return
        const list = data || []
        setTopics(list)
        setTopicsError('')
        setForm((current) =>
          current.topic || list.length === 0
            ? current
            : { ...current, topic: list[0] },
        )
      })
      .catch((requestError) => {
        if (active) {
          setTopicsError(
            requestError.message || 'Community topics could not be loaded.',
          )
        }
      })

    getCommunityActivity(8)
      .then((data) => active && setActivity(data || []))
      .catch((requestError) => {
        if (active) {
          setActivityError(
            requestError.message || 'Recent activity could not be loaded.',
          )
        }
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(0)
    }, 300)

    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    getCommunityPosts({
      page,
      size: PAGE_SIZE,
      search: debouncedSearch || undefined,
      topic: topic === 'All' ? undefined : topic,
      sort,
    })
      .then((data) => {
        if (!active) return
        setPosts(data?.content || [])
        setPageInfo({
          page: Number(data?.page) || 0,
          totalPages: Number(data?.totalPages) || 0,
          totalElements: Number(data?.totalElements) || 0,
        })
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError)
          setPosts([])
          setPageInfo({ page: 0, totalPages: 0, totalElements: 0 })
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [debouncedSearch, page, reloadToken, sort, topic])

  const clearFilters = () => {
    setSearch('')
    setTopic('All')
    setSort('recent')
    setPage(0)
  }

  const hasFilters =
    search.trim() !== '' || topic !== 'All' || sort !== 'recent'

  const updateForm = (patch) => {
    setForm((current) => ({ ...current, ...patch }))
    setNotice('')
    setActionError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (creating) return

    const nextErrors = validatePost(form)
    if (Object.keys(nextErrors).length) {
      setFormErrors(nextErrors)
      setActionError('')
      return
    }

    setCreating(true)
    setFormErrors({})
    setActionError('')
    setNotice('')

    try {
      await createCommunityPost({
        title: form.title.trim(),
        body: form.body.trim(),
        topic: form.topic,
      })
      setForm((current) => ({ ...current, title: '', body: '' }))
      setTopic('All')
      setSort('recent')
      setPage(0)
      setReloadToken((current) => current + 1)
      setNotice('Discussion posted. It is now visible to signed-in learners.')
      getCommunityActivity(8)
        .then((data) => setActivity(data || []))
        .catch(() => {})
    } catch (requestError) {
      if (
        requestError.fieldErrors &&
        Object.keys(requestError.fieldErrors).length
      ) {
        setFormErrors(requestError.fieldErrors)
      }
      setActionError(
        requestError.message ||
          'The discussion could not be posted. Check the fields and try again.',
      )
    } finally {
      setCreating(false)
    }
  }

  const handleLike = async (post) => {
    if (likingId) return
    setLikingId(post.id)
    setActionError('')

    try {
      const state = await toggleCommunityLike(post.id)
      setPosts((current) =>
        current.map((item) =>
          item.id === post.id
            ? {
                ...item,
                likeCount: Number(state.likeCount) || 0,
                likedByMe: Boolean(state.liked),
              }
            : item,
        ),
      )
    } catch (requestError) {
      setActionError(
        requestError.message || 'The like could not be updated. Try again.',
      )
    } finally {
      setLikingId(null)
    }
  }

  const totalPages = pageInfo.totalPages

  return (
    <section className="community-page">
      <div className="page-container">
        <header className="page-head">
          <div>
            <p className="page-eyebrow">Community</p>
            <h1 className="page-title">Community</h1>
            <p className="page-subtitle">
              Share study notes, ask questions and react to other learners.
              Posts are stored in PrepMaster and visible to signed-in users.
            </p>
          </div>
          <span className="community-count">
            {pageInfo.totalElements} discussion
            {pageInfo.totalElements === 1 ? '' : 's'}
          </span>
        </header>

        <p className="community-note" role="note">
          <strong>Community guidelines:</strong> be specific and helpful. Do not
          post passwords, private contact details or anything you would not
          share publicly. Posts are plain text and sanitized by the backend.
        </p>

        {actionError && (
          <p className="community-alert" role="alert">
            {actionError}
          </p>
        )}

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
              value={form.title}
              maxLength={TITLE_MAX}
              onChange={(event) => {
                updateForm({ title: event.target.value })
                setFormErrors((current) => ({ ...current, title: undefined }))
              }}
              aria-invalid={Boolean(formErrors.title)}
              aria-describedby={
                formErrors.title ? 'discussion-title-error' : undefined
              }
            />
            {formErrors.title && (
              <p
                className="field-error"
                id="discussion-title-error"
                role="alert"
              >
                {formErrors.title}
              </p>
            )}
          </div>

          <div className="discussion-composer-row">
            <div className="composer-field">
              <label htmlFor="discussion-category">Topic</label>
              <select
                id="discussion-category"
                className="select"
                value={form.topic}
                onChange={(event) => {
                  updateForm({ topic: event.target.value })
                  setFormErrors((current) => ({
                    ...current,
                    topic: undefined,
                  }))
                }}
                aria-invalid={Boolean(formErrors.topic)}
              >
                {topics.length === 0 && (
                  <option value={form.topic}>{form.topic || 'Loading…'}</option>
                )}
                {topics.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              {formErrors.topic && (
                <p className="field-error" role="alert">
                  {formErrors.topic}
                </p>
              )}
              {topicsError && (
                <p className="field-error" role="alert">
                  {topicsError}
                </p>
              )}
            </div>
          </div>

          <div className="composer-field">
            <label htmlFor="discussion-input">Details</label>
            <textarea
              id="discussion-input"
              className="textarea"
              placeholder="Ask a question or share a study tip..."
              value={form.body}
              onChange={(event) => {
                updateForm({ body: event.target.value })
                setFormErrors((current) => ({ ...current, body: undefined }))
              }}
              maxLength={BODY_MAX}
              rows={4}
              aria-invalid={Boolean(formErrors.body)}
              aria-describedby={
                formErrors.body ? 'discussion-body-error' : undefined
              }
            />
            {formErrors.body && (
              <p className="field-error" id="discussion-body-error" role="alert">
                {formErrors.body}
              </p>
            )}
          </div>

          <div className="composer-footer">
            <span className="composer-count">
              {form.body.length}/{BODY_MAX} characters
            </span>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={creating || topics.length === 0}
            >
              <MessageSquare size={15} aria-hidden="true" />
              {creating ? 'Posting…' : 'Post discussion'}
            </button>
          </div>

          {notice && (
            <p className="composer-feedback" role="status">
              <CheckCircle size={15} aria-hidden="true" />
              {notice}
            </p>
          )}
        </form>

        <div className="community-toolbar">
          <div className="search-field">
            <Search className="filter-icon" size={18} aria-hidden="true" />
            <input
              type="search"
              placeholder="Search discussions..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search discussions"
            />
          </div>

          <div className="filter-row">
            <span className="filter-label">
              <Filter size={14} aria-hidden="true" />
              Topic
            </span>
            <div
              className="chip-row"
              role="group"
              aria-label="Filter discussions by topic"
            >
              <button
                type="button"
                className={`filter-chip${topic === 'All' ? ' active' : ''}`}
                onClick={() => {
                  setTopic('All')
                  setPage(0)
                }}
                aria-pressed={topic === 'All'}
              >
                All
              </button>
              {topics.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`filter-chip${topic === item ? ' active' : ''}`}
                  onClick={() => {
                    setTopic(item)
                    setPage(0)
                  }}
                  aria-pressed={topic === item}
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

          <div className="community-sort" role="group" aria-label="Sort posts">
            <span className="filter-label">Sort</span>
            <button
              type="button"
              className={`filter-chip${sort === 'recent' ? ' active' : ''}`}
              onClick={() => {
                setSort('recent')
                setPage(0)
              }}
              aria-pressed={sort === 'recent'}
            >
              Recent
            </button>
            <button
              type="button"
              className={`filter-chip${sort === 'popular' ? ' active' : ''}`}
              onClick={() => {
                setSort('popular')
                setPage(0)
              }}
              aria-pressed={sort === 'popular'}
            >
              Most liked
            </button>
          </div>
        </div>

        <div className="community-layout">
          <div className="community-main">
            {loading ? (
              <PageState
                variant="loading"
                title="Loading discussions"
                description="Fetching posts, likes and comment counts."
              />
            ) : error ? (
              <PageState
                variant="error"
                title="Discussions could not be loaded"
                description={error.message}
                onRetry={() => setReloadToken((current) => current + 1)}
              />
            ) : posts.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No discussions found"
                description="Try a different search term or topic, or start a new discussion above."
              >
                {hasFilters && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={clearFilters}
                  >
                    Clear filters
                  </button>
                )}
              </EmptyState>
            ) : (
              <>
                <div className="discussions">
                  {posts.map((post) => (
                    <article key={post.id} className="discussion-card">
                      <div className="discussion-header">
                        <span className="discussion-category">
                          {post.topic}
                        </span>
                        <span className="discussion-time">
                          {formatRelativeTime(post.createdAt)}
                        </span>
                      </div>

                      <h2 className="discussion-title">
                        <Link
                          to={`/community/${post.id}`}
                          className="discussion-title-link"
                        >
                          {post.title}
                        </Link>
                      </h2>

                      <p className="discussion-excerpt">{post.excerpt}</p>

                      <div className="discussion-footer">
                        <div className="discussion-meta">
                          <span className="discussion-meta-item">
                            <Users size={13} aria-hidden="true" />
                            {authorName(post.author)}
                            {post.ownedByMe ? ' · you' : ''}
                          </span>
                          <span className="discussion-meta-item">
                            <MessageSquare size={13} aria-hidden="true" />
                            {post.commentCount}{' '}
                            {post.commentCount === 1 ? 'comment' : 'comments'}
                          </span>
                        </div>

                        <button
                          type="button"
                          className={`discussion-upvote${post.likedByMe ? ' active' : ''}`}
                          onClick={() => handleLike(post)}
                          disabled={likingId === post.id}
                          aria-pressed={Boolean(post.likedByMe)}
                          aria-label={`${post.likedByMe ? 'Remove like from' : 'Like'} ${post.title}`}
                        >
                          <ArrowUp size={13} aria-hidden="true" />
                          {post.likeCount}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                <Pagination
                  page={pageInfo.page}
                  totalPages={totalPages}
                  onChange={setPage}
                  disabled={loading}
                  label="Community discussions pagination"
                />
              </>
            )}
          </div>

          <aside className="community-side" aria-labelledby="activity-title">
            <section className="community-activity-card">
              <div className="mock-section-head">
                <div>
                  <h2 className="composer-label" id="activity-title">
                    Recent activity
                  </h2>
                  <p className="setup-help">
                    Latest posts and comments across the community.
                  </p>
                </div>
                <Sparkles
                  className="mock-section-icon"
                  size={17}
                  aria-hidden="true"
                />
              </div>

              {activityError ? (
                <p className="field-error" role="alert">
                  {activityError}
                </p>
              ) : activity.length === 0 ? (
                <p className="community-activity-empty">
                  No activity yet. Start the first discussion.
                </p>
              ) : (
                <ul className="community-activity-list">
                  {activity.map((item, index) => (
                    <li
                      key={`${item.type}-${item.postId}-${index}`}
                      className="community-activity-item"
                    >
                      <span className="community-activity-dot" aria-hidden="true" />
                      <div>
                        <p className="community-activity-title">
                          <Link to={`/community/${item.postId}`}>
                            {item.title}
                          </Link>
                        </p>
                        <p className="community-activity-meta">
                          {item.type === 'COMMENT' ? 'Comment' : 'Post'} by{' '}
                          {item.actorName || 'a learner'} ·{' '}
                          {formatRelativeTime(item.at)}
                        </p>
                        {item.detail && (
                          <p className="community-activity-detail">
                            {item.detail}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="community-activity-card">
              <h2 className="composer-label">Community rules</h2>
              <ul className="community-rule-list">
                <li>Keep posts and comments respectful.</li>
                <li>Do not share personal or private information.</li>
                <li>Posting and commenting are rate limited to prevent spam.</li>
                <li>You can edit or delete only your own posts and comments.</li>
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </section>
  )
}
