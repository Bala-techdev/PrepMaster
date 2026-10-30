import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUp,
  CheckCircle,
  MessageSquare,
  Send,
  Users,
} from 'lucide-react'
import EmptyState from '../components/EmptyState'
import { formatRelativeTime } from '../lib/date'
import { useAppState } from '../state/appContext'
import './CommunityDetail.css'

const REPLY_MIN = 5
const REPLY_MAX = 600

export default function CommunityDetail() {
  const { discussionId } = useParams()
  const { community, addReply, toggleVote } = useAppState()
  /* State is keyed by discussion so drafts and notices never leak into a
     different thread when the route param changes. */
  const [draft, setDraft] = useState({ id: discussionId, text: '' })
  const [notice, setNotice] = useState(null)

  const discussion = community.discussions.find(
    (item) => item.id === discussionId,
  )
  const reply = draft.id === discussionId ? draft.text : ''
  const error =
    notice?.id === discussionId && notice.tone === 'error'
      ? notice.message
      : ''
  const feedback =
    notice?.id === discussionId && notice.tone === 'success'
      ? notice.message
      : ''

  if (!discussion) {
    return (
      <section className="community-detail-page">
        <div className="page-container">
          <EmptyState
            icon={MessageSquare}
            title="Discussion not found"
            description="This local discussion does not exist. It may have been removed when browser data was cleared."
          >
            <Link to="/community" className="btn btn-primary">
              Back to Community
            </Link>
          </EmptyState>
        </div>
      </section>
    )
  }

  const hasVoted = community.votedIds.includes(discussion.id)

  const handleReply = (event) => {
    event.preventDefault()
    const clean = reply.trim()
    setNotice(null)

    if (clean.length < REPLY_MIN) {
      setNotice({
        id: discussionId,
        tone: 'error',
        message: `Write at least ${REPLY_MIN} characters before posting a reply.`,
      })
      return
    }

    if (clean.length > REPLY_MAX) {
      setNotice({
        id: discussionId,
        tone: 'error',
        message: `Keep replies under ${REPLY_MAX} characters.`,
      })
      return
    }

    const result = addReply(discussion.id, clean)

    if (!result.ok) {
      setNotice({
        id: discussionId,
        tone: 'error',
        message: 'The reply could not be saved. Please try again.',
      })
      return
    }

    setDraft({ id: discussionId, text: '' })
    setNotice({
      id: discussionId,
      tone: 'success',
      message: 'Reply added to this local thread.',
    })
  }

  return (
    <section className="community-detail-page">
      <div className="page-container community-detail-container">
        <Link to="/community" className="back-link">
          <ArrowLeft size={15} aria-hidden="true" />
          Back to Community
        </Link>

        <article className="thread-card">
          <div className="thread-top">
            <div className="thread-badges">
              <span className="discussion-category">{discussion.category}</span>
              <span className="thread-local-badge">Local demo</span>
            </div>
            <span className="discussion-time">
              {formatRelativeTime(discussion.createdAt)}
            </span>
          </div>

          <h1 className="thread-title">{discussion.title}</h1>

          <div className="thread-author">
            <span className="thread-avatar" aria-hidden="true">
              {discussion.author.charAt(0).toUpperCase()}
            </span>
            <span>
              {discussion.author}
              {discussion.isDemo ? ' · seeded demo author' : ' · local author'}
            </span>
            <span className="thread-reply-count">
              <MessageSquare size={13} aria-hidden="true" />
              {discussion.replies.length} repl
              {discussion.replies.length === 1 ? 'y' : 'ies'}
            </span>
          </div>

          <p className="thread-body">{discussion.body}</p>

          <div className="thread-actions">
            <button
              type="button"
              className={`discussion-upvote${hasVoted ? ' active' : ''}`}
              onClick={() => toggleVote(discussion.id)}
              aria-pressed={hasVoted}
              aria-label={`${hasVoted ? 'Remove upvote from' : 'Upvote'} ${discussion.title}`}
            >
              <ArrowUp size={14} aria-hidden="true" />
              {discussion.upvotes} upvote{discussion.upvotes === 1 ? '' : 's'}
            </button>
            <span className="thread-note">
              <Users size={13} aria-hidden="true" />
              Stored in this browser only
            </span>
          </div>
        </article>

        <section className="thread-replies" aria-labelledby="replies-title">
          <h2 className="section-title" id="replies-title">
            Replies ({discussion.replies.length})
          </h2>

          {discussion.replies.length === 0 ? (
            <p className="thread-empty-replies">
              No replies yet. Add the first one below.
            </p>
          ) : (
            <ul className="reply-list">
              {discussion.replies.map((item) => (
                <li className="reply-item" key={item.id}>
                  <span className="reply-avatar" aria-hidden="true">
                    {item.author.charAt(0).toUpperCase()}
                  </span>
                  <div className="reply-main">
                    <div className="reply-head">
                      <span className="reply-author">{item.author}</span>
                      <span className="reply-time">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>
                    <p className="reply-body">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <form className="reply-form" onSubmit={handleReply} noValidate>
          <label className="composer-label" htmlFor="reply-input">
            Add a reply
          </label>
          <textarea
            id="reply-input"
            className="textarea"
            rows={3}
            placeholder="Share a helpful response..."
            value={reply}
            maxLength={REPLY_MAX}
            onChange={(event) => {
              setDraft({ id: discussionId, text: event.target.value })
              setNotice(null)
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'reply-error' : undefined}
          />
          {error && (
            <p className="field-error" id="reply-error" role="alert">
              {error}
            </p>
          )}
          <div className="composer-footer">
            <span className="composer-count">
              {reply.length}/{REPLY_MAX} characters
            </span>
            <button type="submit" className="btn btn-primary">
              <Send size={15} aria-hidden="true" />
              Post reply
            </button>
          </div>
          {feedback && (
            <p className="composer-feedback" role="status">
              <CheckCircle size={15} aria-hidden="true" />
              {feedback}
            </p>
          )}
        </form>

        <p className="community-note" role="note">
          <strong>Local demo:</strong> this thread and its replies are stored
          only in this browser. They are not visible to other users.
        </p>
      </div>
    </section>
  )
}
