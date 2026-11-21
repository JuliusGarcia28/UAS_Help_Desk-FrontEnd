# App móvil (Ionic / Capacitor)

El mismo frontend Angular se empaqueta para Android e iOS con
[Capacitor](https://capacitorjs.com), el runtime nativo de Ionic.
No hay una base de código separada: cualquier cambio en `src/` llega a la app
al volver a sincronizar.

| Archivo / carpeta          | Qué es                                                        |
|----------------------------|---------------------------------------------------------------|
| `capacitor.config.ts`      | Id de la app (`mx.uas.helpdesk`), nombre y plugins            |
| `android/`, `ios/`         | Proyectos nativos generados (se versionan)                    |
| `assets/`                  | Imágenes base del icono y splash                              |
| `src/app/core/services/native.service.ts` | Botón atrás, barra de estado, guardar/compartir archivos |

## Requisitos

- **Android:** [Android Studio](https://developer.android.com/studio) (incluye JDK y SDK).
- **iOS:** una Mac con Xcode. No se puede compilar iOS desde Windows.

## Comandos

```bash
npm run build:mobile   # compila Angular para móvil (base href "/", salida en dist/mobile)
npm run cap:sync       # compila y copia la web + plugins a android/ e ios/
npm run android        # sincroniza y abre el proyecto en Android Studio
npm run ios            # sincroniza y abre el proyecto en Xcode (solo macOS)
npm run mobile:assets  # regenera iconos y splash a partir del logo
```

El build de escritorio/Electron (`npm run build` → `dist/Help_Desk_Frontend`) no cambia.

## Generar el APK de Android (solo con el SDK, sin Android Studio)

Configuración de este equipo: SDK en `D:\Android\sdk` (con `cmdline-tools` y
`platform-tools`) y JDK 21 en `C:\Program Files\Java\jdk-21.0.12.1`.
Si cambian esas rutas, editar `scripts\setup-android-sdk.bat`,
`scripts\build-apk.bat` y `android\local.properties`.

### 1. Preparar el SDK (una sola vez)

```bat
npm run sdk:setup
```

Acepta las licencias (responder `y`) e instala `platforms;android-36` y
`build-tools;36.0.0`. Nota: `cmdline-tools` no tiene la carpeta `latest`, por
eso el script llama a `sdkmanager` con `--sdk_root=D:\Android\sdk`.

`android/local.properties` ya apunta al SDK y no se versiona. En ese formato la
barra invertida se duplica: `sdk.dir=D\:\\Android\\sdk`.

### 2. Compilar

```bat
npm run apk:debug
```

El script fija `JAVA_HOME` (JDK 21) y `ANDROID_HOME`, compila Angular en modo
móvil, sincroniza con Capacitor y ejecuta Gradle. Resultado:
`android/app/build/outputs/apk/debug/app-debug.apk`.

Instalar: copiar el APK al teléfono (permitir "orígenes desconocidos") o, con el
teléfono por USB y *Depuración USB* activada,
`D:\Android\sdk\platform-tools\adb install -r android\app\build\outputs\apk\debug\app-debug.apk`.

La primera compilación tarda varios minutos: Gradle descarga sus dependencias.

### 3. APK de release (para distribuir)

1. Crear la clave de firma una sola vez y **guardarla en un lugar seguro**
   (sin ella no se pueden publicar actualizaciones de la app):

   ```bat
   cd android
   keytool -genkeypair -v -keystore helpdesk-release.jks -alias helpdesk -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Copiar `android/keystore.properties.example` como `android/keystore.properties`
   y poner las contraseñas. Ese archivo y el `.jks` están en `.gitignore`.
3. `npm run apk:release` → `android/app/build/outputs/apk/release/app-release.apk`.

Antes de cada versión nueva, subir `versionCode` (y `versionName`) en
`android/app/build.gradle`.

### Con Android Studio (alternativa)

`npm run android` abre el proyecto; luego **Build ▸ Build APK(s)**.

## Backend

Las peticiones HTTP salen por la capa nativa (`CapacitorHttp`), así que no
dependen de CORS y la cookie HttpOnly del refresh token se guarda en el
almacén nativo. Aun así conviene verificar el inicio de sesión y la renovación
de sesión en un dispositivo real, porque dependen de cómo el backend emite la
cookie (`Secure`, `SameSite`, dominio).
