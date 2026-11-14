import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import { ArrowLeft, CheckCircle, Play, Send, Timer, XCircle } from 'lucide-react'
import DifficultyBadge from '../components/DifficultyBadge'
import PageState from '../components/PageState'
import { getQuestion } from '../api/learningService'
import { runCode, submitCode } from '../api/arenaService'
import { difficultyLabel } from '../lib/format'
import './ArenaProblem.css'

const starterCode = {
  JAVA: 'public class Main {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}',
  PYTHON: '# Write your solution here\n',
  CPP: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    return 0;\n}\n',
  JAVASCRIPT: '// Write your solution here\n',
}

function splitLines(value) {
  return String(value || '').split('\n').map((line) => line.trim()).filter(Boolean)
}

export default function ArenaProblem() {
  const { problemId } = useParams()
  const [question, setQuestion] = useState(null)
  const [language, setLanguage] = useState('JAVA')
  const [code, setCode] = useState(starterCode.JAVA)
  const [input, setInput] = useState('')
  const [output, setOutput] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getQuestion(problemId)
      .then((data) => active && setQuestion(data))
      .catch((requestError) => active && setError(requestError.message))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [problemId])

  useEffect(() => {
    setCode(starterCode[language])
  }, [language])

  useEffect(() => {
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const constraints = useMemo(() => splitLines(question?.constraints), [question])
  const examples = useMemo(() => splitLines(question?.examples), [question])
  const timer = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`

  const execute = async (submit) => {
    setBusy(true)
    setError('')
    try {
      const result = submit
        ? await submitCode(problemId, { language, sourceCode: code, input })
        : await runCode(problemId, { language, sourceCode: code, input })
      setOutput(result)
    } catch (requestError) {
      setError(requestError.message || 'Execution failed.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <PageState variant="loading" title="Loading arena problem" description="Fetching the problem from the backend catalog." />
  if (error && !question) return <PageState variant="error" title="Problem could not be loaded" description={error} />

  return (
    <section className="arena-page">
      <header className="arena-toolbar">
        <Link to={`/practice/${problemId}`} className="back-link"><ArrowLeft size={15} /> Problem details</Link>
        <div className="arena-toolbar-title">
          <span className="page-eyebrow">DSA Practice Arena</span>
          <h1>{question.title}</h1>
        </div>
        <span className="arena-timer"><Timer size={15} /> {timer}</span>
      </header>

      <div className="arena-workspace">
        <aside className="arena-panel arena-problem-panel">
          <div className="arena-problem-meta">
            <DifficultyBadge difficulty={difficultyLabel(question.difficulty)} />
            <span>{question.topicName}</span>
          </div>
          <p className="arena-description">{question.description}</p>
          <section><h2>Constraints</h2>{constraints.length ? <ul>{constraints.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="arena-muted">No constraints provided.</p>}</section>
          <section><h2>Examples</h2><pre>{examples.join('\\n')}</pre></section>
          <details className="arena-hints"><summary>Hints</summary><p>Start with the input shape, then choose the simplest data structure that preserves the required lookup or ordering.</p></details>
          <Link className="arena-history-link" to="/progress">View progress and XP</Link>
        </aside>

        <main className="arena-panel arena-editor-panel">
          <div className="arena-editor-toolbar">
            <label>Language <select value={language} onChange={(event) => setLanguage(event.target.value)}>{Object.keys(starterCode).map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <div className="arena-actions">
              <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => execute(false)}><Play size={15} /> Run</button>
              <button type="button" className="btn btn-primary" disabled={busy} onClick={() => execute(true)}><Send size={15} /> Submit</button>
            </div>
          </div>
          <div className="arena-editor"><Editor height="min(58vh, 620px)" language={language === 'CPP' ? 'cpp' : language.toLowerCase()} theme="vs-dark" value={code} onChange={(value) => setCode(value || '')} options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 } }} /></div>
          <label className="arena-input-label">Custom input<textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="Input passed to your program" /></label>
          {error && <p className="arena-error" role="alert">{error}</p>}
          {output && <section className={`arena-output ${output.passed ? 'passed' : 'failed'}`}><div className="arena-output-title">{output.passed ? <CheckCircle size={16} /> : <XCircle size={16} />} {output.status} {output.xpAwarded ? `· +${output.xpAwarded} XP` : ''}</div><pre>{output.stdout || output.stderr || 'No output'}</pre></section>}
        </main>
      </div>
    </section>
  )
}
