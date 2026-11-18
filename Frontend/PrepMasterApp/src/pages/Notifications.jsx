import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Award,
  Bell,
  Check,
  CheckCheck,
  CheckCircle2,
  Clock,
  Flame,
  Info,
  MessageSquare,
  RefreshCw,
  Zap,
} from 'lucide-react'
import EmptyState from '../components/EmptyState'
import PageState from '../components/PageState'
import Pagination from '../components/Pagination'
import { useAppData } from '../state/useAppData'
import { getNotifications } from '../api/notificationService'
import { formatRelativeTime } from '../lib/date'
import './Notifications.css'

const PAGE_SIZE = 15

const TYPE_VIEW = {
  REMINDER: { label: 'Reminder', icon: Clock, tone: 'amber' },
  STREAK: { label: 'Streak', icon: Flame, tone: 'orange' },
  TASK_COMPLETED: { label: 'Task', icon: CheckCircle2, tone: 'green' },
  ACHIEVEMENT_UNLOCKED: { label: 'Achievement', icon: Award, tone: 'purple' },
  COMMUNITY_ACTIVITY: { label: 'Community', icon: MessageSquare, tone: 'blue' },
  MOCK_INTERVIEW_RESULT: { label: 'Interview', icon: Zap, tone: 'indigo' },
  SYSTEM: { label: 'System', icon: Info, tone: 'slate' },
}

function typeView(type) {
  return TYPE_VIEW[type] || { label: 'Update', icon: Bell, tone: 'slate' }
}

function safeLink(link) {
  return typeof link === 'string' && link.startsWith('/') ? link : null
}

export default function Notifications() {
  const navigate = useNavigate()
  const {
    markNotificationRead,
    markAllNotificationsRead,
    loadNotifications,
    notificationUnreadCount,
    notificationsEnabled,
  } = useAppData()

  const [data, setData] = useState(null)
  const [page, setPage] = useState(0)
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadToken, setReloadToken] = useState(0)
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [markingAll, setMarkingAll] = useState(false)

  const reload = useCallback(() => {
    setReloadToken((current) => current + 1)
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    getNotifications({ page, size: PAGE_SIZE, unreadOnly })
      .then((response) => {
        if (active) setData(response)
      })
      .catch((requestError) => {
        if (active) {
          setData(null)
          setError(requestError)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [page, reloadToken, unreadOnly])

  const items = data?.content || []
  const totalElements = Number(data?.totalElements) || 0
  const totalPages = Number(data?.totalPages) || 0

  const unreadOnPage = useMemo(
    () => items.filter((item) => !item.read).length,
    [items],
  )

  const openNotification = async (item) => {
    if (busyId) return
    setActionError('')
    setNotice('')

    let target = item
    if (!item.read) {
      setBusyId(item.id)
      try {
        target = await markNotificationRead(item.id)
        setData((current) =>
          current
            ? {
                ...current,
                content: current.content.map((row) =>
                  row.id === item.id ? target : row,
                ),
              }
            : current,
        )
      } catch (requestError) {
        setActionError(
          requestError.message ||
            'This notification could not be marked as read.',
        )
        setBusyId(null)
        return
      }
      setBusyId(null)
    }

    const link = safeLink(target.link)
    if (link) navigate(link)
  }

  const handleMarkAll = async () => {
    if (markingAll || notificationUnreadCount === 0) return
    setMarkingAll(true)
    setActionError('')
    setNotice('')

    try {
      const result = await markAllNotificationsRead()
      const readAt = new Date().toISOString()
      setData((current) =>
        current
          ? {
              ...current,
              content: current.content.map((row) =>
                row.read ? row : { ...row, read: true, readAt },
              ),
            }
          : current,
      )
      setNotice(
        Number(result?.count) > 0
          ? `${Number(result.count)} notification${Number(result.count) === 1 ? '' : 's'} marked as read.`
          : 'All notifications were already read.',
      )
      loadNotifications({ silent: true }).catch(() => {})
      if (unreadOnly) reload()
    } catch (requestError) {
      setActionError(
        requestError.message ||
          'Notifications could not be marked as read. Try again.',
      )
    } finally {
      setMarkingAll(false)
    }
  }

  const changeFilter = (nextUnreadOnly) => {
    setUnreadOnly(nextUnreadOnly)
    setPage(0)
  }

  return (
    <section className="notifications-page">
      <div className="page-container notifications-container">
        <header className="page-head">
          <div>
            <p className="page-eyebrow">Inbox</p>
            <h1 className="page-title">Notifications</h1>
            <p className="page-subtitle">
              Reminders, streak updates, achievements, community replies and
              interview results stored for your account.
            </p>
          </div>
          <div className="notification-page-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleMarkAll}
              disabled={markingAll || notificationUnreadCount === 0}
            >
              <CheckCheck size={15} aria-hidden="true" />
              {markingAll ? 'Marking…' : 'Mark all read'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={reload}
              disabled={loading}
            >
              <RefreshCw size={15} aria-hidden="true" />
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </header>

        {!notificationsEnabled && (
          <p className="notifications-warning" role="note">
            In-app notifications are turned off in Settings. Existing
            notifications are still listed, but new ones will not be created
            until you re-enable them.
          </p>
        )}

        <div className="notifications-toolbar">
          <div
            className="notifications-tabs"
            role="group"
            aria-label="Filter notifications"
          >
            <button
              type="button"
              className={`notifications-tab${unreadOnly ? '' : ' active'}`}
              onClick={() => changeFilter(false)}
              aria-pressed={!unreadOnly}
            >
              All
            </button>
            <button
              type="button"
              className={`notifications-tab${unreadOnly ? ' active' : ''}`}
              onClick={() => changeFilter(true)}
              aria-pressed={unreadOnly}
            >
              Unread
              {notificationUnreadCount > 0 && (
                <span className="notifications-count">
                  {notificationUnreadCount > 99 ? '99+' : notificationUnreadCount}
                </span>
              )}
            </button>
          </div>
          <span className="notifications-total">
            {totalElements} notification{totalElements === 1 ? '' : 's'}
            {unreadOnPage > 0 ? ` · ${unreadOnPage} unread on this page` : ''}
          </span>
        </div>

        {(actionError || notice) && (
          <p
            className={`notifications-flash${actionError ? ' is-error' : ''}`}
            role={actionError ? 'alert' : 'status'}
          >
            {actionError || notice}
          </p>
        )}

        {loading ? (
          <PageState
            variant="loading"
            title="Loading notifications"
            description="Fetching your latest reminders and updates."
          />
        ) : error ? (
          <PageState
            variant="error"
            title="Notifications could not be loaded"
            description={error.message}
            onRetry={reload}
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={unreadOnly ? CheckCheck : Bell}
            title={
              unreadOnly ? 'No unread notifications' : 'No notifications yet'
            }
            description={
              unreadOnly
                ? 'You are all caught up. New reminders and updates will appear here.'
                : 'Complete tasks, keep a streak or join the community to start receiving updates.'
            }
          >
            {unreadOnly && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => changeFilter(false)}
              >
                View all notifications
              </button>
            )}
          </EmptyState>
        ) : (
          <>
            <ul className="notification-feed">
              {items.map((item) => {
                const view = typeView(item.type)
                const Icon = view.icon
                const link = safeLink(item.link)

                return (
                  <li
                    key={item.id}
                    className={`notification-feed-item${item.read ? '' : ' is-unread'}`}
                  >
                    <span
                      className={`notification-type-icon tone-${view.tone}`}
                      aria-hidden="true"
                    >
                      <Icon size={17} />
                    </span>

                    <div className="notification-feed-copy">
                      <div className="notification-feed-head">
                        <span className="notification-feed-type">
                          {view.label}
                        </span>
                        <span className="notification-feed-time">
                          {formatRelativeTime(item.createdAt)}
                        </span>
                        {!item.read && (
                          <span className="notification-unread-pill">
                            Unread
                          </span>
                        )}
                      </div>
                      <h2 className="notification-feed-title">{item.title}</h2>
                      <p className="notification-feed-message">{item.message}</p>
                    </div>

                    <div className="notification-feed-actions">
                      {link ? (
                        <button
                          type="button"
                          className="btn btn-secondary notification-open"
                          onClick={() => openNotification(item)}
                          disabled={busyId === item.id}
                        >
                          Open
                        </button>
                      ) : null}
                      {!item.read && (
                        <button
                          type="button"
                          className="notification-read-btn"
                          onClick={() => openNotification(item)}
                          disabled={busyId === item.id}
                          aria-label={`Mark ${item.title} as read`}
                        >
                          <Check size={14} aria-hidden="true" />
                          {busyId === item.id ? 'Saving…' : 'Mark read'}
                        </button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>

            <Pagination
              page={Number(data?.page) || 0}
              totalPages={totalPages}
              onChange={setPage}
              disabled={loading}
              label="Notification pagination"
            />
          </>
        )}

        <p className="notifications-footnote">
          <Info size={14} aria-hidden="true" />
          Notifications are private to your account and stored in PrepMaster.
          The platform does not send email, push or SMS messages. Turning off a
          notification category in Settings stops new notifications of that
          type without deleting existing ones.
        </p>
      </div>
    </section>
  )
}
