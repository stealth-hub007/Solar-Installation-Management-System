@echo off
title SunPower Solutions Platform Launcher
echo ===================================================
echo Launching SunPower Solutions (Backend + Frontend)
echo ===================================================

start "SunPower Backend (FastAPI)" cmd /k "cd /d ""%~dp0backend"" && .venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
start "SunPower Frontend (React + Vite)" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"

echo.
echo Both servers have been launched in separate console windows:
echo - Frontend:    http://localhost:3000
echo - Backend API: http://127.0.0.1:8000
echo - Swagger Docs: http://127.0.0.1:8000/docs
echo ===================================================
timeout /t 5

