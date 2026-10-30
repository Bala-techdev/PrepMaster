/* Shared storage keys and defaults. Kept separate from the provider so
   the component module only exports components (fast refresh friendly). */

export const STORAGE_KEYS = {
  profile: 'prem-profile',
  settings: 'prem-settings',
  daily: 'prem-daily-progress',
  activity: 'prem-activity',
  solved: 'prem-solved-problems',
  lessons: 'prem-completed-lessons',
  interviews: 'prem-interviews',
  community: 'prem-community',
}

export const DEFAULT_PROFILE = {
  name: 'Bala',
  goals: ['Master DSA', 'Complete Java OOP', 'System Design'],
}

export const DEFAULT_SETTINGS = {
  theme: 'light',
  notifications: true,
  dailyReminder: false,
  focusAreas: ['DSA', 'Java OOP', 'System Design'],
  dailyGoal: 2,
}
