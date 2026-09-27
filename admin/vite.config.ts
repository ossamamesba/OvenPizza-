import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import { defineConfig, searchForWorkspaceRoot } from 'vite'

// Dashboard du patron. En développement, /api et /uploads sont redirigés vers Symfony (Nginx).
// - dans Docker : API_PROXY_TARGET=http://nginx (défini dans docker-compose.yml)
// - hors Docker : http://localhost:8090 par défaut
const apiTarget = process.env.API_PROXY_TARGET ?? 'http://localhost:8090'
// Code commun au site, au dashboard et à l'app mobile (monté dans /shared par Docker).
const sharedDir = fileURLToPath(new URL('../shared', import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@shared': sharedDir },
  },
  server: {
    host: true,
    port: 5174,
    fs: { allow: [searchForWorkspaceRoot(process.cwd()), sharedDir] },
    proxy: {
      '/api': { target: apiTarget, changeOrigin: true },
      '/uploads': { target: apiTarget, changeOrigin: true },
    },
  },
})
