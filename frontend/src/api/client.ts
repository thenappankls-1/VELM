import type {
  Vehicle,
  Function,
  Ecu,
  Requirement,
  ValidationCase,
  ValidationResult,
  TraceLink,
  ImpactResponse,
  CoverageResponse,
} from './types'

const base = '/api'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${base}${path}`)
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`)
  return res.json()
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(err.error || res.statusText)
  }
  return res.json()
}

export const api = {
  getVehicles: () => get<Vehicle[]>(`/vehicles`),
  getFunctions: () => get<Function[]>(`/functions`),
  getEcus: () => get<Ecu[]>(`/ecus`),
  getRequirements: () => get<Requirement[]>(`/requirements`),
  getValidationCases: () => get<ValidationCase[]>(`/validation-cases`),
  getValidationResults: () => get<ValidationResult[]>(`/validation-results`),
  getTrace: () => get<TraceLink[]>(`/trace`),
  getImpact: (requirementId: string) => get<ImpactResponse>(`/impact/${encodeURIComponent(requirementId)}`),
  getCoverage: () => get<CoverageResponse>(`/coverage`),
  createVehicle: (body: { id: string; name: string; description?: string }) =>
    post<Vehicle>(`/vehicles`, body),
  createFunction: (body: { id: string; name: string; description?: string; vehicleId?: string }) =>
    post<Function>(`/functions`, body),
  createEcu: (body: { id: string; name: string; functionId: string }) =>
    post<Ecu>(`/ecus`, body),
  createRequirement: (body: { id: string; title: string; description?: string; safetyRelevant?: boolean; ecuId: string }) =>
    post<Requirement>(`/requirements`, body),
  createValidationCase: (body: { id: string; title: string; requirementId: string }) =>
    post<ValidationCase>(`/validation-cases`, body),
  createValidationResult: (body: { id: string; validationCaseId: string; status: 'pass' | 'fail' | 'not_run' }) =>
    post<ValidationResult>(`/validation-results`, body),
}
