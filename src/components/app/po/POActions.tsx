import React from 'react';
import { type MantineStyleProp, ActionIcon, Group } from '@mantine/core';
import {
  IconEdit,
  IconCheck,
  IconPackage,
  IconTruck,
  IconPackageExport,
  IconX,
  IconReceipt,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { useTranslation } from '@/hooks/useTranslation';
import { Tooltip } from '@/components/common';
import { getPOEditRoute } from '@/config/routeConfig';
import { isPOStatusNew } from '@/utils/purchaseOrder';
import type { POStatus } from '@/services/sales/purchaseOrder';

type POActionsProps = {
  readonly purchaseOrderId: string;
  readonly status: POStatus;
  readonly gap?: number;
  readonly style?: MantineStyleProp;
  readonly canEdit: boolean;
  readonly canConfirm?: boolean;
  readonly canProcess?: boolean;
  readonly canShip?: boolean;
  readonly canMarkReady?: boolean;
  readonly canDeliver?: boolean;
  readonly canRefund?: boolean;
  readonly canCancel?: boolean;
  readonly isLoading?: boolean;
  readonly onConfirm?: () => void;
  readonly onProcess?: () => void;
  readonly onMarkReady?: () => void;
  readonly onShip?: () => void;
  readonly onDeliver?: () => void;
  readonly onCancel?: () => void;
  readonly onRefund?: () => void;
};

export function POActions({
  purchaseOrderId,
  status,
  canEdit = false,
  canConfirm = false,
  canProcess = false,
  canShip = false,
  canMarkReady = false,
  canDeliver = false,
  canRefund = false,
  canCancel = false,
  isLoading = false,
  onConfirm,
  onProcess,
  onMarkReady,
  onShip,
  onDeliver,
  onCancel,
  onRefund,
  gap = 4,
  style,
}: POActionsProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(getPOEditRoute(purchaseOrderId));
  };

  const handleAction = (action?: () => void) => (event: React.MouseEvent) => {
    event.stopPropagation();
    action?.();
  };

  return (
    <Group gap={gap} style={style}>
      {/* NEW status: Can edit, confirm, cancel */}
      {isPOStatusNew(status) && (
        <>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            disabled={isLoading || !canEdit}
            aria-label={t('common.edit')}
            onClick={handleEdit}
          >
            <Tooltip label={t('common.edit')} position="bottom">
              <IconEdit size={16} />
            </Tooltip>
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="green"
            size="sm"
            disabled={isLoading || !canConfirm}
            aria-label={t('po.confirm')}
            onClick={handleAction(onConfirm)}
          >
            <Tooltip label={t('po.confirm')} position="bottom">
              <IconCheck size={16} />
            </Tooltip>
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            size="sm"
            disabled={isLoading || !canCancel}
            aria-label={t('po.cancel')}
            onClick={handleAction(onCancel)}
          >
            <Tooltip label={t('po.cancel')} position="bottom">
              <IconX size={16} />
            </Tooltip>
          </ActionIcon>
        </>
      )}

      {/* CONFIRMED status: Can process, cancel */}
      {status === 'CONFIRMED' && (
        <>
          <ActionIcon
            variant="subtle"
            color="blue"
            size="sm"
            disabled={isLoading || !canProcess}
            aria-label={t('po.process')}
            onClick={handleAction(onProcess)}
          >
            <Tooltip label={t('po.process')} position="bottom">
              <IconPackage size={16} />
            </Tooltip>
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            size="sm"
            disabled={isLoading || !canCancel}
            aria-label={t('po.cancel')}
            onClick={handleAction(onCancel)}
          >
            <Tooltip label={t('po.cancel')} position="bottom">
              <IconX size={16} />
            </Tooltip>
          </ActionIcon>
        </>
      )}

      {/* PROCESSING status: Can mark ready for pickup */}
      {status === 'PROCESSING' && (
        <ActionIcon
          variant="subtle"
          color="teal"
          size="sm"
          disabled={isLoading || !canMarkReady}
          aria-label={t('po.markReady')}
          onClick={handleAction(onMarkReady)}
        >
          <Tooltip label={t('po.markReady')} position="bottom">
            <IconPackage size={16} />
          </Tooltip>
        </ActionIcon>
      )}

      {/* READY_FOR_PICKUP status: Can ship */}
      {status === 'READY_FOR_PICKUP' && (
        <ActionIcon
          variant="subtle"
          color="indigo"
          size="sm"
          disabled={isLoading || !canShip}
          aria-label={t('po.ship')}
          onClick={handleAction(onShip)}
        >
          <Tooltip label={t('po.ship')} position="bottom">
            <IconTruck size={16} />
          </Tooltip>
        </ActionIcon>
      )}

      {/* SHIPPED status: Can deliver, refund */}
      {status === 'SHIPPED' && (
        <>
          <ActionIcon
            variant="subtle"
            color="green"
            size="sm"
            disabled={isLoading || !canDeliver}
            aria-label={t('po.markDelivered')}
            onClick={handleAction(onDeliver)}
          >
            <Tooltip label={t('po.markDelivered')} position="bottom">
              <IconPackageExport size={16} />
            </Tooltip>
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="orange"
            size="sm"
            disabled={isLoading || !canRefund}
            aria-label={t('po.refund')}
            onClick={handleAction(onRefund)}
          >
            <Tooltip label={t('po.refund')} position="bottom">
              <IconReceipt size={16} />
            </Tooltip>
          </ActionIcon>
        </>
      )}

      {/* DELIVERED status: Can refund */}
      {status === 'DELIVERED' && (
        <ActionIcon
          variant="subtle"
          color="orange"
          size="sm"
          disabled={isLoading || !canEdit}
          aria-label={t('po.refund')}
          onClick={handleAction(onRefund)}
        >
          <Tooltip label={t('po.refund')} position="bottom">
            <IconReceipt size={16} />
          </Tooltip>
        </ActionIcon>
      )}

      {/* CANCELLED and REFUNDED status: No actions */}
    </Group>
  );
}
