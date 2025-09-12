import { useCallback, useEffect, useRef, useState } from 'react';

import { Box, Button } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import { logError } from '@/utils/logger';

import { CameraError } from './CameraError';
import { CameraView } from './CameraView';
import { PhotoPreview } from './PhotoPreview';

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

const AUTO_CONFIRM_SECONDS = 5;

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

  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [autoConfirmCountdown, setAutoConfirmCountdown] = useState<number | null>(null);
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
    } catch (error_) {
      logError('Camera access denied:', error_, {
        module: 'MobileCameraCapture',
        action: 'startCamera',
      });
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

  // Capture photo and show preview
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

    // Show preview and start auto-confirm timer
    setCapturedPhoto(base64);
    setAutoConfirmCountdown(AUTO_CONFIRM_SECONDS);

    // Store photo data for later
    (window as any).__tempPhotoData = {
      base64,
      timestamp,
      metadata: {
        compression: PHOTO_CONFIG.quality,
        originalSize,
      },
    };
  }, [location]);

  // Handle photo confirmation
  const confirmPhoto = useCallback(() => {
    const photoData = (window as any).__tempPhotoData;
    if (photoData) {
      stopCamera();
      onCapture(photoData);
      delete (window as any).__tempPhotoData;
    }
  }, [stopCamera, onCapture]);

  // Handle photo retake
  const retakePhoto = useCallback(() => {
    setCapturedPhoto(null);
    setAutoConfirmCountdown(null);
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    delete (window as any).__tempPhotoData;
  }, []);

  // Handle close
  const handleClose = useCallback(() => {
    stopCamera();
    setCapturedPhoto(null);
    setAutoConfirmCountdown(null);
    setError(null);
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    delete (window as any).__tempPhotoData;
    onClose();
  }, [stopCamera, onClose]);

  // Start camera when opened
  useEffect(() => {
    if (opened) {
      startCamera();
    }

    return () => {
      if (!opened) {
        stopCamera();
        setCapturedPhoto(null);
        setAutoConfirmCountdown(null);
      }
    };
  }, [opened, startCamera, stopCamera]);

  // Auto-confirm timer
  useEffect(() => {
    if (autoConfirmCountdown !== null && autoConfirmCountdown > 0) {
      countdownRef.current = setInterval(() => {
        setAutoConfirmCountdown((prev) => {
          if (prev === null || prev <= 1) {
            confirmPhoto();
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
      };
    }
  }, [autoConfirmCountdown, confirmPhoto]);

  if (!opened) return null;

  // Render camera UI in a portal outside of AppShell
  return createPortal(
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

      {/* Camera view or captured photo */}
      {!capturedPhoto ? (
        <CameraView ref={videoRef} onCapture={capturePhoto} />
      ) : (
        <PhotoPreview
          capturedPhoto={capturedPhoto}
          autoConfirmCountdown={autoConfirmCountdown}
          autoConfirmSeconds={AUTO_CONFIRM_SECONDS}
          onRetake={retakePhoto}
          onConfirm={confirmPhoto}
        />
      )}

      {/* Error message */}
      {error && <CameraError error={error} />}

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Box>,
    document.body,
  );
}
