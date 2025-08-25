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
  const canEdit = purchaseOrder.status === 'NEW';

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

          {getShippingInfo(purchaseOrder.statusHistory) && (
            <div>
              <Text size="sm" fw={500} c="cyan" mb="xs">
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
        </SimpleGrid>
        <Grid>
          {getStatusHistoryByStatus(purchaseOrder.statusHistory, 'NEW') && (
            <Grid.Col span={span}>
              <div>
                <Text size="sm" fw={500} c="dimmed">
                  {t('po.createdBy')}
                </Text>
                <Text>
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
            </Grid.Col>
          )}

          {getStatusHistoryByStatus(purchaseOrder.statusHistory, 'CONFIRMED') && (
            <Grid.Col span={span}>
              <div>
                <Text size="sm" fw={500} c="dimmed">
                  {t('po.confirmedBy')}
                </Text>
                <Text>
                  {getEmployeeNameByUserId(
                    employeeMapByUserId,
                    getStatusHistoryByStatus(purchaseOrder.statusHistory, 'CONFIRMED')?.userId,
                  )}
                </Text>
                <Text size="xs" c="dimmed">
                  {formatDateTime(
                    getStatusHistoryByStatus(purchaseOrder.statusHistory, 'CONFIRMED')?.timestamp,
                  )}
                </Text>
              </div>
            </Grid.Col>
          )}

          {getStatusHistoryByStatus(purchaseOrder.statusHistory, 'PROCESSING') && (
            <Grid.Col span={span}>
              <div>
                <Text size="sm" fw={500} c="dimmed">
                  {t('po.processedBy')}
                </Text>
                <Text>
                  {getEmployeeNameByUserId(
                    employeeMapByUserId,
                    getStatusHistoryByStatus(purchaseOrder.statusHistory, 'PROCESSING')?.userId,
                  )}
                </Text>
                <Text size="xs" c="dimmed">
                  {formatDateTime(
                    getStatusHistoryByStatus(purchaseOrder.statusHistory, 'PROCESSING')?.timestamp,
                  )}
                </Text>
              </div>
            </Grid.Col>
          )}

          {getStatusHistoryByStatus(purchaseOrder.statusHistory, 'SHIPPED') && (
            <Grid.Col span={span}>
              <div>
                <Text size="sm" fw={500} c="dimmed">
                  {t('po.shippedBy')}
                </Text>
                <Text>
                  {getEmployeeNameByUserId(
                    employeeMapByUserId,
                    getStatusHistoryByStatus(purchaseOrder.statusHistory, 'SHIPPED')?.userId,
                  )}
                </Text>
                <Text size="xs" c="dimmed">
                  {formatDateTime(
                    getStatusHistoryByStatus(purchaseOrder.statusHistory, 'SHIPPED')?.timestamp,
                  )}
                </Text>
              </div>
            </Grid.Col>
          )}

          {getStatusHistoryByStatus(purchaseOrder.statusHistory, 'DELIVERED') && (
            <Grid.Col span={span}>
              <div>
                <Text size="sm" fw={500} c="dimmed">
                  {t('po.deliveredBy')}
                </Text>
                <Text>
                  {getEmployeeNameByUserId(
                    employeeMapByUserId,
                    getStatusHistoryByStatus(purchaseOrder.statusHistory, 'DELIVERED')?.userId,
                  )}
                </Text>
                <Text size="xs" c="dimmed">
                  {formatDateTime(
                    getStatusHistoryByStatus(purchaseOrder.statusHistory, 'DELIVERED')?.timestamp,
                  )}
                </Text>
              </div>
            </Grid.Col>
          )}
        </Grid>
      </Stack>
    </Card>
  );
}
