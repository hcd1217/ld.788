import { Badge, type BadgeVariant, Group } from '@mantine/core';
import { IconUrgent } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';

type UrgentBadgeProps = {
  readonly variant?: BadgeVariant;
  readonly size?: 'xs' | 'sm' | 'md' | 'lg';
  readonly withIcon?: boolean;
};

export function UrgentBadge({
  variant = 'filled',
  size = 'sm',
  withIcon = true,
}: UrgentBadgeProps) {
  const { t } = useTranslation();

  return (
    <Badge color="red" variant={variant} size={size}>
      <Group gap={4} align="center">
        {withIcon && <IconUrgent size={size === 'xs' ? 10 : size === 'sm' ? 12 : 14} />}
        {t('common.urgent')}
      </Group>
    </Badge>
  );
}
