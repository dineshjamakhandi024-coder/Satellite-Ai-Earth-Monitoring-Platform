@echo off
title Satellite Platform - Mobile Access Server
cd /d "%~dp0"

echo ======================================================================
echo    🛰  SATELLITE AI - MOBILE ACCESS LAUNCHER
echo ======================================================================
echo.
echo Starting Mobile Web Server & Generating QR Code...
echo.

:: Open the QR helper screen in browser
start "" "%~dp0mobile_access.html"

:: Run the mobile server
python start_mobile_server.py

pause
