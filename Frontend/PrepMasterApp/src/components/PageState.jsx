import { AlertTriangle, LoaderCircle, RefreshCw } from 'lucide-react'
import './PageState.css'

export default function PageState({
  variant = 'loading',
  title,
  description,
  onRetry,
  retryLabel = 'Try again',
  children,
}) {
  const isLoading = variant === 'loading'

  return (
    <div className={`page-state page-state-${variant}`} role={isLoading ? 'status' : 'alert'}>
      <span className="page-state-icon" aria-hidden="true">
        {isLoading ? (
          <LoaderCircle className="page-state-spinner" size={28} />
        ) : (
          <AlertTriangle size={26} />
        )}
      </span>
      <div className="page-state-copy">
        <h2 className="page-state-title">{title}</h2>
        {description && <p className="page-state-description">{description}</p>}
        {children}
      </div>
      {onRetry && (
        <button type="button" className="btn btn-secondary" onClick={onRetry}>
          <RefreshCw size={15} aria-hidden="true" />
          {retryLabel}
        </button>
      )}
    </div>
  )
}
