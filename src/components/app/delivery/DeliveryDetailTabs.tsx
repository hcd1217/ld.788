import { useMemo } from 'react';

import { useNavigate } from 'react-router';

import { Anchor, Button, Card, Grid, Group, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconMapPin } from '@tabler/icons-react';

import { UrgentBadge, ViewOnMap } from '@/components/common';
import { getPODetailRoute } from '@/config/routeConfig';
import { useTranslation } from '@/hooks/useTranslation';
import type { DeliveryRequest } from '@/services/sales';
import { usePermissions } from '@/stores/useAppStore';
import { useDeliveryRequestActions } from '@/stores/useDeliveryRequestStore';
import { canDeletePhotoDeliveryRequest, canEditDeliveryRequest } from '@/utils/permission.utils';
import { formatDate } from '@/utils/time';

import { DeliveryPhotoGallery } from './DeliveryPhotoGallery';
import { DeliveryStatusBadge } from './DeliveryStatusBadge';

type DeliveryDetailTabsProps = {
  readonly deliveryRequest: DeliveryRequest;
  readonly isLoading?: boolean;
  readonly onUpdate?: () => void;
};

export function DeliveryDetailTabs({
  deliveryRequest,
  isLoading: _isLoading,
  onUpdate,
}: DeliveryDetailTabsProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const permissions = usePermissions();
  const { deletePhoto } = useDeliveryRequestActions();
  const canEdit = useMemo(() => canEditDeliveryRequest(permissions), [permissions]);
  const canDelete = useMemo(() => canDeletePhotoDeliveryRequest(permissions), [permissions]);

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await deletePhoto(deliveryRequest.id, photoId);
      notifications.show({
        title: t('common.success'),
        message: 'Photo deleted successfully',
        color: 'green',
      });
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete photo',
        color: 'red',
      });
    }
  };

  return (
    <Stack gap="lg">
      {/* Header with Actions */}
      <Group justify="space-between">
        <Group justify="start" align="center" gap="md">
          <Text size="xl" fw={600}>
            {t('delivery.deliveryId')}: {deliveryRequest.deliveryRequestNumber}
          </Text>
          {deliveryRequest.isUrgentDelivery && <UrgentBadge />}
          <DeliveryStatusBadge status={deliveryRequest.status} />
        </Group>
        <Button
          disabled={!canEdit}
          leftSection={<IconEdit size={16} />}
          variant="outline"
          onClick={onUpdate}
        >
          {t('common.edit')}
        </Button>
      </Group>

      {/* Main Content */}
      <Grid>
        <Grid.Col span={8}>
          <Stack gap="md">
            {/* Delivery Information */}
            <Card
              withBorder
              style={{
                backgroundColor: deliveryRequest.isUrgentDelivery
                  ? 'var(--mantine-color-red-0)'
                  : undefined,
                borderColor: deliveryRequest.isUrgentDelivery
                  ? 'var(--mantine-color-red-3)'
                  : undefined,
              }}
            >
              <Text fw={500} mb="md">
                {t('delivery.deliveryInfo')}
              </Text>
              <Grid>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <div>
                      <Text size="sm" c="dimmed">
                        {t('delivery.poNumber')}
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
                        {t('common.customer')}
                      </Text>
                      <Text size="sm" fw={500}>
                        {deliveryRequest.customerName}
                      </Text>
                    </div>
                    <div>
                      <Text size="sm" c="dimmed">
                        {t('delivery.assignedTo')}
                      </Text>
                      <Text size="sm" fw={500}>
                        {deliveryRequest.deliveryPerson}
                      </Text>
                    </div>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <div>
                      <Text size="sm" c="dimmed">
                        {t('delivery.scheduledDate')}
                      </Text>
                      <Text size="sm" fw={500}>
                        {formatDate(deliveryRequest.scheduledDate, t('common.notScheduled'))}
                      </Text>
                    </div>
                    {deliveryRequest.completedDate && (
                      <div>
                        <Text size="sm" c="dimmed">
                          {t('delivery.completedDate')}
                        </Text>
                        <Text size="sm" fw={500}>
                          {formatDate(deliveryRequest.completedDate)}
                        </Text>
                      </div>
                    )}
                    <div>
                      <Text size="sm" c="dimmed">
                        {t('delivery.status')}
                      </Text>
                      <DeliveryStatusBadge status={deliveryRequest.status} />
                    </div>
                  </Stack>
                </Grid.Col>
              </Grid>

              {deliveryRequest.notes && (
                <div>
                  <Text size="sm" c="dimmed" mt="md" mb="xs">
                    {t('common.notes')}
                  </Text>
                  <Text size="sm">{deliveryRequest.notes}</Text>
                </div>
              )}
            </Card>

            {/* Delivery Address */}
            <Card
              withBorder
              style={{
                backgroundColor: deliveryRequest.isUrgentDelivery
                  ? 'var(--mantine-color-red-0)'
                  : undefined,
                borderColor: deliveryRequest.isUrgentDelivery
                  ? 'var(--mantine-color-red-3)'
                  : undefined,
              }}
            >
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
          <Card
            withBorder
            style={{
              backgroundColor: deliveryRequest.isUrgentDelivery
                ? 'var(--mantine-color-red-0)'
                : undefined,
              borderColor: deliveryRequest.isUrgentDelivery
                ? 'var(--mantine-color-red-3)'
                : undefined,
            }}
          >
            <Text fw={500} mb="md">
              {t('delivery.photos')}
            </Text>
            <DeliveryPhotoGallery
              photos={deliveryRequest.photos}
              columns={6}
              imageHeight={120}
              canDelete={canDelete}
              onDeletePhoto={handleDeletePhoto}
            />
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
