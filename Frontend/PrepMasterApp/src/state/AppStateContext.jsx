import { useCallback, useEffect, useMemo, useState } from 'react'
import { createSeedDiscussions, DISCUSSION_TOPICS } from '../data/discussions'
import {
  isPlainObject,
  isStringArray,
  readJSON,
  writeJSON,
} from '../lib/storage'
import { STORAGE_KEYS } from './defaults'
import { AppStateContext } from './appContext'

const MAX_INTERVIEWS = 50
const MAX_DISCUSSIONS = 100

function clampInteger(value, min, max, fallback) {
  const numeric = Math.floor(Number(value))
  if (!Number.isFinite(numeric)) return fallback
  return Math.min(max, Math.max(min, numeric))
}

function normalizeString(value, maxLength = 160) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
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
    category: DISCUSSION_TOPICS.includes(raw.category) ? raw.category : 'General',
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
    return { discussions: createSeedDiscussions(), votedIds: [] }
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

/*
 * Community and mock interviews have no backend endpoints in Phase 4. Their
 * data stays in localStorage; every account-backed value lives in
 * AppDataContext instead.
 */
export function AppStateProvider({ children }) {
  const [interviews, setInterviews] = useState(() =>
    normalizeInterviews(readJSON(STORAGE_KEYS.interviews, [])),
  )
  const [community, setCommunity] = useState(() =>
    normalizeCommunity(readJSON(STORAGE_KEYS.community, null)),
  )

  useEffect(() => {
    writeJSON(STORAGE_KEYS.interviews, interviews)
  }, [interviews])

  useEffect(() => {
    writeJSON(STORAGE_KEYS.community, community)
  }, [community])

  const saveInterview = useCallback((record) => {
    const normalized = normalizeInterview(record)
    if (!normalized) return { ok: false, reason: 'invalid' }

    setInterviews((previous) => {
      if (previous.some((item) => item.id === normalized.id)) return previous
      return [normalized, ...previous].slice(0, MAX_INTERVIEWS)
    })

    return { ok: true }
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
                upvotes: Math.max(0, discussion.upvotes + (hasVoted ? -1 : 1)),
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
      interviews,
      community,
      saveInterview,
      toggleVote,
      addDiscussion,
      addReply,
    }),
    [addDiscussion, addReply, community, interviews, saveInterview, toggleVote],
  )

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  )
}
