import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Badge, Button, Group, Image, Loader, Stack, Text } from '@mantine/core';
import { IconCamera, IconCheck, IconRotate, IconX } from '@tabler/icons-react';

import { useTranslation } from '@/hooks/useTranslation';
import { logError } from '@/utils/logger';
import { showErrorNotification } from '@/utils/notifications';
import { formatDateTime } from '@/utils/time';

export type PhotoConfig = {
  readonly quality?: number;
  readonly maxWidth?: number;
  readonly maxHeight?: number;
  readonly targetSize?: number;
  readonly minQuality?: number;
  readonly includeTimestamp?: boolean;
  readonly includeLocation?: boolean;
};

export type PhotoCaptureProps = {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly onCapture: (photo: string) => Promise<void>;
  readonly config?: PhotoConfig;
  readonly labels?: {
    readonly capture?: string;
    readonly retake?: string;
    readonly keep?: string;
    readonly uploading?: string;
    readonly permissionDenied?: string;
    readonly tryAgain?: string;
  };
};

const DEFAULT_CONFIG: Required<PhotoConfig> = {
  quality: 0.8,
  maxWidth: 1024,
  maxHeight: 768,
  targetSize: 200 * 1024, // 200KB
  minQuality: 0.3,
  includeTimestamp: true,
  includeLocation: true,
};

type LocationInfo = {
  readonly latitude: number;
  readonly longitude: number;
  readonly address?: string;
};

type ViewMode = 'camera' | 'review';

export function PhotoCapture({ opened, onClose, onCapture, config, labels }: PhotoCaptureProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const mergedConfig = useMemo(() => {
    return { ...DEFAULT_CONFIG, ...config };
  }, [config]);

  const mergedLabels = useMemo(() => {
    return {
      capture: labels?.capture ?? t('common.photos.capture'),
      retake: labels?.retake ?? t('common.photos.retake'),
      keep: labels?.keep ?? t('common.photos.upload'),
      uploading: labels?.uploading ?? t('common.photos.uploading'),
      permissionDenied: labels?.permissionDenied ?? t('common.photos.permissionDenied'),
      tryAgain: labels?.tryAgain ?? t('common.tryAgain'),
    };
  }, [labels, t]);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('camera');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [photoSize, setPhotoSize] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [location, setLocation] = useState<LocationInfo | null>(null);

  // Get user location
  const getLocation = useCallback(async () => {
    if (!mergedConfig.includeLocation) return;

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        });
      });

      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch (error) {
      logError('Failed to get location:', error, {
        module: 'PhotoCapture',
        action: 'getLocation',
      });
      // Don't show error notification as location is optional
    }
  }, [mergedConfig.includeLocation]);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setCameraError(false);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: mergedConfig.maxWidth },
          height: { ideal: mergedConfig.maxHeight },
          facingMode: 'environment',
        },
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Get location when camera starts
      getLocation();
    } catch (error) {
      logError('Failed to start camera:', error, {
        module: 'PhotoCapture',
        action: 'startCamera',
      });
      setCameraError(true);
      showErrorNotification(t('common.photos.permissionDenied'), mergedLabels.permissionDenied);
    }
  }, [t, mergedConfig, mergedLabels.permissionDenied, getLocation]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  // Auto-start camera when opened
  useEffect(() => {
    if (opened && viewMode === 'camera') {
      startCamera();
    }
    return () => {
      if (opened) {
        stopCamera();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, viewMode]);

  // Draw overlay text on canvas
  const drawOverlay = useCallback(
    (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      if (!mergedConfig.includeTimestamp && !mergedConfig.includeLocation) return;

      // Prepare overlay text
      const overlayLines: string[] = [];

      // Add timestamp
      if (mergedConfig.includeTimestamp) {
        const now = new Date();
        overlayLines.push(formatDateTime(now));
      }

      // Add location
      if (mergedConfig.includeLocation && location) {
        const locationText = `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
        overlayLines.push(locationText);
      }

      if (overlayLines.length === 0) return;

      // Configure text style
      const fontSize = Math.max(16, canvas.width * 0.025); // Scale with canvas size
      ctx.font = `${fontSize}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      // Calculate text dimensions for background
      const padding = fontSize * 0.5;
      const lineHeight = fontSize * 1.3;
      const maxWidth = Math.max(...overlayLines.map((line) => ctx.measureText(line).width));
      const totalHeight = overlayLines.length * lineHeight + padding * 2;

      // Position in bottom-left corner
      const x = padding;
      const y = canvas.height - totalHeight - padding;

      // Draw semi-transparent background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(x, y, maxWidth + padding * 2, totalHeight);

      // Draw text
      ctx.fillStyle = 'white';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      overlayLines.forEach((line, index) => {
        ctx.fillText(line, x + padding, y + padding + index * lineHeight);
      });

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    },
    [mergedConfig.includeTimestamp, mergedConfig.includeLocation, location],
  );

  // Capture photo
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0);

    // Add overlay
    drawOverlay(ctx, canvas);

    // Get initial capture
    const base64 = canvas.toDataURL('image/jpeg', mergedConfig.quality);

    // Compress image
    const compressed = await compressImage(base64, mergedConfig);

    // Calculate size in KB
    const sizeInBytes = Math.round((compressed.length * 3) / 4); // Approximate base64 to bytes
    setPhotoSize(Math.round(sizeInBytes / 1024));

    setCapturedPhoto(compressed);
    setViewMode('review');
    stopCamera();
  }, [stopCamera, mergedConfig, drawOverlay]);

  // Handle close
  const handleClose = useCallback(() => {
    stopCamera();
    setCapturedPhoto(null);
    setPhotoSize(0);
    setCameraError(false);
    setViewMode('camera');
    setIsProcessing(false);
    setLocation(null);
    onClose();
  }, [stopCamera, onClose]);

  // Accept captured photo
  const acceptPhoto = useCallback(async () => {
    if (isProcessing) return;
    if (!capturedPhoto) return;

    setIsProcessing(true);
    try {
      await onCapture(capturedPhoto);
      handleClose();
    } catch (error) {
      logError('Failed to process photo', error, {
        module: 'PhotoCapture',
        action: 'acceptPhoto',
      });
      // Error notification should be handled by the parent component
      setIsProcessing(false);
    }
  }, [capturedPhoto, onCapture, handleClose, isProcessing]);

  // Retake photo
  const retakePhoto = useCallback(() => {
    setCapturedPhoto(null);
    setPhotoSize(0);
    setViewMode('camera');
    startCamera();
  }, [startCamera]);

  if (!opened) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: 'black',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Camera View */}
      {viewMode === 'camera' && !cameraError && (
        <div style={{ flex: 1, position: 'relative', backgroundColor: 'black' }}>
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

          {/* Close button */}
          <Button
            pos="absolute"
            top={16}
            right={16}
            size="md"
            variant="subtle"
            color="white"
            onClick={handleClose}
            styles={{
              root: {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                },
              },
            }}
          >
            <IconX size={20} />
          </Button>

          {/* Capture button */}
          <Button
            pos="absolute"
            bottom={32}
            left="50%"
            style={{ transform: 'translateX(-50%)' }}
            size="xl"
            radius="xl"
            color="white"
            variant="filled"
            leftSection={<IconCamera size={28} />}
            onClick={capturePhoto}
            styles={{
              root: {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: 'black',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                },
              },
            }}
          >
            {mergedLabels.capture}
          </Button>
        </div>
      )}

      {/* Review View */}
      {viewMode === 'review' && capturedPhoto && (
        <>
          <div style={{ flex: 1, position: 'relative', backgroundColor: 'black' }}>
            <Image
              src={capturedPhoto}
              alt="Captured photo"
              fit="contain"
              style={{
                width: '100%',
                height: '100%',
              }}
            />

            {/* Close button */}
            <Button
              pos="absolute"
              top={16}
              left={16}
              size="md"
              variant="subtle"
              color="white"
              onClick={handleClose}
              styles={{
                root: {
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  },
                },
              }}
            >
              <IconX size={20} />
            </Button>

            {/* Photo size indicator */}
            {photoSize > 0 && (
              <Badge
                pos="absolute"
                top={16}
                right={16}
                color={photoSize < 200 ? 'green' : 'orange'}
                variant="filled"
              >
                {photoSize}KB
              </Badge>
            )}
          </div>

          {/* Action buttons */}
          <Group
            p="md"
            justify="center"
            gap="md"
            wrap="nowrap"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          >
            <Button
              size="lg"
              variant="outline"
              color="red"
              leftSection={<IconRotate size={20} />}
              onClick={retakePhoto}
              disabled={isProcessing}
              styles={{
                root: {
                  borderColor: 'white',
                  color: 'white',
                },
              }}
            >
              {mergedLabels.retake}
            </Button>
            <Button
              size="lg"
              variant="filled"
              color="green"
              leftSection={
                isProcessing ? <Loader size={20} color="white" /> : <IconCheck size={20} />
              }
              onClick={acceptPhoto}
            >
              {isProcessing ? mergedLabels.uploading : mergedLabels.keep}
            </Button>
          </Group>
        </>
      )}

      {/* Camera error state */}
      {cameraError && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Close button */}
          <Button
            pos="absolute"
            top={16}
            left={16}
            size="md"
            variant="subtle"
            color="white"
            onClick={handleClose}
            styles={{
              root: {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                },
              },
            }}
          >
            <IconX size={20} />
          </Button>

          <Stack align="center" gap="md">
            <IconCamera size={48} color="white" />
            <Text c="white" ta="center" size="lg">
              {mergedLabels.permissionDenied}
            </Text>
            <Button
              onClick={startCamera}
              leftSection={<IconCamera size={16} />}
              size="lg"
              variant="filled"
            >
              {mergedLabels.tryAgain}
            </Button>
          </Stack>
        </div>
      )}

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

// Compress image to target size
const compressImage = async (
  base64: string,
  config: Required<PhotoConfig> = DEFAULT_CONFIG,
): Promise<string> => {
  return new Promise((resolve) => {
    const img = document.createElement('img');
    img.addEventListener('load', () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64);
        return;
      }

      // Calculate dimensions to maintain aspect ratio
      let { width, height } = img;
      const maxDim = Math.max(width, height);
      if (maxDim > config.maxWidth) {
        const scale = config.maxWidth / maxDim;
        width *= scale;
        height *= scale;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // Try different quality levels to achieve target size
      let quality = config.quality;
      let compressed = canvas.toDataURL('image/jpeg', quality);

      // Estimate size and adjust quality
      while (compressed.length > config.targetSize && quality > config.minQuality) {
        quality -= 0.1;
        compressed = canvas.toDataURL('image/jpeg', quality);
      }

      resolve(compressed);
    });
    img.src = base64;
  });
};
