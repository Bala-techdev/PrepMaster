import { Users } from 'lucide-react'
import './StatCard.css'

export default function StatCard({
  title,
  value,
  subtitle,
  icon = <Users size={20} aria-hidden="true" />,
  className = '',
}) {
  return (
    <div className={`stat-card${className ? ` ${className}` : ''}`}>
      <span className="stat-icon" aria-hidden="true">
        {icon}
      </span>
      <div className="stat-info">
        <span className="stat-value">{value}</span>
        <span className="stat-title">{title}</span>
        {subtitle && <span className="stat-subtitle">{subtitle}</span>}
      </div>
    </div>
  )
}
