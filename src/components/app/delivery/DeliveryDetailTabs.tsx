import { Stack, Group, Button, Card, Text, Grid, Badge } from '@mantine/core';
import { IconTruck, IconCheck, IconPhoto } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { DeliveryRequestDetail } from '@/services/sales/deliveryRequest';
import { formatDate } from '@/utils/time';
import { DELIVERY_STATUS_COLORS } from '@/constants/deliveryRequest';

type DeliveryDetailTabsProps = {
  readonly deliveryRequest: DeliveryRequestDetail;
  readonly isLoading?: boolean;
  readonly onStartTransit: () => void;
  readonly onComplete: () => void;
  readonly onUploadPhotos: () => void;
};

export function DeliveryDetailTabs({
  deliveryRequest,
  isLoading,
  onStartTransit,
  onComplete,
  onUploadPhotos,
}: DeliveryDetailTabsProps) {
  const { t } = useTranslation();

  const canStartTransit = deliveryRequest.status === 'PENDING';
  const canComplete = deliveryRequest.status === 'IN_TRANSIT';
  const canUploadPhotos = deliveryRequest.status !== 'PENDING';

  return (
    <Stack gap="lg">
      {/* Header with Actions */}
      <Group justify="space-between">
        <div>
          <Text size="xl" fw={600}>
            {t('delivery.deliveryId')}: DR-{deliveryRequest.id.slice(-6)}
          </Text>
          <Group gap="xs" mt="xs">
            <Badge color={DELIVERY_STATUS_COLORS[deliveryRequest.status]} size="sm">
              {t(`delivery.status.${deliveryRequest.status.toLowerCase()}` as any)}
            </Badge>
          </Group>
        </div>

        <Group gap="sm">
          {canStartTransit && (
            <Button
              leftSection={<IconTruck size={16} />}
              color="orange"
              onClick={onStartTransit}
              disabled={isLoading}
            >
              {t('delivery.actions.startTransit')}
            </Button>
          )}

          {canComplete && (
            <Button
              leftSection={<IconCheck size={16} />}
              color="green"
              onClick={onComplete}
              disabled={isLoading}
            >
              {t('delivery.actions.complete')}
            </Button>
          )}

          {canUploadPhotos && (
            <Button
              leftSection={<IconPhoto size={16} />}
              variant="outline"
              onClick={onUploadPhotos}
              disabled={isLoading}
            >
              {t('delivery.actions.uploadPhotos')}
            </Button>
          )}
        </Group>
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
                        {deliveryRequest.purchaseOrder?.poNumber}
                      </Text>
                    </div>
                    <div>
                      <Text size="sm" c="dimmed">
                        {t('delivery.fields.customer')}
                      </Text>
                      <Text size="sm" fw={500}>
                        {deliveryRequest.purchaseOrder?.customer?.name}
                      </Text>
                    </div>
                    <div>
                      <Text size="sm" c="dimmed">
                        {t('delivery.fields.assignedTo')}
                      </Text>
                      <Text size="sm" fw={500}>
                        {deliveryRequest.assignedName || t('common.notAssigned')}
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
                      <Badge color={DELIVERY_STATUS_COLORS[deliveryRequest.status]} size="sm">
                        {t(`delivery.status.${deliveryRequest.status.toLowerCase()}` as any)}
                      </Badge>
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
          </Stack>
        </Grid.Col>

        <Grid.Col span={4}>
          {/* Photos Section */}
          <Card withBorder>
            <Text fw={500} mb="md">
              {t('delivery.detail.photos')}
            </Text>
            {deliveryRequest.photoUrls && deliveryRequest.photoUrls.length > 0 ? (
              <Stack gap="xs">
                {deliveryRequest.photoUrls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Delivery photo ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '120px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                    }}
                  />
                ))}
              </Stack>
            ) : (
              <Text size="sm" c="dimmed" ta="center" py="xl">
                {t('delivery.detail.noPhotos')}
              </Text>
            )}
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
