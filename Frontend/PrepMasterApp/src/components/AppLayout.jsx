import { useEffect, useRef, useState } from 'react'
import {
  Link,
  NavLink,
  useNavigate,
} from 'react-router-dom'
import {
  Bell,
  BookOpen,
  Calendar,
  Home,
  Menu,
  Search,
  Settings,
  Terminal,
  TrendingUp,
  User,
  Users,
  X,
  Zap,
} from 'lucide-react'
import avatarSrc from '../assets/placeholder-avatar.svg'
import { useAppState } from '../state/appContext'
import './AppLayout.css'

const primaryLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/daily-plan', label: 'Daily Plan', icon: Calendar },
  { to: '/practice', label: 'Practice', icon: Terminal },
  { to: '/mock-interview', label: 'Mock Interview', icon: Zap },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/learn', label: 'Learn', icon: BookOpen },
  { to: '/community', label: 'Community', icon: Users },
]

const secondaryLinks = [
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
]

function SidebarLink({ to, label, icon: Icon, end, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
      onClick={onNavigate}
    >
      <Icon className="nav-icon" aria-hidden="true" />
      <span>{label}</span>
    </NavLink>
  )
}

export default function AppLayout({ children }) {
  const { profile, notifications, notificationsEnabled, stats } = useAppState()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [avatarFailed, setAvatarFailed] = useState(false)
  const notificationRef = useRef(null)

  /* Lock scrolling and support Escape while the drawer is open. */
  useEffect(() => {
    if (!isMenuOpen) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isMenuOpen])

  /* Reset the drawer if the viewport grows back to desktop. */
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1025px)')
    const onChange = (event) => {
      if (event.matches) setIsMenuOpen(false)
    }
    mediaQuery.addEventListener('change', onChange)
    return () => mediaQuery.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!isNotificationsOpen) return undefined

    const onPointerDown = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false)
      }
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setIsNotificationsOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isNotificationsOpen])

  const closeMenu = () => setIsMenuOpen(false)
  const initial = profile.name.charAt(0).toUpperCase() || 'P'

  const handleSearch = (event) => {
    event.preventDefault()
    const clean = query.trim()
    navigate(clean ? `/practice?q=${encodeURIComponent(clean)}` : '/practice')
    setQuery('')
    closeMenu()
  }

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <div className={`app-shell${isMenuOpen ? ' nav-open' : ''}`}>
        <aside
          id="app-sidebar"
          className={`sidebar${isMenuOpen ? ' open' : ''}`}
          aria-label="Main navigation"
        >
          <div className="sidebar-brand">
            <Link to="/dashboard" className="brand-link" onClick={closeMenu}>
              <span className="brand-mark" aria-hidden="true">
                P
              </span>
              <span className="brand-name">PrepMaster</span>
            </Link>
            <button
              type="button"
              className="icon-button sidebar-close"
              onClick={closeMenu}
              aria-label="Close navigation menu"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          <nav className="sidebar-nav">
            {primaryLinks.map((link) => (
              <SidebarLink
                key={link.to}
                {...link}
                end={link.to === '/dashboard'}
                onNavigate={closeMenu}
              />
            ))}
          </nav>

          <div className="sidebar-footer">
            {secondaryLinks.map((link) => (
              <SidebarLink
                key={link.to}
                {...link}
                onNavigate={closeMenu}
              />
            ))}
            <p className="sidebar-note">
              Keep the {stats.currentStreak}-day streak alive.
            </p>
          </div>
        </aside>

        <div className="app-main">
          <header className="topbar">
            <button
              type="button"
              className="icon-button menu-toggle"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              aria-controls="app-sidebar"
            >
              {isMenuOpen ? (
                <X size={22} aria-hidden="true" />
              ) : (
                <Menu size={22} aria-hidden="true" />
              )}
            </button>

            <Link to="/dashboard" className="topbar-brand" onClick={closeMenu}>
              <span className="brand-mark" aria-hidden="true">
                P
              </span>
              <span className="brand-name">PrepMaster</span>
            </Link>

            <form
              className="topbar-search"
              role="search"
              onSubmit={handleSearch}
            >
              <Search className="search-icon" size={18} aria-hidden="true" />
              <input
                type="search"
                placeholder="Search problems..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search problems"
              />
            </form>

            <div className="topbar-actions">
              <div className="notification-wrap" ref={notificationRef}>
                <button
                  type="button"
                  className="icon-button notification-button"
                  aria-label="Notifications"
                  aria-expanded={isNotificationsOpen}
                  aria-controls="notification-panel"
                  onClick={() => setIsNotificationsOpen((open) => !open)}
                >
                  <Bell size={19} aria-hidden="true" />
                  {notificationsEnabled && notifications.length > 0 && (
                    <span className="notification-dot" aria-hidden="true" />
                  )}
                </button>

                {isNotificationsOpen && (
                  <div
                    className="notification-panel"
                    id="notification-panel"
                    role="region"
                    aria-label="Notifications"
                  >
                    <div className="notification-head">
                      <h2 className="notification-title">Notifications</h2>
                      <button
                        type="button"
                        className="icon-button notification-close"
                        onClick={() => setIsNotificationsOpen(false)}
                        aria-label="Close notifications"
                      >
                        <X size={16} aria-hidden="true" />
                      </button>
                    </div>

                    {notificationsEnabled ? (
                      <ul className="notification-list">
                        {notifications.map((item) => (
                          <li key={item.id}>
                            <Link
                              to={item.to}
                              className="notification-item"
                              onClick={() => setIsNotificationsOpen(false)}
                            >
                              <span className="notification-item-title">
                                {item.title}
                              </span>
                              <span className="notification-item-message">
                                {item.message}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="notification-empty">
                        Notifications are turned off. Enable them in Settings to
                        show in-app reminders.
                      </p>
                    )}

                    <Link
                      to="/settings"
                      className="notification-settings-link"
                      onClick={() => setIsNotificationsOpen(false)}
                    >
                      Notification settings
                    </Link>
                  </div>
                )}
              </div>

              <Link
                to="/profile"
                className="user-profile"
                aria-label={`Open profile for ${profile.name}`}
              >
                {avatarFailed ? (
                  <span className="avatar-fallback" aria-hidden="true">
                    {initial}
                  </span>
                ) : (
                  <img
                    src={avatarSrc}
                    alt=""
                    className="user-avatar"
                    width={32}
                    height={32}
                    onError={() => setAvatarFailed(true)}
                  />
                )}
                <span className="user-name">{profile.name}</span>
              </Link>
            </div>
          </header>

          <main className="main-content" id="main-content">
            {children}
          </main>
        </div>

        {isMenuOpen && (
          <button
            type="button"
            className="mobile-overlay"
            onClick={closeMenu}
            aria-label="Close navigation menu"
            tabIndex={-1}
          />
        )}
      </div>
    </>
  )
}
