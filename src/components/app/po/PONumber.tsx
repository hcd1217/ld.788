import { Stack, Text } from '@mantine/core';

import type { PurchaseOrder } from '@/services/sales';

export type PONumberProps = {
  readonly size?: 'sm' | 'md' | 'lg';
  readonly purchaseOrder: PurchaseOrder;
};

export function PONumber({ purchaseOrder, size = 'md' }: PONumberProps) {
  return (
    <Stack gap="xs">
      <Text size={size} fw={600}>
        {purchaseOrder.poNumber}
      </Text>
      {purchaseOrder.customerPONumber && (
        <Text size={size} ml="xs">
          ({purchaseOrder.customerPONumber})
        </Text>
      )}
    </Stack>
  );
}
