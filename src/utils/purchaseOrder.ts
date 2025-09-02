import type { POStatusHistory, PurchaseOrder } from '@/lib/api/schemas/sales.schemas';

/**
 * Check if a Purchase Order is editable (only NEW status can be edited)
 */
export function isPOEditable(po: Pick<PurchaseOrder, 'status'>): boolean {
  return po.status === 'NEW';
}

/**
 * Check if a Purchase Order status is NEW
 */
export function isPOStatusNew(status: PurchaseOrder['status']): boolean {
  return status === 'NEW';
}

/**
 * Check if a Purchase Order is not NEW (locked for editing)
 */
export function isPOLocked(po: Pick<PurchaseOrder, 'status'>): boolean {
  return po.status !== 'NEW';
}

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
  return statusHistory.at(-1);
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
  if (!shippedEntry.trackingNumber || !shippedEntry.carrier) return undefined;
  return {
    trackingNumber: shippedEntry.trackingNumber,
    carrier: shippedEntry.carrier,
  };
}
