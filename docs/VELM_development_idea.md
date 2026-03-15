# VELM Development Strategy

## Vision

VELM (Vehicle Engineering Lifecycle Management) is envisioned as a
**vehicle-centric engineering platform** that unifies system
architecture, requirements, validation, and engineering artifacts in one
environment.

The goal is not to build another rigid lifecycle tool but to build a
**modeling platform for vehicle engineering systems**.

VELM should allow organizations to represent their engineering reality
while still guiding them with proven automotive structures.

------------------------------------------------------------------------

# Core Philosophy

VELM should not be:

-   a rigid predefined schema
-   an empty graph editor
-   a reporting dashboard

Instead it should be:

**A platform + templates approach**.

This provides flexibility while maintaining usability.

    VELM Platform
          ↓
    Engineering Templates
          ↓
    Vehicle Projects

------------------------------------------------------------------------

# Layer 1 --- VELM Platform (Core Engine)

This is the stable technical foundation.

Core capabilities include:

-   node system
-   relationship system
-   versioning
-   traceability
-   impact analysis
-   validation coverage analytics
-   role-based views
-   visualization engine

This layer functions as the **engineering knowledge graph engine**.

------------------------------------------------------------------------

# Layer 2 --- Templates (Domain Knowledge)

VELM should ship with **default domain templates**.

Example template:

Automotive System Engineering Template

Nodes:

-   Vehicle
-   Function
-   ECU
-   Requirement
-   ValidationCase
-   ValidationResult

Relationships:

Vehicle → contains → Function\
Function → implemented_by → ECU\
Function → satisfies → Requirement\
Requirement → verified_by → ValidationCase\
ValidationCase → produces → ValidationResult

Templates guide users without forcing rigid models.

------------------------------------------------------------------------

# Template Customization

Customers can:

1.  Use the default template
2.  Extend the template
3.  Create new templates

Example new nodes:

-   SoftwareFunction
-   TestBench
-   SimulationModel
-   CalibrationParameter

Example new relationships:

ECU → runs → SoftwareFunction\
SoftwareFunction → validated_by → SimulationModel

These customized models can be saved as:

    OEM_Advanced_Autonomy_Template

------------------------------------------------------------------------

# Layer 3 --- Vehicle Projects

A product owner creates a vehicle project using a template.

Example:

Vehicle: EU ADAS Platform

Functions:

-   Emergency braking
-   Lane keeping
-   Adaptive cruise

VELM automatically creates the structural relationships from the
template.

------------------------------------------------------------------------

# Engineering Workflow

## Step 1 --- Template Selection

User selects a template:

Automotive Systems Template

## Step 2 --- Vehicle Creation

Vehicle is instantiated from template.

Example:

Vehicle: EU ADAS Platform

## Step 3 --- Populate Vehicle Model

Users select from libraries:

-   Function library
-   ECU library
-   Validation library

If an artifact does not exist, it can be created and stored in the
library.

## Step 4 --- Stakeholder Workspaces

Different roles interact with the same model:

System Architect

Vehicle → Functions → ECUs

Validation Engineer

Requirement → ValidationCase → ValidationResult

Program Manager

Coverage dashboards and readiness metrics

------------------------------------------------------------------------

# Libraries

VELM maintains reusable engineering libraries.

Examples:

Function Library - Emergency braking - Lane keeping - Adaptive cruise

ECU Library - Brake ECU - Camera ECU - Gateway ECU

Validation Library - Emergency braking test - ABS slip test - Lane
detection test

These libraries accelerate vehicle modeling.

------------------------------------------------------------------------

# Visualization Philosophy

Visualization should not be a reporting layer.

Visualization should act as the **engineering cockpit**.

Examples:

Vehicle architecture view\
Requirement traceability view\
Validation coverage dashboard\
Impact analysis graph

Visualization is always derived from the underlying engineering graph.

------------------------------------------------------------------------

# Data Architecture Direction

VELM should evolve toward a **graph-based engineering model**.

Core concept:

Nodes represent engineering artifacts.

Relationships represent engineering dependencies.

Example:

Vehicle → Function → Requirement → ValidationCase → ValidationResult

This structure supports:

-   impact analysis
-   dependency exploration
-   lifecycle traceability

------------------------------------------------------------------------

# Guardrails for Usability

Total flexibility can lead to chaos.

VELM should enforce:

-   typed node categories
-   typed relationships
-   template-defined allowed connections

Templates therefore define the **engineering ontology**.

------------------------------------------------------------------------

# Long-Term Vision

VELM becomes a **Vehicle Engineering Modeling Platform**.

Engineers explore the vehicle system through a connected graph:

Vehicle\
├── Functions\
│ ├── Requirements\
│ │ └── ValidationCases\
│\
├── ECUs\
│ └── Signals\
│\
└── Validation

This approach enables:

-   complete lifecycle traceability
-   system-level impact analysis
-   unified engineering collaboration

VELM ultimately becomes the **engineering operating system for vehicle
development**.
