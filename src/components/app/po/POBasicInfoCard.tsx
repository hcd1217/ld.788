import {
  Card,
  Stack,
  Group,
  Title,
  Button,
  Divider,
  Grid,
  Text,
  Badge,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { IconEdit, IconBuilding, IconMapPin, IconCalendar } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import { formatDate } from '@/utils/time';
import { POStatusBadge } from './POStatusBadge';
import { useCustomerMapByCustomerId, useEmployeeMapByUserId } from '@/stores/useAppStore';
import { getEmployeeNameByUserId, getCustomerNameByCustomerId } from '@/utils/overview';

type POBasicInfoCardProps = {
  readonly purchaseOrder: PurchaseOrder;
  readonly onEdit?: () => void;
};

export function POBasicInfoCard({ purchaseOrder, onEdit }: POBasicInfoCardProps) {
  const { t } = useTranslation();
  const employeeMapByUserId = useEmployeeMapByUserId();
  const customerMapByCustomerId = useCustomerMapByCustomerId();
  const canEdit = purchaseOrder.status === 'NEW';

  return (
    <Card shadow="sm" padding="xl" radius="md">
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start">
          <Title order={3}>{t('po.orderInformation')}</Title>
          {canEdit && onEdit && (
            <Button variant="light" leftSection={<IconEdit size={16} />} onClick={onEdit}>
              {t('common.edit')}
            </Button>
          )}
        </Group>

        <Divider />

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
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
                <POStatusBadge status={purchaseOrder.status} size="md" />
              </div>

              <div>
                <Text size="sm" fw={500} c="dimmed">
                  {t('po.orderDate')}
                </Text>
                <Group gap="xs">
                  <IconCalendar size={16} color="var(--mantine-color-gray-6)" />
                  <Text>{formatDate(purchaseOrder.orderDate)}</Text>
                </Group>
              </div>

              {purchaseOrder.deliveryDate && (
                <div>
                  <Text size="sm" fw={500} c="dimmed">
                    {t('po.deliveryDate')}
                  </Text>
                  <Group gap="xs">
                    <IconCalendar size={16} color="var(--mantine-color-gray-6)" />
                    <Text>{formatDate(purchaseOrder.deliveryDate)}</Text>
                  </Group>
                </div>
              )}

              {purchaseOrder.completedDate && (
                <div>
                  <Text size="sm" fw={500} c="dimmed">
                    {t('po.completedDate')}
                  </Text>
                  <Group gap="xs">
                    <IconCalendar size={16} color="var(--mantine-color-gray-6)" />
                    <Text>{formatDate(purchaseOrder.completedDate)}</Text>
                  </Group>
                </div>
              )}
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
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
                <Badge variant="light" size="lg">
                  {purchaseOrder.items.length} {t('po.itemsCount')}
                </Badge>
              </div>
            </Stack>
          </Grid.Col>
        </Grid>

        {purchaseOrder.address && (
          <>
            <Divider />
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
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
            </Grid>
          </>
        )}

        {purchaseOrder.notes && (
          <>
            <Divider />
            <div>
              <Text size="sm" fw={500} c="dimmed" mb="xs">
                {t('po.notes')}
              </Text>
              <Text size="sm">{purchaseOrder.notes}</Text>
            </div>
          </>
        )}

        <Divider />

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <div>
              <Text size="sm" fw={500} c="dimmed">
                {t('po.createdBy')}
              </Text>
              <Text>{getEmployeeNameByUserId(employeeMapByUserId, purchaseOrder.createdBy)}</Text>
            </div>
          </Grid.Col>

          {purchaseOrder.processedBy && (
            <Grid.Col span={{ base: 12, md: 6 }}>
              <div>
                <Text size="sm" fw={500} c="dimmed">
                  {t('po.processedBy')}
                </Text>
                <Text>
                  {getEmployeeNameByUserId(employeeMapByUserId, purchaseOrder.processedBy)}
                </Text>
              </div>
            </Grid.Col>
          )}
        </Grid>
      </Stack>
    </Card>
  );
}
