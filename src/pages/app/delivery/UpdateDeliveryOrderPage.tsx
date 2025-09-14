import { useCallback, useEffect, useState } from 'react';

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Text,
} from '@mantine/core';
import { IconArrowDown, IconArrowUp, IconCalendar } from '@tabler/icons-react';

import { DeliveryErrorBoundary } from '@/components/app/delivery';
import {
  AppDesktopLayout,
  AppPageTitle,
  DateInput,
  PermissionDeniedPage,
} from '@/components/common';
import { ROUTERS } from '@/config/routeConfig';
import { useSWRAction } from '@/hooks/useSWRAction';
import { useTranslation } from '@/hooks/useTranslation';
import { type DeliveryRequest } from '@/services/sales/deliveryRequest';
import { usePermissions } from '@/stores/useAppStore';
import {
  useDeliveryAssigneeOptions,
  useDeliveryRequestActions,
  useDeliveryRequestError,
  useDeliveryRequestLoading,
} from '@/stores/useDeliveryRequestStore';
import { xOr } from '@/utils/boolean';
import { logError } from '@/utils/logger';
import { showErrorNotification } from '@/utils/notifications';

export function UpdateDeliveryOrderPage() {
  const { t } = useTranslation();
  const permissions = usePermissions();
  const assigneeOptions = useDeliveryAssigneeOptions();
  const isLoading = useDeliveryRequestLoading();
  const error = useDeliveryRequestError();
  const { loadDeliveryRequestsForDate, clearError, updateDeliveryOrderInDay } =
    useDeliveryRequestActions();

  // Local UI state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedAssignee, setSelectedAssignee] = useState<string | undefined>(undefined);
  const [deliveryRequests, setDeliveryRequests] = useState<DeliveryRequest[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Load delivery requests for selected date
  const loadDeliveryRequests = useCallback(async () => {
    if (!selectedAssignee || !selectedDate) return;

    try {
      const requests = await loadDeliveryRequestsForDate(selectedAssignee, selectedDate);
      setDeliveryRequests(requests);
      setHasChanges(false);
    } catch (error_) {
      logError('Failed to load delivery requests:', error_, {
        module: 'UpdateDeliveryOrderPage',
        action: 'loadDeliveryRequests',
      });
    }
  }, [selectedAssignee, selectedDate, loadDeliveryRequestsForDate]);

  // Handle move up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const a = deliveryRequests[index];
    const b = deliveryRequests[index - 1];
    if (xOr(a.isUrgentDelivery, b.isUrgentDelivery)) {
      showErrorNotification(
        t('common.errors.notificationTitle'),
        t('common.doNotHavePermissionForAction'),
      );
      return;
    }

    const items = [...deliveryRequests];
    const temp = items[index];
    items[index] = items[index - 1];
    items[index - 1] = temp;

    setDeliveryRequests(items);
    setHasChanges(true);
  };

  // Handle move down
  const handleMoveDown = (index: number) => {
    if (index >= deliveryRequests.length - 1) return;
    const a = deliveryRequests[index];
    const b = deliveryRequests[index + 1];
    if (xOr(a.isUrgentDelivery, b.isUrgentDelivery)) {
      showErrorNotification(
        t('common.errors.notificationTitle'),
        t('common.doNotHavePermissionForAction'),
      );
      return;
    }

    const items = [...deliveryRequests];
    const temp = items[index];
    items[index] = items[index + 1];
    items[index + 1] = temp;

    setDeliveryRequests(items);
    setHasChanges(true);
  };

  // Save the new order
  const saveDeliveryOrder = useSWRAction(
    'save-delivery-order',
    async () => {
      if (!selectedDate || !hasChanges || !selectedAssignee) return;
      if (!permissions.deliveryRequest.actions?.canUpdateDeliveryOrderInDay) {
        throw new Error(t('common.failed'));
      }
      await updateDeliveryOrderInDay(
        selectedAssignee,
        selectedDate,
        deliveryRequests.map((dr) => dr.id),
      );
    },
    {
      notifications: {
        successTitle: t('common.success'),
        successMessage: t('common.success'),
      },
    },
  );

  // Load data when date or assignee changes
  useEffect(() => {
    if (selectedDate && selectedAssignee) {
      void loadDeliveryRequests();
    }
  }, [loadDeliveryRequests, selectedDate, selectedAssignee]);

  if (!permissions.deliveryRequest.actions?.canUpdateDeliveryOrderInDay) {
    return <PermissionDeniedPage />;
  }

  return (
    <AppDesktopLayout isLoading={isLoading} error={error} clearError={clearError}>
      <DeliveryErrorBoundary componentName="UpdateDeliveryOrderPage">
        <AppPageTitle
          withGoBack
          route={ROUTERS.DELIVERY_MANAGEMENT}
          title={t('delivery.arrangeDeliveryOrder')}
        />

        <Paper p="md" shadow="xs">
          <Group justify="space-between" mb="md">
            <Group>
              <DateInput
                value={selectedDate}
                onChange={(value) => setSelectedDate(value ? new Date(value) : undefined)}
                label={t('delivery.scheduledDate')}
                placeholder=""
                leftSection={<IconCalendar size={16} />}
                clearable={false}
                style={{ width: 200 }}
              />

              <Select
                value={selectedAssignee}
                onChange={(value) => setSelectedAssignee(value ?? undefined)}
                label={t('delivery.assignedTo')}
                placeholder=""
                data={assigneeOptions}
                clearable
                style={{ width: 200 }}
              />
            </Group>

            <Button
              onClick={saveDeliveryOrder.trigger}
              disabled={!hasChanges || isLoading}
              loading={isLoading}
            >
              {t('common.save')}
            </Button>
          </Group>

          {isLoading ? (
            <Center h={200}>
              <Loader />
            </Center>
          ) : deliveryRequests.length === 0 ? (
            <Center h={200}>
              <Text c="dimmed">
                {!selectedDate || !selectedAssignee
                  ? t('delivery.pleaseSelectAssigneeAndScheduledDate')
                  : t('delivery.noDeliveryRequestsFound')}
              </Text>
            </Center>
          ) : (
            <Stack gap="xs">
              {deliveryRequests.map((deliveryRequest, index) => (
                <Card key={deliveryRequest.id} shadow="xs" p="sm">
                  <Group wrap="nowrap">
                    <Stack gap={0}>
                      <ActionIcon
                        variant="subtle"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        size="sm"
                      >
                        <IconArrowUp size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === deliveryRequests.length - 1}
                        size="sm"
                      >
                        <IconArrowDown size={16} />
                      </ActionIcon>
                    </Stack>

                    <Stack gap={4} style={{ flex: 1 }}>
                      <Group justify="space-between">
                        <Group gap="xs">
                          <Text fw={600} size="sm">
                            #{index + 1}
                          </Text>
                          <Text fw={500}>{deliveryRequest.deliveryRequestNumber}</Text>
                          {deliveryRequest.isUrgentDelivery && (
                            <Badge color="red" size="sm">
                              {t('common.urgent')}
                            </Badge>
                          )}
                        </Group>
                        <Badge color="blue" variant="light">
                          {deliveryRequest.status}
                        </Badge>
                      </Group>

                      {deliveryRequest.customerName && (
                        <Text size="sm" c="dimmed">
                          {t('delivery.customerName')}: {deliveryRequest.customerName}
                        </Text>
                      )}

                      {deliveryRequest.purchaseOrderNumber && (
                        <Text size="sm" c="dimmed">
                          {t('po.poNumber')}: {deliveryRequest.purchaseOrderNumber}
                        </Text>
                      )}

                      {deliveryRequest.deliveryAddress?.oneLineAddress && (
                        <Text size="sm" c="dimmed" lineClamp={1}>
                          {deliveryRequest.deliveryAddress.oneLineAddress}
                        </Text>
                      )}
                    </Stack>
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
        </Paper>
      </DeliveryErrorBoundary>
    </AppDesktopLayout>
  );
}
