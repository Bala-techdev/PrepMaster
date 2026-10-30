import { Zap } from 'lucide-react'
import ProgressBar from './ProgressBar'
import './LevelCard.css'

export default function LevelCard({
  level = 1,
  progress = 0,
  experience = 0,
  className = '',
}) {
  return (
    <section className={`level-card${className ? ` ${className}` : ''}`}>
      <div className="level-header">
        <div>
          <p className="level-eyebrow">Progression</p>
          <h2 className="level-label">Level {level}</h2>
        </div>
        <span className="xp-label">{experience.toLocaleString()} XP</span>
      </div>

      <div className="level-progress">
        <div className="level-progress-text">
          <span>{progress}% complete</span>
          <span>{100 - progress}% to next</span>
        </div>
        <ProgressBar percentage={progress} small />
      </div>

      <p className="level-next">
        <Zap className="next-icon" size={16} aria-hidden="true" />
        Next level at {100 - progress}% more progress
      </p>
    </section>
  )
}
