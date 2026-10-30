import './ProgressBar.css'

export default function ProgressBar({
  label,
  percentage = 0,
  small = false,
  className = '',
  trackClassName = '',
  barClassName = '',
}) {
  const numeric = Number(percentage)
  const value = Number.isFinite(numeric)
    ? Math.min(100, Math.max(0, Math.round(numeric)))
    : 0

  return (
    <div
      className={`progress-bar${small ? ' progress-bar-sm' : ''}${
        className ? ` ${className}` : ''
      }`}
    >
      <div
        className={`progress-track${trackClassName ? ` ${trackClassName}` : ''}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
      >
        <div
          className={`progress-bar-fill${
            barClassName ? ` ${barClassName}` : ''
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
      {label && (
        <div className="progress-label">
          <span>{label}</span>
          <span className="progress-value">{value}%</span>
        </div>
      )}
    </div>
  )
}
