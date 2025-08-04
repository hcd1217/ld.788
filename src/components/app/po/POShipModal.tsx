import { Modal, Text, Group, Button, Stack, Alert, TextInput } from '@mantine/core';
import { IconTruck, IconAlertTriangle } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import { formatCurrency } from '@/utils/number';
import { formatDate } from '@/utils/time';

type POShipModalProps = {
  readonly opened: boolean;
  readonly purchaseOrder?: PurchaseOrder;
  readonly onClose: () => void;
  readonly onConfirm: (values?: any) => Promise<void>;
};

export function POShipModal({ opened, purchaseOrder, onClose, onConfirm }: POShipModalProps) {
  const { t } = useTranslation();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');

  if (!purchaseOrder) return null;

  const handleShip = () => {
    onConfirm();
  };

  const handleClose = () => {
    setTrackingNumber('');
    setCarrier('');
    onClose();
  };

  return (
    <Modal opened={opened} onClose={handleClose} title={t('po.shipOrder')} centered size="md">
      <Stack gap="md">
        <Alert icon={<IconAlertTriangle size={16} />} color="indigo" variant="light">
          {t('po.shipOrderDescription')}
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

        <Stack gap="sm">
          <TextInput
            label={t('po.trackingNumber')}
            placeholder={t('po.enterTrackingNumber')}
            value={trackingNumber}
            onChange={(event) => setTrackingNumber(event.currentTarget.value)}
          />
          <TextInput
            label={t('po.carrier')}
            placeholder={t('po.enterCarrier')}
            value={carrier}
            onChange={(event) => setCarrier(event.currentTarget.value)}
          />
        </Stack>

        <Group justify="flex-end">
          <Button variant="outline" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button color="indigo" leftSection={<IconTruck size={16} />} onClick={handleShip}>
            {t('po.shipOrder')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
