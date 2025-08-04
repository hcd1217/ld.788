import { useEffect } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { updateClientBranding } from '@/utils/clientBranding';

/**
 * Hook that updates the browser favicon and title based on client configuration
 */
export const useClientBranding = (): void => {
  const publicClientConfig = useAppStore((state) => state.publicClientConfig);

  useEffect(() => {
    updateClientBranding(publicClientConfig);
  }, [publicClientConfig]);
};
