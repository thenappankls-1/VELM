# VELM POC

Vehicle Engineering Lifecycle Management – Proof of Concept.

**Concept chain:** Vehicle → Function → implemented ECU → Software requirement → Validation case → Result.

## Run the POC

1. **Backend** (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```
   API runs at **http://localhost:4000**.

2. **Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   App runs at **http://localhost:5173** and proxies `/api` to the backend.

3. Open **http://localhost:5173** in a browser to see Requirements and Traceability views.

## Auto-push to GitHub (scenario 1)

To **automatically commit and push** when you change files in the local folder:

1. From the **project root** (the VELM folder), install the watcher dependency once:
   ```bash
   npm install
   ```
2. In a **separate terminal**, start the auto-push watcher:
   ```bash
   npm run auto-push
   ```
   Leave it running. After you save changes, it waits **15 seconds** (no new changes), then runs `git add .`, `git commit`, and `git push`. Stop with Ctrl+C.

- **Debounce:** `AUTO_PUSH_DEBOUNCE_MS=30000` (env) = wait 30 seconds before syncing (default 15000).
- **Commit only (no push):** `AUTO_PUSH_SKIP_PUSH=1` (env) = only commit locally.

## What's included

- **Backend** (`backend/`): Express + TypeScript, **SQLite storage** (`velm-poc.db` in `backend/`). Endpoints: `GET /api/requirements`, `/api/test-cases`, `/api/test-results`, `/api/trace`, **`GET /api/impact/:requirementId`** (impact view: affected test cases and results for a requirement).
- **Frontend** (`frontend/`): React + Vite + TypeScript. **Impact view** (select a requirement to see what’s affected), requirements list, and traceability table (Requirement → Test case → Result).
