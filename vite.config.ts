import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'offline-sw.js',
      injectRegister: false,
      injectManifest: { globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'] },
      manifest: {
        name: 'NexusOS',
        short_name: 'NexusOS',
        description: 'Your business conversations, together.',
        start_url: '/app/chats',
        display: 'standalone',
        background_color: '#f1f3f2',
        theme_color: '#287663',
        icons: [
          { src: '/icons/nexusos-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/nexusos-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/nexusos.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }
        ]
      }
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': 'http://127.0.0.1:4000',
      '/socket.io': { target: 'http://127.0.0.1:4000', ws: true }
    }
  },
  preview: { host: '0.0.0.0', port: 4173 },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@app': path.resolve(import.meta.dirname, 'src/app'),
      '@shared': path.resolve(import.meta.dirname, 'src/shared')
    }
  }
})
