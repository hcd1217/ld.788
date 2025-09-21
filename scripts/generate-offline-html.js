#!/usr/bin/env node

/**
 * Generate offline.html dynamically from environment variables
 * This script can be run during build to create a customized offline page
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read environment variables with defaults
const APP_NAME = process.env.VITE_APP_NAME || 'Credo';

const offlineHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Offline - ${APP_NAME} App</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background-color: #f8f9fa;
            color: #495057;
        }
        .offline-container {
            text-align: center;
            padding: 2rem;
        }
        h1 {
            color: #324e71;
            font-size: 2rem;
            margin-bottom: 1rem;
        }
        p {
            font-size: 1.1rem;
            line-height: 1.6;
            margin-bottom: 1.5rem;
        }
        .logo {
            width: 80px;
            height: 80px;
            margin-bottom: 1rem;
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="offline-container">
        <img src="/logo.svg" alt="${APP_NAME} App" class="logo">
        <h1>You're Offline</h1>
        <p>It looks like you've lost your internet connection.<br>Some features may be unavailable until you're back online.</p>
    </div>
</body>
</html>`;

const outputPath = path.join(__dirname, '..', 'public', 'offline.html');

try {
  fs.writeFileSync(outputPath, offlineHtml);
  console.log(`✅ Generated offline.html with app name: ${APP_NAME}`);
} catch (error) {
  console.error('❌ Failed to generate offline.html:', error);
  process.exit(1);
}