import {
  BookOpen,
  Calendar,
  Home,
  Settings,
  Terminal,
  User,
  Users,
  Zap,
} from 'lucide-react'
import './Sidebar.css'

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span>PrepMaster</span>
      </div>
      <nav>
        <div
          className={`nav-link-item ${
            window.location.pathname === '/dashboard' ? 'active' : ''
          }`}
          onClick={() => window.location.hash = '/dashboard'}
        >
          <Home className="nav-icon" />
          <span>Dashboard</span>
        </div>
        <div
          className={`nav-link-item ${
            window.location.pathname === '/daily-plan' ? 'active' : ''
          }`}
          onClick={() => window.location.hash = '/daily-plan'}
        >
          <Calendar className="nav-icon" />
          <span>Daily Plan</span>
        </div>
        <div
          className={`nav-link-item ${
            window.location.pathname === '/practice' ? 'active' : ''
          }`}
          onClick={() => window.location.hash = '/practice'}
        >
          <Terminal className="nav-icon" />
          <span>Practice</span>
        </div>
        <div
          className={`nav-link-item ${
            window.location.pathname === '/mock-interview' ? 'active' : ''
          }`}
          onClick={() => window.location.hash = '/mock-interview'}
        >
          <Zap className="nav-icon" />
          <span>Mock Interview</span>
        </div>
        <div
          className={`nav-link-item ${
            window.location.pathname === '/progress' ? 'active' : ''
          }`}
          onClick={() => window.location.hash = '/progress'}
        >
          <User className="nav-icon" />
          <span>Progress</span>
        </div>
        <div
          className={`nav-link-item ${
            window.location.pathname === '/learn' ? 'active' : ''
          }`}
          onClick={() => window.location.hash = '/learn'}
        >
          <BookOpen className="nav-icon" />
          <span>Learn</span>
        </div>
        <div
          className={`nav-link-item ${
            window.location.pathname === '/community' ? 'active' : ''
          }`}
          onClick={() => window.location.hash = '/community'}
        >
          <Users className="nav-icon" />
          <span>Community</span>
        </div>
      </nav>
      <div className="sidebar-footer">
        <div
          className={`nav-link-item ${
            window.location.pathname === '/profile' ? 'active' : ''
          }`}
          onClick={() => window.location.hash = '/profile'}
        >
          <User className="nav-icon" />
          <span>Profile</span>
        </div>
        <div
          className={`nav-link-item ${
            window.location.pathname === '/settings' ? 'active' : ''
          }`}
          onClick={() => window.location.hash = '/settings'}
        >
          <Settings className="nav-icon" />
          <span>Settings</span>
        </div>
      </div>
    </aside>
  )
}