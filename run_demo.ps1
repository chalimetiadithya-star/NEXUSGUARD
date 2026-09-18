Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "AccessLens - Secure Enterprise Research Agent" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan

Write-Host "Seeding database..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot"
python -m app.seed

Write-Host "Starting Backend on http://127.0.0.1:8000 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

Write-Host "Starting Frontend on http://localhost:5173 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; cmd.exe /c npm run dev"

Write-Host "AccessLens is running!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend API: http://127.0.0.1:8000/docs" -ForegroundColor Cyan
