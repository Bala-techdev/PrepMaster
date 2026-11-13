import client from './client'

export async function getAchievementOverview(config = {}) {
  const { data } = await client.get('/achievements', config)
  return data
}
