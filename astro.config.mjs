// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

import compress from 'astro-compress';

// https://astro.build/config
export default defineConfig({
  site: 'https://isinova.cl', // URL de producción (cámbiala si es necesario)
  integrations: [sitemap(), compress()]
});