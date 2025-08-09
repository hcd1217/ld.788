import { Badge } from '@mantine/core';
import { useTranslation } from '@/hooks/useTranslation';

interface ProductStatusBadgeProps {
  readonly status: string;
}

export function ProductStatusBadge({ status }: ProductStatusBadgeProps) {
  const { t } = useTranslation();

  const statusConfig: Record<string, { color: string; label: string }> = {
    ACTIVE: { color: 'green', label: t('product.status.active') },
    INACTIVE: { color: 'gray', label: t('product.status.inactive') },
    DISCONTINUED: { color: 'red', label: t('product.status.discontinued') },
    OUT_OF_STOCK: { color: 'orange', label: t('product.status.outOfStock') },
    LOW_STOCK: { color: 'yellow', label: t('product.status.lowStock') },
  };

  const config = statusConfig[status] || { color: 'gray', label: status };
  return <Badge color={config.color}>{config.label}</Badge>;
}
