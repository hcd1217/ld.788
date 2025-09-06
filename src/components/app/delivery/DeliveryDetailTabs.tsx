import { Stack, Group, Card, Text, Grid, Anchor } from '@mantine/core';
import { IconMapPin } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { DeliveryRequest } from '@/services/sales/deliveryRequest';
import { formatDate } from '@/utils/time';
import { useMemo } from 'react';
import { getEmployeeNameByEmployeeId, getEmployeeNameByUserId } from '@/utils/overview';
import { useEmployeeMapByEmployeeId } from '@/stores/useAppStore';
import { useEmployeeMapByUserId } from '@/stores/useAppStore';
import { DeliveryStatusBadge } from './DeliveryStatusBadge';
import { DeliveryPhotoGallery } from './DeliveryPhotoGallery';
import { ViewOnMap } from '@/components/common';
import { getPODetailRoute } from '@/config/routeConfig';
import { useNavigate } from 'react-router';

type DeliveryDetailTabsProps = {
  readonly deliveryRequest: DeliveryRequest;
  readonly isLoading?: boolean;
};

export function DeliveryDetailTabs({
  deliveryRequest,
  isLoading: _isLoading,
}: DeliveryDetailTabsProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const employeeMapByEmployeeId = useEmployeeMapByEmployeeId();
  const employeeMapByUserId = useEmployeeMapByUserId();

  const assignedName = useMemo(() => {
    if (!deliveryRequest.assignedTo) {
      return t('common.notAssigned');
    }
    if (deliveryRequest.assignedType === 'EMPLOYEE') {
      return getEmployeeNameByEmployeeId(employeeMapByEmployeeId, deliveryRequest.assignedTo);
    }
    return getEmployeeNameByUserId(employeeMapByUserId, deliveryRequest.assignedTo);
  }, [
    t,
    deliveryRequest.assignedTo,
    deliveryRequest.assignedType,
    employeeMapByEmployeeId,
    employeeMapByUserId,
  ]);

  return (
    <Stack gap="lg">
      {/* Header with Actions */}
      <Group justify="start" align="center" gap="md">
        <Text size="xl" fw={600}>
          {t('delivery.deliveryId')}: {deliveryRequest.deliveryRequestNumber}
        </Text>
        <DeliveryStatusBadge status={deliveryRequest.status} />
      </Group>

      {/* Main Content */}
      <Grid>
        <Grid.Col span={8}>
          <Stack gap="md">
            {/* Delivery Information */}
            <Card withBorder>
              <Text fw={500} mb="md">
                {t('delivery.detail.deliveryInfo')}
              </Text>
              <Grid>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <div>
                      <Text size="sm" c="dimmed">
                        {t('delivery.fields.poNumber')}
                      </Text>
                      <Text size="sm" fw={500}>
                        <Anchor
                          size="sm"
                          c="blue"
                          fw="bold"
                          onClick={() => {
                            const purchaseOrderId = deliveryRequest.purchaseOrderId || '-';
                            navigate(getPODetailRoute(purchaseOrderId));
                          }}
                        >
                          {deliveryRequest.purchaseOrderNumber}
                        </Anchor>
                      </Text>
                    </div>
                    <div>
                      <Text size="sm" c="dimmed">
                        {t('delivery.fields.customer')}
                      </Text>
                      <Text size="sm" fw={500}>
                        {deliveryRequest.customerName}
                      </Text>
                    </div>
                    <div>
                      <Text size="sm" c="dimmed">
                        {t('delivery.fields.assignedTo')}
                      </Text>
                      <Text size="sm" fw={500}>
                        {assignedName}
                      </Text>
                    </div>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <div>
                      <Text size="sm" c="dimmed">
                        {t('delivery.fields.scheduledDate')}
                      </Text>
                      <Text size="sm" fw={500}>
                        {deliveryRequest.scheduledDate
                          ? formatDate(deliveryRequest.scheduledDate)
                          : t('common.notScheduled')}
                      </Text>
                    </div>
                    {deliveryRequest.completedDate && (
                      <div>
                        <Text size="sm" c="dimmed">
                          {t('delivery.fields.completedDate')}
                        </Text>
                        <Text size="sm" fw={500}>
                          {formatDate(deliveryRequest.completedDate)}
                        </Text>
                      </div>
                    )}
                    <div>
                      <Text size="sm" c="dimmed">
                        {t('delivery.fields.status')}
                      </Text>
                      <DeliveryStatusBadge status={deliveryRequest.status} />
                    </div>
                  </Stack>
                </Grid.Col>
              </Grid>

              {deliveryRequest.notes && (
                <div>
                  <Text size="sm" c="dimmed" mt="md" mb="xs">
                    {t('delivery.fields.notes')}
                  </Text>
                  <Text size="sm">{deliveryRequest.notes}</Text>
                </div>
              )}
            </Card>

            {/* Delivery Address */}
            <Card withBorder>
              <Group justify="space-between" mb="md">
                <Group gap="xs">
                  <IconMapPin size={20} />
                  <Text fw={500}>{t('po.shippingAddress')}</Text>
                </Group>
                <ViewOnMap googleMapsUrl={deliveryRequest.deliveryAddress?.googleMapsUrl} />
              </Group>
              <Text size="sm">{deliveryRequest.deliveryAddress?.oneLineAddress || '-'}</Text>
            </Card>
          </Stack>
        </Grid.Col>

        <Grid.Col span={4}>
          {/* Photos Section */}
          <Card withBorder>
            <Text fw={500} mb="md">
              {t('delivery.detail.photos')}
            </Text>
            <DeliveryPhotoGallery
              photoUrls={deliveryRequest.photoUrls}
              columns={12}
              imageHeight={120}
            />
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
