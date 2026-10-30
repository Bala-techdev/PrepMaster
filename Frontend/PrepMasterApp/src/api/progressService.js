import client from './client'

export async function getProgress(config = {}) {
  const { data } = await client.get('/progress', config)
  return data
}

export async function getActivity(from, to, config = {}) {
  const { data } = await client.get('/progress/activity', {
    ...config,
    params: { from, to },
  })
  return data
}

export async function getWeekly(config = {}) {
  const { data } = await client.get('/progress/weekly', config)
  return data
}

export async function getMonthly(config = {}) {
  const { data } = await client.get('/progress/monthly', config)
  return data
}

export async function getCategoryProgress(config = {}) {
  const { data } = await client.get('/progress/categories', config)
  return data
}

export async function getSolvedQuestions(config = {}) {
  const { data } = await client.get('/progress/questions', config)
  return data
}

export async function getAchievements(config = {}) {
  const { data } = await client.get('/achievements', config)
  return data
}
