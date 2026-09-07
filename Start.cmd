@echo off
setlocal
cd /d "%~dp0"
set "stoNode="
for /f "delims=" %%N in ('where node.exe 2^>nul') do if not defined stoNode set "stoNode=%%N"
if not defined stoNode if exist "%ProgramFiles%\nodejs\node.exe" set "stoNode=%ProgramFiles%\nodejs\node.exe"
if not defined stoNode if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" set "stoNode=%LOCALAPPDATA%\Programs\nodejs\node.exe"
if not defined stoNode if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" set "stoNode=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not defined stoNode (
  echo Node.js was not found on PATH or in the supported installation folders.
  echo Install Node.js 22 or newer from https://nodejs.org and reopen this launcher.
  if "%~1"=="--check-runtime" exit /b 1
  pause
  exit /b 1
)
"%stoNode%" -e "process.exit(Number(process.versions.node.split('.')[0]) >= 22 ? 0 : 1)"
if errorlevel 1 (
  echo The detected Node runtime must be version 22 or newer.
  if "%~1"=="--check-runtime" exit /b 1
  pause
  exit /b 1
)
echo Using Node: %stoNode%
if "%~1"=="--check-runtime" exit /b 0
if not exist "%~dp0server.mjs" (
  echo Extract the complete ZIP into a folder before running Start.cmd.
  pause
  exit /b 1
)
echo STO Build Parser - open http://127.0.0.1:4317 in your browser.
"%stoNode%" -e "const http=require('node:http');const r=http.get('http://127.0.0.1:4317',s=>{let b='';s.on('data',d=>b+=d);s.on('end',()=>process.exit(b.includes('<title>STO Build Parser</title>')?10:0));});r.setTimeout(1500,()=>{r.destroy();process.exit(0)});r.on('error',()=>process.exit(0));"
if errorlevel 10 (
  echo The app is already running. Opening it in your default browser.
  start "" "http://127.0.0.1:4317"
  exit /b 0
)
echo Keep this window open. Press Ctrl+C to stop.
"%stoNode%" server.mjs
pause
