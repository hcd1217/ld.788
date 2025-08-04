import { Modal, Text, Group, Button, Stack, Alert, Textarea, NumberInput } from '@mantine/core';
import { IconReceipt, IconAlertTriangle } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import { formatCurrency } from '@/utils/number';

type PORefundModalProps = {
  readonly opened: boolean;
  readonly purchaseOrder?: PurchaseOrder;
  readonly onClose: () => void;
  readonly onConfirm: (values?: any) => Promise<void>;
};

export function PORefundModal({ opened, purchaseOrder, onClose, onConfirm }: PORefundModalProps) {
  const { t } = useTranslation();
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [reason, setReason] = useState('');

  if (!purchaseOrder) return null;

  const maxRefundAmount = purchaseOrder.totalAmount;

  const handleRefund = () => {
    onConfirm();
  };

  const handleClose = () => {
    setRefundAmount(0);
    setReason('');
    onClose();
  };

  return (
    <Modal opened={opened} onClose={handleClose} title={t('po.processRefund')} centered size="md">
      <Stack gap="md">
        <Alert icon={<IconAlertTriangle size={16} />} color="orange" variant="light">
          {t('po.refundOrderDescription')}
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
            {t('po.originalAmount')}: {formatCurrency(purchaseOrder.totalAmount)}
          </Text>
        </div>

        <Stack gap="sm">
          <NumberInput
            label={t('po.refundAmount')}
            placeholder={t('po.enterRefundAmount')}
            value={refundAmount}
            onChange={(value) => setRefundAmount(Number(value) || 0)}
            min={0}
            max={maxRefundAmount}
            step={0.01}
            decimalScale={2}
            thousandSeparator=","
            prefix="₫ "
            required
          />
          <Text size="xs" c="dimmed">
            {t('po.maxRefundAmount')}: {formatCurrency(maxRefundAmount)}
          </Text>
        </Stack>

        <Textarea
          label={t('po.refundReason')}
          placeholder={t('po.enterRefundReason')}
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
            color="orange"
            leftSection={<IconReceipt size={16} />}
            onClick={handleRefund}
            disabled={!reason.trim() || refundAmount <= 0 || refundAmount > maxRefundAmount}
          >
            {t('po.processRefund')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
