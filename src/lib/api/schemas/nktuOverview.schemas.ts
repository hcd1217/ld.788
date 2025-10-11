import * as z from 'zod/v4';

import { DeliveryRequestSchema } from './deliveryRequest.schemas';
import { PurchaseOrderSchema } from './purchaseOrder.schemas';

// ========== NKTU Overview Schemas ==========

/**
 * Response schema for NKTU overview endpoint
 * Endpoint: GET /api/custom/nktu/overview
 */
export const NktuOverviewSchema = z.object({
  purchaseOrders: z.array(PurchaseOrderSchema),
  deliveryRequests: z.array(DeliveryRequestSchema),
});

// ========== Type Exports ==========

export type NktuOverview = z.infer<typeof NktuOverviewSchema>;
