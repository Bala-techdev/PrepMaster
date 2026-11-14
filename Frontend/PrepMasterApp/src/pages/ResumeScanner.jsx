import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle, FileText, Target, UploadCloud, Zap } from 'lucide-react'
import { getResumeScan, scanResume } from '../api/resumeService'
import './ResumeScanner.css'

const MAX_FILE_SIZE = 10 * 1024 * 1024

function SkillPills({ title, skills, tone }) {
  return (
    <div className="ats-result-card">
      <h3>{title}</h3>
      <div className="ats-pills">
        {skills.length ? skills.map((skill) => <span className={`ats-pill ${tone}`} key={skill}>{skill}</span>) : <span className="ats-muted">None detected</span>}
      </div>
    </div>
  )
}

export default function ResumeScanner() {
  const { scanId } = useParams()
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [targetCompany, setTargetCompany] = useState('Zoho')
  const [targetRole, setTargetRole] = useState('Java Backend Developer')
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    if (!scanId) return undefined
    getResumeScan(scanId).then(setResult).catch((requestError) => setError(requestError.message || 'Unable to load scan.'))
    return undefined
  }, [scanId])

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  const chooseFile = (candidate) => {
    setError('')
    if (!candidate) return
    if (candidate.type !== 'application/pdf' || !candidate.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF resumes are supported.')
      return
    }
    if (candidate.size > MAX_FILE_SIZE) {
      setError('Resume PDF must be 10 MB or smaller.')
      return
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(candidate)
    setPreviewUrl(URL.createObjectURL(candidate))
    setResult(null)
  }

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (!file) return setError('Choose a PDF resume before scanning.')
    if (!jobDescription.trim()) return setError('Paste a target job description before scanning.')
    setScanning(true)
    setProgress(0)
    try {
      const scan = await scanResume(file, {
        targetCompany,
        targetRole,
        jobDescription: jobDescription.trim(),
      }, (event) => {
        if (event.total) setProgress(Math.round((event.loaded * 100) / event.total))
      })
      setResult(scan)
      setProgress(100)
    } catch (requestError) {
      setError(requestError.message || 'The resume could not be analyzed.')
    } finally {
      setScanning(false)
    }
  }

  return (
    <div className="page-container ats-page">
      <div className="page-head">
        <div>
          <p className="page-eyebrow">AI career toolkit</p>
          <h1 className="page-title">ATS resume scanner</h1>
          <p className="page-subtitle">Upload a PDF, compare it with a target role, and turn skill gaps into an action plan.</p>
        </div>
        <div className="ats-limit-chip"><Zap size={15} /> Free plan · 2 scans/month</div>
      </div>

      <form className="ats-layout" onSubmit={submit}>
        <section className="card ats-form-card">
          <div className="card-head">
            <div><h2 className="card-title">Upload and target</h2><p className="card-subtitle">Your resume is stored privately under your account.</p></div>
          </div>
          <div
            className={`ats-dropzone${dragging ? ' is-dragging' : ''}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => { event.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => { event.preventDefault(); setDragging(false); chooseFile(event.dataTransfer.files[0]) }}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click() }}
          >
            <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={(event) => chooseFile(event.target.files[0])} />
            {file ? <FileText size={32} aria-hidden="true" /> : <UploadCloud size={32} aria-hidden="true" />}
            <strong>{file ? file.name : 'Drop your resume PDF here'}</strong>
            <span>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB · Ready to scan` : 'or click to browse · PDF up to 10 MB'}</span>
          </div>
          {previewUrl && <iframe className="ats-preview" src={previewUrl} title="Resume preview" />}

          <div className="ats-fields">
            <label>Target company
              <select value={targetCompany} onChange={(event) => setTargetCompany(event.target.value)}>
                {['Zoho', 'Amazon', 'PayPal', 'Freshworks', 'Google', 'Other'].map((company) => <option key={company}>{company}</option>)}
              </select>
            </label>
            <label>Target role
              <input value={targetRole} onChange={(event) => setTargetRole(event.target.value)} maxLength={160} placeholder="Java Backend Developer" />
            </label>
          </div>
          <label className="ats-description">Job description
            <textarea value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} placeholder="Paste the complete target job description here..." rows={10} maxLength={50000} />
          </label>
          {error && <p className="auth-form-error" role="alert">{error}</p>}
          {scanning && <div className="ats-upload-progress"><span style={{ width: `${progress}%` }} /><small>Uploading and analyzing · {progress}%</small></div>}
          <button className="btn btn-primary ats-submit" disabled={scanning}>{scanning ? 'Analyzing resume…' : 'Analyze resume'}</button>
        </section>

        <section className="ats-results">
          {!result ? (
            <div className="card ats-empty">
              <Target size={34} aria-hidden="true" />
              <h2>Results will appear here</h2>
              <p>We will extract your resume profile, compare technical requirements, and generate practical recommendations.</p>
            </div>
          ) : (
            <>
              <div className="card ats-score-card">
                <div><p className="page-eyebrow">ATS compatibility</p><h2>{result.targetRole}</h2><p>{result.targetCompany} · {result.fileName}</p></div>
                <div className="ats-score">{result.atsScore}<small>/100</small></div>
              </div>
              <div className="ats-stat-grid">
                <div className="card"><span>Profile readiness</span><strong>{result.readinessScore}%</strong></div>
                <div className="card"><span>Technical coverage</span><strong>{result.technicalCoverage}%</strong></div>
              </div>
              <div className="card ats-profile-card"><h2>Extracted profile</h2><p><strong>{result.extractedName || 'Name not detected'}</strong> · {result.extractedEmail || 'Email not detected'} · {result.extractedPhone || 'Phone not detected'}</p></div>
              <div className="ats-result-grid">
                <SkillPills title="Matched skills" skills={result.matchedSkills} tone="matched" />
                <SkillPills title="Missing requirements" skills={result.missingSkills} tone="missing" />
                <SkillPills title="Partially matched" skills={result.partialSkills} tone="partial" />
              </div>
              <div className="card ats-recommendations"><h2>Recommended improvements</h2><ul>{result.recommendations.map((item) => <li key={item}><CheckCircle size={16} />{item}</li>)}</ul><p className="ats-strength"><strong>Strengths:</strong> {result.strengths.join(' ')}</p></div>
            </>
          )}
        </section>
      </form>
    </div>
  )
}
