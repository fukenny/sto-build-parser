@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 22 or newer from https://nodejs.org, then reopen this launcher.
  pause
  exit /b 1
)
echo STO Build Parser - open http://127.0.0.1:4317 in your browser.
echo Keep this window open. Press Ctrl+C to stop.
node server.mjs
pause
