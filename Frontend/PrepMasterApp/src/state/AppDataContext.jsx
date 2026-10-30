import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { getMe, updateProfile as updateProfileRequest, updateSettings as updateSettingsRequest } from '../api/userService'
import {
  getAchievements,
  getActivity,
  getCategoryProgress,
  getProgress,
  getSolvedQuestions,
} from '../api/progressService'
import {
  getCategories,
  getAllTopics,
  getQuestions,
} from '../api/learningService'
import { generatePlan, getTodayPlan } from '../api/dailyPlanService'
import { completeTask as completeTaskRequest } from '../api/taskService'
import { addDays, dateKey } from '../lib/date'
import { applyThemePreference } from '../lib/theme'
import { AppDataContext } from './useAppData'

const DEFAULT_TASK_COUNT = 5
const ACTIVITY_DAYS = 365
const QUESTION_PAGE_SIZE = 200

const categoryStyle = {
  'data-structures-algorithms': { icon: 'Folder', color: 'var(--prem-blue)' },
  'java-oop': { icon: 'Code', color: 'var(--prem-purple)' },
  'system-design-foundations': { icon: 'Flag', color: 'var(--prem-amber)' },
}

const emptySettings = {
  theme: 'SYSTEM',
  emailNotifications: true,
  dailyGoalMinutes: 60,
  reminderTime: null,
  timezone: 'UTC',
}

const emptyProgress = {
  completedTasks: 0,
  totalTasks: 0,
  completionRate: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalXp: 0,
  currentLevel: 1,
}

async function fetchAllQuestions() {
  const first = await getQuestions({ page: 0, size: QUESTION_PAGE_SIZE })
  const content = [...(first.content || [])]
  const totalPages = Math.min(Number(first.totalPages) || 1, 10)

  for (let page = 1; page < totalPages; page += 1) {
    const next = await getQuestions({ page, size: QUESTION_PAGE_SIZE })
    content.push(...(next.content || []))
  }

  return {
    questions: content,
    totalElements: Number(first.totalElements) || content.length,
  }
}

function buildNotifications({ totalTasks, completedCount, solvedCount, totalQuestions, currentStreak }) {
  const items = []
  const remaining = Math.max(0, totalTasks - completedCount)

  if (totalTasks > 0) {
    items.push(
      remaining > 0
        ? {
            id: 'daily-plan',
            title: 'Daily plan',
            message: `${remaining} task${remaining === 1 ? '' : 's'} left today. Keep the streak alive.`,
            to: '/daily-plan',
          }
        : {
            id: 'daily-plan',
            title: 'Daily plan complete',
            message: 'Every task in today’s plan is complete.',
            to: '/daily-plan',
          },
    )
  }

  items.push({
    id: 'progress',
    title: 'Practice progress',
    message: `${solvedCount} of ${totalQuestions} questions recorded as solved.`,
    to: '/progress',
  })

  if (currentStreak > 0) {
    items.push({
      id: 'streak',
      title: `${currentStreak}-day streak`,
      message: 'Complete one more task today to extend your backend-recorded streak.',
      to: '/daily-plan',
    })
  }

  return items
}

function achievementIsEarned(code, context) {
  switch (code) {
    case 'FIRST_TASK':
      return context.tasksCompleted > 0
    case 'STREAK_7':
      return context.currentStreak >= 7
    case 'XP_1000':
      return context.totalXp >= 1000
    case 'CATEGORY_EXPLORER':
      return context.activeCategories > 1
    case 'CONSISTENT_LEARNER':
      return context.totalActiveDays >= 10
    default:
      return false
  }
}

export function AppDataProvider({ children }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [completingTaskId, setCompletingTaskId] = useState(null)
  const completingRef = useRef(false)
  const started = useRef(false)
  const requestId = useRef(0)

  const load = useCallback(async ({ silent = false, ensurePlan = true } = {}) => {
    const id = requestId.current + 1
    requestId.current = id

    if (silent) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const from = dateKey(addDays(new Date(), -(ACTIVITY_DAYS - 1)))
      const to = dateKey()

      const [
        me,
        progress,
        categories,
        topics,
        questionData,
        categoryProgress,
        solvedQuestions,
        achievements,
        activity,
      ] = await Promise.all([
        getMe(),
        getProgress(),
        getCategories(),
        getAllTopics(),
        fetchAllQuestions(),
        getCategoryProgress(),
        getSolvedQuestions(),
        getAchievements(),
        getActivity(from, to),
      ])

      let plan = null
      if (ensurePlan) {
        plan = await getTodayPlan()
        if (!plan) {
          plan = await generatePlan({
            taskCount: DEFAULT_TASK_COUNT,
            categoryIds: [],
          })
        }
      }

      const next = {
        me,
        progress,
        categories,
        topics,
        questions: questionData.questions,
        questionTotal: questionData.totalElements,
        categoryProgress,
        solvedQuestions,
        achievements,
        activity,
        plan,
        loadedAt: new Date().toISOString(),
      }

      if (requestId.current === id) {
        setData(next)
        setLoading(false)
        setRefreshing(false)
      }

      return next
    } catch (loadError) {
      if (requestId.current === id) {
        setLoading(false)
        setRefreshing(false)
        if (!silent) setError(loadError)
      }
      throw loadError
    }
  }, [])

  useEffect(() => {
    if (started.current) return
    started.current = true
    load().catch(() => {
      /* The provider exposes the error so the shell can render a retry state. */
    })
  }, [load])

  const refresh = useCallback(() => load({ silent: false }), [load])

  const profile = data?.me?.profile || null
  const settings = data?.me?.settings || emptySettings
  const progress = data?.progress || emptyProgress
  const categories = data?.categories || []
  const topics = data?.topics || []
  const questions = data?.questions || []
  const categoryProgress = data?.categoryProgress || []
  const solvedQuestions = data?.solvedQuestions || []
  const achievements = data?.achievements || []
  const activityRows = data?.activity || []
  const plan = data?.plan || null

  const derived = useMemo(() => {
    const topicById = new Map(topics.map((topic) => [topic.id, topic]))
    const questionById = new Map(questions.map((question) => [question.id, question]))
    const solvedIds = new Set(solvedQuestions.map((item) => item.questionId))
    const categoryProgressById = new Map(
      categoryProgress.map((item) => [item.categoryId, item]),
    )
    const topicsByCategory = new Map()

    for (const topic of topics) {
      if (!topicsByCategory.has(topic.categoryId)) {
        topicsByCategory.set(topic.categoryId, [])
      }
      topicsByCategory.get(topic.categoryId).push(topic)
    }

    const questionsByTopic = new Map()
    for (const question of questions) {
      if (!questionsByTopic.has(question.topicId)) {
        questionsByTopic.set(question.topicId, [])
      }
      questionsByTopic.get(question.topicId).push(question)
    }

    const topicViews = new Map()
    for (const topic of topics) {
      const topicQuestions = questionsByTopic.get(topic.id) || []
      const solvedCount = topicQuestions.filter((question) => solvedIds.has(question.id)).length
      topicViews.set(topic.id, {
        ...topic,
        title: topic.name,
        categoryTitle: topic.categoryName,
        questionCount: topicQuestions.length,
        solvedCount,
        questions: topicQuestions,
        completed: topicQuestions.length > 0 && solvedCount === topicQuestions.length,
      })
    }

    const categoryViews = categories.map((category) => {
      const categoryTopics = (topicsByCategory.get(category.id) || []).map(
        (topic) => topicViews.get(topic.id),
      )
      const backendProgress = categoryProgressById.get(category.id)
      const categoryQuestions = questions.filter(
        (question) => topicById.get(question.topicId)?.categoryId === category.id,
      )
      const total = Number(backendProgress?.totalQuestions) || categoryQuestions.length
      const completedCount = categoryQuestions.filter((question) => solvedIds.has(question.id)).length
      const percentage = total ? Math.min(100, Math.round((completedCount / total) * 100)) : 0
      const style = categoryStyle[category.slug] || {
        icon: 'Star',
        color: 'var(--prem-indigo)',
      }

      return {
        ...category,
        title: category.name,
        description: `${categoryTopics.length} topic${categoryTopics.length === 1 ? '' : 's'} · ${total} practice question${total === 1 ? '' : 's'}`,
        level: `${categoryTopics.length} topic${categoryTopics.length === 1 ? '' : 's'}`,
        topics: categoryTopics,
        total,
        completedCount,
        progress: percentage,
        badge: percentage === 100 && total > 0 ? 'Completed' : percentage > 0 ? 'In Progress' : 'Starting',
        icon: style.icon,
        color: style.color,
      }
    })

    const categoryById = new Map(categoryViews.map((category) => [category.id, category]))
    const planTasks = (plan?.tasks || []).map((task) => ({
      ...task,
      number: task.order,
      category: categoryById.get(task.categoryId)?.name || 'Learning',
      isCompleted: task.status === 'COMPLETED',
      isLocked: task.status === 'LOCKED',
    }))
    const completedCount = planTasks.filter((task) => task.isCompleted).length
    const totalTasks = planTasks.length
    const percentage = totalTasks ? Math.round((completedCount / totalTasks) * 100) : 0

    const activity = {}
    for (const row of activityRows) {
      if (Number(row.completedTasks) > 0) {
        activity[row.date] = Number(row.completedTasks)
      }
    }

    const solvedByDifficulty = { Easy: 0, Medium: 0, Hard: 0 }
    const difficultyTotals = { Easy: 0, Medium: 0, Hard: 0 }
    for (const question of questions) {
      const label =
        question.difficulty === 'EASY'
          ? 'Easy'
          : question.difficulty === 'HARD'
            ? 'Hard'
            : 'Medium'
      difficultyTotals[label] += 1
      if (solvedIds.has(question.id)) solvedByDifficulty[label] += 1
    }

    const solvedCount = solvedIds.size
    const totalQuestions = Number(data?.questionTotal) || questions.length
    const totalXp = Number(progress.totalXp) || 0
    const level = Number(progress.currentLevel) || 1
    const levelStart = 100 * (level - 1) ** 2
    const levelEnd = 100 * level ** 2
    const levelSpan = Math.max(1, levelEnd - levelStart)
    const xpIntoLevel = Math.max(0, totalXp - levelStart)
    const levelProgress = Math.min(100, Math.round((xpIntoLevel / levelSpan) * 100))
    const totalActiveDays = Number(data?.me?.streak?.totalActiveDays) || 0

    const solvedQuestionsView = solvedQuestions.map((item) => {
      const question = questionById.get(item.questionId)
      const topic = question ? topicById.get(question.topicId) : null
      return {
        ...item,
        title: item.title || question?.title || 'Question',
        topic: topic?.name || '',
        category: topic?.categoryName || '',
      }
    })

    const topicPerformance = categoryViews
      .filter((category) => category.total > 0)
      .map((category) => ({
        topic: category.name,
        solved: category.completedCount,
        total: category.total,
      }))

    const stats = {
      completedCount,
      totalTasks,
      percentage,
      tasksCompleted: Number(progress.completedTasks) || 0,
      totalPlanTasks: Number(progress.totalTasks) || 0,
      completionRate: Number(progress.completionRate) || 0,
      solvedCount,
      totalQuestions,
      solvedSet: solvedIds,
      solvedByDifficulty,
      difficultyTotals,
      currentStreak: Number(progress.currentStreak) || 0,
      longestStreak: Number(progress.longestStreak) || 0,
      totalXp,
      level,
      levelProgress,
      xpIntoLevel,
      levelSpan,
      totalActiveDays,
      todayActivity: activity[dateKey()] || 0,
      activity,
    }

    const achievementsView = achievements.map((achievement) => ({
      ...achievement,
      earned: achievementIsEarned(achievement.code, {
        tasksCompleted: stats.tasksCompleted,
        currentStreak: stats.currentStreak,
        totalXp: stats.totalXp,
        totalActiveDays: stats.totalActiveDays,
        activeCategories: categoryProgress.filter((item) => item.completedTasks > 0).length,
      }),
    }))

    const notifications = buildNotifications({
      totalTasks,
      completedCount,
      solvedCount,
      totalQuestions,
      currentStreak: stats.currentStreak,
    })

    return {
      categoryById,
      categoryViews,
      topicById,
      topicViews,
      solvedIds,
      stats,
      planTasks,
      solvedQuestionsView,
      topicPerformance,
      achievementsView,
      notifications,
    }
  }, [activityRows, categories, categoryProgress, data?.me?.streak?.totalActiveDays, data?.questionTotal, plan, progress, questions, solvedQuestions, topics])

  const completeTask = useCallback(
    async (taskId) => {
      if (completingRef.current) {
        return { ok: false, reason: 'busy', message: 'Another task is already being completed.' }
      }

      completingRef.current = true
      setCompletingTaskId(taskId)
      try {
        const completion = await completeTaskRequest(taskId)

        try {
          await load({ silent: true, ensurePlan: true })
        } catch {
          return {
            ok: true,
            completion,
            warning: 'Task completed, but the latest progress could not be reloaded.',
          }
        }

        return { ok: true, completion }
      } catch (completeError) {
        return {
          ok: false,
          reason: 'error',
          message: completeError.message || 'This task could not be completed. Please try again.',
        }
      } finally {
        completingRef.current = false
        setCompletingTaskId(null)
      }
    },
    [load],
  )

  const updateProfile = useCallback(async (payload) => {
    const updated = await updateProfileRequest(payload)
    setData((current) =>
      current
        ? { ...current, me: { ...current.me, profile: updated } }
        : current,
    )
    return updated
  }, [])

  const updateSettings = useCallback(async (payload) => {
    const updated = await updateSettingsRequest(payload)
    setData((current) =>
      current
        ? { ...current, me: { ...current.me, settings: updated } }
        : current,
    )
    return updated
  }, [])

  useEffect(() => {
    const preference = settings.theme || 'SYSTEM'
    applyThemePreference(preference)

    if (preference !== 'SYSTEM' || typeof window === 'undefined' || !window.matchMedia) {
      return undefined
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyThemePreference('SYSTEM')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [settings.theme])

  const value = useMemo(
    () => ({
      user: data?.me || null,
      profile,
      settings,
      streak: data?.me?.streak || null,
      plan,
      tasks: derived.planTasks || [],
      categories: derived.categoryViews,
      categoryById: derived.categoryById,
      topics,
      topicById: derived.topicById,
      topicViews: derived.topicViews,
      questions,
      questionTotal: Number(data?.questionTotal) || questions.length,
      categoryProgress,
      solvedQuestions: derived.solvedQuestionsView,
      achievements: derived.achievementsView,
      topicPerformance: derived.topicPerformance,
      activity: derived.stats.activity,
      stats: derived.stats,
      notifications: derived.notifications,
      notificationsEnabled: settings.emailNotifications,
      loading,
      refreshing,
      ready: Boolean(data),
      error,
      completingTaskId,
      completeTask,
      updateProfile,
      updateSettings,
      refresh,
    }),
    [
      completeTask,
      completingTaskId,
      data?.me,
      derived,
      error,
      loading,
      plan,
      profile,
      questions,
      refresh,
      refreshing,
      settings,
      topics,
      updateProfile,
      updateSettings,
      categoryProgress,
    ],
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}
