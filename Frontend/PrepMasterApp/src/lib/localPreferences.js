import { readJSON, writeJSON } from './storage'

/*
 * The backend has no fields for learning goals or focus areas, so these two
 * preferences stay in localStorage. They are deliberately kept separate from
 * the server-backed profile/settings so a browser data reset never affects the
 * account, and a server change never silently overwrites them.
 */
const GOALS_KEY = 'prem-learning-goals'
const FOCUS_AREAS_KEY = 'prem-focus-areas'

export const DEFAULT_GOALS = ['Master DSA', 'Complete Java OOP']
export const DEFAULT_FOCUS_AREAS = ['DSA', 'Java OOP', 'System Design']

function cleanList(value, maxItems, maxLength) {
  if (!Array.isArray(value)) return []
  return [
    ...new Set(
      value
        .filter((item) => typeof item === 'string')
        .map((item) => item.trim().slice(0, maxLength))
        .filter(Boolean),
    ),
  ].slice(0, maxItems)
}

export function loadGoals() {
  const stored = cleanList(readJSON(GOALS_KEY, []), 8, 80)
  return stored.length ? stored : [...DEFAULT_GOALS]
}

export function saveGoals(goals) {
  const clean = cleanList(goals, 8, 80)
  writeJSON(GOALS_KEY, clean)
  return clean
}

export function loadFocusAreas() {
  const stored = cleanList(readJSON(FOCUS_AREAS_KEY, []), 8, 40)
  return stored.length ? stored : [...DEFAULT_FOCUS_AREAS]
}

export function saveFocusAreas(areas) {
  const clean = cleanList(areas, 8, 40)
  writeJSON(FOCUS_AREAS_KEY, clean)
  return clean
}
