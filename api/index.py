import os
import sys
from pathlib import Path

# Add project root and current dir to sys.path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

api_dir = Path(__file__).resolve().parent
if str(api_dir) not in sys.path:
    sys.path.insert(0, str(api_dir))

# Ensure VERCEL environment variable is active for serverless path handling
if "VERCEL" not in os.environ and ("AWS_LAMBDA_FUNCTION_NAME" in os.environ or "NOW_REGION" in os.environ):
    os.environ["VERCEL"] = "1"

try:
    from app.main import app, ensure_database_seeded
    ensure_database_seeded()
except Exception as exc:
    import traceback
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse

    app = FastAPI(title="AccessLens Startup Diagnostic")
    _err = traceback.format_exc()

    @app.get("/{full_path:path}")
    def startup_fallback(full_path: str):
        return JSONResponse(
            status_code=500,
            content={
                "error": "Initialization error on Vercel Serverless Function",
                "exception": str(exc),
                "traceback": _err,
                "sys_path": sys.path
            }
        )

