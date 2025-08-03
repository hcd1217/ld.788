import {Modal, Text, Stack, Alert, Button, TextInput, Group} from '@mantine/core';
import {IconAlertCircle, IconCamera, IconX} from '@tabler/icons-react';
import {useEffect, useRef, useState} from 'react';
import {useTranslation} from '@/hooks/useTranslation';

type QrScannerModalProps = {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly onScan: (data: string) => void;
};

export function QrScannerModal({opened, onClose, onScan}: QrScannerModalProps) {
  const {t} = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isScanning, setIsScanning] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setError(undefined);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {facingMode: 'environment'},
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
        startScanning();
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError(t('auth.magicLink.cameraPermissionDenied'));
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const startScanning = () => {
    // NOTE: This currently shows the camera feed with manual code entry
    // To implement actual QR code scanning, you would need to:
    // 1. Install a QR scanning library (e.g., qr-scanner, react-qr-reader, or @zxing/browser)
    // 2. Process video frames to detect and decode QR codes
    // 3. Automatically call onScan when a valid QR code is detected
    // For now, users can manually enter the code shown in the QR code
    setError(undefined);
  };

  const handleManualSubmit = () => {
    if (manualInput) {
      onScan(manualInput);
      setManualInput('');
      onClose();
    }
  };

  useEffect(() => {
    if (opened) {
      void startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  const handleClose = () => {
    stopCamera();
    onClose();
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
        <Text size="sm" c="dimmed">
          {t('auth.magicLink.scanQrCodeDescription')}
        </Text>

        {error ? (
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
            {error}
          </Alert>
        ) : isScanning ? (
          <Stack gap="md">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{width: '100%', maxWidth: 400, borderRadius: 8, margin: '0 auto', display: 'block'}}
            />
            <Text size="sm" c="dimmed" ta="center">
              {t('auth.magicLink.scanningQrCode')}
            </Text>
            
            <Stack gap="sm">
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
              />
              <Group grow>
                <Button
                  variant="default"
                  onClick={handleClose}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="filled"
                  onClick={handleManualSubmit}
                  disabled={!manualInput}
                >
                  {t('auth.magicLink.verifyCode')}
                </Button>
              </Group>
            </Stack>
          </Stack>
        ) : (
          <Stack align="center" gap="md" py="xl">
            <IconCamera size={64} stroke={1.5} color="var(--mantine-color-gray-5)" />
            <Text size="sm" c="dimmed">
              Initializing camera...
            </Text>
          </Stack>
        )}

        {!isScanning && (
          <Button
            fullWidth
            variant="default"
            onClick={handleClose}
            leftSection={<IconX size={16} />}
          >
            {t('auth.magicLink.closeScanner')}
          </Button>
        )}
      </Stack>
    </Modal>
  );
}