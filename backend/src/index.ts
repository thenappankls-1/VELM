import express, { type Request, type Response } from "express";
import cors from "cors";
import {
  initDb,
  getRequirements,
  getTestCases,
  getTestResults,
  getTraceLinks,
  getImpactByRequirementId,
  getCoverage,
  createRequirement,
  createTestCase,
  createTestResult,
} from "./db";

initDb();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/requirements", (_req: Request, res: Response) => {
  res.json(getRequirements());
});

app.get("/api/test-cases", (_req: Request, res: Response) => {
  res.json(getTestCases());
});

app.get("/api/test-results", (_req: Request, res: Response) => {
  res.json(getTestResults());
});

app.get("/api/trace", (_req: Request, res: Response) => {
  res.json(getTraceLinks());
});

app.get("/api/impact/:requirementId", (req: Request, res: Response) => {
  const requirementId = req.params.requirementId;
  if (typeof requirementId !== "string") {
    res.status(400).json({ error: "Missing requirementId" });
    return;
  }
  const impact = getImpactByRequirementId(requirementId);
  res.json(impact);
});

app.get("/api/coverage", (_req: Request, res: Response) => {
  res.json(getCoverage());
});

app.post("/api/requirements", (req: Request, res: Response) => {
  const body = req.body as { id?: string; title?: string; description?: string; safetyRelevant?: boolean };
  if (!body?.id || !body?.title) {
    res.status(400).json({ error: "id and title are required" });
    return;
  }
  try {
    const payload: { id: string; title: string; description?: string; safetyRelevant?: boolean } = {
      id: body.id,
      title: body.title,
    };
    if (body.description !== undefined) payload.description = body.description;
    if (body.safetyRelevant !== undefined) payload.safetyRelevant = body.safetyRelevant;
    const row = createRequirement(payload);
    res.status(201).json(row);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Create failed";
    res.status(409).json({ error: msg });
  }
});

app.post("/api/test-cases", (req: Request, res: Response) => {
  const body = req.body as { id?: string; title?: string; requirementId?: string };
  if (!body?.id || !body?.title || !body?.requirementId) {
    res.status(400).json({ error: "id, title, and requirementId are required" });
    return;
  }
  try {
    const row = createTestCase({
      id: body.id,
      title: body.title,
      requirementId: body.requirementId,
    });
    res.status(201).json(row);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Create failed";
    res.status(409).json({ error: msg });
  }
});

app.post("/api/test-results", (req: Request, res: Response) => {
  const body = req.body as { id?: string; testCaseId?: string; status?: string };
  if (!body?.id || !body?.testCaseId || !body?.status) {
    res.status(400).json({ error: "id, testCaseId, and status are required" });
    return;
  }
  const status = body.status === "pass" || body.status === "fail" || body.status === "not_run" ? body.status : undefined;
  if (!status) {
    res.status(400).json({ error: "status must be pass, fail, or not_run" });
    return;
  }
  try {
    const row = createTestResult({
      id: body.id,
      testCaseId: body.testCaseId,
      status,
    });
    res.status(201).json(row);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Create failed";
    res.status(409).json({ error: msg });
  }
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`VELM POC backend listening on port ${port}`);
});
