"""FastAPI application for AttackLens."""

import logging
import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.config import settings
from app.loader.registry import registry
from app.loader.yaml_loader import load_knowledge_base
from app.exceptions import AttackLensError
from app.api.analyze import router as analyze_router
from app.api.knowledge import router as knowledge_router

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)

logger = logging.getLogger("attacklens")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    logger.info("Starting AttackLens Application...")
    
    try:
        load_knowledge_base(settings.KNOWLEDGE_PATH)
        logger.info(f"Loaded {len(registry.indicators)} indicators.")
        logger.info(f"Loaded {len(registry.rules)} rules.")
        logger.info(f"Loaded {len(registry.vulnerabilities)} vulnerabilities.")
        logger.info(f"Loaded {len(registry.checklists)} checklists.")
        logger.info(f"Loaded {len(registry.references)} references.")
    except AttackLensError as e:
        logger.error(f"Failed to start AttackLens: {e}")
        raise
        
    yield
    
    logger.info("Shutting down AttackLens Application...")

app = FastAPI(
    title="AttackLens",
    description="Knowledge-driven security reasoning engine",
    version="1.0.0",
    lifespan=lifespan
)

app.include_router(analyze_router)
app.include_router(knowledge_router)

origins = ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173"]

# Intended for the production deployment
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HealthResponse(BaseModel):
    status: str

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}
