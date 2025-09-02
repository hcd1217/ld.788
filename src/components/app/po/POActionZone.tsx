import { Card, Stack, Group, Title, Button } from '@mantine/core';
import {
  IconCheck,
  IconPackage,
  IconTruck,
  IconPackageExport,
  IconX,
  IconReceipt,
  IconClipboardList,
} from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import { useMemo } from 'react';

type POActionZoneProps = {
  readonly canEdit: boolean;
  readonly purchaseOrder: PurchaseOrder;
  readonly isLoading?: boolean;
  readonly onConfirm: () => void;
  readonly onProcess: () => void;
  readonly onMarkReady: () => void;
  readonly onShip: () => void;
  readonly onDeliver: () => void;
  readonly onCancel: () => void;
  readonly onRefund: () => void;
  readonly onCreateDelivery?: () => void;
};

export function POActionZone({
  purchaseOrder,
  canEdit = false,
  isLoading = false,
  onConfirm,
  onProcess,
  onMarkReady,
  onShip,
  onDeliver,
  onCancel,
  onRefund,
  onCreateDelivery,
}: POActionZoneProps) {
  const { t } = useTranslation();

  const availableActions = useMemo(() => {
    const actions = [];

    const createRefundButton = () => (
      <Button
        key="refund"
        color="orange"
        variant="outline"
        loading={isLoading}
        disabled={!canEdit}
        leftSection={<IconReceipt size={16} />}
        onClick={onRefund}
      >
        {t('po.processRefund')}
      </Button>
    );

    switch (purchaseOrder.status) {
      case 'NEW': {
        actions.push(
          <Button
            key="cancel"
            color="red"
            variant="outline"
            loading={isLoading}
            disabled={!canEdit}
            leftSection={<IconX size={16} />}
            onClick={onCancel}
          >
            {t('po.cancel')}
          </Button>,
          <Button
            key="confirm"
            color="green"
            loading={isLoading}
            disabled={!canEdit}
            leftSection={<IconCheck size={16} />}
            onClick={onConfirm}
          >
            {t('po.confirm')}
          </Button>,
        );
        break;
      }

      case 'CONFIRMED': {
        actions.push(
          <Button
            key="cancel"
            color="red"
            variant="outline"
            loading={isLoading}
            disabled={!canEdit}
            leftSection={<IconX size={16} />}
            onClick={onCancel}
          >
            {t('po.cancel')}
          </Button>,
          <Button
            key="process"
            color="blue"
            loading={isLoading}
            disabled={!canEdit}
            leftSection={<IconPackage size={16} />}
            onClick={onProcess}
          >
            {t('po.startProcessing')}
          </Button>,
        );
        break;
      }

      case 'PROCESSING': {
        actions.push(
          <Button
            key="markReady"
            color="teal"
            loading={isLoading}
            disabled={!canEdit}
            leftSection={<IconPackageExport size={16} />}
            onClick={onMarkReady}
          >
            {t('po.markReady')}
          </Button>,
        );
        break;
      }

      case 'READY_FOR_PICKUP': {
        actions.push(
          <Button
            key="ship"
            color="indigo"
            loading={isLoading}
            disabled={!canEdit}
            leftSection={<IconTruck size={16} />}
            onClick={onShip}
          >
            {t('po.markShipped')}
          </Button>,
          <Button
            key="create-delivery"
            color="blue"
            variant="filled"
            loading={isLoading}
            disabled={!!purchaseOrder.deliveryRequest || !canEdit}
            leftSection={<IconClipboardList size={16} />}
            onClick={onCreateDelivery}
          >
            {t('po.createDeliveryRequest')}
          </Button>,
        );
        break;
      }

      case 'SHIPPED': {
        actions.push(
          createRefundButton(),
          <Button
            key="deliver"
            color="green"
            loading={isLoading}
            disabled={!canEdit}
            leftSection={<IconPackageExport size={16} />}
            onClick={onDeliver}
          >
            {t('po.markDelivered')}
          </Button>,
        );
        break;
      }

      case 'DELIVERED': {
        actions.push(createRefundButton());
        break;
      }

      case 'CANCELLED':
      case 'REFUNDED': {
        // No actions available
        break;
      }
    }

    return actions;
  }, [
    canEdit,
    purchaseOrder.status,
    purchaseOrder.deliveryRequest,
    isLoading,
    t,
    onRefund,
    onCancel,
    onConfirm,
    onProcess,
    onMarkReady,
    onShip,
    onCreateDelivery,
    onDeliver,
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
