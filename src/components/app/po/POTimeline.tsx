import { Card, Stack, Timeline, Title } from '@mantine/core';

import { usePOTimelineItems } from '@/hooks/usePOTimelineItems';
import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';

import { POTimelineItem } from './POTimelineItem';

type POTimelineProps = {
  readonly purchaseOrder: PurchaseOrder;
};

export function POTimeline({ purchaseOrder }: POTimelineProps) {
  const { t } = useTranslation();
  const timelineItems = usePOTimelineItems(purchaseOrder);

  return (
    <Card shadow="sm" padding="xl" radius="md">
      <Stack gap="lg">
        <Title order={3}>{t('po.orderTimeline')}</Title>

        <Timeline
          active={timelineItems.findIndex((item) => item.active && item.current)}
          bulletSize={24}
          lineWidth={2}
        >
          {timelineItems.map((item, index) => (
            <POTimelineItem key={index} item={item} index={index} />
          ))}
        </Timeline>
      </Stack>
    </Card>
  );
}
