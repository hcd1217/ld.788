import { useState } from 'react';

import {
  Alert,
  Button,
  FileInput,
  Group,
  Modal,
  rem,
  Stack,
  Tabs,
  Text,
  TextInput,
} from '@mantine/core';
import { IconAlertCircle, IconCamera, IconClipboard, IconUpload } from '@tabler/icons-react';
import { type IDetectedBarcode, Scanner } from '@yudiel/react-qr-scanner';

// Dynamic import for jsQR to reduce bundle size
import { useTranslation } from '@/hooks/useTranslation';
import { logError } from '@/utils/logger';
type QrScannerModalProps = {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly onScan: (data: string) => void;
};

export function QrScannerModal({ opened, onClose, onScan }: QrScannerModalProps) {
  const { t } = useTranslation();
  const [error, setError] = useState<string | undefined>(undefined);
  const [manualInput, setManualInput] = useState('');
  const [activeTab, setActiveTab] = useState<string | null>('camera');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const handleQrScan = (detectedCodes: IDetectedBarcode[]) => {
    if (detectedCodes.length > 0 && detectedCodes[0].rawValue) {
      onScan(detectedCodes[0].rawValue);
      setIsPaused(true);
      onClose();
    }
  };

  const handleQrError = (error: unknown) => {
    logError('QR Scanner error:', error, {
      module: 'QrScannerModal',
      action: 'handleQrScan',
    });
    // Check if it's a permission error
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('Permission') || errorMessage.includes('NotAllowed')) {
      setError(t('auth.magicLink.cameraPermissionDenied'));
    }
  };

  const handleManualSubmit = () => {
    if (manualInput) {
      onScan(manualInput);
      setManualInput('');
      onClose();
    }
  };

  const handleClose = () => {
    setError(undefined);
    setManualInput('');
    setActiveTab('camera');
    setIsProcessing(false);
    setIsPaused(false); // Reset pause state for next opening
    onClose();
  };

  const processImage = async (file: File | Blob) => {
    setError(undefined);
    setIsProcessing(true);

    try {
      // Create an image element to load the file
      const img = new Image();
      const url = URL.createObjectURL(file);

      await new Promise<void>((resolve, reject) => {
        img.addEventListener('load', () => resolve());
        img.addEventListener('error', () => reject(new Error('Failed to load image')));
        img.src = url;
      });

      // Create a canvas to extract image data
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Failed to create canvas context');
      }

      // Set canvas size to match the image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the image on the canvas
      context.drawImage(img, 0, 0);

      // Get the image data
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      // Dynamically import jsQR to reduce initial bundle size
      // eslint-disable-next-line unicorn/no-await-expression-member
      const jsQR = (await import('jsqr')).default;

      // Decode QR code using jsQR
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      // Clean up the object URL
      URL.revokeObjectURL(url);

      if (code && code.data) {
        // QR code found, pass the data
        onScan(code.data);
        onClose();
      } else {
        setError(t('auth.magicLink.noQrCodeFound'));
      }
    } catch (error_) {
      logError('Error processing image:', error_, {
        module: 'QrScannerModal',
        action: 'jsQR',
      });
      setError(t('auth.magicLink.invalidImageFormat'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (file: File | null) => {
    if (file) {
      void processImage(file);
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();

      for (const item of clipboardItems) {
        if (item.types.includes('image/png') || item.types.includes('image/jpeg')) {
          const blob = await item.getType(
            item.types.find((type) => type.startsWith('image/')) || 'image/png',
          );
          void processImage(blob);
          return;
        }
      }

      // If no image found, try text
      const text = await navigator.clipboard.readText();
      if (text) {
        onScan(text);
        onClose();
      } else {
        setError(t('auth.magicLink.noQrCodeFound'));
      }
    } catch (error_) {
      logError('Error reading clipboard:', error_, {
        module: 'QrScannerModal',
        action: 'blob',
      });
      setError(t('auth.magicLink.invalidImageFormat'));
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={t('auth.magicLink.scanQrCode')}
      size="lg"
      centered
    >
      <Stack gap="md">
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
            {error}
          </Alert>
        )}

        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List grow>
            <Tabs.Tab value="camera" leftSection={<IconCamera size={16} />}>
              {t('auth.magicLink.scanQrCode')}
            </Tabs.Tab>
            <Tabs.Tab value="upload" leftSection={<IconUpload size={16} />}>
              {t('auth.magicLink.uploadQrImage')}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="camera" pt="md">
            {opened && activeTab === 'camera' && (
              <Stack gap="md">
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: 400,
                    margin: '0 auto',
                    borderRadius: 8,
                    overflow: 'hidden',
                  }}
                >
                  <Scanner
                    onScan={handleQrScan}
                    onError={handleQrError}
                    constraints={{ facingMode: 'environment' }}
                    paused={isPaused || !opened || activeTab !== 'camera'}
                    scanDelay={500}
                    styles={{
                      container: { width: '100%' },
                      video: { width: '100%', borderRadius: 8 },
                    }}
                  />
                </div>

                <Text size="sm" c="dimmed" ta="center">
                  {t('auth.magicLink.scanningQrCode')}
                </Text>
              </Stack>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="upload" pt="md">
            <Stack gap="md">
              <FileInput
                accept="image/*"
                leftSection={<IconUpload size={rem(16)} />}
                placeholder={t('auth.magicLink.clickToUpload')}
                onChange={handleFileUpload}
                disabled={isProcessing}
              />

              <Button
                fullWidth
                variant="default"
                leftSection={<IconClipboard size={16} />}
                onClick={() => void handlePaste()}
                disabled={isProcessing}
              >
                {t('auth.magicLink.pasteFromClipboard')}
              </Button>

              {isProcessing && (
                <Text size="sm" c="dimmed" ta="center">
                  {t('auth.magicLink.processingImage')}
                </Text>
              )}
            </Stack>
          </Tabs.Panel>
        </Tabs>

        <Stack gap="sm" mt="md">
          <Text size="sm" c="dimmed">
            {t('auth.magicLink.or')} {t('auth.magicLink.enterCodeDescription')}
          </Text>
          <TextInput
            placeholder={t('auth.magicLink.magicLinkCode')}
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && manualInput) {
                handleManualSubmit();
              }
            }}
            disabled={isProcessing}
          />
          <Group grow>
            <Button variant="default" onClick={handleClose} disabled={isProcessing}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="filled"
              onClick={handleManualSubmit}
              disabled={!manualInput || isProcessing}
            >
              {t('auth.magicLink.verifyCode')}
            </Button>
          </Group>
        </Stack>
      </Stack>
    </Modal>
  );
}
