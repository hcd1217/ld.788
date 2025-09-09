import type { DeliveryStatus } from '@/services/sales/deliveryRequest';

export const DELIVERY_STATUS = {
  ALL: 'ALL',
  PENDING: 'PENDING',
  IN_TRANSIT: 'IN_TRANSIT',
  COMPLETED: 'COMPLETED',
} as const;

export const DELIVERY_ACTIONS = {
  START_TRANSIT: 'start_transit',
  COMPLETE: 'complete',
  TAKE_PHOTO: 'take_photo',
  DELETE: 'delete',
} as const;

export type DeliveryStatusType = (typeof DELIVERY_STATUS)[keyof typeof DELIVERY_STATUS];
export type DeliveryActionType = (typeof DELIVERY_ACTIONS)[keyof typeof DELIVERY_ACTIONS];

// Status colors for UI (including ALL for filter UI)
export const DELIVERY_STATUS_COLORS: Record<DeliveryStatusType, string> = {
  [DELIVERY_STATUS.ALL]: 'gray',
  [DELIVERY_STATUS.PENDING]: 'blue',
  [DELIVERY_STATUS.IN_TRANSIT]: 'orange',
  [DELIVERY_STATUS.COMPLETED]: 'green',
};

// Status labels for display
export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  [DELIVERY_STATUS.PENDING]: 'delivery.statuses.pending',
  [DELIVERY_STATUS.IN_TRANSIT]: 'delivery.statuses.inTransit',
  [DELIVERY_STATUS.COMPLETED]: 'delivery.statuses.completed',
};

// Action labels for buttons
export const DELIVERY_ACTION_LABELS: Record<DeliveryActionType, string> = {
  [DELIVERY_ACTIONS.START_TRANSIT]: 'delivery.actions.startTransit',
  [DELIVERY_ACTIONS.COMPLETE]: 'delivery.actions.complete',
  [DELIVERY_ACTIONS.TAKE_PHOTO]: 'common.photos.takePhoto',
  [DELIVERY_ACTIONS.DELETE]: 'delivery.actions.cancel',
};

// PIC Type constants
export const PIC_TYPE = {
  EMPLOYEE: 'EMPLOYEE',
  USER: 'USER',
} as const;

export type PICTypeEnum = (typeof PIC_TYPE)[keyof typeof PIC_TYPE];
