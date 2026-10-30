const DIFFICULTY_LABELS = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
}

const EXPERIENCE_LABELS = {
  STUDENT: 'Student',
  ENTRY: 'Entry level',
  MID: 'Mid level',
  SENIOR: 'Senior',
}

export function difficultyLabel(value) {
  return DIFFICULTY_LABELS[value] || value || 'Unknown'
}

export function experienceLabel(value) {
  return EXPERIENCE_LABELS[value] || value || 'Not set'
}

export function formatMinutes(minutes) {
  const value = Number(minutes) || 0
  if (value < 60) return `${value} min`
  const hours = Math.floor(value / 60)
  const rest = value % 60
  return rest ? `${hours}h ${rest}m` : `${hours}h`
}

export function formatReminderTime(value) {
  if (!value) return ''
  return String(value).slice(0, 5)
}

export function formatPercent(value, digits = 0) {
  const numeric = Number(value) || 0
  return `${numeric.toFixed(digits)}%`
}
