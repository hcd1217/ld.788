import { useEffect, useState } from 'react';
import { Outlet, type Location, useLocation } from 'react-router';
import ErrorPopup from '@/components/errors/error-popup.tsx';
import { trackRouteChange } from '@/services/analytics.ts';

export default function AppWrapper() {
  const location = useLocation();

  const [currentLocation, setCurrentLocation] = useState<Location>();

  useEffect(() => {
    if (currentLocation?.pathname !== location.pathname) {
      trackRouteChange(currentLocation?.pathname, location.pathname, {
        pathname: location.pathname,
      });
      setCurrentLocation(location);
    }
  }, [currentLocation, location]);
  return (
    <>
      <Outlet />
      <ErrorPopup />
    </>
  );
}
