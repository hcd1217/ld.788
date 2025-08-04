import { Modal, Text, Group, Button, Stack, Alert } from '@mantine/core';
import { IconPackage, IconAlertTriangle } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';

type POProcessModalProps = {
  readonly opened: boolean;
  readonly purchaseOrder?: PurchaseOrder;
  readonly onClose: () => void;
  readonly onConfirm: (values?: any) => Promise<void>;
};

export function POProcessModal({ opened, purchaseOrder, onClose, onConfirm }: POProcessModalProps) {
  const { t } = useTranslation();

  if (!purchaseOrder) return null;

  return (
    <Modal opened={opened} onClose={onClose} title={t('po.startProcessing')} centered>
      <Stack gap="md">
        <Alert icon={<IconAlertTriangle size={16} />} color="blue" variant="light">
          {t('po.processOrderDescription')}
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
        </div>

        <Group justify="flex-end">
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button color="blue" leftSection={<IconPackage size={16} />} onClick={() => onConfirm()}>
            {t('po.startProcessing')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
