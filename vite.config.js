import { defineConfig } from 'vite';

// Adresse der Seite für canonical, Open Graph und strukturierte Daten.
// Reihenfolge: eigene Angabe (SITE_URL) > feste Produktionsadresse auf Vercel > lokale Entwicklung.
// Auch Vorschau-Deployments verweisen so auf die Hauptadresse, damit Suchmaschinen nur eine Seite kennen.
const PRODUCTION_URL = 'https://fabianlocher.vercel.app';
const siteUrl = (process.env.SITE_URL || (process.env.VERCEL ? PRODUCTION_URL : 'http://localhost:5173')).replace(/\/$/, '');

export default defineConfig({
  // Relative Pfade: die Seite läuft so auch in einem Unterordner
  base: './',
  plugins: [
    {
      name: 'site-url',
      transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', siteUrl),
    },
    {
      // Messung im Betrieb, nur auf der Produktionsadresse: Vercel Web Analytics (ohne Cookies)
      // und Speed Insights (echte Ladezeiten). Beide Skripte kommen von der eigenen Adresse, die CSP bleibt streng.
      name: 'vercel-insights',
      transformIndexHtml: () => (process.env.VERCEL_ENV === 'production'
        ? [
            { tag: 'script', attrs: { defer: true, src: '/_vercel/insights/script.js' }, injectTo: 'body' },
            { tag: 'script', attrs: { defer: true, src: '/_vercel/speed-insights/script.js' }, injectTo: 'body' },
          ]
        : []),
    },
  ],
  build: {
    target: 'es2020',
    // Three.js liegt in einem eigenen, nachgeladenen Paket und ist bewusst grösser als der Rest
    chunkSizeWarningLimit: 700,
  },
});
