import {useState, useRef, useEffect} from 'react';
import {TextInput, Loader, Text} from '@mantine/core';
import {IconMapPin} from '@tabler/icons-react';
import {useLoadScript} from '@react-google-maps/api';
import useTranslation from '@/hooks/useTranslation';

const libraries: Array<'places'> = ['places'];

type LocationInputProps = {
  readonly label?: string;
  readonly placeholder?: string;
  readonly value: string;
  readonly error?: string | React.ReactNode;
  readonly disabled?: boolean;
  readonly onLocationSelect: (
    location: {lat: number; lng: number},
    address: string,
  ) => void;
  readonly onAddressChange: (address: string) => void;
  readonly onFocus?: () => void;
};

export function LocationInput({
  label,
  placeholder,
  value,
  error,
  disabled,
  onLocationSelect,
  onAddressChange,
  onFocus,
}: LocationInputProps) {
  const {t} = useTranslation();
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | undefined>(
    null,
  );

  const defaultLabel = label || t('store.address');
  const defaultPlaceholder = placeholder || t('store.searchForAddress');

  // Load Google Maps API
  const {isLoaded, loadError} = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (isLoaded && inputRef.current && !autocompleteRef.current) {
      // Initialize autocomplete
      autocompleteRef.current = new google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ['establishment', 'geocode'],
          fields: ['formatted_address', 'geometry.location', 'name'],
        },
      );

      // Handle place selection
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();

        if (place?.geometry?.location) {
          const location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };

          const address = place.formatted_address || '';

          setInputValue(address);
          onLocationSelect(location, address);
          onAddressChange(address);
        }
      });
    }

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoaded, onLocationSelect, onAddressChange]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    onAddressChange(newValue);
  };

  const handleFocus = () => {
    onFocus?.();
  };

  if (loadError) {
    return (
      <TextInput
        ref={inputRef}
        label={defaultLabel}
        placeholder={defaultPlaceholder}
        value={inputValue}
        error={error || t('store.failedToLoadGoogleMaps')}
        disabled={disabled}
        leftSection={<IconMapPin size={16} />}
        onChange={handleInputChange}
        onFocus={handleFocus}
      />
    );
  }

  if (!isLoaded) {
    return (
      <TextInput
        disabled
        label={defaultLabel}
        placeholder={t('store.loadingGoogleMaps')}
        rightSection={<Loader size="xs" />}
        leftSection={<IconMapPin size={16} />}
      />
    );
  }

  // Check if API key is missing
  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return (
      <div>
        <TextInput
          ref={inputRef}
          label={defaultLabel}
          placeholder={defaultPlaceholder}
          value={inputValue}
          error={error}
          disabled={disabled}
          leftSection={<IconMapPin size={16} />}
          onChange={handleInputChange}
          onFocus={handleFocus}
        />
        <Text size="xs" c="orange" mt={4}>
          {t('store.googleMapsApiKeyNotConfigured')}
        </Text>
      </div>
    );
  }

  return (
    <TextInput
      ref={inputRef}
      label={defaultLabel}
      placeholder={defaultPlaceholder}
      value={inputValue}
      error={error}
      disabled={disabled}
      leftSection={<IconMapPin size={16} />}
      description={t('store.startTypingForSuggestions')}
      onChange={handleInputChange}
      onFocus={handleFocus}
    />
  );
}
