import type React from 'react';
import { useMemo } from 'react';

import {
  IconCheck,
  IconClipboardList,
  IconPackage,
  IconPackageExport,
  type IconProps,
  IconReceipt,
  IconTruck,
  IconX,
} from '@tabler/icons-react';

import type { PurchaseOrder } from '@/services/sales/purchaseOrder';

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
  permissions,
  callbacks,
}: UsePOActionsProps): POActionConfig[] {
  // Extract permissions with defaults based on variant

  const availableActions = useMemo(() => {
    const canCancel = permissions.canCancel;
    const canProcess = permissions.canProcess;
    const canMarkReady = permissions.canMarkReady;
    const canShip = permissions.canShip;
    const canDeliver = permissions.canDeliver;
    const canRefund = permissions.canRefund;
    const canConfirm = permissions.canConfirm;

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
        actions.push({
          key: 'ship',
          action: 'ship',
          color: 'indigo',
          icon: IconTruck,
          translationKey: 'po.markShipped',
          onClick: callbacks.onShip,
          isDisabled: !purchaseOrder.deliveryRequest || !canShip || isLoading,
        });

        if (callbacks.onCreateDelivery) {
          actions.push({
            key: 'create-delivery',
            action: 'createDelivery',
            color: 'blue',
            variant: 'filled',
            icon: IconClipboardList,
            translationKey: 'po.createDeliveryRequest',
            onClick: callbacks.onCreateDelivery,
            isDisabled: !!purchaseOrder.deliveryRequest || !canShip || isLoading,
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
  }, [purchaseOrder, isLoading, permissions, callbacks]);

  return availableActions;
}
