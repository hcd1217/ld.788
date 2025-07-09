import {useMemo} from 'react';
import {useParams} from 'react-router';
import {useAppConfigStore} from '@/stores/useAppStore';

export function useClientCode() {
  const storeClientCode = useAppConfigStore((state) => state.clientCode);
  const params = useParams();

  // Memoize clientCode derivation to prevent unnecessary re-renders
  const clientCode = useMemo(() => {
    return params.clientCode ?? storeClientCode ?? 'ACME';
  }, [params.clientCode, storeClientCode]);

  return clientCode;
}
