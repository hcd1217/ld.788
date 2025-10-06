import { useMemo } from 'react';

import { Button, Group } from '@mantine/core';

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
  readonly onDelete?: () => void;
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
  onDelete,
  onCreateDelivery,
}: POAccordionActionsProps) {
  const { t } = useTranslation();

  const permissions = usePermissions();
  const {
    canConfirm,
    canCancel,
    canProcess,
    canMarkReady,
    canShip,
    canDeliver,
    canRefund,
    canDelete,
    canEdit,
  } = useMemo(
    () => ({
      canConfirm: canConfirmPurchaseOrder(permissions),
      canCancel: canCancelPurchaseOrder(permissions),
      canProcess: canProcessPurchaseOrder(permissions),
      canMarkReady: canMarkReadyPurchaseOrder(permissions),
      canShip: canShipPurchaseOrder(permissions),
      canDeliver: canDeliverPurchaseOrder(permissions),
      canRefund: canRefundPurchaseOrder(permissions),
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
      iconSize: 14,
      buttonSize: 'xs',
    },
  });

  // Show group if there are actions available
  if (actions.length === 0) return null;

  return (
    <Group ml="sm" gap="xs">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.key}
            color={action.color}
            variant={action.variant}
            size="xs"
            loading={action.isLoading ?? isLoading}
            disabled={action.isDisabled}
            leftSection={<Icon size={14} />}
            onClick={action.onClick}
          >
            {t(action.translationKey as any)}
          </Button>
        );
      })}
    </Group>
  );
}
