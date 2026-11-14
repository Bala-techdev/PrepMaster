import client from './client'

export async function completeTask(taskId) {
  const { data } = await client.post(`/plans/tasks/${taskId}/complete`)
  return data
}
