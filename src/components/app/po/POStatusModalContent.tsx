import { Stack, Alert, Text, Group, Button } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDate } from '@/utils/time';
import { getCustomerNameByCustomerId } from '@/utils/overview';
import { useCustomerMapByCustomerId } from '@/stores/useAppStore';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import type { POModalMode, ModalConfig } from './POStatusModalConfig';
import { POStatusModalFields } from './POStatusModalFields';

type POStatusModalContentProps = {
  readonly mode: POModalMode;
  readonly config: ModalConfig;
  readonly purchaseOrder: PurchaseOrder;
  readonly reason: string;
  readonly setReason: (value: string) => void;
  readonly deliveryNotes: string;
  readonly setDeliveryNotes: (value: string) => void;
  readonly trackingNumber: string;
  readonly setTrackingNumber: (value: string) => void;
  readonly carrier: string;
  readonly setCarrier: (value: string) => void;
  readonly onClose: () => void;
  readonly onConfirm: () => Promise<void>;
  readonly isConfirmDisabled: boolean;
};

export function POStatusModalContent({
  mode,
  config,
  purchaseOrder,
  reason,
  setReason,
  deliveryNotes,
  setDeliveryNotes,
  trackingNumber,
  setTrackingNumber,
  carrier,
  setCarrier,
  onClose,
  onConfirm,
  isConfirmDisabled,
}: POStatusModalContentProps) {
  const { t } = useTranslation();
  const customerMapByCustomerId = useCustomerMapByCustomerId();

  return (
    <Stack gap="md">
      <Alert icon={<IconAlertTriangle size={16} />} color={config.alertColor} variant="light">
        {config.description}
      </Alert>

      <div>
        <Text fw={500} mb="xs">
          {t(mode === 'confirm' ? 'po.orderSummary' : 'po.orderDetails')}
        </Text>
        <Text size="sm" c="dimmed">
          {t('po.poNumber')}: {purchaseOrder.poNumber}
        </Text>
        <Text size="sm" c="dimmed">
          {t('po.customer')}:{' '}
          {getCustomerNameByCustomerId(customerMapByCustomerId, purchaseOrder.customerId)}
        </Text>
        <Text size="sm" c="dimmed">
          {t('po.items')}: {purchaseOrder.items.length} {t('po.itemsCount')}
        </Text>
        <Text size="sm" c="dimmed">
          {t('po.poStatus')}: {t(`po.status.${purchaseOrder.status}`)}
        </Text>
        {purchaseOrder.deliveryDate && (mode === 'ship' || mode === 'deliver') && (
          <Text size="sm" c="dimmed">
            {t('po.expectedDelivery')}: {formatDate(purchaseOrder.deliveryDate)}
          </Text>
        )}
      </div>

      <POStatusModalFields
        mode={mode}
        reason={reason}
        setReason={setReason}
        deliveryNotes={deliveryNotes}
        setDeliveryNotes={setDeliveryNotes}
        trackingNumber={trackingNumber}
        setTrackingNumber={setTrackingNumber}
        carrier={carrier}
        setCarrier={setCarrier}
      />

      <Group justify="flex-end">
        <Button variant="outline" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button
          color={config.buttonColor}
          leftSection={config.icon}
          onClick={onConfirm}
          disabled={isConfirmDisabled}
        >
          {config.buttonText}
        </Button>
      </Group>
    </Stack>
  );
}
