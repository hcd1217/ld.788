import { useRef, useState, useCallback, useEffect } from 'react';
import { Box, Text, Stack, Button, Group } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface MobileCameraCaptureProps {
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

const COUNTDOWN_SECONDS = 3;

export function MobileCameraCapture({
  opened,
  onClose,
  onCapture,
  location,
}: MobileCameraCaptureProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [countdown, setCountdown] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err) {
      console.error('Camera access denied:', err);
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
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate dimensions maintaining aspect ratio
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    const aspectRatio = videoWidth / videoHeight;

    let canvasWidth = videoWidth;
    let canvasHeight = videoHeight;

    // Scale down if needed while maintaining aspect ratio
    if (videoWidth > PHOTO_CONFIG.maxWidth) {
      canvasWidth = PHOTO_CONFIG.maxWidth;
      canvasHeight = canvasWidth / aspectRatio;
    }

    if (canvasHeight > PHOTO_CONFIG.maxHeight) {
      canvasHeight = PHOTO_CONFIG.maxHeight;
      canvasWidth = canvasHeight * aspectRatio;
    }

    // Set canvas dimensions to match video aspect ratio
    canvas.width = Math.round(canvasWidth);
    canvas.height = Math.round(canvasHeight);

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
    const originalSize = Math.round((base64.length * 3) / 4);

    // Stop camera and send photo
    stopCamera();

    onCapture({
      base64,
      timestamp,
      metadata: {
        compression: PHOTO_CONFIG.quality,
        originalSize,
      },
    });
  }, [location, stopCamera, onCapture]);

  // Start countdown
  const startCountdown = useCallback(() => {
    let seconds = COUNTDOWN_SECONDS;
    setCountdown(seconds);

    countdownRef.current = setInterval(() => {
      seconds -= 1;
      setCountdown(seconds);

      if (seconds <= 0) {
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
        setCountdown(null);
        capturePhoto();
      }
    }, 1000);
  }, [capturePhoto]);

  // Handle close
  const handleClose = useCallback(() => {
    stopCamera();
    setCountdown(null);
    setError(null);
    onClose();
  }, [stopCamera, onClose]);

  // Start camera and countdown when opened
  useEffect(() => {
    if (opened) {
      startCamera().then(() => {
        // Give user a moment to position themselves
        setTimeout(() => {
          startCountdown();
        }, 1000);
      });
    }

    return () => {
      if (!opened) {
        stopCamera();
      }
    };
  }, [opened, startCamera, startCountdown, stopCamera]);

  if (!opened) return null;

  return (
    <Box
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: 'black',
      }}
    >
      {/* Close button */}
      <Button
        variant="subtle"
        color="white"
        onClick={handleClose}
        style={{
          position: 'absolute',
          top: 'var(--mantine-spacing-md)',
          right: 'var(--mantine-spacing-md)',
          zIndex: 10000,
        }}
      >
        <IconX size={24} />
      </Button>

      {/* Camera view */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* Countdown overlay */}
      {countdown !== null && (
        <Box
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10000,
          }}
        >
          <Stack align="center" gap="lg">
            <Text
              size="6rem"
              fw={700}
              c="white"
              style={{
                textShadow: '0 0 20px rgba(0,0,0,0.8)',
              }}
            >
              {countdown}
            </Text>
            <Text
              size="xl"
              c="white"
              style={{
                textShadow: '0 0 10px rgba(0,0,0,0.8)',
              }}
            >
              {t('timekeeper.clock.camera.getReady')}
            </Text>
          </Stack>
        </Box>
      )}

      {/* Error message */}
      {error && (
        <Box
          style={{
            position: 'absolute',
            bottom: 'var(--mantine-spacing-xl)',
            left: 'var(--mantine-spacing-md)',
            right: 'var(--mantine-spacing-md)',
            zIndex: 10000,
          }}
        >
          <Group justify="center">
            <Text c="white" ta="center">
              {error}
            </Text>
          </Group>
        </Box>
      )}

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Box>
  );
}
