import { Inbox } from 'lucide-react'
import './EmptyState.css'

export default function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  children,
}) {
  return (
    <div className="empty-state" role="status">
      <span className="empty-state-icon-wrap" aria-hidden="true">
        <Icon className="empty-state-icon" size={26} />
      </span>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      {children}
    </div>
  )
}
