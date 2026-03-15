import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "velm-poc.db");
export const db = new Database(dbPath);

export type Requirement = {
  id: string;
  title: string;
  description: string;
  safety_relevant: number;
};

export type TestCase = {
  id: string;
  title: string;
  requirement_id: string;
};

export type TestResult = {
  id: string;
  test_case_id: string;
  status: "pass" | "fail" | "not_run";
};

export type TraceLinkRow = {
  requirement_id: string;
  test_case_id: string;
  test_result_id: string | null;
};

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS requirements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      safety_relevant INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS test_cases (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      requirement_id TEXT NOT NULL,
      FOREIGN KEY (requirement_id) REFERENCES requirements(id)
    );
    CREATE TABLE IF NOT EXISTS test_results (
      id TEXT PRIMARY KEY,
      test_case_id TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('pass','fail','not_run')),
      FOREIGN KEY (test_case_id) REFERENCES test_cases(id)
    );
    CREATE TABLE IF NOT EXISTS trace_links (
      requirement_id TEXT NOT NULL,
      test_case_id TEXT NOT NULL,
      test_result_id TEXT,
      PRIMARY KEY (requirement_id, test_case_id),
      FOREIGN KEY (requirement_id) REFERENCES requirements(id),
      FOREIGN KEY (test_case_id) REFERENCES test_cases(id),
      FOREIGN KEY (test_result_id) REFERENCES test_results(id)
    );
    CREATE INDEX IF NOT EXISTS idx_trace_requirement ON trace_links(requirement_id);
    CREATE INDEX IF NOT EXISTS idx_trace_test_case ON trace_links(test_case_id);
  `);
}

function seedIfEmpty() {
  const count = db.prepare("SELECT COUNT(*) as n FROM requirements").get() as { n: number };
  if (count.n > 0) return;

  const insertReq = db.prepare(
    "INSERT INTO requirements (id, title, description, safety_relevant) VALUES (?, ?, ?, ?)"
  );
  const insertTc = db.prepare(
    "INSERT INTO test_cases (id, title, requirement_id) VALUES (?, ?, ?)"
  );
  const insertTr = db.prepare(
    "INSERT INTO test_results (id, test_case_id, status) VALUES (?, ?, ?)"
  );
  const insertLink = db.prepare(
    "INSERT INTO trace_links (requirement_id, test_case_id, test_result_id) VALUES (?, ?, ?)"
  );

  // 10 requirements: mix safety (1) and non-safety (0)
  const reqs: Array<[string, string, string, number]> = [
    ["REQ-001", "Brake system shall stop vehicle within X meters", "High-level braking performance.", 1],
    ["REQ-002", "System shall log diagnostic trouble codes", "DTC logging for critical failures.", 1],
    ["REQ-003", "Steering assist shall meet response time budget", "EPS performance.", 1],
    ["REQ-004", "HMI shall display warning within 200 ms", "Display latency.", 1],
    ["REQ-005", "OTA updates shall be signed and verified", "Security.", 1],
    ["REQ-006", "User manual shall be available in PDF", "Documentation.", 0],
    ["REQ-007", "Config tool shall export calibration to CSV", "Tooling.", 0],
    ["REQ-008", "ECU shall support sleep/wake on CAN", "Power management.", 1],
    ["REQ-009", "Logs shall be retained for 30 days", "Diagnostics.", 0],
    ["REQ-010", "Sensor fusion shall output confidence score", "ADAS input.", 1],
  ];
  reqs.forEach(([id, title, desc, safety]) => insertReq.run(id, title, desc, safety));

  // 15 test cases linked to requirements (spread across REQ-001..REQ-010)
  const tcs: Array<[string, string, string]> = [
    ["TC-001", "Emergency braking from 100 km/h", "REQ-001"],
    ["TC-002", "Brake fade after 10 cycles", "REQ-001"],
    ["TC-003", "DTC logging on sensor failure", "REQ-002"],
    ["TC-004", "DTC clear on repair", "REQ-002"],
    ["TC-005", "Steering torque response 50 ms", "REQ-003"],
    ["TC-006", "HMI warning display latency", "REQ-004"],
    ["TC-007", "OTA signature verification", "REQ-005"],
    ["TC-008", "OTA rollback on failure", "REQ-005"],
    ["TC-009", "PDF manual download", "REQ-006"],
    ["TC-010", "Config export CSV format", "REQ-007"],
    ["TC-011", "CAN sleep entry and wake", "REQ-008"],
    ["TC-012", "Log retention 30 days", "REQ-009"],
    ["TC-013", "Fusion confidence 0–1 range", "REQ-010"],
    ["TC-014", "Steering assist at low speed", "REQ-003"],
    ["TC-015", "Multiple DTCs ordering", "REQ-002"],
  ];
  tcs.forEach(([id, title, rid]) => insertTc.run(id, title, rid));

  // Test results and trace links (subset for demo)
  const results: Array<[string, string, string]> = [
    ["TR-001", "TC-001", "pass"],
    ["TR-002", "TC-002", "pass"],
    ["TR-003", "TC-003", "pass"],
    ["TR-004", "TC-004", "not_run"],
    ["TR-005", "TC-005", "pass"],
    ["TR-006", "TC-006", "fail"],
    ["TR-007", "TC-007", "pass"],
    ["TR-008", "TC-008", "not_run"],
    ["TR-009", "TC-009", "pass"],
    ["TR-010", "TC-010", "pass"],
    ["TR-011", "TC-011", "pass"],
    ["TR-012", "TC-012", "pass"],
    ["TR-013", "TC-013", "pass"],
    ["TR-014", "TC-014", "not_run"],
    ["TR-015", "TC-015", "pass"],
  ];
  results.forEach(([id, tcid, status]) => insertTr.run(id, tcid, status));

  // Trace links: requirement <-> test case <-> result
  const links: Array<[string, string, string | null]> = [
    ["REQ-001", "TC-001", "TR-001"],
    ["REQ-001", "TC-002", "TR-002"],
    ["REQ-002", "TC-003", "TR-003"],
    ["REQ-002", "TC-004", "TR-004"],
    ["REQ-002", "TC-015", "TR-015"],
    ["REQ-003", "TC-005", "TR-005"],
    ["REQ-003", "TC-014", "TR-014"],
    ["REQ-004", "TC-006", "TR-006"],
    ["REQ-005", "TC-007", "TR-007"],
    ["REQ-005", "TC-008", "TR-008"],
    ["REQ-006", "TC-009", "TR-009"],
    ["REQ-007", "TC-010", "TR-010"],
    ["REQ-008", "TC-011", "TR-011"],
    ["REQ-009", "TC-012", "TR-012"],
    ["REQ-010", "TC-013", "TR-013"],
  ];
  links.forEach(([rid, tcid, trid]) => insertLink.run(rid, tcid, trid));
}

export function initDb() {
  initSchema();
  seedIfEmpty();
}

// API-shaped row types
export type RequirementRow = { id: string; title: string; description: string; safetyRelevant: number };
export type TestCaseRow = { id: string; title: string; requirementId: string };
export type TestResultRow = { id: string; testCaseId: string; status: string };

export function getRequirements(): RequirementRow[] {
  const rows = db.prepare("SELECT id, title, description, safety_relevant AS safetyRelevant FROM requirements").all() as RequirementRow[];
  return rows;
}

export function getTestCases(): TestCaseRow[] {
  const rows = db.prepare("SELECT id, title, requirement_id AS requirementId FROM test_cases").all() as TestCaseRow[];
  return rows;
}

export function getTestResults(): TestResultRow[] {
  const rows = db.prepare("SELECT id, test_case_id AS testCaseId, status FROM test_results").all() as TestResultRow[];
  return rows;
}

export function getTraceLinks(): Array<{
  requirementId: string;
  testCaseId: string;
  testResultId: string | null;
  requirement: RequirementRow | null;
  testCase: TestCaseRow | null;
  testResult: TestResultRow | null;
}> {
  const links = db.prepare(
    "SELECT requirement_id AS requirementId, test_case_id AS testCaseId, test_result_id AS testResultId FROM trace_links"
  ).all() as Array<{ requirementId: string; testCaseId: string; testResultId: string | null }>;

  const reqMap = new Map(getRequirements().map((r) => [r.id, r]));
  const tcMap = new Map(getTestCases().map((t) => [t.id, t]));
  const trMap = new Map(getTestResults().map((r) => [r.id, r]));

  return links.map((link) => ({
    ...link,
    requirement: reqMap.get(link.requirementId) ?? null,
    testCase: tcMap.get(link.testCaseId) ?? null,
    testResult: link.testResultId ? (trMap.get(link.testResultId) ?? null) : null,
  }));
}

export function getImpactByRequirementId(requirementId: string): {
  requirement: RequirementRow | null;
  affectedTestCases: TestCaseRow[];
  affectedTestResults: TestResultRow[];
  traceLinks: Array<{ testCaseId: string; testResultId: string | null }>;
} {
  const requirement = db.prepare("SELECT id, title, description, safety_relevant AS safetyRelevant FROM requirements WHERE id = ?").get(requirementId) as RequirementRow | undefined;
  const links = db.prepare(
    "SELECT test_case_id AS testCaseId, test_result_id AS testResultId FROM trace_links WHERE requirement_id = ?"
  ).all(requirementId) as Array<{ testCaseId: string; testResultId: string | null }>;

  const tcIds = [...new Set(links.map((l) => l.testCaseId))];
  const trIds = links.map((l) => l.testResultId).filter((id): id is string => id != null);

  const placeholdersTc = tcIds.map(() => "?").join(",");
  const placeholdersTr = trIds.length ? trIds.map(() => "?").join(",") : "";
  const affectedTestCases = tcIds.length
    ? (db.prepare(`SELECT id, title, requirement_id AS requirementId FROM test_cases WHERE id IN (${placeholdersTc})`).all(...tcIds) as TestCaseRow[])
    : [];
  const affectedTestResults = trIds.length
    ? (db.prepare(`SELECT id, test_case_id AS testCaseId, status FROM test_results WHERE id IN (${placeholdersTr})`).all(...trIds) as TestResultRow[])
    : [];

  return {
    requirement: requirement ?? null,
    affectedTestCases,
    affectedTestResults,
    traceLinks: links,
  };
}

export function createRequirement(data: { id: string; title: string; description?: string; safetyRelevant?: boolean }): RequirementRow {
  const desc = data.description ?? "";
  const safety = data.safetyRelevant ? 1 : 0;
  db.prepare("INSERT INTO requirements (id, title, description, safety_relevant) VALUES (?, ?, ?, ?)").run(data.id.trim(), data.title.trim(), desc, safety);
  return db.prepare("SELECT id, title, description, safety_relevant AS safetyRelevant FROM requirements WHERE id = ?").get(data.id.trim()) as RequirementRow;
}

export function createTestCase(data: { id: string; title: string; requirementId: string }): TestCaseRow {
  const id = data.id.trim();
  const requirementId = data.requirementId.trim();
  db.prepare("INSERT INTO test_cases (id, title, requirement_id) VALUES (?, ?, ?)").run(id, data.title.trim(), requirementId);
  db.prepare("INSERT OR IGNORE INTO trace_links (requirement_id, test_case_id, test_result_id) VALUES (?, ?, ?)").run(requirementId, id, null);
  return db.prepare("SELECT id, title, requirement_id AS requirementId FROM test_cases WHERE id = ?").get(id) as TestCaseRow;
}

export function createTestResult(data: { id: string; testCaseId: string; status: "pass" | "fail" | "not_run" }): TestResultRow {
  const id = data.id.trim();
  const testCaseId = data.testCaseId.trim();
  db.prepare("INSERT INTO test_results (id, test_case_id, status) VALUES (?, ?, ?)").run(id, testCaseId, data.status);
  db.prepare("UPDATE trace_links SET test_result_id = ? WHERE test_case_id = ?").run(id, testCaseId);
  return db.prepare("SELECT id, test_case_id AS testCaseId, status FROM test_results WHERE id = ?").get(id) as TestResultRow;
}

export function getCoverage(): {
  requirementCoverage: Array<{ requirementId: string; title: string; safetyRelevant: number; testCaseIds: string[]; testCount: number; passedCount: number }>;
  testCaseCoverage: Array<{ testCaseId: string; title: string; requirementId: string; requirementTitle: string }>;
  summary: { totalRequirements: number; coveredRequirements: number; totalTestCases: number; linkedTestCases: number; requirementCoveragePct: number; testCaseCoveragePct: number };
} {
  const requirements = getRequirements();
  const testCases = getTestCases();
  const links = db.prepare(
    "SELECT requirement_id AS requirementId, test_case_id AS testCaseId, test_result_id AS testResultId FROM trace_links"
  ).all() as Array<{ requirementId: string; testCaseId: string; testResultId: string | null }>;
  const results = db.prepare("SELECT id, test_case_id AS testCaseId, status FROM test_results").all() as Array<{ id: string; testCaseId: string; status: string }>;
  const passByTrId = new Map(results.filter((r) => r.status === "pass").map((r) => [r.id, true]));

  const reqToTcs = new Map<string, string[]>();
  const tcToReq = new Map<string, { requirementId: string; requirementTitle: string }>();
  for (const link of links) {
    if (!reqToTcs.has(link.requirementId)) reqToTcs.set(link.requirementId, []);
    if (!reqToTcs.get(link.requirementId)!.includes(link.testCaseId)) reqToTcs.get(link.requirementId)!.push(link.testCaseId);
    const req = requirements.find((r) => r.id === link.requirementId);
    tcToReq.set(link.testCaseId, { requirementId: link.requirementId, requirementTitle: req?.title ?? link.requirementId });
  }

  const requirementCoverage = requirements.map((r) => {
    const testCaseIds = reqToTcs.get(r.id) ?? [];
    const passedCount = links
      .filter((l) => l.requirementId === r.id && l.testResultId && passByTrId.has(l.testResultId))
      .length;
    return {
      requirementId: r.id,
      title: r.title,
      safetyRelevant: r.safetyRelevant,
      testCaseIds,
      testCount: testCaseIds.length,
      passedCount,
    };
  });

  const testCaseCoverage = testCases.map((t) => {
    const link = tcToReq.get(t.id);
    return {
      testCaseId: t.id,
      title: t.title,
      requirementId: link?.requirementId ?? "",
      requirementTitle: link?.requirementTitle ?? "—",
    };
  });

  const coveredRequirements = requirementCoverage.filter((r) => r.testCount > 0).length;
  const linkedTestCases = testCaseCoverage.filter((t) => t.requirementId).length;
  const totalRequirements = requirements.length;
  const totalTestCases = testCases.length;

  return {
    requirementCoverage,
    testCaseCoverage,
    summary: {
      totalRequirements,
      coveredRequirements,
      totalTestCases,
      linkedTestCases,
      requirementCoveragePct: totalRequirements ? Math.round((coveredRequirements / totalRequirements) * 100) : 0,
      testCaseCoveragePct: totalTestCases ? Math.round((linkedTestCases / totalTestCases) * 100) : 0,
    },
  };
}
