import { defineConfig } from 'astro/config';

function normalizeBase(value = '/') {
  const trimmed = value.trim();
  if (!trimmed || trimmed === '/') return '/';
  return `/${trimmed.replace(/^\/+|\/+$/g, '')}/`;
}

export default defineConfig({
  output: 'static',
  base: normalizeBase(process.env.ASTRO_BASE_PATH || '/'),
  build: {
    assets: '_assets'
  },
  compressHTML: true,
  vite: {
    resolve: {
      alias: {
        '@': '/src',
        '@components': '/src/components',
        '@layouts': '/src/layouts',
        '@styles': '/src/styles',
        '@data': '/src/data'
      }
    }
  }
});
