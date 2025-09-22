import type { Permission } from '@/services/auth/auth';

export function canViewEmployee(permissions: Permission) {
  return Boolean(permissions.employee.canView);
}

export function canCreateEmployee(permissions: Permission) {
  return Boolean(permissions.employee.canCreate);
}

export function canEditEmployee(permissions: Permission) {
  return Boolean(permissions.employee.canEdit);
}

export function canSetPasswordForEmployee(permissions: Permission) {
  return Boolean(permissions.employee.actions?.canSetPassword);
}

export function canIssueMagicLinkForEmployee(permissions: Permission) {
  return Boolean(permissions.employee.actions?.canIssueMagicLink);
}

export function canViewProduct(permissions: Permission) {
  return Boolean(permissions.product.canView);
}

export function canCreateProduct(permissions: Permission) {
  return Boolean(permissions.product.canCreate);
}

export function canEditProduct(permissions: Permission) {
  return Boolean(permissions.product.canEdit);
}

export function canViewCustomer(permissions: Permission) {
  return Boolean(permissions.customer.canView);
}

export function canCreateCustomer(permissions: Permission) {
  return Boolean(permissions.customer.canCreate);
}

export function canEditCustomer(permissions: Permission) {
  return Boolean(permissions.customer.canEdit);
}

export function canDeleteCustomer(permissions: Permission) {
  return Boolean(permissions.customer.canDelete);
}

export function canViewPurchaseOrder(permissions: Permission) {
  return Boolean(permissions.purchaseOrder.canView);
}

export function canViewAllPurchaseOrder(permissions: Permission) {
  return Boolean(permissions.purchaseOrder.query.canViewAll);
}

export function canFilterPurchaseOrder(permissions: Permission) {
  return Boolean(permissions.purchaseOrder.query.canFilter);
}

export function canCreatePurchaseOrder(permissions: Permission) {
  return Boolean(permissions.purchaseOrder.canCreate);
}

export function canEditPurchaseOrder(permissions: Permission) {
  return Boolean(permissions.purchaseOrder.canEdit);
}

export function canTakePhotoPurchaseOrder(permissions: Permission) {
  return Boolean(permissions.purchaseOrder.actions?.canTakePhoto);
}

export function canDeletePhotoPurchaseOrder(permissions: Permission) {
  return Boolean(permissions.purchaseOrder.actions?.canDeletePhoto);
}

export function canCopyPurchaseOrder(permissions: Permission) {
  return Boolean(permissions.purchaseOrder.canCreate);
}

export function canConfirmPurchaseOrder(permissions: Permission) {
  return Boolean(permissions.purchaseOrder.actions?.canConfirm);
}

export function canProcessPurchaseOrder(permissions: Permission) {
  return Boolean(permissions.purchaseOrder.actions?.canProcess);
}

export function canShipPurchaseOrder(permissions: Permission) {
  return Boolean(permissions.purchaseOrder.actions?.canShip);
}

export function canMarkReadyPurchaseOrder(permissions: Permission) {
  return Boolean(permissions.purchaseOrder.actions?.canMarkReady);
}

export function canDeliverPurchaseOrder(permissions: Permission) {
  return Boolean(permissions.purchaseOrder.actions?.canDeliver);
}

export function canCancelPurchaseOrder(permissions: Permission) {
  return Boolean(permissions.purchaseOrder.actions?.canCancel);
}

export function canRefundPurchaseOrder(permissions: Permission) {
  return Boolean(permissions.purchaseOrder.actions?.canRefund);
}

export function canViewDeliveryRequest(permissions: Permission) {
  return Boolean(permissions.deliveryRequest.canView);
}

export function canViewAllDeliveryRequest(permissions: Permission) {
  return Boolean(permissions.deliveryRequest.query?.canViewAll);
}

export function canFilterDeliveryRequest(permissions: Permission) {
  return Boolean(permissions.deliveryRequest.query?.canFilter);
}

export function canCreateDeliveryRequest(permissions: Permission) {
  return Boolean(permissions.deliveryRequest.canCreate);
}

export function canEditDeliveryRequest(permissions: Permission) {
  return Boolean(permissions.deliveryRequest.canEdit);
}

export function canStartTransitDeliveryRequest(permissions: Permission) {
  return Boolean(permissions.deliveryRequest.actions?.canStartTransit);
}

export function canCompleteDeliveryRequest(permissions: Permission) {
  return Boolean(permissions.deliveryRequest.actions?.canComplete);
}

export function canTakePhotoDeliveryRequest(permissions: Permission) {
  return Boolean(permissions.deliveryRequest.actions?.canTakePhoto);
}

export function canUpdateDeliveryOrderInDay(permissions: Permission) {
  return Boolean(permissions.deliveryRequest.actions?.canUpdateDeliveryOrderInDay);
}

export function canDeletePhotoDeliveryRequest(permissions: Permission) {
  return Boolean(permissions.deliveryRequest.actions?.canDeletePhoto);
}
