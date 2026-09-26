import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// En développement, /api et /uploads sont redirigés vers Symfony (Nginx) :
// le site et l'API semblent sur le même domaine, sans problème de CORS.
// - dans Docker : API_PROXY_TARGET=http://nginx (défini dans docker-compose.yml)
// - hors Docker : http://localhost:8090 par défaut
const apiTarget = process.env.API_PROXY_TARGET ?? 'http://localhost:8090'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: "Oven's Pizza Party",
        short_name: "Oven's Pizza",
        description: 'Menu, horaires et réservation en ligne.',
        lang: 'fr',
        start_url: '/',
        display: 'standalone',
        background_color: '#fff8f0',
        theme_color: '#c62828',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api/, /^\/uploads/],
        runtimeCaching: [
          {
            // Menu : toujours la version la plus récente, mais consultable hors connexion.
            urlPattern: ({ url }) => url.pathname.startsWith('/api/pizzas'),
            handler: 'NetworkFirst',
            options: { cacheName: 'api-menu', networkTimeoutSeconds: 5, expiration: { maxAgeSeconds: 7 * 24 * 3600 } },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/uploads/'),
            handler: 'CacheFirst',
            options: { cacheName: 'pizza-images', expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 3600 } },
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
    proxy: {
      '/api': { target: apiTarget, changeOrigin: true },
      '/uploads': { target: apiTarget, changeOrigin: true },
    },
  },
})
