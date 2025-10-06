import type React from 'react';
import { useMemo } from 'react';

import {
  IconCheck,
  IconClipboardList,
  IconPackage,
  IconPackageExport,
  type IconProps,
  IconReceipt,
  IconRefresh,
  IconTrash,
  IconTruck,
  IconX,
} from '@tabler/icons-react';

import { useSWRAction } from '@/hooks/useSWRAction';
import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import { usePOActions as usePOStoreActions } from '@/stores/usePOStore';

import type { ButtonProps } from '@mantine/core';

/**
 * Configuration for a PO action button
 */
export type POActionConfig = {
  readonly key: string;
  readonly action:
    | 'confirm'
    | 'cancel'
    | 'process'
    | 'markReady'
    | 'ship'
    | 'deliver'
    | 'refund'
    | 'delete'
    | 'createDelivery'
    | 'toggleInternalDelivery';
  readonly color: ButtonProps['color'];
  readonly variant?: ButtonProps['variant'];
  readonly icon: React.ComponentType<IconProps>;
  readonly translationKey: string;
  readonly onClick: () => void;
  readonly isDisabled?: boolean;
  readonly isLoading?: boolean;
  readonly showCondition?: boolean;
};

/**
 * Options for configuring PO actions display
 */
export type POActionsOptions = {
  readonly variant?: 'accordion' | 'zone';
  readonly iconSize?: number;
  readonly buttonSize?: ButtonProps['size'];
};

/**
 * Props for the usePOActions hook
 */
export type UsePOActionsProps = {
  readonly purchaseOrder: PurchaseOrder;
  readonly isLoading?: boolean;
  readonly permissions: {
    readonly canConfirm: boolean;
    readonly canCancel: boolean;
    readonly canProcess: boolean;
    readonly canMarkReady: boolean;
    readonly canShip: boolean;
    readonly canDeliver: boolean;
    readonly canRefund: boolean;
    readonly canDelete: boolean;
    readonly canEdit: boolean;
  };
  readonly callbacks: {
    readonly onConfirm: () => void;
    readonly onCancel: () => void;
    readonly onProcess: () => void;
    readonly onMarkReady: () => void;
    readonly onShip: () => void;
    readonly onDeliver: () => void;
    readonly onRefund: () => void;
    readonly onDelete: () => void;
    readonly onCreateDelivery?: () => void;
  };
  readonly options?: POActionsOptions;
};

/**
 * Hook for determining available PO actions based on status
 * Centralizes the business logic for PO action availability
 */
export function usePOActions({
  purchaseOrder,
  permissions,
  callbacks,
}: UsePOActionsProps): POActionConfig[] {
  const { t } = useTranslation();
  const { toggleInternalDelivery } = usePOStoreActions();

  // Toggle internal delivery action
  const toggleInternalDeliveryAction = useSWRAction(
    'toggle-internal-delivery',
    async () => {
      if (!permissions.canEdit) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }
      await toggleInternalDelivery(purchaseOrder.id);
    },
    {
      notifications: {
        successTitle: t('common.success'),
        successMessage: t('po.toggleInternalDeliverySuccess'),
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('po.toggleInternalDeliveryFailed'),
      },
    },
  );

  const availableActions = useMemo(() => {
    const canCancel = permissions.canCancel;
    const canProcess = permissions.canProcess;
    const canMarkReady = permissions.canMarkReady;
    const canShip = permissions.canShip;
    const canDeliver = permissions.canDeliver;
    const canRefund = permissions.canRefund;
    const canConfirm = permissions.canConfirm;
    const canDelete = permissions.canDelete;
    const canEdit = permissions.canEdit;

    const actions: POActionConfig[] = [];

    const createToggleInternalDeliveryAction = (): POActionConfig => ({
      key: 'toggle-internal-delivery',
      action: 'toggleInternalDelivery',
      color: 'orange',
      variant: 'light',
      icon: IconRefresh,
      translationKey: purchaseOrder.isInternalDelivery
        ? 'po.toggleExternalDelivery'
        : 'po.toggleInternalDelivery',
      isDisabled: !canEdit,
      onClick: () => void toggleInternalDeliveryAction.trigger(),
      isLoading: toggleInternalDeliveryAction.isMutating,
    });

    // Helper to create cancel button config
    const createCancelAction = (): POActionConfig => ({
      key: 'cancel',
      action: 'cancel',
      color: 'red',
      variant: 'outline',
      icon: IconX,
      translationKey: 'po.cancel',
      onClick: callbacks.onCancel,
      isDisabled: !canCancel,
    });

    // Helper to create refund button config
    const createRefundAction = (): POActionConfig => ({
      key: 'refund',
      action: 'refund',
      color: 'orange',
      variant: 'outline',
      icon: IconReceipt,
      translationKey: 'po.refund',
      onClick: callbacks.onRefund,
      isDisabled: !canRefund,
    });

    // Helper to create delete button config
    const createDeleteAction = (): POActionConfig => ({
      key: 'delete',
      action: 'delete',
      color: 'red',
      variant: 'outline',
      icon: IconTrash,
      translationKey: 'po.deleteOrder',
      onClick: callbacks.onDelete,
      isDisabled: !canDelete,
    });

    switch (purchaseOrder.status) {
      case 'NEW': {
        actions.push(
          createToggleInternalDeliveryAction(),
          {
            key: 'confirm',
            action: 'confirm',
            color: 'green',
            icon: IconCheck,
            translationKey: 'po.confirm',
            onClick: callbacks.onConfirm,
            isDisabled: !canConfirm,
          },
          createCancelAction(),
        );
        break;
      }

      case 'CONFIRMED': {
        actions.push(
          createToggleInternalDeliveryAction(),
          {
            key: 'process',
            action: 'process',
            color: 'blue',
            icon: IconPackage,
            translationKey: 'po.startProcessing',
            onClick: callbacks.onProcess,
            isDisabled: !canProcess,
          },
          createCancelAction(),
        );
        break;
      }

      case 'PROCESSING': {
        actions.push(createToggleInternalDeliveryAction(), {
          key: 'markReady',
          action: 'markReady',
          color: 'teal',
          icon: IconPackageExport,
          translationKey: 'po.markReady',
          onClick: callbacks.onMarkReady,
          isDisabled: !canMarkReady,
        });

        break;
      }

      case 'READY_FOR_PICKUP': {
        if (!purchaseOrder.deliveryRequest) {
          actions.push(createToggleInternalDeliveryAction());
        }
        if (purchaseOrder.isInternalDelivery && !purchaseOrder.deliveryRequest) {
          actions.push({
            key: 'create-delivery',
            action: 'createDelivery',
            color: 'blue',
            variant: 'filled',
            icon: IconClipboardList,
            translationKey: 'po.createDeliveryRequest',
            onClick: callbacks.onCreateDelivery ?? (() => {}),
            isDisabled: !canShip,
            showCondition: true,
          });
        } else {
          actions.push({
            key: 'ship',
            action: 'ship',
            color: 'indigo',
            icon: IconTruck,
            translationKey: 'po.markShipped',
            onClick: callbacks.onShip,
            isDisabled: !canShip,
          });
        }
        actions.push(createCancelAction());
        break;
      }

      case 'SHIPPED': {
        actions.push(
          {
            key: 'deliver',
            action: 'deliver',
            color: 'green',
            icon: IconPackageExport,
            translationKey: 'po.markDelivered',
            onClick: callbacks.onDeliver,
            isDisabled: !canDeliver,
          },
          createCancelAction(),
        );
        break;
      }

      case 'DELIVERED': {
        actions.push(createRefundAction());
        break;
      }

      case 'CANCELLED':
      case 'REFUNDED': {
        actions.push(createDeleteAction());
        break;
      }
    }

    // Filter out actions that shouldn't be shown
    return actions.filter((action) => action.showCondition !== false);
  }, [purchaseOrder, permissions, callbacks, toggleInternalDeliveryAction]);

  return availableActions;
}
