import { useMemo } from 'react';

import { Card, Divider, Grid, Group, SimpleGrid, Stack, Text } from '@mantine/core';

import { ViewOnMap } from '@/components/common';
import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import {
  getCancelReason,
  getDeliveryNotes,
  getRefundReason,
  getShippingInfo,
} from '@/utils/purchaseOrder';

import { POAttachmentsSection } from './POAttachmentsSection';
import { PODatesSection } from './PODatesSection';
import { PODeliverySection } from './PODeliverySection';
import { POInfoSection } from './POInfoSection';
import { POStatusHistorySection } from './POStatusHistorySection';

type POBasicInfoCardProps = {
  readonly purchaseOrder: PurchaseOrder;
  readonly onNavigateToItemsList?: () => void;
};

export function POBasicInfoCard({ purchaseOrder, onNavigateToItemsList }: POBasicInfoCardProps) {
  const { t } = useTranslation();
  const notes = useMemo(() => {
    return {
      cancelReason: getCancelReason(purchaseOrder.statusHistory),
      deliveryNotes: getDeliveryNotes(purchaseOrder.statusHistory),
      refundReason: getRefundReason(purchaseOrder.statusHistory),
      shippingInfo: getShippingInfo(purchaseOrder.statusHistory),
    };
  }, [purchaseOrder.statusHistory]);

  return (
    <Card shadow="sm" padding="xl" radius="md">
      <Stack gap="lg">
        <POInfoSection
          purchaseOrder={purchaseOrder}
          onNavigateToItemsList={onNavigateToItemsList}
        />
        <Divider />
        <PODatesSection purchaseOrder={purchaseOrder} />
        <Divider />
        <POAttachmentsSection attachments={purchaseOrder.attachments} />
        {purchaseOrder.attachments && purchaseOrder.attachments.length > 0 && <Divider />}
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <div>
              <Group justify="start" align="center" mb="xs">
                <Text size="sm" fw={500} c="dimmed">
                  {t('po.shippingAddress')}
                </Text>
                <ViewOnMap googleMapsUrl={purchaseOrder.googleMapsUrl} />
              </Group>
              <Text size="sm">{purchaseOrder.address}</Text>
            </div>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <div>
              <Text size="sm" fw={500} c="dimmed" mb="xs">
                {t('common.notes')}
              </Text>
              <Text size="sm">{purchaseOrder.notes}</Text>
            </div>
          </Grid.Col>
        </Grid>
        <Divider />
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <PODeliverySection purchaseOrder={purchaseOrder} />

          {notes.shippingInfo && (
            <div>
              <Text size="sm" fw={500} c="cyan" mb="xs">
                {t('po.shippingInfo')}
              </Text>
              {notes.shippingInfo.trackingNumber && (
                <Text size="sm">
                  {t('po.trackingNumber')}: {notes.shippingInfo.trackingNumber}
                </Text>
              )}
              {notes.shippingInfo.carrier && (
                <Text size="sm">
                  {t('po.carrier')}: {notes.shippingInfo.carrier}
                </Text>
              )}
            </div>
          )}

          {notes.deliveryNotes && (
            <div>
              <Text size="sm" fw={500} c="blue" mb="xs">
                {t('po.deliveryNotes')}
              </Text>
              <Text size="sm">{notes.deliveryNotes}</Text>
            </div>
          )}

          {notes.cancelReason && (
            <div>
              <Text size="sm" fw={500} c="red" mb="xs">
                {t('po.cancelReason')}
              </Text>
              <Text size="sm">{notes.cancelReason}</Text>
            </div>
          )}

          {notes.refundReason && (
            <div>
              <Text size="sm" fw={500} c="orange" mb="xs">
                {t('po.refundReason')}
              </Text>
              <Text size="sm">{notes.refundReason}</Text>
            </div>
          )}
        </SimpleGrid>
        <POStatusHistorySection purchaseOrder={purchaseOrder} />
      </Stack>
    </Card>
  );
}
