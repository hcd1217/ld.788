#!/usr/bin/env node

/**
 * Generate all theme-based assets dynamically from VITE_APP_THEME_COLOR
 * This script orchestrates the generation of all PWA assets with custom theme colors
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const publicDir = join(rootDir, 'public');

// Load environment variables
dotenv.config({ path: join(rootDir, '.env.local') });
dotenv.config({ path: join(rootDir, '.env') });

// Get theme color from environment or use default
const THEME_COLOR_HEX = process.env.VITE_APP_THEME_COLOR || '324e71';
const THEME_COLOR = `#${THEME_COLOR_HEX}`;

// Get app branding from environment
const APP_NAME = process.env.VITE_APP_NAME || 'Credo';
const APP_SHORT_NAME = process.env.VITE_APP_SHORT_NAME || 'Credo';
const APP_DESCRIPTION = process.env.VITE_APP_DESCRIPTION || 'Credo Progressive Web Application';

console.log(`🎨 Generating theme assets with color: ${THEME_COLOR}`);
console.log(`📱 App name: ${APP_NAME}`);

// Ensure public directory exists
if (!existsSync(publicDir)) {
  mkdirSync(publicDir, { recursive: true });
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 50, g: 78, b: 113 }; // Default to #324e71
}

/**
 * Generate logo.svg with theme color
 */
async function generateThemeColoredLogo() {
  console.log('\n🎨 Generating themed logo.svg...');
  
  const logoPath = join(publicDir, 'logo.svg');
  const originalLogoPath = join(publicDir, 'logo-original.svg');
  
  // Save original logo if it doesn't exist
  if (existsSync(logoPath) && !existsSync(originalLogoPath)) {
    const originalContent = readFileSync(logoPath, 'utf-8');
    writeFileSync(originalLogoPath, originalContent);
    console.log('✓ Backed up original logo to logo-original.svg');
  }
  
  // Read the original logo or current logo
  const sourcePath = existsSync(originalLogoPath) ? originalLogoPath : logoPath;
  let svgContent = readFileSync(sourcePath, 'utf-8');
  
  // Replace all occurrences of the old color with the new theme color
  // This regex matches hex colors in the format #RRGGBB or #RGB
  svgContent = svgContent.replace(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/g, (match) => {
    // Keep white colors unchanged
    if (match.toLowerCase() === '#ffffff' || match.toLowerCase() === '#fff' || 
        match.toLowerCase() === '#fdfefe' || match.toLowerCase() === '#fefefe') {
      return match;
    }
    // Replace any other color with theme color
    return THEME_COLOR;
  });
  
  writeFileSync(logoPath, svgContent);
  console.log(`✓ Generated logo.svg with theme color ${THEME_COLOR}`);
}

/**
 * Generate PWA icons with theme color
 */
async function generatePWAIcons() {
  console.log('\n📱 Generating PWA icons...');
  
  const svgBuffer = readFileSync(join(publicDir, 'logo.svg'));
  const rgb = hexToRgb(THEME_COLOR);
  
  // Define icon sizes
  const iconSizes = [
    { size: 64, name: 'pwa-64x64.png' },
    { size: 192, name: 'pwa-192x192.png' },
    { size: 512, name: 'pwa-512x512.png' },
    { size: 512, name: 'maskable-icon-512x512.png', padding: true },
    { size: 180, name: 'apple-touch-icon.png' },
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
  ];
  
  for (const icon of iconSizes) {
    try {
      let img = sharp(svgBuffer).resize(icon.size, icon.size);
      
      // Add padding for maskable icon
      if (icon.padding) {
        const paddingSize = Math.floor(icon.size * 0.1);
        img = img.extend({
          top: paddingSize,
          bottom: paddingSize,
          left: paddingSize,
          right: paddingSize,
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        });
      }
      
      await img.png().toFile(join(publicDir, icon.name));
      console.log(`✓ Generated ${icon.name}`);
    } catch (error) {
      console.error(`✗ Error generating ${icon.name}:`, error.message);
    }
  }
  
  // Generate mask-icon.svg (monochrome version for Safari)
  try {
    const maskSvg = svgBuffer
      .toString()
      .replace(/fill="[^"]*"/g, 'fill="black"')
      .replace(/stroke="[^"]*"/g, 'stroke="black"');
    
    await sharp(Buffer.from(maskSvg)).resize(16, 16).toFile(join(publicDir, 'mask-icon.svg'));
    console.log('✓ Generated mask-icon.svg');
  } catch (error) {
    console.error('✗ Error generating mask-icon.svg:', error.message);
  }
  
  // Create a favicon.ico from the 32x32 PNG
  try {
    await sharp(svgBuffer).resize(32, 32).toFile(join(publicDir, 'favicon.ico'));
    console.log('✓ Generated favicon.ico');
  } catch (error) {
    console.error('✗ Error generating favicon.ico:', error.message);
  }
}

/**
 * Generate iOS splash screens with theme color
 */
async function generateSplashScreens() {
  console.log('\n📱 Generating iOS splash screens...');
  
  const svgBuffer = readFileSync(join(publicDir, 'logo.svg'));
  const rgb = hexToRgb(THEME_COLOR);
  
  // Define iOS splash screen sizes
  const splashScreenSizes = [
    { width: 1290, height: 2796, name: 'apple-splash-1290-2796.png' },
    { width: 1179, height: 2556, name: 'apple-splash-1179-2556.png' },
    { width: 1170, height: 2532, name: 'apple-splash-1170-2532.png' },
    { width: 1284, height: 2778, name: 'apple-splash-1284-2778.png' },
    { width: 1125, height: 2436, name: 'apple-splash-1125-2436.png' },
    { width: 750, height: 1334, name: 'apple-splash-750-1334.png' },
    { width: 2048, height: 2732, name: 'apple-splash-2048-2732.png' },
    { width: 1668, height: 2388, name: 'apple-splash-1668-2388.png' },
    { width: 1668, height: 2224, name: 'apple-splash-1668-2224.png' },
    { width: 1620, height: 2160, name: 'apple-splash-1620-2160.png' },
  ];
  
  for (const splash of splashScreenSizes) {
    try {
      const logoSize = Math.floor(Math.min(splash.width, splash.height) * 0.25);
      
      const logo = await sharp(svgBuffer)
        .resize(logoSize, logoSize, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .toBuffer();
      
      const background = await sharp({
        create: {
          width: splash.width,
          height: splash.height,
          channels: 3,
          background: rgb,
        },
      })
        .png()
        .toBuffer();
      
      await sharp(background)
        .composite([
          {
            input: logo,
            gravity: 'center',
          },
        ])
        .toFile(join(publicDir, splash.name));
      
      console.log(`✓ Generated ${splash.name}`);
    } catch (error) {
      console.error(`✗ Error generating ${splash.name}:`, error.message);
    }
  }
}

/**
 * Generate OpenGraph image with theme color
 */
async function generateOpenGraphImage() {
  console.log('\n🌐 Generating OpenGraph image...');
  
  const svgBuffer = readFileSync(join(publicDir, 'logo.svg'));
  const rgb = hexToRgb(THEME_COLOR);
  
  try {
    const width = 1200;
    const height = 630;
    const logoSize = Math.floor(Math.min(width, height) * 0.3);
    
    const logo = await sharp(svgBuffer)
      .resize(logoSize, logoSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toBuffer();
    
    const background = await sharp({
      create: {
        width,
        height,
        channels: 3,
        background: rgb,
      },
    })
      .png()
      .toBuffer();
    
    await sharp(background)
      .composite([
        {
          input: logo,
          gravity: 'center',
        },
      ])
      .toFile(join(publicDir, 'og-image.png'));
    
    console.log('✓ Generated og-image.png');
  } catch (error) {
    console.error('✗ Error generating og-image.png:', error.message);
  }
}

/**
 * Generate manifest.json with theme color
 */
function generateManifest() {
  console.log('\n📋 Generating manifest.json...');
  
  const manifest = {
    name: `${APP_NAME} App`,
    short_name: APP_SHORT_NAME,
    description: APP_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    theme_color: THEME_COLOR,
    background_color: '#ffffff',
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
  };
  
  const outputPath = join(publicDir, 'manifest.json');
  
  try {
    writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
    console.log(`✓ Generated manifest.json with theme color ${THEME_COLOR}`);
  } catch (error) {
    console.error('✗ Failed to generate manifest.json:', error);
    process.exit(1);
  }
}

/**
 * Generate offline.html with theme color
 */
function generateOfflineHTML() {
  console.log('\n📄 Generating offline.html...');
  
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
            color: ${THEME_COLOR};
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
  
  const outputPath = join(publicDir, 'offline.html');
  
  try {
    writeFileSync(outputPath, offlineHtml);
    console.log(`✓ Generated offline.html with theme color ${THEME_COLOR}`);
  } catch (error) {
    console.error('✗ Failed to generate offline.html:', error);
    process.exit(1);
  }
}

/**
 * Update vite.config.ts to use theme color
 */
function updateViteConfig() {
  console.log('\n⚙️ Updating vite.config.ts...');
  
  const viteConfigPath = join(rootDir, 'vite.config.ts');
  let viteConfig = readFileSync(viteConfigPath, 'utf-8');
  
  // Update theme_color in manifest
  viteConfig = viteConfig.replace(
    /theme_color:\s*['"]#[0-9a-fA-F]{6}['"]/,
    `theme_color: '#${THEME_COLOR_HEX}'`
  );
  
  // Update background_color if needed (keeping it white for better UX)
  // viteConfig = viteConfig.replace(
  //   /background_color:\s*['"]#[0-9a-fA-F]{6}['"]/,
  //   `background_color: '#${THEME_COLOR_HEX}'`
  // );
  
  writeFileSync(viteConfigPath, viteConfig);
  console.log(`✓ Updated vite.config.ts with theme color ${THEME_COLOR}`);
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting theme-based asset generation...\n');
  
  try {
    // Generate themed logo first
    await generateThemeColoredLogo();
    
    // Generate all assets
    await generatePWAIcons();
    await generateSplashScreens();
    await generateOpenGraphImage();
    
    // Generate configuration files
    generateManifest();
    generateOfflineHTML();
    updateViteConfig();
    
    // Generate version.json
    console.log('\n📦 Generating version.json...');
    execSync('node scripts/generate-version.js', { stdio: 'inherit', cwd: rootDir });
    
    console.log('\n✨ All theme-based assets generated successfully!');
    console.log(`🎨 Theme color: ${THEME_COLOR}`);
    console.log(`📱 App name: ${APP_NAME}`);
  } catch (error) {
    console.error('\n❌ Error during asset generation:', error);
    process.exit(1);
  }
}

// Run the main function
main();