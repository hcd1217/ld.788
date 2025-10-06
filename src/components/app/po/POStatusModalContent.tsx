import { useMemo } from 'react';

import { Alert, Button, Group, LoadingOverlay, Stack, Text } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import { formatDate } from '@/utils/time';

import { POCustomer } from './POCustomer';
import { POStatusModalFields } from './POStatusModalFields';

import type { ModalConfig, POModalMode } from './POStatusModalConfig';

type POStatusModalContentProps = {
  readonly mode: POModalMode;
  readonly config: ModalConfig;
  readonly purchaseOrder: PurchaseOrder;
  readonly isLoading?: boolean;
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
  isLoading = false,
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

  const isDisabled = useMemo(() => {
    if (isConfirmDisabled || isLoading) {
      return true;
    }
    if (purchaseOrder.isInternalDelivery) {
      return false;
    }
    if (mode === 'ship') {
      if (!trackingNumber.trim()) {
        return true;
      }
      if (!carrier.trim()) {
        return true;
      }
    }
    return false;
  }, [
    isConfirmDisabled,
    isLoading,
    purchaseOrder.isInternalDelivery,
    mode,
    trackingNumber,
    carrier,
  ]);

  return (
    <Stack gap="md" pos="relative">
      <LoadingOverlay visible={isLoading} />

      <Alert icon={<IconAlertTriangle size={16} />} color={config.alertColor} variant="light">
        {config.description}
      </Alert>

      <div>
        <Text fw={500} mb="xs">
          {t(mode === 'confirm' ? 'po.orderSummary' : 'po.orderDetails')}
        </Text>
        <Text size="sm" c="dimmed">
          {t('po.poNumber')}: {purchaseOrder.poNumber}
          {purchaseOrder.customerPONumber ? (
            <Text size="sm" c="dimmed">
              {' '}
              ({purchaseOrder.customerPONumber})
            </Text>
          ) : (
            <></>
          )}
        </Text>
        <Text size="sm" c="dimmed">
          {t('common.customer')}: <POCustomer purchaseOrder={purchaseOrder} />
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
        isInternalDelivery={purchaseOrder.isInternalDelivery}
      />

      <Group justify="flex-end">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          {t('common.cancel')}
        </Button>
        <Button
          color={config.buttonColor}
          leftSection={config.icon}
          onClick={onConfirm}
          disabled={isDisabled}
          loading={isLoading}
        >
          {config.buttonText}
        </Button>
      </Group>
    </Stack>
  );
}
