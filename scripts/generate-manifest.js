#!/usr/bin/env node

/**
 * Generate manifest.json dynamically from environment variables
 * This script can be run during build to create a customized manifest
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read environment variables with defaults
const APP_NAME = process.env.VITE_APP_NAME || 'Credo';
const APP_SHORT_NAME = process.env.VITE_APP_SHORT_NAME || 'Credo';
const APP_DESCRIPTION = process.env.VITE_APP_DESCRIPTION || 'Credo Progressive Web Application';

const manifest = {
  name: `${APP_NAME} App`,
  short_name: APP_SHORT_NAME,
  description: APP_DESCRIPTION,
  start_url: '/',
  display: 'standalone',
  orientation: 'portrait',
  theme_color: '#324e71',
  background_color: '#324e71',
  icons: [
    {
      src: '/favicon-16x16.png',
      sizes: '16x16',
      type: 'image/png',
    },
    {
      src: '/favicon-32x32.png',
      sizes: '32x32',
      type: 'image/png',
    },
    {
      src: '/icon-192x192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any maskable',
    },
    {
      src: '/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any maskable',
    },
    {
      src: '/apple-touch-icon.png',
      sizes: '180x180',
      type: 'image/png',
    },
  ],
};

const outputPath = path.join(__dirname, '..', 'public', 'manifest.json');

try {
  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
  console.log(`✅ Generated manifest.json with app name: ${APP_NAME}`);
} catch (error) {
  console.error('❌ Failed to generate manifest.json:', error);
  process.exit(1);
}
