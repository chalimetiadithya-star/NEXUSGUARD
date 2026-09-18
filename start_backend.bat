@echo off
echo ==========================================
echo Starting AccessLens Backend (FastAPI)
echo ==========================================
python -m app.seed
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
