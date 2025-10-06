import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

// Use Vercel's build ID if available, otherwise generate timestamp
const buildId =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ||
  process.env.VITE_APP_BUILD ||
  new Date().toISOString().replaceAll(/[-:]/g, '').replace('T', '_').slice(0, -7);

const version = {
  version: process.env.npm_package_version || '0.0.0',
  build: buildId,
  timestamp: Date.now(),
  env: process.env.VERCEL_ENV || 'local', // production, preview, or development
};

const outputPath = path.join(process.cwd(), 'public', 'version.json');

fs.writeFileSync(outputPath, JSON.stringify(version, null, 2));

console.log('Generated version.json:', version);
