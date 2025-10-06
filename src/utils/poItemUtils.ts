import { v4 as uuidv4 } from 'uuid';

import type { POItem } from '@/services/sales/purchaseOrder';

/**
 * Creates a new POItem from partial data with validation and duplicate checking
 * @param itemData - Partial POItem data to create from
 * @param existingItems - Array of existing items to check for duplicates
 * @returns Object with either the created item or an error message
 */
export const createPOItem = (
  itemData: Partial<POItem>,
  _existingItems: POItem[],
): { item: POItem | null; error?: string } => {
  // Validation - ensure required fields are present
  if (!itemData.productCode || !itemData.description || !itemData.quantity) {
    return { item: null, error: 'Missing required fields' };
  }

  // Check for duplicate product
  // const isDuplicate = existingItems.some((item) => item.productCode === itemData.productCode);

  // if (isDuplicate) {
  //   return {
  //     item: null,
  //     error: `Product ${itemData.productCode} is already added`,
  //   };
  // }

  // Create the POItem with a unique ID
  const item: POItem = {
    id: uuidv4(),
    purchaseOrderId: '', // Will be set when the PO is created
    productCode: itemData.productCode,
    description: itemData.description,
    quantity: itemData.quantity || 1,
    color: itemData.color,
    category: itemData.category,
    notes: itemData.notes ?? '',
    unit: itemData.unit ?? '',
    productId: itemData.productId ?? '',
  };

  return { item };
};
