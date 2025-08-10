import { useEffect, useState } from 'react';
import { Container, Grid, Stack, Title, Alert, Paper } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { IconAlertCircle } from '@tabler/icons-react';
import { ClockDisplay } from '@/components/timeKeeper/clock/ClockDisplay';
import { ClockActionButton } from '@/components/timeKeeper/clock/ClockActionButton';
import { ClockTimeline } from '@/components/timeKeeper/clock/ClockTimeline';
import { useTimekeeperStore } from '@/stores/useTimekeeperStore';
import { AppMobileLayout } from '@/components/common/layouts/AppMobileLayout';
import { AppDesktopLayout } from '@/components/common/layouts/AppDesktopLayout';
import { useDeviceType } from '@/hooks/useDeviceType';
import { AppPageTitle } from '@/components/common';
import { TimekeeperMobileFooter } from '@/components/timeKeeper';

export function ClockManagementPage() {
  const { t } = useTranslation();
  const { isMobile } = useDeviceType();
  const [userLocation, setUserLocation] = useState<
    { latitude: number; longitude: number } | undefined
  >();
  const [locationError, setLocationError] = useState<string | null>(null);

  const {
    currentClock,
    todayClockEntries,
    clockPhotos,
    isClockActionLoading,
    error,
    clockIn,
    clockOut,
    startBreak,
    endBreak,
    fetchTodayClockEntries,
    getCurrentClockStatus,
    clearError,
  } = useTimekeeperStore();

  // Get user location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Location error:', error);
          setLocationError(t('timekeeper.clock.location.error'));
        },
      );
    } else {
      setLocationError(t('timekeeper.clock.location.notSupported'));
    }
  }, [t]);

  // Fetch initial data
  useEffect(() => {
    getCurrentClockStatus();
    fetchTodayClockEntries();
  }, [getCurrentClockStatus, fetchTodayClockEntries]);

  // Handle clock actions with photo
  const handleClockIn = async (photo?: {
    base64: string;
    timestamp: Date;
    metadata: {
      deviceId?: string;
      compression: number;
      originalSize: number;
    };
  }) => {
    await clockIn({
      location: userLocation,
      photo,
    });
  };

  const handleClockOut = async (photo?: {
    base64: string;
    timestamp: Date;
    metadata: {
      deviceId?: string;
      compression: number;
      originalSize: number;
    };
  }) => {
    await clockOut({
      location: userLocation,
      photo,
    });
  };

  const content = (
    <Container size="xl" py="lg">
      <Stack gap="lg">
        <Title visibleFrom="sm" order={2}>
          {t('timekeeper.clock.title')}
        </Title>

        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            onClose={clearError}
            withCloseButton
          >
            {error}
          </Alert>
        )}

        {locationError && (
          <Alert icon={<IconAlertCircle size={16} />} color="yellow">
            {locationError}
          </Alert>
        )}

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="lg" h="100%">
              <ClockDisplay />

              <Paper p="lg" radius="md" withBorder style={{ flex: 1 }}>
                <Stack align="center" justify="center" h="100%">
                  <ClockActionButton
                    status={currentClock?.status || null}
                    isLoading={isClockActionLoading}
                    onClockIn={handleClockIn}
                    onClockOut={handleClockOut}
                    onStartBreak={startBreak}
                    onEndBreak={endBreak}
                    requirePhoto={true}
                    location={userLocation}
                  />
                </Stack>
              </Paper>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <ClockTimeline entries={todayClockEntries} photos={clockPhotos} />
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );

  if (isMobile) {
    return (
      <AppMobileLayout
        error={error}
        clearError={clearError}
        footer={<TimekeeperMobileFooter />}
        header={<AppPageTitle fz="h4" title={t('timekeeper.checkIn')} />}
      >
        {content}
      </AppMobileLayout>
    );
  }

  return <AppDesktopLayout>{content}</AppDesktopLayout>;
}
