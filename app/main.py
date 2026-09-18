import os
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.api import auth_router, research_router, document_router, admin_router
from app.seed import seed_database
from app.models.user import User

# Initialize database schema safely
try:
    Base.metadata.create_all(bind=engine)
except Exception:
    pass

def ensure_database_seeded():
    try:
        db = SessionLocal()
        try:
            # Check if users table has records
            if db.query(User).count() == 0:
                seed_database(db)
        except Exception:
            try:
                Base.metadata.create_all(bind=engine)
                seed_database(db)
            except Exception:
                pass
        finally:
            db.close()
    except Exception:
        pass

# Auto-seed on load (for Vercel serverless functions)
ensure_database_seeded()

@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_database_seeded()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Enterprise research assistant with deterministic pre-LLM authorization gate.",
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS middleware for React frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers at root (for local standalone backend and pytest)
app.include_router(auth_router)
app.include_router(research_router)
app.include_router(document_router)
app.include_router(admin_router)

# Also include API Routers with /api prefix (for Vercel unified deployment)
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

# -------------------------------------------------------------
# Static Frontend Serving (Enables seamless single-deployment on Vercel)
# -------------------------------------------------------------
def get_dist_dir():
    possible_paths = [
        Path(__file__).resolve().parent.parent / "dist",
        Path.cwd() / "dist",
        Path("/var/task/dist"),
    ]
    for p in possible_paths:
        if (p / "index.html").is_file():
            return p
    return None

dist_dir = get_dist_dir()
if dist_dir and (dist_dir / "assets").is_dir():
    app.mount("/assets", StaticFiles(directory=str(dist_dir / "assets")), name="assets")

@app.get("/")
async def serve_index():
    current_dist = get_dist_dir()
    if current_dist and (current_dist / "index.html").is_file():
        return FileResponse(current_dist / "index.html")
    return HTMLResponse("<h1>AccessLens Backend Active</h1><p>Frontend assets are ready.</p>")

@app.get("/favicon.svg")
async def serve_favicon():
    current_dist = get_dist_dir()
    if current_dist and (current_dist / "favicon.svg").is_file():
        return FileResponse(current_dist / "favicon.svg")
    return HTMLResponse("")

@app.get("/{full_path:path}")
async def catch_all_spa(full_path: str):
    # If it is an API route that was not found, return 404
    for prefix in ["api", "auth", "research", "documents", "admin", "conversations", "docs", "openapi.json"]:
        if full_path == prefix or full_path.startswith(f"{prefix}/"):
            raise HTTPException(status_code=404, detail="Not Found")

    current_dist = get_dist_dir()
    if current_dist:
        file_target = current_dist / full_path
        if file_target.is_file():
            return FileResponse(file_target)
        index_target = current_dist / "index.html"
        if index_target.is_file():
            return FileResponse(index_target)

    return HTMLResponse("<h1>AccessLens Prototype</h1>")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
