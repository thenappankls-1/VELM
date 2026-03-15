import type { Requirement, TestCase, TestResult, TraceLink, ImpactResponse, CoverageResponse } from './types'

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
  getRequirements: () => get<Requirement[]>(`/requirements`),
  getTestCases: () => get<TestCase[]>(`/test-cases`),
  getTestResults: () => get<TestResult[]>(`/test-results`),
  getTrace: () => get<TraceLink[]>(`/trace`),
  getImpact: (requirementId: string) => get<ImpactResponse>(`/impact/${encodeURIComponent(requirementId)}`),
  getCoverage: () => get<CoverageResponse>(`/coverage`),
  createRequirement: (body: { id: string; title: string; description?: string; safetyRelevant?: boolean }) =>
    post<Requirement>(`/requirements`, body),
  createTestCase: (body: { id: string; title: string; requirementId: string }) =>
    post<TestCase>(`/test-cases`, body),
  createTestResult: (body: { id: string; testCaseId: string; status: 'pass' | 'fail' | 'not_run' }) =>
    post<TestResult>(`/test-results`, body),
}
