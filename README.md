<div align="center">

# AttackLens

### Rule-Based Web Application Security Analysis Engine

**Know the Weakness. Find the Path.**

Analyze HTTP requests, identify potential vulnerability classes, and receive actionable penetration testing guidance through an interactive security analysis engine.

[Live Demo](https://attack-lens.vercel.app) • [Documentation](#core-capabilities) • [Report Issues](https://github.com/sohamgodbole28/AttackLens/issues)

---

</div>

## Overview

AttackLens is a rule-based web application security analysis platform built to assist penetration testers, bug bounty hunters, security researchers, and students in identifying **potential vulnerability classes** from HTTP requests.

Rather than attempting to exploit applications automatically, AttackLens analyzes request characteristics, detects security indicators, evaluates weighted rules, and recommends **what to test next**.

It acts as an intelligent assistant that bridges the gap between raw HTTP traffic and manual security testing.

### Highlights

- Rule-based security analysis engine
- Extensible YAML knowledge base
- Interactive request visualization
- Weighted vulnerability scoring
- Actionable penetration testing guidance
- Fully deployed React + FastAPI application

---

## Core Capabilities

- Analyze Raw HTTP and Structured JSON requests
- Detect security-relevant request characteristics
- Evaluate requests using a weighted rule engine
- Generate actionable penetration testing guidance
- Provide contextual testing checklists and security references
- Highlight evidence directly within analyzed requests
- Modular YAML-driven knowledge base for extensible detection logic
- Modern React + FastAPI architecture

---

## Knowledge-Driven Detection

AttackLens uses a modular YAML knowledge base that evolves independently of the engine, allowing new indicators, rules, checklists and references to be added without changing the core architecture.

---

## Architecture

```text
HTTP Request / JSON
       ↓
Request Parser
       ↓
Indicator Detection
       ↓
Rule Evaluation
       ↓
Risk Scoring
       ↓
Recommendations
       ↓
Checklists & References
```

---

## Technology Stack

| Backend | Frontend | Knowledge Engine |
| --- | --- | --- |
| FastAPI | React | YAML-based Rules |
| Pydantic | Vite | Indicators |
| PyYAML | TypeScript | Checklists |
| Uvicorn | Framer Motion | References |

---

## Project Structure

```text
AttackLens/
├── backend/
├── frontend/
├── examples/
├── docs/
└── README.md
```

---

## Getting Started

Clone the repository

```bash
git clone https://github.com/sohamgodbole28/AttackLens.git
cd AttackLens
```

### Backend

```bash
cd backend

pip install -r requirements.txt

uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend

npm install

npm run dev
```

---

## Why AttackLens?

AttackLens does not attempt to automatically exploit vulnerabilities.

Instead, it assists penetration testers by identifying suspicious request characteristics, highlighting relevant evidence, evaluating security rules, and suggesting what to investigate next.

Its goal is to augment manual security testing rather than replace analyst judgment.

---

## Disclaimer

AttackLens is an educational and defensive security tool.

It is intended to assist with authorized security assessments, learning, and penetration testing. Users are responsible for ensuring they have appropriate authorization before testing any systems.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built and maintained by Soham Godbole

If AttackLens helped you, consider giving the repository a ⭐.

</div>
