@echo off
setlocal
cd /d "%~dp0"
if not defined ANDROID_HOME (
  echo ANDROID_HOME is not set. Restart Command Prompt after setting up Android Studio.
  pause
  exit /b 1
)

rem Gradle 8.14 / Android tooling must run on Java 17-21, not a newer Java.
rem Prefer the JDK 21 installed by Android Studio/Adoptium, even if the system
rem JAVA_HOME currently points at Java 25 or later.
for /d %%D in ("C:\Program Files\Eclipse Adoptium\jdk-21*") do set "JAVA_HOME=%%~fD"
if not exist "%JAVA_HOME%\bin\java.exe" (
  echo JDK 21 was not found. Install JDK 21, then run this file again.
  pause
  exit /b 1
)
set "PATH=%JAVA_HOME%\bin;%PATH%"

rem A daemon created by a previous Java version can otherwise be reused.
if exist "src-tauri\gen\android\gradlew.bat" call "src-tauri\gen\android\gradlew.bat" --stop
call npx.cmd tauri android build --debug
if errorlevel 1 (
  echo APK build failed. Keep this window open and share the final output with nont support.
  pause
  exit /b 1
)
echo.
echo APK built. Look in src-tauri\gen\android\app\build\outputs\apk\universal\debug\
pause
endlocal
