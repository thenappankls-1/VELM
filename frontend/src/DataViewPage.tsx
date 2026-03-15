import { useEffect, useState } from 'react'
import { api } from './api/client'
import type { Requirement, TestCase, TestResult } from './api/types'
import './DataViewPage.css'

export function DataViewPage() {
  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([api.getRequirements(), api.getTestCases(), api.getTestResults()])
      .then(([reqs, tcs, trs]) => {
        setRequirements(reqs)
        setTestCases(tcs)
        setTestResults(trs)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="data-view-loading">Loading data…</div>
  if (error) return <div className="data-view-error">Error: {error}</div>

  return (
    <div className="data-view-page">
      <section className="data-view-section">
        <h2>Requirements ({requirements.length})</h2>
        <table className="velm-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Description</th>
              <th>Safety</th>
            </tr>
          </thead>
          <tbody>
            {requirements.map((r) => (
              <tr key={r.id}>
                <td><code>{r.id}</code></td>
                <td>{r.title}</td>
                <td className="cell-desc">{r.description || '—'}</td>
                <td>{r.safetyRelevant ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="data-view-section">
        <h2>Test cases ({testCases.length})</h2>
        <table className="velm-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Requirement</th>
            </tr>
          </thead>
          <tbody>
            {testCases.map((t) => (
              <tr key={t.id}>
                <td><code>{t.id}</code></td>
                <td>{t.title}</td>
                <td><code>{t.requirementId}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="data-view-section">
        <h2>Test results ({testResults.length})</h2>
        <table className="velm-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Test case</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {testResults.map((tr) => (
              <tr key={tr.id}>
                <td><code>{tr.id}</code></td>
                <td><code>{tr.testCaseId}</code></td>
                <td><span className={`status status-${tr.status}`}>{tr.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
