import os
import sys
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure root directory is on sys.path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

api_dir = Path(__file__).resolve().parent
if str(api_dir) not in sys.path:
    sys.path.insert(0, str(api_dir))

# Explicit top-level FastAPI instance for Vercel Python runtime AST detection
app = FastAPI(
    title="AccessLens - Secure Enterprise Research Agent",
    description="Enterprise research assistant with deterministic pre-LLM authorization gate.",
    version="1.0.0"
)

# CORS middleware for Vercel
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.config import settings
from app.api import auth_router, research_router, document_router, admin_router
from app.main import ensure_database_seeded

# Auto-seed database in /tmp for serverless environment
try:
    ensure_database_seeded()
except Exception:
    pass

# Include routers without prefix
app.include_router(auth_router)
app.include_router(research_router)
app.include_router(document_router)
app.include_router(admin_router)

# Include routers with /api prefix
app.include_router(auth_router, prefix="/api")
app.include_router(research_router, prefix="/api")
app.include_router(document_router, prefix="/api")
app.include_router(admin_router, prefix="/api")

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "company": settings.COMPANY_NAME,
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "llm_provider": settings.LLM_PROVIDER
    }

@app.get("/")
@app.get("/api")
def root_api():
    return {
        "status": "online",
        "service": "AccessLens Secure Enterprise Research Agent API",
        "version": settings.VERSION,
        "company": settings.COMPANY_NAME
    }
