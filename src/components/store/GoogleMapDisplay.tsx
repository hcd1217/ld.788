import {Box, Text, Alert} from '@mantine/core';
import {IconAlertCircle} from '@tabler/icons-react';
import {GoogleMap, useLoadScript, Marker} from '@react-google-maps/api';
import {useTranslation} from '@/hooks/useTranslation';

const libraries: Array<'places'> = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '8px',
};

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
};

type GoogleMapDisplayProps = {
  readonly location: {
    lat: number;
    lng: number;
  };
  readonly address?: string;
  readonly zoom?: number;
};

export function GoogleMapDisplay({
  location,
  address,
  zoom = 15,
}: GoogleMapDisplayProps) {
  const {t} = useTranslation();
  // Const [mapError] = useState<string | undefined>(undefined);

  const {isLoaded, loadError} = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  if (loadError) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
        {t('store.failedToLoadMapApi')}
      </Alert>
    );
  }

  if (!isLoaded) {
    return (
      <Box
        bg="gray.1"
        display="flex"
        style={{
          ...mapContainerStyle,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--mantine-color-gray-1)',
        }}
      >
        <Text size="sm" c="dimmed">
          {t('store.loadingMap')}
        </Text>
      </Box>
    );
  }

  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        color="orange"
        variant="light"
      >
        {t('store.mapApiKeyNotConfigured')}
        {address ? (
          <Text size="sm" mt="xs">
            {t('store.selectedAddress')}: {address}
          </Text>
        ) : null}
      </Alert>
    );
  }

  // If (mapError) {
  //   return (
  //     <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
  //       {/* {mapError} */}
  //       {address ? (
  //         <Text size="sm" mt="xs">
  //           {t('store.selectedAddress')}: {address}
  //         </Text>
  //       ) : null}
  //     </Alert>
  //   );
  // }

  return (
    <Box>
      {address ? (
        <Text size="sm" c="dimmed" mb="xs">
          📍 {address}
        </Text>
      ) : null}

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={location}
        zoom={zoom}
        options={mapOptions}
      >
        <Marker
          position={location}
          title={address || t('store.selectedLocation')}
        />
      </GoogleMap>
    </Box>
  );
}
