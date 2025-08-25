import { Card, Stack, Group, Title, Button } from '@mantine/core';
import {
  IconCheck,
  IconPackage,
  IconTruck,
  IconPackageExport,
  IconX,
  IconReceipt,
} from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import { useMemo } from 'react';

type POActionZoneProps = {
  readonly purchaseOrder: PurchaseOrder;
  readonly isLoading?: boolean;
  readonly onConfirm: () => void;
  readonly onProcess: () => void;
  readonly onShip: () => void;
  readonly onDeliver: () => void;
  readonly onCancel: () => void;
  readonly onRefund: () => void;
};

export function POActionZone({
  purchaseOrder,
  isLoading = false,
  onConfirm,
  onProcess,
  onShip,
  onDeliver,
  onCancel,
  onRefund,
}: POActionZoneProps) {
  const { t } = useTranslation();

  const availableActions = useMemo(() => {
    const actions = [];

    switch (purchaseOrder.status) {
      case 'NEW':
        actions.push(
          <Button
            key="cancel"
            color="red"
            variant="outline"
            loading={isLoading}
            leftSection={<IconX size={16} />}
            onClick={onCancel}
          >
            {t('po.cancel')}
          </Button>,
          <Button
            key="confirm"
            color="green"
            loading={isLoading}
            leftSection={<IconCheck size={16} />}
            onClick={onConfirm}
          >
            {t('po.confirm')}
          </Button>,
        );
        break;

      case 'CONFIRMED':
        actions.push(
          <Button
            key="cancel"
            color="red"
            variant="outline"
            loading={isLoading}
            leftSection={<IconX size={16} />}
            onClick={onCancel}
          >
            {t('po.cancel')}
          </Button>,
          <Button
            key="process"
            color="blue"
            loading={isLoading}
            leftSection={<IconPackage size={16} />}
            onClick={onProcess}
          >
            {t('po.startProcessing')}
          </Button>,
        );
        break;

      case 'PROCESSING':
        actions.push(
          <Button
            key="ship"
            color="indigo"
            loading={isLoading}
            leftSection={<IconTruck size={16} />}
            onClick={onShip}
          >
            {t('po.markShipped')}
          </Button>,
        );
        break;

      case 'SHIPPED':
        actions.push(
          <Button
            key="refund"
            color="orange"
            variant="outline"
            loading={isLoading}
            leftSection={<IconReceipt size={16} />}
            onClick={onRefund}
          >
            {t('po.processRefund')}
          </Button>,
          <Button
            key="deliver"
            color="green"
            loading={isLoading}
            leftSection={<IconPackageExport size={16} />}
            onClick={onDeliver}
          >
            {t('po.markDelivered')}
          </Button>,
        );
        break;

      case 'DELIVERED':
        actions.push(
          <Button
            key="refund"
            color="orange"
            variant="outline"
            loading={isLoading}
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
  }, [
    purchaseOrder.status,
    isLoading,
    t,
    onCancel,
    onConfirm,
    onProcess,
    onShip,
    onDeliver,
    onRefund,
  ]);

  if (availableActions.length === 0) {
    return null;
  }

  return (
    <Card shadow="sm" p="xs" m="0" radius="md">
      <Stack gap="sm">
        <Title order={4}>{t('po.availableActions')}</Title>
        <Group p="xs">{availableActions}</Group>
      </Stack>
    </Card>
  );
}
