@echo off
rem ============================================================
rem  Compila el APK de Android.
rem  Uso:  scripts\build-apk.bat debug     (pruebas)
rem        scripts\build-apk.bat release   (distribucion, requiere keystore.properties)
rem ============================================================
setlocal

set "MODE=%~1"
if "%MODE%"=="" set "MODE=debug"

set "JAVA_HOME=C:\Program Files\Java\jdk-21.0.12.1"
set "ANDROID_HOME=D:\Android\sdk"
set "ANDROID_SDK_ROOT=%ANDROID_HOME%"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%PATH%"

rem Se ejecuta desde la raiz del frontend, sin importar desde donde se llame.
cd /d "%~dp0.."

if not exist "%ANDROID_HOME%\platforms\android-36" (
  echo Falta la plataforma android-36. Ejecuta primero scripts\setup-android-sdk.bat
  exit /b 1
)

echo === Compilando web (Angular, modo movil) y sincronizando con Android ===
call npm run cap:sync || exit /b 1

echo === Compilando APK (%MODE%) ===
cd android
if /I "%MODE%"=="release" (
  call gradlew.bat assembleRelease || exit /b 1
  echo.
  echo APK: android\app\build\outputs\apk\release\
) else (
  call gradlew.bat assembleDebug || exit /b 1
  echo.
  echo APK: android\app\build\outputs\apk\debug\app-debug.apk
)
endlocal
