@echo off
title AttackLens Startup
echo ===================================================
echo Starting AttackLens...
echo ===================================================

echo [1/2] Starting Backend Server...
start "AttackLens Backend" cmd /k "cd /d %~dp0backend && .\venv\Scripts\uvicorn.exe app.main:app --reload --host 127.0.0.1 --port 8000"

echo [2/2] Starting Frontend Server...
start "AttackLens Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo AttackLens has been successfully started in separate windows!
echo The backend is running on http://127.0.0.1:8000
echo The frontend will be available at http://localhost:5173
echo.
echo To shut down AttackLens, simply close the new terminal windows.
pause
