// @ts-check
import { defineConfig } from 'astro/config';

// Static site. The Cloudflare Worker (src/worker.js) serves dist/ and handles /api/*.
export default defineConfig({
  site: 'https://vancefx.shop',
  trailingSlash: 'ignore',
});
