import {readFileSync, existsSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const publicDir = join(rootDir, 'public');

// Ensure public directory exists
if (!existsSync(publicDir)) {
  mkdirSync(publicDir, {recursive: true});
}

// Read the SVG file
const svgBuffer = readFileSync(join(publicDir, 'logo.svg'));

// Define icon sizes
const iconSizes = [
  {size: 64, name: 'pwa-64x64.png'},
  {size: 192, name: 'pwa-192x192.png'},
  {size: 512, name: 'pwa-512x512.png'},
  {size: 512, name: 'maskable-icon-512x512.png', padding: true},
  {size: 180, name: 'apple-touch-icon.png'},
  {size: 16, name: 'favicon-16x16.png'},
  {size: 32, name: 'favicon-32x32.png'},
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
          background: {r: 255, g: 255, b: 255, alpha: 0},
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

    await sharp(Buffer.from(maskSvg))
      .resize(16, 16)
      .toFile(join(publicDir, 'mask-icon.svg'));
    console.log('✓ Generated mask-icon.svg');
  } catch (error) {
    console.error('✗ Error generating mask-icon.svg:', error.message);
  }

  // Create a favicon.ico from the 32x32 PNG
  try {
    await sharp(svgBuffer)
      .resize(32, 32)
      .toFile(join(publicDir, 'favicon.ico'));
    console.log('✓ Generated favicon.ico');
  } catch (error) {
    console.error('✗ Error generating favicon.ico:', error.message);
  }

  console.log('\nPWA assets generation complete!');
}

await generateIcons();
