import { useMemo } from 'react';
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
import { formatDate } from '@/utils/time';
import { PO_STATUS_COLORS } from '@/constants/purchaseOrder';
import { useEmployeeMapByUserId } from '@/stores/useAppStore';
import { getEmployeeNameByUserId } from '@/utils/overview';
import { getStatusHistoryByStatus } from '@/utils/purchaseOrder';
import type { PurchaseOrder, POStatus } from '@/services/sales/purchaseOrder';
import type { TimelineItemData } from '@/components/app/po/POTimelineItem';

const statusIcons = {
  NEW: IconFileInvoice,
  CONFIRMED: IconCheck,
  PROCESSING: IconPackage,
  READY_FOR_PICKUP: IconPackageExport,
  SHIPPED: IconTruck,
  DELIVERED: IconPackageExport,
  CANCELLED: IconX,
  REFUNDED: IconReceipt,
};

export function usePOTimelineItems(purchaseOrder: PurchaseOrder) {
  const { t } = useTranslation();
  const employeeMapByUserId = useEmployeeMapByUserId();

  // Memoize the entire timeline items calculation for performance
  const timelineItems = useMemo(() => {
    const createTimelineItem = (
      status: POStatus,
      userId?: string,
      timestamp?: Date,
      additionalInfo?: string,
      isActive: boolean = true,
      isCurrent: boolean = false,
    ): TimelineItemData => {
      const IconComponent = statusIcons[status];
      let description = '';

      if (userId) {
        const userName = getEmployeeNameByUserId(employeeMapByUserId, userId);
        let actionLabel = t('po.updatedBy');
        switch (status) {
          case 'NEW': {
            actionLabel = t('po.createdBy');
            break;
          }
          case 'CONFIRMED': {
            actionLabel = t('po.confirmedBy');
            break;
          }
          case 'PROCESSING': {
            actionLabel = t('po.processedBy');
            break;
          }
          case 'SHIPPED': {
            actionLabel = t('po.shippedBy');
            break;
          }
          case 'DELIVERED': {
            actionLabel = t('po.deliveredBy');
            break;
          }
          case 'CANCELLED': {
            actionLabel = t('po.cancelledBy');
            break;
          }
          case 'REFUNDED': {
            actionLabel = t('po.refundedBy');
            break;
          }
          default: {
            actionLabel = t('po.updatedBy');
            break;
          }
        }
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

    const getTimelineItems = (): TimelineItemData[] => {
      const items: TimelineItemData[] = [];
      const currentStatus = purchaseOrder.status;
      const isCancelled = currentStatus === 'CANCELLED';
      const isRefunded = currentStatus === 'REFUNDED';

      // Get status history entries
      const newEntry = getStatusHistoryByStatus(purchaseOrder.statusHistory, 'NEW');
      const confirmedEntry = getStatusHistoryByStatus(purchaseOrder.statusHistory, 'CONFIRMED');
      const processingEntry = getStatusHistoryByStatus(purchaseOrder.statusHistory, 'PROCESSING');
      const readyForPickupEntry = getStatusHistoryByStatus(
        purchaseOrder.statusHistory,
        'READY_FOR_PICKUP',
      );
      const shippedEntry = getStatusHistoryByStatus(purchaseOrder.statusHistory, 'SHIPPED');
      const deliveredEntry = getStatusHistoryByStatus(purchaseOrder.statusHistory, 'DELIVERED');
      const cancelledEntry = getStatusHistoryByStatus(purchaseOrder.statusHistory, 'CANCELLED');
      const refundedEntry = getStatusHistoryByStatus(purchaseOrder.statusHistory, 'REFUNDED');

      // Always show the normal progression path
      // NEW status - always show as completed
      items.push(
        createTimelineItem(
          'NEW',
          newEntry?.userId,
          newEntry?.timestamp || purchaseOrder.orderDate,
          undefined,
          true,
          currentStatus === 'NEW',
        ),
      );

      // CONFIRMED status - always show in normal flow
      items.push(
        createTimelineItem(
          'CONFIRMED',
          confirmedEntry?.userId,
          confirmedEntry?.timestamp,
          undefined,
          !!confirmedEntry,
          currentStatus === 'CONFIRMED',
        ),
      );

      // PROCESSING status - always show in normal flow
      items.push(
        createTimelineItem(
          'PROCESSING',
          processingEntry?.userId,
          processingEntry?.timestamp,
          undefined,
          !!processingEntry,
          currentStatus === 'PROCESSING',
        ),
      );

      // READY_FOR_PICKUP status - always show in normal flow
      // Mark as completed if status has progressed beyond this point (SHIPPED, DELIVERED)
      const isReadyForPickupCompleted =
        !!readyForPickupEntry ||
        currentStatus === 'SHIPPED' ||
        currentStatus === 'DELIVERED' ||
        currentStatus === 'CANCELLED' ||
        currentStatus === 'REFUNDED';

      items.push(
        createTimelineItem(
          'READY_FOR_PICKUP',
          readyForPickupEntry?.userId,
          readyForPickupEntry?.timestamp,
          undefined,
          isReadyForPickupCompleted,
          currentStatus === 'READY_FOR_PICKUP',
        ),
      );

      // SHIPPED status - always show in normal flow
      let shippedAdditionalInfo = purchaseOrder.deliveryDate
        ? `${t('po.expectedDelivery')}: ${formatDate(purchaseOrder.deliveryDate)}`
        : undefined;
      if (shippedEntry?.trackingNumber) {
        shippedAdditionalInfo = shippedAdditionalInfo
          ? `${shippedAdditionalInfo} | ${t('po.trackingNumber')}: ${shippedEntry.trackingNumber}`
          : `${t('po.trackingNumber')}: ${shippedEntry.trackingNumber}`;
      }
      if (shippedEntry?.carrier) {
        shippedAdditionalInfo = shippedAdditionalInfo
          ? `${shippedAdditionalInfo} | ${t('po.carrier')}: ${shippedEntry.carrier}`
          : `${t('po.carrier')}: ${shippedEntry.carrier}`;
      }
      items.push(
        createTimelineItem(
          'SHIPPED',
          shippedEntry?.userId,
          shippedEntry?.timestamp,
          shippedAdditionalInfo,
          !!shippedEntry,
          currentStatus === 'SHIPPED',
        ),
      );

      // DELIVERED status - show if not cancelled/refunded
      if (!isCancelled && !isRefunded) {
        const deliveryAdditionalInfo = deliveredEntry?.deliveryNotes
          ? `${t('po.deliveryNotes')}: ${deliveredEntry.deliveryNotes}`
          : undefined;
        items.push(
          createTimelineItem(
            'DELIVERED',
            deliveredEntry?.userId,
            deliveredEntry?.timestamp || purchaseOrder.completedDate,
            deliveryAdditionalInfo,
            !!deliveredEntry || currentStatus === 'DELIVERED',
            currentStatus === 'DELIVERED',
          ),
        );
      }

      // CANCELLED status - show only if cancelled
      if (isCancelled) {
        const additionalInfo = cancelledEntry?.reason
          ? `${t('po.reason')}: ${cancelledEntry.reason}`
          : undefined;
        items.push(
          createTimelineItem(
            'CANCELLED',
            cancelledEntry?.userId,
            cancelledEntry?.timestamp || purchaseOrder.updatedAt,
            additionalInfo,
            true,
            true,
          ),
        );
      }

      // REFUNDED status - show only if refunded
      if (isRefunded) {
        const additionalInfo = refundedEntry?.reason
          ? `${t('po.reason')}: ${refundedEntry.reason}`
          : undefined;
        items.push(
          createTimelineItem(
            'REFUNDED',
            refundedEntry?.userId,
            refundedEntry?.timestamp || purchaseOrder.updatedAt,
            additionalInfo,
            true,
            true,
          ),
        );
      }

      return items;
    };

    // Call the function and return the items
    return getTimelineItems();
  }, [purchaseOrder, employeeMapByUserId, t]); // Dependencies for memoization

  return timelineItems;
}
