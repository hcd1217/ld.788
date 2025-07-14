import {useState} from 'react';
import {Box, Text, Alert} from '@mantine/core';
import {IconAlertCircle} from '@tabler/icons-react';
import {GoogleMap, useLoadScript, Marker} from '@react-google-maps/api';

const libraries: Array<'places'> = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '8px',
};

const defaultCenter = {
  lat: 37.7749, // San Francisco
  lng: -122.4194,
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
  const [mapError, setMapError] = useState<string | undefined>(null);

  const {isLoaded, loadError} = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const handleMapError = () => {
    setMapError('Failed to load map. Please check your internet connection.');
  };

  if (loadError) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
        Failed to load Google Maps. Please check your API configuration.
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
          Loading map...
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
        Google Maps API key not configured. Map display is disabled.
        {address ? (
          <Text size="sm" mt="xs">
            Selected address: {address}
          </Text>
        ) : null}
      </Alert>
    );
  }

  if (mapError) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
        {mapError}
        {address ? (
          <Text size="sm" mt="xs">
            Selected address: {address}
          </Text>
        ) : null}
      </Alert>
    );
  }

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
        onError={handleMapError}
      >
        <Marker position={location} title={address || 'Selected location'} />
      </GoogleMap>
    </Box>
  );
}
