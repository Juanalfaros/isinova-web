// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

import compress from 'astro-compress';

import cloudflare from '@astrojs/cloudflare';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://isinova.cl', // URL de producción (cámbiala si es necesario)
  output: 'static',
  adapter: cloudflare({
    imageService: 'cloudflare',
  }),
  integrations: [mdx(), sitemap(), compress()]
});