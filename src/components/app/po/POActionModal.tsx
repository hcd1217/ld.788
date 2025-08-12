import { useState } from 'react';
import { Modal, Text, Group, Button, Stack, Alert } from '@mantine/core';
import { IconAlertTriangle, IconCheck, IconX } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import { formatCurrency } from '@/utils/number';

type ModalAction = 'confirm' | 'process' | 'ship' | 'deliver' | 'cancel' | 'refund';

type POActionModalProps = {
  readonly opened: boolean;
  readonly purchaseOrder?: PurchaseOrder;
  readonly action: ModalAction;
  readonly onClose: () => void;
  readonly onConfirm: () => Promise<void>;
};

const ACTION_CONFIG = {
  confirm: {
    titleKey: 'po.confirmOrder',
    descriptionKey: 'po.confirmOrderDescription',
    buttonKey: 'po.confirm',
    color: 'green',
    icon: IconCheck,
  },
  process: {
    titleKey: 'po.process',
    descriptionKey: 'po.processOrderDescription',
    buttonKey: 'po.process',
    color: 'blue',
    icon: IconCheck,
  },
  ship: {
    titleKey: 'po.shipOrder',
    descriptionKey: 'po.shipOrderDescription',
    buttonKey: 'po.ship',
    color: 'indigo',
    icon: IconCheck,
  },
  deliver: {
    titleKey: 'po.markDelivered',
    descriptionKey: 'po.deliverOrderDescription',
    buttonKey: 'po.markDelivered',
    color: 'green',
    icon: IconCheck,
  },
  cancel: {
    titleKey: 'po.cancelOrder',
    descriptionKey: 'po.cancelOrderDescription',
    buttonKey: 'po.cancel',
    color: 'red',
    icon: IconX,
  },
  refund: {
    titleKey: 'po.refund',
    descriptionKey: 'po.refundOrderDescription',
    buttonKey: 'po.refund',
    color: 'orange',
    icon: IconCheck,
  },
} as const;

export function POActionModal({
  opened,
  purchaseOrder,
  action,
  onClose,
  onConfirm,
}: POActionModalProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const config = ACTION_CONFIG[action];
  const IconComponent = config.icon;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  if (!purchaseOrder) return null;

  return (
    <Modal
      opened={opened}
      onClose={isLoading ? () => {} : onClose}
      title={t(config.titleKey)}
      centered
      closeOnClickOutside={!isLoading}
      closeOnEscape={!isLoading}
    >
      <Stack gap="md">
        <Alert
          icon={<IconAlertTriangle size={16} />}
          color={action === 'cancel' ? 'red' : 'blue'}
          variant="light"
        >
          {t(config.descriptionKey)}
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
          {action === 'cancel' && purchaseOrder.status !== 'NEW' && (
            <Text size="sm" c="orange" mt="xs">
              This action will cancel the order and may affect inventory.
            </Text>
          )}
          {action === 'refund' && (
            <Text size="sm" c="orange" mt="xs">
              This will process a full refund for the order amount.
            </Text>
          )}
        </div>

        <Group justify="flex-end">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button
            color={config.color}
            leftSection={<IconComponent size={16} />}
            onClick={handleConfirm}
            loading={isLoading}
          >
            {t(config.buttonKey)}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
