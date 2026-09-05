@echo off
setlocal
cd /d "%~dp0"
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat"
set "RUSTUP_HOME=%USERPROFILE%\.rustup"
set "CARGO_HOME=%USERPROFILE%\.cargo"
call npx.cmd tauri build
endlocal
