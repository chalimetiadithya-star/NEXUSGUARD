from app.api.auth_routes import router as auth_router
from app.api.research_routes import router as research_router
from app.api.document_routes import router as document_router
from app.api.admin_routes import router as admin_router

__all__ = [
    "auth_router",
    "research_router",
    "document_router",
    "admin_router"
]
