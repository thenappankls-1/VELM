import { useEffect, useState } from 'react'
import { api } from './api/client'
import type { Vehicle, Function, Ecu, Requirement, ValidationCase } from './api/types'
import './CreateDataPage.css'

type CreateMessage = { type: 'success'; text: string } | { type: 'error'; text: string } | null

export function CreateDataPage({ onRefetch }: { onRefetch: () => void }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [functions, setFunctions] = useState<Function[]>([])
  const [ecus, setEcus] = useState<Ecu[]>([])
  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [validationCases, setValidationCases] = useState<ValidationCase[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<CreateMessage>(null)

  const [vId, setVId] = useState('')
  const [vName, setVName] = useState('')
  const [vDesc, setVDesc] = useState('')

  const [fId, setFId] = useState('')
  const [fName, setFName] = useState('')
  const [fDesc, setFDesc] = useState('')
  const [fVehicleId, setFVehicleId] = useState('')

  const [eId, setEId] = useState('')
  const [eName, setEName] = useState('')
  const [eFunctionId, setEFunctionId] = useState('')

  const [reqId, setReqId] = useState('')
  const [reqTitle, setReqTitle] = useState('')
  const [reqDesc, setReqDesc] = useState('')
  const [reqSafety, setReqSafety] = useState(false)
  const [reqEcuId, setReqEcuId] = useState('')

  const [vcId, setVcId] = useState('')
  const [vcTitle, setVcTitle] = useState('')
  const [vcReqId, setVcReqId] = useState('')

  const [vrId, setVrId] = useState('')
  const [vrVcId, setVrVcId] = useState('')
  const [vrStatus, setVrStatus] = useState<'pass' | 'fail' | 'not_run'>('pass')

  useEffect(() => {
    Promise.all([api.getVehicles(), api.getFunctions(), api.getEcus(), api.getRequirements(), api.getValidationCases()])
      .then(([vs, fs, es, reqs, vcs]) => {
        setVehicles(vs)
        setFunctions(fs)
        setEcus(es)
        setRequirements(reqs)
        setValidationCases(vcs)
        if (vs.length > 0 && !fVehicleId) setFVehicleId(vs[0].id)
        if (fs.length > 0 && !eFunctionId) setEFunctionId(fs[0].id)
        if (es.length > 0 && !reqEcuId) setReqEcuId(es[0].id)
        if (reqs.length > 0 && !vcReqId) setVcReqId(reqs[0].id)
        if (vcs.length > 0 && !vrVcId) setVrVcId(vcs[0].id)
      })
      .catch(() => setMessage({ type: 'error', text: 'Failed to load lists' }))
      .finally(() => setLoading(false))
  }, [])

  const refetchLists = () => {
    api.getVehicles().then(setVehicles)
    api.getFunctions().then(setFunctions)
    api.getEcus().then(setEcus)
    api.getRequirements().then(setRequirements)
    api.getValidationCases().then(setValidationCases)
  }

  const showSuccess = (text: string) => {
    setMessage({ type: 'success', text })
    onRefetch()
    refetchLists()
    setTimeout(() => setMessage(null), 4000)
  }
  const showError = (text: string) => setMessage({ type: 'error', text })

  if (loading) return <div className="create-loading">Loading…</div>

  return (
    <div className="create-page">
      {message && <div className={`create-message create-message-${message.type}`}>{message.text}</div>}

      <section className="create-form-section">
        <h2>New vehicle</h2>
        <form className="create-form" onSubmit={(e) => { e.preventDefault(); setMessage(null); api.createVehicle({ id: vId.trim(), name: vName.trim(), description: vDesc.trim() || undefined }).then(() => { showSuccess(`Vehicle "${vId}" created.`); setVId(''); setVName(''); setVDesc(''); }).catch((err) => showError(err instanceof Error ? err.message : 'Failed')); }}>
          <div className="form-row"><label htmlFor="v-id">ID *</label><input id="v-id" value={vId} onChange={(e) => setVId(e.target.value)} placeholder="e.g. VH-003" required /></div>
          <div className="form-row"><label htmlFor="v-name">Name *</label><input id="v-name" value={vName} onChange={(e) => setVName(e.target.value)} required /></div>
          <div className="form-row"><label htmlFor="v-desc">Description</label><textarea id="v-desc" value={vDesc} onChange={(e) => setVDesc(e.target.value)} rows={2} /></div>
          <button type="submit" className="create-btn">Create vehicle</button>
        </form>
      </section>

      <section className="create-form-section">
        <h2>New function</h2>
        <form className="create-form" onSubmit={(e) => { e.preventDefault(); setMessage(null); api.createFunction({ id: fId.trim(), name: fName.trim(), description: fDesc.trim() || undefined, vehicleId: fVehicleId || undefined }).then(() => { showSuccess(`Function "${fId}" created.`); setFId(''); setFName(''); setFDesc(''); }).catch((err) => showError(err instanceof Error ? err.message : 'Failed')); }}>
          <div className="form-row"><label htmlFor="f-id">ID *</label><input id="f-id" value={fId} onChange={(e) => setFId(e.target.value)} placeholder="e.g. FUN-005" required /></div>
          <div className="form-row"><label htmlFor="f-name">Name *</label><input id="f-name" value={fName} onChange={(e) => setFName(e.target.value)} required /></div>
          <div className="form-row"><label htmlFor="f-desc">Description</label><textarea id="f-desc" value={fDesc} onChange={(e) => setFDesc(e.target.value)} rows={2} /></div>
          <div className="form-row"><label htmlFor="f-vehicle">Vehicle</label><select id="f-vehicle" value={fVehicleId} onChange={(e) => setFVehicleId(e.target.value)}><option value="">— None —</option>{vehicles.map((v) => <option key={v.id} value={v.id}>{v.id} – {v.name}</option>)}</select></div>
          <button type="submit" className="create-btn">Create function</button>
        </form>
      </section>

      <section className="create-form-section">
        <h2>New ECU</h2>
        <form className="create-form" onSubmit={(e) => { e.preventDefault(); setMessage(null); api.createEcu({ id: eId.trim(), name: eName.trim(), functionId: eFunctionId.trim() }).then(() => { showSuccess(`ECU "${eId}" created.`); setEId(''); setEName(''); }).catch((err) => showError(err instanceof Error ? err.message : 'Failed')); }}>
          <div className="form-row"><label htmlFor="e-id">ID *</label><input id="e-id" value={eId} onChange={(e) => setEId(e.target.value)} placeholder="e.g. ECU-XXX" required /></div>
          <div className="form-row"><label htmlFor="e-name">Name *</label><input id="e-name" value={eName} onChange={(e) => setEName(e.target.value)} required /></div>
          <div className="form-row"><label htmlFor="e-func">Function *</label><select id="e-func" value={eFunctionId} onChange={(e) => setEFunctionId(e.target.value)} required><option value="">— Select function —</option>{functions.map((f) => <option key={f.id} value={f.id}>{f.id} – {f.name}</option>)}</select></div>
          <button type="submit" className="create-btn">Create ECU</button>
        </form>
      </section>

      <section className="create-form-section">
        <h2>New software requirement</h2>
        <form className="create-form" onSubmit={(e) => { e.preventDefault(); setMessage(null); api.createRequirement({ id: reqId.trim(), title: reqTitle.trim(), description: reqDesc.trim() || undefined, safetyRelevant: reqSafety, ecuId: reqEcuId.trim() }).then(() => { showSuccess(`Requirement "${reqId}" created.`); setReqId(''); setReqTitle(''); setReqDesc(''); }).catch((err) => showError(err instanceof Error ? err.message : 'Failed')); }}>
          <div className="form-row"><label htmlFor="req-id">ID *</label><input id="req-id" value={reqId} onChange={(e) => setReqId(e.target.value)} placeholder="e.g. REQ-011" required /></div>
          <div className="form-row"><label htmlFor="req-title">Title *</label><input id="req-title" value={reqTitle} onChange={(e) => setReqTitle(e.target.value)} required /></div>
          <div className="form-row"><label htmlFor="req-desc">Description</label><textarea id="req-desc" value={reqDesc} onChange={(e) => setReqDesc(e.target.value)} rows={2} /></div>
          <div className="form-row"><label htmlFor="req-ecu">ECU *</label><select id="req-ecu" value={reqEcuId} onChange={(e) => setReqEcuId(e.target.value)} required><option value="">— Select ECU —</option>{ecus.map((ecu) => <option key={ecu.id} value={ecu.id}>{ecu.id} – {ecu.name}</option>)}</select></div>
          <div className="form-row form-row-check"><label><input type="checkbox" checked={reqSafety} onChange={(e) => setReqSafety(e.target.checked)} /> Safety-relevant</label></div>
          <button type="submit" className="create-btn">Create requirement</button>
        </form>
      </section>

      <section className="create-form-section">
        <h2>New validation case</h2>
        <form className="create-form" onSubmit={(e) => { e.preventDefault(); setMessage(null); api.createValidationCase({ id: vcId.trim(), title: vcTitle.trim(), requirementId: vcReqId.trim() }).then(() => { showSuccess(`Validation case "${vcId}" created.`); setVcId(''); setVcTitle(''); }).catch((err) => showError(err instanceof Error ? err.message : 'Failed')); }}>
          <div className="form-row"><label htmlFor="vc-id">ID *</label><input id="vc-id" value={vcId} onChange={(e) => setVcId(e.target.value)} placeholder="e.g. VC-016" required /></div>
          <div className="form-row"><label htmlFor="vc-title">Title *</label><input id="vc-title" value={vcTitle} onChange={(e) => setVcTitle(e.target.value)} required /></div>
          <div className="form-row"><label htmlFor="vc-req">Software requirement *</label><select id="vc-req" value={vcReqId} onChange={(e) => setVcReqId(e.target.value)} required><option value="">— Select requirement —</option>{requirements.map((r) => <option key={r.id} value={r.id}>{r.id} – {r.title}</option>)}</select></div>
          <button type="submit" className="create-btn">Create validation case</button>
        </form>
      </section>

      <section className="create-form-section">
        <h2>New validation result</h2>
        <form className="create-form" onSubmit={(e) => { e.preventDefault(); setMessage(null); api.createValidationResult({ id: vrId.trim(), validationCaseId: vrVcId.trim(), status: vrStatus }).then(() => { showSuccess(`Validation result "${vrId}" created.`); setVrId(''); }).catch((err) => showError(err instanceof Error ? err.message : 'Failed')); }}>
          <div className="form-row"><label htmlFor="vr-id">ID *</label><input id="vr-id" value={vrId} onChange={(e) => setVrId(e.target.value)} placeholder="e.g. VR-016" required /></div>
          <div className="form-row"><label htmlFor="vr-vc">Validation case *</label><select id="vr-vc" value={vrVcId} onChange={(e) => setVrVcId(e.target.value)} required><option value="">— Select —</option>{validationCases.map((vc) => <option key={vc.id} value={vc.id}>{vc.id} – {vc.title}</option>)}</select></div>
          <div className="form-row"><label htmlFor="vr-status">Status *</label><select id="vr-status" value={vrStatus} onChange={(e) => setVrStatus(e.target.value as 'pass' | 'fail' | 'not_run')}><option value="pass">pass</option><option value="fail">fail</option><option value="not_run">not_run</option></select></div>
          <button type="submit" className="create-btn">Create validation result</button>
        </form>
      </section>
    </div>
  )
}
