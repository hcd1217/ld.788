import {useParams} from 'react-router';
import {useAppStore} from '@/stores/useAppStore';

export function useClientCode() {
  const {clientCode} = useAppStore();
  const params = useParams();
  // Cspell:disable
  return params.clientCode ?? clientCode ?? 'NKTU';
}
