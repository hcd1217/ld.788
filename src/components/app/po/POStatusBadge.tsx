import { Badge, type BadgeProps } from '@mantine/core';

import { PO_STATUS_COLORS } from '@/constants/purchaseOrder';
import { useTranslation } from '@/hooks/useTranslation';
import type { POStatus } from '@/services/sales/purchaseOrder';

type POStatusBadgeProps = {
  readonly status: POStatus;
  /** Badge size */
  readonly size?: BadgeProps['size'];
  /** Badge variant */
  readonly variant?: BadgeProps['variant'];
  /** Badge radius */
  readonly radius?: BadgeProps['radius'];
};

export function POStatusBadge({
  status,
  size = 'sm',
  variant = 'filled',
  radius = 'sm',
}: POStatusBadgeProps) {
  const { t } = useTranslation();
  const color = PO_STATUS_COLORS[status] || 'gray';

  return (
    <Badge
      color={color}
      size={size}
      variant={variant}
      radius={radius}
      aria-label={t('po.statusLabel', { status: t(`po.status.${status}`) })}
    >
      {t(`po.status.${status}`)}
    </Badge>
  );
}
