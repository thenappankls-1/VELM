
# VELM Architecture

## Overview

VELM (Vehicle Engineering Lifecycle Management) is designed as a **vehicle‑centric engineering platform** built on a graph-based model.

The architecture consists of four primary layers:

User Interface
↓
Application Services
↓
Engineering Graph Engine
↓
Storage Layer

---

# 1. User Interface Layer

The UI acts as the **engineering cockpit**.

Key views:

Vehicle Workspace  
Dependency Map  
Traceability View  
Impact Analysis  
Coverage Dashboard  

Navigation always starts with:

Vehicle

Example:

Vehicle
 ├── Functions
 │     ├── Requirements
 │     │     └── ValidationCases
 │
 ├── ECUs
 │     └── Signals
 │
 └── Validation

Frontend technology (example):

- React
- TypeScript
- Graph visualization (D3.js / Cytoscape)

---

# 2. Application Services

Application services implement engineering logic.

Examples:

Traceability Service  
Impact Analysis Service  
Coverage Calculation  
Validation Aggregation  

Example API structure:

GET /vehicles
GET /functions
GET /ecus
GET /requirements
GET /validation-cases
GET /validation-results

GET /trace
GET /impact/:requirementId
GET /coverage

---

# 3. Engineering Graph Engine

VELM internally models engineering artifacts as a **graph**.

Nodes represent engineering objects.

Examples:

Vehicle  
Function  
ECU  
Requirement  
ValidationCase  

Edges represent relationships.

Examples:

Vehicle → contains → Function
Function → implemented_by → ECU
Function → satisfies → Requirement
Requirement → verified_by → ValidationCase
ValidationCase → produces → ValidationResult

Graph modeling enables:

- system dependency exploration
- lifecycle traceability
- change impact analysis

---

# 4. Storage Layer

Initial POC can use relational storage.

Example:

SQLite / PostgreSQL

Tables:

vehicles
functions
ecus
requirements
validation_cases
validation_results

Future architecture may evolve to graph storage or hybrid models.

---

# Data Flow Example

Requirement validation flow:

Vehicle
↓
Function
↓
Requirement
↓
ValidationCase
↓
ValidationResult

This structure allows full lifecycle traceability.
