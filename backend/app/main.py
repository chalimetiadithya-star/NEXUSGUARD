from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.api import auth_router, research_router, document_router, admin_router
from app.seed import seed_database
from app.models.user import User

# Initialize database schema
Base.metadata.create_all(bind=engine)

def ensure_database_seeded():
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
