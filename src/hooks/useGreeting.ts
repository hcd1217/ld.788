import { useTranslation } from '@/hooks/useTranslation';

/**
 * Hook to get a time-of-day appropriate greeting
 * Recalculated on each render to ensure accuracy
 * @returns Translated greeting string
 */
export function useGreeting(): string {
  const { t } = useTranslation();

  const hour = new Date().getHours();

  if (hour < 12) {
    return t('timekeeper.greeting.morning');
  }
  if (hour < 17) {
    return t('timekeeper.greeting.afternoon');
  }
  return t('timekeeper.greeting.evening');
}
