<div align="center">

# AttackLens

### Rule-Based Web Application Security Analysis Engine

**Know the Weakness. Find the Path.**

Analyze HTTP requests, identify potential vulnerability classes, and receive actionable penetration testing guidance through an interactive security analysis engine.

[Live Demo](https://attack-lens.vercel.app) • [Documentation](#features) • [Report Issues](https://github.com/sohamgodbole28/AttackLens/issues)

---

</div>

## Overview

AttackLens is a rule-based web application security analysis platform built to assist penetration testers, bug bounty hunters, security researchers, and students in identifying **potential vulnerability classes** from HTTP requests.

Rather than attempting to exploit applications automatically, AttackLens analyzes request characteristics, detects security indicators, evaluates weighted rules, and recommends **what to test next**.

It acts as an intelligent assistant that bridges the gap between raw HTTP traffic and manual security testing.

---

## Features

- HTTP Request Analysis
- Structured JSON Request Analysis
- Rule-Based Vulnerability Detection
- YAML-Driven Knowledge Base
- Interactive Request Highlighting
- Expandable Detection Evidence
- Weighted Rule Engine
- Actionable Testing Checklists
- Curated Security References
- Modern Responsive Interface
- Production-Ready FastAPI Backend
- React + Vite Frontend

---

## Supported Detection Categories

Current detection capabilities include:

- Broken Access Control (BAC)
- Insecure Direct Object Reference (IDOR)
- File Upload Testing
- Authentication Indicators
- Object Identifier Detection
- Privileged Endpoint Detection
- Role Parameter Detection
- Multipart Request Detection

AttackLens is designed with a modular knowledge base, making it straightforward to extend with additional vulnerability classes in future releases.

---

## Architecture

```
                HTTP Request / JSON
                         │
                         ▼
                  Request Parser
                         │
                         ▼
               Indicator Detection Engine
                         │
                         ▼
                 Weighted Rule Engine
                         │
            ┌────────────┴────────────┐
            ▼                         ▼
     Recommendations            Risk Scoring
            │                         │
            └────────────┬────────────┘
                         ▼
              Checklist & References
                         │
                         ▼
                  Interactive Frontend
```

---

## Technology Stack

### Backend

- FastAPI
- Pydantic
- PyYAML
- Uvicorn

### Frontend

- React
- Vite
- TypeScript
- Framer Motion

### Knowledge Engine

- YAML-based Rules
- Indicators
- Checklists
- References

---

## Project Structure

```
AttackLens/

├── backend/
│   ├── app/
│   ├── knowledge/
│   └── requirements.txt
│
├── frontend/
│
├── examples/
│
└── docs/
```

---

## Example Workflow

```
Raw HTTP Request

        │

        ▼

Request Parsing

        │

        ▼

Indicator Detection

        │

        ▼

Rule Evaluation

        │

        ▼

Recommendations

        │

        ▼

Testing Checklist

        │

        ▼

Security References
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

Most security tools focus on finding vulnerabilities automatically.

AttackLens focuses on helping the tester think.

Instead of replacing manual testing, it assists by:

- Highlighting suspicious request characteristics
- Suggesting relevant vulnerability classes
- Providing structured testing guidance
- Reducing repetitive analysis during reconnaissance

AttackLens is intended to accelerate manual security assessments while keeping the tester in control of the decision-making process.

---

## Roadmap

### Version 1.0

- Rule Engine
- YAML Knowledge Base
- Interactive UI
- Request Highlighting
- Checklist Engine
- References Engine
- Production Deployment

### Planned

- SQL Injection Knowledge Pack
- SSRF Detection
- JWT Analysis
- XXE Detection
- SSTI Rules
- GraphQL Support
- Exportable Reports
- Burp Suite Extension
- CLI Support

---

## Disclaimer

AttackLens is an educational and defensive security tool.

It is intended to assist with authorized security assessments, learning, and penetration testing. Users are responsible for ensuring they have appropriate authorization before testing any systems.

---

## License

MIT License

---

<div align="center">

Built with ❤️ by Soham Godbole

If you found AttackLens useful, consider giving the repository a ⭐.

</div>
