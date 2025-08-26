export const PO_STATUS = {
  ALL: 'all',
  NEW: 'NEW',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  READY_FOR_PICKUP: 'READY_FOR_PICKUP',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const;

export const PO_ACTIONS = {
  CONFIRM: 'confirm',
  PROCESS: 'process',
  MARK_READY: 'markReady',
  SHIP: 'ship',
  DELIVER: 'deliver',
  CANCEL: 'cancel',
  REFUND: 'refund',
} as const;

export const PRODUCT_CATEGORIES = [
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Office Supplies', label: 'Office Supplies' },
  { value: 'Hardware', label: 'Hardware' },
  { value: 'Software', label: 'Software' },
  { value: 'Services', label: 'Services' },
] as const;

export type POStatusType = (typeof PO_STATUS)[keyof typeof PO_STATUS];
export type POActionType = (typeof PO_ACTIONS)[keyof typeof PO_ACTIONS];
export type ProductCategoryType = (typeof PRODUCT_CATEGORIES)[number];

// Status colors for UI
export const PO_STATUS_COLORS: Record<Exclude<POStatusType, 'all'>, string> = {
  [PO_STATUS.NEW]: 'blue',
  [PO_STATUS.CONFIRMED]: 'cyan',
  [PO_STATUS.PROCESSING]: 'yellow',
  [PO_STATUS.READY_FOR_PICKUP]: 'teal',
  [PO_STATUS.SHIPPED]: 'orange',
  [PO_STATUS.DELIVERED]: 'green',
  [PO_STATUS.CANCELLED]: 'gray',
  [PO_STATUS.REFUNDED]: 'red',
};
