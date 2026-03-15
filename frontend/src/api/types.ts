// Chain: Vehicle → Function → ECU → Software Requirement → Validation Case → Result

export interface Vehicle {
  id: string
  name: string
  description: string | null
}

export interface Function {
  id: string
  name: string
  description: string | null
  vehicleId: string | null
}

export interface Ecu {
  id: string
  name: string
  functionId: string
}

export interface Requirement {
  id: string
  title: string
  description: string
  safetyRelevant: boolean | number
  ecuId: string
}

export interface ValidationCase {
  id: string
  title: string
  requirementId: string
}

export interface ValidationResult {
  id: string
  validationCaseId: string
  status: 'pass' | 'fail' | 'not_run'
}

export interface TraceLink {
  requirementId: string
  validationCaseId: string
  validationResultId: string | null
  requirement?: Requirement | null
  validationCase?: ValidationCase | null
  validationResult?: ValidationResult | null
}

export interface ImpactResponse {
  requirement: { id: string; title: string; description: string; safetyRelevant: number; ecuId: string } | null
  affectedValidationCases: ValidationCase[]
  affectedValidationResults: ValidationResult[]
}

export interface CoverageResponse {
  requirementCoverage: Array<{
    requirementId: string
    title: string
    safetyRelevant: number
    ecuId: string
    validationCaseIds: string[]
    testCount: number
    passedCount: number
  }>
  validationCaseCoverage: Array<{
    validationCaseId: string
    title: string
    requirementId: string
    requirementTitle: string
  }>
  summary: {
    totalRequirements: number
    coveredRequirements: number
    totalValidationCases: number
    linkedValidationCases: number
    requirementCoveragePct: number
    validationCaseCoveragePct: number
  }
}
