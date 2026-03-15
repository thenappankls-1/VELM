import { useEffect, useState, useCallback } from 'react'
import { api } from './api/client'
import type { Requirement, TraceLink, ImpactResponse } from './api/types'
import { CreateDataPage } from './CreateDataPage'
import { DataViewPage } from './DataViewPage'
import { CoveragePage } from './CoveragePage'
import { Nav, type Page } from './Nav'
import './App.css'
import './Nav.css'

function App() {
  const [page, setPage] = useState<Page>('trace')
  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [trace, setTrace] = useState<TraceLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [impactReqId, setImpactReqId] = useState<string>('')
  const [impact, setImpact] = useState<ImpactResponse | null>(null)
  const [impactLoading, setImpactLoading] = useState(false)

  const refetch = useCallback(() => {
    setLoading(true)
    Promise.all([api.getRequirements(), api.getTrace()])
      .then(([reqs, links]) => {
        setRequirements(reqs)
        setTrace(links)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (page === 'trace') refetch()
  }, [page, refetch])

  useEffect(() => {
    if (!impactReqId) {
      setImpact(null)
      return
    }
    setImpactLoading(true)
    api.getImpact(impactReqId)
      .then(setImpact)
      .catch(() => setImpact(null))
      .finally(() => setImpactLoading(false))
  }, [impactReqId])

  const handlePage = (p: Page) => {
    setPage(p)
    if (p === 'trace') setLoading(true)
  }

  return (
    <div className="velm-app">
      <header className="velm-header">
        <h1>VELM POC</h1>
        <p>Vehicle Engineering Lifecycle Management</p>
        <Nav page={page} onPage={handlePage} />
      </header>

      {page === 'create' && <CreateDataPage onRefetch={refetch} />}

      {page === 'data' && <DataViewPage />}

      {page === 'coverage' && <CoveragePage />}

      {page === 'trace' && (
        <>
          {loading && <div className="app-loading">Loading…</div>}
          {error && <div className="app-error">Error: {error}</div>}
          {!loading && !error && (
            <>
              <section className="velm-section">
                <h2>Impact view</h2>
                <p className="velm-section-desc">Select a software requirement to see affected validation cases and results.</p>
                <div className="impact-select">
                  <label htmlFor="impact-req">Requirement</label>
                  <select
                    id="impact-req"
                    value={impactReqId}
                    onChange={(e) => setImpactReqId(e.target.value)}
                  >
                    <option value="">— Select requirement —</option>
                    {requirements.map((r) => (
                      <option key={r.id} value={r.id}>{r.id} – {r.title}</option>
                    ))}
                  </select>
                </div>
                {impactLoading && <div className="impact-loading">Loading impact…</div>}
                {impactReqId && !impactLoading && impact && (
                  <div className="impact-panel">
                    {impact.requirement ? (
                      <div className="impact-requirement">
                        <strong><code>{impact.requirement.id}</code></strong> {impact.requirement.title}
                        {impact.requirement.description && <p className="impact-desc">{impact.requirement.description}</p>}
                      </div>
                    ) : (
                      <div className="impact-requirement">Requirement not found.</div>
                    )}
                    <h3>Affected validation cases ({impact.affectedValidationCases.length})</h3>
                    {impact.affectedValidationCases.length > 0 ? (
                      <table className="velm-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Title</th>
                          </tr>
                        </thead>
                        <tbody>
                          {impact.affectedValidationCases.map((vc) => (
                            <tr key={vc.id}>
                              <td><code>{vc.id}</code></td>
                              <td>{vc.title}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="impact-empty">No validation cases linked to this requirement.</p>
                    )}
                    <h3>Affected validation results ({impact.affectedValidationResults.length})</h3>
                    {impact.affectedValidationResults.length > 0 ? (
                      <table className="velm-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Validation case</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {impact.affectedValidationResults.map((vr) => (
                            <tr key={vr.id}>
                              <td><code>{vr.id}</code></td>
                              <td>{vr.validationCaseId}</td>
                              <td><span className={`status status-${vr.status}`}>{vr.status}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="impact-empty">No validation results linked.</p>
                    )}
                  </div>
                )}
              </section>

              <section className="velm-section">
                <h2>Software requirements</h2>
                <table className="velm-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>ECU</th>
                      <th>Safety</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requirements.map((r) => (
                      <tr key={r.id}>
                        <td><code>{r.id}</code></td>
                        <td>{r.title}</td>
                        <td><code>{r.ecuId}</code></td>
                        <td>{r.safetyRelevant ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <section className="velm-section">
                <h2>Traceability (Requirement → Validation case → Result)</h2>
                <table className="velm-table">
                  <thead>
                    <tr>
                      <th>Software requirement</th>
                      <th>Validation case</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trace.map((link, i) => (
                      <tr key={link.requirementId + link.validationCaseId + String(i)}>
                        <td>
                          {link.requirement ? (
                            <><code>{link.requirement.id}</code> {link.requirement.title}</>
                          ) : (
                            link.requirementId
                          )}
                        </td>
                        <td>
                          {link.validationCase ? (
                            <><code>{link.validationCase.id}</code> {link.validationCase.title}</>
                          ) : (
                            link.validationCaseId
                          )}
                        </td>
                        <td>
                          {link.validationResult ? (
                            <span className={`status status-${link.validationResult.status}`}>{link.validationResult.status}</span>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default App
