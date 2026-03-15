export interface Requirement {
  id: string
  title: string
  description: string
  safetyRelevant: boolean
}

export interface TestCase {
  id: string
  title: string
  requirementId: string
}

export interface TestResult {
  id: string
  testCaseId: string
  status: 'pass' | 'fail' | 'not_run'
}

export interface TraceLink {
  requirementId: string
  testCaseId: string
  testResultId?: string
  requirement?: Requirement
  testCase?: TestCase
  testResult?: TestResult
}

export interface ImpactResponse {
  requirement: { id: string; title: string; description: string; safetyRelevant: number } | null
  affectedTestCases: TestCase[]
  affectedTestResults: TestResult[]
  traceLinks: Array<{ testCaseId: string; testResultId: string | null }>
}

export interface CoverageResponse {
  requirementCoverage: Array<{
    requirementId: string
    title: string
    safetyRelevant: number
    testCaseIds: string[]
    testCount: number
    passedCount: number
  }>
  testCaseCoverage: Array<{
    testCaseId: string
    title: string
    requirementId: string
    requirementTitle: string
  }>
  summary: {
    totalRequirements: number
    coveredRequirements: number
    totalTestCases: number
    linkedTestCases: number
    requirementCoveragePct: number
    testCaseCoveragePct: number
  }
}
