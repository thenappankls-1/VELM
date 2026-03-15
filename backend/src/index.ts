import express, { type Request, type Response } from "express";
import cors from "cors";
import {
  initDb,
  getVehicles,
  getFunctions,
  getEcus,
  getRequirements,
  getValidationCases,
  getValidationResults,
  getTrace,
  getImpactByRequirementId,
  getCoverage,
  createVehicle,
  createFunction,
  createEcu,
  createRequirement,
  createValidationCase,
  createValidationResult,
} from "./db";

initDb();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/vehicles", (_req: Request, res: Response) => {
  res.json(getVehicles());
});

app.get("/api/functions", (_req: Request, res: Response) => {
  res.json(getFunctions());
});

app.get("/api/ecus", (_req: Request, res: Response) => {
  res.json(getEcus());
});

app.get("/api/requirements", (_req: Request, res: Response) => {
  res.json(getRequirements());
});

app.get("/api/validation-cases", (_req: Request, res: Response) => {
  res.json(getValidationCases());
});

app.get("/api/validation-results", (_req: Request, res: Response) => {
  res.json(getValidationResults());
});

app.get("/api/trace", (_req: Request, res: Response) => {
  res.json(getTrace());
});

app.get("/api/impact/:requirementId", (req: Request, res: Response) => {
  const requirementId = req.params.requirementId;
  if (typeof requirementId !== "string") {
    res.status(400).json({ error: "Missing requirementId" });
    return;
  }
  res.json(getImpactByRequirementId(requirementId));
});

app.get("/api/coverage", (_req: Request, res: Response) => {
  res.json(getCoverage());
});

app.post("/api/vehicles", (req: Request, res: Response) => {
  const body = req.body as { id?: string; name?: string; description?: string };
  if (!body?.id || !body?.name) {
    res.status(400).json({ error: "id and name are required" });
    return;
  }
  try {
    res.status(201).json(createVehicle({ id: body.id, name: body.name, ...(body.description && { description: body.description })}));
  } catch (e) {
    res.status(409).json({ error: e instanceof Error ? e.message : "Create failed" });
  }
});

app.post("/api/functions", (req: Request, res: Response) => {
  const body = req.body as { id?: string; name?: string; description?: string; vehicleId?: string };
  if (!body?.id || !body?.name) {
    res.status(400).json({ error: "id and name are required" });
    return;
  }
  try {
    res.status(201).json(createFunction({ id: body.id, name: body.name, ...(body.description && { description: body.description }), ...(body.vehicleId && { vehicleId: body.vehicleId }) }));
  } catch (e) {
    res.status(409).json({ error: e instanceof Error ? e.message : "Create failed" });
  }
});

app.post("/api/ecus", (req: Request, res: Response) => {
  const body = req.body as { id?: string; name?: string; functionId?: string };
  if (!body?.id || !body?.name || !body?.functionId) {
    res.status(400).json({ error: "id, name, and functionId are required" });
    return;
  }
  try {
    res.status(201).json(createEcu({ id: body.id, name: body.name, functionId: body.functionId }));
  } catch (e) {
    res.status(409).json({ error: e instanceof Error ? e.message : "Create failed" });
  }
});

app.post("/api/requirements", (req: Request, res: Response) => {
  const body = req.body as { id?: string; title?: string; description?: string; safetyRelevant?: boolean; ecuId?: string };
  if (!body?.id || !body?.title || !body?.ecuId) {
    res.status(400).json({ error: "id, title, and ecuId are required" });
    return;
  }
  try {
    const payload: { id: string; title: string; description?: string; safetyRelevant?: boolean; ecuId: string } = {
      id: body.id,
      title: body.title,
      ecuId: body.ecuId,
    };
    if (body.description !== undefined) payload.description = body.description;
    if (body.safetyRelevant !== undefined) payload.safetyRelevant = body.safetyRelevant;
    res.status(201).json(createRequirement(payload));
  } catch (e) {
    res.status(409).json({ error: e instanceof Error ? e.message : "Create failed" });
  }
});

app.post("/api/validation-cases", (req: Request, res: Response) => {
  const body = req.body as { id?: string; title?: string; requirementId?: string };
  if (!body?.id || !body?.title || !body?.requirementId) {
    res.status(400).json({ error: "id, title, and requirementId are required" });
    return;
  }
  try {
    res.status(201).json(createValidationCase({ id: body.id, title: body.title, requirementId: body.requirementId }));
  } catch (e) {
    res.status(409).json({ error: e instanceof Error ? e.message : "Create failed" });
  }
});

app.post("/api/validation-results", (req: Request, res: Response) => {
  const body = req.body as { id?: string; validationCaseId?: string; status?: string };
  if (!body?.id || !body?.validationCaseId || !body?.status) {
    res.status(400).json({ error: "id, validationCaseId, and status are required" });
    return;
  }
  const status = body.status === "pass" || body.status === "fail" || body.status === "not_run" ? body.status : undefined;
  if (!status) {
    res.status(400).json({ error: "status must be pass, fail, or not_run" });
    return;
  }
  try {
    res.status(201).json(createValidationResult({ id: body.id, validationCaseId: body.validationCaseId, status }));
  } catch (e) {
    res.status(409).json({ error: e instanceof Error ? e.message : "Create failed" });
  }
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`VELM POC backend listening on port ${port}`);
});
