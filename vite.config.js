import { defineConfig } from 'vite';

// Adresse der Seite für canonical, Open Graph und strukturierte Daten.
// Reihenfolge: eigene Angabe (SITE_URL) > Produktionsadresse von Vercel > lokale Entwicklung.
const siteUrl = (
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:5173')
).replace(/\/$/, '');

export default defineConfig({
  // Relative Pfade: die Seite läuft so auch in einem Unterordner
  base: './',
  plugins: [
    {
      name: 'site-url',
      transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', siteUrl),
    },
  ],
  build: {
    target: 'es2020',
    // Three.js liegt in einem eigenen, nachgeladenen Paket und ist bewusst grösser als der Rest
    chunkSizeWarningLimit: 700,
  },
});
