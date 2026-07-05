# AttackLens Knowledge Base Standard

Version: 1.0

---

# Purpose

This document defines the standards, structure, conventions, and development methodology used for the AttackLens Knowledge Base.

The goal is to ensure every vulnerability pack follows the same architecture and can be added without modifying the application logic.

AttackLens is designed as a **knowledge-driven expert system**, where all security intelligence is stored as structured YAML files and interpreted by the backend.

---

# Core Philosophy

AttackLens follows four principles:

1. **Knowledge First**

   * Security intelligence belongs in YAML.
   * Python only interprets the knowledge.

2. **Single Responsibility**

   * Every file answers one question only.

3. **Data Driven**

   * Adding a new vulnerability should require adding YAML files, not changing Python code.

4. **Human Readable**

   * Every knowledge file should be understandable without reading the application code.

---

# Knowledge Base Structure

```
knowledge/

├── indicators/
├── vulnerabilities/
├── rules/
├── checklists/
└── references/
```

---

# Indicators

## Purpose

Indicators represent observable characteristics extracted from a request or response.

Indicators NEVER represent vulnerabilities.

Examples:

* authentication
* object_identifier
* json_response
* graphql
* multipart_request
* jwt

Indicators answer the question:

> "What did we observe?"

---

## Indicator Rules

Every indicator must:

* Be independently detectable.
* Be reusable by multiple vulnerabilities.
* Never recommend a vulnerability.
* Never contain payloads.
* Never contain testing methodology.

---

## Standard Indicator Schema

```yaml
id:
name:
description:

version:
category:
confidence:
priority:

detection:

examples:

notes:
```

---

# Vulnerabilities

## Purpose

A vulnerability file describes a vulnerability.

It never explains:

* when to recommend it
* how to test it
* where to learn it

Those belong elsewhere.

---

## Vulnerability Rules

A vulnerability file contains:

* metadata
* severity
* classifications
* impact
* prerequisites
* tags

It must NOT contain:

* rules
* payloads
* checklists

---

# Rules

## Purpose

Rules connect indicators to vulnerabilities.

Rules are responsible for scoring recommendations.

Rules answer:

> "Should this vulnerability be recommended?"

---

## Rule Principles

Rules:

* consume indicators
* produce scores
* never parse requests
* never contain payloads
* never contain testing steps

---

## Rule Schema

```yaml
id:
name:
description:

version:

enabled:

vulnerability:

required_indicators:

optional_indicators:

related_indicators:

weights:

thresholds:

recommendation:

explanation:

notes:
```

---

# Checklists

## Purpose

Checklists define manual penetration testing methodology.

Each checklist should help a tester perform practical verification.

Checklists are designed to be:

* actionable
* structured
* educational

---

## Checklist Rules

Every test must contain:

* priority
* title
* objective
* expected result

Checklists should be grouped into logical categories.

---

## Checklist Schema

```yaml
vulnerability:

version:

categories:
```

Each test:

```yaml
id:
priority:
title:
objective:
expected:
```

---

# References

## Purpose

References provide trusted educational material.

References should only include reputable sources.

Preferred sources:

* OWASP WSTG
* OWASP Top 10
* OWASP ASVS
* PortSwigger Web Security Academy
* CWE
* CAPEC
* NIST (where applicable)
* Recognized security books

Avoid:

* Blogs without technical review
* Random GitHub repositories
* AI-generated articles

---

# Naming Conventions

Use snake_case everywhere.

Examples:

```
object_identifier
json_response
file_upload
open_redirect
broken_access_control
```

Never use:

```
ObjectIdentifier
JsonResponse
objectIdentifier
```

---

# Confidence Levels

Allowed values:

```
low
medium
high
```

---

# Priority Levels

Allowed values:

```
low
medium
high
critical
```

---

# Categories

Every knowledge file should belong to a category.

Examples:

Indicators:

* authentication
* response
* request
* technology
* resource_identifier

Vulnerabilities:

* access_control
* injection
* authentication
* session_management
* file_handling
* business_logic

---

# Versioning

Every YAML file begins with:

```yaml
version: 1.0
```

Schema changes require increasing the version.

---

# Trusted Sources

Knowledge should primarily be derived from:

* OWASP Web Security Testing Guide
* OWASP Top 10
* OWASP ASVS
* PortSwigger Web Security Academy
* The Web Application Hacker's Handbook
* Real-World Bug Hunting
* Common Weakness Enumeration (CWE)
* CAPEC where applicable

Public bug bounty reports may be used for identifying common patterns but should not be copied directly.

---

# Backend Responsibilities

The backend is responsible for:

* Loading YAML files
* Validating schemas
* Parsing requests
* Detecting indicators
* Executing rules
* Calculating confidence scores
* Returning recommendations

The backend must never hardcode security knowledge.

---

# Frontend Responsibilities

The frontend is responsible for:

* Displaying recommendations
* Rendering confidence scores
* Rendering checklists
* Displaying references
* Showing explanations

The frontend must never implement detection logic.

---

# Adding a New Vulnerability

Every new vulnerability must include:

```
indicators/
    (new indicators only if required)

vulnerabilities/
    vulnerability.yaml

rules/
    vulnerability.yaml

checklists/
    vulnerability.yaml

references/
    vulnerability.yaml
```

No Python code should require modification unless the parser must support a completely new protocol or request format.

---

# Project Goal

AttackLens is not a vulnerability scanner.

AttackLens is a security reasoning engine that helps penetration testers identify what to test, why it should be tested, and how to perform structured manual testing based on trusted security knowledge.
