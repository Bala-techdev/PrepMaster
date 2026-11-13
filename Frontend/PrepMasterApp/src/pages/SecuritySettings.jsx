import { useEffect, useState } from 'react'
import { getLoginHistory, resendVerification } from '../api/authService'
import PageState from '../components/PageState'

export default function SecuritySettings() {
  const [history, setHistory] = useState([])
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    getLoginHistory().then(setHistory).then(() => setStatus('ready')).catch(() => setStatus('error'))
  }, [])

  const resend = async () => {
    const response = await resendVerification()
    setMessage(response.message)
  }

  if (status === 'loading') return <PageState variant="loading" title="Loading security activity" />
  if (status === 'error') return <PageState variant="error" title="Could not load security activity" />

  return (
    <div className="page-container">
      <div className="page-head"><div><p className="page-eyebrow">Account security</p><h1 className="page-title">Security settings</h1><p className="page-subtitle">Review access activity and manage email verification.</p></div></div>
      <section className="card">
        <div className="card-head"><div><h2 className="card-title">Email verification</h2><p className="card-subtitle">Keep your account recovery channel current.</p></div><button className="btn btn-secondary" onClick={resend}>Resend verification</button></div>
        {message && <p className="auth-notice" role="status">{message}</p>}
      </section>
      <section className="card" style={{ marginTop: 20 }}>
        <div className="card-head"><div><h2 className="card-title">Login history</h2><p className="card-subtitle">Successful and failed access attempts.</p></div></div>
        <div style={{ overflowX: 'auto', marginTop: 16 }}>
          <table><thead><tr><th>Time</th><th>Status</th><th>IP</th><th>Device</th><th>Reason</th></tr></thead><tbody>
            {history.map((item) => <tr key={item.id}><td>{new Date(item.occurredAt).toLocaleString()}</td><td>{item.successful ? 'Successful' : 'Failed'}</td><td>{item.ipAddress || 'Unavailable'}</td><td>{item.deviceInfo || 'Unavailable'}</td><td>{item.failureReason || '—'}</td></tr>)}
          </tbody></table>
        </div>
      </section>
    </div>
  )
}
