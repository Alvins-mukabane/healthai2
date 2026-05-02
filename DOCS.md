# Technical Deep-Dive: HealthAI Core & Interoperability

This document outlines the internal workings of the HealthAI Orchestrator as submitted for the **Agents Assemble Hackathon**.

## 1. FHIR Interoperability Layer (`src/lib/fhir.ts`)
The system provides a semantic bridge between consumer wearable data and the HL7 FHIR (R4) standard.

### Resource Mapping:
- **Patient**: Derived from verified profile data during onboarding.
- **Observation**: Biometric telemetry is mapped to LOINC codes:
  - `8867-4`: Heart Rate
  - `8480-6`: Systolic BP
  - `55423-8`: Daily Step Count
- **Goal**: AI-generated health targets are formatted as clinical goals for provider review.

## 2. MCP Server Specification (`src/lib/agents.ts`)
The platform exposes an internally-defined MCP (Model Context Protocol) server registry. 

| Tool Name | Purpose | Input Sample |
|---|---|---|
| `get_fhir_observations` | Direct data egress for EHR integration | `{ loincCode: "8867-4" }` |
| `analyze_longevity_risk` | Computes risk scores via cross-modal analysis | `{ includeSleep: true }` |

## 3. A2A Orchestration (`src/lib/agents.ts`)
Building on the "Endgame" vision, we implement specialized agents that communicate via standardized schemas.
- **Master Orchestrator**: Manages the SHARP context (Session, Health, Auth, Role, Patient) and delegates to sub-agents.
- **COIN Protocol**: All agents utilize a shared conversational state, allowing the "Nutrition" agent to access "Fitness" agent history for a holistic response.

## 4. Security & Context Propagation
- **SHARP Context**: The platform is ready to bridge EHR session credentials directly into the agent call chain.
- **FHIR Token Handling**: Securely manages short-lived tokens for data egress to FHIR sandboxes.

## 5. Developer Terminal
The built-in terminal (`src/pages/Settings.tsx`) allows developers to:
- `mcp list`: View active tools.
- `fhir inspect`: See the current patient data in raw JSON format.
- `agent state`: Debug the COIN conversational history.
