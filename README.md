# Oakland Residents for Good Government website

Astro static website prepared for GitHub Pages at https://oakgoodgov.org.

This repository currently contains development configuration only. Website pages, assets, and public source documents are pending content and image review. GitHub Pages deployment is disabled.

Once reviewed site files are added, use Node 22.12 or later and run:

```sh
npm ci
ASTRO_TELEMETRY_DISABLED=1 npm run dev
ASTRO_TELEMETRY_DISABLED=1 npm run check
ASTRO_TELEMETRY_DISABLED=1 npm run build
npm test
```

Homepage text lives in src/content/site.json; articles in src/pages; styles in src/styles/global.css.
