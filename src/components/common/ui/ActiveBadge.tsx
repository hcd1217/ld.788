import { Badge, type BadgeVariant } from '@mantine/core';

import { useTranslation } from '@/hooks/useTranslation';

type ActiveBadgeProps = {
  readonly label?: string;
  readonly isActive?: boolean;
  readonly variant?: BadgeVariant;
};

export function ActiveBadge({ variant, isActive, label }: ActiveBadgeProps) {
  const { t } = useTranslation();
  return (
    <Badge
      color={isActive ? 'var(--app-active-color)' : 'var(--app-inactive-color)'}
      variant={variant}
      size="sm"
    >
      {label ?? (isActive ? t('employee.active') : t('employee.inactive'))}
    </Badge>
  );
}
