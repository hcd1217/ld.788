import { Button, Group } from '@mantine/core';
import { useTranslation } from '@/hooks/useTranslation';
import { usePOActions } from '@/hooks/usePOActions';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';

type POAccordionActionsProps = {
  readonly canEdit: boolean;
  readonly canConfirm: boolean;
  readonly canProcess: boolean;
  readonly canShip: boolean;
  readonly canMarkReady: boolean;
  readonly canDeliver: boolean;
  readonly canRefund: boolean;
  readonly canCancel: boolean;
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
  canConfirm,
  canProcess,
  canShip,
  canMarkReady,
  canDeliver,
  canRefund,
  canCancel,
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

  // Use the centralized hook for action logic
  const actions = usePOActions({
    purchaseOrder,
    isLoading,
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
      iconSize: 14,
      buttonSize: 'xs',
    },
  });

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
            loading={isLoading}
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
