import { Check, Lock, RotateCcw, Timer } from 'lucide-react'
import './TaskCard.css'

export default function TaskCard({
  number,
  title,
  category,
  difficulty = 'Medium',
  estimatedTime,
  isCompleted,
  isLocked,
  onToggle,
  onRevisit,
}) {
  const stateClass = isCompleted
    ? 'is-completed'
    : isLocked
      ? 'is-locked'
      : 'is-open'

  return (
    <article className={`task-card ${stateClass}`}>
      <span className="task-number" aria-hidden="true">
        {number}
      </span>

      <div className="task-main">
        <div className="task-title-row">
          <h2 className="task-title">{title}</h2>
          <span className={`task-difficulty ${difficulty.toLowerCase()}`}>
            {difficulty}
          </span>
          {isLocked && (
            <span className="task-locked-badge">
              <Lock size={11} aria-hidden="true" />
              Locked
            </span>
          )}
          {isCompleted && (
            <span className="task-done-badge">
              <Check size={11} aria-hidden="true" />
              Done
            </span>
          )}
        </div>

        <div className="task-meta">
          <span className="task-category">{category}</span>
          <span className="task-time">
            <Timer size={13} aria-hidden="true" />
            {estimatedTime}
          </span>
        </div>
      </div>

      <div className="task-actions">
        {isLocked ? (
          <span className="task-locked-text">
            <Lock size={12} aria-hidden="true" />
            Complete task {number - 1} to unlock
          </span>
        ) : isCompleted ? (
          <>
            <span className="task-complete-mark">
              <Check size={14} aria-hidden="true" />
              Completed
            </span>
            {onRevisit && (
              <button
                type="button"
                className="btn btn-secondary task-revisit-btn"
                onClick={() => onRevisit()}
                aria-label={`Revisit ${title}`}
              >
                <RotateCcw size={14} aria-hidden="true" />
                Revisit
              </button>
            )}
          </>
        ) : (
          <button
            type="button"
            className="btn btn-primary task-start-btn"
            onClick={() => onToggle && onToggle()}
            aria-label={`Mark ${title} as completed`}
          >
            Mark complete
          </button>
        )}
      </div>
    </article>
  )
}
