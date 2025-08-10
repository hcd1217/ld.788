import { useRef, useState, useCallback, useEffect } from 'react';
import { Button, Text, Stack, Modal, Group, Alert } from '@mantine/core';
import { IconCamera, IconRefresh } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface PhotoCaptureProps {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly onCapture: (photo: {
    base64: string;
    timestamp: Date;
    metadata: {
      deviceId?: string;
      compression: number;
      originalSize: number;
    };
  }) => void;
  readonly location?: { latitude: number; longitude: number };
}

const PHOTO_CONFIG = {
  quality: 0.3,
  maxWidth: 640,
  maxHeight: 480,
  format: 'jpeg',
} as const;

export function PhotoCapture({ opened, onClose, onCapture, location }: PhotoCaptureProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCapturing, setIsCapturing] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: PHOTO_CONFIG.maxWidth },
          height: { ideal: PHOTO_CONFIG.maxHeight },
          facingMode: 'user',
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermission(true);
    } catch (err) {
      console.error('Camera access denied:', err);
      setHasPermission(false);
      setError(t('timekeeper.clock.camera.permissionDenied'));
    }
  }, [t]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = PHOTO_CONFIG.maxWidth;
    canvas.height = PHOTO_CONFIG.maxHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Add watermark
    const timestamp = new Date();
    const watermarkText = [
      timestamp.toLocaleString(),
      location ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : '',
    ]
      .filter(Boolean)
      .join(' | ');

    // Watermark styling
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
    ctx.fillStyle = 'white';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(watermarkText, 10, canvas.height - 10);

    // Convert to base64
    const base64 = canvas.toDataURL('image/jpeg', PHOTO_CONFIG.quality);
    const originalSize = Math.round((base64.length * 3) / 4); // Approximate size in bytes

    setCapturedImage(base64);
    setIsCapturing(false);

    // Return captured photo data
    return {
      base64,
      timestamp,
      metadata: {
        compression: PHOTO_CONFIG.quality,
        originalSize,
      },
    };
  }, [location]);

  // Handle close
  const handleClose = useCallback(() => {
    stopCamera();
    setCapturedImage(null);
    setIsCapturing(false);
    setError(null);
    onClose();
  }, [stopCamera, onClose]);

  // Handle photo confirmation
  const handleConfirm = useCallback(() => {
    if (!capturedImage) return;

    const photoData = {
      base64: capturedImage,
      timestamp: new Date(),
      metadata: {
        compression: PHOTO_CONFIG.quality,
        originalSize: Math.round((capturedImage.length * 3) / 4),
      },
    };

    onCapture(photoData);
    handleClose();
  }, [capturedImage, handleClose, onCapture]);

  // Handle retake
  const handleRetake = useCallback(() => {
    setCapturedImage(null);
    setIsCapturing(true);
    startCamera();
  }, [startCamera]);

  // Start camera when modal opens
  useEffect(() => {
    if (opened && !capturedImage) {
      setIsCapturing(true);
      startCamera();
    }
    return () => {
      if (!opened) {
        stopCamera();
      }
    };
  }, [opened, capturedImage, startCamera, stopCamera]);

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={t('timekeeper.clock.camera.title')}
      size="lg"
      centered
    >
      <Stack>
        {error && (
          <Alert color="red" title={t('timekeeper.clock.camera.error')}>
            {error}
          </Alert>
        )}

        {isCapturing && !error && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                maxHeight: '400px',
                borderRadius: '8px',
                backgroundColor: '#000',
              }}
            />
            <Button
              fullWidth
              size="lg"
              leftSection={<IconCamera size={20} />}
              onClick={capturePhoto}
            >
              {t('timekeeper.clock.camera.capture')}
            </Button>
          </>
        )}

        {capturedImage && (
          <>
            <img
              src={capturedImage}
              alt="Captured"
              style={{
                width: '100%',
                maxHeight: '400px',
                borderRadius: '8px',
              }}
            />
            <Group grow>
              <Button
                variant="outline"
                leftSection={<IconRefresh size={20} />}
                onClick={handleRetake}
              >
                {t('timekeeper.clock.camera.retake')}
              </Button>
              <Button leftSection={<IconCamera size={20} />} onClick={handleConfirm}>
                {t('timekeeper.clock.camera.confirm')}
              </Button>
            </Group>
          </>
        )}

        {hasPermission === false && (
          <Stack align="center" gap="md">
            <Text c="dimmed" ta="center">
              {t('timekeeper.clock.camera.permissionRequired')}
            </Text>
            <Button onClick={startCamera}>{t('timekeeper.clock.camera.requestPermission')}</Button>
          </Stack>
        )}
      </Stack>

      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
        width={PHOTO_CONFIG.maxWidth}
        height={PHOTO_CONFIG.maxHeight}
      />
    </Modal>
  );
}
