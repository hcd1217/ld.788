import { useParams } from 'react-router';
import { useAppStore } from '@/stores/useAppStore';

export function useClientCode() {
  const { clientCode } = useAppStore();
  const params = useParams();
  return params.clientCode ?? clientCode ?? 'ACME';
}
