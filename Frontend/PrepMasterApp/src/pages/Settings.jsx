import { useEffect, useState } from 'react'
import { Info, MinusCircle, PlusCircle, RotateCcw } from 'lucide-react'
import { useAppState } from '../state/appContext'
import './Settings.css'

const focusOptions = [
  'DSA',
  'Java OOP',
  'System Design',
  'Interview Preparation',
]

function copySettings(source) {
  return { ...source, focusAreas: [...source.focusAreas] }
}

export default function SettingsPage() {
  const { settings, saveSettings, resetSettings } = useAppState()
  const [draft, setDraft] = useState(() => copySettings(settings))
  const [errors, setErrors] = useState({})
  const [feedback, setFeedback] = useState('')

  /* Preview the draft theme immediately, but restore the saved theme when
     leaving the page without saving. */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', draft.theme)

    return () => {
      document.documentElement.setAttribute('data-theme', settings.theme)
    }
  }, [draft.theme, settings.theme])

  const updateDraft = (patch) => {
    setDraft((current) => ({ ...current, ...patch }))
    setFeedback('')
  }

  const toggleFocusArea = (area) => {
    setDraft((current) => {
      const selected = current.focusAreas.includes(area)
      return {
        ...current,
        focusAreas: selected
          ? current.focusAreas.filter((item) => item !== area)
          : [...current.focusAreas, area],
      }
    })
    setFeedback('')
    setErrors((current) => ({ ...current, focusAreas: undefined }))
  }

  const validate = () => {
    const nextErrors = {}

    if (draft.focusAreas.length === 0) {
      nextErrors.focusAreas = 'Select at least one focus area.'
    }

    if (draft.dailyGoal < 1 || draft.dailyGoal > 10) {
      nextErrors.dailyGoal = 'Choose a daily goal between 1 and 10 problems.'
    }

    return nextErrors
  }

  const handleSave = (event) => {
    event.preventDefault()
    const nextErrors = validate()

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      setFeedback('')
      return
    }

    const saved = saveSettings(draft)
    setDraft(copySettings(saved))
    setErrors({})
    setFeedback('Settings saved locally and will persist after refresh.')
  }

  const handleReset = () => {
    const defaults = resetSettings()
    setDraft(copySettings(defaults))
    setErrors({})
    setFeedback('Settings reset to defaults.')
  }

  const isDark = draft.theme === 'dark'

  return (
    <section className="settings-page">
      <div className="page-container settings-container">
        <header className="page-head">
          <div>
            <p className="page-eyebrow">Preferences</p>
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle">
              Customise your PrepMaster experience. Settings stay in this
              browser.
            </p>
          </div>
        </header>

        <form onSubmit={handleSave} noValidate>
          <section className="setting-group" aria-labelledby="appearance-title">
            <h2 className="setting-group-title" id="appearance-title">
              Appearance
            </h2>

            <div className="setting-row">
              <div className="setting-copy">
                <span className="setting-name">Dark mode</span>
                <span className="setting-desc">
                  Preview a darker palette for low-light study sessions. Save to
                  keep it after refresh.
                </span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  className="switch-input"
                  checked={isDark}
                  onChange={() => updateDraft({ theme: isDark ? 'light' : 'dark' })}
                />
                <span className="switch-track" aria-hidden="true" />
                <span className="visually-hidden">Enable dark mode</span>
              </label>
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
                  checked={draft.notifications}
                  onChange={() =>
                    updateDraft({ notifications: !draft.notifications })
                  }
                />
                <span className="switch-track" aria-hidden="true" />
                <span className="visually-hidden">Enable notifications</span>
              </label>
            </div>

            <div className="setting-row">
              <div className="setting-copy">
                <span className="setting-name">Daily practice reminders</span>
                <span className="setting-desc">
                  Remember that you prefer a daily nudge when you have not
                  practised yet.
                </span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  className="switch-input"
                  checked={draft.dailyReminder}
                  onChange={() =>
                    updateDraft({ dailyReminder: !draft.dailyReminder })
                  }
                  disabled={!draft.notifications}
                />
                <span className="switch-track" aria-hidden="true" />
                <span className="visually-hidden">Enable daily reminders</span>
              </label>
            </div>

            <p className="settings-note">
              <Info size={14} aria-hidden="true" />
              This frontend prototype cannot deliver push notifications, browser
              permission prompts or scheduled reminders. The preference is
              stored locally only; no notification is actually sent. Daily
              reminders require notifications to be enabled.
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
                  const selected = draft.focusAreas.includes(area)

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
                  How many problems you aim to solve each day (1–10).
                </span>
              </div>

              <div className="goal-stepper" role="group" aria-label="Daily goal">
                <button
                  type="button"
                  className="stepper-btn"
                  onClick={() =>
                    updateDraft({ dailyGoal: Math.max(1, draft.dailyGoal - 1) })
                  }
                  disabled={draft.dailyGoal <= 1}
                  aria-label="Decrease daily goal"
                >
                  <MinusCircle size={18} aria-hidden="true" />
                </button>
                <span className="goal-value" aria-live="polite">
                  {draft.dailyGoal}{' '}
                  {draft.dailyGoal === 1 ? 'problem' : 'problems'}
                </span>
                <button
                  type="button"
                  className="stepper-btn"
                  onClick={() =>
                    updateDraft({ dailyGoal: Math.min(10, draft.dailyGoal + 1) })
                  }
                  disabled={draft.dailyGoal >= 10}
                  aria-label="Increase daily goal"
                >
                  <PlusCircle size={18} aria-hidden="true" />
                </button>
              </div>
            </div>
            {errors.dailyGoal && (
              <p className="field-error" role="alert">
                {errors.dailyGoal}
              </p>
            )}
          </section>

          <div className="save-settings">
            <button type="submit" className="btn btn-primary">
              Save all changes
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleReset}
            >
              <RotateCcw size={15} aria-hidden="true" />
              Reset to defaults
            </button>
            <span className="save-feedback" role="status">
              {feedback}
            </span>
          </div>
        </form>
      </div>
    </section>
  )
}
