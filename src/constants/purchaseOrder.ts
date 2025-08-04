export const PO_STATUS = {
  ALL: 'all',
  NEW: 'NEW',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const;

export const VIEW_MODE = {
  TABLE: 'table',
  GRID: 'grid',
} as const;

export const PAYMENT_TERMS = {
  NET30: 'Net 30',
  NET60: 'Net 60',
  DUE_ON_RECEIPT: 'Due on Receipt',
  TWO_TEN_NET30: '2/10 Net 30',
  COD: 'COD',
} as const;

export const PO_ACTIONS = {
  CONFIRM: 'confirm',
  PROCESS: 'process',
  SHIP: 'ship',
  DELIVER: 'deliver',
  CANCEL: 'cancel',
  REFUND: 'refund',
} as const;

export type POStatusType = (typeof PO_STATUS)[keyof typeof PO_STATUS];
export type ViewModeType = (typeof VIEW_MODE)[keyof typeof VIEW_MODE];
export type PaymentTermsType = (typeof PAYMENT_TERMS)[keyof typeof PAYMENT_TERMS];
export type POActionType = (typeof PO_ACTIONS)[keyof typeof PO_ACTIONS];

// Status colors for UI
export const PO_STATUS_COLORS: Record<Exclude<POStatusType, 'all'>, string> = {
  [PO_STATUS.NEW]: 'blue',
  [PO_STATUS.CONFIRMED]: 'cyan',
  [PO_STATUS.PROCESSING]: 'yellow',
  [PO_STATUS.SHIPPED]: 'orange',
  [PO_STATUS.DELIVERED]: 'green',
  [PO_STATUS.CANCELLED]: 'gray',
  [PO_STATUS.REFUNDED]: 'red',
};
