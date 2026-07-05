# AttackLens Backend

This is the backend for AttackLens, a knowledge-driven security reasoning engine.

## Folder Structure

- `app/` - The main application code
  - `api/` - API endpoints
  - `config.py` - Application configuration
  - `engine/` - Rules engine (to be implemented)
  - `exceptions.py` - Custom exceptions
  - `knowledge/` - Knowledge registry
  - `loader/` - YAML knowledge loader
  - `main.py` - FastAPI application entrypoint
  - `models/` - Pydantic models for knowledge base
  - `parser/` - HTTP request parser (to be implemented)
- `tests/` - Pytest unit tests

## How to Install

```bash
cd backend
python -m venv venv
# Activate the virtual environment based on your OS
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate
pip install -r requirements.txt
```

## How to Run

```bash
uvicorn app.main:app --reload
```

## How to Execute Tests

```bash
pytest
```

## Production Deployment

When deploying AttackLens to production, you must set the `FRONTEND_URL` environment variable to match the public URL of your deployed frontend application. This ensures that the backend CORS configuration correctly accepts incoming requests from the production application while still allowing local development requests.

Example:
```bash
export FRONTEND_URL="https://attacklens-app.vercel.app"
```
