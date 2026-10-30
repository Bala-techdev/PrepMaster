import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { DAILY_TASKS, DAILY_TASK_IDS } from '../data/tasks'
import { PROBLEMS, PROBLEM_IDS } from '../data/problems'
import { ALL_LESSONS, ALL_LESSON_IDS, LEARNING_CATEGORIES } from '../data/lessons'
import { createSeedDiscussions, DISCUSSION_TOPICS } from '../data/discussions'
import { buildDemoActivity } from '../data/activitySeed'
import {
  isPlainObject,
  isStringArray,
  readJSON,
  readString,
  writeJSON,
  writeString,
} from '../lib/storage'
import {
  computeStreaks,
  isValidDateKey,
  keyToDate,
  todayKey,
} from '../lib/date'
import { DEFAULT_PROFILE, DEFAULT_SETTINGS, STORAGE_KEYS } from './defaults'
import { AppStateContext } from './appContext'

const MAX_ACTIVITY_PER_DAY = 100
const MAX_INTERVIEWS = 50
const MAX_DISCUSSIONS = 100
const BASE_TOTAL_XP = 15450

const VALID_PROBLEM_IDS = new Set(PROBLEM_IDS)
const VALID_LESSON_IDS = new Set(ALL_LESSON_IDS)
const VALID_TASK_IDS = new Set(DAILY_TASK_IDS)

function clampInteger(value, min, max, fallback) {
  const numeric = Math.floor(Number(value))
  if (!Number.isFinite(numeric)) return fallback
  return Math.min(max, Math.max(min, numeric))
}

function normalizeString(value, maxLength = 160) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function normalizeProfile(raw) {
  if (!isPlainObject(raw)) {
    return { ...DEFAULT_PROFILE, goals: [...DEFAULT_PROFILE.goals] }
  }

  const name = normalizeString(raw.name, 40) || DEFAULT_PROFILE.name
  const goals = Array.isArray(raw.goals)
    ? raw.goals
        .map((goal) => normalizeString(goal, 80))
        .filter(Boolean)
        .slice(0, 8)
    : []

  return {
    name,
    goals: goals.length ? goals : [...DEFAULT_PROFILE.goals],
  }
}

function normalizeSettings(raw) {
  if (!isPlainObject(raw)) {
    return {
      ...DEFAULT_SETTINGS,
      focusAreas: [...DEFAULT_SETTINGS.focusAreas],
    }
  }

  const focusAreas = Array.isArray(raw.focusAreas)
    ? [
        ...new Set(
          raw.focusAreas
            .map((area) => normalizeString(area, 40))
            .filter(Boolean),
        ),
      ].slice(0, 8)
    : []

  return {
    theme: raw.theme === 'dark' ? 'dark' : 'light',
    notifications:
      typeof raw.notifications === 'boolean'
        ? raw.notifications
        : DEFAULT_SETTINGS.notifications,
    dailyReminder:
      typeof raw.dailyReminder === 'boolean'
        ? raw.dailyReminder
        : DEFAULT_SETTINGS.dailyReminder,
    focusAreas: focusAreas.length
      ? focusAreas
      : [...DEFAULT_SETTINGS.focusAreas],
    dailyGoal: clampInteger(raw.dailyGoal, 1, 10, DEFAULT_SETTINGS.dailyGoal),
  }
}

function loadSettings() {
  const stored = readJSON(STORAGE_KEYS.settings, null)
  if (isPlainObject(stored)) return normalizeSettings(stored)

  /* Preserve the palette chosen in the earlier prototype build. */
  const legacyTheme = readString('prem-theme', '')
  return normalizeSettings({
    ...DEFAULT_SETTINGS,
    theme: legacyTheme === 'dark' ? 'dark' : 'light',
  })
}

function normalizeCompletedIds(rawIds) {
  if (!Array.isArray(rawIds)) return []

  const requested = new Set(
    rawIds
      .map((id) => Number(id))
      .filter((id) => VALID_TASK_IDS.has(id)),
  )

  /* Keep only the sequential prefix. A stored gap must never leave a
     later task marked complete behind a locked one. */
  const prefix = []
  for (const task of DAILY_TASKS) {
    if (!requested.has(task.id)) break
    prefix.push(task.id)
  }

  return prefix
}

function normalizeDaily(raw, today) {
  if (!isPlainObject(raw) || raw.date !== today) {
    return { date: today, completedIds: [] }
  }

  return {
    date: today,
    completedIds: normalizeCompletedIds(raw.completedIds),
  }
}

function loadDaily(today) {
  const stored = readJSON(STORAGE_KEYS.daily, null)
  if (isPlainObject(stored)) return normalizeDaily(stored, today)

  /* Migrate the earlier prototype key if it exists. */
  const legacy = readJSON('prem-task-completion', null)
  if (Array.isArray(legacy)) {
    const completedIds = legacy
      .filter((item) => isPlainObject(item) && item.isCompleted)
      .map((item) => Number(item.id))
    return normalizeDaily({ date: today, completedIds }, today)
  }

  return { date: today, completedIds: [] }
}

function normalizeActivity(raw) {
  if (!isPlainObject(raw)) return {}

  const activity = {}
  for (const [key, value] of Object.entries(raw)) {
    if (!isValidDateKey(key)) continue
    const count = Math.floor(Number(value))
    if (Number.isFinite(count) && count > 0) {
      activity[key] = Math.min(MAX_ACTIVITY_PER_DAY, count)
    }
  }

  return activity
}

function normalizeSolved(raw) {
  if (!Array.isArray(raw)) return []
  return [
    ...new Set(
      raw
        .map((id) => (typeof id === 'string' ? id : ''))
        .filter((id) => VALID_PROBLEM_IDS.has(id)),
    ),
  ]
}

function normalizeCompletedLessons(raw) {
  if (!Array.isArray(raw)) return []
  return [
    ...new Set(
      raw
        .map((id) => (typeof id === 'string' ? id : ''))
        .filter((id) => VALID_LESSON_IDS.has(id)),
    ),
  ]
}

function normalizeInterview(raw) {
  if (!isPlainObject(raw) || typeof raw.id !== 'string') return null

  const startedAt = new Date(raw.startedAt)
  const endedAt = new Date(raw.endedAt)
  if (Number.isNaN(startedAt.getTime()) || Number.isNaN(endedAt.getTime())) {
    return null
  }

  const questionIds = isStringArray(raw.questionIds) ? raw.questionIds : []
  if (!questionIds.length) return null

  const answers = isPlainObject(raw.answers)
    ? Object.fromEntries(
        Object.entries(raw.answers).filter(
          ([id, value]) => questionIds.includes(id) && value === true,
        ),
      )
    : {}

  return {
    id: raw.id,
    difficulty: normalizeString(raw.difficulty, 20) || 'All',
    topic: normalizeString(raw.topic, 40) || 'All',
    durationMinutes: clampInteger(raw.durationMinutes, 1, 180, 45),
    startedAt: startedAt.toISOString(),
    endedAt: endedAt.toISOString(),
    endReason: raw.endReason === 'time' ? 'time' : 'manual',
    questionIds,
    answers,
    answeredCount: clampInteger(
      raw.answeredCount,
      0,
      questionIds.length,
      Object.keys(answers).length,
    ),
    score: clampInteger(raw.score, 0, 100, 0),
    elapsedSeconds: clampInteger(raw.elapsedSeconds, 0, 180 * 60, 0),
  }
}

function normalizeInterviews(raw) {
  if (!Array.isArray(raw)) return []

  return raw
    .map(normalizeInterview)
    .filter(Boolean)
    .sort((a, b) => new Date(b.endedAt) - new Date(a.endedAt))
    .slice(0, MAX_INTERVIEWS)
}

function normalizeReplies(raw) {
  if (!Array.isArray(raw)) return []

  return raw
    .filter((reply) => isPlainObject(reply) && typeof reply.body === 'string')
    .map((reply) => ({
      id:
        typeof reply.id === 'string' && reply.id
          ? reply.id
          : `reply-${Math.random().toString(36).slice(2)}`,
      author: normalizeString(reply.author, 40) || 'You',
      body: normalizeString(reply.body, 2000),
      createdAt: Number.isNaN(new Date(reply.createdAt).getTime())
        ? new Date().toISOString()
        : new Date(reply.createdAt).toISOString(),
    }))
    .filter((reply) => reply.body)
    .slice(-100)
}

function normalizeDiscussion(raw) {
  if (!isPlainObject(raw) || typeof raw.title !== 'string') return null

  const title = normalizeString(raw.title, 120)
  const body = normalizeString(raw.body, 2000)
  if (!title) return null

  return {
    id:
      typeof raw.id === 'string' && raw.id
        ? raw.id
        : `local-${Math.random().toString(36).slice(2)}`,
    title,
    body,
    category: DISCUSSION_TOPICS.includes(raw.category)
      ? raw.category
      : 'General',
    author: normalizeString(raw.author, 40) || 'You',
    createdAt: Number.isNaN(new Date(raw.createdAt).getTime())
      ? new Date().toISOString()
      : new Date(raw.createdAt).toISOString(),
    upvotes: clampInteger(raw.upvotes, 0, 9999, 0),
    isDemo: Boolean(raw.isDemo),
    replies: normalizeReplies(raw.replies),
  }
}

function normalizeCommunity(raw) {
  if (!isPlainObject(raw) || !Array.isArray(raw.discussions)) {
    return {
      discussions: createSeedDiscussions(),
      votedIds: [],
    }
  }

  const discussions = raw.discussions
    .map(normalizeDiscussion)
    .filter(Boolean)
    .slice(0, MAX_DISCUSSIONS)

  return {
    discussions: discussions.length ? discussions : createSeedDiscussions(),
    votedIds: Array.isArray(raw.votedIds)
      ? [...new Set(raw.votedIds.filter((id) => typeof id === 'string'))]
      : [],
  }
}

function mergeActivity(demoActivity, actualActivity) {
  const merged = { ...demoActivity }

  for (const [key, count] of Object.entries(actualActivity)) {
    merged[key] = (merged[key] || 0) + count
  }

  return merged
}

export function AppStateProvider({ children }) {
  const [today, setToday] = useState(todayKey)
  const [profile, setProfile] = useState(() =>
    normalizeProfile(readJSON(STORAGE_KEYS.profile, null)),
  )
  const [settings, setSettings] = useState(loadSettings)
  const [daily, setDaily] = useState(() => loadDaily(todayKey()))
  /* Migration repair: a legacy plan could mark tasks complete without
     recording matching activity. Reconcile the two so counts derived
     from either source agree. */
  const [actualActivity, setActualActivity] = useState(() => {
    const stored = normalizeActivity(readJSON(STORAGE_KEYS.activity, {}))
    const key = todayKey()
    const plan = loadDaily(key)
    const recorded = stored[key] || 0

    if (plan.date === key && plan.completedIds.length > recorded) {
      return { ...stored, [key]: plan.completedIds.length }
    }

    return stored
  })
  const [solvedProblems, setSolvedProblems] = useState(() =>
    normalizeSolved(readJSON(STORAGE_KEYS.solved, [])),
  )
  const [completedLessons, setCompletedLessons] = useState(() =>
    normalizeCompletedLessons(readJSON(STORAGE_KEYS.lessons, [])),
  )
  const [interviews, setInterviews] = useState(() =>
    normalizeInterviews(readJSON(STORAGE_KEYS.interviews, [])),
  )
  const [community, setCommunity] = useState(() =>
    normalizeCommunity(readJSON(STORAGE_KEYS.community, null)),
  )

  /* Persist every slice. Failures are swallowed by the storage helper.
     Block bodies are required: an effect must not return a boolean as
     if it were a cleanup function. */
  useEffect(() => {
    writeJSON(STORAGE_KEYS.profile, profile)
  }, [profile])
  useEffect(() => {
    writeJSON(STORAGE_KEYS.settings, settings)
    writeString('prem-theme', settings.theme)
  }, [settings])
  useEffect(() => {
    writeJSON(STORAGE_KEYS.daily, daily)
  }, [daily])
  useEffect(() => {
    writeJSON(STORAGE_KEYS.activity, actualActivity)
  }, [actualActivity])
  useEffect(() => {
    writeJSON(STORAGE_KEYS.solved, solvedProblems)
  }, [solvedProblems])
  useEffect(() => {
    writeJSON(STORAGE_KEYS.lessons, completedLessons)
  }, [completedLessons])
  useEffect(() => {
    writeJSON(STORAGE_KEYS.interviews, interviews)
  }, [interviews])
  useEffect(() => {
    writeJSON(STORAGE_KEYS.community, community)
  }, [community])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme)
  }, [settings.theme])

  /* Detect the local date change without polling every second. The
     dashboard countdown handles its own one-second tick. */
  useEffect(() => {
    const detect = () => {
      const next = todayKey()
      setToday((current) => (current === next ? current : next))
    }

    const timer = window.setInterval(detect, 15000)
    window.addEventListener('focus', detect)

    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', detect)
    }
  }, [])

  /* A new local day starts with an empty plan. This is derived rather
     than written back in an effect, so a date change cannot cause a
     cascading render. */
  const effectiveDaily = useMemo(
    () =>
      daily.date === today ? daily : { date: today, completedIds: [] },
    [daily, today],
  )

  const demoActivity = useMemo(
    () => buildDemoActivity(keyToDate(today)),
    [today],
  )

  const activity = useMemo(
    () => mergeActivity(demoActivity, actualActivity),
    [demoActivity, actualActivity],
  )

  const streaks = useMemo(
    () => computeStreaks(activity, today),
    [activity, today],
  )
  const currentStreak = streaks.current
  const longestStreak = streaks.longest

  const dailyTasks = useMemo(() => {
    const completed = new Set(effectiveDaily.completedIds)

    return DAILY_TASKS.map((task, index) => ({
      ...task,
      isCompleted: completed.has(task.id),
      isLocked:
        index > 0 && !completed.has(DAILY_TASKS[index - 1].id),
    }))
  }, [effectiveDaily])

  const stats = useMemo(() => {
    const completedCount = effectiveDaily.completedIds.length
    const totalTasks = DAILY_TASKS.length
    const percentage = Math.round((completedCount / totalTasks) * 100)
    const tasksCompleted = Object.values(actualActivity).reduce(
      (total, count) => total + count,
      0,
    )
    const solvedSet = new Set(solvedProblems)
    const lessonSet = new Set(completedLessons)

    const solvedByDifficulty = { Easy: 0, Medium: 0, Hard: 0 }
    const difficultyTotals = { Easy: 0, Medium: 0, Hard: 0 }
    const topicMap = new Map()

    for (const problem of PROBLEMS) {
      if (!difficultyTotals[problem.difficulty]) {
        difficultyTotals[problem.difficulty] = 0
      }
      difficultyTotals[problem.difficulty] += 1

      if (!topicMap.has(problem.topic)) {
        topicMap.set(problem.topic, { topic: problem.topic, total: 0, solved: 0 })
      }

      const entry = topicMap.get(problem.topic)
      entry.total += 1

      if (solvedSet.has(problem.id)) {
        entry.solved += 1
        solvedByDifficulty[problem.difficulty] =
          (solvedByDifficulty[problem.difficulty] || 0) + 1
      }
    }

    const topicPerformance = [...topicMap.values()].sort((a, b) =>
      a.topic.localeCompare(b.topic),
    )

    const totalLessons = ALL_LESSONS.length
    const lessonsDone = ALL_LESSONS.filter((lesson) =>
      lessonSet.has(lesson.id),
    ).length

    const solvedCount = solvedProblems.length
    const overallTotal = totalTasks + PROBLEMS.length + totalLessons
    const overallDone = completedCount + solvedCount + lessonsDone
    const overallPercentage = overallTotal
      ? Math.round((overallDone / overallTotal) * 100)
      : 0

    const totalXp =
      BASE_TOTAL_XP +
      tasksCompleted * 50 +
      solvedCount * 40 +
      lessonsDone * 30 +
      interviews.length * 120
    const level = Math.floor(totalXp / 1000)
    const xpIntoLevel = totalXp % 1000
    const levelProgress = Math.round((xpIntoLevel / 1000) * 100)

    return {
      completedCount,
      totalTasks,
      percentage,
      tasksCompleted,
      solvedCount,
      solvedSet,
      solvedByDifficulty,
      difficultyTotals,
      topicPerformance,
      totalLessons,
      lessonsDone,
      overallTotal,
      overallDone,
      overallPercentage,
      totalXp,
      level,
      xpIntoLevel,
      levelProgress,
      currentStreak,
      longestStreak,
      interviewCount: interviews.length,
      todayActivity: actualActivity[today] || 0,
      activity,
    }
  }, [
    actualActivity,
    completedLessons,
    effectiveDaily,
    interviews,
    solvedProblems,
    currentStreak,
    longestStreak,
    today,
    activity,
  ])

  const categories = useMemo(() => {
    const completed = new Set(completedLessons)

    return LEARNING_CATEGORIES.map((category) => {
      const completedCount = category.lessons.filter((lesson) =>
        completed.has(lesson.id),
      ).length
      const total = category.lessons.length
      const progress = total
        ? Math.round((completedCount / total) * 100)
        : 0
      const badge =
        progress === 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Starting'

      return {
        ...category,
        completedCount,
        total,
        progress,
        badge,
      }
    })
  }, [completedLessons])

  const notifications = useMemo(() => {
    const items = []
    const remaining = stats.totalTasks - stats.completedCount

    if (remaining > 0) {
      items.push({
        id: 'daily-plan',
        title: 'Daily plan',
        message: `${remaining} task${remaining === 1 ? '' : 's'} left today. Keep the streak alive.`,
        to: '/daily-plan',
      })
    } else {
      items.push({
        id: 'daily-plan',
        title: 'Daily plan complete',
        message: 'All five tasks are done. Revisit a completed task any time.',
        to: '/daily-plan',
      })
    }

    if (!interviews.length) {
      items.push({
        id: 'first-interview',
        title: 'Try a mock interview',
        message: 'A focused 45-minute session is ready when you are.',
        to: '/mock-interview',
      })
    } else {
      items.push({
        id: 'progress',
        title: 'Mock interview history',
        message: `${interviews.length} session${interviews.length === 1 ? '' : 's'} recorded in this browser.`,
        to: '/progress',
      })
    }

    items.push({
      id: 'learn',
      title: 'Next lesson',
      message: `${stats.lessonsDone} of ${stats.totalLessons} lessons completed so far.`,
      to: '/learn',
    })

    return items
  }, [interviews.length, stats])

  const completeTask = useCallback(
    (taskId) => {
      const id = Number(taskId)
      const index = DAILY_TASKS.findIndex((task) => task.id === id)

      if (index === -1) return { ok: false, reason: 'invalid' }

      const key = todayKey()
      const current =
        daily.date === key ? daily : { date: key, completedIds: [] }

      if (current.completedIds.includes(id)) {
        return { ok: false, reason: 'completed' }
      }

      if (
        index > 0 &&
        !current.completedIds.includes(DAILY_TASKS[index - 1].id)
      ) {
        return { ok: false, reason: 'locked' }
      }

      setDaily({
        date: key,
        completedIds: [...current.completedIds, id],
      })
      setActualActivity((previous) => ({
        ...previous,
        [key]: Math.min(MAX_ACTIVITY_PER_DAY, (previous[key] || 0) + 1),
      }))

      return { ok: true }
    },
    [daily],
  )

  const toggleProblemSolved = useCallback((problemId) => {
    if (!VALID_PROBLEM_IDS.has(problemId)) {
      return { ok: false, reason: 'invalid' }
    }

    setSolvedProblems((previous) =>
      previous.includes(problemId)
        ? previous.filter((id) => id !== problemId)
        : [...previous, problemId],
    )

    return { ok: true }
  }, [])

  const toggleLessonCompleted = useCallback((lessonId) => {
    if (!VALID_LESSON_IDS.has(lessonId)) {
      return { ok: false, reason: 'invalid' }
    }

    setCompletedLessons((previous) =>
      previous.includes(lessonId)
        ? previous.filter((id) => id !== lessonId)
        : [...previous, lessonId],
    )

    return { ok: true }
  }, [])

  const saveInterview = useCallback((record) => {
    const normalized = normalizeInterview(record)
    if (!normalized) return { ok: false, reason: 'invalid' }

    setInterviews((previous) => {
      if (previous.some((item) => item.id === normalized.id)) {
        return previous
      }
      return [normalized, ...previous].slice(0, MAX_INTERVIEWS)
    })

    return { ok: true }
  }, [])

  const saveProfile = useCallback((next) => {
    const normalized = normalizeProfile(next)
    setProfile(normalized)
    return normalized
  }, [])

  const saveSettings = useCallback((next) => {
    const normalized = normalizeSettings(next)
    setSettings(normalized)
    return normalized
  }, [])

  const resetSettings = useCallback(() => {
    const defaults = {
      ...DEFAULT_SETTINGS,
      focusAreas: [...DEFAULT_SETTINGS.focusAreas],
    }
    setSettings(defaults)
    return defaults
  }, [])

  const toggleVote = useCallback((discussionId) => {
    setCommunity((previous) => {
      const hasVoted = previous.votedIds.includes(discussionId)

      return {
        votedIds: hasVoted
          ? previous.votedIds.filter((id) => id !== discussionId)
          : [...previous.votedIds, discussionId],
        discussions: previous.discussions.map((discussion) =>
          discussion.id === discussionId
            ? {
                ...discussion,
                upvotes: Math.max(
                  0,
                  discussion.upvotes + (hasVoted ? -1 : 1),
                ),
              }
            : discussion,
        ),
      }
    })
  }, [])

  const addDiscussion = useCallback(({ title, body, category }) => {
    const cleanTitle = normalizeString(title, 120)
    const cleanBody = normalizeString(body, 2000)
    if (cleanTitle.length < 5) return { ok: false, reason: 'title' }
    if (cleanBody.length < 10) return { ok: false, reason: 'body' }

    const id = `local-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 7)}`

    setCommunity((previous) => ({
      ...previous,
      discussions: [
        {
          id,
          title: cleanTitle,
          body: cleanBody,
          category: DISCUSSION_TOPICS.includes(category) ? category : 'General',
          author: 'You',
          createdAt: new Date().toISOString(),
          upvotes: 0,
          isDemo: false,
          replies: [],
        },
        ...previous.discussions,
      ].slice(0, MAX_DISCUSSIONS),
    }))

    return { ok: true, id }
  }, [])

  const addReply = useCallback((discussionId, body) => {
    const cleanBody = normalizeString(body, 2000)
    if (cleanBody.length < 5) return { ok: false, reason: 'body' }

    setCommunity((previous) => ({
      ...previous,
      discussions: previous.discussions.map((discussion) =>
        discussion.id === discussionId
          ? {
              ...discussion,
              replies: [
                ...discussion.replies,
                {
                  id: `reply-${Date.now().toString(36)}-${Math.random()
                    .toString(36)
                    .slice(2, 6)}`,
                  author: 'You',
                  body: cleanBody,
                  createdAt: new Date().toISOString(),
                },
              ].slice(-100),
            }
          : discussion,
      ),
    }))

    return { ok: true }
  }, [])

  const value = useMemo(
    () => ({
      today,
      profile,
      settings,
      daily: effectiveDaily,
      dailyTasks,
      activity,
      stats,
      categories,
      solvedProblems,
      completedLessons,
      interviews,
      community,
      notifications,
      notificationsEnabled: settings.notifications,
      completeTask,
      toggleProblemSolved,
      toggleLessonCompleted,
      saveInterview,
      saveProfile,
      saveSettings,
      resetSettings,
      toggleVote,
      addDiscussion,
      addReply,
    }),
    [
      activity,
      addDiscussion,
      addReply,
      categories,
      completeTask,
      completedLessons,
      community,
      dailyTasks,
      effectiveDaily,
      interviews,
      notifications,
      profile,
      resetSettings,
      saveInterview,
      saveProfile,
      saveSettings,
      settings,
      solvedProblems,
      stats,
      today,
      toggleLessonCompleted,
      toggleProblemSolved,
      toggleVote,
    ],
  )

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  )
}
