import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "velm-poc.db");
export const db = new Database(dbPath);

// Chain: Vehicle → Function → ECU → Software Requirement → Validation Case → Result

function initSchema() {
  // Drop old tables so new schema applies (one-time; existing data in old shape is replaced by seed)
  db.exec(`
    DROP TABLE IF EXISTS trace_links;
    DROP TABLE IF EXISTS test_results;
    DROP TABLE IF EXISTS test_cases;
    DROP TABLE IF EXISTS validation_results;
    DROP TABLE IF EXISTS validation_cases;
    DROP TABLE IF EXISTS requirements;
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT
    );
    CREATE TABLE IF NOT EXISTS functions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      vehicle_id TEXT,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
    );
    CREATE TABLE IF NOT EXISTS ecus (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      function_id TEXT NOT NULL,
      FOREIGN KEY (function_id) REFERENCES functions(id)
    );
    CREATE TABLE IF NOT EXISTS requirements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      safety_relevant INTEGER NOT NULL DEFAULT 0,
      ecu_id TEXT NOT NULL,
      FOREIGN KEY (ecu_id) REFERENCES ecus(id)
    );
    CREATE TABLE IF NOT EXISTS validation_cases (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      requirement_id TEXT NOT NULL,
      FOREIGN KEY (requirement_id) REFERENCES requirements(id)
    );
    CREATE TABLE IF NOT EXISTS validation_results (
      id TEXT PRIMARY KEY,
      validation_case_id TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('pass','fail','not_run')),
      FOREIGN KEY (validation_case_id) REFERENCES validation_cases(id)
    );
    CREATE INDEX IF NOT EXISTS idx_req_ecu ON requirements(ecu_id);
    CREATE INDEX IF NOT EXISTS idx_vc_req ON validation_cases(requirement_id);
    CREATE INDEX IF NOT EXISTS idx_vr_vc ON validation_results(validation_case_id);
  `);
}

function seedIfEmpty() {
  const vehicleCount = db.prepare("SELECT COUNT(*) as n FROM vehicles").get() as { n: number };
  const requirementCount = db.prepare("SELECT COUNT(*) as n FROM requirements").get() as { n: number };
  const seedVehicles = vehicleCount.n === 0;
  const seedRequirements = requirementCount.n === 0;
  if (!seedVehicles && !seedRequirements) return;

  const insV = db.prepare("INSERT INTO vehicles (id, name, description) VALUES (?, ?, ?)");
  const insF = db.prepare("INSERT INTO functions (id, name, description, vehicle_id) VALUES (?, ?, ?, ?)");
  const insE = db.prepare("INSERT INTO ecus (id, name, function_id) VALUES (?, ?, ?)");
  const insR = db.prepare("INSERT INTO requirements (id, title, description, safety_relevant, ecu_id) VALUES (?, ?, ?, ?, ?)");
  const insVC = db.prepare("INSERT INTO validation_cases (id, title, requirement_id) VALUES (?, ?, ?)");
  const insVR = db.prepare("INSERT INTO validation_results (id, validation_case_id, status) VALUES (?, ?, ?)");

  if (seedVehicles) {
    insV.run("VH-001", "Platform A Sedan", "Main passenger car platform");
    insV.run("VH-002", "Platform B SUV", "SUV platform");
  }

  if (seedVehicles) {
  insF.run("FUN-001", "Braking", "Brake system function", "VH-001");
  insF.run("FUN-002", "Diagnostics", "DTC and logging", "VH-001");
  insF.run("FUN-003", "Steering", "EPS and steering assist", "VH-001");
  insF.run("FUN-004", "HMI", "Display and warnings", null);
  }

  if (seedVehicles) {
  insE.run("ECU-BRK", "Brake ECU", "FUN-001");
  insE.run("ECU-DIAG", "Diagnostics ECU", "FUN-002");
  insE.run("ECU-EPS", "Steering ECU", "FUN-003");
  insE.run("ECU-HMI", "HMI ECU", "FUN-004");
  insE.run("ECU-GW", "Gateway ECU", "FUN-002");
  }

  if (seedRequirements) {
  const reqs: Array<[string, string, string, number, string]> = [
    ["REQ-001", "Brake system shall stop vehicle within X meters", "High-level braking performance.", 1, "ECU-BRK"],
    ["REQ-002", "System shall log diagnostic trouble codes", "DTC logging for critical failures.", 1, "ECU-DIAG"],
    ["REQ-003", "Steering assist shall meet response time budget", "EPS performance.", 1, "ECU-EPS"],
    ["REQ-004", "HMI shall display warning within 200 ms", "Display latency.", 1, "ECU-HMI"],
    ["REQ-005", "OTA updates shall be signed and verified", "Security.", 1, "ECU-GW"],
    ["REQ-006", "User manual shall be available in PDF", "Documentation.", 0, "ECU-HMI"],
    ["REQ-007", "Config tool shall export calibration to CSV", "Tooling.", 0, "ECU-DIAG"],
    ["REQ-008", "ECU shall support sleep/wake on CAN", "Power management.", 1, "ECU-GW"],
    ["REQ-009", "Logs shall be retained for 30 days", "Diagnostics.", 0, "ECU-DIAG"],
    ["REQ-010", "Sensor fusion shall output confidence score", "ADAS input.", 1, "ECU-EPS"],
  ];
  reqs.forEach(([id, title, desc, safety, ecuId]) => insR.run(id, title, desc, safety, ecuId));
  }

  if (seedRequirements) {
  const vcs: Array<[string, string, string]> = [
    ["VC-001", "Emergency braking from 100 km/h", "REQ-001"],
    ["VC-002", "Brake fade after 10 cycles", "REQ-001"],
    ["VC-003", "DTC logging on sensor failure", "REQ-002"],
    ["VC-004", "DTC clear on repair", "REQ-002"],
    ["VC-005", "Steering torque response 50 ms", "REQ-003"],
    ["VC-006", "HMI warning display latency", "REQ-004"],
    ["VC-007", "OTA signature verification", "REQ-005"],
    ["VC-008", "OTA rollback on failure", "REQ-005"],
    ["VC-009", "PDF manual download", "REQ-006"],
    ["VC-010", "Config export CSV format", "REQ-007"],
    ["VC-011", "CAN sleep entry and wake", "REQ-008"],
    ["VC-012", "Log retention 30 days", "REQ-009"],
    ["VC-013", "Fusion confidence 0–1 range", "REQ-010"],
    ["VC-014", "Steering assist at low speed", "REQ-003"],
    ["VC-015", "Multiple DTCs ordering", "REQ-002"],
  ];
  vcs.forEach(([id, title, rid]) => insVC.run(id, title, rid));
  }

  if (seedRequirements) {
  const vrs: Array<[string, string, string]> = [
    ["VR-001", "VC-001", "pass"],
    ["VR-002", "VC-002", "pass"],
    ["VR-003", "VC-003", "pass"],
    ["VR-004", "VC-004", "not_run"],
    ["VR-005", "VC-005", "pass"],
    ["VR-006", "VC-006", "fail"],
    ["VR-007", "VC-007", "pass"],
    ["VR-008", "VC-008", "not_run"],
    ["VR-009", "VC-009", "pass"],
    ["VR-010", "VC-010", "pass"],
    ["VR-011", "VC-011", "pass"],
    ["VR-012", "VC-012", "pass"],
    ["VR-013", "VC-013", "pass"],
    ["VR-014", "VC-014", "not_run"],
    ["VR-015", "VC-015", "pass"],
  ];
  vrs.forEach(([id, vcid, status]) => insVR.run(id, vcid, status));
  }
}

export function initDb() {
  initSchema();
  seedIfEmpty();
}

// API row types
export type VehicleRow = { id: string; name: string; description: string | null };
export type FunctionRow = { id: string; name: string; description: string | null; vehicleId: string | null };
export type EcuRow = { id: string; name: string; functionId: string };
export type RequirementRow = { id: string; title: string; description: string; safetyRelevant: number; ecuId: string };
export type ValidationCaseRow = { id: string; title: string; requirementId: string };
export type ValidationResultRow = { id: string; validationCaseId: string; status: string };

export function getVehicles(): VehicleRow[] {
  return db.prepare("SELECT id, name, description FROM vehicles").all() as VehicleRow[];
}

export function getFunctions(): FunctionRow[] {
  return db.prepare("SELECT id, name, description, vehicle_id AS vehicleId FROM functions").all() as FunctionRow[];
}

export function getEcus(): EcuRow[] {
  return db.prepare("SELECT id, name, function_id AS functionId FROM ecus").all() as EcuRow[];
}

export function getRequirements(): RequirementRow[] {
  return db.prepare("SELECT id, title, description, safety_relevant AS safetyRelevant, ecu_id AS ecuId FROM requirements").all() as RequirementRow[];
}

export function getValidationCases(): ValidationCaseRow[] {
  return db.prepare("SELECT id, title, requirement_id AS requirementId FROM validation_cases").all() as ValidationCaseRow[];
}

export function getValidationResults(): ValidationResultRow[] {
  return db.prepare("SELECT id, validation_case_id AS validationCaseId, status FROM validation_results").all() as ValidationResultRow[];
}

// Trace: Requirement → Validation Case → Result (derived from FKs)
export function getTrace(): Array<{
  requirementId: string;
  validationCaseId: string;
  validationResultId: string | null;
  requirement: RequirementRow | null;
  validationCase: ValidationCaseRow | null;
  validationResult: ValidationResultRow | null;
}> {
  const rows = db.prepare(`
    SELECT r.id AS requirementId, vc.id AS validationCaseId, vr.id AS validationResultId
    FROM requirements r
    JOIN validation_cases vc ON vc.requirement_id = r.id
    LEFT JOIN validation_results vr ON vr.validation_case_id = vc.id
  `).all() as Array<{ requirementId: string; validationCaseId: string; validationResultId: string | null }>;

  const reqMap = new Map(getRequirements().map((r) => [r.id, r]));
  const vcMap = new Map(getValidationCases().map((v) => [v.id, v]));
  const vrMap = new Map(getValidationResults().map((r) => [r.id, r]));

  return rows.map((row) => ({
    ...row,
    requirement: reqMap.get(row.requirementId) ?? null,
    validationCase: vcMap.get(row.validationCaseId) ?? null,
    validationResult: row.validationResultId ? (vrMap.get(row.validationResultId) ?? null) : null,
  }));
}

export function getImpactByRequirementId(requirementId: string): {
  requirement: RequirementRow | null;
  affectedValidationCases: ValidationCaseRow[];
  affectedValidationResults: ValidationResultRow[];
} {
  const requirement = db.prepare("SELECT id, title, description, safety_relevant AS safetyRelevant, ecu_id AS ecuId FROM requirements WHERE id = ?").get(requirementId) as RequirementRow | undefined;
  const vcs = db.prepare("SELECT id, title, requirement_id AS requirementId FROM validation_cases WHERE requirement_id = ?").all(requirementId) as ValidationCaseRow[];
  const vcIds = vcs.map((v) => v.id);
  const vrs: ValidationResultRow[] = vcIds.length
    ? (db.prepare(`SELECT id, validation_case_id AS validationCaseId, status FROM validation_results WHERE validation_case_id IN (${vcIds.map(() => "?").join(",")})`).all(...vcIds) as ValidationResultRow[])
    : [];
  return {
    requirement: requirement ?? null,
    affectedValidationCases: vcs,
    affectedValidationResults: vrs,
  };
}

export function getCoverage(): {
  requirementCoverage: Array<{ requirementId: string; title: string; safetyRelevant: number; ecuId: string; validationCaseIds: string[]; testCount: number; passedCount: number }>;
  validationCaseCoverage: Array<{ validationCaseId: string; title: string; requirementId: string; requirementTitle: string }>;
  summary: { totalRequirements: number; coveredRequirements: number; totalValidationCases: number; linkedValidationCases: number; requirementCoveragePct: number; validationCaseCoveragePct: number };
} {
  const requirements = getRequirements();
  const vcs = getValidationCases();
  const vrs = getValidationResults();
  const passSet = new Set(vrs.filter((r) => r.status === "pass").map((r) => r.id));

  const reqToVcs = new Map<string, string[]>();
  for (const vc of vcs) {
    if (!reqToVcs.has(vc.requirementId)) reqToVcs.set(vc.requirementId, []);
    reqToVcs.get(vc.requirementId)!.push(vc.id);
  }

  const vcToReq = new Map<string, { requirementId: string; requirementTitle: string }>();
  const reqMap = new Map(requirements.map((r) => [r.id, r]));
  for (const vc of vcs) {
    const req = reqMap.get(vc.requirementId);
    vcToReq.set(vc.id, { requirementId: vc.requirementId, requirementTitle: req?.title ?? vc.requirementId });
  }

  const vcToResultIds = new Map<string, string[]>();
  for (const vr of vrs) {
    if (!vcToResultIds.has(vr.validationCaseId)) vcToResultIds.set(vr.validationCaseId, []);
    vcToResultIds.get(vr.validationCaseId)!.push(vr.id);
  }

  const requirementCoverage = requirements.map((r) => {
    const validationCaseIds = reqToVcs.get(r.id) ?? [];
    let passedCount = 0;
    for (const vcid of validationCaseIds) {
      const resultIds = vcToResultIds.get(vcid) ?? [];
      if (resultIds.some((id) => passSet.has(id))) passedCount += 1;
    }
    return {
      requirementId: r.id,
      title: r.title,
      safetyRelevant: r.safetyRelevant,
      ecuId: r.ecuId,
      validationCaseIds,
      testCount: validationCaseIds.length,
      passedCount,
    };
  });

  const validationCaseCoverage = vcs.map((vc) => {
    const link = vcToReq.get(vc.id);
    return {
      validationCaseId: vc.id,
      title: vc.title,
      requirementId: link?.requirementId ?? "",
      requirementTitle: link?.requirementTitle ?? "—",
    };
  });

  const coveredRequirements = requirementCoverage.filter((r) => r.testCount > 0).length;
  const linkedValidationCases = validationCaseCoverage.filter((v) => v.requirementId).length;
  const totalRequirements = requirements.length;
  const totalValidationCases = vcs.length;

  return {
    requirementCoverage,
    validationCaseCoverage,
    summary: {
      totalRequirements,
      coveredRequirements,
      totalValidationCases,
      linkedValidationCases,
      requirementCoveragePct: totalRequirements ? Math.round((coveredRequirements / totalRequirements) * 100) : 0,
      validationCaseCoveragePct: totalValidationCases ? Math.round((linkedValidationCases / totalValidationCases) * 100) : 0,
    },
  };
}

// Create functions
export function createVehicle(data: { id: string; name: string; description?: string }): VehicleRow {
  const id = data.id.trim();
  db.prepare("INSERT INTO vehicles (id, name, description) VALUES (?, ?, ?)").run(id, data.name.trim(), data.description?.trim() ?? null);
  return db.prepare("SELECT id, name, description FROM vehicles WHERE id = ?").get(id) as VehicleRow;
}

export function createFunction(data: { id: string; name: string; description?: string; vehicleId?: string }): FunctionRow {
  const id = data.id.trim();
  db.prepare("INSERT INTO functions (id, name, description, vehicle_id) VALUES (?, ?, ?, ?)").run(id, data.name.trim(), data.description?.trim() ?? null, data.vehicleId?.trim() || null);
  return db.prepare("SELECT id, name, description, vehicle_id AS vehicleId FROM functions WHERE id = ?").get(id) as FunctionRow;
}

export function createEcu(data: { id: string; name: string; functionId: string }): EcuRow {
  const id = data.id.trim();
  db.prepare("INSERT INTO ecus (id, name, function_id) VALUES (?, ?, ?)").run(id, data.name.trim(), data.functionId.trim());
  return db.prepare("SELECT id, name, function_id AS functionId FROM ecus WHERE id = ?").get(id) as EcuRow;
}

export function createRequirement(data: { id: string; title: string; description?: string; safetyRelevant?: boolean; ecuId: string }): RequirementRow {
  const id = data.id.trim();
  const safety = data.safetyRelevant ? 1 : 0;
  db.prepare("INSERT INTO requirements (id, title, description, safety_relevant, ecu_id) VALUES (?, ?, ?, ?, ?)").run(id, data.title.trim(), data.description?.trim() ?? "", safety, data.ecuId.trim());
  return db.prepare("SELECT id, title, description, safety_relevant AS safetyRelevant, ecu_id AS ecuId FROM requirements WHERE id = ?").get(id) as RequirementRow;
}

export function createValidationCase(data: { id: string; title: string; requirementId: string }): ValidationCaseRow {
  const id = data.id.trim();
  db.prepare("INSERT INTO validation_cases (id, title, requirement_id) VALUES (?, ?, ?)").run(id, data.title.trim(), data.requirementId.trim());
  return db.prepare("SELECT id, title, requirement_id AS requirementId FROM validation_cases WHERE id = ?").get(id) as ValidationCaseRow;
}

export function createValidationResult(data: { id: string; validationCaseId: string; status: "pass" | "fail" | "not_run" }): ValidationResultRow {
  const id = data.id.trim();
  db.prepare("INSERT INTO validation_results (id, validation_case_id, status) VALUES (?, ?, ?)").run(id, data.validationCaseId.trim(), data.status);
  return db.prepare("SELECT id, validation_case_id AS validationCaseId, status FROM validation_results WHERE id = ?").get(id) as ValidationResultRow;
}
