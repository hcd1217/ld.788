import {
  Accordion,
  Stack,
  Group,
  Text,
  Button,
  Badge,
  Grid,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconEdit,
  IconCheck,
  IconPackage,
  IconTruck,
  IconPackageExport,
  IconX,
  IconReceipt,
  IconInfoCircle,
  IconClipboardList,
  IconMapPin,
  IconHistory,
  IconBuilding,
  IconCalendar,
  IconFileInvoice,
} from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import { formatDate, formatDateTime } from '@/utils/time';
import { POStatusBadge } from './POStatusBadge';
import { getCustomerNameByCustomerId, getEmployeeNameByUserId } from '@/utils/overview';
import { useCustomerMapByCustomerId, useEmployeeMapByUserId } from '@/stores/useAppStore';
import {
  getCancelReason,
  getRefundReason,
  getDeliveryNotes,
  getShippingInfo,
  getStatusHistoryByStatus,
} from '@/utils/purchaseOrder';
import { useMemo } from 'react';

type PODetailAccordionProps = {
  readonly purchaseOrder: PurchaseOrder;
  readonly isLoading?: boolean;
  readonly onEdit: () => void;
  readonly onConfirm: () => void;
  readonly onProcess: () => void;
  readonly onShip: () => void;
  readonly onDeliver: () => void;
  readonly onCancel: () => void;
  readonly onRefund: () => void;
};

export function PODetailAccordion({
  purchaseOrder,
  isLoading = false,
  onEdit,
  onConfirm,
  onProcess,
  onShip,
  onDeliver,
  onCancel,
  onRefund,
}: PODetailAccordionProps) {
  const { t } = useTranslation();
  const customerMapByCustomerId = useCustomerMapByCustomerId();
  const employeeMapByUserId = useEmployeeMapByUserId();
  const isEditable = purchaseOrder.status === 'NEW';

  const buttons = useMemo(() => {
    const buttons = [];

    if (purchaseOrder.status === 'NEW') {
      buttons.push(
        <Button
          key="confirm"
          color="green"
          size="xs"
          loading={isLoading}
          leftSection={<IconCheck size={14} />}
          onClick={onConfirm}
        >
          {t('po.confirm')}
        </Button>,
        <Button
          key="cancel"
          color="red"
          variant="outline"
          size="xs"
          loading={isLoading}
          leftSection={<IconX size={14} />}
          onClick={onCancel}
        >
          {t('po.cancel')}
        </Button>,
      );
    } else if (purchaseOrder.status === 'CONFIRMED') {
      buttons.push(
        <Button
          key="process"
          color="blue"
          size="xs"
          loading={isLoading}
          leftSection={<IconPackage size={14} />}
          onClick={onProcess}
        >
          {t('po.process')}
        </Button>,
        <Button
          key="cancel"
          color="red"
          variant="outline"
          size="xs"
          loading={isLoading}
          leftSection={<IconX size={14} />}
          onClick={onCancel}
        >
          {t('po.cancel')}
        </Button>,
      );
    } else if (purchaseOrder.status === 'PROCESSING') {
      buttons.push(
        <Button
          key="ship"
          color="indigo"
          size="xs"
          loading={isLoading}
          leftSection={<IconTruck size={14} />}
          onClick={onShip}
        >
          {t('po.ship')}
        </Button>,
      );
    } else if (purchaseOrder.status === 'SHIPPED') {
      buttons.push(
        <Button
          key="deliver"
          color="green"
          size="xs"
          loading={isLoading}
          leftSection={<IconPackageExport size={14} />}
          onClick={onDeliver}
        >
          {t('po.markDelivered')}
        </Button>,
        <Button
          key="refund"
          color="orange"
          variant="outline"
          size="xs"
          loading={isLoading}
          leftSection={<IconReceipt size={14} />}
          onClick={onRefund}
        >
          {t('po.refund')}
        </Button>,
      );
    } else if (purchaseOrder.status === 'DELIVERED') {
      buttons.push(
        <Button
          key="refund"
          color="orange"
          variant="outline"
          size="xs"
          loading={isLoading}
          leftSection={<IconReceipt size={14} />}
          onClick={onRefund}
        >
          {t('po.refund')}
        </Button>,
      );
    }

    return buttons;
  }, [
    purchaseOrder.status,
    isLoading,
    t,
    onConfirm,
    onCancel,
    onProcess,
    onShip,
    onDeliver,
    onRefund,
  ]);

  return (
    <Stack gap="md">
      <Accordion defaultValue="info" variant="contained">
        <Accordion.Item value="info">
          <Accordion.Control icon={<IconInfoCircle size={16} />}>
            {t('po.orderInformation')}
          </Accordion.Control>
          <Accordion.Panel>
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
                      {getCustomerNameByCustomerId(
                        customerMapByCustomerId,
                        purchaseOrder.customerId,
                      )}
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

              {purchaseOrder.address && (
                <div>
                  <Group justify="start" align="center" mb={4}>
                    <Text size="xs" fw={500} c="dimmed">
                      {t('po.shippingAddress')}
                    </Text>
                    {purchaseOrder.googleMapsUrl && (
                      <Tooltip label={t('customer.viewOnMap')}>
                        <ActionIcon
                          size="xs"
                          variant="subtle"
                          onClick={() => {
                            const googleMapsUrl = purchaseOrder.googleMapsUrl;
                            if (googleMapsUrl) {
                              window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
                            }
                          }}
                        >
                          <IconMapPin size={14} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </Group>
                  <Text size="sm">{purchaseOrder.address}</Text>
                </div>
              )}

              {purchaseOrder.notes && (
                <div>
                  <Text size="xs" fw={500} c="dimmed" mb={4}>
                    {t('po.notes')}
                  </Text>
                  <Text size="sm">{purchaseOrder.notes}</Text>
                </div>
              )}

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

              {getShippingInfo(purchaseOrder.statusHistory) && (
                <div>
                  <Text size="xs" fw={500} c="cyan" mb={4}>
                    {t('po.shippingInfo')}
                  </Text>
                  {getShippingInfo(purchaseOrder.statusHistory)?.trackingNumber && (
                    <Text size="sm">
                      {t('po.trackingNumber')}:{' '}
                      {getShippingInfo(purchaseOrder.statusHistory)?.trackingNumber}
                    </Text>
                  )}
                  {getShippingInfo(purchaseOrder.statusHistory)?.carrier && (
                    <Text size="sm">
                      {t('po.carrier')}: {getShippingInfo(purchaseOrder.statusHistory)?.carrier}
                    </Text>
                  )}
                </div>
              )}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="items">
          <Accordion.Control icon={<IconClipboardList size={16} />}>
            {t('po.orderItems')}
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="xs">
              {purchaseOrder.items.map((item) => (
                <Group
                  key={item.id}
                  justify="space-between"
                  p="xs"
                  style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}
                >
                  <div>
                    <Text size="sm" fw={500}>
                      {item.description}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {item.productCode}
                    </Text>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Text size="sm">
                      {t('po.quantity')}: {item.quantity}
                    </Text>
                  </div>
                </Group>
              ))}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        {purchaseOrder.statusHistory && purchaseOrder.statusHistory.length > 0 && (
          <Accordion.Item value="history">
            <Accordion.Control icon={<IconHistory size={16} />}>
              {t('po.orderTimeline')}
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap="xs">
                {getStatusHistoryByStatus(purchaseOrder.statusHistory, 'NEW') && (
                  <Group gap="xs" align="flex-start">
                    <IconFileInvoice size={16} color="var(--mantine-color-gray-6)" />
                    <div style={{ flex: 1 }}>
                      <Text size="xs" c="dimmed">
                        {t('po.createdBy')}:
                      </Text>
                      <Text size="sm">
                        {getEmployeeNameByUserId(
                          employeeMapByUserId,
                          getStatusHistoryByStatus(purchaseOrder.statusHistory, 'NEW')?.userId,
                        )}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {formatDateTime(
                          getStatusHistoryByStatus(purchaseOrder.statusHistory, 'NEW')?.timestamp,
                        )}
                      </Text>
                    </div>
                  </Group>
                )}
                {getStatusHistoryByStatus(purchaseOrder.statusHistory, 'CONFIRMED') && (
                  <Group gap="xs" align="flex-start">
                    <IconCheck size={16} color="var(--mantine-color-green-6)" />
                    <div style={{ flex: 1 }}>
                      <Text size="xs" c="dimmed">
                        {t('po.confirmedBy')}:
                      </Text>
                      <Text size="sm">
                        {getEmployeeNameByUserId(
                          employeeMapByUserId,
                          getStatusHistoryByStatus(purchaseOrder.statusHistory, 'CONFIRMED')
                            ?.userId,
                        )}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {formatDateTime(
                          getStatusHistoryByStatus(purchaseOrder.statusHistory, 'CONFIRMED')
                            ?.timestamp,
                        )}
                      </Text>
                    </div>
                  </Group>
                )}
                {getStatusHistoryByStatus(purchaseOrder.statusHistory, 'PROCESSING') && (
                  <Group gap="xs" align="flex-start">
                    <IconPackage size={16} color="var(--mantine-color-blue-6)" />
                    <div style={{ flex: 1 }}>
                      <Text size="xs" c="dimmed">
                        {t('po.processedBy')}:
                      </Text>
                      <Text size="sm">
                        {getEmployeeNameByUserId(
                          employeeMapByUserId,
                          getStatusHistoryByStatus(purchaseOrder.statusHistory, 'PROCESSING')
                            ?.userId,
                        )}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {formatDateTime(
                          getStatusHistoryByStatus(purchaseOrder.statusHistory, 'PROCESSING')
                            ?.timestamp,
                        )}
                      </Text>
                    </div>
                  </Group>
                )}
                {getStatusHistoryByStatus(purchaseOrder.statusHistory, 'SHIPPED') && (
                  <Group gap="xs" align="flex-start">
                    <IconTruck size={16} color="var(--mantine-color-indigo-6)" />
                    <div style={{ flex: 1 }}>
                      <Text size="xs" c="dimmed">
                        {t('po.shippedBy')}:
                      </Text>
                      <Text size="sm">
                        {getEmployeeNameByUserId(
                          employeeMapByUserId,
                          getStatusHistoryByStatus(purchaseOrder.statusHistory, 'SHIPPED')?.userId,
                        )}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {formatDateTime(
                          getStatusHistoryByStatus(purchaseOrder.statusHistory, 'SHIPPED')
                            ?.timestamp,
                        )}
                      </Text>
                    </div>
                  </Group>
                )}
                {getStatusHistoryByStatus(purchaseOrder.statusHistory, 'DELIVERED') && (
                  <Group gap="xs" align="flex-start">
                    <IconPackageExport size={16} color="var(--mantine-color-green-6)" />
                    <div style={{ flex: 1 }}>
                      <Text size="xs" c="dimmed">
                        {t('po.deliveredBy')}:
                      </Text>
                      <Text size="sm">
                        {getEmployeeNameByUserId(
                          employeeMapByUserId,
                          getStatusHistoryByStatus(purchaseOrder.statusHistory, 'DELIVERED')
                            ?.userId,
                        )}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {formatDateTime(
                          getStatusHistoryByStatus(purchaseOrder.statusHistory, 'DELIVERED')
                            ?.timestamp,
                        )}
                      </Text>
                    </div>
                  </Group>
                )}
                {getStatusHistoryByStatus(purchaseOrder.statusHistory, 'CANCELLED') && (
                  <Group gap="xs" align="flex-start">
                    <IconX size={16} color="var(--mantine-color-red-6)" />
                    <div style={{ flex: 1 }}>
                      <Text size="xs" c="dimmed">
                        {t('po.cancelledBy')}:
                      </Text>
                      <Text size="sm">
                        {getEmployeeNameByUserId(
                          employeeMapByUserId,
                          getStatusHistoryByStatus(purchaseOrder.statusHistory, 'CANCELLED')
                            ?.userId,
                        )}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {formatDateTime(
                          getStatusHistoryByStatus(purchaseOrder.statusHistory, 'CANCELLED')
                            ?.timestamp,
                        )}
                      </Text>
                    </div>
                  </Group>
                )}
                {getStatusHistoryByStatus(purchaseOrder.statusHistory, 'REFUNDED') && (
                  <Group gap="xs" align="flex-start">
                    <IconReceipt size={16} color="var(--mantine-color-orange-6)" />
                    <div style={{ flex: 1 }}>
                      <Text size="xs" c="dimmed">
                        {t('po.refundedBy')}:
                      </Text>
                      <Text size="sm">
                        {getEmployeeNameByUserId(
                          employeeMapByUserId,
                          getStatusHistoryByStatus(purchaseOrder.statusHistory, 'REFUNDED')?.userId,
                        )}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {formatDateTime(
                          getStatusHistoryByStatus(purchaseOrder.statusHistory, 'REFUNDED')
                            ?.timestamp,
                        )}
                      </Text>
                    </div>
                  </Group>
                )}
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        )}

        {purchaseOrder.address && (
          <Accordion.Item value="address">
            <Accordion.Control icon={<IconMapPin size={16} />}>
              <Group justify="start" align="center" gap="sm">
                <Text size="sm">{t('po.shippingAddress')}</Text>
                {purchaseOrder.googleMapsUrl && (
                  <Tooltip label={t('customer.viewOnMap')}>
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      onClick={() => {
                        const googleMapsUrl = purchaseOrder.googleMapsUrl;
                        if (googleMapsUrl) {
                          window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
                        }
                      }}
                    >
                      <IconMapPin size={16} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Group justify="space-between" align="flex-start">
                <Text size="sm">{purchaseOrder.address}</Text>
              </Group>
            </Accordion.Panel>
          </Accordion.Item>
        )}
      </Accordion>

      {buttons.length > 0 && (
        <Group ml="sm" gap="xs">
          {buttons}
        </Group>
      )}
    </Stack>
  );
}
