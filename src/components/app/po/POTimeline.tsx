import React from 'react';
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
import { useEmployeeMapByUserId } from '@/stores/useAppStore';
import { getEmployeeNameByUserId } from '@/utils/overview';

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

// Define the normal order flow for PO statuses
// const statusOrder: POStatus[] = ['NEW', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

type TimelineItem = {
  title: string;
  description: string;
  date?: Date;
  icon: React.ReactNode;
  color: string;
  active: boolean;
  current?: boolean;
};

export function POTimeline({ purchaseOrder }: POTimelineProps) {
  const { t } = useTranslation();
  const employeeMapByUserId = useEmployeeMapByUserId();

  const createTimelineItem = (
    status: POStatus,
    userId?: string,
    timestamp?: Date,
    additionalInfo?: string,
    isActive: boolean = true,
    isCurrent: boolean = false,
  ): TimelineItem => {
    const IconComponent = statusIcons[status];
    let description = '';

    if (userId) {
      const userName = getEmployeeNameByUserId(employeeMapByUserId, userId);
      const actionLabel =
        status === 'NEW'
          ? t('po.createdBy')
          : status === 'CONFIRMED'
            ? t('po.confirmedBy')
            : status === 'PROCESSING'
              ? t('po.processedBy')
              : status === 'SHIPPED'
                ? t('po.shippedBy')
                : status === 'DELIVERED'
                  ? t('po.deliveredBy')
                  : status === 'CANCELLED'
                    ? t('po.cancelledBy')
                    : status === 'REFUNDED'
                      ? t('po.refundedBy')
                      : t('po.updatedBy');
      description = `${actionLabel}: ${userName}`;
    }

    if (additionalInfo) {
      description = description ? `${description} - ${additionalInfo}` : additionalInfo;
    }

    if (!description) {
      description = isActive ? t('po.completed') : t('po.pending');
    }

    return {
      title: t(`po.status.${status}`),
      description,
      date: timestamp,
      icon: <IconComponent size={16} />,
      color: isActive ? PO_STATUS_COLORS[status] : 'gray',
      active: isActive,
      current: isCurrent,
    };
  };

  const getTimelineItems = (): TimelineItem[] => {
    const items: TimelineItem[] = [];
    const currentStatus = purchaseOrder.status;
    const isCancelled = currentStatus === 'CANCELLED';
    const isRefunded = currentStatus === 'REFUNDED';

    // Always show the normal progression path
    // NEW status - always show as completed
    items.push(
      createTimelineItem(
        'NEW',
        purchaseOrder.createdBy,
        purchaseOrder.createdAt || purchaseOrder.orderDate,
        undefined,
        true,
        currentStatus === 'NEW',
      ),
    );

    // CONFIRMED status - always show in normal flow
    items.push(
      createTimelineItem(
        'CONFIRMED',
        purchaseOrder.confirmedBy,
        purchaseOrder.confirmedAt,
        undefined,
        !!purchaseOrder.confirmedAt,
        currentStatus === 'CONFIRMED',
      ),
    );

    // PROCESSING status - always show in normal flow
    items.push(
      createTimelineItem(
        'PROCESSING',
        purchaseOrder.processedBy,
        purchaseOrder.processedAt,
        undefined,
        !!purchaseOrder.processedAt,
        currentStatus === 'PROCESSING',
      ),
    );

    // SHIPPED status - always show in normal flow
    const shippedAdditionalInfo = purchaseOrder.deliveryDate
      ? `${t('po.expectedDelivery')}: ${formatDate(purchaseOrder.deliveryDate)}`
      : undefined;
    items.push(
      createTimelineItem(
        'SHIPPED',
        purchaseOrder.shippedBy,
        purchaseOrder.shippedAt,
        shippedAdditionalInfo,
        !!purchaseOrder.shippedAt,
        currentStatus === 'SHIPPED',
      ),
    );

    // DELIVERED status - show if not cancelled/refunded
    if (!isCancelled && !isRefunded) {
      items.push(
        createTimelineItem(
          'DELIVERED',
          purchaseOrder.deliveredBy,
          purchaseOrder.deliveredAt || purchaseOrder.completedDate,
          undefined,
          !!purchaseOrder.deliveredAt || currentStatus === 'DELIVERED',
          currentStatus === 'DELIVERED',
        ),
      );
    }

    // CANCELLED status - show only if cancelled
    if (isCancelled) {
      const additionalInfo = purchaseOrder.cancelReason
        ? `${t('po.reason')}: ${purchaseOrder.cancelReason}`
        : undefined;
      items.push(
        createTimelineItem(
          'CANCELLED',
          purchaseOrder.cancelledBy,
          purchaseOrder.cancelledAt || purchaseOrder.updatedAt,
          additionalInfo,
          true,
          true,
        ),
      );
    }

    // REFUNDED status - show only if refunded
    if (isRefunded) {
      const additionalInfo = purchaseOrder.refundReason
        ? `${t('po.reason')}: ${purchaseOrder.refundReason}`
        : undefined;
      items.push(
        createTimelineItem(
          'REFUNDED',
          purchaseOrder.refundedBy,
          purchaseOrder.refundedAt || purchaseOrder.updatedAt,
          additionalInfo,
          true,
          true,
        ),
      );
    }

    return items;
  };

  const timelineItems = getTimelineItems();

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
            <Timeline.Item
              key={index}
              bullet={item.icon}
              title={
                <Group gap="sm">
                  <Text fw={500} c={item.active ? undefined : 'gray.5'}>
                    {item.title}
                  </Text>
                  {item.current && (
                    <Badge size="sm" variant="filled" color={item.color}>
                      {t('po.current')}
                    </Badge>
                  )}
                  {!item.active && !item.current && (
                    <Badge size="sm" variant="light" color="gray">
                      {t('po.pending')}
                    </Badge>
                  )}
                </Group>
              }
              color={item.color}
            >
              <Text size="sm" c={item.active ? 'dimmed' : 'gray.5'} mb={4}>
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
