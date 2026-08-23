@echo off
title Launch Satellite Platform
cd /d "%~dp0"

echo ======================================================================
echo    🛰  SATELLITE AI - EARTH OBSERVATION PLATFORM LAUNCHER
echo ======================================================================
echo.

echo [1/3] Opening workspace in Visual Studio Code...
start "" code "%~dp0"

echo [2/3] Starting Satellite AI Python Backend Server (FastAPI on :8000)...
start "Satellite AI Backend Server" cmd /k "cd /d ""%~dp0Backend of satelite platform"" && python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"

echo [3/3] Opening Satellite Platform in Browser...
timeout /t 2 /nobreak >nul
start "" "%~dp0index.html"

echo.
echo ======================================================================
echo  All components launched successfully!
echo  - Workspace: Opened in VS Code
echo  - Backend API: http://127.0.0.1:8000
echo  - API Docs:    http://127.0.0.1:8000/docs
echo  - Frontend:    %~dp0index.html
echo ======================================================================
echo.
timeout /t 5
exit
