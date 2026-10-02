import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://oakgoodgov.org',
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
});
