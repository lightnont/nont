@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

if not defined ANDROID_HOME (
  echo ANDROID_HOME is not set. Restart Command Prompt after setting up Android Studio.
  pause
  exit /b 1
)

for /d %%D in ("C:\Program Files\Eclipse Adoptium\jdk-21*") do set "JAVA_HOME=%%~fD"
if not exist "%JAVA_HOME%\bin\keytool.exe" (
  echo JDK 21 was not found. Install JDK 21, then run this file again.
  pause
  exit /b 1
)
set "PATH=%JAVA_HOME%\bin;%PATH%"

set "NONT_KEYSTORE=src-tauri\gen\android\nont-light.jks"
set "NONT_PROPERTIES=src-tauri\gen\android\keystore.properties"
if not exist "%NONT_KEYSTORE%" (
  echo Creating the private nont signing certificate for light.
  echo Use a strong password with letters and numbers only, then store it safely.
  set /p "NONT_KEY_PASSWORD=Signing-key password: "
  if "!NONT_KEY_PASSWORD!"=="" (
    echo No password entered. Nothing was created.
    pause
    exit /b 1
  )
  "%JAVA_HOME%\bin\keytool.exe" -genkeypair -v -keystore "%NONT_KEYSTORE%" -storetype PKCS12 -alias light -keyalg RSA -keysize 2048 -validity 10000 -storepass "!NONT_KEY_PASSWORD!" -keypass "!NONT_KEY_PASSWORD!" -dname "CN=light, OU=nont, O=light, L=Zurich, S=Zurich, C=CH"
  if errorlevel 1 (
    echo Certificate creation failed.
    pause
    exit /b 1
  )
  > "%NONT_PROPERTIES%" echo keyAlias=light
  >> "%NONT_PROPERTIES%" echo keyPassword=!NONT_KEY_PASSWORD!
  >> "%NONT_PROPERTIES%" echo storePassword=!NONT_KEY_PASSWORD!
  >> "%NONT_PROPERTIES%" echo storeFile=nont-light.jks
)

if exist "src-tauri\gen\android\gradlew.bat" call "src-tauri\gen\android\gradlew.bat" --stop
call npx.cmd tauri android build
if errorlevel 1 (
  echo Signed APK build failed. Keep this window open and share the final output with nont support.
  pause
  exit /b 1
)
echo.
echo Signed APK built. Look in src-tauri\gen\android\app\build\outputs\apk\universal\release\
echo Back up nont-light.jks and keystore.properties privately. Never publish either file.
pause
endlocal
