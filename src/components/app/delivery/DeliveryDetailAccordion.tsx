import { Stack, Accordion, Group, Button, Text, Grid } from '@mantine/core';
import { IconTruck, IconCheck, IconPhoto, IconPackage, IconMapPin } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { DeliveryRequestDetail } from '@/services/sales/deliveryRequest';
import { formatDate } from '@/utils/time';
import { useMemo } from 'react';
import { useEmployeeMapByEmployeeId, useEmployeeMapByUserId } from '@/stores/useAppStore';
import { getEmployeeNameByEmployeeId, getEmployeeNameByUserId } from '@/utils/overview';
import { DeliveryStatusBadge } from './DeliveryStatusBadge';
import { DeliveryPhotoGallery } from './DeliveryPhotoGallery';
import { ViewOnMap } from '@/components/common';

type DeliveryDetailAccordionProps = {
  readonly deliveryRequest: DeliveryRequestDetail;
  readonly isLoading?: boolean;
  readonly onStartTransit: () => void;
  readonly onComplete: () => void;
  readonly onTakePhoto: () => void;
};

export function DeliveryDetailAccordion({
  deliveryRequest,
  isLoading,
  onStartTransit,
  onComplete,
  onTakePhoto,
}: DeliveryDetailAccordionProps) {
  const { t } = useTranslation();
  const employeeMapByEmployeeId = useEmployeeMapByEmployeeId();
  const employeeMapByUserId = useEmployeeMapByUserId();
  const { canStartTransit, canComplete, canTakePhoto } = useMemo(() => {
    const canStartTransit = deliveryRequest.status === 'PENDING';
    const canComplete = deliveryRequest.status === 'IN_TRANSIT';
    const canTakePhoto = deliveryRequest.status !== 'PENDING';
    return {
      canStartTransit,
      canComplete,
      canTakePhoto,
    };
  }, [deliveryRequest.status]);

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

  // Delivery info fields for cleaner rendering
  const deliveryInfoFields = useMemo(
    () => [
      {
        label: t('delivery.fields.status'),
        value: <DeliveryStatusBadge status={deliveryRequest.status} />,
      },
      {
        label: t('delivery.fields.poNumber'),
        value: deliveryRequest.purchaseOrder?.poNumber,
      },
      {
        label: t('delivery.fields.customer'),
        value: deliveryRequest.purchaseOrder?.customer?.name,
      },
      {
        label: t('delivery.fields.scheduledDate'),
        value: deliveryRequest.scheduledDate
          ? formatDate(deliveryRequest.scheduledDate)
          : t('common.notScheduled'),
      },
      ...(deliveryRequest.completedDate
        ? [
            {
              label: t('delivery.fields.completedDate'),
              value: formatDate(deliveryRequest.completedDate),
            },
          ]
        : []),
      {
        label: t('delivery.fields.notes'),
        value: deliveryRequest.notes || '-',
      },
      {
        label: t('delivery.fields.assignedTo'),
        value: assignedName,
      },
    ],
    [t, deliveryRequest, assignedName],
  );

  return (
    <Stack gap="md">
      {/* Details Accordion */}
      <Accordion defaultValue="delivery-info">
        {/* Delivery Information */}
        <Accordion.Item value="delivery-info">
          <Accordion.Control icon={<IconPackage size={20} />}>
            {t('delivery.detail.deliveryInfo')}
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              {deliveryInfoFields.map((field, index) => (
                <Grid key={index}>
                  <Grid.Col span={4}>
                    <Text size="xs" c="dimmed">
                      {field.label}
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={8}>
                    {typeof field.value === 'string' || !field.value ? (
                      <Text size="sm" fw={500}>
                        {field.value}
                      </Text>
                    ) : (
                      field.value
                    )}
                  </Grid.Col>
                </Grid>
              ))}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Delivery Address */}
        <Accordion.Item value="address">
          <Accordion.Control icon={<IconMapPin size={20} />}>
            <Group justify="start" align="center" gap="sm">
              <Text size="sm">{t('po.shippingAddress')}</Text>
              <ViewOnMap googleMapsUrl={deliveryRequest.deliveryAddress?.googleMapsUrl} />
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <Group justify="space-between" align="flex-start">
              <Text size="sm">{deliveryRequest.deliveryAddress?.oneLineAddress || '-'}</Text>
            </Group>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Photos */}
        <Accordion.Item value="photos">
          <Accordion.Control icon={<IconPhoto size={20} />}>
            {t('delivery.detail.photos')}
          </Accordion.Control>
          <Accordion.Panel>
            <DeliveryPhotoGallery
              photoUrls={deliveryRequest.photoUrls}
              withScrollArea
              scrollAreaHeight="50vh"
            />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      {/* Action Buttons */}
      <Group justify="space-between" m="lg">
        {canTakePhoto ? (
          <Button
            leftSection={<IconPhoto size={16} />}
            variant="outline"
            onClick={onTakePhoto}
            disabled={isLoading}
          >
            {t('delivery.actions.takePhoto')}
          </Button>
        ) : (
          <div> </div>
        )}
        {canStartTransit && (
          <Button
            leftSection={<IconTruck size={16} />}
            color="orange"
            onClick={onStartTransit}
            disabled={isLoading}
            w="50%"
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
            w="50%"
          >
            {t('delivery.actions.complete')}
          </Button>
        )}
      </Group>
    </Stack>
  );
}
