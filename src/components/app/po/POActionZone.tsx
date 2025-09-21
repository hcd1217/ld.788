import { useMemo } from 'react';

import { Button, Card, Group, Stack, Title } from '@mantine/core';

import { usePOActions } from '@/hooks/usePOActions';
import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import { usePermissions } from '@/stores/useAppStore';
import {
  canCancelPurchaseOrder,
  canConfirmPurchaseOrder,
  canDeliverPurchaseOrder,
  canMarkReadyPurchaseOrder,
  canProcessPurchaseOrder,
  canRefundPurchaseOrder,
  canShipPurchaseOrder,
} from '@/utils/permission.utils';

type POActionZoneProps = {
  readonly purchaseOrder: PurchaseOrder;
  readonly isLoading: boolean;
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
  isLoading,
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

  const permissions = usePermissions();
  const { canConfirm, canProcess, canShip, canMarkReady, canDeliver, canRefund, canCancel } =
    useMemo(
      () => ({
        canConfirm: canConfirmPurchaseOrder(permissions),
        canProcess: canProcessPurchaseOrder(permissions),
        canShip: canShipPurchaseOrder(permissions),
        canMarkReady: canMarkReadyPurchaseOrder(permissions),
        canDeliver: canDeliverPurchaseOrder(permissions),
        canRefund: canRefundPurchaseOrder(permissions),
        canCancel: canCancelPurchaseOrder(permissions),
      }),
      [permissions],
    );

  // Use the centralized hook for action logic
  const actions = usePOActions({
    purchaseOrder,
    // POActionZone uses canEdit for all permissions
    permissions: {
      canConfirm,
      canCancel,
      canProcess,
      canMarkReady,
      canShip,
      canDeliver,
      canRefund,
    },
    callbacks: {
      onConfirm,
      onCancel,
      onProcess,
      onMarkReady,
      onShip,
      onDeliver,
      onRefund,
      onCreateDelivery,
    },
    options: {
      iconSize: 16,
      // Default button size (no size specified in original)
    },
  });

  if (actions.length === 0) {
    return null;
  }

  return (
    <Card shadow="sm" p="xs" m="0" radius="md">
      <Stack gap="sm">
        <Title order={4}>{t('po.availableActions')}</Title>
        <Group p="xs">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.key}
                color={action.color}
                variant={action.variant}
                loading={isLoading}
                disabled={action.isDisabled}
                leftSection={<Icon size={16} />}
                onClick={action.onClick}
              >
                {t(action.translationKey as any)}
              </Button>
            );
          })}
        </Group>
      </Stack>
    </Card>
  );
}
