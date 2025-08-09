import { Stack, Text } from '@mantine/core';
import { useTranslation } from '@/hooks/useTranslation';
import { type Product } from '@/services/sales/product';

interface ProductStockInfoProps {
  readonly product: Product;
}

export function ProductStockInfo({ product }: ProductStockInfoProps) {
  const { t } = useTranslation();
  const unit = product.unit || 'pcs';

  return (
    <Stack gap={4}>
      <Text size="sm">{`${product.stockLevel} ${unit}`}</Text>
      {product.minStock !== undefined && (
        <Text size="xs" c="dimmed">
          {t('product.minStock')}: {product.minStock} {unit}
        </Text>
      )}
    </Stack>
  );
}
