// defineConfig aus vitest/config kennt zusätzlich den Abschnitt "test"
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  // Relative Pfade: App läuft in jedem Ordner (Tiny-Server, GitHub Pages, USB-Stick …)
  base: './',
  plugins: [
    vue(),
    // Service Worker + Manifest: App ist installierbar und läuft offline.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Nix wie weg',
        short_name: 'Nix wie weg',
        description: 'Reisen planen, erleben, festhalten und teilen – auch offline.',
        lang: 'de',
        theme_color: '#0d6efd',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: './',
        scope: './',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff,woff2}']
      }
    })
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  test: {
    environment: 'node'
  }
})
