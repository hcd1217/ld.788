import type { PurchaseOrder, POItem } from '@/services/sales/purchaseOrder';

// PO Status flow validation
export const PO_STATUS_FLOW = {
  NEW: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
} as const;

// Check if status transition is valid
export function canTransitionStatus(
  currentStatus: PurchaseOrder['status'],
  newStatus: PurchaseOrder['status'],
): boolean {
  const allowedTransitions = PO_STATUS_FLOW[currentStatus] as
    | readonly PurchaseOrder['status'][]
    | undefined;
  return allowedTransitions?.includes(newStatus) ?? false;
}

// Get available actions for a PO based on its status
export function getAvailableActions(status: PurchaseOrder['status']): string[] {
  const actions: string[] = [];

  switch (status) {
    case 'NEW':
      actions.push('confirm', 'edit', 'cancel');
      break;
    case 'CONFIRMED':
      actions.push('process', 'cancel');
      break;
    case 'PROCESSING':
      actions.push('ship', 'cancel');
      break;
    case 'SHIPPED':
      actions.push('deliver', 'cancel');
      break;
    case 'DELIVERED':
      actions.push('refund');
      break;
    default:
      break;
  }

  return actions;
}

// Calculate total amount from items
export function calculatePOTotal(items: POItem[]): number {
  return items.reduce((sum, item) => sum + item.totalPrice, 0);
}

// Validate PO items
export function validatePOItems(items: POItem[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!items || items.length === 0) {
    errors.push('At least one item is required');
    return { isValid: false, errors };
  }

  items.forEach((item, index) => {
    if (!item.productCode) {
      errors.push(`Item ${index + 1}: Product code is required`);
    }
    if (!item.quantity || item.quantity <= 0) {
      errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
    }
    if (!item.unitPrice || item.unitPrice <= 0) {
      errors.push(`Item ${index + 1}: Unit price must be greater than 0`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Check if PO can be edited
export function canEditPO(po: PurchaseOrder): boolean {
  return po.status === 'NEW';
}

// Check if PO can be cancelled
export function canCancelPO(po: PurchaseOrder): boolean {
  return ['NEW', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(po.status);
}

// Format PO status for display
export function formatPOStatus(status: PurchaseOrder['status']): string {
  const statusMap: Record<PurchaseOrder['status'], string> = {
    NEW: 'New',
    CONFIRMED: 'Confirmed',
    PROCESSING: 'Processing',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
    REFUNDED: 'Refunded',
  };

  return statusMap[status] || status;
}

// Get status color for badges
export function getPOStatusColor(status: PurchaseOrder['status']): string {
  const colorMap: Record<PurchaseOrder['status'], string> = {
    NEW: 'blue',
    CONFIRMED: 'cyan',
    PROCESSING: 'indigo',
    SHIPPED: 'teal',
    DELIVERED: 'green',
    CANCELLED: 'red',
    REFUNDED: 'orange',
  };

  return colorMap[status] || 'gray';
}

// Generate PO number
export function generatePONumber(prefix: string = 'PO'): string {
  const year = new Date().getFullYear();
  const timestamp = String(Date.now()).slice(-6);
  return `${prefix}-${year}-${timestamp}`;
}

// Calculate delivery date estimate
export function estimateDeliveryDate(
  orderDate: Date,
  processingDays: number = 2,
  shippingDays: number = 3,
): Date {
  const deliveryDate = new Date(orderDate);
  const totalDays = processingDays + shippingDays;

  // Add business days only (skip weekends)
  let daysAdded = 0;
  while (daysAdded < totalDays) {
    deliveryDate.setDate(deliveryDate.getDate() + 1);
    const dayOfWeek = deliveryDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      daysAdded++;
    }
  }

  return deliveryDate;
}

// Check if PO is overdue
export function isPOOverdue(po: PurchaseOrder): boolean {
  if (po.status === 'CANCELLED' || po.status === 'REFUNDED' || po.status === 'DELIVERED') {
    return false;
  }

  if (!po.deliveryDate) {
    return false;
  }

  return new Date() > new Date(po.deliveryDate);
}

// Calculate days until delivery
export function daysUntilDelivery(deliveryDate?: Date): number | null {
  if (!deliveryDate) return null;

  const today = new Date();
  const delivery = new Date(deliveryDate);
  const diffTime = delivery.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

// Group POs by status for dashboard
export function groupPOsByStatus(orders: PurchaseOrder[]): Record<string, PurchaseOrder[]> {
  return orders.reduce(
    (acc, order) => {
      const status = order.status;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(order);
      return acc;
    },
    {} as Record<string, PurchaseOrder[]>,
  );
}

// Calculate PO statistics
export function calculatePOStatistics(orders: PurchaseOrder[]) {
  const stats = {
    total: orders.length,
    totalAmount: 0,
    averageAmount: 0,
    byStatus: {} as Record<string, number>,
    overdue: 0,
    thisMonth: 0,
    lastMonth: 0,
  };

  const now = new Date();
  const thisMonth = now.getMonth();
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const thisYear = now.getFullYear();
  const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

  orders.forEach((order) => {
    // Total amount
    stats.totalAmount += order.totalAmount;

    // By status
    stats.byStatus[order.status] = (stats.byStatus[order.status] || 0) + 1;

    // Overdue
    if (isPOOverdue(order)) {
      stats.overdue++;
    }

    // This month vs last month
    const orderDate = new Date(order.orderDate);
    if (orderDate.getMonth() === thisMonth && orderDate.getFullYear() === thisYear) {
      stats.thisMonth++;
    } else if (orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear) {
      stats.lastMonth++;
    }
  });

  // Average amount
  stats.averageAmount = stats.total > 0 ? stats.totalAmount / stats.total : 0;

  return stats;
}
