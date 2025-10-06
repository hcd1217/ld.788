import { useMemo } from 'react';

import { Button, Card, Group, Stack, Title } from '@mantine/core';

import { usePOActions } from '@/hooks/usePOActions';
import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import { usePermissions } from '@/stores/useAppStore';
import {
  canCancelPurchaseOrder,
  canConfirmPurchaseOrder,
  canDeletePurchaseOrder,
  canDeliverPurchaseOrder,
  canEditPurchaseOrder,
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
  readonly onDelete?: () => void;
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
  onDelete,
  onCreateDelivery,
}: POActionZoneProps) {
  const { t } = useTranslation();

  const permissions = usePermissions();
  const {
    canConfirm,
    canProcess,
    canShip,
    canMarkReady,
    canDeliver,
    canRefund,
    canCancel,
    canDelete,
    canEdit,
  } = useMemo(
    () => ({
      canConfirm: canConfirmPurchaseOrder(permissions),
      canProcess: canProcessPurchaseOrder(permissions),
      canShip: canShipPurchaseOrder(permissions),
      canMarkReady: canMarkReadyPurchaseOrder(permissions),
      canDeliver: canDeliverPurchaseOrder(permissions),
      canRefund: canRefundPurchaseOrder(permissions),
      canCancel: canCancelPurchaseOrder(permissions),
      canDelete: canDeletePurchaseOrder(permissions),
      canEdit: canEditPurchaseOrder(permissions),
    }),
    [permissions],
  );

  // Use the centralized hook for action logic
  const actions = usePOActions({
    purchaseOrder,
    permissions: {
      canConfirm,
      canCancel,
      canProcess,
      canMarkReady,
      canShip,
      canDeliver,
      canRefund,
      canDelete,
      canEdit,
    },
    callbacks: {
      onConfirm,
      onCancel,
      onProcess,
      onMarkReady,
      onShip,
      onDeliver,
      onRefund,
      onDelete: onDelete ?? (() => {}),
      onCreateDelivery,
    },
    options: {
      iconSize: 16,
      // Default button size (no size specified in original)
    },
  });

  // Show card if there are actions available
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
                loading={action.isLoading ?? isLoading}
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
