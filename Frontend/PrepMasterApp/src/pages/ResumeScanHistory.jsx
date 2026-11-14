import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileSearch } from 'lucide-react'
import { getResumeScanHistory } from '../api/resumeService'
import EmptyState from '../components/EmptyState'
import PageState from '../components/PageState'
import './ResumeScanner.css'

export default function ResumeScanHistory() {
  const [history, setHistory] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getResumeScanHistory().then(setHistory).catch((requestError) => setError(requestError.message || 'Unable to load scan history.'))
  }, [])

  if (!history && !error) return <PageState variant="loading" title="Loading scan history" />
  if (error) return <PageState variant="error" title="Could not load scan history" description={error} />

  return (
    <div className="page-container ats-page">
      <div className="page-head"><div><p className="page-eyebrow">ATS scanner</p><h1 className="page-title">Scan history</h1><p className="page-subtitle">Review your recent resume comparisons and readiness scores.</p></div><Link className="btn btn-primary" to="/resume-scanner">New scan</Link></div>
      {!history.length ? <EmptyState icon={FileSearch} title="No scans yet" description="Upload a resume and target job description to create your first ATS analysis."><Link className="btn btn-primary" to="/resume-scanner">Scan a resume</Link></EmptyState> : (
        <div className="card ats-history-list">
          {history.map((item) => <Link className="ats-history-row" to={`/resume-scanner/${item.id}`} key={item.id}><div><strong>{item.targetRole}</strong><span>{item.targetCompany} · {item.fileName}</span></div><div className="ats-history-score"><strong>{item.atsScore}</strong><span>ATS · {new Date(item.createdAt).toLocaleDateString()}</span></div></Link>)}
        </div>
      )}
    </div>
  )
}
