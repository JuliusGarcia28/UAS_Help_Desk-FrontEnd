/**
 * Genera las imágenes base para iconos y splash de la app móvil a partir del logo.
 * Uso: node scripts/make-mobile-assets.mjs && npx capacitor-assets generate
 *
 * Salida en assets/ (formato que espera @capacitor/assets).
 */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const NAVY = '#0B2545';
const NAVY_DARK = '#0B1220';
const LOGO = 'public/img/Help_Desk_Logo_White.png';

mkdirSync('assets', { recursive: true });

const canvas = (size, background) =>
  sharp({ create: { width: size, height: size, channels: 4, background } });

const logo = (size) => sharp(LOGO).resize(size, size, { fit: 'contain' }).png().toBuffer();

// Icono adaptativo de Android: el primer plano debe quedar dentro de la zona segura (~66 %).
const fg = await logo(560);
await canvas(1024, { r: 0, g: 0, b: 0, alpha: 0 })
  .composite([{ input: fg, gravity: 'center' }])
  .png().toFile('assets/icon-foreground.png');

await canvas(1024, NAVY).png().toFile('assets/icon-background.png');

// Icono "plano" (iOS y Android antiguos)
const flat = await logo(680);
await canvas(1024, NAVY)
  .composite([{ input: flat, gravity: 'center' }])
  .png().toFile('assets/icon-only.png');

// Splash claro y oscuro
const splashLogo = await logo(720);
await canvas(2732, NAVY)
  .composite([{ input: splashLogo, gravity: 'center' }])
  .png().toFile('assets/splash.png');

await canvas(2732, NAVY_DARK)
  .composite([{ input: splashLogo, gravity: 'center' }])
  .png().toFile('assets/splash-dark.png');

console.log('Imágenes base generadas en assets/');
