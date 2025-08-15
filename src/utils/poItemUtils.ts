import { v4 as uuidv4 } from 'uuid';
import type { POItem } from '@/services/sales/purchaseOrder';

/**
 * Calculates the total price for a PO item with optional discount
 * @param quantity - Item quantity
 * @param unitPrice - Price per unit
 * @param discount - Optional discount percentage (0-100)
 * @returns Calculated total price rounded to 2 decimal places
 */
export const calculateItemTotal = (
  quantity: number,
  unitPrice: number,
  discount: number = 0,
): number => {
  const total = quantity * unitPrice * (1 - discount / 100);
  return Math.round(total * 100) / 100;
};

/**
 * Creates a new POItem from partial data with validation and duplicate checking
 * @param itemData - Partial POItem data to create from
 * @param existingItems - Array of existing items to check for duplicates
 * @returns Object with either the created item or an error message
 */
export const createPOItem = (
  itemData: Partial<POItem>,
  existingItems: POItem[],
): { item: POItem | null; error?: string } => {
  // Validation - ensure required fields are present
  if (
    !itemData.productCode ||
    !itemData.description ||
    !itemData.quantity ||
    itemData.unitPrice === undefined
  ) {
    return { item: null, error: 'Missing required fields' };
  }

  // Check for duplicate product
  const isDuplicate = existingItems.some((item) => item.productCode === itemData.productCode);

  if (isDuplicate) {
    return {
      item: null,
      error: `Product ${itemData.productCode} is already added`,
    };
  }

  // Calculate totals
  const quantity = itemData.quantity || 0;
  const unitPrice = itemData.unitPrice || 0;
  const discount = itemData.discount || 0;
  const totalPrice = calculateItemTotal(quantity, unitPrice, discount);

  // Create the POItem with a unique ID
  const item: POItem = {
    id: uuidv4(),
    purchaseOrderId: '', // Will be set when the PO is created
    productCode: itemData.productCode,
    description: itemData.description,
    quantity,
    unitPrice,
    totalPrice,
    discount: discount > 0 ? discount : undefined,
    category: itemData.category,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return { item };
};
