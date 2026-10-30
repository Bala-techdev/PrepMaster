import { useState } from 'react'
import {
  Calendar,
  Circle,
  Info,
  Medal,
  Star,
  TrendingUp,
} from 'lucide-react'
import ProgressBar from '../components/ProgressBar'
import avatarSrc from '../assets/placeholder-avatar.svg'
import { useAppState } from '../state/appContext'
import './Profile.css'

const NAME_MIN = 2
const NAME_MAX = 40
const MAX_GOALS = 8

function parseGoals(value) {
  return value
    .split(',')
    .map((goal) => goal.trim())
    .filter(Boolean)
}

export default function ProfilePage() {
  const { profile, saveProfile, stats } = useAppState()
  const [name, setName] = useState(profile.name)
  const [goals, setGoals] = useState(profile.goals.join(', '))
  const [errors, setErrors] = useState({})
  const [feedback, setFeedback] = useState('')
  const [avatarFailed, setAvatarFailed] = useState(false)

  const savedGoals = profile.goals.join(', ')
  const isDirty = name !== profile.name || goals !== savedGoals

  const validate = () => {
    const nextErrors = {}
    const cleanName = name.trim()
    const parsedGoals = parseGoals(goals)

    if (cleanName.length < NAME_MIN) {
      nextErrors.name = `Enter at least ${NAME_MIN} characters for your name.`
    } else if (cleanName.length > NAME_MAX) {
      nextErrors.name = `Keep your name under ${NAME_MAX} characters.`
    }

    if (parsedGoals.length === 0) {
      nextErrors.goals = 'Add at least one learning goal.'
    } else if (parsedGoals.length > MAX_GOALS) {
      nextErrors.goals = `Keep the list to ${MAX_GOALS} goals or fewer.`
    } else if (parsedGoals.some((goal) => goal.length > 60)) {
      nextErrors.goals = 'Each goal must be 60 characters or fewer.'
    }

    return { errors: nextErrors, cleanName, parsedGoals }
  }

  const handleSave = (event) => {
    event.preventDefault()
    setFeedback('')
    const result = validate()

    if (Object.keys(result.errors).length) {
      setErrors(result.errors)
      document.getElementById(result.errors.name ? 'profile-name' : 'profile-goals')?.focus()
      return
    }

    const saved = saveProfile({
      name: result.cleanName,
      goals: result.parsedGoals,
    })
    setName(saved.name)
    setGoals(saved.goals.join(', '))
    setErrors({})
    setFeedback('Profile saved locally. Your name now appears in the header.')
  }

  const handleCancel = () => {
    setName(profile.name)
    setGoals(profile.goals.join(', '))
    setErrors({})
    setFeedback('Changes discarded.')
  }

  const initial = profile.name.charAt(0).toUpperCase() || 'P'

  return (
    <section className="profile-page">
      <div className="page-container profile-container">
        <header className="profile-header">
          <div className="profile-avatar">
            {avatarFailed ? (
              <span className="profile-avatar-fallback" aria-hidden="true">
                {initial}
              </span>
            ) : (
              <img
                src={avatarSrc}
                alt=""
                className="profile-avatar-img"
                width={88}
                height={88}
                onError={() => setAvatarFailed(true)}
              />
            )}
          </div>

          <div className="profile-info">
            <p className="page-eyebrow">Profile</p>
            <h1 className="profile-name">{profile.name}</h1>
            <div className="profile-chips">
              <span className="profile-chip">
                <Star size={14} aria-hidden="true" />
                Level {stats.level}
              </span>
              <span className="profile-chip">
                <Calendar size={14} aria-hidden="true" />
                {stats.currentStreak} day streak
              </span>
              <span className="profile-chip">
                <TrendingUp size={14} aria-hidden="true" />
                Best {stats.longestStreak} days
              </span>
            </div>
          </div>
        </header>

        <p className="profile-note" role="note">
          <Info size={15} aria-hidden="true" />
          Local prototype profile. No account, sign-in or authentication is
          connected; your name and goals are stored only in this browser.
        </p>

        <div className="profile-grid">
          <section
            className="profile-stats"
            aria-labelledby="profile-stats-title"
          >
            <h2 className="profile-section-title" id="profile-stats-title">
              Learning statistics
            </h2>
            <div className="profile-stats-grid">
              <div className="stat-block">
                <span className="stat-block-icon" aria-hidden="true">
                  <Star size={17} />
                </span>
                <div>
                  <div className="stat-block-value">{stats.solvedCount}</div>
                  <div className="stat-block-label">Problems solved</div>
                </div>
              </div>
              <div className="stat-block">
                <span className="stat-block-icon" aria-hidden="true">
                  <Calendar size={17} />
                </span>
                <div>
                  <div className="stat-block-value">{stats.currentStreak}</div>
                  <div className="stat-block-label">Current streak</div>
                </div>
              </div>
              <div className="stat-block">
                <span className="stat-block-icon" aria-hidden="true">
                  <Medal size={17} />
                </span>
                <div>
                  <div className="stat-block-value">
                    {stats.interviewCount}
                  </div>
                  <div className="stat-block-label">Mock interviews</div>
                </div>
              </div>
            </div>
          </section>

          <section
            className="current-level"
            aria-labelledby="current-level-title"
          >
            <h2 className="profile-section-title" id="current-level-title">
              Current level
            </h2>
            <div className="current-level-head">
              <span className="current-level-name">Level {stats.level}</span>
              <span className="current-level-percent">
                {stats.levelProgress}%
              </span>
            </div>
            <ProgressBar
              label="Level progress"
              percentage={stats.levelProgress}
              small
            />
            <p className="level-percentage">
              {stats.xpIntoLevel} / 1,000 XP to level {stats.level + 1}
            </p>
          </section>
        </div>

        <div className="profile-grid">
          <section className="learning-goals" aria-labelledby="goals-title">
            <h2 className="profile-section-title" id="goals-title">
              Learning goals
            </h2>
            <ul className="goals-list">
              {profile.goals.map((goal) => (
                <li key={goal} className="goal-item">
                  <Circle className="goal-check" size={13} aria-hidden="true" />
                  {goal}
                  <span className="visually-hidden">active learning goal</span>
                </li>
              ))}
            </ul>
            <p className="goal-note">
              Goals are saved with your profile. Completion is not tracked
              automatically.
            </p>
          </section>

          <section className="editable-profile" aria-labelledby="edit-title">
            <h2 className="profile-section-title" id="edit-title">
              Edit profile
            </h2>
            <form onSubmit={handleSave} noValidate>
              <div className="editable-field">
                <label htmlFor="profile-name">Name</label>
                <input
                  type="text"
                  id="profile-name"
                  value={name}
                  maxLength={NAME_MAX}
                  onChange={(event) => {
                    setName(event.target.value)
                    setFeedback('')
                    if (errors.name) {
                      setErrors((current) => ({ ...current, name: undefined }))
                    }
                  }}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'profile-name-error' : undefined}
                />
                {errors.name && (
                  <p className="field-error" id="profile-name-error" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="editable-field">
                <label htmlFor="profile-goals">Learning goals</label>
                <textarea
                  id="profile-goals"
                  rows={3}
                  value={goals}
                  onChange={(event) => {
                    setGoals(event.target.value)
                    setFeedback('')
                    if (errors.goals) {
                      setErrors((current) => ({ ...current, goals: undefined }))
                    }
                  }}
                  aria-invalid={Boolean(errors.goals)}
                  aria-describedby={
                    errors.goals ? 'profile-goals-error' : 'profile-goals-hint'
                  }
                />
                {errors.goals ? (
                  <p className="field-error" id="profile-goals-error" role="alert">
                    {errors.goals}
                  </p>
                ) : (
                  <p className="field-hint" id="profile-goals-hint">
                    Separate goals with commas. Up to {MAX_GOALS} goals.
                  </p>
                )}
              </div>

              <div className="editable-actions">
                <button type="submit" className="btn btn-primary">
                  Save changes
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={!isDirty}
                >
                  Cancel
                </button>
                <span className="save-feedback" role="status">
                  {feedback}
                </span>
              </div>
            </form>
          </section>
        </div>
      </div>
    </section>
  )
}
