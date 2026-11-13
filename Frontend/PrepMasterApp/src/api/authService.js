import client from './client'

export async function register(payload) {
  const { data } = await client.post('/auth/register', payload)
  return data
}

export async function login(payload) {
  const { data } = await client.post('/auth/login', payload)
  return data
}

export async function refresh(refreshToken) {
  const { data } = await client.post('/auth/refresh', { refreshToken })
  return data
}

export async function logout(refreshToken) {
  await client.post('/auth/logout', { refreshToken })
}

export async function forgotPassword(email) {
  const { data } = await client.post('/auth/forgot-password', { email })
  return data
}

export async function resetPassword(payload) {
  const { data } = await client.post('/auth/reset-password', payload)
  return data
}

export async function verifyEmail(token) {
  const { data } = await client.post('/auth/verify-email', { token })
  return data
}

export async function resendVerification() {
  const { data } = await client.post('/auth/resend-verification')
  return data
}

export async function getLoginHistory() {
  const { data } = await client.get('/security/login-history')
  return data
}
