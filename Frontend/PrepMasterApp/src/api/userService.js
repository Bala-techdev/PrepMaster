import client from './client'

export async function getMe(config = {}) {
  const { data } = await client.get('/users/me', config)
  return data
}

export async function updateProfile(payload) {
  const { data } = await client.put('/users/me/profile', payload)
  return data
}

export async function updateSettings(payload) {
  const { data } = await client.put('/users/me/settings', payload)
  return data
}
