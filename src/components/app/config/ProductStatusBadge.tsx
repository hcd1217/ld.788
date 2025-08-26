import { Badge } from '@mantine/core';
import { useTranslation } from '@/hooks/useTranslation';

interface ProductStatusBadgeProps {
  readonly status: string;
}

export function ProductStatusBadge({ status }: ProductStatusBadgeProps) {
  const { t } = useTranslation();

  const statusConfig: Record<string, { color: string; label: string }> = {
    ACTIVE: { color: 'var(--app-active-color)', label: t('product.status.active') },
    INACTIVE: { color: 'var(--mantine-color-gray-6)', label: t('product.status.inactive') },
    DISCONTINUED: { color: 'var(--mantine-color-red-6)', label: t('product.status.discontinued') },
    OUT_OF_STOCK: { color: 'var(--mantine-color-orange-6)', label: t('product.status.outOfStock') },
    LOW_STOCK: { color: 'var(--mantine-color-yellow-6)', label: t('product.status.lowStock') },
  };

  const config = statusConfig[status] || { color: 'gray', label: status };
  return <Badge color={config.color}>{config.label}</Badge>;
}
