import './DifficultyBadge.css'

export default function DifficultyBadge({ difficulty = 'Medium', className = '' }) {
  const level = String(difficulty).toLowerCase()

  return (
    <span className={`difficulty-badge ${level}${className ? ` ${className}` : ''}`}>
      {difficulty}
    </span>
  )
}
