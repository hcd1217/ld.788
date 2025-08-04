import { Modal, Text, Group, Button, Stack, Alert } from '@mantine/core';
import { IconCheck, IconAlertTriangle } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import { formatCurrency } from '@/utils/number';

type POConfirmModalProps = {
  readonly opened: boolean;
  readonly purchaseOrder?: PurchaseOrder;
  readonly onClose: () => void;
  readonly onConfirm: (values?: any) => Promise<void>;
};

export function POConfirmModal({ opened, purchaseOrder, onClose, onConfirm }: POConfirmModalProps) {
  const { t } = useTranslation();

  if (!purchaseOrder) return null;

  return (
    <Modal opened={opened} onClose={onClose} title={t('po.confirmOrder')} centered>
      <Stack gap="md">
        <Alert icon={<IconAlertTriangle size={16} />} color="blue" variant="light">
          {t('po.confirmOrderDescription')}
        </Alert>

        <div>
          <Text fw={500} mb="xs">
            {t('po.orderSummary')}
          </Text>
          <Text size="sm" c="dimmed">
            {t('po.poNumber')}: {purchaseOrder.poNumber}
          </Text>
          <Text size="sm" c="dimmed">
            {t('po.customer')}: {purchaseOrder.customer?.name}
          </Text>
          <Text size="sm" c="dimmed">
            {t('po.totalAmount')}: {formatCurrency(purchaseOrder.totalAmount)}
          </Text>
          <Text size="sm" c="dimmed">
            {t('po.items')}: {purchaseOrder.items.length} {t('po.itemsCount')}
          </Text>
        </div>

        <Group justify="flex-end">
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button color="green" leftSection={<IconCheck size={16} />} onClick={() => onConfirm()}>
            {t('po.confirmOrder')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
