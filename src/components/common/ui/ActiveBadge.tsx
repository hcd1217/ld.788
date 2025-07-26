import {Badge} from '@mantine/core';
import {useTranslation} from '@/hooks/useTranslation';

type ActiveBadgeProps = {
  readonly isActive?: boolean;
};

export function ActiveBadge({isActive}: ActiveBadgeProps) {
  const {t} = useTranslation();
  return (
    <Badge
      color={isActive ? 'var(--app-active-color)' : 'var(--app-inactive-color)'}
      variant="light"
      size="sm"
    >
      {isActive ? t('employee.active') : t('employee.inactive')}
    </Badge>
  );
}
