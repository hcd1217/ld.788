import { Card, Stack, Title, Timeline, Text, Group, Badge } from '@mantine/core';
import {
  IconFileInvoice,
  IconCheck,
  IconPackage,
  IconTruck,
  IconPackageExport,
  IconX,
  IconReceipt,
} from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder, POStatus } from '@/services/sales/purchaseOrder';
import { formatDate } from '@/utils/time';
import { PO_STATUS_COLORS } from '@/constants/purchaseOrder';

type POTimelineProps = {
  readonly purchaseOrder: PurchaseOrder;
};

const statusIcons = {
  NEW: IconFileInvoice,
  CONFIRMED: IconCheck,
  PROCESSING: IconPackage,
  SHIPPED: IconTruck,
  DELIVERED: IconPackageExport,
  CANCELLED: IconX,
  REFUNDED: IconReceipt,
};

const statusOrder: POStatus[] = ['NEW', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

export function POTimeline({ purchaseOrder }: POTimelineProps) {
  const { t } = useTranslation();

  const getTimelineItems = () => {
    const items = [];
    const currentStatusIndex = statusOrder.indexOf(purchaseOrder.status);

    // Always show creation
    const IconComponent = statusIcons.NEW;
    items.push({
      title: t('po.status.NEW'),
      description: `${t('po.createdBy')}: ${purchaseOrder.createdBy}`,
      date: purchaseOrder.orderDate,
      icon: <IconComponent size={16} />,
      color: PO_STATUS_COLORS.NEW,
      active: true,
    });

    // Show progression through normal statuses
    for (let i = 1; i < statusOrder.length; i++) {
      const status = statusOrder[i];
      const IconComponent = statusIcons[status];
      const isActive = i <= currentStatusIndex;
      const isCurrent = i === currentStatusIndex;

      let date: Date | undefined;
      let description = '';

      if (status === 'CONFIRMED' && purchaseOrder.processedBy && i <= currentStatusIndex) {
        date = purchaseOrder.updatedAt;
        description = `${t('po.processedBy')}: ${purchaseOrder.processedBy}`;
      } else if (status === 'PROCESSING' && i <= currentStatusIndex) {
        date = purchaseOrder.updatedAt;
        description = t('po.processingStarted');
      } else if (status === 'SHIPPED' && purchaseOrder.deliveryDate && i <= currentStatusIndex) {
        date = purchaseOrder.updatedAt;
        description = `${t('po.expectedDelivery')}: ${formatDate(purchaseOrder.deliveryDate)}`;
      } else if (status === 'DELIVERED' && purchaseOrder.completedDate && i <= currentStatusIndex) {
        date = purchaseOrder.completedDate;
        description = t('po.orderCompleted');
      }

      items.push({
        title: t(`po.status.${status}`),
        description: description || (isActive ? t('po.completed') : t('po.pending')),
        date,
        icon: <IconComponent size={16} />,
        color: isActive ? PO_STATUS_COLORS[status] : 'gray',
        active: isActive,
        current: isCurrent,
      });
    }

    // Handle special cases (cancelled/refunded)
    if (purchaseOrder.status === 'CANCELLED') {
      const IconComponent = statusIcons.CANCELLED;
      items.push({
        title: t('po.status.CANCELLED'),
        description: t('po.orderCancelled'),
        date: purchaseOrder.updatedAt,
        icon: <IconComponent size={16} />,
        color: PO_STATUS_COLORS.CANCELLED,
        active: true,
        current: true,
      });
    }

    if (purchaseOrder.status === 'REFUNDED') {
      const IconComponent = statusIcons.REFUNDED;
      items.push({
        title: t('po.status.REFUNDED'),
        description: t('po.orderRefunded'),
        date: purchaseOrder.updatedAt,
        icon: <IconComponent size={16} />,
        color: PO_STATUS_COLORS.REFUNDED,
        active: true,
        current: true,
      });
    }

    return items;
  };

  const timelineItems = getTimelineItems();

  return (
    <Card shadow="sm" padding="xl" radius="md">
      <Stack gap="lg">
        <Title order={3}>{t('po.orderTimeline')}</Title>

        <Timeline active={timelineItems.length - 1} bulletSize={24} lineWidth={2}>
          {timelineItems.map((item, index) => (
            <Timeline.Item
              key={index}
              bullet={item.icon}
              title={
                <Group gap="sm">
                  <Text fw={500}>{item.title}</Text>
                  {item.current && (
                    <Badge size="sm" variant="filled" color={item.color}>
                      {t('po.current')}
                    </Badge>
                  )}
                </Group>
              }
              color={item.color}
            >
              <Text size="sm" c="dimmed" mb={4}>
                {item.description}
              </Text>
              {item.date && (
                <Text size="xs" c="dimmed">
                  {formatDate(item.date)}
                </Text>
              )}
            </Timeline.Item>
          ))}
        </Timeline>
      </Stack>
    </Card>
  );
}
