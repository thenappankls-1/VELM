
# VELM Template Model

## Purpose

Templates define **engineering domain structures**.

They allow organizations to create vehicle models quickly while maintaining consistent relationships.

VELM provides default templates but allows customers to extend them.

---

# Template Structure

A template defines:

1. Node types
2. Relationship types
3. Allowed connections
4. Default visualizations
5. Role views

---

# Node Type Definition

Example:

NodeType
name
category
metadataSchema

Example node types:

Vehicle  
Function  
ECU  
Requirement  
ValidationCase  
ValidationResult  

---

# Relationship Type Definition

Example:

RelationshipType
name
sourceNodeType
targetNodeType

Examples:

Vehicle → contains → Function
Function → implemented_by → ECU
Function → satisfies → Requirement
Requirement → verified_by → ValidationCase
ValidationCase → produces → ValidationResult

---

# Allowed Relationships

Templates define allowed relationships to maintain system integrity.

Example:

Allowed:
Requirement → verified_by → ValidationCase

Not allowed:
ValidationResult → contains → Vehicle

This prevents graph chaos.

---

# Template Example

Automotive System Engineering Template

Nodes:

Vehicle  
Function  
ECU  
Requirement  
ValidationCase  
ValidationResult  

Relationships:

Vehicle → contains → Function
Function → implemented_by → ECU
Function → satisfies → Requirement
Requirement → verified_by → ValidationCase
ValidationCase → produces → ValidationResult

---

# Template Extension

Customers may extend templates.

Example additional nodes:

SoftwareFunction  
SimulationModel  
CalibrationParameter  
DiagnosticFunction  

Example relationships:

ECU → runs → SoftwareFunction
SoftwareFunction → validated_by → SimulationModel
Function → tuned_by → CalibrationParameter

Templates can then be saved as:

OEM_ADAS_TEMPLATE
EV_POWERTRAIN_TEMPLATE
AUTONOMY_STACK_TEMPLATE

---

# Template Storage Concept

Example structure:

templates
node_types
relationship_types
allowed_connections

Vehicle projects reference templates:

vehicle_project → template_id

---

# Benefits

Templates provide:

- guided system modeling
- reusable engineering structures
- consistent traceability
- faster project creation

They balance **flexibility and usability**.
