import type { POStatusHistory } from '@/lib/api/schemas/sales.schemas';

/**
 * Helper to get status history entry by status
 */
export function getStatusHistoryByStatus(
  statusHistory: POStatusHistory[] | undefined,
  status: string,
): POStatusHistory | undefined {
  if (!statusHistory) return undefined;
  return statusHistory.find((entry) => entry.status === status);
}

/**
 * Get the latest status history entry
 */
export function getLatestStatusHistory(
  statusHistory: POStatusHistory[] | undefined,
): POStatusHistory | undefined {
  if (!statusHistory || statusHistory.length === 0) return undefined;
  // StatusHistory is already sorted by timestamp from backend
  return statusHistory[statusHistory.length - 1];
}

/**
 * Get cancel reason from status history
 */
export function getCancelReason(statusHistory: POStatusHistory[] | undefined): string | undefined {
  const cancelledEntry = getStatusHistoryByStatus(statusHistory, 'CANCELLED');
  return cancelledEntry?.reason;
}

/**
 * Get refund reason from status history
 */
export function getRefundReason(statusHistory: POStatusHistory[] | undefined): string | undefined {
  const refundedEntry = getStatusHistoryByStatus(statusHistory, 'REFUNDED');
  return refundedEntry?.reason;
}

/**
 * Get delivery notes from status history
 */
export function getDeliveryNotes(statusHistory: POStatusHistory[] | undefined): string | undefined {
  const deliveredEntry = getStatusHistoryByStatus(statusHistory, 'DELIVERED');
  return deliveredEntry?.deliveryNotes;
}

/**
 * Get shipping info from status history
 */
export function getShippingInfo(
  statusHistory: POStatusHistory[] | undefined,
): { trackingNumber?: string; carrier?: string } | undefined {
  const shippedEntry = getStatusHistoryByStatus(statusHistory, 'SHIPPED');
  if (!shippedEntry) return undefined;
  return {
    trackingNumber: shippedEntry.trackingNumber,
    carrier: shippedEntry.carrier,
  };
}
