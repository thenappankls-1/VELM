# VELM POC

Vehicle Engineering Lifecycle Management – Proof of Concept.

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

## What's included

- **Backend** (`backend/`): Express + TypeScript, **SQLite storage** (`velm-poc.db` in `backend/`). Endpoints: `GET /api/requirements`, `/api/test-cases`, `/api/test-results`, `/api/trace`, **`GET /api/impact/:requirementId`** (impact view: affected test cases and results for a requirement).
- **Frontend** (`frontend/`): React + Vite + TypeScript. **Impact view** (select a requirement to see what’s affected), requirements list, and traceability table (Requirement → Test case → Result).
