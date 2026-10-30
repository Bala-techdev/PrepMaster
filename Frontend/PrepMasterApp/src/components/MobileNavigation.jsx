import { Menu, X } from 'lucide-react'
import './MobileNavigation.css'

export default function MobileNavigation({ isOpen, toggleMenu, children }) {
  return (
    <nav className="mobile-nav">
      <div className="mobile-nav-header">
        <button
          className="mobile-nav-toggle"
          onClick={toggleMenu}
          aria-label="Close navigation"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span>PrepMaster</span>
      </div>

      <ul className="mobile-nav-links">
        {children}
      </ul>
    </nav>
  )
}