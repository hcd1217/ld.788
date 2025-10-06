import { Box, Card, Group, type MantineStyleProp, Stack, Text } from '@mantine/core';

import { ActiveBadge } from '@/components/common';
import { useTranslation } from '@/hooks/useTranslation';
import type { Product } from '@/services/sales/product';

type ProductCardProps = {
  readonly product: Product;
  /** Custom styles for the card container */
  readonly style?: MantineStyleProp;
  /** Custom className for the card container */
  readonly className?: string;
};

export function ProductCard({ product, style, className }: ProductCardProps) {
  const { t } = useTranslation();

  return (
    <Card withBorder shadow="sm" padding="xs" radius="md" style={style} className={className}>
      <Group justify="space-between" align="flex-start" style={{ position: 'relative' }}>
        <Stack gap="xs">
          <Group gap="xs" wrap="nowrap">
            <Text fw={500} size="sm">
              {product.name}
            </Text>
          </Group>
          <Group gap="xs" wrap="nowrap">
            <Text size="xs" c="dimmed">
              {t('product.productCode')}:
            </Text>
            <Text size="xs" fw={500}>
              {product.productCode}
            </Text>
          </Group>
          <Group gap="xs" wrap="nowrap">
            <Text size="xs" c="dimmed">
              {t('product.category')}:
            </Text>
            <Text size="xs" fw={500}>
              {product.category ?? '-'}
            </Text>
          </Group>
          <Group gap="xs" wrap="nowrap">
            <Text size="xs" c="dimmed">
              {t('product.unit')}:
            </Text>
            <Text size="xs" fw={500}>
              {product.unit ?? '-'}
            </Text>
          </Group>
        </Stack>
        <Box
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
          }}
        >
          <ActiveBadge
            isActive={product.isActive ?? true}
            label={product.isActive ? t('product.active') : t('product.inactive')}
          />
        </Box>
      </Group>
    </Card>
  );
}
