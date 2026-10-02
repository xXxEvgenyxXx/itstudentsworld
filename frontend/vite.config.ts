import { defineConfig } from 'vite';
import { resolve } from 'path';
import Sitemap from 'vite-plugin-sitemap';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    Sitemap({
      hostname: 'https://itsw.ru',
      dynamicRoutes: ['/shop', '/about', '/login', '/register'],
      changefreq: {
        '/': 'daily',
        '/shop': 'daily',
        '/about': 'monthly',
        '/login': 'yearly',
        '/register': 'yearly',
      },
      priority: {
        '/': 1.0,
        '/shop': 0.9,
        '/about': 0.5,
        '/login': 0.3,
        '/register': 0.3,
      },
      generateRobotsTxt: false,
    })
  ],
});