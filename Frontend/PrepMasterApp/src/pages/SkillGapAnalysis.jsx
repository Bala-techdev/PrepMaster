import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Target } from 'lucide-react'
import { getResumeScanHistory, getResumeScan } from '../api/resumeService'
import EmptyState from '../components/EmptyState'
import PageState from '../components/PageState'
import './ResumeScanner.css'

export default function SkillGapAnalysis() {
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getResumeScanHistory()
      .then((history) => history[0] ? getResumeScan(history[0].id) : null)
      .then(setResult)
      .catch((requestError) => setError(requestError.message || 'Unable to load skill gaps.'))
  }, [])

  if (!result && !error) return <PageState variant="loading" title="Loading skill gaps" />
  if (error) return <PageState variant="error" title="Could not load skill gaps" description={error} />
  if (!result) return <div className="page-container"><EmptyState icon={Target} title="No skill gaps yet" description="Complete an ATS scan to see your personalized skill gap analysis."><Link className="btn btn-primary" to="/resume-scanner">Start a scan</Link></EmptyState></div>

  return <div className="page-container ats-page"><div className="page-head"><div><p className="page-eyebrow">Personalized roadmap</p><h1 className="page-title">Skill gap analysis</h1><p className="page-subtitle">{result.targetRole} · Based on your latest scan</p></div></div><div className="card ats-recommendations"><h2>Priority skills to build</h2><div className="ats-pills">{result.missingSkills.map((skill) => <span className="ats-pill missing" key={skill}>{skill}</span>)}</div><ul>{result.recommendations.map((recommendation) => <li key={recommendation}>{recommendation}</li>)}</ul></div></div>
}
