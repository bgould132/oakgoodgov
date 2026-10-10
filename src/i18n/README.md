# Website translations

English remains the source of truth. Dictionaries map exact rendered English text
to draft translations. When English changes:

1. Run `I18N_ALLOW_MISSING=1 ASTRO_TELEMETRY_DISABLED=1 npm run build` locally.
2. Run `npm run i18n:extract` to refresh the source-string list.
3. Update each dictionary, preserving exact English keys and inline-text context.
4. Run the normal check, build, and tests without the override before publishing.

The override is for local translation work only; do not set it in deployment CI.
Source PDFs and the external Google Form remain in English and are labeled.
Builds fail if an English text string has no translation, preventing silently
mixed-language pages from being deployed. Development previews show the English
fallback with a warning while the translation is being updated.
Translations are drafts pending fluent-speaker review. Do not publish automatically.

Routes: `/es/`, `/zh-Hans/`, `/zh-Hant/`; English remains at `/`.
Rendering uses the same Astro pages in all languages, then translates text and
accessible labels at build time. Links, emphasis, tables, assets, and source IDs
are preserved; internal page links stay in the selected language. Dictionaries
are never sent to an external translation service or shipped as client scripts.
