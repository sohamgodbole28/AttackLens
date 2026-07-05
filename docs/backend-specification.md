# AttackLens Backend Specification

Version: 1.0

---

# 1. Introduction

## Purpose

AttackLens is a knowledge-driven security reasoning engine designed to assist penetration testers and bug bounty hunters in identifying endpoints that should be manually tested for common web application vulnerabilities.

Unlike traditional vulnerability scanners, AttackLens does not actively exploit or scan applications. Instead, it analyzes HTTP requests and responses, detects observable security indicators, applies deterministic rules, and recommends relevant vulnerability classes together with structured testing methodologies.

The backend is responsible for loading the knowledge base, parsing HTTP requests, detecting indicators, executing rule-based reasoning, and exposing recommendations through a REST API.

---

## Objectives

The backend should:

- Load all knowledge from YAML files.
- Never hardcode security knowledge.
- Parse raw HTTP requests.
- Detect observable indicators.
- Execute deterministic rule evaluation.
- Return structured recommendations.
- Be modular and easily extensible.
- Support adding new vulnerability packs without modifying backend logic.

---

## Non-Goals

The backend is NOT intended to:

- Automatically exploit vulnerabilities.
- Replace manual penetration testing.
- Perform network scanning.
- Crawl websites.
- Generate payloads automatically.
- Use AI or machine learning for decision making.

---

# 2. Design Philosophy

AttackLens follows a data-driven architecture.

The knowledge base is the single source of truth.

Security knowledge must never be hardcoded inside Python files.

Python is responsible only for:

- Loading knowledge
- Parsing requests
- Detecting indicators
- Executing rules
- Returning recommendations

Every new vulnerability should be added by creating YAML files rather than modifying backend logic.

The backend should remain deterministic, predictable, and easily testable.

---

## Core Principles

- Knowledge over code.
- Simplicity over unnecessary abstraction.
- Composition over hardcoding.
- Human-readable knowledge.
- Modular architecture.
- Easy extensibility.

---

# 3. Technology Stack

| Layer | Technology |
|--------|------------|
| Language | Python 3.12+ |
| API Framework | FastAPI |
| Validation | Pydantic v2 |
| YAML Parsing | PyYAML |
| ASGI Server | Uvicorn |
| Configuration | python-dotenv |
| Testing | pytest |
| Logging | Python logging module |

---

## Dependencies

The project should avoid unnecessary dependencies.

No database is required.

No ORM is required.

No message queues are required.

No caching layer is required.

The knowledge base itself acts as the application's static data source.

---

# 4. High-Level Architecture

```
                HTTP Request
                      │
                      ▼
             Request Parser
                      │
                      ▼
           Indicator Detector
                      │
                      ▼
              Rule Engine
                      │
                      ▼
        Recommendation Engine
                      │
                      ▼
              JSON Response
```

---

## Component Responsibilities

### Request Parser

Responsible for:

- Parsing raw HTTP requests.
- Extracting headers.
- Extracting cookies.
- Extracting query parameters.
- Extracting body data.
- Producing a normalized ParsedRequest object.

---

### Indicator Detector

Responsible for:

- Loading indicator definitions.
- Matching request properties.
- Returning detected indicators.

---

### Rule Engine

Responsible for:

- Loading rule definitions.
- Applying weights.
- Applying bonus scores.
- Checking required indicators.
- Calculating recommendation scores.

---

### Recommendation Engine

Responsible for:

- Combining rule results.
- Determining confidence.
- Returning vulnerability recommendations.
- Attaching checklist and reference metadata.

---

# 5. Folder Structure

```
backend/

├── app/
│
│   ├── api/
│   │     recommendations.py
│   │
│   ├── engine/
│   │     detector.py
│   │     rule_engine.py
│   │     recommendation_engine.py
│   │
│   ├── parser/
│   │     request_parser.py
│   │
│   ├── loader/
│   │     yaml_loader.py
│   │     registry.py
│   │
│   ├── models/
│   │     indicator.py
│   │     rule.py
│   │     vulnerability.py
│   │     parsed_request.py
│   │     recommendation.py
│   │
│   ├── knowledge/
│   │
│   ├── config.py
│   │
│   └── main.py
│
├── tests/
│
├── requirements.txt
│
└── README.md
```

---

## Knowledge Base

The knowledge directory contains all application intelligence.

The backend loads every YAML file during startup.

After validation, all knowledge is stored inside a Knowledge Registry.

The backend must never repeatedly read YAML files during request processing.

All runtime operations should use the in-memory registry.

---

## Knowledge Registry

The registry acts as the central repository for all loaded knowledge.

Example:

- Indicators
- Rules
- Vulnerabilities
- Checklists
- References

Every backend component should obtain knowledge from the registry rather than reading files directly.

This ensures:

- Faster execution.
- Centralized validation.
- Simpler testing.
- Consistent application state.