import type React from 'react';
import { useMemo } from 'react';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import type { ButtonProps } from '@mantine/core';
import {
  IconCheck,
  IconPackage,
  IconTruck,
  IconPackageExport,
  IconX,
  IconReceipt,
  IconClipboardList,
  type IconProps,
} from '@tabler/icons-react';

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
    | 'createDelivery';
  readonly color: ButtonProps['color'];
  readonly variant?: ButtonProps['variant'];
  readonly icon: React.ComponentType<IconProps>;
  readonly translationKey: string;
  readonly onClick: () => void;
  readonly isDisabled?: boolean;
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
  readonly canEdit?: boolean;
  readonly permissions: {
    readonly canConfirm: boolean;
    readonly canCancel: boolean;
    readonly canProcess: boolean;
    readonly canMarkReady: boolean;
    readonly canShip: boolean;
    readonly canDeliver: boolean;
    readonly canRefund: boolean;
  };
  readonly callbacks: {
    readonly onConfirm: () => void;
    readonly onCancel: () => void;
    readonly onProcess: () => void;
    readonly onMarkReady: () => void;
    readonly onShip: () => void;
    readonly onDeliver: () => void;
    readonly onRefund: () => void;
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
  isLoading = false,
  canEdit = false,
  permissions,
  callbacks,
}: UsePOActionsProps): POActionConfig[] {
  // Extract permissions with defaults based on variant
  const {
    canConfirm = canEdit,
    canCancel = canEdit,
    canProcess = canEdit,
    canMarkReady = canEdit,
    canShip = canEdit,
    canDeliver = canEdit,
    canRefund = canEdit,
  } = permissions;

  const availableActions = useMemo(() => {
    const actions: POActionConfig[] = [];

    // Helper to create cancel button config
    const createCancelAction = (): POActionConfig => ({
      key: 'cancel',
      action: 'cancel',
      color: 'red',
      variant: 'outline',
      icon: IconX,
      translationKey: 'po.cancel',
      onClick: callbacks.onCancel,
      isDisabled: !canCancel || isLoading,
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
      isDisabled: !canRefund || isLoading,
    });

    // Helper to create ship button config
    const createShipAction = (): POActionConfig => ({
      key: 'ship',
      action: 'ship',
      color: 'indigo',
      icon: IconTruck,
      translationKey: 'po.markShipped',
      onClick: callbacks.onShip,
      isDisabled: !purchaseOrder.deliveryRequest || !canShip || isLoading,
    });

    switch (purchaseOrder.status) {
      case 'NEW': {
        actions.push(
          {
            key: 'confirm',
            action: 'confirm',
            color: 'green',
            icon: IconCheck,
            translationKey: 'po.confirm',
            onClick: callbacks.onConfirm,
            isDisabled: !canConfirm || isLoading,
          },
          createCancelAction(),
        );
        break;
      }

      case 'CONFIRMED': {
        actions.push(
          {
            key: 'process',
            action: 'process',
            color: 'blue',
            icon: IconPackage,
            translationKey: 'po.startProcessing',
            onClick: callbacks.onProcess,
            isDisabled: !canProcess || isLoading,
          },
          createCancelAction(),
        );
        break;
      }

      case 'PROCESSING': {
        actions.push({
          key: 'markReady',
          action: 'markReady',
          color: 'teal',
          icon: IconPackageExport,
          translationKey: 'po.markReady',
          onClick: callbacks.onMarkReady,
          isDisabled: !canMarkReady || isLoading,
        });

        break;
      }

      case 'READY_FOR_PICKUP': {
        actions.push(createShipAction());

        if (callbacks.onCreateDelivery) {
          actions.push({
            key: 'create-delivery',
            action: 'createDelivery',
            color: 'blue',
            variant: 'filled',
            icon: IconClipboardList,
            translationKey: 'po.createDeliveryRequest',
            onClick: callbacks.onCreateDelivery,
            isDisabled: !!purchaseOrder.deliveryRequest || !canEdit || isLoading,
            showCondition: true,
          });
        }
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
            isDisabled: !canDeliver || isLoading,
          },
          createRefundAction(),
        );
        break;
      }

      case 'DELIVERED': {
        actions.push(createRefundAction());
        break;
      }

      case 'CANCELLED':
      case 'REFUNDED': {
        // No actions available for terminal states
        break;
      }
    }

    // Filter out actions that shouldn't be shown
    return actions.filter((action) => action.showCondition !== false);
  }, [
    purchaseOrder.status,
    purchaseOrder.deliveryRequest,
    isLoading,
    canEdit,
    canConfirm,
    canCancel,
    canProcess,
    canMarkReady,
    canShip,
    canDeliver,
    canRefund,
    callbacks,
  ]);

  return availableActions;
}
