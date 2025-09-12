import { Card, Divider, Grid, Group, Skeleton, Stack, Title } from '@mantine/core';

import { useTranslation } from '@/hooks/useTranslation';

export function POBasicInfoCardSkeleton() {
  const { t } = useTranslation();

  return (
    <Card shadow="sm" padding="xl" radius="md">
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start">
          <Title order={3}>{t('po.orderInformation')}</Title>
          <Skeleton height={36} width={100} radius="sm" />
        </Group>

        <Divider />

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="md">
              {/* PO Number */}
              <div>
                <Skeleton height={16} width={80} mb={4} />
                <Skeleton height={24} width={150} />
              </div>

              {/* Status */}
              <div>
                <Skeleton height={16} width={60} mb={4} />
                <Skeleton height={28} width={100} radius="xl" />
              </div>

              {/* Order Date */}
              <div>
                <Skeleton height={16} width={80} mb={4} />
                <Skeleton height={20} width={120} />
              </div>

              {/* Delivery Date */}
              <div>
                <Skeleton height={16} width={100} mb={4} />
                <Skeleton height={20} width={120} />
              </div>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="md">
              {/* Customer */}
              <div>
                <Skeleton height={16} width={70} mb={4} />
                <Stack gap={4}>
                  <Skeleton height={20} width={180} />
                  <Skeleton height={16} width={150} />
                </Stack>
              </div>

              {/* Total Amount */}
              <div>
                <Skeleton height={16} width={90} mb={4} />
                <Skeleton height={32} width={120} />
              </div>

              {/* Items */}
              <div>
                <Skeleton height={16} width={50} mb={4} />
                <Skeleton height={28} width={80} radius="xl" />
              </div>

              {/* Payment Terms */}
              <div>
                <Skeleton height={16} width={100} mb={4} />
                <Skeleton height={20} width={140} />
              </div>
            </Stack>
          </Grid.Col>
        </Grid>

        <Divider />

        {/* Addresses */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <div>
              <Skeleton height={16} width={120} mb={8} />
              <Stack gap={4}>
                <Skeleton height={16} width={200} />
                <Skeleton height={16} width={180} />
                <Skeleton height={16} width={100} />
              </Stack>
            </div>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <div>
              <Skeleton height={16} width={100} mb={8} />
              <Stack gap={4}>
                <Skeleton height={16} width={200} />
                <Skeleton height={16} width={180} />
                <Skeleton height={16} width={100} />
              </Stack>
            </div>
          </Grid.Col>
        </Grid>

        <Divider />

        {/* Created By / Processed By */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <div>
              <Skeleton height={16} width={80} mb={4} />
              <Skeleton height={20} width={120} />
            </div>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <div>
              <Skeleton height={16} width={100} mb={4} />
              <Skeleton height={20} width={120} />
            </div>
          </Grid.Col>
        </Grid>
      </Stack>
    </Card>
  );
}
