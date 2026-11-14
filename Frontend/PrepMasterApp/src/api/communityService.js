import client from './client'

export async function getCommunityTopics(config = {}) {
  const { data } = await client.get('/community/topics', config)
  return data
}

export async function getCommunityPosts(
  { page = 0, size = 9, search, topic, sort = 'recent' } = {},
  config = {},
) {
  const params = { page, size, sort }
  if (search) params.search = search
  if (topic) params.topic = topic

  const { data } = await client.get('/community/posts', { ...config, params })
  return data
}

export async function getCommunityPost(postId, config = {}) {
  const { data } = await client.get(`/community/posts/${postId}`, config)
  return data
}

export async function createCommunityPost(payload) {
  const { data } = await client.post('/community/posts', payload)
  return data
}

export async function updateCommunityPost(postId, payload) {
  const { data } = await client.put(`/community/posts/${postId}`, payload)
  return data
}

export async function deleteCommunityPost(postId) {
  await client.delete(`/community/posts/${postId}`)
}

export async function toggleCommunityLike(postId) {
  const { data } = await client.post(`/community/posts/${postId}/like`)
  return data
}

export async function getCommunityComments(
  postId,
  { page = 0, size = 20 } = {},
  config = {},
) {
  const { data } = await client.get(`/community/posts/${postId}/comments`, {
    ...config,
    params: { page, size },
  })
  return data
}

export async function createCommunityComment(postId, body) {
  const { data } = await client.post(`/community/posts/${postId}/comments`, {
    body,
  })
  return data
}

export async function updateCommunityComment(commentId, body) {
  const { data } = await client.put(`/community/comments/${commentId}`, {
    body,
  })
  return data
}

export async function deleteCommunityComment(commentId) {
  await client.delete(`/community/comments/${commentId}`)
}

export async function getCommunityActivity(limit = 10, config = {}) {
  const { data } = await client.get('/community/activity', {
    ...config,
    params: { limit },
  })
  return data
}
