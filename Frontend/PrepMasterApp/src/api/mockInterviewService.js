import client from './client'

export async function getInterviewCategories(config = {}) {
  const { data } = await client.get('/mock-interviews/categories', config)
  return data
}

export async function getInterviewDifficulties(config = {}) {
  const { data } = await client.get('/mock-interviews/difficulties', config)
  return data
}

export async function getInterviewTemplates(config = {}) {
  const { data } = await client.get('/mock-interviews/templates', config)
  return data
}

export async function createInterviewTemplate(payload) {
  const { data } = await client.post('/mock-interviews/templates', payload)
  return data
}

export async function getActiveInterviewSession(config = {}) {
  const response = await client.get('/mock-interviews/sessions/active', config)
  return response.status === 204 || !response.data ? null : response.data
}

export async function startInterviewSession(payload) {
  const { data } = await client.post('/mock-interviews/sessions', payload)
  return data
}

export async function getInterviewSession(sessionId, config = {}) {
  const { data } = await client.get(
    `/mock-interviews/sessions/${sessionId}`,
    config,
  )
  return data
}

export async function saveInterviewAnswer(sessionId, questionId, payload) {
  const { data } = await client.put(
    `/mock-interviews/sessions/${sessionId}/questions/${questionId}/answer`,
    payload,
  )
  return data
}

export async function updateFocusConsent(sessionId, consented) {
  const { data } = await client.post(
    `/mock-interviews/sessions/${sessionId}/focus-consent`,
    { consented },
  )
  return data
}

export async function recordFocusEvent(sessionId, eventType) {
  await client.post(`/mock-interviews/sessions/${sessionId}/focus-events`, {
    eventType,
  })
}

export async function completeInterviewSession(sessionId) {
  const { data } = await client.post(
    `/mock-interviews/sessions/${sessionId}/complete`,
  )
  return data
}

export async function cancelInterviewSession(sessionId) {
  const { data } = await client.post(
    `/mock-interviews/sessions/${sessionId}/cancel`,
  )
  return data
}

export async function getInterviewResult(sessionId, config = {}) {
  const { data } = await client.get(
    `/mock-interviews/sessions/${sessionId}/result`,
    config,
  )
  return data
}

export async function getInterviewHistory(
  { page = 0, size = 10 } = {},
  config = {},
) {
  const { data } = await client.get('/mock-interviews/history', {
    ...config,
    params: { page, size },
  })
  return data
}

export async function getInterviewPerformance(config = {}) {
  const { data } = await client.get('/mock-interviews/performance', config)
  return data
}
