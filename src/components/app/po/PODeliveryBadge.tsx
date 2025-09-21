import { Badge, type BadgeProps } from '@mantine/core';

import { useTranslation } from '@/hooks/useTranslation';

type PODeliveryBadgeProps = {
  readonly isInternalDelivery?: boolean;
  /** Badge size */
  readonly size?: BadgeProps['size'];
  /** Badge variant */
  readonly variant?: BadgeProps['variant'];
  /** Badge radius */
  readonly radius?: BadgeProps['radius'];
};

export function PODeliveryBadge({
  size = 'sm',
  variant = 'light',
  radius = 'sm',
  isInternalDelivery,
}: PODeliveryBadgeProps) {
  const { t } = useTranslation();
  if (isInternalDelivery) {
    return null;
  }
  return (
    <Badge color="red" size={size} variant={variant} radius={radius}>
      {t('po.externalDelivery')}
    </Badge>
  );
}
