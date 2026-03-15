import { useEffect, useState } from 'react'
import { api } from './api/client'
import type { Vehicle, Function, Ecu, Requirement, ValidationCase, ValidationResult } from './api/types'
import './DataViewPage.css'

export function DataViewPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [functions, setFunctions] = useState<Function[]>([])
  const [ecus, setEcus] = useState<Ecu[]>([])
  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [validationCases, setValidationCases] = useState<ValidationCase[]>([])
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      api.getVehicles(),
      api.getFunctions(),
      api.getEcus(),
      api.getRequirements(),
      api.getValidationCases(),
      api.getValidationResults(),
    ])
      .then(([vs, fs, es, reqs, vcs, vrs]) => {
        setVehicles(vs)
        setFunctions(fs)
        setEcus(es)
        setRequirements(reqs)
        setValidationCases(vcs)
        setValidationResults(vrs)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="data-view-loading">Loading data…</div>
  if (error) return <div className="data-view-error">Error: {error}</div>

  const funcMap = new Map(functions.map((f) => [f.id, f]))
  const vehicleMap = new Map(vehicles.map((v) => [v.id, v]))

  return (
    <div className="data-view-page">
      <p className="data-view-chain">Vehicle → Function → ECU → Software requirement → Validation case → Result</p>

      <section className="data-view-section">
        <h2>Vehicles ({vehicles.length})</h2>
        <table className="velm-table">
          <thead><tr><th>ID</th><th>Name</th><th>Description</th></tr></thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id}><td><code>{v.id}</code></td><td>{v.name}</td><td className="cell-desc">{v.description || '—'}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="data-view-section">
        <h2>Functions ({functions.length})</h2>
        <table className="velm-table">
          <thead><tr><th>ID</th><th>Name</th><th>Vehicle</th><th>Description</th></tr></thead>
          <tbody>
            {functions.map((f) => (
              <tr key={f.id}>
                <td><code>{f.id}</code></td><td>{f.name}</td>
                <td>{f.vehicleId ? <code>{vehicleMap.get(f.vehicleId)?.name ?? f.vehicleId}</code> : '—'}</td>
                <td className="cell-desc">{f.description || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="data-view-section">
        <h2>ECUs ({ecus.length})</h2>
        <table className="velm-table">
          <thead><tr><th>ID</th><th>Name</th><th>Function</th></tr></thead>
          <tbody>
            {ecus.map((ecu) => (
              <tr key={ecu.id}><td><code>{ecu.id}</code></td><td>{ecu.name}</td><td><code>{funcMap.get(ecu.functionId)?.name ?? ecu.functionId}</code></td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="data-view-section">
        <h2>Software requirements ({requirements.length})</h2>
        <table className="velm-table">
          <thead><tr><th>ID</th><th>Title</th><th>ECU</th><th>Safety</th></tr></thead>
          <tbody>
            {requirements.map((r) => (
              <tr key={r.id}><td><code>{r.id}</code></td><td>{r.title}</td><td><code>{r.ecuId}</code></td><td>{r.safetyRelevant ? 'Yes' : 'No'}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="data-view-section">
        <h2>Validation cases ({validationCases.length})</h2>
        <table className="velm-table">
          <thead><tr><th>ID</th><th>Title</th><th>Requirement</th></tr></thead>
          <tbody>
            {validationCases.map((vc) => (
              <tr key={vc.id}><td><code>{vc.id}</code></td><td>{vc.title}</td><td><code>{vc.requirementId}</code></td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="data-view-section">
        <h2>Validation results ({validationResults.length})</h2>
        <table className="velm-table">
          <thead><tr><th>ID</th><th>Validation case</th><th>Status</th></tr></thead>
          <tbody>
            {validationResults.map((vr) => (
              <tr key={vr.id}><td><code>{vr.id}</code></td><td><code>{vr.validationCaseId}</code></td><td><span className={`status status-${vr.status}`}>{vr.status}</span></td></tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
