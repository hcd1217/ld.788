import { Stack, Accordion, Group, Button, Text, Badge, Grid } from '@mantine/core';
import { IconTruck, IconCheck, IconPhoto, IconPackage, IconUser } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { DeliveryRequestDetail } from '@/services/sales/deliveryRequest';
import { formatDate } from '@/utils/time';
import { DELIVERY_STATUS_COLORS } from '@/constants/deliveryRequest';

type DeliveryDetailAccordionProps = {
  readonly deliveryRequest: DeliveryRequestDetail;
  readonly isLoading?: boolean;
  readonly onStartTransit: () => void;
  readonly onComplete: () => void;
  readonly onUploadPhotos: () => void;
};

export function DeliveryDetailAccordion({
  deliveryRequest,
  isLoading,
  onStartTransit,
  onComplete,
  onUploadPhotos,
}: DeliveryDetailAccordionProps) {
  const { t } = useTranslation();

  const canStartTransit = deliveryRequest.status === 'PENDING';
  const canComplete = deliveryRequest.status === 'IN_TRANSIT';
  const canUploadPhotos = deliveryRequest.status !== 'PENDING';

  return (
    <Stack gap="md">
      {/* Status and Actions */}
      <Group justify="center">
        <Badge color={DELIVERY_STATUS_COLORS[deliveryRequest.status]} size="lg">
          {t(`delivery.status.${deliveryRequest.status.toLowerCase()}` as any)}
        </Badge>
      </Group>

      {/* Action Buttons */}
      <Group justify="center">
        {canStartTransit && (
          <Button
            leftSection={<IconTruck size={16} />}
            color="orange"
            onClick={onStartTransit}
            disabled={isLoading}
            fullWidth
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
            fullWidth
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
            fullWidth
          >
            {t('delivery.actions.uploadPhotos')}
          </Button>
        )}
      </Group>

      {/* Details Accordion */}
      <Accordion defaultValue="delivery-info">
        {/* Delivery Information */}
        <Accordion.Item value="delivery-info">
          <Accordion.Control icon={<IconPackage size={20} />}>
            {t('delivery.detail.deliveryInfo')}
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              <Grid>
                <Grid.Col span={4}>
                  <Text size="xs" c="dimmed">
                    {t('delivery.fields.poNumber')}
                  </Text>
                </Grid.Col>
                <Grid.Col span={8}>
                  <Text size="sm" fw={500}>
                    {deliveryRequest.purchaseOrder?.poNumber}
                  </Text>
                </Grid.Col>
              </Grid>

              <Grid>
                <Grid.Col span={4}>
                  <Text size="xs" c="dimmed">
                    {t('delivery.fields.customer')}
                  </Text>
                </Grid.Col>
                <Grid.Col span={8}>
                  <Text size="sm" fw={500}>
                    {deliveryRequest.purchaseOrder?.customer?.name}
                  </Text>
                </Grid.Col>
              </Grid>

              <Grid>
                <Grid.Col span={4}>
                  <Text size="xs" c="dimmed">
                    {t('delivery.fields.scheduledDate')}
                  </Text>
                </Grid.Col>
                <Grid.Col span={8}>
                  <Text size="sm" fw={500}>
                    {deliveryRequest.scheduledDate
                      ? formatDate(deliveryRequest.scheduledDate)
                      : t('common.notScheduled')}
                  </Text>
                </Grid.Col>
              </Grid>

              {deliveryRequest.completedDate && (
                <Grid>
                  <Grid.Col span={4}>
                    <Text size="xs" c="dimmed">
                      {t('delivery.fields.completedDate')}
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={8}>
                    <Text size="sm" fw={500}>
                      {formatDate(deliveryRequest.completedDate)}
                    </Text>
                  </Grid.Col>
                </Grid>
              )}

              {deliveryRequest.notes && (
                <div>
                  <Text size="xs" c="dimmed" mb="xs">
                    {t('delivery.fields.notes')}
                  </Text>
                  <Text size="sm">{deliveryRequest.notes}</Text>
                </div>
              )}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Assignment Information */}
        <Accordion.Item value="assignment-info">
          <Accordion.Control icon={<IconUser size={20} />}>
            {t('delivery.detail.assignmentInfo')}
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              <Grid>
                <Grid.Col span={4}>
                  <Text size="xs" c="dimmed">
                    {t('delivery.fields.assignedTo')}
                  </Text>
                </Grid.Col>
                <Grid.Col span={8}>
                  <Text size="sm" fw={500}>
                    {deliveryRequest.assignedName || t('common.notAssigned')}
                  </Text>
                </Grid.Col>
              </Grid>

              {deliveryRequest.assignedType && (
                <Grid>
                  <Grid.Col span={4}>
                    <Text size="xs" c="dimmed">
                      {t('delivery.fields.assignedType')}
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={8}>
                    <Text size="sm" fw={500}>
                      {t(`delivery.assignmentTypes.${deliveryRequest.assignedType}`)}
                    </Text>
                  </Grid.Col>
                </Grid>
              )}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Photos */}
        <Accordion.Item value="photos">
          <Accordion.Control icon={<IconPhoto size={20} />}>
            {t('delivery.detail.photos')}
          </Accordion.Control>
          <Accordion.Panel>
            {deliveryRequest.photoUrls && deliveryRequest.photoUrls.length > 0 ? (
              <Stack gap="xs">
                {deliveryRequest.photoUrls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Delivery photo ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '200px',
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
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Stack>
  );
}
