import {
  Modal,
  Drawer,
  ScrollArea,
  Text,
  Group,
  Button,
  Stack,
  Alert,
  Textarea,
  NumberInput,
  TextInput,
} from '@mantine/core';
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
import { useDeviceType } from '@/hooks/useDeviceType';
import { DRAWER_BODY_PADDING_BOTTOM, DRAWER_HEADER_PADDING } from '@/constants/po.constants';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import { formatCurrency } from '@/utils/number';
import { formatDate } from '@/utils/time';

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
  const { isMobile } = useDeviceType();
  const [reason, setReason] = useState('');
  const [refundAmount, setRefundAmount] = useState<number | undefined>(undefined);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');

  // Get modal configuration - memoized
  const config = useMemo(() => getModalConfig(mode, t), [mode, t]);

  if (!purchaseOrder) return null;

  const handleConfirm = async () => {
    let data: any = undefined;
    if (mode === 'refund') {
      data = {
        refundReason: reason.trim(),
        refundAmount: refundAmount || purchaseOrder.totalAmount,
      };
    } else if (mode === 'cancel') {
      data = { cancelReason: reason.trim() };
    } else if (mode === 'deliver') {
      data = { deliveryNotes: deliveryNotes.trim() };
    } else if (mode === 'ship') {
      data = { trackingNumber: trackingNumber.trim(), carrier: carrier.trim() };
    }
    await onConfirm(data);
    handleClose();
  };

  const handleClose = () => {
    setReason('');
    setRefundAmount(undefined);
    setDeliveryNotes('');
    setTrackingNumber('');
    setCarrier('');
    onClose();
  };

  // Check if confirm button should be disabled
  const isConfirmDisabled = () => {
    if (mode === 'cancel' || mode === 'refund') {
      return !reason.trim();
    }
    if (mode === 'ship') {
      return !trackingNumber.trim();
    }
    return false;
  };

  // Content to be rendered in both Modal and Drawer
  const content = (
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
        {purchaseOrder.deliveryDate && (mode === 'ship' || mode === 'deliver') && (
          <Text size="sm" c="dimmed">
            {t('po.expectedDelivery')}: {formatDate(purchaseOrder.deliveryDate)}
          </Text>
        )}
      </div>

      {mode === 'refund' && (
        <>
          <NumberInput
            label={t('po.refundAmount')}
            step={1000}
            placeholder={t('po.enterRefundAmount')}
            value={refundAmount}
            onChange={(value) => setRefundAmount(typeof value === 'number' ? value : undefined)}
            min={0}
            max={purchaseOrder.totalAmount}
            decimalScale={2}
            prefix="$"
            thousandSeparator=","
            defaultValue={purchaseOrder.totalAmount}
            description={`${t('po.maxRefundAmount')}: ${formatCurrency(purchaseOrder.totalAmount)}`}
          />
          <Textarea
            label={t('po.refundReason')}
            placeholder={t('po.enterRefundReason')}
            value={reason}
            onChange={(event) => setReason(event.currentTarget.value)}
            rows={3}
            required
          />
        </>
      )}
      {mode === 'cancel' && (
        <Textarea
          label={t('po.cancellationReason')}
          placeholder={t('po.enterCancellationReason')}
          value={reason}
          onChange={(event) => setReason(event.currentTarget.value)}
          rows={3}
          required
        />
      )}
      {mode === 'deliver' && (
        <Textarea
          label={t('po.deliveryNotes')}
          placeholder={t('po.enterDeliveryNotes')}
          value={deliveryNotes}
          onChange={(event) => setDeliveryNotes(event.currentTarget.value)}
          rows={3}
        />
      )}
      {mode === 'ship' && (
        <>
          <TextInput
            label={t('po.trackingNumber')}
            placeholder={t('po.enterTrackingNumber')}
            value={trackingNumber}
            onChange={(event) => setTrackingNumber(event.currentTarget.value)}
            required
          />
          <TextInput
            label={t('po.carrier')}
            placeholder={t('po.enterCarrier')}
            value={carrier}
            onChange={(event) => setCarrier(event.currentTarget.value)}
          />
        </>
      )}

      <Group justify="flex-end">
        <Button variant="outline" onClick={handleClose}>
          {t('common.cancel')}
        </Button>
        <Button
          color={config.buttonColor}
          leftSection={config.icon}
          onClick={handleConfirm}
          disabled={isConfirmDisabled()}
        >
          {config.buttonText}
        </Button>
      </Group>
    </Stack>
  );

  // Use Drawer for mobile, Modal for desktop
  if (isMobile) {
    return (
      <Drawer
        opened={opened}
        onClose={handleClose}
        title={config.title}
        position="bottom"
        size="90%"
        trapFocus
        returnFocus
        styles={{
          body: { paddingBottom: DRAWER_BODY_PADDING_BOTTOM },
          header: { padding: DRAWER_HEADER_PADDING },
        }}
      >
        <ScrollArea h="calc(90% - 80px)" type="never">
          {content}
        </ScrollArea>
      </Drawer>
    );
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={config.title}
      centered
      size="md"
      trapFocus
      returnFocus
    >
      {content}
    </Modal>
  );
}
