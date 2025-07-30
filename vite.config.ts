import {resolve} from 'node:path';
import process from 'node:process';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {VitePWA} from 'vite-plugin-pwa';

process.env.VITE_APP_VERSION = process.env.npm_package_version;
process.env.VITE_APP_BUILD = new Date()
  .toISOString()
  .replaceAll(/[-:]/g, '')
  .replace('T', '_')
  .slice(0, -7);

// https://vite.dev/config/
export default defineConfig({
  server: {
    allowedHosts: ['f3c82d943be5.ngrok-free.app'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          react: ['react', 'react-dom'],
          // Router
          router: ['react-router'],
          // Mantine Core (most commonly used)
          'mantine-core': ['@mantine/core'],
          // Mantine Hooks (lightweight, commonly used)
          'mantine-hooks': ['@mantine/hooks'],
          // Mantine Form (auth-specific)
          'mantine-form': ['@mantine/form'],
          // Mantine Notifications (smaller, auth-specific)
          'mantine-notifications': ['@mantine/notifications'],
          // Mantine Modals (less commonly used)
          'mantine-modals': ['@mantine/modals'],
          // Mantine Dates (heavy, less commonly used)
          'mantine-dates': ['@mantine/dates'],
          // Icons (large dependency)
          icons: ['@tabler/icons-react'],
          // I18n
          i18n: [
            'i18next',
            'react-i18next',
            'i18next-browser-languagedetector',
          ],
          // State management
          zustand: ['zustand'],
          // Validation
          zod: ['zod'],
          // Date utilities
          dayjs: ['dayjs'],
          // Large utilities
          xlsx: ['xlsx'],
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Credo App',
        short_name: 'Credo',
        description: 'Credo Progressive Web Application',
        theme_color: '#3F60A0',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: null,
        // Exclude large lazy-loaded chunks from precaching
        globIgnores: ['**/icons-*.js', '**/xlsx-*.js'],
        // Increase cache size limit to handle remaining assets
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4MB
        runtimeCaching: [
          // Cache lazy-loaded icons and large chunks on demand
          {
            urlPattern: /\/assets\/icons-.*\.js$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'lazy-icons',
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\/assets\/xlsx-.*\.js$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'lazy-libs',
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: ({request}) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages',
              networkTimeoutSeconds: 3,
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 365 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 365 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
});
