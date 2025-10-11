import { nktuOverviewApi } from '@/lib/api';
import type { DeliveryRequest as ApiDeliveryRequest } from '@/lib/api/schemas/deliveryRequest.schemas';
import type { PurchaseOrder as ApiPurchaseOrder } from '@/lib/api/schemas/purchaseOrder.schemas';
import type { EmployeeOverview } from '@/services/client/overview';

import { overviewService } from '../client/overview';

import type { DeliveryRequest } from './deliveryRequest';
import type { PurchaseOrder } from './purchaseOrder';

/**
 * Transform API PurchaseOrder to Frontend PurchaseOrder
 */
function transformPOApiToFrontend(
  apiPO: ApiPurchaseOrder,
  employeeMapByEmployeeId: Map<string, EmployeeOverview>,
): PurchaseOrder {
  const customerName = apiPO.isPersonalCustomer ? apiPO.personalCustomerName || '' : '';
  const salesPerson = apiPO.salesId
    ? employeeMapByEmployeeId.get(apiPO.salesId)?.fullName
    : undefined;
  const deliveryRequest = apiPO?.deliveryRequest;
  const deliveryPerson = deliveryRequest?.assignedTo
    ? employeeMapByEmployeeId.get(deliveryRequest.assignedTo)?.fullName
    : undefined;

  return {
    ...apiPO,
    salesPerson,
    isUrgentPO: apiPO.isUrgentPO ?? false,
    isInternalDelivery: apiPO.isInternalDelivery,
    isPersonalCustomer: apiPO.isPersonalCustomer,
    personalCustomerName: apiPO.personalCustomerName,
    customerPONumber: apiPO.customerPONumber,
    customerName,
    address: apiPO?.shippingAddress?.oneLineAddress,
    googleMapsUrl: apiPO?.shippingAddress?.googleMapsUrl,
    statusHistory: apiPO?.statusHistory,
    deliveryRequest: apiPO?.deliveryRequest
      ? {
          deliveryRequestId: apiPO.deliveryRequest.deliveryRequestId,
          deliveryRequestNumber: apiPO.deliveryRequest.deliveryRequestNumber,
          deliveryPerson,
          isUrgentDelivery: apiPO.deliveryRequest.isUrgentDelivery,
          status: apiPO.deliveryRequest.status,
          scheduledDate: apiPO.deliveryRequest.scheduledDate,
          photos: apiPO.deliveryRequest.photos,
        }
      : undefined,
    items: apiPO.items,
  } as PurchaseOrder;
}

/**
 * Transform API DeliveryRequest to Frontend DeliveryRequest
 */
function transformDRApiToFrontend(
  apiDR: ApiDeliveryRequest,
  employeeMapByEmployeeId: Map<string, EmployeeOverview>,
): DeliveryRequest {
  const employee = apiDR.assignedTo ? employeeMapByEmployeeId.get(apiDR.assignedTo) : undefined;
  const deliveryPerson = employee?.fullName ?? '';

  return {
    ...apiDR,
    deliveryPerson,
    isReceive: apiDR.type === 'RECEIVE',
    isDelivery: apiDR.type === 'DELIVERY',
    isUrgentDelivery: apiDR?.isUrgentDelivery ?? false,
    type: apiDR.type,
    purchaseOrderId: apiDR?.purchaseOrder?.poId,
    purchaseOrderNumber: apiDR?.purchaseOrder?.poNumber as string,
    customerName: '',
    customerId: apiDR?.purchaseOrder?.customerId,
    photos: apiDR.photos ?? [],
    deliveryAddress: apiDR.deliveryAddress ?? {},
    receiveAddress: apiDR.receiveAddress ?? {},
  };
}

/**
 * Home service - provides filtered data for dashboard sections
 * Uses custom NKTU overview endpoint for optimized data fetching
 */
export const homeService = {
  /**
   * Get active purchase orders for Sales dashboard
   * Filters: NEW or CONFIRMED status
   */
  async getActivePurchaseOrders(): Promise<PurchaseOrder[]> {
    const { purchaseOrders } = await nktuOverviewApi.getNktuOverview();
    const customerMapByCustomerId = await overviewService.getCustomerOverview();
    const employeeMapByEmployeeId = await overviewService.getEmployeeOverview();

    return purchaseOrders
      .filter((po) => po.status === 'NEW' || po.status === 'CONFIRMED')
      .map((po) => {
        const transformed = transformPOApiToFrontend(po, employeeMapByEmployeeId);
        // Add customer name from overview
        if (po.customerId) {
          transformed.customerName = customerMapByCustomerId.get(po.customerId)?.name ?? '';
        }
        return transformed;
      });
  },

  /**
   * Get today's delivery requests for Delivery dashboard
   * Filters: Today's date, PENDING or IN_TRANSIT status
   */
  async getTodayDeliveryRequests(): Promise<DeliveryRequest[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { deliveryRequests } = await nktuOverviewApi.getNktuOverview();
    const customerMapByCustomerId = await overviewService.getCustomerOverview();
    const employeeMapByEmployeeId = await overviewService.getEmployeeOverview();

    return deliveryRequests
      .filter((dr) => {
        const scheduledDate = new Date(dr.scheduledDate);
        scheduledDate.setHours(0, 0, 0, 0);
        const isToday = scheduledDate.getTime() === today.getTime();
        const isPendingOrTransit = dr.status === 'PENDING' || dr.status === 'IN_TRANSIT';
        return isToday && isPendingOrTransit;
      })
      .map((dr) => {
        const transformed = transformDRApiToFrontend(dr, employeeMapByEmployeeId);
        // Add customer name from overview
        const customerId = dr.purchaseOrder?.customerId;
        if (customerId) {
          transformed.customerName = customerMapByCustomerId.get(customerId)?.name ?? '';
        }
        return transformed;
      });
  },

  /**
   * Get processing queue for Warehouse dashboard
   * Filters: CONFIRMED, PROCESSING, or READY_FOR_PICKUP status
   */
  async getProcessingQueue(): Promise<PurchaseOrder[]> {
    const { purchaseOrders } = await nktuOverviewApi.getNktuOverview();
    const customerMapByCustomerId = await overviewService.getCustomerOverview();
    const employeeMapByEmployeeId = await overviewService.getEmployeeOverview();

    return purchaseOrders
      .filter((po) => ['CONFIRMED', 'PROCESSING', 'READY_FOR_PICKUP'].includes(po.status))
      .map((po) => {
        const transformed = transformPOApiToFrontend(po, employeeMapByEmployeeId);
        // Add customer name from overview
        if (po.customerId) {
          transformed.customerName = customerMapByCustomerId.get(po.customerId)?.name ?? '';
        }
        return transformed;
      });
  },
};
