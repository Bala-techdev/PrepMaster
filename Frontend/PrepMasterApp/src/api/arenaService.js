import client from './client'

export async function getArenaOverview(config = {}) {
  const { data } = await client.get('/arena/overview', config)
  return data
}

export async function runCode(questionId, payload, config = {}) {
  const { data } = await client.post(`/arena/questions/${questionId}/run`, payload, config)
  return data
}

export async function submitCode(questionId, payload, config = {}) {
  const { data } = await client.post(`/arena/questions/${questionId}/submit`, payload, config)
  return data
}

export async function getSubmissions(config = {}) {
  const { data } = await client.get('/arena/submissions', config)
  return data
}
