import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { MobileCameraCapture } from '@/components/timeKeeper/clock/MobileCameraCapture';
import { TimekeeperErrorBoundary } from '@/components/timeKeeper';
import { useTimekeeperStore } from '@/stores/useTimekeeperStore';
import { useDeviceType } from '@/hooks/useDeviceType';
import { ROUTERS } from '@/config/routeConfig';
import { logError } from '@/utils/logger';

function ClockManagementPageContent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isMobile } = useDeviceType();
  const [userLocation, setUserLocation] = useState<
    { latitude: number; longitude: number } | undefined
  >();
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const { currentClock, clockIn, clockOut, fetchTodayClockEntries, getCurrentClockStatus } =
    useTimekeeperStore();

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
          logError('Location error:', error, {
            module: 'ClockManagementPagePage',
            action: 'if',
          });
          setLocationError(t('timekeeper.clock.location.error'));
        },
      );
    } else {
      setLocationError(t('timekeeper.clock.location.notSupported'));
    }
  }, [t]);

  // Fetch initial data and show camera immediately on mobile
  useEffect(() => {
    getCurrentClockStatus();
    fetchTodayClockEntries();

    // Show camera immediately on mobile
    if (isMobile) {
      setShowCamera(true);
    }
  }, [getCurrentClockStatus, fetchTodayClockEntries, isMobile]);

  // Handle camera capture
  const handleCameraCapture = async (photo: {
    base64: string;
    timestamp: Date;
    metadata: {
      deviceId?: string;
      compression: number;
      originalSize: number;
    };
  }) => {
    // Determine action based on current clock status
    if (currentClock?.status === 'CLOCKED_IN') {
      await clockOut({
        location: userLocation,
        photo,
      });
    } else {
      await clockIn({
        location: userLocation,
        photo,
      });
    }
    navigate(ROUTERS.TIME_KEEPER_MY_TIMESHEET);
  };

  // Handle camera close (reject photo)
  const handleCameraClose = () => {
    navigate(ROUTERS.TIME_KEEPER_MY_TIMESHEET);
  };
  return (
    <MobileCameraCapture
      opened={showCamera}
      onClose={handleCameraClose}
      onCapture={handleCameraCapture}
      location={locationError ? undefined : userLocation}
    />
  );
}

export function ClockManagementPage() {
  return (
    <TimekeeperErrorBoundary componentName="ClockManagement">
      <ClockManagementPageContent />
    </TimekeeperErrorBoundary>
  );
}
