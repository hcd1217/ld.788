import {resolve} from 'node:path';
import process from 'node:process';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {VitePWA} from 'vite-plugin-pwa';
import {htmlTransformPlugin} from './vite-plugins/html-transform';

process.env.VITE_APP_VERSION = process.env.npm_package_version;
const tzOffset = 7 * 36e5
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
    allowedHosts: ['b1a271709375.ngrok-free.app'],
  },
  resolve: {
    alias: {
      // eslint-disable-next-line no-undef
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core vendor libraries
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react';
          }
          if (id.includes('node_modules/react-router')) {
            return 'router';
          }
          // Mantine UI library splitting
          if (id.includes('@mantine/core')) {
            return 'mantine-core';
          }
          if (id.includes('@mantine/hooks')) {
            return 'mantine-hooks';
          }
          if (id.includes('@mantine/form')) {
            return 'mantine-form';
          }
          if (id.includes('@mantine/notifications')) {
            return 'mantine-notifications';
          }
          if (id.includes('@mantine/modals')) {
            return 'mantine-modals';
          }
          if (id.includes('@mantine/dates')) {
            return 'mantine-dates';
          }
          // Icons (large)
          if (id.includes('@tabler/icons-react')) {
            return 'icons';
          }
          // I18n
          if (id.includes('i18next') || id.includes('react-i18next')) {
            return 'i18n';
          }
          // State management
          if (id.includes('zustand')) {
            return 'zustand';
          }
          // Validation
          if (id.includes('zod')) {
            return 'zod';
          }
          // Date utilities
          if (id.includes('dayjs')) {
            return 'dayjs';
          }
          // Large utilities (Excel export)
          if (id.includes('xlsx')) {
            return 'xlsx';
          }
          // QR code library
          if (id.includes('jsQR') || id.includes('qr-scanner')) {
            return 'qr';
          }
          // Additional vendor splitting for common libraries
          if (id.includes('node_modules/')) {
            // Group other smaller vendor libraries
            if (id.includes('uuid') || id.includes('clsx') || id.includes('immer')) {
              return 'vendor-utils';
            }
            // Default vendor chunk for remaining node_modules
            return 'vendor';
          }
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
        theme_color: '#324e71',
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
