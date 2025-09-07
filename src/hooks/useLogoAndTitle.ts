import { useEffect, useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';

export function useLogoAndTitle(options?: { color?: boolean }) {
  const { publicClientConfig } = useAppStore();
  // Use environment variable as default, fallback to 'Credo' if not set
  const defaultAppName = import.meta.env.VITE_APP_NAME || 'Credo';
  const [title, setTitle] = useState(defaultAppName);
  const [logoUrl, setLogoUrl] = useState(
    options?.color ? '/logo.svg' : '/icons/logo-black-and-white.svg',
  );

  useEffect(() => {
    if (publicClientConfig?.clientName) {
      setTitle(publicClientConfig.clientName);
    }

    if (publicClientConfig?.logoUrl) {
      setLogoUrl(publicClientConfig?.logoUrl);
    }
  }, [publicClientConfig]);

  return {
    logoUrl,
    title,
  };
}
