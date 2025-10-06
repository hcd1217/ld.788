import { useMemo } from 'react';

import { useNavigate } from 'react-router';

import { Anchor, Button, Grid, Group, Stack, Text } from '@mantine/core';
import { IconEdit, IconTruckDelivery, IconUser } from '@tabler/icons-react';

import { InfoField } from '@/components/common';
import { getDeliveryDetailRoute } from '@/config/routeConfig';
import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import { useCustomerMapByCustomerId, usePermissions } from '@/stores/useAppStore';
import { IconIdentifiers } from '@/utils/iconRegistry';
import { getCustomerNameByCustomerId } from '@/utils/overview';
import { canEditPurchaseOrder } from '@/utils/permission.utils';
import {
  getCancelReason,
  getDeliveryNotes,
  getRefundReason,
  getShippingInfo,
  isPOEditable,
} from '@/utils/purchaseOrder';
import { formatDate, formatDateTime } from '@/utils/time';

import { DeliveryStatusBadge } from '../delivery/DeliveryStatusBadge';

import { PODeliveryBadge } from './PODeliveryBadge';
import { POStatusBadge } from './POStatusBadge';
import { POUrgentBadge } from './POUrgentBadge';

type POAccordionInfoPanelProps = {
  readonly purchaseOrder: PurchaseOrder;
  readonly isLoading: boolean;
  readonly onEdit: () => void;
};

export function POAccordionInfoPanel({
  purchaseOrder,
  isLoading,
  onEdit,
}: POAccordionInfoPanelProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const customerMapByCustomerId = useCustomerMapByCustomerId();
  const isEditable = isPOEditable(purchaseOrder);
  const permissions = usePermissions();
  const { canEdit } = useMemo(
    () => ({
      canEdit: canEditPurchaseOrder(permissions),
    }),
    [permissions],
  );

  const notes = useMemo(() => {
    return {
      cancelReason: getCancelReason(purchaseOrder.statusHistory),
      deliveryNotes: getDeliveryNotes(purchaseOrder.statusHistory),
      refundReason: getRefundReason(purchaseOrder.statusHistory),
      shippingInfo: getShippingInfo(purchaseOrder.statusHistory),
    };
  }, [purchaseOrder.statusHistory]);

  return (
    <Stack gap="md">
      <Grid>
        <Grid.Col span={6}>
          <InfoField
            label={t('po.poNumber')}
            value={purchaseOrder.poNumber}
            valueProps={{ fw: 600 }}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <Text size="xs" fw={500} c="dimmed">
            {t('po.poStatus')}
          </Text>
          <Group gap="xs">
            <POStatusBadge status={purchaseOrder.status} size="sm" />
            <PODeliveryBadge isInternalDelivery={purchaseOrder.isInternalDelivery} />
            <POUrgentBadge isUrgentPO={purchaseOrder.isUrgentPO} />
          </Group>

          {isEditable && (
            <Button
              key="edit"
              variant="light"
              size="xs"
              ml="xs"
              loading={isLoading}
              disabled={!canEdit}
              leftSection={<IconEdit size={14} />}
              onClick={onEdit}
            >
              {t('common.edit')}
            </Button>
          )}
        </Grid.Col>
        <Grid.Col span={6}>
          <InfoField
            label={t('common.customer')}
            icon={IconIdentifiers.BUILDING}
            value={getCustomerNameByCustomerId(customerMapByCustomerId, purchaseOrder.customerId)}
          />
        </Grid.Col>
        {purchaseOrder.customerPONumber && (
          <Grid.Col span={6}>
            <InfoField label={t('po.customerPONumber')} value={purchaseOrder.customerPONumber} />
          </Grid.Col>
        )}

        {purchaseOrder.salesPerson && (
          <Grid.Col span={6}>
            <InfoField label={t('po.salesPerson')} value={purchaseOrder.salesPerson} />
          </Grid.Col>
        )}
        <Grid.Col span={6}>
          <InfoField
            label={t('po.orderDate')}
            icon={IconIdentifiers.CALENDAR}
            value={formatDate(purchaseOrder.orderDate)}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <InfoField
            label={t('po.deliveryDate')}
            icon={IconIdentifiers.CALENDAR}
            value={formatDate(purchaseOrder.deliveryDate)}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <InfoField
            label={t('po.completedDate')}
            icon={IconIdentifiers.CALENDAR}
            value={formatDateTime(purchaseOrder.completedDate)}
          />
        </Grid.Col>
      </Grid>

      <InfoField
        label={t('common.notes')}
        labelProps={{ size: 'xs', fw: 600, c: 'dimmed' }}
        value={purchaseOrder.notes ?? ''}
      />

      {notes.deliveryNotes && (
        <div>
          <Text size="xs" fw={500} c="blue" mb={4}>
            {t('po.deliveryNotes')}
          </Text>
          <Text size="sm">{notes.deliveryNotes}</Text>
        </div>
      )}

      {purchaseOrder.deliveryRequest && (
        <div>
          <Text size="xs" fw={500} c="blue" mb={4}>
            <IconTruckDelivery size={14} style={{ verticalAlign: 'middle' }} />{' '}
            {t('common.entity.deliveryRequest')}
          </Text>
          <Stack gap="xs">
            <Group gap="xs">
              <Text size="xs" c="dimmed">
                {t('delivery.id')}:
              </Text>
              <Anchor
                size="sm"
                c="blue"
                fw="bold"
                onClick={() => {
                  const deliveryRequestId = purchaseOrder.deliveryRequest?.deliveryRequestId || '-';
                  navigate(getDeliveryDetailRoute(deliveryRequestId));
                }}
              >
                {purchaseOrder.deliveryRequest.deliveryRequestNumber}
              </Anchor>
            </Group>
            <Group gap="xs">
              <Text size="xs" c="dimmed">
                {t('delivery.status')}:
              </Text>
              <DeliveryStatusBadge status={purchaseOrder.deliveryRequest.status} />
            </Group>
            <InfoField
              label={
                <Text size="xs" c="dimmed">
                  {t('delivery.assignedTo')}:
                </Text>
              }
              layout="horizontal"
              value={
                <Group gap={4}>
                  <IconUser size={14} color="var(--mantine-color-gray-6)" />
                  <Text size="sm">{purchaseOrder.deliveryRequest.deliveryPerson}</Text>
                </Group>
              }
            />
            <InfoField
              label={
                <Text size="xs" c="dimmed">
                  {t('delivery.scheduledDate')}:
                </Text>
              }
              layout="horizontal"
              value={formatDate(purchaseOrder.deliveryRequest.scheduledDate)}
              icon={IconIdentifiers.CALENDAR}
            />
          </Stack>
        </div>
      )}

      {notes.shippingInfo && (
        <div>
          <Text size="xs" fw={500} c="cyan" mb={4}>
            {t('po.shippingInfo')}
          </Text>
          {notes.shippingInfo.trackingNumber && (
            <Text size="sm">
              {t('po.trackingNumber')}: {notes.shippingInfo.trackingNumber}
            </Text>
          )}
          {notes.shippingInfo.carrier && (
            <Text size="sm">
              {t('po.carrier')}: {notes.shippingInfo.carrier}
            </Text>
          )}
        </div>
      )}

      {notes.cancelReason && (
        <div>
          <Text size="xs" fw={500} c="red" mb={4}>
            {t('po.cancelReason')}
          </Text>
          <Text size="sm">{notes.cancelReason}</Text>
        </div>
      )}

      {notes.refundReason && (
        <div>
          <Text size="xs" fw={500} c="orange" mb={4}>
            {t('po.refundReason')}
          </Text>
          <Text size="sm">{notes.refundReason}</Text>
        </div>
      )}
    </Stack>
  );
}
