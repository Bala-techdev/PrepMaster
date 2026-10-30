import { Moon, Search, Sun } from 'lucide-react'
import { useState } from 'react'
import './Topbar.css'

export default function Topbar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [theme, setTheme] = useState('light')

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
    document.documentElement.setAttribute('data-theme', theme === 'light' ? 'dark' : 'light')
    localStorage.setItem('prem-theme', theme === 'light' ? 'dark' : 'light')
  }

  return (
    <div className="topbar">
      <div className="logo">
        <span>PrepMaster</span>
      </div>

      <div className="topbar-search">
        <Search className="search-icon" />
        <input
          type="text"
          placeholder="Search courses, problems,..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search"
        />
      </div>

      <div className="topbar-actions">
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="user-profile">
          <img
            src="/placeholder-avatar.svg"
            alt="User"
            className="user-avatar"
            width={32}
            height={32}
          />
          <span className="user-name">Bala</span>
          <svg
            className="user-arrow"
            width={8}
            height={8}
            viewBox="0 0 24 22"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M5 12h8M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  )
}