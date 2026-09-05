@echo off
cd /d "%~dp0"
where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed or is not on PATH.
  echo Install the current LTS version from https://nodejs.org then run this file again.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Installing project dependencies...
  call npm.cmd install
  if errorlevel 1 (
    echo Installation failed.
    pause
    exit /b 1
  )
)
echo Starting nont preview...
call npm.cmd run dev
pause
