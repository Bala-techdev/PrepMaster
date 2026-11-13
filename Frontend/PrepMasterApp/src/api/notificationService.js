import client from './client'

export async function getNotifications(
  { page = 0, size = 20, unreadOnly = false } = {},
  config = {},
) {
  const { data } = await client.get('/notifications', {
    ...config,
    params: { page, size, unreadOnly },
  })
  return data
}

export async function getUnreadNotificationCount(config = {}) {
  const { data } = await client.get('/notifications/unread-count', config)
  return data
}

export async function markNotificationRead(notificationId) {
  const { data } = await client.post(`/notifications/${notificationId}/read`)
  return data
}

export async function markAllNotificationsRead() {
  const { data } = await client.post('/notifications/read-all')
  return data
}
