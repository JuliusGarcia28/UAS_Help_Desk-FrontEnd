@echo off
rem ============================================================
rem  Prepara el SDK de Android para compilar el APK (se ejecuta UNA vez).
rem  - Usa D:\Android\sdk (cmdline-tools + platform-tools ya existentes)
rem  - Instala la plataforma y las build-tools que exige el proyecto
rem  Las licencias del SDK las aceptas tu cuando sdkmanager las muestre.
rem ============================================================
setlocal

set "JAVA_HOME=C:\Program Files\Java\jdk-21.0.12.1"
set "ANDROID_HOME=D:\Android\sdk"
set "PATH=%JAVA_HOME%\bin;%PATH%"

rem cmdline-tools no tiene la carpeta "latest", por eso se indica --sdk_root.
set "SDKMANAGER=%ANDROID_HOME%\cmdline-tools\bin\sdkmanager.bat"

if not exist "%SDKMANAGER%" (
  echo No se encontro %SDKMANAGER%
  exit /b 1
)

echo.
echo === 1/2  Aceptar licencias (responde "y" a cada una) ===
call "%SDKMANAGER%" --sdk_root=%ANDROID_HOME% --licenses

echo.
echo === 2/2  Instalar plataforma y build-tools ===
call "%SDKMANAGER%" --sdk_root=%ANDROID_HOME% "platforms;android-36" "build-tools;36.0.0"

echo.
echo Contenido del SDK:
dir /b "%ANDROID_HOME%"
echo.
echo Listo. Ahora ejecuta:  scripts\build-apk.bat debug
endlocal
