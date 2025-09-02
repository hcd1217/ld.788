import { useMemo, useCallback } from 'react';
import { Button, Group } from '@mantine/core';
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
import { isPOStatusNew } from '@/utils/purchaseOrder';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';

type POAccordionActionsProps = {
  readonly purchaseOrder: PurchaseOrder;
  readonly isLoading: boolean;
  readonly onConfirm: () => void;
  readonly onProcess: () => void;
  readonly onMarkReady: () => void;
  readonly onShip: () => void;
  readonly onDeliver: () => void;
  readonly onCancel: () => void;
  readonly onRefund: () => void;
  readonly onCreateDelivery: () => void;
};

export function POAccordionActions({
  purchaseOrder,
  isLoading,
  onConfirm,
  onProcess,
  onMarkReady,
  onShip,
  onDeliver,
  onCancel,
  onRefund,
  onCreateDelivery,
}: POAccordionActionsProps) {
  const { t } = useTranslation();

  const createCancelButton = useCallback(
    () => (
      <Button
        key="cancel"
        color="red"
        variant="outline"
        size="xs"
        loading={isLoading}
        leftSection={<IconX size={14} />}
        onClick={onCancel}
      >
        {t('po.cancel')}
      </Button>
    ),
    [isLoading, onCancel, t],
  );

  const createRefundButton = useCallback(
    () => (
      <Button
        key="refund"
        color="orange"
        variant="outline"
        size="xs"
        loading={isLoading}
        leftSection={<IconReceipt size={14} />}
        onClick={onRefund}
      >
        {t('po.refund')}
      </Button>
    ),
    [isLoading, onRefund, t],
  );

  const createShipButton = useCallback(
    () => (
      <Button
        key="ship"
        color="indigo"
        size="xs"
        loading={isLoading}
        leftSection={<IconTruck size={14} />}
        onClick={onShip}
      >
        {t('po.ship')}
      </Button>
    ),
    [isLoading, onShip, t],
  );

  const buttons = useMemo(() => {
    const buttons = [];

    if (isPOStatusNew(purchaseOrder.status)) {
      buttons.push(
        <Button
          key="confirm"
          color="green"
          size="xs"
          loading={isLoading}
          leftSection={<IconCheck size={14} />}
          onClick={onConfirm}
        >
          {t('po.confirm')}
        </Button>,
        createCancelButton(),
      );
    } else if (purchaseOrder.status === 'CONFIRMED') {
      buttons.push(
        <Button
          key="process"
          color="blue"
          size="xs"
          loading={isLoading}
          leftSection={<IconPackage size={14} />}
          onClick={onProcess}
        >
          {t('po.process')}
        </Button>,
        createCancelButton(),
      );
    } else if (purchaseOrder.status === 'PROCESSING') {
      buttons.push(
        <Button
          key="markReady"
          color="teal"
          size="xs"
          loading={isLoading}
          leftSection={<IconPackageExport size={14} />}
          onClick={onMarkReady}
        >
          {t('po.markReady')}
        </Button>,
        createShipButton(),
      );
    } else if (purchaseOrder.status === 'READY_FOR_PICKUP') {
      buttons.push(createShipButton());
      if (onCreateDelivery) {
        buttons.push(
          <Button
            key="create-delivery"
            color="blue"
            size="xs"
            loading={isLoading}
            disabled={!!purchaseOrder.deliveryRequest}
            leftSection={<IconClipboardList size={14} />}
            onClick={onCreateDelivery}
          >
            {t('po.createDeliveryRequest')}
          </Button>,
        );
      }
    } else if (purchaseOrder.status === 'SHIPPED') {
      buttons.push(
        <Button
          key="deliver"
          color="green"
          size="xs"
          loading={isLoading}
          leftSection={<IconPackageExport size={14} />}
          onClick={onDeliver}
        >
          {t('po.markDelivered')}
        </Button>,
        createRefundButton(),
      );
    } else if (purchaseOrder.status === 'DELIVERED') {
      buttons.push(createRefundButton());
    }

    return buttons;
  }, [
    purchaseOrder.status,
    purchaseOrder.deliveryRequest,
    isLoading,
    t,
    onConfirm,
    createCancelButton,
    onProcess,
    onMarkReady,
    createShipButton,
    onDeliver,
    createRefundButton,
    onCreateDelivery,
  ]);

  if (buttons.length === 0) return null;

  return (
    <Group ml="sm" gap="xs">
      {buttons}
    </Group>
  );
}
