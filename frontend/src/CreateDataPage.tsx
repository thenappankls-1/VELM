import { useEffect, useState } from 'react'
import { api } from './api/client'
import type { Requirement, TestCase } from './api/types'
import './CreateDataPage.css'

type CreateMessage = { type: 'success'; text: string } | { type: 'error'; text: string } | null

export function CreateDataPage({
  onRefetch,
}: {
  onRefetch: () => void
}) {
  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<CreateMessage>(null)

  const [reqId, setReqId] = useState('')
  const [reqTitle, setReqTitle] = useState('')
  const [reqDesc, setReqDesc] = useState('')
  const [reqSafety, setReqSafety] = useState(false)

  const [tcId, setTcId] = useState('')
  const [tcTitle, setTcTitle] = useState('')
  const [tcReqId, setTcReqId] = useState('')

  const [trId, setTrId] = useState('')
  const [trTcId, setTrTcId] = useState('')
  const [trStatus, setTrStatus] = useState<'pass' | 'fail' | 'not_run'>('pass')

  useEffect(() => {
    Promise.all([api.getRequirements(), api.getTestCases()])
      .then(([reqs, tcs]) => {
        setRequirements(reqs)
        setTestCases(tcs)
        if (reqs.length > 0 && !tcReqId) setTcReqId(reqs[0].id)
        if (tcs.length > 0 && !trTcId) setTrTcId(tcs[0].id)
      })
      .catch(() => setMessage({ type: 'error', text: 'Failed to load lists' }))
      .finally(() => setLoading(false))
  }, [])

  const refetchLists = () => {
    api.getRequirements().then(setRequirements)
    api.getTestCases().then(setTestCases)
  }

  const showSuccess = (text: string) => {
    setMessage({ type: 'success', text })
    onRefetch()
    refetchLists()
    setTimeout(() => setMessage(null), 4000)
  }
  const showError = (text: string) => {
    setMessage({ type: 'error', text })
  }

  const handleCreateRequirement = (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    api.createRequirement({
      id: reqId.trim(),
      title: reqTitle.trim(),
      description: reqDesc.trim() || undefined,
      safetyRelevant: reqSafety,
    })
      .then(() => {
        showSuccess(`Requirement "${reqId}" created.`)
        setReqId('')
        setReqTitle('')
        setReqDesc('')
      })
      .catch((err) => showError(err instanceof Error ? err.message : 'Create failed'))
  }

  const handleCreateTestCase = (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    api.createTestCase({
      id: tcId.trim(),
      title: tcTitle.trim(),
      requirementId: tcReqId.trim(),
    })
      .then(() => {
        showSuccess(`Test case "${tcId}" created.`)
        setTcId('')
        setTcTitle('')
      })
      .catch((err) => showError(err instanceof Error ? err.message : 'Create failed'))
  }

  const handleCreateTestResult = (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    api.createTestResult({
      id: trId.trim(),
      testCaseId: trTcId.trim(),
      status: trStatus,
    })
      .then(() => {
        showSuccess(`Test result "${trId}" created.`)
        setTrId('')
      })
      .catch((err) => showError(err instanceof Error ? err.message : 'Create failed'))
  }

  if (loading) return <div className="create-loading">Loading…</div>

  return (
    <div className="create-page">
      {message && (
        <div className={`create-message create-message-${message.type}`}>
          {message.text}
        </div>
      )}

      <section className="create-form-section">
        <h2>New requirement</h2>
        <form onSubmit={handleCreateRequirement} className="create-form">
          <div className="form-row">
            <label htmlFor="req-id">ID *</label>
            <input
              id="req-id"
              value={reqId}
              onChange={(e) => setReqId(e.target.value)}
              placeholder="e.g. REQ-003"
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="req-title">Title *</label>
            <input
              id="req-title"
              value={reqTitle}
              onChange={(e) => setReqTitle(e.target.value)}
              placeholder="Short title"
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="req-desc">Description</label>
            <textarea
              id="req-desc"
              value={reqDesc}
              onChange={(e) => setReqDesc(e.target.value)}
              placeholder="Optional description"
              rows={2}
            />
          </div>
          <div className="form-row form-row-check">
            <label>
              <input
                type="checkbox"
                checked={reqSafety}
                onChange={(e) => setReqSafety(e.target.checked)}
              />
              Safety-relevant
            </label>
          </div>
          <button type="submit" className="create-btn">Create requirement</button>
        </form>
      </section>

      <section className="create-form-section">
        <h2>New test case</h2>
        <form onSubmit={handleCreateTestCase} className="create-form">
          <div className="form-row">
            <label htmlFor="tc-id">ID *</label>
            <input
              id="tc-id"
              value={tcId}
              onChange={(e) => setTcId(e.target.value)}
              placeholder="e.g. TC-003"
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="tc-title">Title *</label>
            <input
              id="tc-title"
              value={tcTitle}
              onChange={(e) => setTcTitle(e.target.value)}
              placeholder="Test case title"
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="tc-req">Requirement *</label>
            <select
              id="tc-req"
              value={tcReqId}
              onChange={(e) => setTcReqId(e.target.value)}
              required
            >
              <option value="">— Select requirement —</option>
              {requirements.map((r) => (
                <option key={r.id} value={r.id}>{r.id} – {r.title}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="create-btn">Create test case</button>
        </form>
      </section>

      <section className="create-form-section">
        <h2>New test result</h2>
        <form onSubmit={handleCreateTestResult} className="create-form">
          <div className="form-row">
            <label htmlFor="tr-id">ID *</label>
            <input
              id="tr-id"
              value={trId}
              onChange={(e) => setTrId(e.target.value)}
              placeholder="e.g. TR-003"
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="tr-tc">Test case *</label>
            <select
              id="tr-tc"
              value={trTcId}
              onChange={(e) => setTrTcId(e.target.value)}
              required
            >
              <option value="">— Select test case —</option>
              {testCases.map((t) => (
                <option key={t.id} value={t.id}>{t.id} – {t.title}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label htmlFor="tr-status">Status *</label>
            <select
              id="tr-status"
              value={trStatus}
              onChange={(e) => setTrStatus(e.target.value as 'pass' | 'fail' | 'not_run')}
            >
              <option value="pass">pass</option>
              <option value="fail">fail</option>
              <option value="not_run">not_run</option>
            </select>
          </div>
          <button type="submit" className="create-btn">Create test result</button>
        </form>
      </section>
    </div>
  )
}
