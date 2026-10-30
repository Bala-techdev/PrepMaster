import { Calendar, Flame, TrendingUp } from 'lucide-react'
import './StreakCard.css'

export default function StreakCard({ days = 0, longest = 0, className = '' }) {
  return (
    <section className={`streak-card${className ? ` ${className}` : ''}`}>
      <div className="streak-header">
        <h2 className="streak-title">Current streak</h2>
        <Calendar className="streak-header-icon" size={18} aria-hidden="true" />
      </div>

      <div className="streak-current">
        <span className="streak-fire-wrap" aria-hidden="true">
          <Flame className="streak-fire-icon" size={22} />
        </span>
        <p className="streak-numbers">
          <span className="streak-value">{days}</span>
          <span className="streak-label">
            day{days === 1 ? '' : 's'} in a row
          </span>
        </p>
      </div>

      {longest > 0 && (
        <p className="streak-longest">
          <TrendingUp className="trending-icon" size={16} aria-hidden="true" />
          Longest streak: <strong>{longest} days</strong>
        </p>
      )}
    </section>
  )
}
