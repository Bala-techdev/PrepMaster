import { useEffect, useMemo, useRef, useState } from 'react'
import { Info, MinusCircle, PlusCircle, RotateCcw } from 'lucide-react'
import { useAppData } from '../state/useAppData'
import {
  DEFAULT_FOCUS_AREAS,
  loadFocusAreas,
  saveFocusAreas,
} from '../lib/localPreferences'
import { applyThemePreference, THEME_OPTIONS } from '../lib/theme'
import { formatReminderTime } from '../lib/format'
import './Settings.css'

const focusOptions = [
  'DSA',
  'Java OOP',
  'System Design',
  'Interview Preparation',
]

const themeLabels = {
  LIGHT: 'Light',
  DARK: 'Dark',
  SYSTEM: 'System',
}

const fallbackTimeZones = [
  'UTC',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Europe/London',
  'Europe/Berlin',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Australia/Sydney',
]

function detectedTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

function buildTimeZones(current) {
  let supported = []
  try {
    supported = Intl.supportedValuesOf?.('timeZone') || []
  } catch {
    supported = []
  }

  return [...new Set([current, ...fallbackTimeZones, ...supported].filter(Boolean))]
}

function toDraft(settings) {
  return {
    theme: settings?.theme || 'SYSTEM',
    emailNotifications: settings?.emailNotifications ?? true,
    dailyGoalMinutes: settings?.dailyGoalMinutes ?? 60,
    reminderTime: formatReminderTime(settings?.reminderTime),
    timezone: settings?.timezone || detectedTimeZone(),
  }
}

function validateDraft(draft, focusAreas) {
  const errors = {}

  if (!THEME_OPTIONS.includes(draft.theme)) {
    errors.theme = 'Choose a valid theme.'
  }

  const minutes = Number(draft.dailyGoalMinutes)
  if (!Number.isInteger(minutes) || minutes < 5 || minutes > 1440) {
    errors.dailyGoalMinutes = 'Choose a daily goal between 5 and 1,440 minutes.'
  }

  if (!draft.timezone.trim()) {
    errors.timezone = 'Choose a timezone.'
  } else {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: draft.timezone.trim() })
    } catch {
      errors.timezone = 'Choose a valid IANA timezone, for example Asia/Kolkata.'
    }
  }

  if (focusAreas.length === 0) {
    errors.focusAreas = 'Select at least one focus area.'
  }

  return errors
}

export default function SettingsPage() {
  const { settings, updateSettings } = useAppData()
  const [draft, setDraft] = useState(() => toDraft(settings))
  const [focusAreas, setFocusAreas] = useState(() => loadFocusAreas())
  const [errors, setErrors] = useState({})
  const [feedback, setFeedback] = useState('')
  const [feedbackTone, setFeedbackTone] = useState('success')
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)

  const timeZones = useMemo(
    () => buildTimeZones(settings?.timezone || detectedTimeZone()),
    [settings?.timezone],
  )

  /* Preview the draft theme immediately, but restore the saved theme when
     leaving the page without saving. */
  useEffect(() => {
    applyThemePreference(draft.theme)

    return () => {
      applyThemePreference(settings?.theme || 'SYSTEM')
    }
  }, [draft.theme, settings?.theme])

  const updateDraft = (patch) => {
    setDraft((current) => ({ ...current, ...patch }))
    setFeedback('')
  }

  const toggleFocusArea = (area) => {
    setFocusAreas((current) =>
      current.includes(area)
        ? current.filter((item) => item !== area)
        : [...current, area],
    )
    setFeedback('')
    setErrors((current) => ({ ...current, focusAreas: undefined }))
  }

  const persist = async (nextDraft, nextFocusAreas, successMessage) => {
    if (savingRef.current) return

    const nextErrors = validateDraft(nextDraft, nextFocusAreas)
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      setFeedback('')
      setFeedbackTone('error')
      return
    }

    savingRef.current = true
    setSaving(true)
    setErrors({})
    setFeedback('')

    try {
      const updated = await updateSettings({
        theme: nextDraft.theme,
        emailNotifications: nextDraft.emailNotifications,
        dailyGoalMinutes: Number(nextDraft.dailyGoalMinutes),
        reminderTime: nextDraft.reminderTime || null,
        timezone: nextDraft.timezone.trim(),
      })
      const savedAreas = saveFocusAreas(nextFocusAreas)

      setDraft(toDraft(updated))
      setFocusAreas(savedAreas)
      setFeedbackTone('success')
      setFeedback(successMessage)
    } catch (requestError) {
      if (requestError.fieldErrors && Object.keys(requestError.fieldErrors).length) {
        setErrors(requestError.fieldErrors)
      }
      setFeedbackTone('error')
      setFeedback(
        requestError.message || 'Settings could not be saved. Please try again.',
      )
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  const handleSave = (event) => {
    event.preventDefault()
    persist(draft, focusAreas, 'Settings saved to your account.')
  }

  const handleReset = () => {
    const defaults = {
      theme: 'SYSTEM',
      emailNotifications: true,
      dailyGoalMinutes: 60,
      reminderTime: '',
      timezone: detectedTimeZone(),
    }

    setDraft(defaults)
    setFocusAreas([...DEFAULT_FOCUS_AREAS])
    persist(defaults, DEFAULT_FOCUS_AREAS, 'Defaults restored and saved.')
  }

  const adjustGoal = (amount) => {
    const current = Number(draft.dailyGoalMinutes) || 60
    updateDraft({
      dailyGoalMinutes: Math.min(1440, Math.max(5, current + amount)),
    })
    setErrors((currentErrors) => ({ ...currentErrors, dailyGoalMinutes: undefined }))
  }

  return (
    <section className="settings-page">
      <div className="page-container settings-container">
        <header className="page-head">
          <div>
            <p className="page-eyebrow">Preferences</p>
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle">
              Preferences are saved to your account. Focus areas stay in this
              browser because the backend has no field for them.
            </p>
          </div>
        </header>

        <form onSubmit={handleSave} noValidate>
          <section className="setting-group" aria-labelledby="appearance-title">
            <h2 className="setting-group-title" id="appearance-title">
              Appearance
            </h2>

            <div className="setting-row setting-row-stacked">
              <div className="setting-copy">
                <span className="setting-name">Theme</span>
                <span className="setting-desc">
                  System follows your operating system colour preference.
                </span>
              </div>

              <div
                className="preference-tags"
                role="group"
                aria-label="Theme"
                aria-describedby={errors.theme ? 'theme-error' : undefined}
              >
                {THEME_OPTIONS.map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    className={`preference-tag${draft.theme === theme ? ' active' : ''}`}
                    onClick={() => {
                      updateDraft({ theme })
                      setErrors((current) => ({ ...current, theme: undefined }))
                    }}
                    aria-pressed={draft.theme === theme}
                  >
                    {themeLabels[theme]}
                  </button>
                ))}
              </div>
              {errors.theme && (
                <p className="field-error" id="theme-error" role="alert">
                  {errors.theme}
                </p>
              )}
            </div>

            <p className="settings-note">
              <Info size={14} aria-hidden="true" />
              The preview applies immediately across the sidebar, header, cards
              and inputs. Leaving this page without saving restores the saved
              theme.
            </p>
          </section>

          <section
            className="setting-group"
            aria-labelledby="notifications-title"
          >
            <h2 className="setting-group-title" id="notifications-title">
              Notifications
            </h2>

            <div className="setting-row">
              <div className="setting-copy">
                <span className="setting-name">Enable notifications</span>
                <span className="setting-desc">
                  Show the in-app notification panel and unread indicator.
                </span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  className="switch-input"
                  checked={draft.emailNotifications}
                  onChange={() =>
                    updateDraft({
                      emailNotifications: !draft.emailNotifications,
                    })
                  }
                />
                <span className="switch-track" aria-hidden="true" />
                <span className="visually-hidden">Enable notifications</span>
              </label>
            </div>

            <div className="setting-row">
              <div className="setting-copy">
                <span className="setting-name">Daily reminder time</span>
                <span className="setting-desc">
                  A saved reminder preference for your daily practice.
                </span>
              </div>
              <input
                type="time"
                className="settings-time-input"
                value={draft.reminderTime}
                onChange={(event) =>
                  updateDraft({ reminderTime: event.target.value })
                }
                aria-label="Daily reminder time"
              />
            </div>

            <p className="settings-note">
              <Info size={14} aria-hidden="true" />
              This preference controls the in-app notification panel. The
              prototype does not send email, push notifications or scheduled
              browser reminders.
            </p>
          </section>

          <section
            className="setting-group"
            aria-labelledby="learning-preferences-title"
          >
            <h2
              className="setting-group-title"
              id="learning-preferences-title"
            >
              Learning preferences
            </h2>

            <div className="setting-row setting-row-stacked">
              <div className="setting-copy">
                <span className="setting-name">Focus areas</span>
                <span className="setting-desc">
                  Choose the topics you want to prioritise. Select at least one.
                  Saved in this browser only.
                </span>
              </div>

              <div
                className="preference-tags"
                role="group"
                aria-label="Focus areas"
                aria-describedby={
                  errors.focusAreas ? 'focus-areas-error' : undefined
                }
              >
                {focusOptions.map((area) => {
                  const selected = focusAreas.includes(area)

                  return (
                    <button
                      key={area}
                      type="button"
                      className={`preference-tag${selected ? ' active' : ''}`}
                      onClick={() => toggleFocusArea(area)}
                      aria-pressed={selected}
                    >
                      {area}
                    </button>
                  )
                })}
              </div>
              {errors.focusAreas && (
                <p className="field-error" id="focus-areas-error" role="alert">
                  {errors.focusAreas}
                </p>
              )}
            </div>

            <div className="setting-row">
              <div className="setting-copy">
                <span className="setting-name">Daily goal</span>
                <span className="setting-desc">
                  Minutes of focused practice per day (5–1,440).
                </span>
              </div>

              <div className="goal-stepper" role="group" aria-label="Daily goal">
                <button
                  type="button"
                  className="stepper-btn"
                  onClick={() => adjustGoal(-15)}
                  disabled={Number(draft.dailyGoalMinutes) <= 5}
                  aria-label="Decrease daily goal"
                >
                  <MinusCircle size={18} aria-hidden="true" />
                </button>
                <label className="visually-hidden" htmlFor="daily-goal-minutes">
                  Daily goal in minutes
                </label>
                <input
                  id="daily-goal-minutes"
                  type="number"
                  className="goal-value-input"
                  min={5}
                  max={1440}
                  step={5}
                  value={draft.dailyGoalMinutes}
                  onChange={(event) =>
                    updateDraft({ dailyGoalMinutes: event.target.value })
                  }
                  aria-invalid={Boolean(errors.dailyGoalMinutes)}
                />
                <button
                  type="button"
                  className="stepper-btn"
                  onClick={() => adjustGoal(15)}
                  disabled={Number(draft.dailyGoalMinutes) >= 1440}
                  aria-label="Increase daily goal"
                >
                  <PlusCircle size={18} aria-hidden="true" />
                </button>
              </div>
            </div>
            {errors.dailyGoalMinutes && (
              <p className="field-error" role="alert">
                {errors.dailyGoalMinutes}
              </p>
            )}

            <div className="setting-row">
              <div className="setting-copy">
                <span className="setting-name">Timezone</span>
                <span className="setting-desc">
                  The backend uses this timezone to choose today&apos;s plan
                  date.
                </span>
              </div>
              <select
                className="settings-select"
                value={draft.timezone}
                onChange={(event) =>
                  updateDraft({ timezone: event.target.value })
                }
                aria-label="Timezone"
                aria-invalid={Boolean(errors.timezone)}
              >
                {timeZones.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
            </div>
            {errors.timezone && (
              <p className="field-error" role="alert">
                {errors.timezone}
              </p>
            )}
          </section>

          <div className="save-settings">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save all changes'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleReset}
              disabled={saving}
            >
              <RotateCcw size={15} aria-hidden="true" />
              Reset to defaults
            </button>
            <span
              className={`save-feedback${feedbackTone === 'error' ? ' is-error' : ''}`}
              role="status"
            >
              {feedback}
            </span>
          </div>
        </form>
      </div>
    </section>
  )
}
