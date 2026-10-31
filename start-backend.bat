@echo off
title SunPower Backend Server (FastAPI)
cd /d "%~dp0backend"
echo ===================================================
echo Starting FastAPI Backend Server on http://127.0.0.1:8000
echo ===================================================
.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause

