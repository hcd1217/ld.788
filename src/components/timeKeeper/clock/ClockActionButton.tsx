import { useState, useCallback } from 'react';
import { Button, Stack, Text, Loader, Group } from '@mantine/core';
import { IconClock, IconClockOff, IconCoffee, IconCamera } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { MobileCameraCapture } from './MobileCameraCapture';
import { PhotoConfirmDrawer } from './PhotoConfirmDrawer';
import type { ClockStatus } from '@/types/timekeeper';

interface ClockActionButtonProps {
  readonly status: ClockStatus | null;
  readonly isLoading: boolean;
  readonly onClockIn: (photo?: {
    base64: string;
    timestamp: Date;
    metadata: {
      deviceId?: string;
      compression: number;
      originalSize: number;
    };
  }) => Promise<void>;
  readonly onClockOut: (photo?: {
    base64: string;
    timestamp: Date;
    metadata: {
      deviceId?: string;
      compression: number;
      originalSize: number;
    };
  }) => Promise<void>;
  readonly onStartBreak: () => Promise<void>;
  readonly onEndBreak: () => Promise<void>;
  readonly requirePhoto?: boolean;
  readonly location?: { latitude: number; longitude: number };
}

export function ClockActionButton({
  status,
  isLoading,
  onClockIn,
  onClockOut,
  onStartBreak,
  onEndBreak,
  requirePhoto = true,
  location,
}: ClockActionButtonProps) {
  const { t } = useTranslation();
  const [showCamera, setShowCamera] = useState(false);
  const [showConfirmDrawer, setShowConfirmDrawer] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<{
    base64: string;
    timestamp: Date;
    metadata: {
      deviceId?: string;
      compression: number;
      originalSize: number;
    };
  } | null>(null);
  const [pendingAction, setPendingAction] = useState<'clockIn' | 'clockOut' | null>(null);

  const handleClockIn = useCallback(async () => {
    if (requirePhoto) {
      setPendingAction('clockIn');
      setShowCamera(true);
    } else {
      await onClockIn();
    }
  }, [requirePhoto, onClockIn]);

  const handleClockOut = useCallback(async () => {
    if (requirePhoto) {
      setPendingAction('clockOut');
      setShowCamera(true);
    } else {
      await onClockOut();
    }
  }, [requirePhoto, onClockOut]);

  // Handle photo capture from camera
  const handlePhotoCapture = useCallback(
    (photo: {
      base64: string;
      timestamp: Date;
      metadata: {
        deviceId?: string;
        compression: number;
        originalSize: number;
      };
    }) => {
      setCapturedPhoto(photo);
      setShowCamera(false);
      setShowConfirmDrawer(true);
    },
    [],
  );

  // Handle photo confirmation
  const handlePhotoConfirm = useCallback(async () => {
    if (!capturedPhoto) return;

    setShowConfirmDrawer(false);

    if (pendingAction === 'clockIn') {
      await onClockIn(capturedPhoto);
    } else if (pendingAction === 'clockOut') {
      await onClockOut(capturedPhoto);
    }

    setCapturedPhoto(null);
    setPendingAction(null);
  }, [capturedPhoto, pendingAction, onClockIn, onClockOut]);

  // Handle photo retake
  const handlePhotoRetake = useCallback(() => {
    setShowConfirmDrawer(false);
    setCapturedPhoto(null);
    setShowCamera(true);
  }, []);

  const getButtonConfig = () => {
    if (!status || status === 'CLOCKED_OUT') {
      return {
        color: 'green',
        icon: <IconClock size={24} />,
        text: t('timekeeper.clock.clockIn'),
        action: handleClockIn,
      };
    }

    if (status === 'CLOCKED_IN') {
      return {
        color: 'red',
        icon: <IconClockOff size={24} />,
        text: t('timekeeper.clock.clockOut'),
        action: handleClockOut,
      };
    }

    if (status === 'ON_BREAK') {
      return {
        color: 'blue',
        icon: <IconCoffee size={24} />,
        text: t('timekeeper.clock.endBreak'),
        action: onEndBreak,
      };
    }

    return null;
  };

  const buttonConfig = getButtonConfig();

  if (!buttonConfig) return null;

  return (
    <>
      <Stack align="center" gap="md">
        <Button
          size="xl"
          radius="xl"
          color={buttonConfig.color}
          onClick={buttonConfig.action}
          disabled={isLoading}
          style={{
            width: '200px',
            height: '200px',
            fontSize: '1.2rem',
          }}
        >
          <Stack align="center" gap="sm">
            {isLoading ? (
              <Loader color="white" size="lg" />
            ) : (
              <>
                {buttonConfig.icon}
                <Text size="lg" fw={600}>
                  {buttonConfig.text}
                </Text>
                {requirePhoto && (
                  <Group gap={4}>
                    <IconCamera size={16} />
                    <Text size="xs">{t('timekeeper.clock.photoRequired')}</Text>
                  </Group>
                )}
              </>
            )}
          </Stack>
        </Button>

        {status === 'CLOCKED_IN' && (
          <Button
            variant="outline"
            color="orange"
            leftSection={<IconCoffee size={20} />}
            onClick={onStartBreak}
            disabled={isLoading}
            size="lg"
          >
            {t('timekeeper.clock.startBreak')}
          </Button>
        )}
      </Stack>

      <MobileCameraCapture
        opened={showCamera}
        onClose={() => {
          setShowCamera(false);
          setPendingAction(null);
          setCapturedPhoto(null);
        }}
        onCapture={handlePhotoCapture}
        location={location}
      />

      <PhotoConfirmDrawer
        opened={showConfirmDrawer}
        onClose={() => {
          setShowConfirmDrawer(false);
          setCapturedPhoto(null);
          setPendingAction(null);
        }}
        onConfirm={handlePhotoConfirm}
        onRetake={handlePhotoRetake}
        photo={capturedPhoto?.base64 || null}
      />
    </>
  );
}
