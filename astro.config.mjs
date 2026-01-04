// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

import compress from 'astro-compress';

import cloudflare from '@astrojs/cloudflare';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://isinova.cl',
  output: 'static',
  adapter: cloudflare(),
  integrations: [mdx(), sitemap(), compress()]
});