import { useEffect, useRef, useState } from 'react'
import {
  Calendar,
  CheckCircle,
  Circle,
  Info,
  Star,
  TrendingUp,
  Trophy,
} from 'lucide-react'
import ProgressBar from '../components/ProgressBar'
import avatarSrc from '../assets/placeholder-avatar.svg'
import { useAppData } from '../state/useAppData'
import { loadGoals, saveGoals } from '../lib/localPreferences'
import { experienceLabel } from '../lib/format'
import './Profile.css'

const NAME_MIN = 2
const NAME_MAX = 80
const MAX_GOALS = 8
const GOAL_MAX = 80

const experienceOptions = [
  { value: '', label: 'Not set' },
  { value: 'STUDENT', label: 'Student' },
  { value: 'ENTRY', label: 'Entry level' },
  { value: 'MID', label: 'Mid level' },
  { value: 'SENIOR', label: 'Senior' },
]

function parseGoals(value) {
  return value
    .split(',')
    .map((goal) => goal.trim())
    .filter(Boolean)
}

function formFromProfile(profile) {
  return {
    displayName: profile?.displayName || '',
    headline: profile?.headline || '',
    bio: profile?.bio || '',
    avatarUrl: profile?.avatarUrl || '',
    location: profile?.location || '',
    targetRole: profile?.targetRole || '',
    experienceLevel: profile?.experienceLevel || '',
    githubUrl: profile?.githubUrl || '',
    linkedinUrl: profile?.linkedinUrl || '',
  }
}

function trimOrNull(value) {
  const clean = value.trim()
  return clean || null
}

export default function ProfilePage() {
  const { profile, stats, updateProfile } = useAppData()
  const [draft, setDraft] = useState(() => formFromProfile(profile))
  const [savedGoals, setSavedGoals] = useState(() => loadGoals())
  const [goals, setGoals] = useState(() => loadGoals().join(', '))
  const [errors, setErrors] = useState({})
  const [feedback, setFeedback] = useState('')
  const [feedbackTone, setFeedbackTone] = useState('success')
  const [saving, setSaving] = useState(false)
  const [avatarFailed, setAvatarFailed] = useState(false)
  const savingRef = useRef(false)

  useEffect(() => {
    setAvatarFailed(false)
  }, [draft.avatarUrl])

  const savedDraft = formFromProfile(profile)
  const savedGoalsText = savedGoals.join(', ')
  const isDirty =
    JSON.stringify(draft) !== JSON.stringify(savedDraft) || goals !== savedGoalsText

  const updateField = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }))
    setFeedback('')
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }))
    }
  }

  const validate = () => {
    const nextErrors = {}
    const cleanName = draft.displayName.trim()
    const parsedGoals = parseGoals(goals)

    if (cleanName.length < NAME_MIN) {
      nextErrors.displayName = `Enter at least ${NAME_MIN} characters for your name.`
    } else if (cleanName.length > NAME_MAX) {
      nextErrors.displayName = `Keep your name to ${NAME_MAX} characters or fewer.`
    }

    if (draft.headline.trim().length > 160) {
      nextErrors.headline = 'Keep the headline to 160 characters or fewer.'
    }
    if (draft.bio.trim().length > 1000) {
      nextErrors.bio = 'Keep the bio to 1000 characters or fewer.'
    }
    if (draft.avatarUrl.trim().length > 500) {
      nextErrors.avatarUrl = 'Keep the avatar URL to 500 characters or fewer.'
    }
    if (draft.location.trim().length > 100) {
      nextErrors.location = 'Keep the location to 100 characters or fewer.'
    }
    if (draft.targetRole.trim().length > 100) {
      nextErrors.targetRole = 'Keep the target role to 100 characters or fewer.'
    }
    if (draft.githubUrl.trim().length > 255) {
      nextErrors.githubUrl = 'Keep the GitHub URL to 255 characters or fewer.'
    }
    if (draft.linkedinUrl.trim().length > 255) {
      nextErrors.linkedinUrl = 'Keep the LinkedIn URL to 255 characters or fewer.'
    }

    if (parsedGoals.length === 0) {
      nextErrors.goals = 'Add at least one learning goal.'
    } else if (parsedGoals.length > MAX_GOALS) {
      nextErrors.goals = `Keep the list to ${MAX_GOALS} goals or fewer.`
    } else if (parsedGoals.some((goal) => goal.length > GOAL_MAX)) {
      nextErrors.goals = `Each goal must be ${GOAL_MAX} characters or fewer.`
    }

    return { errors: nextErrors, cleanName, parsedGoals }
  }

  const handleSave = async (event) => {
    event.preventDefault()
    if (savingRef.current) return

    setFeedback('')
    const result = validate()

    if (Object.keys(result.errors).length) {
      setErrors(result.errors)
      setFeedbackTone('error')
      document
        .getElementById(
          result.errors.displayName ? 'profile-name' : 'profile-goals',
        )
        ?.focus()
      return
    }

    savingRef.current = true
    setSaving(true)
    setErrors({})

    try {
      const updated = await updateProfile({
        displayName: result.cleanName,
        headline: trimOrNull(draft.headline),
        bio: trimOrNull(draft.bio),
        avatarUrl: trimOrNull(draft.avatarUrl),
        location: trimOrNull(draft.location),
        targetRole: trimOrNull(draft.targetRole),
        experienceLevel: draft.experienceLevel || null,
        githubUrl: trimOrNull(draft.githubUrl),
        linkedinUrl: trimOrNull(draft.linkedinUrl),
      })

      const cleanedGoals = saveGoals(result.parsedGoals)
      setDraft(formFromProfile(updated))
      setSavedGoals(cleanedGoals)
      setGoals(cleanedGoals.join(', '))
      setFeedbackTone('success')
      setFeedback('Profile saved to your account. Learning goals saved in this browser.')
    } catch (requestError) {
      if (requestError.fieldErrors && Object.keys(requestError.fieldErrors).length) {
        setErrors(requestError.fieldErrors)
      }
      setFeedbackTone('error')
      setFeedback(requestError.message || 'Your profile could not be saved. Please try again.')
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setDraft(formFromProfile(profile))
    setGoals(savedGoals.join(', '))
    setErrors({})
    setFeedbackTone('success')
    setFeedback('Changes discarded.')
  }

  const initial = (profile?.displayName || 'P').charAt(0).toUpperCase() || 'P'
  const avatarUrl = draft.avatarUrl.trim()

  return (
    <section className="profile-page">
      <div className="page-container profile-container">
        <header className="profile-header">
          <div className="profile-avatar">
            {avatarUrl && !avatarFailed ? (
              <img
                src={avatarUrl}
                alt=""
                className="profile-avatar-img"
                width={88}
                height={88}
                onError={() => setAvatarFailed(true)}
              />
            ) : avatarFailed || avatarUrl ? (
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
            <h1 className="profile-name">{profile?.displayName || 'PrepMaster user'}</h1>
            {profile?.headline && (
              <p className="profile-headline">{profile.headline}</p>
            )}
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
              {profile?.experienceLevel && (
                <span className="profile-chip">
                  <Trophy size={14} aria-hidden="true" />
                  {experienceLabel(profile.experienceLevel)}
                </span>
              )}
              {profile?.location && (
                <span className="profile-chip">{profile.location}</span>
              )}
            </div>
          </div>
        </header>

        <p className="profile-note" role="note">
          <Info size={15} aria-hidden="true" />
          Profile details are saved to your account through the backend.
          Learning goals stay in this browser because the backend has no field
          for them yet.
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
                  <CheckCircle size={17} />
                </span>
                <div>
                  <div className="stat-block-value">{stats.tasksCompleted}</div>
                  <div className="stat-block-label">Tasks completed</div>
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
              {stats.xpIntoLevel.toLocaleString()} /{' '}
              {stats.levelSpan.toLocaleString()} XP to level {stats.level + 1}
            </p>
          </section>
        </div>

        <div className="profile-grid">
          <section className="learning-goals" aria-labelledby="goals-title">
            <h2 className="profile-section-title" id="goals-title">
              Learning goals
            </h2>
            <ul className="goals-list">
              {savedGoals.map((goal) => (
                <li key={goal} className="goal-item">
                  <Circle className="goal-check" size={13} aria-hidden="true" />
                  {goal}
                  <span className="visually-hidden">active learning goal</span>
                </li>
              ))}
            </ul>
            <p className="goal-note">
              Goals are saved in this browser only. Completion is not tracked
              automatically.
            </p>
          </section>

          <section className="editable-profile" aria-labelledby="edit-title">
            <h2 className="profile-section-title" id="edit-title">
              Edit profile
            </h2>
            <form onSubmit={handleSave} noValidate>
              <div className="profile-form-grid">
                <div className="editable-field">
                  <label htmlFor="profile-name">Display name</label>
                  <input
                    type="text"
                    id="profile-name"
                    value={draft.displayName}
                    maxLength={NAME_MAX}
                    onChange={(event) => updateField('displayName', event.target.value)}
                    aria-invalid={Boolean(errors.displayName)}
                    aria-describedby={errors.displayName ? 'profile-name-error' : undefined}
                  />
                  {errors.displayName && (
                    <p className="field-error" id="profile-name-error" role="alert">
                      {errors.displayName}
                    </p>
                  )}
                </div>

                <div className="editable-field">
                  <label htmlFor="profile-role">Target role</label>
                  <input
                    type="text"
                    id="profile-role"
                    value={draft.targetRole}
                    maxLength={100}
                    onChange={(event) => updateField('targetRole', event.target.value)}
                    aria-invalid={Boolean(errors.targetRole)}
                  />
                  {errors.targetRole && (
                    <p className="field-error" role="alert">{errors.targetRole}</p>
                  )}
                </div>

                <div className="editable-field profile-form-full">
                  <label htmlFor="profile-headline">Headline</label>
                  <input
                    type="text"
                    id="profile-headline"
                    value={draft.headline}
                    maxLength={160}
                    onChange={(event) => updateField('headline', event.target.value)}
                    aria-invalid={Boolean(errors.headline)}
                    placeholder="Preparing for backend interviews"
                  />
                  {errors.headline && (
                    <p className="field-error" role="alert">{errors.headline}</p>
                  )}
                </div>

                <div className="editable-field">
                  <label htmlFor="profile-location">Location</label>
                  <input
                    type="text"
                    id="profile-location"
                    value={draft.location}
                    maxLength={100}
                    onChange={(event) => updateField('location', event.target.value)}
                    aria-invalid={Boolean(errors.location)}
                  />
                  {errors.location && (
                    <p className="field-error" role="alert">{errors.location}</p>
                  )}
                </div>

                <div className="editable-field">
                  <label htmlFor="profile-experience">Experience level</label>
                  <select
                    id="profile-experience"
                    value={draft.experienceLevel}
                    onChange={(event) => updateField('experienceLevel', event.target.value)}
                  >
                    {experienceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="editable-field profile-form-full">
                  <label htmlFor="profile-bio">Bio</label>
                  <textarea
                    id="profile-bio"
                    rows={3}
                    value={draft.bio}
                    maxLength={1000}
                    onChange={(event) => updateField('bio', event.target.value)}
                    aria-invalid={Boolean(errors.bio)}
                    placeholder="What are you working towards?"
                  />
                  {errors.bio && (
                    <p className="field-error" role="alert">{errors.bio}</p>
                  )}
                </div>

                <div className="editable-field profile-form-full">
                  <label htmlFor="profile-avatar">Avatar URL</label>
                  <input
                    type="url"
                    id="profile-avatar"
                    value={draft.avatarUrl}
                    maxLength={500}
                    onChange={(event) => updateField('avatarUrl', event.target.value)}
                    aria-invalid={Boolean(errors.avatarUrl)}
                    placeholder="https://example.com/avatar.png"
                  />
                  {errors.avatarUrl && (
                    <p className="field-error" role="alert">{errors.avatarUrl}</p>
                  )}
                </div>

                <div className="editable-field">
                  <label htmlFor="profile-github">GitHub URL</label>
                  <input
                    type="url"
                    id="profile-github"
                    value={draft.githubUrl}
                    maxLength={255}
                    onChange={(event) => updateField('githubUrl', event.target.value)}
                    aria-invalid={Boolean(errors.githubUrl)}
                    placeholder="https://github.com/you"
                  />
                  {errors.githubUrl && (
                    <p className="field-error" role="alert">{errors.githubUrl}</p>
                  )}
                </div>

                <div className="editable-field">
                  <label htmlFor="profile-linkedin">LinkedIn URL</label>
                  <input
                    type="url"
                    id="profile-linkedin"
                    value={draft.linkedinUrl}
                    maxLength={255}
                    onChange={(event) => updateField('linkedinUrl', event.target.value)}
                    aria-invalid={Boolean(errors.linkedinUrl)}
                    placeholder="https://linkedin.com/in/you"
                  />
                  {errors.linkedinUrl && (
                    <p className="field-error" role="alert">{errors.linkedinUrl}</p>
                  )}
                </div>

                <div className="editable-field profile-form-full">
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
                      Separate goals with commas. Up to {MAX_GOALS} goals, stored
                      in this browser.
                    </p>
                  )}
                </div>
              </div>

              <div className="editable-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={!isDirty || saving}
                >
                  Cancel
                </button>
                <span
                  className={`save-feedback${feedbackTone === 'error' ? ' is-error' : ''}`}
                  role="status"
                >
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
