import { Badge } from '@mantine/core';
import { useTranslation } from '@/hooks/useTranslation';

export function StatusBadge({ isActive }: { isActive: boolean }) {
  const { t } = useTranslation();

  return (
    <Badge color={isActive ? 'green.9' : 'dark.6'} size="md">
      {isActive ? t('employee.active') : t('employee.inactive')}
    </Badge>
  );
}
