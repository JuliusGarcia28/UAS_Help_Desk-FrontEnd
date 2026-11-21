import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Empaquetado móvil (Android / iOS) con Capacitor, el runtime nativo de Ionic.
 *
 * La app web se compila con `npm run build:mobile` (base href "/", salida en dist/mobile)
 * y Capacitor copia el resultado de `webDir` a los proyectos nativos.
 */
const config: CapacitorConfig = {
  appId: 'mx.uas.helpdesk',
  appName: 'HelpDesk',
  // Carpeta propia para no mezclarse con el build de Electron (dist/Help_Desk_Frontend).
  webDir: 'dist/mobile/browser',

  android: {
    // La API se consume solo por HTTPS.
    allowMixedContent: false
  },

  plugins: {
    /**
     * Las peticiones HTTP (XHR/fetch, incluido HttpClient de Angular) salen por
     * la capa nativa: evita CORS y guarda la cookie HttpOnly del refresh token
     * en el almacén nativo, igual que hace el navegador en la versión web.
     */
    CapacitorHttp: {
      enabled: true
    },

    CapacitorCookies: {
      enabled: true
    },

    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0B2545'
    }
  }
};

export default config;
