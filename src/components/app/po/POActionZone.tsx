import { Card, Stack, Group, Title, Button } from '@mantine/core';
import { useTranslation } from '@/hooks/useTranslation';
import { usePOActions } from '@/hooks/usePOActions';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';

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

  // Use the centralized hook for action logic
  const actions = usePOActions({
    purchaseOrder,
    isLoading,
    canEdit,
    // POActionZone uses canEdit for all permissions
    permissions: {
      canConfirm: canEdit,
      canCancel: canEdit,
      canProcess: canEdit,
      canMarkReady: canEdit,
      canShip: canEdit,
      canDeliver: canEdit,
      canRefund: canEdit,
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
