import {
  Card,
  Stack,
  Group,
  Button,
  Divider,
  Grid,
  Text,
  Badge,
  ActionIcon,
  Tooltip,
  SimpleGrid,
} from '@mantine/core';
import { IconEdit, IconBuilding, IconMapPin, IconCalendar } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import { formatDate, formatDateTime } from '@/utils/time';
import { POStatusBadge } from './POStatusBadge';
import { useCustomerMapByCustomerId, useEmployeeMapByUserId } from '@/stores/useAppStore';
import { getEmployeeNameByUserId, getCustomerNameByCustomerId } from '@/utils/overview';
import {
  getStatusHistoryByStatus,
  getCancelReason,
  getRefundReason,
  getDeliveryNotes,
  getShippingInfo,
  isPOEditable,
} from '@/utils/purchaseOrder';

type POBasicInfoCardProps = {
  readonly purchaseOrder: PurchaseOrder;
  readonly onEdit?: () => void;
  readonly onNavigateToItemsList?: () => void;
};

const span = { base: 12, md: 6 };

export function POBasicInfoCard({
  purchaseOrder,
  onEdit,
  onNavigateToItemsList,
}: POBasicInfoCardProps) {
  const { t } = useTranslation();
  const employeeMapByUserId = useEmployeeMapByUserId();
  const customerMapByCustomerId = useCustomerMapByCustomerId();
  const canEdit = isPOEditable(purchaseOrder);

  return (
    <Card shadow="sm" padding="xl" radius="md">
      <Stack gap="lg">
        <Grid>
          <Grid.Col span={span}>
            <Stack gap="md">
              <div>
                <Text size="sm" fw={500} c="dimmed">
                  {t('po.poNumber')}
                </Text>
                <Text size="lg" fw={600}>
                  {purchaseOrder.poNumber}
                </Text>
              </div>

              <div>
                <Text size="sm" fw={500} c="dimmed">
                  {t('po.poStatus')}
                </Text>
                <Group justify="start" gap="sm" align="center">
                  <POStatusBadge status={purchaseOrder.status} size="md" />
                  {canEdit && onEdit && (
                    <Button
                      variant="transparent"
                      leftSection={<IconEdit size={16} />}
                      onClick={onEdit}
                    >
                      {t('common.edit')}
                    </Button>
                  )}
                </Group>
              </div>
            </Stack>
          </Grid.Col>

          <Grid.Col span={span}>
            <Stack gap="md">
              <div>
                <Text size="sm" fw={500} c="dimmed">
                  {t('po.customer')}
                </Text>
                <Group gap="xs">
                  <IconBuilding size={16} color="var(--mantine-color-gray-6)" />
                  <div>
                    <Text fw={500}>
                      {getCustomerNameByCustomerId(
                        customerMapByCustomerId,
                        purchaseOrder.customerId,
                      )}
                    </Text>
                  </div>
                </Group>
              </div>

              <div>
                <Text size="sm" fw={500} c="dimmed">
                  {t('po.items')}
                </Text>
                <Badge
                  variant="transparent"
                  size="lg"
                  style={{ cursor: 'pointer' }}
                  onClick={onNavigateToItemsList}
                >
                  {purchaseOrder.items.length} {t('po.itemsCount')}
                </Badge>
              </div>
            </Stack>
          </Grid.Col>
        </Grid>
        <Divider />
        <Grid>
          <Grid.Col span={span}>
            <div>
              <Text size="sm" fw={500} c="dimmed">
                {t('po.orderDate')}
              </Text>
              <Group gap="xs">
                <IconCalendar size={16} color="var(--mantine-color-gray-6)" />
                <Text>{formatDate(purchaseOrder.orderDate)}</Text>
              </Group>
            </div>
          </Grid.Col>
          <Grid.Col span={span}>
            <div>
              <Text size="sm" fw={500} c="dimmed">
                {t('po.deliveryDate')}
              </Text>
              <Group gap="xs">
                <IconCalendar size={16} color="var(--mantine-color-gray-6)" />
                <Text>{formatDate(purchaseOrder.deliveryDate)}</Text>
              </Group>
            </div>
          </Grid.Col>
          <Grid.Col span={span}>
            <div>
              <Text size="sm" fw={500} c="dimmed">
                {t('po.completedDate')}
              </Text>
              <Group gap="xs">
                <IconCalendar size={16} color="var(--mantine-color-gray-6)" />
                <Text>{formatDateTime(purchaseOrder.completedDate)}</Text>
              </Group>
            </div>
          </Grid.Col>
        </Grid>
        <Divider />
        <Grid>
          <Grid.Col span={span}>
            <div>
              <Group justify="start" align="center" mb="xs">
                <Text size="sm" fw={500} c="dimmed">
                  {t('po.shippingAddress')}
                </Text>
                {purchaseOrder.googleMapsUrl && (
                  <Tooltip label={t('customer.viewOnMap')}>
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      onClick={() =>
                        window.open(purchaseOrder.googleMapsUrl!, '_blank', 'noopener,noreferrer')
                      }
                    >
                      <IconMapPin size={16} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Group>
              <Text size="sm">{purchaseOrder.address}</Text>
            </div>
          </Grid.Col>
          <Grid.Col span={span}>
            <div>
              <Text size="sm" fw={500} c="dimmed" mb="xs">
                {t('po.notes')}
              </Text>
              <Text size="sm">{purchaseOrder.notes}</Text>
            </div>
          </Grid.Col>
        </Grid>
        <Divider />
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          {getCancelReason(purchaseOrder.statusHistory) && (
            <div>
              <Text size="sm" fw={500} c="red" mb="xs">
                {t('po.cancelReason')}
              </Text>
              <Text size="sm">{getCancelReason(purchaseOrder.statusHistory)}</Text>
            </div>
          )}

          {getRefundReason(purchaseOrder.statusHistory) && (
            <div>
              <Text size="sm" fw={500} c="orange" mb="xs">
                {t('po.refundReason')}
              </Text>
              <Text size="sm">{getRefundReason(purchaseOrder.statusHistory)}</Text>
            </div>
          )}

          {getDeliveryNotes(purchaseOrder.statusHistory) && (
            <div>
              <Text size="sm" fw={500} c="blue" mb="xs">
                {t('po.deliveryNotes')}
              </Text>
              <Text size="sm">{getDeliveryNotes(purchaseOrder.statusHistory)}</Text>
            </div>
          )}

          {(() => {
            const shippingInfo = getShippingInfo(purchaseOrder.statusHistory);
            if (!shippingInfo) return null;
            return (
              <div>
                <Text size="sm" fw={500} c="cyan" mb="xs">
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
            );
          })()}
        </SimpleGrid>
        <Grid>
          {(() => {
            const statusesToShow = [
              { status: 'NEW', label: 'createdBy' },
              { status: 'CONFIRMED', label: 'confirmedBy' },
              { status: 'PROCESSING', label: 'processedBy' },
              { status: 'SHIPPED', label: 'shippedBy' },
              { status: 'DELIVERED', label: 'deliveredBy' },
            ] as const;

            return statusesToShow.map(({ status, label }) => {
              const entry = getStatusHistoryByStatus(purchaseOrder.statusHistory, status);
              if (!entry) return null;

              return (
                <Grid.Col key={status} span={span}>
                  <div>
                    <Text size="sm" fw={500} c="dimmed">
                      {t(`po.${label}`)}
                    </Text>
                    <Text>{getEmployeeNameByUserId(employeeMapByUserId, entry.userId)}</Text>
                    <Text size="xs" c="dimmed">
                      {formatDateTime(entry.timestamp)}
                    </Text>
                  </div>
                </Grid.Col>
              );
            });
          })()}
        </Grid>
      </Stack>
    </Card>
  );
}
