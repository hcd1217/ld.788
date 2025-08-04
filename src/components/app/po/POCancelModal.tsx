import { Modal, Text, Group, Button, Stack, Alert, Textarea } from '@mantine/core';
import { IconX, IconAlertTriangle } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import { formatCurrency } from '@/utils/number';

type POCancelModalProps = {
  readonly opened: boolean;
  readonly purchaseOrder?: PurchaseOrder;
  readonly onClose: () => void;
  readonly onConfirm: (values?: any) => Promise<void>;
};

export function POCancelModal({ opened, purchaseOrder, onClose, onConfirm }: POCancelModalProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');

  if (!purchaseOrder) return null;

  const handleCancel = () => {
    onConfirm();
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <Modal opened={opened} onClose={handleClose} title={t('po.cancelOrder')} centered size="md">
      <Stack gap="md">
        <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
          {t('po.cancelOrderDescription')}
        </Alert>

        <div>
          <Text fw={500} mb="xs">
            {t('po.orderDetails')}
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

        <Textarea
          label={t('po.cancellationReason')}
          placeholder={t('po.enterCancellationReason')}
          value={reason}
          onChange={(event) => setReason(event.currentTarget.value)}
          rows={3}
          required
        />

        <Group justify="flex-end">
          <Button variant="outline" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button
            color="red"
            leftSection={<IconX size={16} />}
            onClick={handleCancel}
            disabled={!reason.trim()}
          >
            {t('po.cancelOrder')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
