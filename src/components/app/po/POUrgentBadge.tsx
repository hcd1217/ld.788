import { Badge, type BadgeProps } from '@mantine/core';

import { useTranslation } from '@/hooks/useTranslation';

type POUrgentBadgeProps = {
  readonly isUrgentPO?: boolean;
  /** Badge size */
  readonly size?: BadgeProps['size'];
  /** Badge variant */
  readonly variant?: BadgeProps['variant'];
  /** Badge radius */
  readonly radius?: BadgeProps['radius'];
};

export function POUrgentBadge({
  size = 'sm',
  variant = 'filled',
  radius = 'sm',
  isUrgentPO,
}: POUrgentBadgeProps) {
  const { t } = useTranslation();
  if (!isUrgentPO) {
    return null;
  }
  return (
    <Badge color="red" size={size} variant={variant} radius={radius}>
      {t('po.isUrgentPO')}
    </Badge>
  );
}
