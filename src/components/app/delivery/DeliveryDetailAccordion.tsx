import { useMemo } from 'react';

import { useNavigate } from 'react-router';

import { Accordion, Anchor, Button, Grid, Group, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconCamera,
  IconCheck,
  IconEdit,
  IconMapPin,
  IconPackage,
  IconPhoto,
  IconTrash,
  IconTruck,
} from '@tabler/icons-react';

import { ContactInfo, UrgentBadge, ViewOnMap } from '@/components/common';
import { getPODetailRoute } from '@/config/routeConfig';
import { useTranslation } from '@/hooks/useTranslation';
import type { DeliveryRequest } from '@/services/sales';
import { useCustomers, usePermissions } from '@/stores/useAppStore';
import { useDeliveryRequestActions } from '@/stores/useDeliveryRequestStore';
import {
  canCompleteDeliveryRequest,
  canDeleteDeliveryRequest,
  canDeletePhotoDeliveryRequest,
  canEditDeliveryRequest,
  canStartTransitDeliveryRequest,
  canTakePhotoDeliveryRequest,
} from '@/utils/permission.utils';
import { formatDate, formatDateTime } from '@/utils/time';

import { DeliveryPhotoGallery } from './DeliveryPhotoGallery';
import { DeliveryStatusBadge } from './DeliveryStatusBadge';
import { DeliveryTypeBadge } from './DeliveryTypeBadge';

type DeliveryDetailAccordionProps = {
  readonly deliveryRequest: DeliveryRequest;
  readonly isLoading?: boolean;
  readonly onStartTransit: () => void;
  readonly onComplete: () => void;
  readonly onTakePhoto: () => void;
  readonly onUpdate: () => void;
  readonly onDelete?: () => void;
};

export function DeliveryDetailAccordion({
  deliveryRequest,
  isLoading,
  onStartTransit,
  onComplete,
  onTakePhoto,
  onUpdate,
  onDelete,
}: DeliveryDetailAccordionProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const permissions = usePermissions();
  const { deletePhoto } = useDeliveryRequestActions();
  const { canStartTransitBased, canCompleteBased, canTakePhotoBased } = useMemo(() => {
    const canStartTransitBased = deliveryRequest.status === 'PENDING';
    const canCompleteBased = deliveryRequest.status === 'IN_TRANSIT';
    const canTakePhotoBased = deliveryRequest.status !== 'PENDING';
    return {
      canStartTransitBased,
      canCompleteBased,
      canTakePhotoBased,
    };
  }, [deliveryRequest.status]);

  const { canEdit, canStartTransit, canComplete, canTakePhoto, canDeletePhoto, canDeleteDelivery } =
    useMemo(() => {
      return {
        canEdit: canEditDeliveryRequest(permissions),
        canStartTransit: canStartTransitDeliveryRequest(permissions),
        canComplete: canCompleteDeliveryRequest(permissions),
        canTakePhoto: canTakePhotoDeliveryRequest(permissions),
        canDeletePhoto: canDeletePhotoDeliveryRequest(permissions),
        canDeleteDelivery: canDeleteDeliveryRequest(permissions),
      };
    }, [permissions]);

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await deletePhoto(deliveryRequest.id, photoId);
      notifications.show({
        title: t('common.success'),
        message: t('common.photos.deleted'),
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

  // Delivery info fields for cleaner rendering
  const deliveryInfoFields = useMemo(
    () =>
      [
        {
          label: t('delivery.status'),
          value: (
            <Group gap="xs">
              {deliveryRequest.isUrgentDelivery && <UrgentBadge size="xs" />}
              <DeliveryTypeBadge type={deliveryRequest.type} size="xs" />
              <DeliveryStatusBadge status={deliveryRequest.status} />
            </Group>
          ),
        },
        {
          hidden: deliveryRequest.isReceive,
          label: t('delivery.poNumber'),
          value: (
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
          ),
        },
        {
          hidden: deliveryRequest.isReceive,
          label: t('common.customer'),
          value: deliveryRequest.customerName,
        },
        {
          hidden: deliveryRequest.isDelivery,
          label: t('common.vendor'),
          value: deliveryRequest.vendorName,
        },
        {
          hidden: deliveryRequest.isReceive,
          label: t('common.contact'),
          value: <DeliveryCustomerInfo customerId={deliveryRequest.customerId} />,
        },
        {
          label: t('delivery.scheduledDate'),
          value: formatDate(deliveryRequest.scheduledDate, t('common.notScheduled')),
        },
        ...(deliveryRequest.completedDate
          ? [
              {
                label: t('delivery.completedDate'),
                value: formatDateTime(deliveryRequest.completedDate),
              },
            ]
          : []),
        {
          label: t('common.notes'),
          value: deliveryRequest.notes || '-',
        },
        {
          label: t('delivery.assignedTo'),
          value: deliveryRequest.deliveryPerson,
        },
      ].filter((el) => !el.hidden),
    [t, deliveryRequest, navigate],
  );

  return (
    <Stack gap="md">
      {/* Details Accordion */}
      <Accordion
        defaultValue="delivery-info"
        styles={{
          item: {
            backgroundColor: deliveryRequest.isUrgentDelivery
              ? 'var(--mantine-color-red-0)'
              : undefined,
            borderColor: deliveryRequest.isUrgentDelivery
              ? 'var(--mantine-color-red-3)'
              : undefined,
          },
        }}
      >
        {/* Delivery Information */}
        <Accordion.Item value="delivery-info">
          <Accordion.Control icon={<IconPackage size={20} />}>
            {t('delivery.deliveryInfo')}
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
        {deliveryRequest.isDelivery && (
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
        )}

        {/* Receiving Address */}
        {deliveryRequest.isReceive && (
          <Accordion.Item value="address">
            <Accordion.Control icon={<IconMapPin size={20} />}>
              <Group justify="start" align="center" gap="sm">
                <Text size="sm">{t('po.receiveAddress')}</Text>
                <ViewOnMap googleMapsUrl={deliveryRequest.receiveAddress?.googleMapsUrl} />
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Group justify="space-between" align="flex-start">
                <Text size="sm">{deliveryRequest.receiveAddress?.oneLineAddress || '-'}</Text>
              </Group>
            </Accordion.Panel>
          </Accordion.Item>
        )}

        {/* Photos */}
        <Accordion.Item value="photos">
          <Accordion.Control icon={<IconPhoto size={20} />}>
            {t('delivery.photos')}
          </Accordion.Control>
          <Accordion.Panel>
            <DeliveryPhotoGallery
              photos={deliveryRequest.photos}
              withScrollArea
              scrollAreaHeight="50vh"
              canDelete={canDeletePhoto}
              onDeletePhoto={handleDeletePhoto}
            />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      {/* Action Buttons */}
      <Group justify="space-between" m="lg">
        <Group gap="sm">
          {canTakePhotoBased && canTakePhoto && (
            <Button
              leftSection={<IconCamera size={16} />}
              variant="outline"
              onClick={onTakePhoto}
              disabled={isLoading}
            >
              {t('common.photos.takePhoto')}
            </Button>
          )}
          {deliveryRequest.status === 'PENDING' && (
            <Button
              leftSection={<IconEdit size={16} />}
              variant="outline"
              onClick={onUpdate}
              disabled={isLoading || !canEdit}
            >
              {t('common.edit')}
            </Button>
          )}
          {canDeleteDelivery && onDelete && (
            <Button
              leftSection={<IconTrash size={16} />}
              variant="outline"
              color="red"
              onClick={onDelete}
              disabled={isLoading}
            >
              {t('common.delete')}
            </Button>
          )}
        </Group>
        <Group gap="sm">
          {canStartTransitBased && canStartTransit && (
            <Button
              leftSection={<IconTruck size={16} />}
              color="orange"
              onClick={onStartTransit}
              disabled={isLoading}
            >
              {t('delivery.actions.startTransit')}
            </Button>
          )}
          {canCompleteBased && canComplete && (
            <Button
              leftSection={<IconCheck size={16} />}
              color="green"
              onClick={onComplete}
              disabled={isLoading}
            >
              {t('delivery.actions.complete')}
            </Button>
          )}
        </Group>
      </Group>
    </Stack>
  );
}

function DeliveryCustomerInfo({ customerId }: { customerId: string | undefined }) {
  const customers = useCustomers();
  const customer = useMemo(() => {
    if (!customerId) {
      return undefined;
    }
    return customers.find((c) => c.id === customerId);
  }, [customers, customerId]);

  return customer ? (
    <ContactInfo
      horizontal
      email={customer.email}
      phoneNumber={customer.phone}
      pic={customer.pic}
      blank={'-'}
    />
  ) : (
    '-'
  );
}
