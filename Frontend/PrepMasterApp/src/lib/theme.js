/* Theme helpers shared by the authenticated app and the settings preview. */

export const THEME_OPTIONS = ['LIGHT', 'DARK', 'SYSTEM']

export function resolveTheme(preference) {
  if (preference === 'DARK') return 'dark'
  if (preference === 'LIGHT') return 'light'

  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }

  return 'light'
}

export function applyThemePreference(preference) {
  if (typeof document === 'undefined') return resolveTheme(preference)

  const resolved = resolveTheme(preference)
  document.documentElement.setAttribute('data-theme', resolved)
  return resolved
}
