import client from './client'

export async function getCategories(config = {}) {
  const { data } = await client.get('/learning/categories', config)
  return data
}

export async function getAllTopics(config = {}) {
  const { data } = await client.get('/learning/topics', config)
  return data
}

export async function getTopics(categoryId, config = {}) {
  const { data } = await client.get(`/learning/categories/${categoryId}/topics`, config)
  return data
}

export async function getResources(topicId, config = {}) {
  const { data } = await client.get(`/learning/topics/${topicId}/resources`, config)
  return data
}

export async function getQuestions(
  { difficulty, topicId, search, page = 0, size = 9 } = {},
  config = {},
) {
  const params = { page, size }
  if (difficulty) params.difficulty = difficulty
  if (topicId) params.topicId = topicId
  if (search) params.search = search

  const { data } = await client.get('/learning/questions', { ...config, params })
  return data
}

export async function getQuestion(questionId, config = {}) {
  const { data } = await client.get(`/learning/questions/${questionId}`, config)
  return data
}
