import { useEffect, useState } from 'react'
import { api } from './api/client'
import type { CoverageResponse } from './api/types'
import './CoveragePage.css'

export function CoveragePage() {
  const [data, setData] = useState<CoverageResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.getCoverage()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="coverage-loading">Loading coverage…</div>
  if (error) return <div className="coverage-error">Error: {error}</div>
  if (!data) return null

  const { requirementCoverage, testCaseCoverage, summary } = data

  return (
    <div className="coverage-page">
      <section className="coverage-summary">
        <h2>Coverage metrics</h2>
        <div className="coverage-cards">
          <div className="coverage-card">
            <span className="coverage-card-value">{summary.requirementCoveragePct}%</span>
            <span className="coverage-card-label">Requirements covered by tests</span>
            <span className="coverage-card-detail">{summary.coveredRequirements} / {summary.totalRequirements} requirements</span>
          </div>
          <div className="coverage-card">
            <span className="coverage-card-value">{summary.testCaseCoveragePct}%</span>
            <span className="coverage-card-label">Test cases linked to requirements</span>
            <span className="coverage-card-detail">{summary.linkedTestCases} / {summary.totalTestCases} test cases</span>
          </div>
        </div>
      </section>

      <div className="coverage-grid">
        <section className="coverage-panel">
          <h2>Requirement → Test cases (forward)</h2>
          <p className="coverage-panel-desc">Each requirement and the test cases that cover it.</p>
          <table className="velm-table">
            <thead>
              <tr>
                <th>Requirement</th>
                <th>Title</th>
                <th>Safety</th>
                <th>Tests</th>
                <th>Passed</th>
              </tr>
            </thead>
            <tbody>
              {requirementCoverage.map((r) => (
                <tr key={r.requirementId}>
                  <td><code>{r.requirementId}</code></td>
                  <td className="cell-title">{r.title}</td>
                  <td>{r.safetyRelevant ? 'Yes' : 'No'}</td>
                  <td>{r.testCount}</td>
                  <td><span className={r.passedCount > 0 ? 'status status-pass' : ''}>{r.passedCount}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {requirementCoverage.some((r) => r.testCaseIds.length > 0) && (
            <details className="coverage-details">
              <summary>Test case IDs per requirement</summary>
              <ul>
                {requirementCoverage.map((r) => (
                  <li key={r.requirementId}>
                    <code>{r.requirementId}</code> → {r.testCaseIds.length ? r.testCaseIds.join(', ') : '—'}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>

        <section className="coverage-panel">
          <h2>Test case → Requirement (backward)</h2>
          <p className="coverage-panel-desc">Each test case and the requirement it traces to.</p>
          <table className="velm-table">
            <thead>
              <tr>
                <th>Test case</th>
                <th>Title</th>
                <th>Requirement</th>
                <th>Requirement title</th>
              </tr>
            </thead>
            <tbody>
              {testCaseCoverage.map((t) => (
                <tr key={t.testCaseId}>
                  <td><code>{t.testCaseId}</code></td>
                  <td className="cell-title">{t.title}</td>
                  <td><code>{t.requirementId || '—'}</code></td>
                  <td className="cell-title">{t.requirementTitle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}
