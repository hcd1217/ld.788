import { Modal, Text, Group, Button, Stack, Alert, Textarea } from '@mantine/core';
import {
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconTruck,
  IconPackage,
  IconCurrencyDollar,
} from '@tabler/icons-react';
import { useState, useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/lib/api/schemas/sales.schemas';
import { formatCurrency } from '@/utils/number';

export type POModalMode = 'confirm' | 'cancel' | 'process' | 'ship' | 'deliver' | 'refund';

type POStatusModalProps = {
  readonly opened: boolean;
  readonly mode: POModalMode;
  readonly purchaseOrder?: PurchaseOrder;
  readonly onClose: () => void;
  readonly onConfirm: (data?: any) => Promise<void>;
};

// Modal configuration based on mode
const getModalConfig = (mode: POModalMode, t: any) => {
  const configs = {
    confirm: {
      title: t('po.confirmOrder'),
      description: t('po.confirmOrderDescription'),
      buttonText: t('po.confirmOrder'),
      buttonColor: 'green',
      icon: <IconCheck size={16} />,
      alertColor: 'blue',
      requiresReason: false,
    },
    cancel: {
      title: t('po.cancelOrder'),
      description: t('po.cancelOrderDescription'),
      buttonText: t('po.cancelOrder'),
      buttonColor: 'red',
      icon: <IconX size={16} />,
      alertColor: 'red',
      requiresReason: true,
      reasonLabel: t('po.cancellationReason'),
      reasonPlaceholder: t('po.enterCancellationReason'),
    },
    process: {
      title: t('po.processOrder'),
      description: t('po.processOrderDescription'),
      buttonText: t('po.processOrder'),
      buttonColor: 'blue',
      icon: <IconPackage size={16} />,
      alertColor: 'blue',
      requiresReason: false,
    },
    ship: {
      title: t('po.shipOrder'),
      description: t('po.shipOrderDescription'),
      buttonText: t('po.shipOrder'),
      buttonColor: 'cyan',
      icon: <IconTruck size={16} />,
      alertColor: 'cyan',
      requiresReason: false,
    },
    deliver: {
      title: t('po.deliverOrder'),
      description: t('po.deliverOrderDescription'),
      buttonText: t('po.markAsDelivered'),
      buttonColor: 'green',
      icon: <IconCheck size={16} />,
      alertColor: 'green',
      requiresReason: false,
    },
    refund: {
      title: t('po.refundOrder'),
      description: t('po.refundOrderDescription'),
      buttonText: t('po.processRefund'),
      buttonColor: 'orange',
      icon: <IconCurrencyDollar size={16} />,
      alertColor: 'orange',
      requiresReason: true,
      reasonLabel: t('po.refundReason'),
      reasonPlaceholder: t('po.enterRefundReason'),
    },
  };

  return configs[mode];
};

export function POStatusModal({
  opened,
  mode,
  purchaseOrder,
  onClose,
  onConfirm,
}: POStatusModalProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');

  // Get modal configuration - memoized
  const config = useMemo(() => getModalConfig(mode, t), [mode, t]);

  if (!purchaseOrder) return null;

  const handleConfirm = async () => {
    const data = config.requiresReason ? { reason } : undefined;
    await onConfirm(data);
    handleClose();
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  // Check if confirm button should be disabled
  const isConfirmDisabled = config.requiresReason && !reason.trim();

  return (
    <Modal opened={opened} onClose={handleClose} title={config.title} centered size="md">
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
            {t('po.customer')}: {purchaseOrder.customer?.name}
          </Text>
          <Text size="sm" c="dimmed">
            {t('po.totalAmount')}: {formatCurrency(purchaseOrder.totalAmount)}
          </Text>
          <Text size="sm" c="dimmed">
            {t('po.items')}: {purchaseOrder.items.length} {t('po.itemsCount')}
          </Text>
          <Text size="sm" c="dimmed">
            {t('po.poStatus')}: {purchaseOrder.status}
          </Text>
        </div>

        {config.requiresReason && (
          <Textarea
            label={'reasonLabel' in config ? config.reasonLabel : ''}
            placeholder={'reasonPlaceholder' in config ? config.reasonPlaceholder : ''}
            value={reason}
            onChange={(event) => setReason(event.currentTarget.value)}
            rows={3}
            required
          />
        )}

        <Group justify="flex-end">
          <Button variant="outline" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button
            color={config.buttonColor}
            leftSection={config.icon}
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
          >
            {config.buttonText}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
