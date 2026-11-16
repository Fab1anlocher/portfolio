# Portfolio Fabian Locher

Persönliche Website mit Lebenslauf, Projekten und Kontakt. Der Einstieg ist ein begehbares 3D-Arbeitszimmer, darunter steht derselbe Inhalt als normaler Lebenslauf.

## Konzept

Die Szene folgt einer einzigen Regel, damit nichts doppelt vorkommt:

- **Am Computer steht der Beruf.** Ein Klick auf den Monitor startet eine bedienbare Oberfläche mit Über mich, Lebenslauf, Projekten, Skills, Kontakt und einem Terminal.
- **Das Zimmer erzählt das Private.** Fernseher (Sport und Gaming), Fotowand (Reisen), Fenster (Burgdorf), dazu ein paar kleine Details.

Ohne WebGL, ohne JavaScript oder bei einem Ladefehler bleibt die Seite ein vollständiger Lebenslauf mit Kopfzeile.

## Technik

- [Vite](https://vite.dev) als Build-Werkzeug, reines HTML, CSS und JavaScript ohne Framework
- [Three.js](https://threejs.org) für die Szene, erst nach dem ersten Bildaufbau nachgeladen
- Schriften Instrument Sans und JetBrains Mono liegen im Projekt (Fontsource), es werden keine fremden Server angefragt
- Helles und dunkles Farbschema für den Lebenslauf, Druckansicht ohne Szene
- Rücksicht auf «Bewegung reduzieren»; die Szene pausiert ausserhalb des Bildes und im Hintergrund-Tab

## Struktur

```
index.html              Alle Texte des Lebenslaufs (einzige Textquelle)
src/
  main.js               Kamera, Gegenstände, Bildlegenden, Start der Szene
  os.js                 Computer: Fenster, Startmenü, Terminal
  tv.js                 Fernseher: fünf live gezeichnete Programme, Field-Goal-Spiel
  scene/room.js         Das Zimmer (Möbel, Fenster, Fotowand)
  scene/three.js        Die verwendeten Teile von Three.js
  styles/style.css      Gestaltung
  assets/poster.jpg     Standbild während des Ladens
public/
  photos/               Bilder der Fotowand
  og-image.jpg          Vorschaubild für geteilte Links
  favicon.svg, robots.txt, 404.html
vercel.json             Cache- und Sicherheits-Header
vite.config.js          Build-Einstellungen, Adresse der Seite
```

## Lokal entwickeln

Voraussetzung ist Node.js 20 oder neuer.

```bash
npm install
npm run dev        # Entwicklungsserver mit automatischem Neuladen
npm run build      # Produktions-Build nach dist/
npm run preview    # den Build lokal ansehen
```

## Inhalte ändern

| Was | Wo |
| --- | --- |
| Lebenslauf, Projekte, Skills, Kontakt | `index.html`, Bereich `<main class="cv">` |
| Programme am Computer, Terminal-Befehle | `src/os.js` (`APPS`, `buildTerminal`) |
| Texte der Fernsehprogramme | `src/tv.js` (`CHANNELS`) |
| Bildlegenden, Satz pro Foto, Beschriftungen im Raum | `src/main.js` (`CAPTIONS`, `PHOTO_TEXT`, `LABELS`, `HOT`) |
| Fotos | `public/photos/` (gleiche Dateinamen, Hochformat 3:4, `neapel.jpg` im Querformat 3:2) |

Die Fenster am Computer zeigen Kopien der Abschnitte aus `index.html`. Ein Text muss also nur an einer Stelle geändert werden.

## Veröffentlichen

### GitHub

```bash
git init
git add -A
git commit -m "Portfolio"
git branch -M main
git remote add origin https://github.com/<benutzer>/<repository>.git
git push -u origin main
```

Bei jedem Push prüft eine GitHub Action (`.github/workflows/build.yml`), ob der Build durchläuft.

### Vercel

1. Auf [vercel.com](https://vercel.com) «Add New Project» wählen und das GitHub-Repository importieren.
2. Die Einstellungen werden erkannt (Vite, Build `npm run build`, Ausgabe `dist`). Nichts anpassen, «Deploy» klicken.
3. Jeder weitere Push auf `main` veröffentlicht automatisch, jeder Pull Request bekommt eine eigene Vorschau.

Die Adresse für `canonical`, Open Graph und die strukturierten Daten setzt der Build selbst aus der Produktionsadresse des Vercel-Projekts. Bei einer eigenen Domain in Vercel unter «Environment Variables» `SITE_URL` setzen, zum Beispiel `https://www.example.ch`.

`vercel.json` setzt eine strenge Content Security Policy: Skripte, Stile, Schriften und Bilder kommen nur von der eigenen Adresse. Wer später etwas Fremdes einbindet (zum Beispiel eine Statistik), muss die Zeile dort ergänzen.

## Rechte

Texte und Fotos gehören Fabian Locher und dürfen nicht weiterverwendet werden. Three.js steht unter der MIT-Lizenz, die Schriften unter der SIL Open Font License.
