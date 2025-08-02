import QRCode from 'qrcode';

export async function generateQRCodeWithLogo(link: string) {
  // Get brand color from CSS variable
  const brandColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--mantine-color-brand-8')
    .trim();
  const baseColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--mantine-color-white')
    .trim();
  // Generate base QR code
  const qrDataUrl = await QRCode.toDataURL(link, {
    margin: 2,
    errorCorrectionLevel: 'H', // High error correction for logo overlay
    color: {
      dark: brandColor,
      light: baseColor,
    },
  });

  // Create canvas to combine QR code and logo
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return qrDataUrl;

  // Load QR code to get natural dimensions
  const qrImage = document.createElement('img');
  qrImage.src = qrDataUrl;
  await new Promise<void>((resolve) => {
    qrImage.addEventListener('load', () => {
      resolve();
    });
  });

  // Use natural QR code dimensions
  canvas.width = qrImage.width;
  canvas.height = qrImage.height;

  // Draw QR code at natural size
  ctx.drawImage(qrImage, 0, 0);

  // Calculate logo size relative to QR code (20% of QR size)
  const logoSize = Math.floor(canvas.width * 0.2);
  const logoX = (canvas.width - logoSize) / 2;
  const logoY = (canvas.height - logoSize) / 2;

  // Draw white background for logo
  ctx.fillStyle = 'white';
  ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);

  // Draw logo
  const logoImage = document.createElement('img');
  logoImage.crossOrigin = 'anonymous';
  logoImage.src = `/logo.svg`;
  await new Promise<void>((resolve, reject) => {
    logoImage.addEventListener('load', () => {
      resolve();
    });
    function errorHandler() {
      reject(new Error('Failed to load logo'));
      globalThis.removeEventListener('error', errorHandler);
    }

    globalThis.addEventListener('error', errorHandler);
  });
  ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);

  return canvas.toDataURL();
}
