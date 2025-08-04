import { Card, Stack, Group, Title, Button, Divider, Grid, Text, Badge } from '@mantine/core';
import { IconEdit, IconBuilding, IconMapPin, IconCalendar } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import { formatDate } from '@/utils/time';
import { formatCurrency } from '@/utils/number';
import { POStatusBadge } from './POStatusBadge';

type POBasicInfoCardProps = {
  readonly purchaseOrder: PurchaseOrder;
  readonly onEdit?: () => void;
};

export function POBasicInfoCard({ purchaseOrder, onEdit }: POBasicInfoCardProps) {
  const { t } = useTranslation();

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
                    <Text fw={500}>{purchaseOrder.customer?.name || '-'}</Text>
                    {purchaseOrder.customer?.companyName && (
                      <Text size="sm" c="dimmed">
                        {purchaseOrder.customer.companyName}
                      </Text>
                    )}
                  </div>
                </Group>
              </div>

              <div>
                <Text size="sm" fw={500} c="dimmed">
                  {t('po.totalAmount')}
                </Text>
                <Text size="xl" fw={700} c="blue">
                  {formatCurrency(purchaseOrder.totalAmount)}
                </Text>
              </div>

              <div>
                <Text size="sm" fw={500} c="dimmed">
                  {t('po.items')}
                </Text>
                <Badge variant="light" size="lg">
                  {purchaseOrder.items.length} {t('po.itemsCount')}
                </Badge>
              </div>

              {purchaseOrder.paymentTerms && (
                <div>
                  <Text size="sm" fw={500} c="dimmed">
                    {t('po.paymentTerms')}
                  </Text>
                  <Text>{purchaseOrder.paymentTerms}</Text>
                </div>
              )}
            </Stack>
          </Grid.Col>
        </Grid>

        {(purchaseOrder.shippingAddress || purchaseOrder.billingAddress) && (
          <>
            <Divider />
            <Grid>
              {purchaseOrder.shippingAddress && (
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <div>
                    <Text size="sm" fw={500} c="dimmed" mb="xs">
                      {t('po.shippingAddress')}
                    </Text>
                    <Group gap="xs" align="flex-start">
                      <IconMapPin size={16} color="var(--mantine-color-gray-6)" />
                      <div>
                        <Text size="sm">{purchaseOrder.shippingAddress.street}</Text>
                        <Text size="sm" c="dimmed">
                          {purchaseOrder.shippingAddress.city}
                          {purchaseOrder.shippingAddress.state &&
                            `, ${purchaseOrder.shippingAddress.state}`}
                          {purchaseOrder.shippingAddress.postalCode &&
                            ` ${purchaseOrder.shippingAddress.postalCode}`}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {purchaseOrder.shippingAddress.country}
                        </Text>
                      </div>
                    </Group>
                  </div>
                </Grid.Col>
              )}

              {purchaseOrder.billingAddress && (
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <div>
                    <Text size="sm" fw={500} c="dimmed" mb="xs">
                      {t('po.billingAddress')}
                    </Text>
                    <Group gap="xs" align="flex-start">
                      <IconMapPin size={16} color="var(--mantine-color-gray-6)" />
                      <div>
                        <Text size="sm">{purchaseOrder.billingAddress.street}</Text>
                        <Text size="sm" c="dimmed">
                          {purchaseOrder.billingAddress.city}
                          {purchaseOrder.billingAddress.state &&
                            `, ${purchaseOrder.billingAddress.state}`}
                          {purchaseOrder.billingAddress.postalCode &&
                            ` ${purchaseOrder.billingAddress.postalCode}`}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {purchaseOrder.billingAddress.country}
                        </Text>
                      </div>
                    </Group>
                  </div>
                </Grid.Col>
              )}
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
              <Text>{purchaseOrder.createdBy}</Text>
            </div>
          </Grid.Col>

          {purchaseOrder.processedBy && (
            <Grid.Col span={{ base: 12, md: 6 }}>
              <div>
                <Text size="sm" fw={500} c="dimmed">
                  {t('po.processedBy')}
                </Text>
                <Text>{purchaseOrder.processedBy}</Text>
              </div>
            </Grid.Col>
          )}
        </Grid>
      </Stack>
    </Card>
  );
}
