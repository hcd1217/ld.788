import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const publicDir = join(rootDir, 'public');

// Theme color from the app configuration
const THEME_COLOR = `#${process.env.VITE_APP_THEME_COLOR || '324e71'}`;

// Ensure public directory exists
if (!existsSync(publicDir)) {
  mkdirSync(publicDir, { recursive: true });
}

// Read the SVG file
const svgBuffer = readFileSync(join(publicDir, 'logo.svg'));

// TODO: Replace color of logo.svg by theme color

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

// Define iOS splash screen sizes
const splashScreenSizes = [
  { width: 1290, height: 2796, name: 'apple-splash-1290-2796.png' }, // iPhone 14 Pro Max, 15 Plus, 15 Pro Max
  { width: 1179, height: 2556, name: 'apple-splash-1179-2556.png' }, // iPhone 14 Pro, 15, 15 Pro
  { width: 1170, height: 2532, name: 'apple-splash-1170-2532.png' }, // iPhone 14, 13, 13 Pro, 12, 12 Pro
  { width: 1284, height: 2778, name: 'apple-splash-1284-2778.png' }, // iPhone 14 Plus, 13 Pro Max, 12 Pro Max
  { width: 1125, height: 2436, name: 'apple-splash-1125-2436.png' }, // iPhone 13 mini, 12 mini
  { width: 750, height: 1334, name: 'apple-splash-750-1334.png' }, // iPhone SE 3rd gen
  { width: 2048, height: 2732, name: 'apple-splash-2048-2732.png' }, // iPad Pro 12.9"
  { width: 1668, height: 2388, name: 'apple-splash-1668-2388.png' }, // iPad Pro 11"
  { width: 1668, height: 2224, name: 'apple-splash-1668-2224.png' }, // iPad Air, iPad mini
  { width: 1620, height: 2160, name: 'apple-splash-1620-2160.png' }, // iPad 10.2"
];

// Generate icons
async function generateIcons() {
  console.log('Generating PWA icons...');

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
      .replaceAll(/fill="[^"]*"/g, 'fill="black"')
      .replaceAll(/stroke="[^"]*"/g, 'stroke="black"');

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

  console.log('\nPWA assets generation complete!');
}

// Generate iOS splash screens
async function generateSplashScreens() {
  console.log('\nGenerating iOS splash screens...');

  for (const splash of splashScreenSizes) {
    try {
      // Calculate logo size (25% of the smaller dimension)
      const logoSize = Math.floor(Math.min(splash.width, splash.height) * 0.25);

      // Create logo with appropriate size
      const logo = await sharp(svgBuffer)
        .resize(logoSize, logoSize, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .toBuffer();

      // Parse theme color to RGB
      const r = Number.parseInt(THEME_COLOR.slice(1, 3), 16);
      const g = Number.parseInt(THEME_COLOR.slice(3, 5), 16);
      const b = Number.parseInt(THEME_COLOR.slice(5, 7), 16);

      // Create background with theme color
      const background = await sharp({
        create: {
          width: splash.width,
          height: splash.height,
          channels: 3,
          background: { r, g, b },
        },
      })
        .png()
        .toBuffer();

      // Composite logo onto background
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

  console.log('iOS splash screens generation complete!');
}

// Generate OpenGraph image for social sharing
async function generateOpenGraphImage() {
  console.log('\nGenerating OpenGraph image...');

  try {
    const width = 1200;
    const height = 630;
    const logoSize = Math.floor(Math.min(width, height) * 0.3); // 30% of smaller dimension

    // Create logo with appropriate size
    const logo = await sharp(svgBuffer)
      .resize(logoSize, logoSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toBuffer();

    // Parse theme color to RGB
    const r = Number.parseInt(THEME_COLOR.slice(1, 3), 16);
    const g = Number.parseInt(THEME_COLOR.slice(3, 5), 16);
    const b = Number.parseInt(THEME_COLOR.slice(5, 7), 16);

    // Create background with theme color
    const background = await sharp({
      create: {
        width,
        height,
        channels: 3,
        background: { r, g, b },
      },
    })
      .png()
      .toBuffer();

    // Composite logo onto background
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

await generateIcons();
await generateSplashScreens();
await generateOpenGraphImage();
console.log('\n✨ All PWA assets generated successfully!');
