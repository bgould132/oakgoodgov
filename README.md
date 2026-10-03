# Oakland Residents for Good Government

An editable Astro website for Oakland Residents for Good Government.

## Development

Use Node 22.12 or later:

```sh
npm ci
ASTRO_TELEMETRY_DISABLED=1 npm run dev
npm run check
npm run build
npm test
```

The development preview runs at http://127.0.0.1:4321.

## Editing

- Homepage text and site settings: `src/content/site.json`
- Homepage layout: `src/pages/index.astro`
- Other pages: `src/pages/`
- Header and footer: `src/components/`
- Colors, typography and layout: `src/styles/global.css`
- Images: `src/assets/`
- Intentional public downloads: `public/documents/`

The signup page embeds a public Google Form; private responses and form administration links are not included in this repository.

## Deployment

This repository contains website source. Pushing source does not deploy it. No automatic deployment workflow is included. `draft: true` requests that search engines not index rendered pages; it is not an access restriction.

## Image and font credits

- City Hall portrait: Daniel Ramirez, 2008, [Wikimedia Commons source](https://commons.wikimedia.org/wiki/File:Oakland_City_Hall.jpg), [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/). Resized and converted to WebP for display. No photographer endorsement implied.
- Other photographs and the organization logo: supplied or selected by the organization; no general reuse license is granted here.
- Public Sans and Barlow Condensed are self-hosted via Fontsource; see the font packages for SIL Open Font License notices.
