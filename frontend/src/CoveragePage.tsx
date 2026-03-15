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

  const { requirementCoverage, validationCaseCoverage, summary } = data

  return (
    <div className="coverage-page">
      <section className="coverage-summary">
        <h2>Coverage metrics</h2>
        <div className="coverage-cards">
          <div className="coverage-card">
            <span className="coverage-card-value">{summary.requirementCoveragePct}%</span>
            <span className="coverage-card-label">Requirements covered by validation cases</span>
            <span className="coverage-card-detail">{summary.coveredRequirements} / {summary.totalRequirements} requirements</span>
          </div>
          <div className="coverage-card">
            <span className="coverage-card-value">{summary.validationCaseCoveragePct}%</span>
            <span className="coverage-card-label">Validation cases linked to requirements</span>
            <span className="coverage-card-detail">{summary.linkedValidationCases} / {summary.totalValidationCases} validation cases</span>
          </div>
        </div>
      </section>

      <div className="coverage-grid">
        <section className="coverage-panel">
          <h2>Requirement → Validation cases (forward)</h2>
          <p className="coverage-panel-desc">Each software requirement and the validation cases that cover it.</p>
          <table className="velm-table">
            <thead>
              <tr>
                <th>Requirement</th>
                <th>Title</th>
                <th>ECU</th>
                <th>Safety</th>
                <th>Validation cases</th>
                <th>Passed</th>
              </tr>
            </thead>
            <tbody>
              {requirementCoverage.map((r) => (
                <tr key={r.requirementId}>
                  <td><code>{r.requirementId}</code></td>
                  <td className="cell-title">{r.title}</td>
                  <td><code>{r.ecuId}</code></td>
                  <td>{r.safetyRelevant ? 'Yes' : 'No'}</td>
                  <td>{r.testCount}</td>
                  <td><span className={r.passedCount > 0 ? 'status status-pass' : ''}>{r.passedCount}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {requirementCoverage.some((r) => r.validationCaseIds.length > 0) && (
            <details className="coverage-details">
              <summary>Validation case IDs per requirement</summary>
              <ul>
                {requirementCoverage.map((r) => (
                  <li key={r.requirementId}>
                    <code>{r.requirementId}</code> → {r.validationCaseIds.length ? r.validationCaseIds.join(', ') : '—'}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>

        <section className="coverage-panel">
          <h2>Validation case → Requirement (backward)</h2>
          <p className="coverage-panel-desc">Each validation case and the requirement it traces to.</p>
          <table className="velm-table">
            <thead>
              <tr>
                <th>Validation case</th>
                <th>Title</th>
                <th>Requirement</th>
                <th>Requirement title</th>
              </tr>
            </thead>
            <tbody>
              {validationCaseCoverage.map((v) => (
                <tr key={v.validationCaseId}>
                  <td><code>{v.validationCaseId}</code></td>
                  <td className="cell-title">{v.title}</td>
                  <td><code>{v.requirementId || '—'}</code></td>
                  <td className="cell-title">{v.requirementTitle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}
