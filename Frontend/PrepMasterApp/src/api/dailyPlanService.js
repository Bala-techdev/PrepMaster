import client from './client'

export async function getTodayPlan(config = {}) {
  try {
    const { data } = await client.get('/plans/daily', config)
    return data
  } catch (error) {
    if (error.status === 404) return null
    throw error
  }
}

export async function generatePlan({ taskCount = 5, categoryIds = [] } = {}) {
  const { data } = await client.post('/plans/daily', { taskCount, categoryIds })
  return data
}

export async function getPlan(planId, config = {}) {
  const { data } = await client.get(`/plans/${planId}`, config)
  return data
}
