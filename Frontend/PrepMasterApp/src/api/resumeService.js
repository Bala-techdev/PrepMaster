import client from './client'

export async function scanResume(file, request, onUploadProgress) {
  const formData = new FormData()
  formData.append('resume', file)
  formData.append(
    'request',
    new Blob([JSON.stringify(request)], { type: 'application/json' }),
  )
  const { data } = await client.post('/resumes/scans', formData, {
    onUploadProgress,
  })
  return data
}

export async function getResumeScanHistory() {
  const { data } = await client.get('/resumes/scans')
  return data
}

export async function getResumeScan(scanId) {
  const { data } = await client.get(`/resumes/scans/${scanId}`)
  return data
}
