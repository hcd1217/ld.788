import { Stack, Grid, Text, Group, Badge, Button, Anchor } from '@mantine/core';
import {
  IconBuilding,
  IconCalendar,
  IconEdit,
  IconTruckDelivery,
  IconUser,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { useTranslation } from '@/hooks/useTranslation';
import { POStatusBadge } from './POStatusBadge';
import { formatDate, formatDateTime } from '@/utils/time';
import {
  getCustomerNameByCustomerId,
  getEmployeeNameByEmployeeId,
  getEmployeeNameByUserId,
} from '@/utils/overview';
import {
  useCustomerMapByCustomerId,
  useEmployeeMapByEmployeeId,
  useEmployeeMapByUserId,
} from '@/stores/useAppStore';
import {
  getCancelReason,
  getRefundReason,
  getDeliveryNotes,
  getShippingInfo,
  isPOEditable,
} from '@/utils/purchaseOrder';
import { getDeliveryDetailRoute } from '@/config/routeConfig';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import { DeliveryStatusBadge } from '../delivery/DeliveryStatusBadge';

type POAccordionInfoPanelProps = {
  readonly purchaseOrder: PurchaseOrder;
  readonly isLoading: boolean;
  readonly canEdit: boolean;
  readonly onEdit: () => void;
};

export function POAccordionInfoPanel({
  purchaseOrder,
  isLoading,
  canEdit,
  onEdit,
}: POAccordionInfoPanelProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const customerMapByCustomerId = useCustomerMapByCustomerId();
  const employeeMapByUserId = useEmployeeMapByUserId();
  const employeeMapByEmployeeId = useEmployeeMapByEmployeeId();
  const isEditable = isPOEditable(purchaseOrder);
  const shippingInfo = getShippingInfo(purchaseOrder.statusHistory);

  return (
    <Stack gap="md">
      <Grid>
        <Grid.Col span={6}>
          <Text size="xs" fw={500} c="dimmed">
            {t('po.poNumber')}
          </Text>
          <Text size="sm" fw={600}>
            {purchaseOrder.poNumber}
          </Text>
        </Grid.Col>
        <Grid.Col span={6}>
          <Text size="xs" fw={500} c="dimmed">
            {t('po.poStatus')}
          </Text>
          <POStatusBadge status={purchaseOrder.status} size="sm" />
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
          <Text size="xs" fw={500} c="dimmed">
            {t('po.customer')}
          </Text>
          <Group gap="xs">
            <IconBuilding size={14} color="var(--mantine-color-gray-6)" />
            <Text size="sm">
              {getCustomerNameByCustomerId(customerMapByCustomerId, purchaseOrder.customerId)}
            </Text>
          </Group>
        </Grid.Col>
        <Grid.Col span={6}>
          <Text size="xs" fw={500} c="dimmed">
            {t('po.orderDate')}
          </Text>
          <Group gap="xs">
            <IconCalendar size={14} color="var(--mantine-color-gray-6)" />
            <Text size="sm">{formatDateTime(purchaseOrder.orderDate)}</Text>
          </Group>
        </Grid.Col>
        <Grid.Col span={6}>
          <Text size="xs" fw={500} c="dimmed">
            {t('po.items')}
          </Text>
          <Badge variant="light" size="sm">
            {purchaseOrder.items.length}
          </Badge>
        </Grid.Col>
        {purchaseOrder.deliveryDate && (
          <Grid.Col span={6}>
            <Text size="xs" fw={500} c="dimmed">
              {t('po.deliveryDate')}
            </Text>
            <Group gap="xs">
              <IconCalendar size={14} color="var(--mantine-color-gray-6)" />
              <Text size="sm">{formatDate(purchaseOrder.deliveryDate)}</Text>
            </Group>
          </Grid.Col>
        )}
        {purchaseOrder.completedDate && (
          <Grid.Col span={6}>
            <Text size="xs" fw={500} c="dimmed">
              {t('po.completedDate')}
            </Text>
            <Group gap="xs">
              <IconCalendar size={14} color="var(--mantine-color-gray-6)" />
              <Text size="sm">{formatDateTime(purchaseOrder.completedDate)}</Text>
            </Group>
          </Grid.Col>
        )}
      </Grid>

      <div>
        <Text size="xs" fw={500} c="dimmed" mb={4}>
          {t('po.notes')}
        </Text>
        <Text size="sm">{purchaseOrder.notes || '-'}</Text>
      </div>

      {getCancelReason(purchaseOrder.statusHistory) && (
        <div>
          <Text size="xs" fw={500} c="red" mb={4}>
            {t('po.cancelReason')}
          </Text>
          <Text size="sm">{getCancelReason(purchaseOrder.statusHistory)}</Text>
        </div>
      )}

      {getRefundReason(purchaseOrder.statusHistory) && (
        <div>
          <Text size="xs" fw={500} c="orange" mb={4}>
            {t('po.refundReason')}
          </Text>
          <Text size="sm">{getRefundReason(purchaseOrder.statusHistory)}</Text>
        </div>
      )}

      {getDeliveryNotes(purchaseOrder.statusHistory) && (
        <div>
          <Text size="xs" fw={500} c="blue" mb={4}>
            {t('po.deliveryNotes')}
          </Text>
          <Text size="sm">{getDeliveryNotes(purchaseOrder.statusHistory)}</Text>
        </div>
      )}

      {purchaseOrder.deliveryRequest && (
        <div>
          <Text size="xs" fw={500} c="blue" mb={4}>
            <IconTruckDelivery size={14} style={{ verticalAlign: 'middle' }} />{' '}
            {t('po.deliveryRequest')}
          </Text>
          <Stack gap="xs">
            <Group gap="xs">
              <Text size="xs" c="dimmed">
                {t('delivery.fields.id')}:
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
                {t('delivery.fields.status')}:
              </Text>
              <DeliveryStatusBadge status={purchaseOrder.deliveryRequest.status} />
            </Group>
            {purchaseOrder.deliveryRequest.assignedTo && (
              <Group gap="xs">
                <Text size="xs" c="dimmed">
                  {t('delivery.fields.assignedTo')}:
                </Text>
                <Group gap={4}>
                  <IconUser size={14} color="var(--mantine-color-gray-6)" />
                  <Text size="sm">
                    {purchaseOrder.deliveryRequest.assignedType === 'EMPLOYEE'
                      ? getEmployeeNameByEmployeeId(
                          employeeMapByEmployeeId,
                          purchaseOrder.deliveryRequest.assignedTo,
                        )
                      : getEmployeeNameByUserId(
                          employeeMapByUserId,
                          purchaseOrder.deliveryRequest.assignedTo,
                        )}
                  </Text>
                </Group>
              </Group>
            )}
            <Group gap="xs">
              <Text size="xs" c="dimmed">
                {t('delivery.fields.scheduledDate')}:
              </Text>
              <Group gap={4}>
                <IconCalendar size={14} color="var(--mantine-color-gray-6)" />
                <Text size="sm">{formatDate(purchaseOrder.deliveryRequest.scheduledDate)}</Text>
              </Group>
            </Group>
          </Stack>
        </div>
      )}

      {shippingInfo && (
        <div>
          <Text size="xs" fw={500} c="cyan" mb={4}>
            {t('po.shippingInfo')}
          </Text>
          {shippingInfo.trackingNumber && (
            <Text size="sm">
              {t('po.trackingNumber')}: {shippingInfo.trackingNumber}
            </Text>
          )}
          {shippingInfo.carrier && (
            <Text size="sm">
              {t('po.carrier')}: {shippingInfo.carrier}
            </Text>
          )}
        </div>
      )}
    </Stack>
  );
}
