import { Modal, Text, Group, Button, Stack, Alert, Textarea } from '@mantine/core';
import { IconPackageExport, IconAlertTriangle } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import { formatCurrency } from '@/utils/number';
import { formatDate } from '@/utils/time';

type PODeliverModalProps = {
  readonly opened: boolean;
  readonly purchaseOrder?: PurchaseOrder;
  readonly onClose: () => void;
  readonly onConfirm: (values?: any) => Promise<void>;
};

export function PODeliverModal({ opened, purchaseOrder, onClose, onConfirm }: PODeliverModalProps) {
  const { t } = useTranslation();
  const [deliveryNotes, setDeliveryNotes] = useState('');

  if (!purchaseOrder) return null;

  const handleDeliver = () => {
    onConfirm();
  };

  const handleClose = () => {
    setDeliveryNotes('');
    onClose();
  };

  return (
    <Modal opened={opened} onClose={handleClose} title={t('po.markDelivered')} centered size="md">
      <Stack gap="md">
        <Alert icon={<IconAlertTriangle size={16} />} color="green" variant="light">
          {t('po.deliverOrderDescription')}
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
          {purchaseOrder.deliveryDate && (
            <Text size="sm" c="dimmed">
              {t('po.expectedDelivery')}: {formatDate(purchaseOrder.deliveryDate)}
            </Text>
          )}
        </div>

        <Textarea
          label={t('po.deliveryNotes')}
          placeholder={t('po.enterDeliveryNotes')}
          value={deliveryNotes}
          onChange={(event) => setDeliveryNotes(event.currentTarget.value)}
          rows={3}
        />

        <Group justify="flex-end">
          <Button variant="outline" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button
            color="green"
            leftSection={<IconPackageExport size={16} />}
            onClick={handleDeliver}
          >
            {t('po.markDelivered')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
