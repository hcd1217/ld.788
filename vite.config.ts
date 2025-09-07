import { resolve } from 'node:path';
import process from 'node:process';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { htmlTransformPlugin } from './vite-plugins/html-transform';

process.env.VITE_APP_VERSION = process.env.npm_package_version;
const tzOffset = 7 * 36e5;
process.env.VITE_APP_BUILD = new Date(Date.now() + tzOffset)
  .toISOString()
  .replaceAll(/[-:]/g, '')
  .replace('T', '_')
  .slice(0, -7);

// Default app branding values (can be overridden by .env file)
const APP_NAME = process.env.VITE_APP_NAME || 'Credo';
const APP_SHORT_NAME = process.env.VITE_APP_SHORT_NAME || 'Credo';
const APP_DESCRIPTION = process.env.VITE_APP_DESCRIPTION || 'Credo Progressive Web Application';

// https://vite.dev/config/
export default defineConfig({
  server: {
    // https://533a614b56bc.ngrok-free.app
    allowedHosts: ['533a614b56bc.ngrok-free.app'],
  },
  resolve: {
    alias: {
      // eslint-disable-next-line no-undef
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          // Only split the largest, most independent libraries
          // React ecosystem
          react: ['react', 'react-dom'],
          router: ['react-router'],
          // Mantine UI - keep core together for stability
          'mantine-core': ['@mantine/core', '@mantine/hooks'],
          'mantine-extras': ['@mantine/form', '@mantine/notifications', '@mantine/modals'],
          'mantine-dates': ['@mantine/dates'],
          // Large independent libraries
          icons: ['@tabler/icons-react'],
          xlsx: ['xlsx'],
          // i18n
          i18n: ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
        },
      },
    },
  },
  plugins: [
    react(),
    htmlTransformPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: `${APP_NAME} App`,
        short_name: APP_SHORT_NAME,
        description: APP_DESCRIPTION,
        theme_color: '#26956d',
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
        // Enable immediate activation and control of existing tabs
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: null,
        // Exclude large lazy-loaded chunks and version.json from precaching
        globIgnores: ['**/icons-*.js', '**/xlsx-*.js', '**/version.json'],
        // Increase cache size limit to handle remaining assets
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4MB
        runtimeCaching: [
          // Always fetch version.json fresh from network
          {
            urlPattern: /\/version\.json/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'version-check',
              networkTimeoutSeconds: 3,
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
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
            urlPattern: ({ request }) => request.mode === 'navigate',
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
