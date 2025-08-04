import { Card, Stack, Group, Title, Button, Text, Alert } from '@mantine/core';
import {
  IconCheck,
  IconPackage,
  IconTruck,
  IconPackageExport,
  IconX,
  IconReceipt,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';

type POActionZoneProps = {
  readonly purchaseOrder: PurchaseOrder;
  readonly onConfirm: () => void;
  readonly onProcess: () => void;
  readonly onShip: () => void;
  readonly onDeliver: () => void;
  readonly onCancel: () => void;
  readonly onRefund: () => void;
};

export function POActionZone({
  purchaseOrder,
  onConfirm,
  onProcess,
  onShip,
  onDeliver,
  onCancel,
  onRefund,
}: POActionZoneProps) {
  const { t } = useTranslation();

  const getAvailableActions = () => {
    const actions = [];

    switch (purchaseOrder.status) {
      case 'NEW':
        actions.push(
          <Button
            key="confirm"
            color="green"
            leftSection={<IconCheck size={16} />}
            onClick={onConfirm}
          >
            {t('po.confirm')}
          </Button>,
          <Button
            key="cancel"
            color="red"
            variant="outline"
            leftSection={<IconX size={16} />}
            onClick={onCancel}
          >
            {t('po.cancel')}
          </Button>,
        );
        break;

      case 'CONFIRMED':
        actions.push(
          <Button
            key="process"
            color="blue"
            leftSection={<IconPackage size={16} />}
            onClick={onProcess}
          >
            {t('po.startProcessing')}
          </Button>,
          <Button
            key="cancel"
            color="red"
            variant="outline"
            leftSection={<IconX size={16} />}
            onClick={onCancel}
          >
            {t('po.cancel')}
          </Button>,
        );
        break;

      case 'PROCESSING':
        actions.push(
          <Button key="ship" color="indigo" leftSection={<IconTruck size={16} />} onClick={onShip}>
            {t('po.markShipped')}
          </Button>,
        );
        break;

      case 'SHIPPED':
        actions.push(
          <Button
            key="deliver"
            color="green"
            leftSection={<IconPackageExport size={16} />}
            onClick={onDeliver}
          >
            {t('po.markDelivered')}
          </Button>,
          <Button
            key="refund"
            color="orange"
            variant="outline"
            leftSection={<IconReceipt size={16} />}
            onClick={onRefund}
          >
            {t('po.processRefund')}
          </Button>,
        );
        break;

      case 'DELIVERED':
        actions.push(
          <Button
            key="refund"
            color="orange"
            variant="outline"
            leftSection={<IconReceipt size={16} />}
            onClick={onRefund}
          >
            {t('po.processRefund')}
          </Button>,
        );
        break;

      case 'CANCELLED':
      case 'REFUNDED':
        // No actions available
        break;
    }

    return actions;
  };

  const availableActions = getAvailableActions();

  if (availableActions.length === 0) {
    return (
      <Card shadow="sm" padding="xl" radius="md">
        <Alert icon={<IconAlertTriangle size={16} />} color="gray" variant="light">
          {t('po.noActionsAvailable')}
        </Alert>
      </Card>
    );
  }

  return (
    <Card shadow="sm" padding="xl" radius="md">
      <Stack gap="lg">
        <Title order={3}>{t('po.availableActions')}</Title>

        <Text size="sm" c="dimmed">
          {t('po.actionDescription', { status: t(`po.status.${purchaseOrder.status}`) })}
        </Text>

        <Group>{availableActions}</Group>
      </Stack>
    </Card>
  );
}
