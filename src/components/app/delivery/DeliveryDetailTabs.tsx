import { useMemo, useState } from 'react';

import { useNavigate } from 'react-router';

import { Anchor, Button, Card, Grid, Group, ScrollArea, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconInfoCircle, IconMapPin, IconMessage, IconTrash } from '@tabler/icons-react';

import { ChatPanel, Tabs, UrgentBadge, ViewOnMap } from '@/components/common';
import { getPODetailRoute } from '@/config/routeConfig';
import { useTranslation } from '@/hooks/useTranslation';
import type { DeliveryRequest } from '@/services/sales';
import { usePermissions } from '@/stores/useAppStore';
import { useDeliveryRequestActions } from '@/stores/useDeliveryRequestStore';
import {
  canDeleteDeliveryRequest,
  canDeletePhotoDeliveryRequest,
  canEditDeliveryRequest,
} from '@/utils/permission.utils';
import { formatDate, formatDateTime } from '@/utils/time';

import { DeliveryPhotoGallery } from './DeliveryPhotoGallery';
import { DeliveryStatusBadge } from './DeliveryStatusBadge';
import { DeliveryTypeBadge } from './DeliveryTypeBadge';

type DeliveryDetailTabsProps = {
  readonly deliveryRequest: DeliveryRequest;
  readonly isLoading?: boolean;
  readonly onUpdate?: () => void;
  readonly onDelete?: () => void;
};

export function DeliveryDetailTabs({
  deliveryRequest,
  isLoading: _isLoading,
  onUpdate,
  onDelete,
}: DeliveryDetailTabsProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const permissions = usePermissions();
  const { deletePhoto } = useDeliveryRequestActions();
  const canEdit = useMemo(() => canEditDeliveryRequest(permissions), [permissions]);
  const canDeletePhoto = useMemo(() => canDeletePhotoDeliveryRequest(permissions), [permissions]);
  const canDeleteDelivery = useMemo(() => canDeleteDeliveryRequest(permissions), [permissions]);

  const [tabValue, setTabValue] = useState<'info' | 'communication'>('info');

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
    <Tabs
      defaultValue="info"
      value={tabValue}
      onChange={(value) => setTabValue(value as 'info' | 'communication')}
    >
      <ScrollArea offsetScrollbars scrollbarSize={4}>
        <Tabs.List>
          <Tabs.Tab value="info" leftSection={<IconInfoCircle size={16} />}>
            {t('delivery.deliveryInfo')}
          </Tabs.Tab>
          <Tabs.Tab value="communication" leftSection={<IconMessage size={16} />}>
            {t('po.communicationLog')}
          </Tabs.Tab>
        </Tabs.List>
      </ScrollArea>

      <Tabs.Panel value="info" pt="xl">
        <Stack gap="lg">
          {/* Header with Actions */}
          <Group justify="space-between">
            <Group justify="start" align="center" gap="md">
              <Text size="xl" fw={600}>
                {t('delivery.deliveryId')}: {deliveryRequest.deliveryRequestNumber}
              </Text>
              {deliveryRequest.isUrgentDelivery && <UrgentBadge />}
              <DeliveryTypeBadge type={deliveryRequest.type} />
            </Group>
            <Group gap="sm">
              <Button
                disabled={!canEdit}
                leftSection={<IconEdit size={16} />}
                variant="outline"
                onClick={onUpdate}
              >
                {t('common.edit')}
              </Button>
              {canDeleteDelivery && onDelete && (
                <Button
                  leftSection={<IconTrash size={16} />}
                  variant="outline"
                  color="red"
                  onClick={onDelete}
                >
                  {t('common.delete')}
                </Button>
              )}
            </Group>
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
                        {deliveryRequest.isDelivery ? (
                          <>
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
                          </>
                        ) : (
                          <>
                            <div>
                              <Text size="sm" c="dimmed">
                                {t('common.vendor')}
                              </Text>
                              <Text size="sm" fw={500}>
                                {deliveryRequest.vendorName}
                              </Text>
                            </div>
                          </>
                        )}
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
                              {formatDateTime(deliveryRequest.completedDate)}
                            </Text>
                          </div>
                        )}
                        <div>
                          <Text size="sm" c="dimmed">
                            {t('delivery.status')}
                          </Text>
                          <Group gap="xs">
                            <DeliveryStatusBadge status={deliveryRequest.status} />
                          </Group>
                        </div>
                      </Stack>
                    </Grid.Col>
                  </Grid>

                  <div>
                    <Text size="sm" c="dimmed" mt="md" mb="xs">
                      {t('common.notes')}
                    </Text>
                    <Text size="sm">{deliveryRequest.notes ?? '-'}</Text>
                  </div>
                </Card>

                {/* Delivery Address */}
                {deliveryRequest.isDelivery && (
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
                )}

                {/* Receiving Address */}
                {deliveryRequest.isReceive && (
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
                        <Text fw={500}>{t('po.receiveAddress')}</Text>
                      </Group>
                      <ViewOnMap googleMapsUrl={deliveryRequest.receiveAddress?.googleMapsUrl} />
                    </Group>
                    <Text size="sm">{deliveryRequest.receiveAddress?.oneLineAddress || '-'}</Text>
                  </Card>
                )}
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
                  canDelete={canDeletePhoto}
                  onDeletePhoto={handleDeletePhoto}
                />
              </Card>
            </Grid.Col>
          </Grid>
        </Stack>
      </Tabs.Panel>

      <Tabs.Panel value="communication" pt="xl">
        <ChatPanel targetId={deliveryRequest.id} type="DR" />
      </Tabs.Panel>
    </Tabs>
  );
}
