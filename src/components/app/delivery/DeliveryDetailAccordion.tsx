import { Stack, Accordion, Group, Button, Text, Grid, Anchor } from '@mantine/core';
import {
  IconTruck,
  IconCheck,
  IconPhoto,
  IconPackage,
  IconMapPin,
  IconEdit,
} from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { DeliveryRequest } from '@/services/sales/deliveryRequest';
import { formatDate } from '@/utils/time';
import { useMemo } from 'react';
import {
  useCustomers,
  useEmployeeMapByEmployeeId,
  useEmployeeMapByUserId,
} from '@/stores/useAppStore';
import { getEmployeeNameByEmployeeId, getEmployeeNameByUserId } from '@/utils/overview';
import { DeliveryStatusBadge } from './DeliveryStatusBadge';
import { DeliveryPhotoGallery } from './DeliveryPhotoGallery';
import { ViewOnMap, ContactInfo, UrgentBadge } from '@/components/common';
import { getPODetailRoute } from '@/config/routeConfig';
import { useNavigate } from 'react-router';

type DeliveryDetailAccordionProps = {
  readonly deliveryRequest: DeliveryRequest;
  readonly isLoading?: boolean;
  readonly canEdit?: boolean;
  readonly canStartTransit?: boolean;
  readonly canComplete?: boolean;
  readonly canTakePhoto?: boolean;
  readonly onStartTransit: () => void;
  readonly onComplete: () => void;
  readonly onTakePhoto: () => void;
  readonly onUpdate: () => void;
};

export function DeliveryDetailAccordion({
  deliveryRequest,
  isLoading,
  canEdit = false,
  canStartTransit = false,
  canComplete = false,
  canTakePhoto = false,
  onStartTransit,
  onComplete,
  onTakePhoto,
  onUpdate,
}: DeliveryDetailAccordionProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const employeeMapByEmployeeId = useEmployeeMapByEmployeeId();
  const employeeMapByUserId = useEmployeeMapByUserId();
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
        label: t('delivery.status'),
        value: (
          <Group gap="xs">
            {deliveryRequest.isUrgentDelivery && <UrgentBadge size="xs" />}
            <DeliveryStatusBadge status={deliveryRequest.status} />
          </Group>
        ),
      },
      {
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
        label: t('delivery.customer'),
        value: deliveryRequest.customerName,
      },
      {
        label: t('common.contact'),
        value: <DeliveryCustomerInfo customerId={deliveryRequest.customerId} />,
      },
      {
        label: t('delivery.scheduledDate'),
        value: deliveryRequest.scheduledDate
          ? formatDate(deliveryRequest.scheduledDate)
          : t('common.notScheduled'),
      },
      ...(deliveryRequest.completedDate
        ? [
            {
              label: t('delivery.completedDate'),
              value: formatDate(deliveryRequest.completedDate),
            },
          ]
        : []),
      {
        label: t('delivery.notes'),
        value: deliveryRequest.notes || '-',
      },
      {
        label: t('delivery.assignedTo'),
        value: assignedName,
      },
    ],
    [t, deliveryRequest, assignedName, navigate],
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
        <Group gap="sm">
          {canTakePhotoBased && canTakePhoto && (
            <Button
              leftSection={<IconPhoto size={16} />}
              variant="outline"
              onClick={onTakePhoto}
              disabled={isLoading}
            >
              {t('common.photos.takePhoto')}
            </Button>
          )}
          <Button
            leftSection={<IconEdit size={16} />}
            variant="outline"
            onClick={onUpdate}
            disabled={isLoading || !canEdit}
          >
            {t('common.edit')}
          </Button>
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
