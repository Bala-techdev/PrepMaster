import client from './client'

export async function getLeaderboard(
  { period = 'WEEKLY', metric = 'XP', page = 0, size = 10 } = {},
  config = {},
) {
  const { data } = await client.get('/leaderboard', {
    ...config,
    params: { period, metric, page, size },
  })
  return data
}
