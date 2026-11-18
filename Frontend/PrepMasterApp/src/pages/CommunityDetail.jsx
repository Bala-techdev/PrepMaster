import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUp,
  CheckCircle,
  Edit3,
  MessageSquare,
  Send,
  Trash2,
  Users,
} from 'lucide-react'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import PageState from '../components/PageState'
import Pagination from '../components/Pagination'
import {
  createCommunityComment,
  deleteCommunityComment,
  deleteCommunityPost,
  getCommunityComments,
  getCommunityPost,
  getCommunityTopics,
  toggleCommunityLike,
  updateCommunityComment,
  updateCommunityPost,
} from '../api/communityService'
import { formatDate, formatRelativeTime } from '../lib/date'
import './CommunityDetail.css'

const TITLE_MIN = 5
const TITLE_MAX = 160
const BODY_MIN = 10
const BODY_MAX = 4000
const COMMENT_MAX = 2000
const COMMENT_PAGE_SIZE = 20

function authorName(author) {
  return author?.displayName || author?.username || 'PrepMaster learner'
}

function initialOf(author) {
  return (authorName(author).charAt(0) || 'P').toUpperCase()
}

function validatePost(form) {
  const errors = {}
  const title = form.title.trim()
  const body = form.body.trim()

  if (title.length < TITLE_MIN || title.length > TITLE_MAX) {
    errors.title = `Use a title between ${TITLE_MIN} and ${TITLE_MAX} characters.`
  }
  if (body.length < BODY_MIN || body.length > BODY_MAX) {
    errors.body = `Use a body between ${BODY_MIN} and ${BODY_MAX} characters.`
  }
  if (!form.topic) errors.topic = 'Choose a topic.'

  return errors
}

export default function CommunityDetail() {
  const { discussionId } = useParams()
  const navigate = useNavigate()

  const [topics, setTopics] = useState([])
  const [post, setPost] = useState(null)
  const [postLoading, setPostLoading] = useState(true)
  const [postError, setPostError] = useState(null)
  const [comments, setComments] = useState([])
  const [commentPageInfo, setCommentPageInfo] = useState({
    page: 0,
    totalPages: 0,
    totalElements: 0,
  })
  const [commentPage, setCommentPage] = useState(0)
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [commentsError, setCommentsError] = useState(null)
  const [reloadToken, setReloadToken] = useState(0)
  const [draft, setDraft] = useState('')
  const [commentError, setCommentError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [liking, setLiking] = useState(false)

  const [editPostOpen, setEditPostOpen] = useState(false)
  const [editPostForm, setEditPostForm] = useState({
    title: '',
    body: '',
    topic: '',
  })
  const [editPostErrors, setEditPostErrors] = useState({})
  const [deletePostOpen, setDeletePostOpen] = useState(false)

  const [editCommentId, setEditCommentId] = useState(null)
  const [editCommentBody, setEditCommentBody] = useState('')
  const [deleteCommentId, setDeleteCommentId] = useState(null)

  useEffect(() => {
    let active = true
    getCommunityTopics()
      .then((data) => active && setTopics(data || []))
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    setPostLoading(true)
    setPostError(null)

    getCommunityPost(discussionId)
      .then((data) => {
        if (active) setPost(data)
      })
      .catch((requestError) => {
        if (active) {
          setPost(null)
          setPostError(requestError)
        }
      })
      .finally(() => {
        if (active) setPostLoading(false)
      })

    return () => {
      active = false
    }
  }, [discussionId, reloadToken])

  useEffect(() => {
    let active = true
    setCommentsLoading(true)
    setCommentsError(null)

    getCommunityComments(discussionId, {
      page: commentPage,
      size: COMMENT_PAGE_SIZE,
    })
      .then((data) => {
        if (!active) return
        setComments(data?.content || [])
        setCommentPageInfo({
          page: Number(data?.page) || 0,
          totalPages: Number(data?.totalPages) || 0,
          totalElements: Number(data?.totalElements) || 0,
        })
      })
      .catch((requestError) => {
        if (active) {
          setComments([])
          setCommentsError(requestError)
        }
      })
      .finally(() => {
        if (active) setCommentsLoading(false)
      })

    return () => {
      active = false
    }
  }, [commentPage, discussionId, reloadToken])

  const totalComments = useMemo(
    () => Number(post?.commentCount) || commentPageInfo.totalElements || 0,
    [commentPageInfo.totalElements, post?.commentCount],
  )

  const handleLike = async () => {
    if (!post || liking) return
    setLiking(true)
    setNotice('')
    setCommentError('')

    try {
      const state = await toggleCommunityLike(post.id)
      setPost((current) =>
        current
          ? {
              ...current,
              likeCount: Number(state.likeCount) || 0,
              likedByMe: Boolean(state.liked),
            }
          : current,
      )
    } catch (requestError) {
      setCommentError(
        requestError.message || 'The like could not be updated. Try again.',
      )
    } finally {
      setLiking(false)
    }
  }

  const startEditPost = () => {
    if (!post) return
    setEditPostForm({
      title: post.title,
      body: post.body,
      topic: post.topic,
    })
    setEditPostErrors({})
    setEditPostOpen(true)
  }

  const savePostEdit = async (event) => {
    event.preventDefault()
    if (busy) return

    const nextErrors = validatePost(editPostForm)
    if (Object.keys(nextErrors).length) {
      setEditPostErrors(nextErrors)
      return
    }

    setBusy(true)
    setEditPostErrors({})

    try {
      const updated = await updateCommunityPost(post.id, {
        title: editPostForm.title.trim(),
        body: editPostForm.body.trim(),
        topic: editPostForm.topic,
      })
      setPost(updated)
      setEditPostOpen(false)
      setNotice('Your post was updated.')
    } catch (requestError) {
      if (
        requestError.fieldErrors &&
        Object.keys(requestError.fieldErrors).length
      ) {
        setEditPostErrors(requestError.fieldErrors)
      }
      setCommentError(
        requestError.message || 'The post could not be updated. Try again.',
      )
    } finally {
      setBusy(false)
    }
  }

  const confirmDeletePost = async () => {
    if (busy) return
    setBusy(true)
    setDeletePostOpen(false)

    try {
      await deleteCommunityPost(post.id)
      navigate('/community', { replace: true })
    } catch (requestError) {
      setBusy(false)
      setCommentError(
        requestError.message || 'The post could not be deleted. Try again.',
      )
    }
  }

  const submitComment = async (event) => {
    event.preventDefault()
    if (busy) return

    const body = draft.trim()
    if (body.length === 0) {
      setCommentError('Write a comment before posting.')
      return
    }
    if (body.length > COMMENT_MAX) {
      setCommentError(`Keep comments under ${COMMENT_MAX} characters.`)
      return
    }

    setBusy(true)
    setCommentError('')
    setNotice('')

    try {
      await createCommunityComment(post.id, body)
      setDraft('')
      setCommentPage(0)
      setReloadToken((current) => current + 1)
      setNotice('Comment posted.')
    } catch (requestError) {
      setCommentError(
        requestError.message || 'The comment could not be posted. Try again.',
      )
    } finally {
      setBusy(false)
    }
  }

  const startEditComment = (comment) => {
    setEditCommentId(comment.id)
    setEditCommentBody(comment.body)
    setCommentError('')
  }

  const saveCommentEdit = async (commentId) => {
    const body = editCommentBody.trim()
    if (body.length === 0) {
      setCommentError('A comment cannot be empty.')
      return
    }
    if (body.length > COMMENT_MAX) {
      setCommentError(`Keep comments under ${COMMENT_MAX} characters.`)
      return
    }

    setBusy(true)
    setCommentError('')

    try {
      const updated = await updateCommunityComment(commentId, body)
      setComments((current) =>
        current.map((comment) =>
          comment.id === updated.id ? updated : comment,
        ),
      )
      setEditCommentId(null)
      setEditCommentBody('')
      setNotice('Comment updated.')
    } catch (requestError) {
      setCommentError(
        requestError.message || 'The comment could not be updated. Try again.',
      )
    } finally {
      setBusy(false)
    }
  }

  const confirmDeleteComment = async () => {
    if (busy || !deleteCommentId) return
    setBusy(true)
    const target = deleteCommentId
    setDeleteCommentId(null)

    try {
      await deleteCommunityComment(target)
      setReloadToken((current) => current + 1)
      setNotice('Comment deleted.')
    } catch (requestError) {
      setCommentError(
        requestError.message || 'The comment could not be deleted. Try again.',
      )
    } finally {
      setBusy(false)
    }
  }

  if (postLoading) {
    return (
      <section className="community-detail-page">
        <div className="page-container community-detail-container">
          <PageState
            variant="loading"
            title="Loading discussion"
            description="Fetching the post and its comments."
          />
        </div>
      </section>
    )
  }

  if (postError) {
    const notFound = postError.status === 404

    return (
      <section className="community-detail-page">
        <div className="page-container community-detail-container">
          {notFound ? (
            <EmptyState
              icon={MessageSquare}
              title="Discussion not found"
              description="This thread may have been deleted or the link may be incorrect."
            >
              <Link to="/community" className="btn btn-primary">
                Back to Community
              </Link>
            </EmptyState>
          ) : (
            <PageState
              variant="error"
              title="Discussion could not be loaded"
              description={postError.message}
              onRetry={() => setReloadToken((current) => current + 1)}
            />
          )}
        </div>
      </section>
    )
  }

  if (!post) return null

  const isEditingPost = editPostOpen

  return (
    <section className="community-detail-page">
      <div className="page-container community-detail-container">
        <Link to="/community" className="back-link">
          <ArrowLeft size={15} aria-hidden="true" />
          Back to Community
        </Link>

        {(commentError || notice) && (
          <div className="thread-flash" role="status">
            {commentError ? (
              <p className="field-error" role="alert">
                {commentError}
              </p>
            ) : (
              <p className="composer-feedback">
                <CheckCircle size={15} aria-hidden="true" />
                {notice}
              </p>
            )}
          </div>
        )}

        <article className="thread-card">
          {isEditingPost ? (
            <form className="thread-edit-form" onSubmit={savePostEdit} noValidate>
              <h2 className="section-title">Edit your post</h2>

              <div className="composer-field">
                <label htmlFor="edit-post-title">Title</label>
                <input
                  id="edit-post-title"
                  type="text"
                  className="input"
                  value={editPostForm.title}
                  maxLength={TITLE_MAX}
                  onChange={(event) =>
                    setEditPostForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  aria-invalid={Boolean(editPostErrors.title)}
                />
                {editPostErrors.title && (
                  <p className="field-error" role="alert">
                    {editPostErrors.title}
                  </p>
                )}
              </div>

              <div className="composer-field">
                <label htmlFor="edit-post-topic">Topic</label>
                <select
                  id="edit-post-topic"
                  className="select"
                  value={editPostForm.topic}
                  onChange={(event) =>
                    setEditPostForm((current) => ({
                      ...current,
                      topic: event.target.value,
                    }))
                  }
                >
                  {!topics.includes(editPostForm.topic) && (
                    <option value={editPostForm.topic}>
                      {editPostForm.topic}
                    </option>
                  )}
                  {topics.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                {editPostErrors.topic && (
                  <p className="field-error" role="alert">
                    {editPostErrors.topic}
                  </p>
                )}
              </div>

              <div className="composer-field">
                <label htmlFor="edit-post-body">Details</label>
                <textarea
                  id="edit-post-body"
                  className="textarea"
                  rows={6}
                  value={editPostForm.body}
                  maxLength={BODY_MAX}
                  onChange={(event) =>
                    setEditPostForm((current) => ({
                      ...current,
                      body: event.target.value,
                    }))
                  }
                  aria-invalid={Boolean(editPostErrors.body)}
                />
                {editPostErrors.body && (
                  <p className="field-error" role="alert">
                    {editPostErrors.body}
                  </p>
                )}
              </div>

              <div className="thread-edit-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditPostOpen(false)}
                  disabled={busy}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={busy}
                >
                  {busy ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="thread-top">
                <div className="thread-badges">
                  <span className="discussion-category">{post.topic}</span>
                  {post.ownedByMe && (
                    <span className="thread-local-badge">Your post</span>
                  )}
                </div>
                <span className="discussion-time">
                  {formatRelativeTime(post.createdAt)}
                </span>
              </div>

              <h1 className="thread-title">{post.title}</h1>

              <div className="thread-author">
                <span className="thread-avatar" aria-hidden="true">
                  {initialOf(post.author)}
                </span>
                <span>
                  {authorName(post.author)}
                  {post.ownedByMe ? ' · you' : ''}
                </span>
                <span className="thread-reply-count">
                  <MessageSquare size={13} aria-hidden="true" />
                  {totalComments} comment{totalComments === 1 ? '' : 's'}
                </span>
              </div>

              <p className="thread-body">{post.body}</p>

              <div className="thread-actions">
                <button
                  type="button"
                  className={`discussion-upvote${post.likedByMe ? ' active' : ''}`}
                  onClick={handleLike}
                  disabled={liking}
                  aria-pressed={Boolean(post.likedByMe)}
                  aria-label={`${post.likedByMe ? 'Remove like from' : 'Like'} ${post.title}`}
                >
                  <ArrowUp size={14} aria-hidden="true" />
                  {post.likeCount} like{post.likeCount === 1 ? '' : 's'}
                </button>

                {post.ownedByMe && (
                  <div className="thread-owner-actions">
                    <button
                      type="button"
                      className="btn btn-secondary thread-small-btn"
                      onClick={startEditPost}
                    >
                      <Edit3 size={14} aria-hidden="true" />
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary thread-small-btn thread-danger"
                      onClick={() => setDeletePostOpen(true)}
                    >
                      <Trash2 size={14} aria-hidden="true" />
                      Delete
                    </button>
                  </div>
                )}

                <span className="thread-note">
                  <Users size={13} aria-hidden="true" />
                  Visible to signed-in learners
                </span>
              </div>

              <p className="thread-date">
                Posted {formatDate(post.createdAt)}
                {post.updatedAt && post.updatedAt !== post.createdAt
                  ? ` · edited ${formatRelativeTime(post.updatedAt)}`
                  : ''}
              </p>
            </>
          )}
        </article>

        <section className="thread-replies" aria-labelledby="replies-title">
          <h2 className="section-title" id="replies-title">
            Comments ({totalComments})
          </h2>

          {commentsLoading ? (
            <PageState
              variant="loading"
              title="Loading comments"
              description="Fetching this discussion's comments."
            />
          ) : commentsError ? (
            <div>
              <p className="field-error" role="alert">
                {commentsError.message}
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setReloadToken((current) => current + 1)}
              >
                Retry
              </button>
            </div>
          ) : comments.length === 0 ? (
            <p className="thread-empty-replies">
              No comments yet. Add the first one below.
            </p>
          ) : (
            <ul className="reply-list">
              {comments.map((comment) => (
                <li className="reply-item" key={comment.id}>
                  <span className="reply-avatar" aria-hidden="true">
                    {initialOf(comment.author)}
                  </span>
                  <div className="reply-main">
                    <div className="reply-head">
                      <span className="reply-author">
                        {authorName(comment.author)}
                        {comment.ownedByMe ? ' · you' : ''}
                      </span>
                      <span className="reply-time">
                        {formatRelativeTime(comment.createdAt)}
                      </span>
                    </div>

                    {editCommentId === comment.id ? (
                      <div className="reply-edit">
                        <textarea
                          className="textarea"
                          rows={3}
                          value={editCommentBody}
                          maxLength={COMMENT_MAX}
                          onChange={(event) =>
                            setEditCommentBody(event.target.value)
                          }
                          aria-label="Edit comment"
                        />
                        <div className="reply-edit-actions">
                          <button
                            type="button"
                            className="btn btn-secondary thread-small-btn"
                            onClick={() => setEditCommentId(null)}
                            disabled={busy}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary thread-small-btn"
                            onClick={() => saveCommentEdit(comment.id)}
                            disabled={busy}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="reply-body">{comment.body}</p>
                        {comment.ownedByMe && (
                          <div className="reply-actions">
                            <button
                              type="button"
                              className="reply-action"
                              onClick={() => startEditComment(comment)}
                            >
                              <Edit3 size={13} aria-hidden="true" />
                              Edit
                            </button>
                            <button
                              type="button"
                              className="reply-action reply-action-danger"
                              onClick={() => setDeleteCommentId(comment.id)}
                            >
                              <Trash2 size={13} aria-hidden="true" />
                              Delete
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <Pagination
            page={commentPageInfo.page}
            totalPages={commentPageInfo.totalPages}
            onChange={setCommentPage}
            disabled={commentsLoading}
            label="Comment pagination"
          />
        </section>

        <form className="reply-form" onSubmit={submitComment} noValidate>
          <label className="composer-label" htmlFor="reply-input">
            Add a comment
          </label>
          <textarea
            id="reply-input"
            className="textarea"
            rows={3}
            placeholder="Share a helpful response..."
            value={draft}
            maxLength={COMMENT_MAX}
            onChange={(event) => {
              setDraft(event.target.value)
              setCommentError('')
              setNotice('')
            }}
          />
          <div className="composer-footer">
            <span className="composer-count">
              {draft.length}/{COMMENT_MAX} characters
            </span>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={busy}
            >
              <Send size={15} aria-hidden="true" />
              {busy ? 'Posting…' : 'Post comment'}
            </button>
          </div>
        </form>

        <p className="community-note" role="note">
          Comments are stored in PrepMaster and visible to signed-in learners.
          The author and timestamp are recorded automatically.
        </p>
      </div>

      <Modal
        open={deletePostOpen}
        title="Delete this post?"
        description="This permanently removes the post and its comments."
        onClose={() => setDeletePostOpen(false)}
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setDeletePostOpen(false)}
            >
              Keep post
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={confirmDeletePost}
              disabled={busy}
            >
              Delete post
            </button>
          </>
        }
      >
        <p>
          <strong>{post.title}</strong>
        </p>
        <p>This action cannot be undone.</p>
      </Modal>

      <Modal
        open={Boolean(deleteCommentId)}
        title="Delete this comment?"
        description="This permanently removes your comment from the discussion."
        onClose={() => setDeleteCommentId(null)}
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setDeleteCommentId(null)}
            >
              Keep comment
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={confirmDeleteComment}
              disabled={busy}
            >
              Delete comment
            </button>
          </>
        }
      >
        <p>This action cannot be undone.</p>
      </Modal>
    </section>
  )
}
