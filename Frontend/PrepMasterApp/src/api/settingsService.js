import client from './client'

export async function getSettings(config = {}) {
  const { data } = await client.get('/users/me/settings', config)
  return data
}

export async function saveSettings(payload) {
  const { data } = await client.put('/users/me/settings', payload)
  return data
}
