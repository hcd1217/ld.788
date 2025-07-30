import {useCallback, useEffect, useState} from 'react';
import {useNavigate} from 'react-router';
import useTranslation from '@/hooks/useTranslation';
import {clientManagementService} from '@/services/clientManagement';
import type {ClientDetail} from '@/lib/api';
import {ROUTERS} from '@/config/routeConfig';

export function useClientDetail(clientCode: string | undefined) {
  const navigate = useNavigate();
  const {t} = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [client, setClient] = useState<ClientDetail | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  const loadClient = useCallback(
    async (withLoadingState = true) => {
      if (!clientCode) {
        navigate(ROUTERS.ADMIN_CLIENTS);
        return;
      }

      if (withLoadingState) {
        setIsLoading(true);
        setError(undefined);
      }

      try {
        const clientData =
          await clientManagementService.getClientByClientCode(clientCode);
        setClient(clientData);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : t('errors.failedToLoadClient');
        if (withLoadingState) {
          setError(errorMessage);
        }

        console.error('Failed to load client:', error);
      } finally {
        if (withLoadingState) {
          setIsLoading(false);
        }
      }
    },
    [clientCode, navigate, t],
  );

  useEffect(() => {
    void loadClient();
  }, [loadClient]);

  return {
    client,
    isLoading,
    error,
    reload: loadClient,
  };
}
